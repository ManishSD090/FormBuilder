import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  FileText,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Share2,
  Trash2,
  Eye,
  Pencil, 
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null); // This is the state
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');


  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'forms', label: 'My Forms', icon: FileText },
    { id: 'responses', label: 'Responses', icon: BarChart3 },
  ];

// Effect to load user from localStorage on initial mount
   useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user"); // Clear corrupted data
      }
    }
  }, []);


  // Effect to fetch user profile data
 useEffect(() => {
    const fetchUserProfile = async () => {
      let userData = null;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No authentication token found. Redirecting to login.");
          navigate('/login'); // Redirect to login if no token
          return;
        }

        const res = await fetch(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          userData = await res.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Update localStorage with fresh data
          console.log("User data fetched from API and set in state:", userData);
        } else {
          const errorText = await res.text();
          console.error("Auth/me API fetch failed:", res.status, errorText);
          // If API fails, try to load from localStorage as a fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              userData = JSON.parse(storedUser);
              setUser(userData);
              console.log("User data loaded from localStorage as API fallback:", userData);
            } catch (e) {
              console.error("Error parsing user from localStorage fallback:", e);
              localStorage.removeItem("user"); // Clear corrupted data
              setUser(null);
              navigate('/login'); // Redirect if localStorage is also bad
            }
          } else {
            // No token, no API data, no localStorage data
            navigate('/login'); // Redirect to login
          }
        }
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
        // Fallback to localStorage if API call throws an error
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("User data loaded from localStorage after API error:", userData);
          } catch (e) {
            console.error("Error parsing user from localStorage after API error:", e);
            localStorage.removeItem("user");
            setUser(null);
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // Effect to fetch forms data including response counts
  useEffect(() => {
    // console.log("useEffect: fetchForms triggered. Current loading state:", loading); // Debugging log
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No authentication token found. Cannot fetch forms.");
          setLoading(false); // Stop loading animation
          setError("You are not logged in. Please log in to view forms."); // Set user-friendly error
          return; // Exit early if no token
        }

        const res = await fetch(`${API}/api/forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch forms response:", res.status, errorText); // Debugging log
          throw new Error("Failed to fetch forms. Please ensure you are logged in correctly.");
        }

        const data = await res.json();
        console.log("Forms data fetched:", data); // Crucial log to see the incoming data, including responsesCount
        setRecentForms(data);
        setLoading(false); // Only set loading to false AFTER all data is successfully fetched
      } catch (error) {
        console.error("Error fetching forms in useEffect:", error); // Debugging log
        setLoading(false); // Stop loading on error
        setError(error.message); // Set error state to display to the user
      }
    };
    fetchForms();
  }, []); // Empty dependency array means this runs once on component mount

  // Function to handle form deletion
  const handleDelete = async (formId) => {
    // IMPORTANT: Replace window.confirm with a custom modal/dialog for better UI/UX and iframe compatibility
    const isConfirmed = window.confirm("Are you sure you want to delete this form? This action cannot be undone.");
    if (!isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete the form.');
      }

      // Update state to remove the deleted form from the list
      setRecentForms(prevForms => prevForms.filter(form => form._id !== formId));
      alert('Form deleted successfully.'); // Replace with a custom toast/modal notification
    } catch (error) {
      console.error("Error deleting form:", error);
      alert(`Could not delete the form: ${error.message}`); // Replace with a custom toast/modal notification
    }
  };

   const handleShare = (formId) => {
    const formUrl = `${window.location.origin}/form/${formId}`;
    const el = document.createElement('textarea');
    el.value = formUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Form link copied to clipboard!');
  };


  const handleEdit = (formId) => {
    // Navigate to the FormBuilder page with the form ID as a parameter
    navigate(`/formbuilder/${formId}`);
  };

  // Helper function to filter forms based on creation date
  const getFilteredForms = () => {
    const now = new Date();
    let filtered = recentForms;

    switch (filterType) {
      case 'today':
        filtered = recentForms.filter(form => {
          const formDate = new Date(form.createdAt);
          return formDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = recentForms.filter(form => new Date(form.createdAt) >= oneWeekAgo);
        break;
      case 'month':
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = recentForms.filter(form => new Date(form.createdAt) >= oneMonthAgo);
        break;
      case 'year':
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = recentForms.filter(form => new Date(form.createdAt) >= oneYearAgo);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          // Set end date to end of day for inclusive range
          end.setHours(23, 59, 59, 999); 
          filtered = recentForms.filter(form => {
            const formDate = new Date(form.createdAt);
            return formDate >= start && formDate <= end;
          });
        }
        break;
      case 'all':
      default:
        // No filtering, return all forms
        break;
    }
    return filtered;
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    localStorage.removeItem("user"); // Clear user from localStorage on logout
    setUser(null); // Clear user state
    navigate("/login"); // Redirect to login page
  };

  console.log("Dashboard render - current user state:", user); // Debugging log 

  // Conditional rendering for loading and error states
  if (loading) return <div className="text-center p-10 text-gray-700">Loading forms...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  // Render function for the Dashboard Home section (Recent Forms table)
  const renderDashboardHome = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back{user && user.fullname ? `, ${user.fullname}` : ''}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your forms today.</p>
      </div>

      {/* Recent Forms Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Forms</h2>
        </div>
        {/* Adjusted scrollbar application */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }}> {/* Adjusted maxHeight for scrollbar visibility */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th> {/* Table header for responses */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentForms && recentForms.length > 0 ? (
                recentForms.map((form) => (
                  <tr key={form._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{form.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    {/* Display the dynamic responsesCount here */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {form.responsesCount !== undefined ? form.responsesCount : 'N/A'} {/* Accessing responsesCount */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(form.status || 'Active') === 'Active' ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {form.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        {/* View Form Button */}
                        <Link to={`/form/${form._id}`} target="_blank" title="View Form">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </Link>
                        {/* MODIFIED: View Responses Button - navigate to the FormResponsesList route */}
                        <button
                          onClick={() => navigate(`/responses/form/${form._id}`)} // <-- CORRECTED PATH
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="View Form Responses"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </button>
                        <button
                                onClick={() => handleEdit(form._id)}
                                className="text-gray-400 hover:text-purple-600 transition-colors"
                                title="Edit Form"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                         <button
                            onClick={() => handleShare(form._id)} // Share button
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Share Form Link"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                          onClick={() => handleDelete(form._id)}
                          className="text-red-500 hover:text-red-800 transition-colors"
                          title="Delete Form"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button> 
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-6">No recent forms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <Link to="/formbuilder">
            <button className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors">
              Create New Form
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  // Render function for different sections based on activeSection state
  const renderContent = () => {
    const filteredForms = getFilteredForms(); // Get forms filtered by date

    switch (activeSection) {
      case 'dashboard':
        return renderDashboardHome();
      case 'forms': // My Forms section - also updated to show response count
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentForms.length > 0 ? (
                recentForms.map((form) => (
                  <div key={form._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex-grow">
                      <FileText className="w-8 h-8 text-blue-800 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">{form.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">Created {new Date(form.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {/* Display dynamic responsesCount in card view */}
                      <span className="text-sm text-gray-600 font-bold">
                        {form.responsesCount !== undefined ? `${form.responsesCount} responses` : 'N/A responses'}
                      </span>
                      <div className="flex items-center space-x-2">
                         {/* View Form Button */}
                        <Link to={`/form/${form._id}`} target="_blank" title="View Form">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </Link>
                         {/* MODIFIED: View Responses Button in My Forms grid */}
                        <button
                          onClick={() => navigate(`/responses/form/${form._id}`)} // <-- CORRECTED PATH
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="View Form Responses"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </button>
                        <button
                                onClick={() => handleEdit(form._id)}
                                className="text-gray-400 hover:text-purple-600 transition-colors"
                                title="Edit Form"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                         <button
                            onClick={() => handleShare(form._id)} // Share button
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Share Form Link"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                        <button
                          onClick={() => handleDelete(form._id)}
                          className="text-red-500 hover:text-red-800 transition-colors p-1"
                          title="Delete Form"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-400">No forms found.</div>
              )}
            </div>
          </div>
        );
      case 'responses': // This is the section to populate with form list and filter
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Form Responses</h2>
            
            {/* Date Filter Controls */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <label htmlFor="dateFilter" className="text-gray-700 font-medium">Filter by Date:</label>
              <select
                id="dateFilter"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {filterType === 'custom' && (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider rounded-tl-lg">Form Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider">Created Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider">Total Responses</th>
                    <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredForms.length > 0 ? ( // Use filteredForms here
                    filteredForms.map((form) => (
                      <tr key={form._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <td className="py-3 px-4 text-gray-800 font-medium">{form.title}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(form.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-800 font-semibold">{form.responsesCount !== undefined ? form.responsesCount : 'N/A'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/responses/form/${form._id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" /> View Responses
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-600">No forms found for the selected date range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return renderDashboardHome();
    }
  };

  // Main component render structure
  return (
    <div className="flex h-screen bg-gray-50 font-inter">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigationItems={navigationItems} activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigationItems={navigationItems} activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header>
          <div className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-800"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0 flex-1 max-w-md">
                  
                </div>
              </div>
              <div className="flex items-center mb-3 space-x-4">
                {/* Dynamic User Profile Display */}
                <div 
                  className="relative flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  // Removed onClick to open dropdown since profile section is gone
                  // ref={userDropdownRef} // Ref not needed without dropdown
                >
                  <div className="text-right">
                    {/* Display user's name dynamically */}
                    <div className="text-sm font-medium text-gray-900">
                      {user ? user.fullName : 'User'} {/* Use user.fullName */}
                    </div>
                    <div className="text-sm text-gray-500">{user ? user.role : ''}</div>
                  </div>
                  <div className="h-10 w-10 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {/* Display user's initial or default User icon */}
                    {user && user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-6 w-6" />} {/* Use user.fullName */}
                  </div>
                  {/* Removed userDropdownOpen conditional rendering as dropdown is gone */}
                </div>
                {/* Logout button moved directly here, outside the user display div */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// SidebarContent component (no changes needed)
const SidebarContent = ({ navigationItems, activeSection, setActiveSection }) => (
  <div className="flex flex-col h-full bg-white border-r border-gray-200">
    {/* Logo */}
    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">FormBuilder</span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-4 space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-800 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            {item.label}
          </button>
        );
      })}
    </nav>

  </div>
);

export default Dashboard;
