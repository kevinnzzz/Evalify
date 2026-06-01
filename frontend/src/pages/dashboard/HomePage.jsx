import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Mic2, Star, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const stagger = {
  container: { transition: { staggerChildren: 0.08 } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
};

const statConfig = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600', ring: 'bg-blue-600' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600', ring: 'bg-green-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600', ring: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600', ring: 'bg-orange-500' },
};

const statIcons = [FileText, Mic2, Star, TrendingUp];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];

function StatCardSkeleton() {
  return (
    <Card className='p-5'>
      <Skeleton className='h-9 w-9 rounded-xl mb-3' />
      <Skeleton className='h-8 w-16 mb-1' />
      <Skeleton className='h-3 w-24' />
    </Card>
  );
}

function ActivityIcon({ type }) {
  if (type === 'cv_review') return <FileText size={16} className='text-blue-600' />;
  if (type === 'interview_completed') return <Mic2 size={16} className='text-purple-600' />;
  return <Star size={16} className='text-gray-400' />;
}

export default function HomePage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[HomePage] Fetching dashboard data...');
      const res = await userService.getDashboardData();
      console.log('[HomePage] Dashboard data fetched:', res.data);
      setDashData(res.data);
    } catch (err) {
      console.error('[HomePage] Dashboard fetch error:', {
        message: err.message,
        status: err.response?.status,
        error: err.response?.data,
      });
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Derive pie data from stats
  const cvCount = dashData?.stats?.find((s) => s.label === 'CV Reviews')?.value || 0;
  const ivCount = dashData?.stats?.find((s) => s.label === 'Interviews Done')?.value || 0;
  const pieData = [
    { name: 'CV Reviews', value: cvCount || 0 },
    { name: 'Interviews', value: ivCount || 0 },
  ].filter((d) => d.value > 0);
  const hasPieData = pieData.length > 0;

  const stats = dashData?.stats || [];
  const activities = dashData?.activities || [];

  return (
    <motion.div variants={stagger.container} initial='initial' animate='animate' className='space-y-6'>
      {/* Header */}
      <motion.div variants={stagger.item} className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Dashboard</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-0.5 text-sm'>
            {greeting}, <span className='font-semibold text-blue-600'>{user?.fullName?.split(' ')[0] || 'User'}</span>! Here&apos;s your overview.
          </p>
        </div>
        {!loading && (
          <button onClick={fetchDashboard} className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'>
            <RefreshCw size={13} />
            Refresh
          </button>
        )}
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div variants={stagger.item}>
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 flex items-center justify-between'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            <button onClick={fetchDashboard} className='text-xs text-red-600 dark:text-red-400 font-semibold hover:underline'>
              Coba lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div variants={stagger.item} className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, i) => {
              const cfg = statConfig[stat.color] || statConfig.blue;
              const Icon = statIcons[i] || Star;
              return (
                <Card key={stat.label} hover className='p-5'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon size={18} className={cfg.icon} />
                    </div>
                    {stat.value !== 0 && (
                      <span className='text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1'>
                        <ArrowUpRight size={10} />
                        Live
                      </span>
                    )}
                  </div>
                  <p className='text-2xl font-bold text-gray-800 dark:text-white'>{stat.value}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{stat.label}</p>
                </Card>
              );
            })}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={stagger.item} className='grid lg:grid-cols-3 gap-4'>
        {/* Recent Interviews area chart placeholder */}
        <Card className='p-5 lg:col-span-2'>
          <div className='flex items-center justify-between mb-5'>
            <div>
              <h3 className='font-semibold text-gray-800 dark:text-white text-sm'>Activity Overview</h3>
              <p className='text-xs text-gray-400 mt-0.5'>{loading ? 'Loading...' : `${cvCount} CV reviews · ${ivCount} interviews`}</p>
            </div>
            <span className='text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full font-semibold'>All time</span>
          </div>

          {loading ? (
            <Skeleton className='h-[200px] w-full rounded-xl' />
          ) : activities.length > 0 ? (
            <ResponsiveContainer width='100%' height={200}>
              <AreaChart
                data={activities
                  .slice(0, 7)
                  .reverse()
                  .map((a) => ({
                    name: a.time,
                    score: a.score || 0,
                  }))}
              >
                <defs>
                  <linearGradient id='scoreGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: 12,
                  }}
                />
                <Area type='monotone' dataKey='score' stroke='#3b82f6' strokeWidth={2} fill='url(#scoreGrad)' name='Score' />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-[200px] flex items-center justify-center'>
              <div className='text-center'>
                <p className='text-gray-300 dark:text-gray-600 text-sm mb-1'>Belum ada aktivitas</p>
                <p className='text-gray-300 dark:text-gray-600 text-xs'>Mulai dengan review CV atau mock interview</p>
              </div>
            </div>
          )}
        </Card>

        {/* Pie chart */}
        <Card className='p-5'>
          <h3 className='font-semibold text-gray-800 dark:text-white text-sm mb-1'>Activity Split</h3>
          <p className='text-xs text-gray-400 mb-4'>Rincian penggunaan</p>

          {loading ? (
            <Skeleton className='h-[160px] w-full rounded-xl' />
          ) : hasPieData ? (
            <>
              <div className='flex justify-center'>
                <PieChart width={160} height={160}>
                  <Pie data={pieData} innerRadius={45} outerRadius={72} paddingAngle={3} dataKey='value'>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className='mt-3 space-y-2'>
                {pieData.map((d, i) => (
                  <div key={d.name} className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-2'>
                      <span className='w-2.5 h-2.5 rounded-full' style={{ background: PIE_COLORS[i] }} />
                      <span className='text-gray-600 dark:text-gray-300'>{d.name}</span>
                    </div>
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='h-[160px] flex items-center justify-center'>
              <p className='text-gray-300 dark:text-gray-600 text-sm'>Belum ada data</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={stagger.item}>
        <Card className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-gray-800 dark:text-white text-sm'>Recent Activity</h3>
            <span className='text-xs text-blue-600 font-semibold'>{loading ? '' : `${activities.length} aktivitas`}</span>
          </div>

          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-16 w-full rounded-xl' />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-10 text-center'>
              <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3'>
                <Star size={24} className='text-gray-300 dark:text-gray-500' />
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>Belum ada aktivitas</p>
              <p className='text-xs text-gray-400 mt-0.5'>Mulai review CV atau lakukan mock interview</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {activities.map((act) => (
                <div key={act.id} className='flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${act.type === 'cv_review' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-purple-50 dark:bg-purple-900/30'}`}>
                    <ActivityIcon type={act.type} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-200 truncate'>{act.title}</p>
                    <p className='text-xs text-gray-400 truncate'>{act.desc}</p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    {act.score > 0 && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          act.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : act.score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {act.score}
                      </span>
                    )}
                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                      <Clock size={10} />
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
