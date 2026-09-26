import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { BookOpen, Search, Filter, Check, Plus, Clock, Users, Building, AlertTriangle } from 'lucide-react';

export const CourseCatalog = () => {
  const { user, updateUserProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  const departments = [
    'All',
    'Computer Science and Engineering',
    'Information Technology',
    'Electrical & Electronics',
    'Mechanical Engineering',
  ];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Primary API Method: GET
      const queryParams = new URLSearchParams();
      if (selectedDept !== 'All') queryParams.append('department', selectedDept);
      if (searchTerm.trim()) queryParams.append('search', searchTerm.trim());

      const data = await api.get(`/courses?${queryParams.toString()}`);
      setCourses(data.courses || []);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to load course catalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleRegister = async (course) => {
    try {
      setEnrollingId(course._id);
      // Primary API Method: POST
      const res = await api.post('/courses/register', { courseId: course._id });
      setActionMessage({
        type: 'success',
        text: res.message || `Successfully registered for ${course.courseCode}!`,
      });
      if (res.user) {
        updateUserProfile(res.user);
      }
      fetchCourses();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Course registration failed.',
      });
    } finally {
      setEnrollingId(null);
    }
  };

  const enrolledCourseIds = (user?.enrolledCourses || []).map((c) =>
    typeof c === 'object' ? c._id : c
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Academic Course Registration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore available semester courses, verify seat capacity, and register with one click.
            </p>
          </div>

          {/* Search bar & Department filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search course code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-52 sm:w-64"
              />
            </form>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionMessage && (
        <Alert
          type={actionMessage.type}
          message={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Courses List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Fetching academic courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No courses match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting "All" departments or adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course._id);
            const enrolledCount = course.enrolledStudents ? course.enrolledStudents.length : 0;
            const isFull = enrolledCount >= course.capacity;

            return (
              <div
                key={course._id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 hover:shadow-md ${
                  isEnrolled ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {course.courseCode}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        {course.credits} Credits
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="h-3 w-3" /> Registered
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Class Full
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Semester {course.semester || 1}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {course.description || 'Comprehensive curriculum covering theoretical foundations and practical laboratory implementations.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{course.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>Instructor: <span className="font-medium text-slate-800">{course.instructor}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{course.schedule || 'Mon, Wed 10:00 AM - 11:30 AM'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Capacity Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Capacity:</span>
                      <span className="font-semibold text-slate-700">
                        {enrolledCount} / {course.capacity} seats filled
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((enrolledCount / course.capacity) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Register Button */}
                  {isEnrolled ? (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> Enrolled in Class
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(course)}
                      disabled={isFull || enrollingId === course._id}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {enrollingId === course._id ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Registering (POST)...
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Register for Course (POST)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
