import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../common/FormField';
import { Alert } from '../common/Alert';
import { User, Mail, Lock, Phone, BookOpen, Hash, CheckCircle, ShieldCheck } from 'lucide-react';

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science and Engineering',
    year: '1',
    semester: '1',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate password strength score (0 to 4)
  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, text: 'None', color: 'bg-slate-200' };
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score, text: 'Medium', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Validate single field
  const validateField = (name, value, allValues = formData) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Full name is required.';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address.';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required.';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters.';
        } else if (!/\d/.test(value)) {
          error = 'Password must include at least one number.';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password.';
        } else if (value !== allValues.password) {
          error = 'Passwords do not match.';
        }
        break;
      case 'phone':
        if (value.trim() && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.trim())) {
          error = 'Please enter a valid phone number (10-14 digits).';
        }
        break;
      case 'studentId':
        if (value.trim() && value.trim().length < 3) {
          error = 'Student ID must be at least 3 characters.';
        }
        break;
      case 'agreeTerms':
        if (!value) {
          error = 'You must accept the academic integrity policy.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);

    if (touched[name]) {
      const err = validateField(name, val, updated);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }

    // Also revalidate confirm password if password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', formData.confirmPassword, updated);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, val, formData);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key], formData);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      studentId: true,
      department: true,
      year: true,
      semester: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        studentId: formData.studentId.trim() || undefined,
        department: formData.department,
        year: Number(formData.year),
        semester: Number(formData.semester),
        phone: formData.phone.trim(),
      });
      onClose();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      setServerError(err.message || 'Registration failed. Please check the inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white p-7 text-left shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Portal Registration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create your verified academic profile to enroll in courses and access student services.
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Jordan Miller"
                error={touched.name ? errors.name : ''}
                required
              />

              <FormField
                label="Institutional Email"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="student@university.edu"
                error={touched.email ? errors.email : ''}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                label="Student Roll / ID"
                name="studentId"
                icon={Hash}
                value={formData.studentId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="STU-2026-XXXX (Optional)"
                helperText="Leave empty to auto-assign"
                error={touched.studentId ? errors.studentId : ''}
              />

              <FormField
                label="Academic Year"
                name="year"
                as="select"
                value={formData.year}
                onChange={handleChange}
                options={[
                  { value: '1', label: '1st Year (Freshman)' },
                  { value: '2', label: '2nd Year (Sophomore)' },
                  { value: '3', label: '3rd Year (Junior)' },
                  { value: '4', label: '4th Year (Senior)' },
                ]}
              />

              <FormField
                label="Semester"
                name="semester"
                as="select"
                value={formData.semester}
                onChange={handleChange}
                options={[
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                  { value: '3', label: 'Semester 3' },
                  { value: '4', label: 'Semester 4' },
                  { value: '5', label: 'Semester 5' },
                  { value: '6', label: 'Semester 6' },
                  { value: '7', label: 'Semester 7' },
                  { value: '8', label: 'Semester 8' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Department / Major"
                name="department"
                as="select"
                icon={BookOpen}
                value={formData.department}
                onChange={handleChange}
                options={[
                  { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
                  { value: 'Information Technology', label: 'Information Technology' },
                  { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
                  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                  { value: 'Biotechnology', label: 'Biotechnology' },
                  { value: 'Business Administration', label: 'Business Administration' },
                ]}
                required
              />

              <FormField
                label="Contact Phone Number"
                name="phone"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+1 (555) 000-0000"
                error={touched.phone ? errors.phone : ''}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="At least 6 characters & 1 number"
                  error={touched.password ? errors.password : ''}
                  required
                />
                {/* Live Password Strength Indicator */}
                {formData.password && (
                  <div className="-mt-2 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className="font-semibold text-slate-700">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={ShieldCheck}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repeat your password"
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                required
              />
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I certify that all information submitted is accurate and I agree to uphold the
                  <span className="font-semibold text-blue-600 ml-1">University Honor & Academic Integrity Code</span>.
                </span>
              </label>
              {touched.agreeTerms && errors.agreeTerms && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.agreeTerms}</p>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Already have an account? Sign In
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating & Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
