// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import PreviewPage from './pages/PreviewPage';
import FormResponsesList from './pages/FormResponsesList';
// FIX: Corrected import name to match the renamed file
import SingleResponsePreview from './pages/SingleResponsePreview'; 
console.log("API URL from env:", import.meta.env.VITE_API_URL);


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/formbuilder/:id?" element={<FormBuilder />}/>
        <Route path="/form/:id" element={<FormViewer />} /> 
        <Route path="/preview" element={<PreviewPage />}/>
        <Route path="/responses/form/:formId" element={<FormResponsesList />} />
        <Route path="/response/:id" element={<SingleResponsePreview />} />
      </Routes>
    </Router>
  );
};

export default App;
