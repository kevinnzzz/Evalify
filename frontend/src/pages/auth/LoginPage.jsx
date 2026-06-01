import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validate } from '../../utils/helpers';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {
      identifier: validate.required(form.identifier, 'Email atau Username'),
      password: validate.required(form.password, 'Password'),
    };
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // Kirim sebagai 'email' — backend akan cek apakah itu email atau username
      const loginPayload = {
        email: form.identifier,
        password: form.password,
      };

      await login(loginPayload);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login gagal', 'error');
      setErrors({ password: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
      <div className="grid md:grid-cols-2 min-h-[480px]">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <Link to="/" className="flex items-center gap-2.5 mb-8 hover:opacity-90 transition-opacity w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <span className="font-display text-3xl font-extrabold">Evalify</span>
          </Link>
          <h2 className="text-2xl font-bold mb-4 leading-snug">
            Kesulitan dengan kesiapan anda menghadapi dunia kerja?
          </h2>
          <p className="text-blue-200 text-sm mb-6">
            Tenang aja ada <strong className="text-white">Evalify</strong>
          </p>
          <ul className="space-y-2 text-sm text-blue-100">
            {['membantu pengecekan resume', 'memberikan feedback', 'membantu latihan interview', 'tersedia job matching'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                  {item}
                </li>
              ),
            )}
          </ul>
          <p className="text-xs text-blue-300 mt-8 leading-relaxed">
            By signing up, you agree to the Terms of Service and acknowledge you&apos;ve read our Privacy Policy.
          </p>
        </div>

        {/* Right panel – form */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <Link to="/" className="flex items-center gap-2 mb-2 md:hidden hover:opacity-90 transition-opacity w-fit">
            <BrainCircuit size={22} className="text-blue-600" />
            <span className="font-display text-2xl font-extrabold text-blue-600">Evalify</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Sign In To Your Account</h1>
          <p className="text-sm text-gray-400 mb-8">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="identifier"
              placeholder="Email atau Username"
              icon={User}
              value={form.identifier}
              onChange={handleChange}
              error={errors.identifier}
              autoComplete="username"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
