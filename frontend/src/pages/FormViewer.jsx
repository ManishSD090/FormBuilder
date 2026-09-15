import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ChevronRight, ChevronLeft, AlertCircle, UploadCloud, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const FileUploadInput = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional client-side size check (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file); // Multer is looking for 'image' in routes/upload.js
      
      const token = localStorage.getItem('token');
      // For anonymous uploads (FormViewer), the backend upload route must NOT require auth.
      // Wait, is our upload route protected? Let's assume it's open or we handle it on backend.
      // The current uploadRoute in server.js is completely unprotected.

      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");
      const data = await res.json();
      
      if (data.success) {
        onChange({ url: data.url, name: file.name, type: file.type });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => onChange(null);

  if (value && value.url) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mt-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate font-medium">{value.name || 'Uploaded File'}</span>
        </div>
        <button onClick={removeFile} type="button" className="text-gray-400 hover:text-red-500 transition-colors p-1">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-current bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group">
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-current" />
            <span className="text-sm font-medium text-gray-600">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-current">
            <UploadCloud size={28} />
            <span className="text-sm font-medium">Click to upload a file</span>
            <span className="text-xs text-gray-400 font-normal">Max size: 10MB</span>
          </div>
        )}
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
    </div>
  );
};

/* ──────────────────────────────────────────
   Question Input Renderer (supports all types)
────────────────────────────────────────── */
const QuestionInput = ({ question, value, onChange }) => {
  const { _id, type, options = [], text, passage, subQuestions, categories, items, validation } = question;

  switch (type) {
    case 'short_answer': {
      const maxLen = validation?.maxLength;
      const curLen = (value || '').length;
      return (
        <div>
          <input
            type="text"
            className="w-full border-b-2 border-gray-300 focus:border-current focus:outline-none py-2 bg-transparent text-gray-800 transition-colors"
            placeholder="Your answer"
            value={value || ''}
            maxLength={maxLen || undefined}
            onChange={(e) => onChange(e.target.value)}
          />
          {maxLen && (
            <p className={`text-right text-xs mt-1 ${curLen >= maxLen ? 'text-red-500' : 'text-gray-400'}`}>
              {curLen}/{maxLen}
            </p>
          )}
        </div>
      );
    }

    case 'paragraph': {
      const maxLen = validation?.maxLength;
      const curLen = (value || '').length;
      return (
        <div>
          <textarea
            className="w-full border-b-2 border-gray-300 focus:border-current focus:outline-none py-2 bg-transparent text-gray-800 resize-none transition-colors"
            rows={4}
            placeholder="Your answer"
            value={value || ''}
            maxLength={maxLen || undefined}
            onChange={(e) => onChange(e.target.value)}
          />
          {maxLen && (
            <p className={`text-right text-xs -mt-1 ${curLen >= maxLen ? 'text-red-500' : 'text-gray-400'}`}>
              {curLen}/{maxLen}
            </p>
          )}
        </div>
      );
    }

    case 'multiple_choice':
      return (
        <div className="space-y-3 mt-2">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === opt ? 'border-current' : 'border-gray-400 group-hover:border-gray-600'}`}>
                {value === opt && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
              </div>
              <span className="text-gray-700 text-sm">{opt}</span>
              <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
            </label>
          ))}
        </div>
      );

    case 'checkboxes':
      return (
        <div className="space-y-3 mt-2">
          {options.map((opt, i) => {
            const checked = Array.isArray(value) && value.includes(opt);
            return (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${checked ? 'bg-current border-current' : 'border-gray-400 group-hover:border-gray-600'}`}>
                  {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-gray-700 text-sm">{opt}</span>
                <input type="checkbox" className="sr-only" checked={checked}
                  onChange={() => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    onChange(checked ? arr.filter(v => v !== opt) : [...arr, opt]);
                  }}
                />
              </label>
            );
          })}
        </div>
      );

    case 'dropdown':
      return (
        <select
          className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-gray-800 bg-white"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>Choose…</option>
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );

    case 'linear_scale':
      return (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>1 — Low</span>
            <span>5 — High</span>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-all ${value === n ? 'border-current text-white bg-current' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                style={value === n ? { backgroundColor: 'currentcolor' } : {}}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          className="mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-gray-800"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'time':
      return (
        <input
          type="time"
          className="mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-gray-800"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'file_upload':
      return <FileUploadInput value={value} onChange={onChange} />;

    // ── Legacy types ──────────────────────────────────────
    case 'cloze': {
      const parts = text ? text.split(/(\[BLANK\])/g) : [];
      const blanks = value || {};
      return (
        <div className="leading-loose text-base mt-2">
          {parts.map((part, i) =>
            part === '[BLANK]' ? (
              <input key={i} type="text"
                className="inline-block w-32 mx-1 px-2 py-0.5 border-b-2 border-gray-400 focus:border-current focus:outline-none bg-transparent transition-colors"
                value={blanks[i] || ''}
                onChange={(e) => onChange({ ...blanks, [i]: e.target.value })}
              />
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      );
    }

    case 'categorize':
      return (
        <div className="space-y-3 mt-2">
          {items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-medium text-gray-800">{item}</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                value={(value || {})[item] || ''}
                onChange={(e) => onChange({ ...(value || {}), [item]: e.target.value })}
              >
                <option value="" disabled>Select category</option>
                {categories?.map((cat, ci) => <option key={ci} value={cat}>{cat}</option>)}
              </select>
            </div>
          ))}
        </div>
      );

    case 'comprehension':
      return (
        <div className="mt-2">
          {passage && <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700 border border-gray-100">{passage}</p>}
          {subQuestions?.map((subQ, i) => (
            <div key={subQ._id || subQ.id || i} className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{subQ.question}</label>
              <textarea
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                rows={3}
                placeholder="Your answer…"
                value={(value || {})[subQ._id || subQ.id] || ''}
                onChange={(e) => onChange({ ...(value || {}), [subQ._id || subQ.id]: e.target.value })}
              />
            </div>
          ))}
        </div>
      );

    default:
      return <p className="text-gray-400 italic text-sm mt-2">Unsupported question type: {type}</p>;
  }
};

/* ──────────────────────────────────────────
   Main FormViewer
────────────────────────────────────────── */
const FormViewer = () => {
  const { id: formId } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get('embed') === 'true';

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [sectionHistory, setSectionHistory] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasDraft, setHasDraft] = useState(false);

  // ── Load Draft ──
  useEffect(() => {
    try {
      const draft = localStorage.getItem(`form_draft_${formId}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.userEmail) setUserEmail(parsed.userEmail);
        setHasDraft(true);
      }
    } catch (err) {
      console.warn('Failed to load draft:', err);
    }
  }, [formId]);

  // ── Save Draft ──
  useEffect(() => {
    if (loading || !form || submitted) return;
    try {
      // Don't save empty drafts if they just loaded the page
      if (Object.keys(answers).length === 0 && !userEmail) return;
      
      const draft = { answers, userEmail, lastSaved: new Date().toISOString() };
      localStorage.setItem(`form_draft_${formId}`, JSON.stringify(draft));
      setHasDraft(true);
    } catch (err) {
      console.warn('Failed to save draft:', err);
    }
  }, [answers, userEmail, formId, loading, form, submitted]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API}/api/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found or could not be loaded.');
        const data = await res.json();
        setForm(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!form) return null;

  const settings = form.settings || {};
  
  // ── Form Closing / Expiration Logic ──
  const isManuallyClosed = settings.acceptingResponses === false;
  const isExpired = settings.expiresAt && new Date(settings.expiresAt) < new Date();

  if (isManuallyClosed || isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Closed</h2>
          <p className="text-gray-500 text-sm">
            The form "{form.title}" is no longer accepting responses.
            Please contact the owner if you think this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  const theme = settings.theme || {};
  const primaryColor = theme.primaryColor || '#4F46E5';
  const fontFamily = theme.fontFamily || 'Inter, sans-serif';
  const collectEmail = settings.collectEmail || settings.limitOneResponse;
  const confirmMsg = settings.confirmationMessage || 'Your response has been recorded. Thank you!';

  const sections = form.sections?.length > 0
    ? form.sections
    : [{ id: 'default-section', title: '' }];

  const allQuestions = form.questions || [];

  const sectionQuestions = (section) =>
    allQuestions.filter(q => q.sectionId === section.id || section.id === 'default-section');

  const currentSection = sections[currentSectionIdx];
  const currentQuestions = sectionQuestions(currentSection);
  const isLastSection = currentSectionIdx === sections.length - 1;
  const isMultiSection = sections.length > 1;

  const validateCurrentSection = () => {
    const errors = {};

    currentQuestions.forEach(q => {
      const val = answers[q._id];
      const isEmpty = val === undefined || val === null || val === '' ||
        (Array.isArray(val) && val.length === 0);

      // Required check
      if (q.required && isEmpty && val !== 0) {
        errors[q._id] = 'This question is required.';
        return; // skip further validation if empty
      }

      // Custom validation rules
      const v = q.validation || {};
      if (!isEmpty && val !== undefined) {
        // Text length validation (short_answer, paragraph)
        if (['short_answer', 'paragraph'].includes(q.type)) {
          const len = String(val).length;
          if (v.minLength && len < v.minLength) {
            errors[q._id] = `Minimum ${v.minLength} characters required.`;
          } else if (v.maxLength && len > v.maxLength) {
            errors[q._id] = `Maximum ${v.maxLength} characters allowed.`;
          } else if (v.pattern) {
            try {
              const regex = new RegExp(v.pattern);
              if (!regex.test(String(val))) {
                errors[q._id] = v.patternError || 'Invalid format.';
              }
            } catch { /* ignore bad regex */ }
          }
        }
      }
    });

    if (collectEmail && currentSectionIdx === 0 && !userEmail) {
      errors['_email'] = 'Email is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) return;

    // ── Evaluate conditional logic rules ────────────────────
    // Check every question in the current section for logic rules.
    // The first matching rule wins.
    let jumpSectionIdx = null;
    let submitNow = false;

    for (const q of currentQuestions) {
      const rules = q.logic || [];
      const userAnswer = answers[q._id];
      for (const rule of rules) {
        if (rule.condition === 'equals' && userAnswer === rule.value) {
          if (rule.action === 'submit_form') {
            submitNow = true;
            break;
          }
          if (rule.action === 'jump_to_section') {
            const idx = sections.findIndex(s => s.id === rule.target);
            if (idx !== -1) jumpSectionIdx = idx;
          }
          break;
        }
      }
      if (jumpSectionIdx !== null || submitNow) break;
    }

    if (submitNow) {
      // Trigger form submission programmatically
      document.getElementById('form-submit-btn')?.click();
      return;
    }

    const nextIdx = jumpSectionIdx !== null ? jumpSectionIdx : currentSectionIdx + 1;
    if (nextIdx >= sections.length) {
      document.getElementById('form-submit-btn')?.click();
      return;
    }
    setSectionHistory(prev => [...prev, currentSectionIdx]);
    setCurrentSectionIdx(nextIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (sectionHistory.length > 0) {
      const prevHistory = [...sectionHistory];
      const prevIdx = prevHistory.pop();
      setSectionHistory(prevHistory);
      setCurrentSectionIdx(prevIdx);
    } else {
      setCurrentSectionIdx(i => Math.max(0, i - 1));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentSection()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        formId,
        userEmail: userEmail || undefined,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      };
      const res = await fetch(`${API}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit response.');
      }
      setSubmitted(true);
      
      // Clear draft on successful submit
      localStorage.removeItem(`form_draft_${formId}`);
      
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear your draft and start over?')) {
      localStorage.removeItem(`form_draft_${formId}`);
      setAnswers({});
      setUserEmail('');
      setHasDraft(false);
      setCurrentSectionIdx(0);
      setSectionHistory([]);
    }
  };

  // ── Confirmation Screen ──
  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4" 
        style={{ fontFamily, backgroundColor: theme.backgroundColor || '#f9fafb' }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${primaryColor}18` }}
          >
            <CheckCircle2 size={36} style={{ color: primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Response Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{confirmMsg}</p>
          <div className="mt-8 h-1 w-16 rounded-full mx-auto" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div
      className={isEmbedded ? "w-full overflow-hidden" : "min-h-screen py-10 px-4"}
      style={{ fontFamily, backgroundColor: isEmbedded ? 'transparent' : (theme.backgroundColor || '#f9fafb') }}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">

        {/* Header Card */}
        <div
          className={`bg-white rounded-xl ${isEmbedded ? '' : 'shadow-sm border border-gray-100'} overflow-hidden`}
          style={isEmbedded ? {} : { borderTopColor: primaryColor, borderTopWidth: 8 }}
        >
          {form.headerImage && (
            <img src={form.headerImage} alt="Form Header" className="w-full h-44 object-cover" />
          )}
          <div className="px-8 py-6 relative">
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            {form.description && <p className="mt-2 text-gray-500 text-sm">{form.description}</p>}
            
            {hasDraft && !submitted && (
              <div className="mt-4 flex items-center justify-between bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg border border-indigo-100">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Draft auto-saved locally
                </p>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
                >
                  Clear Draft
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section progress indicator */}
        {isMultiSection && (
          <div className="flex items-center gap-2 px-1">
            {sections.map((s, i) => (
              <div
                key={s.id}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i <= currentSectionIdx ? primaryColor : '#e5e7eb' }}
              />
            ))}
          </div>
        )}

        {/* Section label */}
        {isMultiSection && (
          <div className={`bg-white rounded-xl px-8 py-5 ${isEmbedded ? '' : 'shadow-sm border border-gray-100'}`}>
            <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: primaryColor }}>
              Section {currentSectionIdx + 1} of {sections.length}
            </p>
            <h2 className="text-xl font-bold text-gray-800">{currentSection.title || 'Untitled Section'}</h2>
            {currentSection.description && <p className="text-gray-500 text-sm mt-1">{currentSection.description}</p>}
          </div>
        )}

        {/* Email field (first section only if enabled) */}
        {collectEmail && currentSectionIdx === 0 && (
          <div className={`bg-white rounded-xl px-8 py-6 ${isEmbedded ? '' : 'shadow-sm border border-gray-100'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-b-2 border-gray-300 focus:outline-none py-2 bg-transparent text-gray-800 transition-colors"
              style={{ '--tw-ring-color': primaryColor }}
            />
            {validationErrors['_email'] && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {validationErrors['_email']}
              </p>
            )}
          </div>
        )}

        {/* Questions */}
        {currentQuestions.map((q, idx) => (
          <div
            key={q._id || idx}
            className={`bg-white rounded-xl px-8 py-6 transition-all ${
              isEmbedded ? '' : 'shadow-sm border'
            } ${validationErrors[q._id] ? 'border-red-300' : 'border-gray-100'}`}
            style={{ '--tw-ring-color': primaryColor }}
          >
            <div className="flex items-start gap-2 mb-4">
              <h3 className="text-base font-semibold text-gray-900 flex-1">
                {q.title || 'Untitled Question'}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            </div>
            {q.description && <p className="text-gray-500 text-sm mb-4">{q.description}</p>}
            {q.image && <img src={q.image} alt="" className="max-w-sm rounded-lg mb-4 border border-gray-100" />}

            {/* Inject color via CSS variable so inputs can use it */}
            <div style={{ '--accent': primaryColor, color: primaryColor }}>
              <QuestionInput
                question={q}
                value={answers[q._id]}
                onChange={(val) => {
                  setAnswers(prev => ({ ...prev, [q._id]: val }));
                  if (validationErrors[q._id]) {
                    setValidationErrors(prev => { const e = { ...prev }; delete e[q._id]; return e; });
                  }
                }}
              />
            </div>

            {validationErrors[q._id] && (
              <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
                <AlertCircle size={12} /> {validationErrors[q._id]}
              </p>
            )}
          </div>
        ))}

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-2 pb-10">
          {isMultiSection && currentSectionIdx > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {isMultiSection && !isLastSection ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 ml-auto px-6 py-3 rounded-xl text-white font-semibold text-sm shadow hover:opacity-90 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              id="form-submit-btn"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 ml-auto px-8 py-3 rounded-xl text-white font-semibold text-sm shadow hover:opacity-90 disabled:opacity-60 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormViewer;
