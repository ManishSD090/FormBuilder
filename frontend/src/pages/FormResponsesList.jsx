import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Trash2, Users, Calendar, BarChart2,
  Download, Search, ChevronDown, ChevronUp, Loader2, ExternalLink, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const API = import.meta.env.VITE_API_URL;

/* ── Small stat card ─────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

/* ── Answer summary chart for one question ───────────────── */
const AnswerSummary = ({ question, responses }) => {
  const qId = question._id;
  const type = question.type;

  const answers = responses
    .flatMap(r => r.answers)
    .filter(a => a.questionId === qId)
    .map(a => a.answer);

  if (answers.length === 0) return (
    <p className="text-xs text-gray-400 italic">No answers yet.</p>
  );

  if (['multiple_choice', 'dropdown', 'checkboxes'].includes(type)) {
    const counts = {};
    answers.forEach(a => {
      const arr = Array.isArray(a) ? a : [a];
      arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    const data = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

    if (type === 'multiple_choice' || type === 'dropdown') {
      return (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    } else {
      // Checkboxes (multiple selections possible) -> BarChart
      return (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }

  if (type === 'linear_scale') {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    answers.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
    const avg = (answers.reduce((s, v) => s + Number(v), 0) / answers.length).toFixed(1);
    const data = [1, 2, 3, 4, 5].map(n => ({ rating: String(n), count: counts[n] }));

    return (
      <div className="mt-4">
        <p className="text-sm font-semibold text-indigo-600 mb-4">Average Rating: {avg} / 5</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rating" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val) => [val, 'Responses']} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ── Categorize: show item→category breakdown ──
  if (type === 'categorize') {
    const itemCounts = {}; // { itemName: { catName: count } }
    answers.forEach(a => {
      if (typeof a !== 'object' || !a) return;
      Object.entries(a).forEach(([item, cat]) => {
        if (!itemCounts[item]) itemCounts[item] = {};
        itemCounts[item][cat] = (itemCounts[item][cat] || 0) + 1;
      });
    });
    return (
      <div className="mt-2 space-y-3">
        {Object.entries(itemCounts).map(([item, catMap]) => (
          <div key={item}>
            <p className="text-xs font-semibold text-gray-500 mb-1">{item}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(catMap).map(([cat, count]) => (
                <span key={cat} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 font-medium">
                  {cat} <span className="text-indigo-400">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Cloze: show per-blank answer frequency ──
  if (type === 'cloze') {
    const parts = question.text ? question.text.split(/(\[BLANK\])/g) : [];
    const blankIndices = parts.reduce((acc, p, i) => { if (p === '[BLANK]') acc.push(i); return acc; }, []);
    if (blankIndices.length === 0) return <p className="text-xs text-gray-400 italic mt-2">No blanks found.</p>;
    return (
      <div className="mt-2 space-y-3">
        {blankIndices.map((blankIdx, n) => {
          const blankAnswers = answers.map(a => (typeof a === 'object' && a) ? a[blankIdx] : null).filter(Boolean);
          const counts = {};
          blankAnswers.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
          return (
            <div key={blankIdx}>
              <p className="text-xs font-semibold text-gray-500 mb-1">Blank {n + 1}</p>
              <div className="flex flex-wrap gap-2">
                {sorted.map(([val, cnt]) => (
                  <span key={val} className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1 font-medium border border-gray-200">
                    "{val}" <span className="text-gray-400">×{cnt}</span>
                  </span>
                ))}
                {sorted.length === 0 && <span className="text-xs text-gray-400 italic">No answers.</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Comprehension: show sub-question answers ──
  if (type === 'comprehension') {
    const subQs = question.subQuestions || [];
    if (subQs.length === 0) return <p className="text-xs text-gray-400 italic mt-2">No sub-questions.</p>;
    return (
      <div className="mt-2 space-y-3">
        {subQs.map((subQ, i) => {
          const subId = subQ._id || subQ.id;
          const subAnswers = answers
            .map(a => (typeof a === 'object' && a) ? a[subId] : null)
            .filter(v => v !== null && v !== undefined && v !== '');
          return (
            <div key={subId || i}>
              <p className="text-xs font-semibold text-gray-500 mb-1">{subQ.question}</p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {subAnswers.slice(0, 4).map((ans, j) => (
                  <p key={j} className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded border border-gray-100 truncate">
                    {String(ans)}
                  </p>
                ))}
                {subAnswers.length === 0 && <p className="text-xs text-gray-400 italic">No answers yet.</p>}
                {subAnswers.length > 4 && <p className="text-xs text-gray-400 italic">+{subAnswers.length - 4} more…</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── File Upload: show links ──
  if (type === 'file_upload') {
    const fileAnswers = answers.filter(a => typeof a === 'object' && a?.url);
    if (fileAnswers.length === 0) return <p className="text-xs text-gray-400 italic mt-2">No files uploaded.</p>;
    
    return (
      <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-2">
        {fileAnswers.map((f, i) => (
          <a
            key={i}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded px-3 py-1.5 text-indigo-600 transition-colors"
          >
            <Download size={13} />
            <span className="truncate flex-1">{f.name || 'File'}</span>
            <ExternalLink size={12} className="text-gray-400" />
          </a>
        ))}
      </div>
    );
  }

  // ── Generic text / paragraph fallback ──
  return (
    <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
      {answers.slice(0, 5).map((a, i) => (
        <p key={i} className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-100 truncate">
          {typeof a === 'object' ? JSON.stringify(a) : String(a)}
        </p>
      ))}
      {answers.length > 5 && <p className="text-xs text-gray-400 italic">+{answers.length - 5} more…</p>}
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────── */
const FormResponsesList = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [activeTab, setActiveTab] = useState('responses'); // 'responses' | 'summary'
  const [deletingId, setDeletingId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing. Please log in.');

      const sortParam = `${sortDir === 'desc' ? '-' : ''}${sortField}`;
      const res = await fetch(`${API}/api/responses/form/${formId}?page=${page}&limit=${limit}&sort=${sortParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch responses.');
      const json = await res.json();
      
      const resData = Array.isArray(json) ? json : (json.data || []);
      setResponses(resData);
      
      if (json.pagination) {
        setTotalPages(json.pagination.totalPages);
        setTotalResponses(json.pagination.total);
      } else {
        setTotalResponses(resData.length);
        setTotalPages(1);
      }

      if (resData.length > 0) {
        setForm(resData[0].formId);
      } else {
        const fRes = await fetch(`${API}/api/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (fRes.ok) setForm(await fRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId, page, limit, sortField, sortDir]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this response? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/responses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete.');
      setResponses(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!form || responses.length === 0) return;
    const questions = form.questions || [];
    const header = ['Submitted By', 'Date', ...questions.map(q => q.title || q._id)];
    const rows = responses.map(r => {
      const answerMap = {};
      r.answers.forEach(a => { answerMap[a.questionId] = a.answer; });
      return [
        r.userEmail || 'Anonymous',
        new Date(r.createdAt).toLocaleDateString(),
        ...questions.map(q => {
          const a = answerMap[q._id];
          if (!a) return '';
          if (Array.isArray(a)) return a.join('; ');
          if (typeof a === 'object') {
            if (a.url) return `${a.name || 'File'}: ${a.url}`;
            return JSON.stringify(a);
          }
          return String(a);
        }),
      ];
    });
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title || 'responses'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    let list = [...responses];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.userEmail || '').toLowerCase().includes(q) ||
        new Date(r.createdAt).toLocaleDateString().includes(q)
      );
    }
    return list;
  }, [responses, search]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

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

  const questions = form?.questions || [];
  const avgDate = responses.length
    ? new Date(responses.reduce((s, r) => s + new Date(r.createdAt).getTime(), 0) / responses.length).toLocaleDateString()
    : '—';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-inter">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Responses</p>
              <h1 className="text-2xl font-bold text-gray-900">{form?.title || 'Loading…'}</h1>
            </div>
          </div>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Total Responses" value={responses.length} color="bg-indigo-500" />
          <StatCard icon={Calendar} label="Avg. Date" value={avgDate} color="bg-emerald-500" />
          <StatCard icon={BarChart2} label="Questions" value={questions.length} color="bg-rose-500" />
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit gap-1">
          {[['responses', 'All Responses'], ['summary', 'Summary & Charts']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: All Responses ── */}
        {activeTab === 'responses' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or date…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm text-gray-700 focus:outline-none bg-transparent"
              />
              <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No responses yet.</p>
                <p className="text-sm mt-1">Share your form to start collecting answers!</p>
                <Link
                  to={`/form/${formId}`}
                  className="mt-4 inline-block text-indigo-600 text-sm font-semibold hover:underline"
                >
                  Open form link →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1 hover:text-indigo-600"
                        onClick={() => toggleSort('createdAt')}
                      >
                        Date {sortField === 'createdAt' ? (sortDir === 'desc' ? <ChevronDown size={13} /> : <ChevronUp size={13} />) : null}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Answers</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((r, idx) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800">{r.userEmail || 'Anonymous'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.answers?.length || 0} answer{r.answers?.length !== 1 ? 's' : ''}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/response/${r._id}`)}
                              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                              title="View response"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(r._id)}
                              disabled={deletingId === r._id}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
                              title="Delete response"
                            >
                              {deletingId === r._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-500">
                  Showing page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span> ({totalResponses} total)
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Summary ── */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {questions.length === 0 && (
              <p className="text-center text-gray-400 py-10">No questions found in this form.</p>
            )}
            {questions.map((q, i) => (
              <div key={q._id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-indigo-500 font-semibold uppercase tracking-widest mb-1">
                      {q.type?.replace(/_/g, ' ')}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900">{q.title || 'Untitled Question'}</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-mono whitespace-nowrap">
                    {responses.flatMap(r => r.answers).filter(a => a.questionId === q._id).length} responses
                  </span>
                </div>
                <AnswerSummary question={q} responses={responses} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponsesList;
