import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, BrainCircuit } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { validate } from '../../utils/helpers'

export default function RegisterPage() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {
      fullName: validate.required(form.fullName, 'Full name'),
      username: validate.required(form.username, 'Username'),
      email: validate.email(form.email),
      password: validate.minLength(form.password, 6, 'Password'),
      confirmPassword: validate.passwordMatch(form.password, form.confirmPassword),
    }
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      // Transform field names to match backend API expectations (snake_case)
      const payload = {
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
      }
      await register(payload)
      addToast('Account created! Welcome to Evalify.', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error')
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
      <div className="grid md:grid-cols-2 min-h-[520px]">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <Link to="/" className="flex items-center gap-2.5 mb-8 hover:opacity-90 transition-opacity w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <span className="font-display text-3xl font-extrabold">Evalify</span>
          </Link>
          <h2 className="text-2xl font-bold mb-3 leading-snug">
            Start your AI career journey today
          </h2>
          <p className="text-blue-200 text-sm mb-6">
            Join thousands of job seekers who improved their career prospects with Evalify.
          </p>
          <ul className="space-y-2 text-sm text-blue-100">
            {[
              'AI-powered CV analysis',
              'Mock interview simulation',
              'Personalized career feedback',
              'Smart job matching',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel – form */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <Link to="/" className="flex items-center gap-2 mb-2 md:hidden hover:opacity-90 transition-opacity w-fit">
            <BrainCircuit size={22} className="text-blue-600" />
            <span className="font-display text-2xl font-extrabold text-blue-600">Evalify</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            Sign Up Your Account
          </h1>
          <p className="text-sm text-gray-400 mb-6">Create your free account in seconds.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="fullName"
                placeholder="Full Name"
                icon={User}
                value={form.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
              <Input
                name="username"
                placeholder="Username"
                icon={User}
                value={form.username}
                onChange={handleChange}
                error={errors.username}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                icon={Lock}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                icon={Lock}
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign Up
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>

          <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
            By signing up, you agree to the Terms of Service and acknowledge you've read our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
