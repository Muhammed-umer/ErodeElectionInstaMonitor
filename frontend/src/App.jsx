import React from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold text-gray-800">Instagram Election Monitor</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Dashboard />
      </main>
    </div>
  );
};

export default App;
