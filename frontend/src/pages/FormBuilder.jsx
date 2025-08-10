import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy, Image as ImageIcon, FileText, X, AlignLeft, List, Type, BarChart2, Save, ArrowLeft } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

// UPDATED: Helper to generate a unique 24-character hexadecimal ID string
// This is compatible with MongoDB's ObjectId casting.
const generateUniqueId = () => {
  return Array(24).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Helper component for Image Uploading (no changes needed here)
const ImageUploader = ({ imageUrl, onUpload, onRemove }) => {
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = null; // Clear the input so same file can be selected again
  };

  return (
    <>
      <div
        className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200 cursor-pointer"
        onClick={triggerFileInput}
      >
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Upload preview"
              className="max-h-40 mx-auto rounded-lg object-cover w-full"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-gray-400">
            <div className="text-center">
              <ImageIcon size={24} className="mx-auto mb-2" />
              <div className="text-sm">Add image</div>
              <div className="text-xs">PNG, JPG up to 2MB</div>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};


const FormBuilder = () => {
  const { id: formId } = useParams(); // Get formId from URL for editing
  const navigate = useNavigate();

  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('Form description');
  const [headerImage, setHeaderImage] = useState(null); // Stores URL path from backend or File object
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [questionImagePreviews, setQuestionImagePreviews] = useState({});

  // Effect to load form data if editing (formId exists in URL)
  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Authentication token missing. Please log in.");
            setLoading(false);
            return;
          }
          const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            throw new Error('Form not found or could not be loaded.');
          }
          const data = await res.json();
          setFormTitle(data.title);
          setFormDescription(data.description);
          
          if (data.headerImage) {
            setHeaderImage(data.headerImage);
            setHeaderImagePreview(`${API_BASE_URL}${data.headerImage}`);
          } else {
            setHeaderImage(null);
            setHeaderImagePreview(null);
          }

          setQuestions(data.questions.map(q => {
            const newQ = { ...q };
            // Ensure specific properties are arrays or default values when loading
            if (newQ.type === 'categorize') {
                newQ.categories = Array.isArray(newQ.categories) ? newQ.categories : [];
                newQ.items = Array.isArray(newQ.items) ? newQ.items : [];
            } else if (newQ.type === 'cloze') {
                newQ.text = newQ.text || '';
            } else if (newQ.type === 'comprehension') {
                newQ.passage = newQ.passage || '';
                newQ.subQuestions = Array.isArray(newQ.subQuestions) ? newQ.subQuestions : [];
            }
            // Ensure each question and sub-question has an _id for client-side keying
            newQ._id = newQ._id || generateUniqueId(); // Use generateUniqueId for new client-side IDs
            if (newQ.subQuestions) {
                newQ.subQuestions = newQ.subQuestions.map(subQ => ({
                    ...subQ,
                    _id: subQ._id || generateUniqueId() // Use generateUniqueId for new client-side IDs
                }));
            }
            return newQ;
          }));
          
          const initialQuestionImagePreviews = {};
          data.questions.forEach(q => {
            if (q.image) {
              initialQuestionImagePreviews[q._id] = `${API_BASE_URL}${q.image}`;
            }
          });
          setQuestionImagePreviews(initialQuestionImagePreviews);

        } catch (err) {
          console.error("Error fetching form for edit:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [formId]);

  // Function to add a new question of a specific type
  const handleAddQuestion = (type) => {
    const newQuestion = {
      _id: generateUniqueId(), // Use generateUniqueId
      type: type,
      title: `New ${type} Question`,
      description: '',
      image: null,
    };

    if (type === 'categorize') {
      newQuestion.categories = ['Category 1', 'Category 2'];
      newQuestion.items = ['Item 1', 'Item 2'];
    } else if (type === 'cloze') {
      newQuestion.text = 'This is a [BLANK] question.';
    } else if (type === 'comprehension') {
      newQuestion.passage = 'This is a sample passage for comprehension.';
      newQuestion.subQuestions = [{
        _id: generateUniqueId(), // Use generateUniqueId
        question: 'What is the main idea?',
        answer: ''
      }];
    }
    setQuestions([...questions, newQuestion]);
  };

  // Function to update a field of a question
  const handleQuestionChange = (_id, field, value) => {
    setQuestions(questions.map(q => {
        if (q._id === _id) {
            const updatedQ = { ...q, [field]: value };
            // Special handling for type change to reset/initialize specific fields
            if (field === 'type' && q.type !== value) {
                if (value === 'categorize') {
                    updatedQ.categories = Array.isArray(q.categories) ? q.categories : ['Category 1', 'Category 2'];
                    updatedQ.items = Array.isArray(q.items) ? q.items : ['Item 1', 'Item 2'];
                    updatedQ.text = undefined; // Clear other type-specific fields
                    updatedQ.passage = undefined;
                    updatedQ.subQuestions = undefined;
                } else if (value === 'cloze') {
                    updatedQ.text = q.text || 'This is a [BLANK] question.';
                    updatedQ.categories = undefined;
                    updatedQ.items = undefined;
                    updatedQ.passage = undefined;
                    updatedQ.subQuestions = undefined;
                } else if (value === 'comprehension') {
                    updatedQ.passage = q.passage || 'This is a sample passage for comprehension.';
                    updatedQ.subQuestions = Array.isArray(q.subQuestions) ? q.subQuestions : [{ _id: generateUniqueId(), question: 'What is the main idea?', answer: '' }];
                    updatedQ.categories = undefined;
                    updatedQ.items = undefined;
                    updatedQ.text = undefined;
                }
            }
            return updatedQ;
        }
        return q;
    }));
  };

  // Function to update a field of a sub-question within a comprehension question
  const handleSubQuestionChange = (qId, subQId, field, value) => {
    setQuestions(questions.map(q => {
      if (q._id === qId && Array.isArray(q.subQuestions)) {
        return {
          ...q,
          subQuestions: q.subQuestions.map(subQ =>
            subQ._id === subQId ? { ...subQ, [field]: value } : subQ
          )
        };
      }
      return q;
    }));
  };

  // Function to add a new sub-question to a comprehension question
  const handleAddSubQuestion = (qId) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
        const currentSubQuestions = Array.isArray(q.subQuestions) ? [...q.subQuestions] : [];
        return {
          ...q,
          subQuestions: [
            ...currentSubQuestions,
            { _id: generateUniqueId(), question: `Sub-question ${currentSubQuestions.length + 1}`, answer: '' }
          ]
        };
      }
      return q;
    }));
  };

  // Function to remove a sub-question from a comprehension question
  const handleRemoveSubQuestion = (qId, subQId) => {
    setQuestions(questions.map(q => {
      if (q._id === qId && Array.isArray(q.subQuestions)) {
        return {
          ...q,
          subQuestions: q.subQuestions.filter(subQ => subQ._id !== subQId)
        };
      }
      return q;
    }));
  };

  // Function to remove a main question
  const handleRemoveQuestion = (_id) => {
    setQuestions(questions.filter(q => q._id !== _id));
  };

  // Function to duplicate a question
  const handleDuplicateQuestion = (_id) => {
    const questionToDuplicate = questions.find(q => q._id === _id);
    if (questionToDuplicate) {
      const newDuplicatedQuestion = {
        ...questionToDuplicate,
        _id: generateUniqueId(), // Use generateUniqueId
        subQuestions: questionToDuplicate.subQuestions ? questionToDuplicate.subQuestions.map(sq => ({ ...sq, _id: generateUniqueId() })) : undefined,
        image: questionToDuplicate.image instanceof File ? null : questionToDuplicate.image
      };
      
      const index = questions.findIndex(q => q._id === _id);
      const newQuestionsArray = [...questions];
      newQuestionsArray.splice(index + 1, 0, newDuplicatedQuestion);
      setQuestions(newQuestionsArray);

      if (questionImagePreviews[questionToDuplicate._id]) {
        setQuestionImagePreviews(prev => ({
          ...prev,
          [newDuplicatedQuestion._id]: questionImagePreviews[questionToDuplicate._id]
        }));
      }
    }
  };

  // Generic image upload handler (for both header and question images)
  const handleImageUpload = async (file) => {
    if (!file) return null;
    setIsSaving(true); // Temporarily use isSaving to indicate upload in progress

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/forms/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Image upload failed.');
      }

      const data = await res.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Image upload failed: ${error.message}`);
      return null;
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  // Main form submission handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing. Please log in.");
      }

      let finalHeaderImage = headerImage;
      if (headerImage instanceof File) {
        finalHeaderImage = await handleImageUpload(headerImage);
        if (finalHeaderImage === null) throw new Error("Failed to upload header image.");
      }

      const questionsWithUploadedImages = await Promise.all(
        questions.map(async (q) => {
          let finalQuestionImage = q.image;
          if (q.image instanceof File) { // If it's a new File object
            finalQuestionImage = await handleImageUpload(q.image);
            if (finalQuestionImage === null) throw new Error(`Failed to upload image for question ${q.title}.`);
          }
          return { ...q, image: finalQuestionImage };
        })
      );

      const formPayload = {
        title: formTitle,
        description: formDescription,
        headerImage: finalHeaderImage,
        questions: questionsWithUploadedImages,
      };

      let res;
      if (formId) {
        // Update existing form (PUT request)
        res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formPayload),
        });
      } else {
        // Create new form (POST request)
        res = await fetch(`${API_BASE_URL}/api/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formPayload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save form.');
      }

      const savedForm = await res.json();
      setSaveMessage('Form saved successfully!');
      if (!formId) {
        navigate(`/formbuilder/${savedForm._id}`);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Renders specific input fields based on question type
  const renderQuestionSpecificFields = (question) => {
    const onQuestionImageUpload = async (file) => {
      const imageUrlPath = await handleImageUpload(file);
      if (imageUrlPath) {
        handleQuestionChange(question._id, "image", imageUrlPath);
        setQuestionImagePreviews(prev => ({ ...prev, [question._id]: `${API_BASE_URL}${imageUrlPath}` }));
      }
    };

    const onQuestionImageRemove = () => {
      handleQuestionChange(question._id, "image", null);
      setQuestionImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[question._id];
        return newPreviews;
      });
    };

    const safeSubQuestions = Array.isArray(question.subQuestions) ? question.subQuestions : []; 
    const safeCategories = Array.isArray(question.categories) ? question.categories : [];
    const safeItems = Array.isArray(question.items) ? question.items : [];

    switch (question.type) {
      case 'categorize':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Question Image</label>
            <ImageUploader
              imageUrl={questionImagePreviews[question._id]}
              onUpload={onQuestionImageUpload}
              onRemove={onQuestionImageRemove}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories (comma-separated)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={safeCategories.join(', ')}
                onChange={(e) => handleQuestionChange(question._id, 'categories', e.target.value.split(',').map(s => s.trim()))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items (comma-separated)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={safeItems.join(', ')}
                onChange={(e) => handleQuestionChange(question._id, 'items', e.target.value.split(',').map(s => s.trim()))}
              />
            </div>
          </div>
        );
      case 'cloze':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Question Image</label>
            <ImageUploader
              imageUrl={questionImagePreviews[question._id]}
              onUpload={onQuestionImageUpload}
              onRemove={onQuestionImageRemove}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Text with [BLANK] markers</label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none"
                value={question.text || ''}
                onChange={(e) => handleQuestionChange(question._id, "text", e.target.value)}
                placeholder="e.g., The capital of France is [BLANK]."
              ></textarea>
            </div>
          </div>
        );
      case 'comprehension':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Question Image</label>
            <ImageUploader
              imageUrl={questionImagePreviews[question._id]}
              onUpload={onQuestionImageUpload}
              onRemove={onQuestionImageRemove}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passage</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="6"
                value={question.passage || ''}
                onChange={(e) => handleQuestionChange(question._id, "passage", e.target.value)}
              ></textarea>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-800 mt-4">Sub-Questions:</h4>
              {safeSubQuestions.map((subQ, subQIndex) => (
                <div key={subQ._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md mb-2">
                  <input
                    type="text"
                    className="flex-grow p-1 border rounded-md text-sm"
                    value={subQ.question || ''}
                    onChange={(e) => handleSubQuestionChange(question._id, subQ._id, 'question', e.target.value)}
                    placeholder={`Sub-question ${subQIndex + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubQuestion(question._id, subQ._id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                    title="Remove sub-question"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddSubQuestion(question._id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Sub-Question
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-700">Loading form for editing...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{formId ? 'Edit Form' : 'Create New Form'}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Header Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <label className="block text-lg font-semibold text-gray-800 mb-2">Form Title</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-300"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
            <label className="block text-lg font-semibold text-gray-800 mt-4 mb-2">Form Description</label>
            <textarea
              className="w-full p-3 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-300"
              rows="3"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            ></textarea>

            <label className="block text-lg font-semibold text-gray-800 mt-4 mb-2">Header Image</label>
            <ImageUploader
              imageUrl={headerImagePreview}
              onUpload={async (file) => {
                const imageUrlPath = await handleImageUpload(file);
                if (imageUrlPath) {
                  setHeaderImage(imageUrlPath); // Store backend path
                  setHeaderImagePreview(`${API_BASE_URL}${imageUrlPath}`); // Set full URL for preview
                }
              }}
              onRemove={() => { setHeaderImage(null); setHeaderImagePreview(null); }}
            />
          </div>

          {/* Questions Section */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions</h2>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
              No questions added yet. Use the buttons below to add your first question.
            </div>
          ) : (
            questions.map((question) => (
              <div key={question._id} className="bg-white p-6 mb-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Question {questions.findIndex(q => q._id === question._id) + 1}</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(question._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                      title="Duplicate question"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(question._id)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full"
                      title="Remove question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full p-2 border rounded-md mb-4"
                  value={question.type}
                  onChange={(e) => handleQuestionChange(question._id, 'type', e.target.value)}
                >
                  <option value="categorize">Categorize</option>
                  <option value="cloze">Cloze</option>
                  <option value="comprehension">Comprehension</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-4"
                  value={question.title || ''}
                  onChange={(e) => handleQuestionChange(question._id, 'title', e.target.value)}
                  required
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Question Description</label>
                <textarea
                  className="w-full p-2 border rounded-md mb-4"
                  rows="2"
                  value={question.description || ''}
                  onChange={(e) => handleQuestionChange(question._id, 'description', e.target.value)}
                  placeholder="Optional description for the question"
                ></textarea>

                {renderQuestionSpecificFields(question)}
              </div>
            ))
          )}

          <div className="flex justify-center space-x-4 mb-8">
            <button
              type="button"
              onClick={() => handleAddQuestion('categorize')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <List className="w-5 h-5 mr-2" /> Add Categorize
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('cloze')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
            >
              <Type className="w-5 h-5 mr-2" /> Add Cloze
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('comprehension')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <BarChart2 className="w-5 h-5 mr-2" /> Add Comprehension
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors text-lg flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {formId ? (isSaving ? 'Updating...' : 'Update Form') : (isSaving ? 'Creating...' : 'Create Form')}
          </button>
          {saveMessage && (
            <p className={`mt-4 text-center ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{saveMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormBuilder;
