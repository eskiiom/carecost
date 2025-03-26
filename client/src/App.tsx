import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { VehicleList } from './pages/Vehicles/VehicleList';
import { VehicleForm } from './pages/Vehicles/VehicleForm';
import { VehicleDetails } from './pages/Vehicles/VehicleDetails';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            {/* Page d'accueil temporaire - redirige vers la liste des véhicules */}
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            
            {/* Routes des véhicules */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            
            {/* Routes à implémenter plus tard */}
            <Route 
              path="/statistics" 
              element={
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Statistiques (à venir)</h1>
                </div>
              } 
            />
            <Route 
              path="/maintenance" 
              element={
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Maintenance (à venir)</h1>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
