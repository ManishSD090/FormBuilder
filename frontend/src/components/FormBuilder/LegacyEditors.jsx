import React from 'react';
import { Plus, Trash2, Tag, Brackets } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   CategorizeEditor
   Lets the user manage category labels and items to categorize.
────────────────────────────────────────────────────────────── */
export const CategorizeEditor = ({ question, updateQuestion }) => {
  const categories = question.categories || [];
  const items = question.items || [];

  const addCategory = () => updateQuestion(question.id, 'categories', [...categories, `Category ${categories.length + 1}`]);
  const updateCategory = (i, val) => {
    const next = [...categories]; next[i] = val;
    updateQuestion(question.id, 'categories', next);
  };
  const removeCategory = (i) => updateQuestion(question.id, 'categories', categories.filter((_, idx) => idx !== i));

  const addItem = () => updateQuestion(question.id, 'items', [...items, `Item ${items.length + 1}`]);
  const updateItem = (i, val) => {
    const next = [...items]; next[i] = val;
    updateQuestion(question.id, 'items', next);
  };
  const removeItem = (i) => updateQuestion(question.id, 'items', items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      {/* Categories */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Tag size={11} /> Categories
        </p>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input
                type="text"
                className="flex-1 text-sm border-b border-gray-200 hover:border-gray-400 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
                value={cat}
                onChange={e => updateCategory(i, e.target.value)}
                placeholder={`Category ${i + 1}`}
              />
              <button onClick={() => removeCategory(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addCategory} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <Plus size={13} /> Add category
        </button>
      </div>

      {/* Items */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Items to Categorize</p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input
                type="text"
                className="flex-1 text-sm border-b border-gray-200 hover:border-gray-400 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
                value={item}
                onChange={e => updateItem(i, e.target.value)}
                placeholder={`Item ${i + 1}`}
              />
              <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          <Plus size={13} /> Add item
        </button>
      </div>

      {/* Preview */}
      {categories.length > 0 && items.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-mono">Preview</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-sm">
              <span className="font-medium text-gray-700">{item}</span>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1">
                {categories[0] || 'Category 1'} ▾
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   ClozeEditor
   Lets the user write text and insert [BLANK] placeholders.
────────────────────────────────────────────────────────────── */
export const ClozeEditor = ({ question, updateQuestion }) => {
  const text = question.text || '';
  const parts = text.split(/(\[BLANK\])/g);
  const blankCount = parts.filter(p => p === '[BLANK]').length;

  const insertBlank = () => {
    updateQuestion(question.id, 'text', text + ' [BLANK]');
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Text with Blanks</p>
          <button
            onClick={insertBlank}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Brackets size={12} /> Insert blank
          </button>
        </div>
        <textarea
          className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-all font-mono"
          rows={4}
          value={text}
          onChange={e => updateQuestion(question.id, 'text', e.target.value)}
          placeholder="Type your sentence here and click 'Insert blank' to add fill-in-the-blank placeholders. e.g. The capital of France is [BLANK]."
        />
        <p className="text-xs text-gray-400 mt-1">
          {blankCount} blank{blankCount !== 1 ? 's' : ''} detected. Type <code className="bg-gray-100 px-1 rounded">[BLANK]</code> manually or use the button.
        </p>
      </div>

      {/* Preview */}
      {text && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-mono">Preview</p>
          <p className="text-sm leading-loose text-gray-800">
            {parts.map((part, i) =>
              part === '[BLANK]'
                ? <span key={i} className="inline-block mx-1 px-3 py-0.5 bg-indigo-100 border-b-2 border-indigo-400 rounded text-indigo-500 text-xs font-mono">blank</span>
                : <span key={i}>{part}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   ComprehensionEditor
   Lets the user write a passage and add sub-questions.
────────────────────────────────────────────────────────────── */
export const ComprehensionEditor = ({ question, updateQuestion }) => {
  const passage = question.passage || '';
  const subQuestions = question.subQuestions || [];

  const addSubQuestion = () => {
    updateQuestion(question.id, 'subQuestions', [
      ...subQuestions,
      { id: crypto.randomUUID(), question: '', answer: '' },
    ]);
  };

  const updateSubQuestion = (i, field, val) => {
    const next = subQuestions.map((sq, idx) => idx === i ? { ...sq, [field]: val } : sq);
    updateQuestion(question.id, 'subQuestions', next);
  };

  const removeSubQuestion = (i) => {
    updateQuestion(question.id, 'subQuestions', subQuestions.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-5">
      {/* Passage */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Reading Passage</p>
        <textarea
          className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-all"
          rows={5}
          value={passage}
          onChange={e => updateQuestion(question.id, 'passage', e.target.value)}
          placeholder="Paste or type the reading passage here…"
        />
      </div>

      {/* Sub-questions */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions about the Passage</p>
        <div className="space-y-3">
          {subQuestions.map((sq, i) => (
            <div key={sq.id || sq._id || i} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    className="w-full text-sm border-b border-gray-200 hover:border-gray-400 focus:border-indigo-500 focus:outline-none py-1 transition-colors font-medium"
                    value={sq.question}
                    onChange={e => updateSubQuestion(i, 'question', e.target.value)}
                    placeholder={`Sub-question ${i + 1}`}
                  />
                  <input
                    type="text"
                    className="w-full text-xs text-gray-500 border-b border-dashed border-gray-200 hover:border-gray-400 focus:border-indigo-400 focus:outline-none py-1 transition-colors"
                    value={sq.answer}
                    onChange={e => updateSubQuestion(i, 'answer', e.target.value)}
                    placeholder="Expected answer / marking guide (optional)"
                  />
                </div>
                <button onClick={() => removeSubQuestion(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addSubQuestion} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <Plus size={13} /> Add sub-question
        </button>
      </div>
    </div>
  );
};
