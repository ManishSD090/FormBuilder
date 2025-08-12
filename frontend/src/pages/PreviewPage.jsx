import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

// This component renders a preview from localStorage. It does not submit.
const PreviewPage = () => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    // Load the form data from localStorage
    const savedPreviewData = localStorage.getItem('formPreview');
    if (savedPreviewData) {
      setForm(JSON.parse(savedPreviewData));
    }

    // Optional: Add a listener to update the preview in real-time if the builder page changes it
    const handleStorageChange = () => {
        const updatedData = localStorage.getItem('formPreview');
        if (updatedData) {
            setForm(JSON.parse(updatedData));
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!form) return <div className="text-center p-10">Loading preview... Or go back to the builder to start editing.</div>;

  const renderQuestion = (question) => {
    const { id, type, title, description, image, categories, items, text, passage, subQuestions } = question;

    switch (type) {
      case 'categorize':
        return (
            <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Categories:</p>
                <ul className="list-disc list-inside mb-2">
                    {categories?.map(cat => <li key={cat}>{cat}</li>)}
                </ul>
                <p className="font-semibold">Items to Categorize:</p>
                <ul className="list-disc list-inside">
                    {items?.map(item => <li key={item}>{item}</li>)}
                </ul>
            </div>
        );

      case 'cloze':
        const parts = text ? text.split(/(\[BLANK\])/g) : [];
        return (
          <div className="leading-loose text-lg">
            {parts.map((part, index) =>
              part === '[BLANK]' ? (
                <input
                  key={index}
                  type="text"
                  disabled
                  className="inline-block w-40 mx-1 px-2 py-1 border-b-2 border-gray-300 bg-gray-200 rounded-t-md cursor-not-allowed"
                />
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </div>
        );

      case 'comprehension':
        return (
          <div>
            {passage && <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg mb-6">{passage}</p>}
            {subQuestions?.map((subQ, index) => (
              <div key={subQ.id || index} className="mb-4">
                <label className="block font-medium mb-2">{subQ.question}</label>
                <textarea
                  className="w-full p-2 border rounded-md bg-gray-200 cursor-not-allowed"
                  rows="3"
                  placeholder="Your answer..."
                  disabled
                ></textarea>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {form.headerImage && (
          <img src={form.headerImage} alt="Form Header" className="w-full h-48 object-cover rounded-t-lg mb-6" />
        )}
        <h1 className="text-4xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-8">{form.description}</p>

        {Array.isArray(form.questions) && form.questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 mb-4 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-1">{index + 1}. {q.title}</h3>
            {q.description && <p className="text-gray-500 mb-4">{q.description}</p>}
            {q.image && <img src={q.image} alt="Question visual" className="w-full max-w-sm mx-auto rounded-lg mb-4" />}
            {renderQuestion(q)}
          </div>
        ))}
        
        <div className="w-full mt-6 bg-gray-400 text-white font-bold py-3 px-4 rounded-lg text-center cursor-not-allowed">
          Submit (Disabled in Preview)
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
