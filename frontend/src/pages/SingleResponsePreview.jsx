import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, Loader2, AlertCircle, ExternalLink, Download } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

/* ── Renders a submitted answer for any question type ─────── */
const AnswerDisplay = ({ question, answer }) => {
  if (answer === undefined || answer === null || answer === '') {
    return <p className="text-gray-400 italic text-sm">No answer provided.</p>;
  }

  const { type, text, passage, subQuestions, categories, items } = question;

  switch (type) {
    case 'short_answer':
    case 'paragraph':
    case 'date':
    case 'time':
      return <p className="text-gray-800 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">{String(answer)}</p>;

    case 'multiple_choice':
    case 'dropdown':
      return (
        <p className="text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2 inline-block border border-indigo-100">
          {String(answer)}
        </p>
      );

    case 'checkboxes':
      return (
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(answer) ? answer : [answer]).map((v, i) => (
            <span key={i} className="text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
              {v}
            </span>
          ))}
        </div>
      );

    case 'linear_scale':
      return (
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all ${Number(answer) === n ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 text-gray-400'}`}>
                {n}
              </div>
            ))}
          </div>
        </div>
      );

    case 'file_upload':
      if (typeof answer === 'object' && answer.url) {
        return (
          <a
            href={answer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Download size={16} />
            {answer.name || 'Download File'}
            <ExternalLink size={14} className="text-gray-400 ml-1" />
          </a>
        );
      }
      return <p className="text-gray-800 text-sm">{String(answer)}</p>;

    case 'cloze': {
      const parts = text ? text.split(/(\[BLANK\])/g) : [];
      const blanks = typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
      return (
        <p className="leading-loose text-sm text-gray-800 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          {parts.map((part, i) =>
            part === '[BLANK]' ? (
              <span key={i} className="inline-block mx-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold text-xs border border-indigo-200">
                {blanks[i] || '______'}
              </span>
            ) : <span key={i}>{part}</span>
          )}
        </p>
      );
    }

    case 'categorize':
      return (
        <div className="space-y-2">
          {items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <span className="font-medium text-gray-700">{item}</span>
              <span className="text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 text-xs">
                {(answer || {})[item] || '—'}
              </span>
            </div>
          ))}
        </div>
      );

    case 'comprehension':
      return (
        <div className="space-y-4">
          {passage && (
            <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-100">{passage}</p>
          )}
          {subQuestions?.map((subQ, i) => (
            <div key={subQ._id || subQ.id || i}>
              <p className="text-xs font-bold text-gray-500 mb-1">{subQ.question}</p>
              <p className="text-sm bg-indigo-50 rounded-lg px-4 py-2 text-gray-800 border border-indigo-100">
                {(answer || {})[subQ._id || subQ.id] || <span className="italic text-gray-400">Not answered</span>}
              </p>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <p className="text-gray-600 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          {typeof answer === 'object' ? JSON.stringify(answer, null, 2) : String(answer)}
        </p>
      );
  }
};

/* ── Main Component ─────────────────────────────────────── */
const SingleResponsePreview = () => {
  const { id: responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token missing. Please log in.');
        const res = await fetch(`${API}/api/responses/${responseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch response.');
        setResponse(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [responseId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!response?.formId) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Response or associated form not found.</p>
    </div>
  );

  const form = response.formId;
  const questions = form.questions || [];
  const theme = form.settings?.theme || {};
  const primaryColor = theme.primaryColor || '#4F46E5';

  // Build a lookup map: questionId → answer
  const answerMap = {};
  response.answers.forEach(a => { answerMap[a.questionId] = a.answer; });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-inter">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Back Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Individual Response</p>
            <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
          </div>
        </div>

        {/* Meta card */}
        <div
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ borderTopColor: primaryColor, borderTopWidth: 6 }}
        >
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={15} className="text-gray-400" />
              <span>{response.userEmail || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={15} className="text-gray-400" />
              <span>
                {new Date(response.createdAt).toLocaleDateString()} {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Answered Questions */}
        {questions.map((q, i) => (
          <div key={q._id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex items-start gap-2 mb-4">
              <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{q.title || 'Untitled Question'}</p>
                {q.description && <p className="text-xs text-gray-400 mt-0.5">{q.description}</p>}
              </div>
            </div>
            <AnswerDisplay question={q} answer={answerMap[q._id]} />
          </div>
        ))}

        {/* Back link */}
        <div className="text-center pb-8">
          <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm font-semibold hover:underline">
            ← Back to all responses
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleResponsePreview;
