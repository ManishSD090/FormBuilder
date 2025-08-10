import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:5000";

const FormViewer = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`);
        if (!res.ok) {
          throw new Error('Form not found or could not be loaded.');
        }
        const data = await res.json();
        setForm(data);
        console.log("Fetched Form Data:", data);
      console.log("Questions in Form:", data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  
  // FIX: Separated the logic for each question type as you suggested.
  const handleInputChange = (questionId, questionType, value, subId = null) => {
  setAnswers(prevAnswers => {
    const newAnswers = { ...prevAnswers };

    if (questionType === 'comprehension_sub') {
      newAnswers[subId] = {
        questionId: subId,
        questionType: questionType,
        answer: value,
      };
    } else if (questionType === 'categorize') {
      // Use the questionId directly and ensure it's always included.
      const currentAnswerObject = newAnswers[questionId]?.answer || {};
      const updatedAnswerObject = { ...currentAnswerObject, [subId]: value };

      newAnswers[questionId] = {
        questionId: questionId, // Explicitly set questionId here
        questionType: questionType,
        answer: updatedAnswerObject,
      };
    } else {
      // For other types like cloze, a simple key-value pair is enough.
      newAnswers[questionId] = {
        questionId: questionId, // Explicitly set questionId here as well
        questionType: questionType,
        answer: value,
      };
    }

    return newAnswers;
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responsePayload = {
          formId,
          userEmail,
          answers: Object.values(answers),
        };

        console.log("Payload being sent:", responsePayload);
      const res = await fetch(`${API_BASE_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit response.');
      }

      alert('Thank you! Your response has been submitted.');
      navigate('/dashboard');

    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center p-10">Loading form...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!form) return <div className="text-center p-10">Form not found.</div>;

  const renderQuestion = (question) => {
  const { _id, type, categories, items, text, passage, subQuestions } = question;
  console.log("Rendering question:", { _id, type, question });

    switch (type) {
      case 'categorize':
        return (
            <div className="space-y-3">
                {items?.map((item, index) => (
                    <div key={item || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-800">{item}</span>
                        <select 
                            className="border border-gray-300 rounded-md px-3 py-2"
                            onChange={(e) => handleInputChange(_id, 'categorize', e.target.value, item)}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a category</option>
                            {categories?.map((cat, catIndex) => (
                                <option key={cat || catIndex} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                ))}
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
                className="inline-block w-40 mx-1 px-2 py-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-blue-50 rounded-t-md"
                onChange={(e) => {
                  setAnswers(prevAnswers => {
                    const currentAnswer = prevAnswers[_id] || { questionId: _id, questionType: type, answer: {} };
                    const updatedAnswer = {
                      ...currentAnswer,
                      answer: {
                        ...currentAnswer.answer,
                        [index]: e.target.value
                      }
                    };
                    return {
                      ...prevAnswers,
                      [_id]: updatedAnswer,
                    };
                  });
                }}
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
              <div key={subQ._id || subQ.id || index} className="mb-4">
                <label className="block font-medium mb-2">{subQ.question}</label>
                <textarea
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                  rows="3"
                  placeholder="Your answer..."
                  onChange={(e) => handleInputChange(_id, 'comprehension_sub', e.target.value, subQ._id || subQ.id)}
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
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {form.headerImage && (
          <img src={`${API_BASE_URL}${form.headerImage}`} alt="Form Header" className="w-full h-48 object-cover rounded-t-lg mb-6" />
        )}
        <h1 className="text-4xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-8">{form.description}</p>

        <div className="bg-white p-6 mb-4 border border-gray-200 rounded-lg">
            <label className="block text-xl font-semibold mb-2">Email</label>
            <input 
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                required 
            />
        </div>

        {Array.isArray(form.questions) && form.questions.map((q, index) => (
          <div key={q._id || index} className="bg-white p-6 mb-4 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-1">{index + 1}. {q.title}</h3>
            {q.description && <p className="text-gray-500 mb-4">{q.description}</p>}
            {q.image && <img src={`${API_BASE_URL}${q.image}`} alt="Question visual" className="w-full max-w-sm mx-auto rounded-lg mb-4" />}
            {renderQuestion(q)}
          </div>
        ))}

        <button type="submit" className="w-full mt-6 bg-blue-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors text-lg">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormViewer;
