import React, { useState } from 'react';
import { api } from '../../services/api';
import { FormField } from '../common/FormField';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { User, Phone, MapPin, HeartPulse, FileText, CheckCircle } from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    avatar: user?.avatar || '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar presets
  const avatarPresets = [
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'Alex')}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'Alex')}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || 'Alex')}`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Alex')}`,
  ];

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && (!value.trim() || value.trim().length < 2)) {
      error = 'Full name must be at least 2 characters.';
    }
    if (name === 'phone' && value.trim()) {
      if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.trim())) {
        error = 'Please enter a valid phone number (10-15 digits).';
      }
    }
    if (name === 'bio' && value.length > 500) {
      error = 'Bio cannot exceed 500 characters.';
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
    e.preventDefault();
    setServerError('');

    const nameErr = validateField('name', formData.name);
    const phoneErr = validateField('phone', formData.phone);
    const bioErr = validateField('bio', formData.bio);

    if (nameErr || phoneErr || bioErr) {
      setTouched({ name: true, phone: true, bio: true });
      setErrors({ name: nameErr, phone: phoneErr, bio: bioErr });
      return;
    }

    setIsSubmitting(true);
    try {
      // Primary API Method: PUT
      const response = await api.put('/students/profile', formData);
      onProfileUpdated(response.user);
      onClose();
    } catch (err) {
      if (err.errors) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      setServerError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Profile (PUT /api/students/profile)">
      {serverError && (
        <div className="mb-4">
          <Alert type="error" message={serverError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Select Profile Avatar</label>
          <div className="flex items-center gap-3">
            {avatarPresets.map((avUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, avatar: avUrl }))}
                className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all p-0.5 bg-slate-100 ${
                  formData.avatar === avUrl ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-100' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img src={avUrl} alt="Avatar option" className="h-full w-full object-cover rounded-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            name="name"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ''}
            required
          />

          <FormField
            label="Phone Number"
            name="phone"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+1 (555) 000-0000"
            error={touched.phone ? errors.phone : ''}
          />
        </div>

        <FormField
          label="Residential Address"
          name="address"
          icon={MapPin}
          value={formData.address}
          onChange={handleChange}
          placeholder="Hall, Dormitory, or Off-Campus Street Address"
        />

        <FormField
          label="Emergency Contact"
          name="emergencyContact"
          icon={HeartPulse}
          value={formData.emergencyContact}
          onChange={handleChange}
          placeholder="e.g. Parent / Guardian: Jane Doe - +1 (555) 999-9999"
          helperText="Important for university medical & campus safety"
        />

        <FormField
          label="Student Bio & Research Interests"
          name="bio"
          as="textarea"
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Share your academic interests, specialization, and student goals..."
          helperText={`${formData.bio?.length || 0}/500 chars`}
          error={touched.bio ? errors.bio : ''}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Changes (PUT)
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
