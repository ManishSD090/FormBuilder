import React, { useState } from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { Copy, Trash2, GripVertical, X, GitBranch, ShieldCheck, Image, Loader2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LogicPanel from './LogicPanel';
import { CategorizeEditor, ClozeEditor, ComprehensionEditor } from './LegacyEditors';

const QuestionCard = ({ question, index, primaryColor }) => {
  const { updateQuestion, removeQuestion, addQuestion } = useFormBuilder();
  const [showLogic, setShowLogic] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) updateQuestion(question.id, 'image', data.url);
    } catch { /* silently fail */ }
    finally { setImageUploading(false); }
  };

  const validation = question.validation || {};
  const hasValidation = !!(validation.minLength || validation.maxLength || validation.pattern);
  const isTextType = ['short_answer', 'paragraph'].includes(question.type);

  const updateValidation = (key, value) => {
    const current = question.validation || {};
    const updated = { ...current, [key]: value || undefined };
    // Clean out undefined keys
    Object.keys(updated).forEach(k => updated[k] === undefined && delete updated[k]);
    updateQuestion(question.id, 'validation', Object.keys(updated).length ? updated : null);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative',
  };

  const accent = primaryColor || '#4F46E5';
  const hasLogic = question.logic?.length > 0;

  const handleDuplicate = () => addQuestion(question.type, question.sectionId);
  const handleTypeChange = (e) => updateQuestion(question.id, 'type', e.target.value);

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-6 mb-4 border border-gray-200 rounded-xl shadow-sm group">
      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing p-1">
            <GripVertical size={18} />
          </div>
          <input
            type="text"
            className="text-base font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none w-full pb-1 transition-colors"
            value={question.title || ''}
            onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
            placeholder="Question title"
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <select
            className="p-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer focus:outline-none"
            value={question.type}
            onChange={handleTypeChange}
          >
            <optgroup label="Basic">
              <option value="short_answer">Short Answer</option>
              <option value="paragraph">Paragraph</option>
            </optgroup>
            <optgroup label="Choice">
              <option value="multiple_choice">Multiple Choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>
            </optgroup>
            <optgroup label="Advanced">
              <option value="linear_scale">Linear Scale</option>
              <option value="file_upload">File Upload</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
            </optgroup>
            <optgroup label="Legacy">
              <option value="categorize">Categorize</option>
              <option value="cloze">Cloze</option>
              <option value="comprehension">Comprehension</option>
            </optgroup>
          </select>

          {/* Image upload button */}
          <label
            title="Attach image to question"
            className={`relative cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              question.image
                ? 'border-blue-200 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {imageUploading
              ? <Loader2 size={14} className="animate-spin" />
              : <Image size={14} />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
          </label>
        </div>
      </div>

      {/* Image preview (if attached) */}
      {question.image && (
        <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100 group/img">
          <img
            src={question.image}
            alt="Question attachment"
            className="w-full max-h-56 object-cover"
          />
          <button
            onClick={() => updateQuestion(question.id, 'image', '')}
            title="Remove image"
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg transition-all opacity-0 group-hover/img:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full text-sm text-gray-400 border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none pb-1 transition-colors"
          value={question.description || ''}
          onChange={(e) => updateQuestion(question.id, 'description', e.target.value)}
          placeholder="Description (optional)"
        />
      </div>

      {/* Question body */}
      <div className="py-2">
        {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
          <div className="space-y-2">
            {(question.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                {question.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                {question.type === 'checkboxes' && <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0" />}
                {question.type === 'dropdown' && <span className="text-gray-400 font-mono text-xs w-5 flex-shrink-0">{i + 1}.</span>}
                <input
                  type="text"
                  className="flex-1 text-sm border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none transition-colors py-1"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(question.options || [])];
                    newOpts[i] = e.target.value;
                    updateQuestion(question.id, 'options', newOpts);
                  }}
                  placeholder={`Option ${i + 1}`}
                />
                <button
                  onClick={() => updateQuestion(question.id, 'options', (question.options || []).filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              {question.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />}
              {question.type === 'checkboxes' && <div className="w-4 h-4 border-2 border-gray-200 rounded flex-shrink-0" />}
              {question.type === 'dropdown' && <span className="text-gray-300 font-mono text-xs w-5 flex-shrink-0">{(question.options || []).length + 1}.</span>}
              <button
                onClick={() => updateQuestion(question.id, 'options', [...(question.options || []), `Option ${(question.options || []).length + 1}`])}
                className="text-sm text-gray-400 hover:text-indigo-600 font-medium transition-colors"
              >
                + Add option
              </button>
            </div>
          </div>
        )}

        {['short_answer', 'paragraph'].includes(question.type) && (
          <div className="border-b border-dashed border-gray-200 w-1/2 py-2 text-gray-400 text-sm">
            {question.type === 'short_answer' ? 'Short answer text' : 'Long answer text'}
          </div>
        )}

        {question.type === 'linear_scale' && (
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span>1</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <span>5</span>
          </div>
        )}

        {['date', 'time'].includes(question.type) && (
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 text-xs font-mono uppercase tracking-widest text-center">
            {question.type} input
          </div>
        )}

        {question.type === 'file_upload' && (
          <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <span className="text-sm font-medium text-gray-500">Respondents will upload a file here</span>
            <span className="text-xs text-gray-400">Max size: 10MB</span>
          </div>
        )}

        {question.type === 'categorize' && (
          <CategorizeEditor question={question} updateQuestion={updateQuestion} />
        )}

        {question.type === 'cloze' && (
          <ClozeEditor question={question} updateQuestion={updateQuestion} />
        )}

        {question.type === 'comprehension' && (
          <ComprehensionEditor question={question} updateQuestion={updateQuestion} />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center">
        {/* Left: Logic + Validation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogic(v => !v)}
            title="Conditional Logic"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              showLogic || hasLogic
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent'
            }`}
          >
            <GitBranch size={13} />
            Logic
            {hasLogic && (
              <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {question.logic.length}
              </span>
            )}
          </button>

          {isTextType && (
            <button
              onClick={() => setShowValidation(v => !v)}
              title="Validation Rules"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                showValidation || hasValidation
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent'
              }`}
            >
              <ShieldCheck size={13} />
              Validation
              {hasValidation && (
                <span className="ml-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">✓</span>
              )}
            </button>
          )}
        </div>

        {/* Right: Duplicate, Delete, Required */}
        <div className="flex items-center gap-3 text-gray-400">
          <button onClick={handleDuplicate} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Duplicate">
            <Copy size={16} />
          </button>
          <button onClick={() => removeQuestion(question.id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Required</span>
            <button
              type="button"
              onClick={() => updateQuestion(question.id, 'required', !question.required)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${question.required ? 'bg-indigo-600' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={question.required}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${question.required ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Validation panel */}
      {showValidation && isTextType && (
        <div className="mt-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Validation Rules</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Length</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                value={validation.minLength || ''}
                onChange={e => updateValidation('minLength', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Length</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                value={validation.maxLength || ''}
                onChange={e => updateValidation('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Regex Pattern <span className="font-normal text-gray-400">(optional)</span></label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-emerald-400 bg-white"
              value={validation.pattern || ''}
              onChange={e => updateValidation('pattern', e.target.value || undefined)}
              placeholder="e.g. ^[0-9]+$"
            />
          </div>
          {validation.pattern && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Error Message <span className="font-normal text-gray-400">(shown if pattern fails)</span></label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                value={validation.patternError || ''}
                onChange={e => updateValidation('patternError', e.target.value || undefined)}
                placeholder="e.g. Please enter numbers only."
              />
            </div>
          )}
        </div>
      )}

      {/* Logic panel (toggled) */}
      {showLogic && (
        <LogicPanel question={question} onClose={() => setShowLogic(false)} />
      )}
    </div>
  );
};

export default QuestionCard;
