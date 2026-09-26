import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProfileDashboard } from './components/dashboard/ProfileDashboard';
import { CourseCatalog } from './components/courses/CourseCatalog';
import { AnnouncementsFeed } from './components/announcements/AnnouncementsFeed';
import { AdminPanel } from './components/admin/AdminPanel';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import {
  GraduationCap,
  Shield,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Code2,
  Server
} from 'lucide-react';

const MainLayout = () => {
  const { user, loading, isAdmin, login } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700">Connecting to Student Portal API...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          /* Guest Welcome Hero */
          <div className="space-y-12">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Full Stack Project #2: Student Portal & Registration System
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                  Centralized Academic Portal & Course Registration
                </h1>

                <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
                  A modern, secure university platform allowing students to register with strict form validation, manage detailed academic profiles, register for semester courses with capacity controls, and view campus notices.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    Register as Student
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-sm transition-all"
                  >
                    Sign In to Portal
                  </button>

                  <button
                    onClick={() => login('alex.rivers@university.edu', 'Password123')}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <span>Instant Demo Student</span>
                  </button>

                  <button
                    onClick={() => {
                      login('admin@university.edu', 'Password123');
                      setCurrentTab('admin');
                    }}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Instant Demo Admin</span>
                  </button>
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Feature Modules Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">1. Form Validation</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Real-time client-side checks and server-side validation for institutional emails, passwords, student ID format, credit loads, and input sanitization.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <Code2 className="h-3.5 w-3.5" /> POST & PUT Methods
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">2. Profile Dashboard</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Student information hub displaying CGPA, registered credits, enrolled courses, academic standing, and interactive profile updating via PUT API calls.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <Server className="h-3.5 w-3.5" /> GET & PUT Methods
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">3. Admin Panel</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Administrative control suite for managing student statuses, creating course offerings with capacity validation, and broadcasting circulars.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-purple-600">
                  <Database className="h-3.5 w-3.5" /> GET, POST & PUT Methods
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Views */
          <div>
            {currentTab === 'dashboard' && (
              <ProfileDashboard onNavigateToCourses={() => setCurrentTab('courses')} />
            )}
            {currentTab === 'courses' && <CourseCatalog />}
            {currentTab === 'announcements' && <AnnouncementsFeed />}
            {currentTab === 'admin' && <AdminPanel />}
          </div>
        )}
      </main>

      {/* Footer highlighting Project Specs & COs */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Project 2: Student Portal and Registration System</span>
            <span>•</span>
            <span>Mapped COs: CO1 - CO5</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">React + Tailwind</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Node.js + Express</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">MongoDB</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-bold">GET | POST | PUT</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
