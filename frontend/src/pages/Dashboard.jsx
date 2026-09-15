import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, BarChart2, Plus, LogOut, Eye, Pencil, Trash2,
  Share2, Copy, X, Code2, ExternalLink, Loader2, Search,
  CheckCircle2, AlertCircle, ChevronRight, ListChecks, CopyPlus
} from 'lucide-react';
import TemplatesModal from '../components/FormBuilder/TemplatesModal';

const API = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────────
   Toast notification hook
───────────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, show };
};

const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-in ${
          t.type === 'success'
            ? 'bg-white border-emerald-100 text-emerald-700'
            : 'bg-white border-red-100 text-red-600'
        }`}
      >
        {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        {t.message}
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   Share / Embed Modal
───────────────────────────────────────── */
const ShareModal = ({ formId, formTitle, onClose }) => {
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState('600px');

  const origin = window.location.origin;
  const formUrl = `${origin}/form/${formId}`;
  const embedUrl = `${formUrl}?embed=true`;
  const embedCode = `<iframe src="${embedUrl}" width="${embedWidth}" height="${embedHeight}" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Share Form</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{formTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Form Link */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Direct Link</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{formUrl}</span>
              <button
                onClick={() => copy(formUrl, 'url')}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied === 'url' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
              >
                {copied === 'url' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied === 'url' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 ml-1 transition-colors"
            >
              Open in new tab &rarr;
            </a>
          </div>

          {/* Embed Code */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
              <Code2 size={14} className="text-indigo-500" /> Embed on Website
            </label>
            
            <div className="flex gap-4 mb-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Width</label>
                <input 
                  type="text" 
                  value={embedWidth} 
                  onChange={e => setEmbedWidth(e.target.value)}
                  className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Height</label>
                <input 
                  type="text" 
                  value={embedHeight} 
                  onChange={e => setEmbedHeight(e.target.value)}
                  className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 leading-relaxed relative overflow-hidden group">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
              <button
                onClick={() => copy(embedCode, 'embed')}
                className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${copied === 'embed' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {copied === 'embed' ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied === 'embed' ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Form Card
───────────────────────────────────────── */
const FormCard = ({ form, onDelete, onShare, onEdit, onViewResponses, onDuplicate, deleting, duplicating }) => {
  const theme = form.settings?.theme || {};
  const primaryColor = theme.primaryColor || '#4F46E5';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
      {/* Color accent top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}18` }}
          >
            <FileText size={16} style={{ color: primaryColor }} />
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-mono text-gray-400 mt-1">
              {new Date(form.createdAt).toLocaleDateString()}
            </span>
            {(form.settings?.acceptingResponses === false || (form.settings?.expiresAt && new Date(form.settings.expiresAt) < new Date())) && (
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Closed</span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug line-clamp-2">{form.title}</h3>
        {form.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{form.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <BarChart2 size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">
              {form.responsesCount ?? 0} response{form.responsesCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(form._id)} title="Edit"
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Pencil size={14} />
            </button>
            <button onClick={() => onViewResponses(form._id)} title="Responses"
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
              <BarChart2 size={14} />
            </button>
            <Link to={`/form/${form._id}`} target="_blank" title="View form">
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Eye size={14} />
              </button>
            </Link>
            <button onClick={() => onDuplicate(form._id)} disabled={duplicating === form._id} title="Duplicate form"
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50">
              {duplicating === form._id ? <Loader2 size={14} className="animate-spin" /> : <CopyPlus size={14} />}
            </button>
            <button onClick={() => onShare(form)} title="Share"
              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
              <Share2 size={14} />
            </button>
            <button onClick={() => onDelete(form._id)} disabled={deleting === form._id} title="Delete"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
              {deleting === form._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const { toasts, show: showToast } = useToast();

  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [shareTarget, setShareTarget] = useState(null); // { _id, title }
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' | 'responses'
  const [showTemplates, setShowTemplates] = useState(false);

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (_) {}
    }
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (_) {}
    };
    fetchUser();
  }, [navigate]);

  // Load forms
  useEffect(() => {
    const fetchForms = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API}/api/forms`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load forms.');
        setForms(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleTemplateSelect = (template) => {
    setShowTemplates(false);
    if (template) {
      sessionStorage.setItem('formTemplate', JSON.stringify(template.form));
    } else {
      sessionStorage.removeItem('formTemplate');
    }
    navigate('/formbuilder');
  };

  const handleDelete = async (formId) => {
    if (!window.confirm('Delete this form and all its responses? This cannot be undone.')) return;
    setDeletingId(formId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/forms/${formId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed.');
      setForms(prev => prev.filter(f => f._id !== formId));
      showToast('Form deleted successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (formId) => {
    setDuplicatingId(formId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/forms/${formId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Duplicate failed.');
      const newForm = await res.json();
      // Insert the copy right after the original
      setForms(prev => {
        const idx = prev.findIndex(f => f._id === formId);
        const next = [...prev];
        next.splice(idx + 1, 0, { ...newForm, responsesCount: 0 });
        return next;
      });
      showToast(`"${newForm.title}" created!`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = forms.filter(f =>
    f.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalResponses = forms.reduce((s, f) => s + (f.responsesCount || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">FormBuilder</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: 'forms', label: 'My Forms', icon: ListChecks },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.fullname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullname || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all font-medium">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 min-h-screen px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.fullname ? `Hey, ${user.fullname.split(' ')[0]} 👋` : 'My Forms'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and analyze your forms</p>
          </div>
          <button
            onClick={() => navigate('/formbuilder')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow hover:bg-indigo-700 transition-all"
          >
            <Plus size={16} /> New Form
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Forms', value: forms.length, icon: FileText, color: 'bg-indigo-500' },
            { label: 'Total Responses', value: totalResponses, icon: BarChart2, color: 'bg-emerald-500' },
            { label: 'Active Forms', value: forms.length, icon: CheckCircle2, color: 'bg-violet-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-6 shadow-sm">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search forms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 focus:outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Forms Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {search ? 'No forms match your search' : 'No forms yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {search ? 'Try a different keyword.' : 'Create your first form to get started.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:bg-indigo-700 transition-all"
              >
                <Plus size={15} /> Create Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New form card */}
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-600 min-h-[180px] group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-sm font-semibold">New Form</span>
            </button>

            {filtered.map(form => (
              <FormCard
                key={form._id}
                form={form}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onShare={setShareTarget}
                onEdit={(id) => navigate(`/formbuilder/${id}`)}
                onViewResponses={(id) => navigate(`/responses/form/${id}`)}
                deleting={deletingId}
                duplicating={duplicatingId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          formId={shareTarget._id}
          formTitle={shareTarget.title}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <TemplatesModal
          onClose={() => setShowTemplates(false)}
          onSelect={handleTemplateSelect}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default Dashboard;
