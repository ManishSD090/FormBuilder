import React, { useState } from 'react';
import { X, Search, ChevronRight, FileText } from 'lucide-react';
import TEMPLATES from '../../data/templates';

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

const TemplatesModal = ({ onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [hovered, setHovered] = useState(null);

  const filtered = TEMPLATES.filter(t => {
    const matchCat = category === 'All' || t.category === category;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Start from a Template</h2>
            <p className="text-sm text-gray-400 mt-0.5">Choose a template or start with a blank form.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search + Category Filter */}
        <div className="px-6 py-4 border-b border-gray-50 space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Blank form card */}
            <button
              onClick={() => onSelect(null)}
              className="text-left border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl p-5 transition-all group flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <FileText size={18} className="text-gray-400 group-hover:text-indigo-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 group-hover:text-indigo-700">Blank Form</p>
                <p className="text-xs text-gray-400 mt-0.5">Start with an empty form and build from scratch.</p>
              </div>
            </button>

            {filtered.map(template => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                onMouseEnter={() => setHovered(template.id)}
                onMouseLeave={() => setHovered(null)}
                className="text-left border border-gray-100 shadow-sm hover:shadow-md rounded-2xl p-5 transition-all group flex flex-col gap-3 bg-white"
              >
                {/* Color accent bar */}
                <div
                  className="h-1 w-full -mx-0 rounded-t-xl -mt-5 mb-2 rounded-b-none"
                  style={{ backgroundColor: template.color, marginTop: -20, marginLeft: -20, width: 'calc(100% + 40px)', borderRadius: '16px 16px 0 0' }}
                />

                <div className="flex items-start justify-between">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">
                    {template.category}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-sm text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{template.description}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {template.form.questions.length} question{template.form.questions.length !== 1 ? 's' : ''}
                    {template.form.sections.length > 1 ? ` · ${template.form.sections.length} sections` : ''}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold transition-all"
                    style={{ color: hovered === template.id ? template.color : '#9ca3af' }}
                  >
                    Use <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="font-medium">No templates found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
