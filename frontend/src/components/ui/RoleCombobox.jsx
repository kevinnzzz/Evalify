import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Briefcase } from 'lucide-react';

export default function RoleCombobox({ roles = [], value = '', onChange, placeholder = 'Pilih atau ketik role...', error = '', variant = 'default', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── STEP 1: Normalize & validate — buang semua item yang name-nya tidak valid
  // Ini safety net utama supaya useMemo di bawah tidak crash
  const validRoles = useMemo(() => {
    if (!Array.isArray(roles)) return [];
    return roles
      .filter((r) => r !== null && r !== undefined && typeof r === 'object' && typeof r.name === 'string' && r.name.trim().length > 0)
      .map((r) => ({
        id: r.id != null ? String(r.id) : `_${Math.random().toString(36).slice(2)}`,
        name: r.name.trim(),
        category: typeof r.category === 'string' && r.category.trim().length > 0 ? r.category.trim() : 'Lainnya',
      }));
  }, [roles]);

  // ── STEP 2: Filter by search — aman karena validRoles sudah bersih
  const filtered = useMemo(() => {
    const q = typeof search === 'string' ? search.toLowerCase().trim() : '';
    if (!q) return validRoles;
    return validRoles.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [validRoles, search]);

  // ── STEP 3: Group by category + hitung startIdx untuk tiap group
  // startIdx dipakai supaya tidak perlu mutable flatIdx di JSX (ini root cause crash sebelumnya)
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category).push(r);
    });
    let cursor = 0;
    const result = [];
    map.forEach((items, category) => {
      result.push({ category, items, startIdx: cursor });
      cursor += items.length;
    });
    return result;
  }, [filtered]);

  // Flat list nama untuk keyboard navigation
  const flatList = useMemo(() => filtered.map((r) => r.name), [filtered]);

  // Reset highlight setiap kali hasil filter berubah (saat user mengetik)
  useEffect(() => {
    setHighlightIdx(-1);
  }, [filtered]);

  // Scroll item yang di-highlight ke dalam view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-role-item]');
      items[highlightIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelect = (roleName) => {
    if (!roleName || typeof roleName !== 'string') return;
    onChange(roleName.trim());
    setSearch('');
    setOpen(false);
    setHighlightIdx(-1);
  };

  const handleInputChange = (e) => {
    const val = e?.target?.value ?? '';
    setSearch(String(val));
    if (!open) setOpen(true);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlightIdx((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && flatList[highlightIdx]) {
        handleSelect(flatList[highlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
      setHighlightIdx(-1);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setHighlightIdx(-1);
    inputRef.current?.focus();
  };

  // ── Derived display state ─────────────────────────────────────────────────
  const isGlass = variant === 'glass';

  // Saat dropdown OPEN → tampilkan apa yang user ketik (search)
  // Saat dropdown CLOSED → tampilkan value yang sudah dipilih
  const displayValue = open ? search : (value ?? '');

  const isValidRole = typeof value === 'string' && value.length > 0 && validRoles.some((r) => r.name.toLowerCase() === value.toLowerCase());

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className='relative w-full'>
      {/* Input */}
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all cursor-text ${
          isGlass
            ? `bg-white/15 border ${error ? 'border-red-300/60' : open ? 'border-white/60 ring-2 ring-white/20' : 'border-white/30 hover:border-white/50'} backdrop-blur-sm`
            : `bg-white dark:bg-gray-800 border ${
                error
                  ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30'
                  : open
                    ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } shadow-sm`
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <Search size={15} className={isGlass ? 'text-white/50 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />

        <input
          ref={inputRef}
          type='text'
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 bg-transparent outline-none text-sm ${isGlass ? 'text-white placeholder-white/50' : 'text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500'}`}
        />

        {value && !disabled && (
          <button onClick={handleClear} type='button' aria-label='Clear' className={`flex-shrink-0 transition-colors ${isGlass ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
            <X size={14} />
          </button>
        )}

        <ChevronDown size={15} className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isGlass ? 'text-white/50' : 'text-gray-400'}`} />
      </div>

      {/* Validation badge — tampil hanya saat dropdown tutup dan ada value */}
      {value && !open && (
        <div className='mt-1.5 flex items-center gap-1.5'>
          {isValidRole ? (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isGlass ? 'bg-green-400/20 text-green-200' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
              <Briefcase size={10} />
              Role valid
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isGlass ? 'bg-red-400/20 text-red-200' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
              Role tidak ditemukan — pilih dari daftar
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-xl border shadow-xl ${isGlass ? 'bg-gray-900/95 border-white/20 backdrop-blur-xl' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
          style={{ scrollbarWidth: 'thin' }}
          role='listbox'
        >
          <div ref={listRef} className='py-1'>
            {filtered.length === 0 ? (
              <div className={`px-4 py-6 text-center text-sm ${isGlass ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'}`}>
                <p className='font-medium mb-1'>Tidak ada role yang cocok</p>
                <p className='text-xs'>Coba kata kunci lain</p>
              </div>
            ) : (
              grouped.map(({ category, items, startIdx }) => (
                <div key={category}>
                  {/* Category header */}
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sticky top-0 ${isGlass ? 'text-blue-300/70 bg-gray-900/95' : 'text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'}`}>{category}</div>

                  {items.map((role, itemIdx) => {
                    // Hitung idx dari startIdx — tidak perlu mutable var di luar loop
                    const idx = startIdx + itemIdx;
                    const isHighlighted = idx === highlightIdx;
                    const isSelected = typeof value === 'string' && value.toLowerCase() === role.name.toLowerCase();

                    return (
                      <button
                        key={role.id}
                        data-role-item
                        type='button'
                        onClick={() => handleSelect(role.name)}
                        role='option'
                        aria-selected={isSelected}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                          isGlass
                            ? isSelected
                              ? 'bg-blue-500/30 text-white'
                              : isHighlighted
                                ? 'bg-white/10 text-white'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            : isSelected
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : isHighlighted
                                ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Briefcase size={12} className={`flex-shrink-0 ${isGlass ? (isSelected ? 'text-blue-300' : 'text-white/30') : isSelected ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span className='flex-1'>{role.name}</span>
                        {isSelected && <span className={`text-xs ${isGlass ? 'text-blue-300' : 'text-blue-500'}`}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className={`text-xs mt-1 ${isGlass ? 'text-red-200' : 'text-red-500'}`}>{error}</p>}
    </div>
  );
}
