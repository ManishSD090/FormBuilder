import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const SingleResponsePreview = () => {
  const { id: responseId } = useParams(); // Get the response ID from the URL
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is needed for protected route
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/responses/${responseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch response.');
        }

        const data = await res.json();
        setResponse(data);
        console.log("Fetched Single Response Data:", data); // Debugging: Check the fetched data
      } catch (err) {
        console.error("Error fetching single response:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [responseId]); // Re-fetch if responseId changes

  if (loading) return <div className="text-center p-10 text-gray-700">Loading response preview...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  // Ensure both response and response.formId are available before proceeding
  if (!response || !response.formId) return <div className="text-center p-10 text-gray-600">Response or associated form not found.</div>;

  const form = response.formId; // The populated form object from the backend
  const userAnswers = response.answers; // The array of submitted answers

  // Helper function to find an answer for a given question ID from the user's submitted answers
  const getAnswerForQuestion = (questionId) => {
    return userAnswers.find(answer => answer.questionId === questionId);
  };

  // Renders each question type with the user's submitted answer
  const renderQuestion = (question) => {
    const { _id, type, title, description, image, categories, items, text, passage, subQuestions } = question;
    const submittedAnswer = getAnswerForQuestion(_id); // Get the answer for this specific question

    switch (type) {
      case 'categorize':
        const categorizedAnswer = submittedAnswer?.answer || {}; // Categorize answer is an object { 'item': 'category' }
        return (
          <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Categories:</p>
            <ul className="list-disc list-inside mb-4">
              {categories?.map(cat => <li key={cat}>{cat}</li>)}
            </ul>
            <p className="font-semibold mb-2">Items Categorized:</p>
            <div className="space-y-2">
              {items?.map((item, index) => (
                <div key={item || index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-sm">
                  <span className="font-medium text-gray-800">{item}:</span>
                  <span className="text-blue-700 font-semibold">{categorizedAnswer[item] || 'Not answered'}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cloze':
        const clozeParts = text ? text.split(/(\[BLANK\])/g) : [];
        const clozeAnswer = submittedAnswer?.answer || {}; // Cloze answer is an object { index: value }
        return (
          <div className="leading-loose text-lg">
            {clozeParts.map((part, index) =>
              part === '[BLANK]' ? (
                <span
                  key={index}
                  className="inline-block w-40 mx-1 px-2 py-1 border-b-2 border-blue-500 bg-blue-50 rounded-t-md font-medium text-blue-800"
                >
                  {clozeAnswer[index] || '______'} {/* Display the submitted blank answer */}
                </span>
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
            {subQuestions?.map((subQ, index) => {
              // For comprehension_sub, the questionId in the response is the subQ._id
              const subQuestionAnswer = userAnswers.find(ans => ans.questionId === subQ._id)?.answer;
              return (
                <div key={subQ._id || subQ.id || index} className="mb-4">
                  <label className="block font-medium mb-2">{subQ.question}</label>
                  <textarea
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-800"
                    rows="3"
                    value={subQuestionAnswer || 'Not answered'} // Display the submitted answer
                    readOnly // Make it read-only
                  ></textarea>
                </div>
              );
            })}
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported question type: {type}</div>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 font-inter">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">{form.title}</h1>
        <p className="text-gray-600 mb-2">{form.description}</p>
        <p className="text-sm text-gray-500 mb-8">Submitted by: <span className="font-semibold">{response.userEmail || 'N/A'}</span> on {new Date(response.createdAt).toLocaleDateString()}</p>

        {form.headerImage && (
          <img src={`${API_BASE_URL}${form.headerImage}`} alt="Form Header" className="w-full h-48 object-cover rounded-t-lg mb-6" />
        )}

        {Array.isArray(form.questions) && form.questions.map((q, index) => (
          <div key={q._id} className="bg-white p-6 mb-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-1 text-gray-900">{index + 1}. {q.title}</h3>
            {q.description && <p className="text-gray-500 mb-4">{q.description}</p>}
            {q.image && <img src={`${API_BASE_URL}${q.image}`} alt="Question visual" className="w-full max-w-sm mx-auto rounded-lg mb-4" />}
            {renderQuestion(q)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleResponsePreview;
