import React, { useState } from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import QuestionCard from './QuestionCard';
import SectionCard from './SectionCard';
import SettingsPanel from './SettingsPanel';
import { ArrowLeft, Save, PlusCircle, Layers, Settings2, ListChecks, Loader2, CheckCircle2, Eye, Image, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const TABS = [
  { id: 'questions', label: 'Questions', icon: ListChecks },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

const FormBuilderCore = ({ isSaving, onSave, autosaveStatus }) => {
  const { form, updateFormMetadata, addQuestion, reorderQuestions, addSection } = useFormBuilder();
  const navigate = useNavigate();
  const { id: formId } = useParams();
  const [activeTab, setActiveTab] = useState('questions');
  const [headerUploading, setHeaderUploading] = useState(false);

  const handleHeaderImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeaderUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) updateFormMetadata('headerImage', data.url);
    } catch { /* silently fail */ }
    finally { setHeaderUploading(false); }
  };

  const theme = form.settings?.theme || {};
  const primaryColor = theme.primaryColor || '#4F46E5';
  const fontFamily = theme.fontFamily || 'Inter, sans-serif';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.questions.findIndex((q) => q.id === active.id);
      const newIndex = form.questions.findIndex((q) => q.id === over.id);
      reorderQuestions(oldIndex, newIndex);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#f3f4f6', fontFamily }}>
      <div className="max-w-4xl mx-auto">

        {/* Top Nav Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            <ArrowLeft size={18} /> Dashboard
          </button>

          {/* Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Autosave + Preview + Save */}
          <div className="flex items-center gap-3">
            {autosaveStatus === 'saving' && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Saving…
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
            {formId && (
              <button
                type="button"
                onClick={() => window.open(`/preview/${formId}`, '_blank')}
                className="flex items-center gap-2 text-gray-600 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Eye size={15} /> Preview
              </button>
            )}
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Form Header Card (always visible) */}
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
          style={{ borderTopColor: primaryColor, borderTopWidth: 8 }}
        >
          {/* Header Image area */}
          <div className="relative group/header">
            {form.headerImage ? (
              <>
                <img src={form.headerImage} alt="Form header" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover/header:bg-black/25 transition-all flex items-center justify-center gap-3 opacity-0 group-hover/header:opacity-100">
                  <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all">
                    {headerUploading ? <Loader2 size={13} className="animate-spin" /> : <Image size={13} />}
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeaderImageUpload} disabled={headerUploading} />
                  </label>
                  <button
                    onClick={() => updateFormMetadata('headerImage', '')}
                    className="bg-white/90 hover:bg-red-50 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="flex items-center justify-center w-full h-16 cursor-pointer bg-gray-50 hover:bg-gray-100 border-b border-gray-100 transition-all group/uplabel">
                <div className="flex items-center gap-2 text-gray-400 group-hover/uplabel:text-gray-600 transition-colors">
                  {headerUploading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Image size={16} />}
                  <span className="text-xs font-medium">{headerUploading ? 'Uploading…' : 'Add header image'}</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleHeaderImageUpload} disabled={headerUploading} />
              </label>
            )}
          </div>

          <div className="px-8 py-6">
            <input
              type="text"
              className="w-full text-3xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none pb-2 transition-colors"
              value={form.title}
              onChange={(e) => updateFormMetadata('title', e.target.value)}
              placeholder="Form Title"
            />
            <textarea
              className="w-full text-gray-500 mt-3 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none resize-none transition-colors text-sm"
              rows={2}
              value={form.description}
              onChange={(e) => updateFormMetadata('description', e.target.value)}
              placeholder="Form description (optional)"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'questions' ? (
          <>
            {/* Sections + DnD */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {form.sections.map((section) => {
                const sectionQuestions = form.questions.filter((q) => q.sectionId === section.id);
                return (
                  <SectionCard key={section.id} section={section}>
                    <SortableContext items={sectionQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {sectionQuestions.map((question, index) => (
                          <QuestionCard key={question.id} question={question} index={index} primaryColor={primaryColor} />
                        ))}
                        {sectionQuestions.length === 0 && (
                          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl text-sm">
                            Click <strong>+ Add Question</strong> to add to this section.
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </SectionCard>
                );
              })}
            </DndContext>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-10 right-10 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => addQuestion('multiple_choice')}
                title="Add Question"
                className="text-white p-4 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
                style={{ backgroundColor: primaryColor }}
              >
                <PlusCircle className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-semibold text-sm">
                  Add Question
                </span>
              </button>
              <button
                type="button"
                onClick={addSection}
                title="Add Section"
                className="bg-white border border-gray-200 text-gray-700 p-4 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
              >
                <Layers className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-semibold text-sm text-gray-700">
                  Add Section
                </span>
              </button>
            </div>
          </>
        ) : (
          <SettingsPanel />
        )}
      </div>
    </div>
  );
};

export default FormBuilderCore;
