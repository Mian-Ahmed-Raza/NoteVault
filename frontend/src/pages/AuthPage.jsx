import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, User, Mail, Lock, Hash, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, error, rightElement }) => (
  <div className="space-y-1">
    <div className={`
      relative flex items-center bg-white/5 border rounded-xl overflow-hidden
      transition-all duration-200 group
      ${error ? 'border-red-500/50' : 'border-white/10 focus-within:border-primary-500/60 focus-within:bg-white/8'}
    `}>
      <div className="pl-4 pr-2 flex-shrink-0">
        <Icon className="w-4 h-4 text-white/30 group-focus-within:text-primary-400 transition-colors" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent py-3 pr-3 text-sm text-white placeholder-white/30 
                   focus:outline-none"
      />
      {rightElement && (
        <div className="pr-3 flex-shrink-0">{rightElement}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
  </div>
);

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', rollNumber: '', email: '', password: ''
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!isLogin && !form.name.trim()) newErrors.name = 'Name is required';
    if (!isLogin && form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!isLogin && !form.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';

    if (!form.password) newErrors.password = 'Password is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login(form.email, form.password);
        toast.success(result.message || 'Welcome back!');
      } else {
        result = await register(form.name, form.rollNumber, form.email, form.password);
        toast.success(result.message || 'Account created! Welcome to NoteVault!');
      }
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong';
      toast.error(message);

      // Field-specific errors
      if (message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setForm({ name: '', rollNumber: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── Left Panel (Branding) ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-950" />

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 
                          flex items-center justify-center mb-6 shadow-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Note</span>
            <span className="text-white">Vault</span>
          </h1>
          <p className="text-white/60 text-lg mb-12 max-w-md">
            The ultimate platform for students to share, discover, and learn from each other's notes.
          </p>

          {/* Feature Cards */}
          <div className="space-y-3 w-full max-w-xs">
            {[
              { emoji: '📚', title: 'Share Knowledge', desc: 'Upload and share your notes with peers' },
              { emoji: '🔍', title: 'Discover Notes', desc: 'Search thousands of academic notes' },
              { emoji: '⬇️', title: 'Easy Downloads', desc: 'Download notes instantly' },
              { emoji: '📊', title: 'Track Analytics', desc: 'Monitor downloads and engagement' },
            ].map(({ emoji, title, desc }) => (
              <div key={title}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                <span className="text-xl">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel (Form) ───────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/5 blur-3xl lg:hidden" />

        <div className="relative w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                            flex items-center justify-center shadow-glow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="gradient-text">Note</span>
              <span className="text-white">Vault</span>
            </span>
          </div>

          {/* Card */}
          <div className="glass-card border border-white/10 p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-white/50 text-sm">
                {isLogin
                  ? 'Sign in to access your notes'
                  : 'Join thousands of students sharing knowledge'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register Fields */}
              {!isLogin && (
                <>
                  <InputField
                    icon={User}
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                  />
                  <InputField
                    icon={Hash}
                    type="text"
                    placeholder="Roll Number (e.g. CS2024001)"
                    value={form.rollNumber}
                    onChange={handleChange('rollNumber')}
                    error={errors.rollNumber}
                  />
                </>
              )}

              <InputField
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
              />

              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                }
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-400 hover:text-primary-300 font-semibold 
                             transition-colors duration-200 hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/20 text-xs mt-6">
            By continuing, you agree to NoteVault's Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;