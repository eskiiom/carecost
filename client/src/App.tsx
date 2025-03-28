import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VehicleList } from './pages/Vehicles/VehicleList';
import { VehicleForm } from './pages/Vehicles/VehicleForm';
import { VehicleDetails } from './pages/Vehicles/VehicleDetails';
import { Statistics } from './pages/Statistics';
import { Maintenance } from './pages/Maintenance';
import { PrivateRoute } from './components/PrivateRoute';
import { Navbar } from './components/Layout/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vehicles" element={<PrivateRoute><VehicleList /></PrivateRoute>} />
            <Route path="/vehicles/new" element={<PrivateRoute><VehicleForm /></PrivateRoute>} />
            <Route path="/vehicles/:id" element={<PrivateRoute><VehicleDetails /></PrivateRoute>} />
            <Route path="/vehicles/:id/edit" element={<PrivateRoute><VehicleForm /></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute><Statistics /></PrivateRoute>} />
            <Route path="/maintenance" element={<PrivateRoute><Maintenance /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><VehicleList /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
