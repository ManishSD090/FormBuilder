import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Trash2, ArrowLeft } from 'lucide-react'; // Added ArrowLeft for back button

const API = import.meta.env.VITE_API_URL;

const FormResponsesList = () => {
  const { formId } = useParams(); // Get the form ID from the URL (e.g., /responses/form/:formId)
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch all responses for this specific formId
        const res = await fetch(`${API}/api/responses/form/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch responses for this form.');
        }

        const data = await res.json();
        setResponses(data);
        // If responses are found, extract the form title from the first response's populated formId
        if (data.length > 0 && data[0].formId) {
          setFormTitle(data[0].formId.title);
        }
        console.log("Fetched Responses for Form:", data); // Debugging: Check the fetched data
      } catch (err) {
        console.error("Error fetching responses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [formId]); // Re-fetch if formId changes

  // Function to handle deleting a single response (optional, but good to include)
  const handleDeleteResponse = async (responseToDeleteId) => {
    // IMPORTANT: Use a custom modal/dialog for confirmation, avoid window.confirm in iframes
    const isConfirmed = window.confirm("Are you sure you want to delete this response? This action cannot be undone.");
    if (!isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/responses/${responseToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete the response.');
      }

      // Update state to remove the deleted response from the list
      setResponses(prevResponses => prevResponses.filter(response => response._id !== responseToDeleteId));
      alert('Response deleted successfully.'); // Replace with a custom toast/modal
    } catch (error) {
      console.error("Error deleting response:", error);
      alert(`Could not delete the response: ${error.message}`); // Replace with a custom toast/modal
    }
  };


  if (loading) return <div className="text-center p-10 text-gray-700">Loading responses...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')} // Navigate back to dashboard
            className="text-gray-500 hover:text-blue-600 transition-colors mr-4 p-2 rounded-full hover:bg-gray-100"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Responses for "{formTitle || 'Loading Form Title...'}"</h1>
        </div>
        
        {responses.length === 0 ? (
          <div className="text-center p-10 text-gray-600">No responses found for this form yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider rounded-tl-lg">Submitted By</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider">Submitted On</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map((responseItem) => (
                  <tr key={responseItem._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <td className="py-3 px-4 text-gray-800 font-medium">{responseItem.userEmail || 'Anonymous'}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(responseItem.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {/* Button to view a single response preview */}
                      <button 
                        onClick={() => navigate(`/response/${responseItem._id}`)} // Navigate to the single response preview
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Full Response"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {/* Delete response button */}
                      <button 
                        onClick={() => handleDeleteResponse(responseItem._id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Response"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponsesList;
