import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../common/FormField';
import { Alert } from '../common/Alert';
import { Mail, Lock, LogIn, Sparkles, UserCheck, Shield } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address.';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setServerError('');

    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr || passErr) {
      setTouched({ email: true, password: true });
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email.trim(), formData.password);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
      if (err.errors) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo helper
  const handleQuickLogin = (email, pwd) => {
    setFormData({ email, password: pwd });
    setErrors({});
    setTouched({ email: true, password: true });
    setServerError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-7 text-left shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Portal Login</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in to your academic dashboard or admin console.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors"
            >
              ✕
            </button>
          </div>

          {serverError && (
            <div className="mt-4">
              <Alert type="error" message={serverError} />
            </div>
          )}

          {/* Quick Demo Credentials helper */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Test Accounts (Click to Autofill):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex.rivers@university.edu', 'Password123')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-semibold text-[11px] text-slate-900">Student</div>
                  <div className="text-[10px] text-slate-500 truncate">alex.rivers@...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@university.edu', 'Password123')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-semibold text-[11px] text-slate-900">Dean / Admin</div>
                  <div className="text-[10px] text-slate-500 truncate">admin@university...</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. alex.rivers@university.edu"
              error={touched.email ? errors.email : ''}
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your account password"
              error={touched.password ? errors.password : ''}
              required
            />

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Need to register as a student? </span>
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create an account
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
