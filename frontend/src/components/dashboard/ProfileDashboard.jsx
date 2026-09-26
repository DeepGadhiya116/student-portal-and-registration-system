import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Alert } from '../common/Alert';
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  Edit3,
  Lock,
  Trash2,
  PlusCircle,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ProfileDashboard = ({ onNavigateToCourses }) => {
  const { user, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [droppingCourseId, setDroppingCourseId] = useState(null);

  // Fetch detailed profile data via GET /api/students/profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      // Primary API Method: GET
      const data = await api.get('/students/profile');
      setProfileData(data.profile);
      updateUserProfile(data.profile);
    } catch (err) {
      setError(err.message || 'Failed to fetch student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setProfileData(updatedUser);
    updateUserProfile(updatedUser);
    setActionMessage({ type: 'success', text: 'Profile updated successfully via PUT API!' });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDropCourse = async (courseId, courseCode) => {
    if (!window.confirm(`Are you sure you want to drop course ${courseCode}?`)) {
      return;
    }

    try {
      setDroppingCourseId(courseId);
      // Primary API Method: POST
      const res = await api.post('/courses/drop', { courseId });
      setActionMessage({ type: 'success', text: res.message || `Course ${courseCode} dropped successfully.` });
      setProfileData(res.user);
      updateUserProfile(res.user);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to drop course.' });
    } finally {
      setDroppingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading Academic Profile Dashboard...</p>
      </div>
    );
  }

  const currentUser = profileData || user;
  const enrolledCourses = currentUser?.enrolledCourses || [];
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const maxCredits = 21;
  const creditPercent = Math.min(100, Math.round((totalCredits / maxCredits) * 100));

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {actionMessage && (
        <Alert
          type={actionMessage.type}
          message={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {error && <Alert type="error" message={error} />}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser?.name || 'Alex')}`}
                alt={currentUser?.name}
                className="h-24 w-24 rounded-2xl bg-blue-50 border-2 border-blue-100 shadow-sm object-cover"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white">
                {currentUser?.status || 'Active'}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{currentUser?.name}</h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Student
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full">
                  {currentUser?.studentId || 'STU-2026-UNASSIGNED'}
                </span>
              </div>
              <p className="text-slate-600 text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>{currentUser?.department}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Member of University Academic Registry since {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile (PUT)
            </button>
            <button
              onClick={() => setIsPasswordOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* Academic Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="h-4 w-4 text-amber-500" />
              Cumulative GPA
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {currentUser?.cgpa ? currentUser.cgpa.toFixed(2) : '3.80'}
              <span className="text-xs text-slate-400 font-normal"> / 4.00</span>
            </div>
            <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Good Standing
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Registered Credits
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalCredits} <span className="text-xs text-slate-400 font-normal">/ {maxCredits} Max</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="h-4 w-4 text-purple-500" />
              Academic Level
            </div>
            <div className="text-xl font-bold text-slate-900">
              Year {currentUser?.year || 1}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Semester {currentUser?.semester || 1}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              Enrolled Courses
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {enrolledCourses.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Active this term</div>
          </div>
        </div>
      </div>

      {/* Profile Details & Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Student Profile Information
            </h2>
            <span className="text-xs font-semibold text-slate-400 uppercase">Verified Record</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Institutional Email
              </span>
              <span className="font-medium text-slate-900 break-all">{currentUser?.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Primary Phone
              </span>
              <span className="font-medium text-slate-900">
                {currentUser?.phone || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Campus / Residence Address
              </span>
              <span className="font-medium text-slate-900">
                {currentUser?.address || <span className="text-slate-400 italic">No campus address listed</span>}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Emergency Contact
              </span>
              <span className="font-medium text-slate-900">
                {currentUser?.emergencyContact || <span className="text-slate-400 italic">None on file</span>}
              </span>
            </div>
          </div>

          {/* Student Bio */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Academic Statement & Bio
            </span>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              "{currentUser?.bio || 'No bio provided. Click Edit Profile to add your academic specialization and interests.'}"
            </p>
          </div>
        </div>

        {/* Quick Academic Progress Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Degree Progress</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono">B.Sc. Program</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Registration Status: Active</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              You are currently enrolled in {enrolledCourses.length} courses this academic semester ({totalCredits} total credits). Remember that semester withdrawal or changes require advisor signoff before the deadline.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-blue-200">Current Semester Credit Load</span>
                <span className="font-bold">{totalCredits} / {maxCredits} hrs</span>
              </div>
              <div className="h-2 bg-blue-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              onClick={onNavigateToCourses}
              className="w-full py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4 text-blue-700" />
              Add More Courses
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Enrolled Courses ({enrolledCourses.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your enrolled courses, schedules, instructors, and credit allocations.
            </p>
          </div>

          <button
            onClick={onNavigateToCourses}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Register New Course
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No courses registered yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              You haven't enrolled in any courses for the current semester. Browse the catalog to select your classes.
            </p>
            <button
              onClick={onNavigateToCourses}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{course.courseCode}</div>
                      <div className="text-xs text-slate-500">{course.title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {course.instructor}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{course.schedule || 'TBA'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {course.credits} cr
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDropCourse(course._id, course.courseCode)}
                        disabled={droppingCourseId === course._id}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        title="Drop this course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {droppingCourseId === course._id ? 'Dropping...' : 'Drop Course'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={currentUser}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <ChangePasswordModal
          isOpen={isPasswordOpen}
          onClose={() => setIsPasswordOpen(false)}
        />
      )}
    </div>
  );
};
