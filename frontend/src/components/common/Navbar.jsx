import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  User,
  BookOpen,
  Bell,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export const Navbar = ({
  currentTab,
  onTabChange,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { user, logout, isAdmin, isStudent, login } = useAuth();

  const handleQuickSwitch = async (role) => {
    if (role === 'admin') {
      await login('admin@university.edu', 'Password123');
      onTabChange('admin');
    } else {
      await login('alex.rivers@university.edu', 'Password123');
      onTabChange('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                EduPortal
                <span className="text-[10px] font-semibold tracking-wide bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  v2.0
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Academic Portal & Registration System
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="h-4 w-4" />
              Profile Dashboard
            </button>

            <button
              onClick={() => onTabChange('courses')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'courses'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Course Registration
            </button>

            <button
              onClick={() => onTabChange('announcements')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'announcements'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="h-4 w-4" />
              Announcements
            </button>

            {(isAdmin || true) && (
              <button
                onClick={() => {
                  if (!isAdmin) {
                    handleQuickSwitch('admin');
                  } else {
                    onTabChange('admin');
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50/50'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Panel {isAdmin && '★'}
              </button>
            )}
          </nav>

          {/* User Controls & Demo Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher pill */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Switch Role:
              </span>
              <button
                onClick={() => handleQuickSwitch('student')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isStudent && user?.email === 'alex.rivers@university.edu'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => handleQuickSwitch('admin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isAdmin
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dean / Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="h-9 w-9 rounded-full bg-slate-100 border object-cover"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {user.role === 'admin' ? 'Academic Dean' : user.studentId || 'Student'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  Student Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => onTabChange('courses')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'courses' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Courses</span>
          </button>
          <button
            onClick={() => onTabChange('announcements')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'announcements' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            <Bell className="h-4 w-4" />
            <span>Notices</span>
          </button>
          <button
            onClick={() => {
              if (!isAdmin) handleQuickSwitch('admin');
              else onTabChange('admin');
            }}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'admin' ? 'text-purple-600' : 'text-purple-400'}`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
