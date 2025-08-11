import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy, Image as ImageIcon, X, List, Type, BarChart2, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios'; // Ensure axios is imported

const API_BASE_URL = 'http://localhost:5000';

// This is a self-contained, correct ImageUploader component.
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
    e.target.value = null; // Clear input to allow re-selecting the same file
  };

  return (
    <>
      <div
        className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200 cursor-pointer"
        onClick={triggerFileInput}
      >
        {imageUrl ? (
          <div className="relative">
            <img src={imageUrl} alt="Upload preview" className="max-h-40 mx-auto rounded-lg object-cover w-full" />
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
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
    </>
  );
};

const FormBuilder = () => {
  // --- HOOKS AND STATE ---
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('Form description');
  const [headerImage, setHeaderImage] = useState(null); // Will hold a File object or a URL string
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [questionImagePreviews, setQuestionImagePreviews] = useState({});

  // --- HELPER FUNCTIONS ---
  const generateUniqueId = () => {
    return Array(24).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }
    
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing. Please log in.");
        
        const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Form not found or could not be loaded.');
        
        const data = await res.json();
        setFormTitle(data.title);
        setFormDescription(data.description);
        
        if (data.headerImage) {
          setHeaderImage(data.headerImage);
          // For Cloudinary, the full URL is stored, so no need to prepend API_BASE_URL
          setHeaderImagePreview(data.headerImage);
        }
        
        const questionsWithIds = data.questions.map(q => ({
          ...q,
          _id: q._id || generateUniqueId(),
          subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions.map(sq => ({ ...sq, _id: sq._id || generateUniqueId() })) : [],
        }));
        setQuestions(questionsWithIds);
        
        const initialPreviews = {};
        questionsWithIds.forEach(q => {
          if (q.image) {
            // For Cloudinary, the full URL is stored
            initialPreviews[q._id] = q.image;
          }
        });
        setQuestionImagePreviews(initialPreviews);
        
      } catch (err) {
        console.error("Error fetching form:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [formId]);

  // --- IMAGE UPLOAD LOGIC (UPDATED FOR CLOUDINARY) ---
  const handleImageUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    // IMPORTANT: Replace with your actual Cloudinary upload preset
    formData.append("upload_preset", "custom_form_builder"); 

    try {
      // IMPORTANT: Replace with your actual Cloudinary cloud name
      const res = await fetch(`https://api.cloudinary.com/v1_1/dxevxrf2x/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Cloudinary upload failed.');
      }

      const data = await res.json();
      console.log("✅ Image uploaded successfully to Cloudinary:", data.secure_url);
      return data.secure_url; // Return the full secure URL from Cloudinary
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err);
      alert(`Image Upload Error: ${err.message}`);
      return null;
    }
  };

  // --- FORM HANDLERS ---
  const handleAddQuestion = (type) => {
    const newQuestion = {
      _id: generateUniqueId(),
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
        _id: generateUniqueId(),
        question: 'What is the main idea?',
        answer: ''
      }];
    }
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (_id, field, value) => {
    setQuestions(questions.map(q => (q._id === _id ? { ...q, [field]: value } : q)));
  };

  const handleSubQuestionChange = (qId, subQId, field, value) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
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

  const handleAddSubQuestion = (qId) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
        const newSubQuestion = { _id: generateUniqueId(), question: '', answer: '' };
        return { ...q, subQuestions: [...(q.subQuestions || []), newSubQuestion] };
      }
      return q;
    }));
  };
  
  const handleRemoveSubQuestion = (qId, subQId) => {
    setQuestions(questions.map(q => {
        if (q._id === qId) {
            return { ...q, subQuestions: q.subQuestions.filter(sq => sq._id !== subQId) };
        }
        return q;
    }));
  };

  const handleRemoveQuestion = (_id) => {
    setQuestions(questions.filter(q => q._id !== _id));
  };

  const handleDuplicateQuestion = (_id) => {
    const questionToDuplicate = questions.find(q => q._id === _id);
    if (!questionToDuplicate) return;

    const newQuestion = {
      ...questionToDuplicate,
      _id: generateUniqueId(),
      image: questionToDuplicate.image instanceof File ? null : questionToDuplicate.image, // Don't duplicate file objects
      subQuestions: questionToDuplicate.subQuestions?.map(sq => ({ ...sq, _id: generateUniqueId() })),
    };

    const index = questions.findIndex(q => q._id === _id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
  };

  // --- MAIN SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      let finalHeaderImage = headerImage;
      if (headerImage instanceof File) {
        finalHeaderImage = await handleImageUpload(headerImage);
        if (!finalHeaderImage) throw new Error("Header image upload failed. Please try again.");
      }

      const questionsWithUploadedImages = await Promise.all(
        questions.map(async (q) => {
          if (q.image instanceof File) {
            const uploadedUrl = await handleImageUpload(q.image);
            if (!uploadedUrl) throw new Error(`Image for question "${q.title}" failed to upload.`);
            return { ...q, image: uploadedUrl };
          }
          return q;
        })
      );

      const formPayload = {
        title: formTitle,
        description: formDescription,
        headerImage: finalHeaderImage,
        questions: questionsWithUploadedImages,
      };

      const url = formId ? `${API_BASE_URL}/api/forms/${formId}` : `${API_BASE_URL}/api/forms`;
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

  // --- RENDER LOGIC ---
  const renderQuestionSpecificFields = (question) => {
    const onQuestionImageUpload = (file) => {
      handleQuestionChange(question._id, "image", file); // This now stores the FILE object
      setQuestionImagePreviews(prev => ({ ...prev, [question._id]: URL.createObjectURL(file) }));
    };

    const onQuestionImageRemove = () => {
      handleQuestionChange(question._id, "image", null);
      setQuestionImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[question._id];
        return newPreviews;
      });
    };
    
    switch (question.type) {
        case 'categorize':
          return (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Question Image</label>
              <ImageUploader imageUrl={questionImagePreviews[question._id]} onUpload={onQuestionImageUpload} onRemove={onQuestionImageRemove} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories (comma-separated)</label>
                <input type="text" className="w-full p-2 border rounded-md" value={(question.categories || []).join(', ')} onChange={(e) => handleQuestionChange(question._id, 'categories', e.target.value.split(',').map(s => s.trim()))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items (comma-separated)</label>
                <input type="text" className="w-full p-2 border rounded-md" value={(question.items || []).join(', ')} onChange={(e) => handleQuestionChange(question._id, 'items', e.target.value.split(',').map(s => s.trim()))} />
              </div>
            </div>
          );
        case 'cloze':
          return (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Question Image</label>
              <ImageUploader imageUrl={questionImagePreviews[question._id]} onUpload={onQuestionImageUpload} onRemove={onQuestionImageRemove} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Text with [BLANK] markers</label>
                <textarea className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none" value={question.text || ''} onChange={(e) => handleQuestionChange(question._id, "text", e.target.value)} placeholder="e.g., The capital of France is [BLANK]."></textarea>
              </div>
            </div>
          );
        case 'comprehension':
          return (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Question Image</label>
              <ImageUploader imageUrl={questionImagePreviews[question._id]} onUpload={onQuestionImageUpload} onRemove={onQuestionImageRemove} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passage</label>
                <textarea className="w-full p-2 border rounded-md" rows="6" value={question.passage || ''} onChange={(e) => handleQuestionChange(question._id, "passage", e.target.value)}></textarea>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-800 mt-4">Sub-Questions:</h4>
                {(question.subQuestions || []).map((subQ, subQIndex) => (
                  <div key={subQ._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md mb-2">
                    <input type="text" className="flex-grow p-1 border rounded-md text-sm" value={subQ.question || ''} onChange={(e) => handleSubQuestionChange(question._id, subQ._id, 'question', e.target.value)} placeholder={`Sub-question ${subQIndex + 1}`} />
                    <button type="button" onClick={() => handleRemoveSubQuestion(question._id, subQ._id)} className="text-red-500 hover:text-red-700 p-1 rounded-full" title="Remove sub-question">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddSubQuestion(question._id)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Sub-Question
                </button>
              </div>
            </div>
          );
        default:
          return null;
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-700">Loading form...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{formId ? 'Edit Form' : 'Create New Form'}</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <label className="block text-lg font-semibold text-gray-800 mb-2">Form Title</label>
            <input type="text" className="w-full p-3 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-300" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
            <label className="block text-lg font-semibold text-gray-800 mt-4 mb-2">Form Description</label>
            <textarea className="w-full p-3 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-300" rows="3" value={formDescription} onChange={(e) => setFormDescription(e.target.value)}></textarea>
            <label className="block text-lg font-semibold text-gray-800 mt-4 mb-2">Header Image</label>
            <ImageUploader
              imageUrl={headerImagePreview}
              onUpload={(file) => {
                setHeaderImage(file);
                setHeaderImagePreview(URL.createObjectURL(file));
              }}
              onRemove={() => {
                setHeaderImage(null);
                setHeaderImagePreview(null);
              }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions</h2>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
              No questions added yet. Use the buttons below to add your first question.
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question._id} className="bg-white p-6 mb-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Question {index + 1}</h3>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => handleDuplicateQuestion(question._id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full" title="Duplicate question">
                      <Copy size={16} />
                    </button>
                    <button type="button" onClick={() => handleRemoveQuestion(question._id)} className="p-2 text-red-500 hover:text-red-700 rounded-full" title="Remove question">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select className="w-full p-2 border rounded-md mb-4" value={question.type} onChange={(e) => handleQuestionChange(question._id, 'type', e.target.value)}>
                  <option value="categorize">Categorize</option>
                  <option value="cloze">Cloze</option>
                  <option value="comprehension">Comprehension</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                <input type="text" className="w-full p-2 border rounded-md mb-4" value={question.title || ''} onChange={(e) => handleQuestionChange(question._id, 'title', e.target.value)} required />
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Description</label>
                <textarea className="w-full p-2 border rounded-md mb-4" rows="2" value={question.description || ''} onChange={(e) => handleQuestionChange(question._id, 'description', e.target.value)} placeholder="Optional description for the question"></textarea>
                {renderQuestionSpecificFields(question)}
              </div>
            ))
          )}

          <div className="flex justify-center space-x-4 mb-8">
            <button type="button" onClick={() => handleAddQuestion('categorize')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <List className="w-5 h-5 mr-2" /> Add Categorize
            </button>
            <button type="button" onClick={() => handleAddQuestion('cloze')} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center">
              <Type className="w-5 h-5 mr-2" /> Add Cloze
            </button>
            <button type="button" onClick={() => handleAddQuestion('comprehension')} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              <BarChart2 className="w-5 h-5 mr-2" /> Add Comprehension
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors text-lg flex items-center justify-center" disabled={isSaving}>
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
