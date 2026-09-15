import React from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { Trash2 } from 'lucide-react';

const SectionCard = ({ section, children }) => {
  const { updateSection, removeSection, activeSectionId, setActiveSectionId, form } = useFormBuilder();

  const isActive = activeSectionId === section.id;

  return (
    <div 
      className={`mb-8 border-2 rounded-xl transition-all ${isActive ? 'border-blue-500 shadow-md' : 'border-gray-200 shadow-sm opacity-80'}`}
      onClick={() => setActiveSectionId(section.id)}
    >
      <div className={`p-6 rounded-t-xl ${isActive ? 'bg-blue-50' : 'bg-gray-50'} flex justify-between items-start`}>
        <div className="flex-1 mr-4 space-y-3">
          <input 
            type="text" 
            className="w-full text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-1 transition-colors" 
            value={section.title} 
            onChange={(e) => updateSection(section.id, 'title', e.target.value)} 
            placeholder="Section Title"
          />
          <input 
            type="text" 
            className="w-full text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-1 transition-colors" 
            value={section.description} 
            onChange={(e) => updateSection(section.id, 'description', e.target.value)} 
            placeholder="Section Description (optional)"
          />
        </div>
        
        {form.sections.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} 
            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
            title="Delete Section"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="p-4 bg-gray-100">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
