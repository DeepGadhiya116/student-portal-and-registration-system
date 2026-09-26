import React, { useState } from 'react';
import { api } from '../../services/api';
import { FormField } from '../common/FormField';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value, all = formData) => {
    let error = '';
    if (name === 'currentPassword' && !value) {
      error = 'Current password is required.';
    }
    if (name === 'newPassword') {
      if (!value) {
        error = 'New password is required.';
      } else if (value.length < 6) {
        error = 'New password must be at least 6 characters.';
      } else if (!/\d/.test(value)) {
        error = 'New password must contain at least one number.';
      }
    }
    if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your new password.';
      } else if (value !== all.newPassword) {
        error = 'Passwords do not match.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const err = validateField(name, value, updated);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    const currErr = validateField('currentPassword', formData.currentPassword);
    const newErr = validateField('newPassword', formData.newPassword);
    const confErr = validateField('confirmPassword', formData.confirmPassword);

    if (currErr || newErr || confErr) {
      setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
      setErrors({ currentPassword: currErr, newPassword: newErr, confirmPassword: confErr });
      return;
    }

    setIsSubmitting(true);
    try {
      // Primary API Method: PUT
      const response = await api.put('/students/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccessMsg(response.message || 'Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTouched({});
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      if (err.errors) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      setServerError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Security: Change Account Password">
      {serverError && (
        <div className="mb-4">
          <Alert type="error" message={serverError} />
        </div>
      )}

      {successMsg && (
        <div className="mb-4">
          <Alert type="success" message={successMsg} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Current Password"
          name="currentPassword"
          type="password"
          icon={KeyRound}
          value={formData.currentPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.currentPassword ? errors.currentPassword : ''}
          required
        />

        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          icon={Lock}
          value={formData.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          helperText="Min 6 characters, including numbers"
          error={touched.newPassword ? errors.newPassword : ''}
          required
        />

        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          icon={ShieldCheck}
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
          required
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
            {isSubmitting ? 'Updating...' : 'Update Password (PUT)'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
