import React, { createContext, useContext, useState, useCallback } from 'react';

const FormBuilderContext = createContext(null);

export const FormBuilderProvider = ({ children }) => {
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: '',
    headerImage: null,
    settings: {},
    sections: [{ id: 'default-section', title: 'Section 1', description: '', order: 0 }],
    questions: [],
  });

  const [activeSectionId, setActiveSectionId] = useState('default-section');

  const updateFormMetadata = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const addQuestion = useCallback((type, sectionId = activeSectionId) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      type,
      title: 'New Question',
      description: '',
      required: false,
      options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? ['Option 1'] : [],
      sectionId,
      logic: [],
    };
    setForm(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  }, [activeSectionId]);

  const updateQuestion = useCallback((id, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  }, []);

  // Convenience helper for updating the logic rules array on a question
  const updateQuestionLogic = useCallback((id, rules) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, logic: rules } : q)
    }));
  }, []);

  const removeQuestion = useCallback((id) => {
    setForm(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  }, []);

  const reorderQuestions = useCallback((oldIndex, newIndex) => {
    setForm(prev => {
      const updated = [...prev.questions];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return { ...prev, questions: updated };
    });
  }, []);

  const addSection = useCallback(() => {
    const newSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      description: '',
      order: form.sections.length,
    };
    setForm(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setActiveSectionId(newSection.id);
  }, [form.sections]);

  const updateSection = useCallback((id, field, value) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  }, []);

  const removeSection = useCallback((id) => {
    setForm(prev => {
      const newSections = prev.sections.filter(s => s.id !== id);
      if (activeSectionId === id && newSections.length > 0) {
        setActiveSectionId(newSections[0].id);
      }
      return { ...prev, sections: newSections };
    });
  }, [activeSectionId]);

  return (
    <FormBuilderContext.Provider value={{
      form,
      setForm,
      activeSectionId,
      setActiveSectionId,
      updateFormMetadata,
      addQuestion,
      updateQuestion,
      updateQuestionLogic,
      removeQuestion,
      reorderQuestions,
      addSection,
      updateSection,
      removeSection,
    }}>
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (!context) throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  return context;
};
