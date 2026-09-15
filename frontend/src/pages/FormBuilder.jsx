import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormBuilderProvider, useFormBuilder } from '../context/FormBuilderContext';
import FormBuilderCore from '../components/FormBuilder/FormBuilderCore';

const API = import.meta.env.VITE_API_URL;

// This component handles the data fetching and saving, then renders the UI Core
const FormBuilderContainer = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const { form, setForm } = useFormBuilder();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  useEffect(() => {
    if (!formId) {
      const templateRaw = sessionStorage.getItem('formTemplate');
      if (templateRaw) {
        try {
          const template = JSON.parse(templateRaw);
          setForm(template);
          sessionStorage.removeItem('formTemplate'); // Clear it so refresh doesn't reuse it
        } catch (e) {
          console.error("Failed to parse template", e);
        }
      }
      setLoading(false);
      return;
    }
    
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing. Please log in.");
        
        const res = await fetch(`${API}/api/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Form not found or could not be loaded.');
        
        const data = await res.json();
        
        // Map data to context schema
        const mappedQuestions = data.questions.map(q => ({
          id: q._id,
          type: q.type,
          title: q.title || '',
          description: q.description || '',
          required: q.required || false,
          options: q.options || [],
          sectionId: q.sectionId || 'default-section',
          logic: q.logic || [],       // ← preserve conditional rules
          // Preserve legacy fields
          categories: q.categories,
          items: q.items,
          text: q.text,
          passage: q.passage,
          subQuestions: q.subQuestions,
          image: q.image
        }));

        setForm({
          title: data.title,
          description: data.description || '',
          headerImage: data.headerImage || null,
          settings: data.settings || {},
          sections: data.sections?.length > 0 ? data.sections : [{ id: 'default-section', title: 'Section 1', description: '', order: 0 }],
          questions: mappedQuestions,
        });
        
      } catch (err) {
        console.error("Error fetching form:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [formId, setForm]);

  // AUTOSAVE LOGIC
  useEffect(() => {
    if (loading || !formId) return;

    setAutosaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const formPayload = {
          title: form.title,
          description: form.description,
          settings: form.settings,
          sections: form.sections,
          questions: form.questions.map(q => ({ ...q, _id: q.id })),
        };

        await fetch(`${API}/api/forms/${formId}/autosave`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formPayload),
        });
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 3000);
      } catch (err) {
        console.error("Autosave failed", err);
        setAutosaveStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [form, formId, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      // Map back to backend expected structure if needed
      const formPayload = {
        title: form.title,
        description: form.description,
        headerImage: form.headerImage,
        settings: form.settings,
        sections: form.sections,
        questions: form.questions.map(q => ({
          ...q,
          _id: q.id // Map frontend id back to _id if required by backend, though backend usually ignores or creates new if missing
        })),
      };

      const url = formId ? `${API}/api/forms/${formId}` : `${API}/api/forms`;
      const method = formId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save form.');
      }

      const savedForm = await res.json();
      if (!formId) {
        navigate(`/formbuilder/${savedForm._id}`);
      } else {
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-700">Loading form...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return <FormBuilderCore isSaving={isSaving} onSave={handleSave} autosaveStatus={autosaveStatus} />;
};

const FormBuilder = () => {
  return (
    <FormBuilderProvider>
      <FormBuilderContainer />
    </FormBuilderProvider>
  );
};

export default FormBuilder;
