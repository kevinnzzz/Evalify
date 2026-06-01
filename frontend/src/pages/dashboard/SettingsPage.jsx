import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, User, Mail, Lock } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { validate, sleep, fmt } from '../../utils/helpers'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const { dark } = useTheme()
  const fileRef = useRef()

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
  })
  const [profileErrors, setProfileErrors] = useState({})

  const [password, setPassword] = useState({ current: '', newPw: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})


  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar || null)

  const handleProfileChange = (e) => {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }))
    setProfileErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const errs = {
      fullName: validate.required(profile.fullName, 'Full name'),
      username: validate.required(profile.username, 'Username'),
      email: validate.email(profile.email),
    }
    if (Object.values(errs).some(Boolean)) { setProfileErrors(errs); return }
    setSavingProfile(true)
    await sleep(700)
    updateUser({ ...profile, avatar })
    setSavingProfile(false)
    addToast('Profile updated successfully!', 'success')
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    const errs = {
      current: validate.required(password.current, 'Current password'),
      newPw: validate.minLength(password.newPw, 6, 'New password'),
      confirm: validate.passwordMatch(password.newPw, password.confirm),
    }
    if (Object.values(errs).some(Boolean)) { setPwErrors(errs); return }
    setSavingPw(true)
    await sleep(700)
    setSavingPw(false)
    setPassword({ current: '', newPw: '', confirm: '' })
    addToast('Password changed successfully!', 'success')
  }

  const handleAvatarChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(f)
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5 uppercase tracking-wide">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                fmt.initials(profile.fullName || 'U')
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{profile.fullName}</p>
            <p className="text-xs text-gray-400">@{profile.username}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input name="fullName" label="Full Name" icon={User} value={profile.fullName} onChange={handleProfileChange} error={profileErrors.fullName} />
          <Input name="username" label="Username" icon={User} value={profile.username} onChange={handleProfileChange} error={profileErrors.username} />
          <Input name="email" type="email" label="Email" icon={Mail} value={profile.email} onChange={handleProfileChange} error={profileErrors.email} />
          <Button type="submit" loading={savingProfile}>Save Changes</Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5 uppercase tracking-wide">
          Change Password
        </h2>
        <form onSubmit={handleSavePassword} className="space-y-4">
          <Input name="current" type="password" label="Current Password" icon={Lock}
            value={password.current} onChange={(e) => { setPassword((p) => ({ ...p, current: e.target.value })); setPwErrors((er) => ({ ...er, current: '' })) }}
            error={pwErrors.current} />
          <Input name="newPw" type="password" label="New Password" icon={Lock}
            value={password.newPw} onChange={(e) => { setPassword((p) => ({ ...p, newPw: e.target.value })); setPwErrors((er) => ({ ...er, newPw: '' })) }}
            error={pwErrors.newPw} />
          <Input name="confirm" type="password" label="Confirm New Password" icon={Lock}
            value={password.confirm} onChange={(e) => { setPassword((p) => ({ ...p, confirm: e.target.value })); setPwErrors((er) => ({ ...er, confirm: '' })) }}
            error={pwErrors.confirm} />
          <Button type="submit" loading={savingPw}>Update Password</Button>
        </form>
      </Card>

      {/* Theme */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">Theme</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {dark ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Toggle between light and dark theme</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

    </motion.div>
  )
}
