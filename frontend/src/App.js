import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';
import EditEntry from './pages/EditEntry';
import EntryDetail from './pages/EntryDetail';
import ManageJournals from './pages/ManageJournals';
import './styles/global.css';

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/create" element={isAuthenticated() ? <CreateEntry /> : <Navigate to="/login" />} />
        <Route path="/edit/:id" element={isAuthenticated() ? <EditEntry /> : <Navigate to="/login" />} />
        <Route path="/entry/:id" element={<EntryDetail />} />
        <Route path="/journals" element={isAuthenticated() ? <ManageJournals /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;