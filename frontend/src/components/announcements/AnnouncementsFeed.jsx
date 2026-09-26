import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Bell, Pin, Calendar, Tag, AlertTriangle, Info, CheckCircle2, Megaphone, Search } from 'lucide-react';

export const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Academic', 'Examination', 'Event', 'Urgent', 'General'];

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Primary API Method: GET
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const data = await api.get(`/announcements?${params.toString()}`);
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Examination':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Event':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-blue-600" />
              University Announcements & Notices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official academic deadlines, examination circulars, and campus events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-48 sm:w-60"
              />
            </form>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Loading circulars & announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No announcements found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no circulars matching your current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all hover:shadow-sm ${
                ann.pinned ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      <Pin className="h-3 w-3 fill-amber-700" /> Pinned
                    </span>
                  )}
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(
                      ann.category
                    )}`}
                  >
                    {ann.category}
                  </span>
                  {ann.priority === 'High' && (
                    <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> High Priority
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                {ann.title}
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line">
                {ann.content}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                <span>Published by: <strong className="text-slate-600">{ann.author || 'Academic Affairs'}</strong></span>
                <span>Department: {ann.targetDepartment || 'All University'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
