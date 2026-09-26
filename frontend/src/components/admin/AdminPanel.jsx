import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FormField } from '../common/FormField';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import {
  Shield,
  Users,
  BookOpen,
  Megaphone,
  TrendingUp,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  Layers,
  Award,
  Pin
} from 'lucide-react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'courses' | 'announcements'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Students state
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);

  // Courses state
  const [courses, setCourses] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    courseCode: '',
    title: '',
    department: 'Computer Science and Engineering',
    credits: 3,
    instructor: '',
    capacity: 40,
    schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
    description: '',
    semester: 1,
  });
  const [courseErrors, setCourseErrors] = useState({});

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [annFormData, setAnnFormData] = useState({
    title: '',
    content: '',
    category: 'Academic',
    priority: 'Medium',
    pinned: false,
    targetDepartment: 'All',
  });
  const [annErrors, setAnnErrors] = useState({});

  // Fetch admin stats (GET)
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.stats);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  // Fetch students (GET)
  const fetchStudents = async () => {
    try {
      const query = new URLSearchParams();
      if (studentSearch) query.append('search', studentSearch);
      if (studentStatusFilter !== 'All') query.append('status', studentStatusFilter);
      if (studentDeptFilter !== 'All') query.append('department', studentDeptFilter);

      const res = await api.get(`/admin/students?${query.toString()}`);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Students error:', err);
    }
  };

  // Fetch courses (GET)
  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Courses error:', err);
    }
  };

  // Fetch announcements (GET)
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error('Announcements error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStudents(), fetchCourses(), fetchAnnouncements()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [studentStatusFilter, studentDeptFilter]);

  // Update student status (PUT)
  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      // Primary API Method: PUT
      const res = await api.put(`/admin/students/${studentId}/status`, { status: newStatus });
      setActionMessage({ type: 'success', text: res.message || 'Student status updated.' });
      fetchStudents();
      fetchStats();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update status.' });
    }
  };

  // Update student academic details modal submit (PUT)
  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    try {
      // Primary API Method: PUT
      const res = await api.put(`/admin/students/${selectedStudentForEdit._id}/status`, {
        department: selectedStudentForEdit.department,
        cgpa: selectedStudentForEdit.cgpa,
        semester: selectedStudentForEdit.semester,
        year: selectedStudentForEdit.year,
        status: selectedStudentForEdit.status,
      });
      setActionMessage({ type: 'success', text: `Saved changes for ${selectedStudentForEdit.name} (PUT)` });
      setSelectedStudentForEdit(null);
      fetchStudents();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update student.' });
    }
  };

  // Course Form Validation
  const validateCourseForm = () => {
    const errors = {};
    if (!courseFormData.courseCode.trim()) errors.courseCode = 'Course code is required (e.g. CS101).';
    if (!courseFormData.title.trim() || courseFormData.title.length < 3) errors.title = 'Title must be at least 3 chars.';
    if (!courseFormData.instructor.trim()) errors.instructor = 'Instructor name is required.';
    if (courseFormData.credits < 1 || courseFormData.credits > 6) errors.credits = 'Credits must be between 1 and 6.';
    if (courseFormData.capacity < 1) errors.capacity = 'Capacity must be at least 1.';
    setCourseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Course (POST or PUT)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!validateCourseForm()) return;

    try {
      if (editingCourse) {
        // Primary API Method: PUT
        const res = await api.put(`/admin/courses/${editingCourse._id}`, courseFormData);
        setActionMessage({ type: 'success', text: res.message || 'Course updated successfully (PUT)!' });
      } else {
        // Primary API Method: POST
        const res = await api.post('/admin/courses', courseFormData);
        setActionMessage({ type: 'success', text: res.message || 'Course created successfully (POST)!' });
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
      fetchStats();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      if (err.errors) {
        const backendErr = {};
        err.errors.forEach((e) => (backendErr[e.field] = e.message));
        setCourseErrors(backendErr);
      }
      setActionMessage({ type: 'error', text: err.message || 'Course action failed.' });
    }
  };

  // Delete Course (DELETE)
  const handleDeleteCourse = async (courseId, code) => {
    if (!window.confirm(`Are you sure you want to remove course ${code}? All enrolled students will be unrolled.`)) {
      return;
    }
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setActionMessage({ type: 'success', text: `Course ${code} deleted.` });
      fetchCourses();
      fetchStats();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Delete failed.' });
    }
  };

  // Open Edit Course
  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      courseCode: course.courseCode,
      title: course.title,
      department: course.department,
      credits: course.credits,
      instructor: course.instructor,
      capacity: course.capacity,
      schedule: course.schedule || '',
      description: course.description || '',
      semester: course.semester || 1,
    });
    setCourseErrors({});
    setIsCourseModalOpen(true);
  };

  // Announcement Form Validation
  const validateAnnForm = () => {
    const errs = {};
    if (!annFormData.title.trim() || annFormData.title.length < 3) errs.title = 'Title must be at least 3 characters.';
    if (!annFormData.content.trim() || annFormData.content.length < 5) errs.content = 'Content must be at least 5 characters.';
    setAnnErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Announcement (POST or PUT)
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!validateAnnForm()) return;

    try {
      if (editingAnnouncement) {
        // Primary API Method: PUT
        const res = await api.put(`/announcements/${editingAnnouncement._id}`, annFormData);
        setActionMessage({ type: 'success', text: res.message || 'Announcement updated (PUT)!' });
      } else {
        // Primary API Method: POST
        const res = await api.post('/announcements', annFormData);
        setActionMessage({ type: 'success', text: res.message || 'Announcement published (POST)!' });
      }
      setIsAnnModalOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
      fetchStats();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save announcement.' });
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.delete(`/announcements/${id}`);
      setActionMessage({ type: 'success', text: 'Announcement deleted.' });
      fetchAnnouncements();
      fetchStats();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <Alert
          type={actionMessage.type}
          message={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Admin Panel Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Academic Registrar & Admin Panel
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Admin Master Console
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage registered students, validate enrollments, configure course offerings, and broadcast notices.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Students Directory
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'courses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Course Catalog
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              Announcements
            </button>
          </div>
        </div>

        {/* Overview Stats Metrics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Registered Students
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalStudents}
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                {stats.activeStudents} Active Accounts
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Active Courses
              </span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {stats.totalCourses}
              </div>
              <span className="text-xs text-slate-500">Across all faculties</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Enrollments
              </span>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">
                {stats.totalEnrollments}
              </div>
              <span className="text-xs text-slate-500">Course seat allocations</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Published Notices
              </span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {stats.totalAnnouncements}
              </div>
              <span className="text-xs text-slate-500">Broadcast circulars</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Students Directory */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Student Registry ({students.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify student credentials, regulate academic status, or edit enrolled majors.
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, roll, email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchStudents()}
                  className="pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 w-44 sm:w-56"
                />
              </div>

              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Pending">Pending Verification</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science and Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electrical & Electronics">EEE</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll / ID</th>
                  <th className="py-3 px-4">Department & Level</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Courses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions (PUT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(stu.name)}`}
                          alt={stu.name}
                          className="h-9 w-9 rounded-full bg-slate-100 border object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{stu.name}</div>
                          <div className="text-xs text-slate-500">{stu.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                      {stu.studentId || 'UNASSIGNED'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-800">{stu.department}</div>
                      <div className="text-slate-400">Year {stu.year}, Sem {stu.semester}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {stu.cgpa ? stu.cgpa.toFixed(2) : '3.80'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-blue-700 text-xs">
                        {stu.enrolledCourses ? stu.enrolledCourses.length : 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          stu.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stu.status === 'Suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedStudentForEdit(stu)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Edit Academic Info"
                      >
                        <Edit className="h-3 w-3" /> Edit (PUT)
                      </button>

                      {stu.status === 'Active' ? (
                        <button
                          onClick={() => handleUpdateStudentStatus(stu._id, 'Suspended')}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Suspend Student"
                        >
                          <XCircle className="h-3 w-3" /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStudentStatus(stu._id, 'Active')}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Activate Student"
                        >
                          <CheckCircle className="h-3 w-3" /> Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Course Management */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Course Curriculum Administration ({courses.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add new academic courses with form validation, configure seat capacities, or update schedules.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseFormData({
                  courseCode: '',
                  title: '',
                  department: 'Computer Science and Engineering',
                  credits: 3,
                  instructor: '',
                  capacity: 40,
                  schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
                  description: '',
                  semester: 1,
                });
                setCourseErrors({});
                setIsCourseModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Course (POST)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const enrolledCount = course.enrolledStudents ? course.enrolledStudents.length : 0;
              return (
                <div key={course._id} className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {course.courseCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{course.credits} Credits</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{course.department}</p>

                    <div className="text-xs text-slate-600 space-y-1 mb-4 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div>Instructor: <span className="font-semibold text-slate-800">{course.instructor}</span></div>
                      <div>Schedule: {course.schedule}</div>
                      <div>Enrolled: <span className="font-semibold text-blue-700">{enrolledCount}</span> / {course.capacity} max seats</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit (PUT)
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id, course.courseCode)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Announcements Manager */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                Campus Broadcast & Announcement Manager ({announcements.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish high-priority academic notices, edit active circulars, or pin urgent bulletins.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setAnnFormData({
                  title: '',
                  content: '',
                  category: 'Academic',
                  priority: 'Medium',
                  pinned: false,
                  targetDepartment: 'All',
                });
                setAnnErrors({});
                setIsAnnModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Publish Announcement (POST)
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.pinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded flex items-center gap-1">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                      {ann.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.content}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(ann);
                      setAnnFormData({
                        title: ann.title,
                        content: ann.content,
                        category: ann.category,
                        priority: ann.priority,
                        pinned: ann.pinned,
                        targetDepartment: ann.targetDepartment || 'All',
                      });
                      setAnnErrors({});
                      setIsAnnModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit (PUT)
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann._id, ann.title)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Student Modal (PUT) */}
      {selectedStudentForEdit && (
        <Modal
          isOpen={Boolean(selectedStudentForEdit)}
          onClose={() => setSelectedStudentForEdit(null)}
          title={`Edit Student Academic Record: ${selectedStudentForEdit.name}`}
        >
          <form onSubmit={handleSaveStudentEdit} className="space-y-4">
            <FormField
              label="Department / Faculty"
              name="department"
              as="select"
              value={selectedStudentForEdit.department}
              onChange={(e) =>
                setSelectedStudentForEdit((prev) => ({ ...prev, department: e.target.value }))
              }
              options={[
                { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Academic Year (1-4)"
                name="year"
                type="number"
                value={selectedStudentForEdit.year}
                onChange={(e) =>
                  setSelectedStudentForEdit((prev) => ({ ...prev, year: e.target.value }))
                }
              />
              <FormField
                label="Semester (1-8)"
                name="semester"
                type="number"
                value={selectedStudentForEdit.semester}
                onChange={(e) =>
                  setSelectedStudentForEdit((prev) => ({ ...prev, semester: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="CGPA (0 - 4.0)"
                name="cgpa"
                type="number"
                step="0.01"
                value={selectedStudentForEdit.cgpa}
                onChange={(e) =>
                  setSelectedStudentForEdit((prev) => ({ ...prev, cgpa: e.target.value }))
                }
              />
              <FormField
                label="Enrollment Status"
                name="status"
                as="select"
                value={selectedStudentForEdit.status}
                onChange={(e) =>
                  setSelectedStudentForEdit((prev) => ({ ...prev, status: e.target.value }))
                }
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending Verification' },
                  { value: 'Suspended', label: 'Suspended' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentForEdit(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                Save Student Changes (PUT)
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Course Modal (POST/PUT) */}
      {isCourseModalOpen && (
        <Modal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          title={editingCourse ? `Edit Course: ${editingCourse.courseCode} (PUT)` : 'Add New Academic Course (POST)'}
        >
          <form onSubmit={handleSaveCourse} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Course Code"
                name="courseCode"
                value={courseFormData.courseCode}
                onChange={(e) => setCourseFormData({ ...courseFormData, courseCode: e.target.value })}
                placeholder="e.g. CS405"
                error={courseErrors.courseCode}
                required
              />
              <FormField
                label="Credits"
                name="credits"
                type="number"
                value={courseFormData.credits}
                onChange={(e) => setCourseFormData({ ...courseFormData, credits: Number(e.target.value) })}
                error={courseErrors.credits}
                required
              />
            </div>

            <FormField
              label="Course Title"
              name="title"
              value={courseFormData.title}
              onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              placeholder="e.g. Machine Learning Systems"
              error={courseErrors.title}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Department"
                name="department"
                as="select"
                value={courseFormData.department}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                options={[
                  { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
                  { value: 'Information Technology', label: 'Information Technology' },
                  { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
                ]}
              />

              <FormField
                label="Capacity (Seats)"
                name="capacity"
                type="number"
                value={courseFormData.capacity}
                onChange={(e) => setCourseFormData({ ...courseFormData, capacity: Number(e.target.value) })}
                error={courseErrors.capacity}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Lead Instructor"
                name="instructor"
                value={courseFormData.instructor}
                onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                placeholder="Prof. John Doe"
                error={courseErrors.instructor}
                required
              />

              <FormField
                label="Schedule"
                name="schedule"
                value={courseFormData.schedule}
                onChange={(e) => setCourseFormData({ ...courseFormData, schedule: e.target.value })}
                placeholder="Tue, Thu 10:00 AM - 11:30 AM"
              />
            </div>

            <FormField
              label="Course Syllabus / Description"
              name="description"
              as="textarea"
              rows={2}
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              placeholder="Brief course objectives and overview..."
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                {editingCourse ? 'Save Changes (PUT)' : 'Create Course (POST)'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Announcement Modal (POST/PUT) */}
      {isAnnModalOpen && (
        <Modal
          isOpen={isAnnModalOpen}
          onClose={() => setIsAnnModalOpen(false)}
          title={editingAnnouncement ? 'Edit Announcement (PUT)' : 'Broadcast New Announcement (POST)'}
        >
          <form onSubmit={handleSaveAnnouncement} className="space-y-3">
            <FormField
              label="Announcement Title"
              name="title"
              value={annFormData.title}
              onChange={(e) => setAnnFormData({ ...annFormData, title: e.target.value })}
              placeholder="e.g. Schedule for Mid-Term Exams"
              error={annErrors.title}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Category"
                name="category"
                as="select"
                value={annFormData.category}
                onChange={(e) => setAnnFormData({ ...annFormData, category: e.target.value })}
                options={[
                  { value: 'Academic', label: 'Academic' },
                  { value: 'Examination', label: 'Examination' },
                  { value: 'Event', label: 'Campus Event' },
                  { value: 'Urgent', label: 'Urgent Alert' },
                  { value: 'General', label: 'General Announcement' },
                ]}
              />

              <FormField
                label="Priority Level"
                name="priority"
                as="select"
                value={annFormData.priority}
                onChange={(e) => setAnnFormData({ ...annFormData, priority: e.target.value })}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                ]}
              />
            </div>

            <FormField
              label="Notice Content"
              name="content"
              as="textarea"
              rows={4}
              value={annFormData.content}
              onChange={(e) => setAnnFormData({ ...annFormData, content: e.target.value })}
              placeholder="Detailed announcement text and guidelines..."
              error={annErrors.content}
              required
            />

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={annFormData.pinned}
                  onChange={(e) => setAnnFormData({ ...annFormData, pinned: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">Pin this notice to top of student announcements</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                {editingAnnouncement ? 'Update Announcement (PUT)' : 'Publish Announcement (POST)'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
