import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import MessageForm from "./components/MessageForm";
import "./App.css";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMessageSent = () => {
    // Trigger refresh of dashboard data
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="App">
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">
            Dashboard de Sentimiento del Cliente - WhatsApp
          </h1>
          <p className="text-center mt-2 text-green-100">
            Café de El Salvador - Análisis en Tiempo Real
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Formulario de prueba */}
        <div className="mb-8">
          <MessageForm onMessageSent={handleMessageSent} />
        </div>

        {/* Dashboard principal */}
        <Dashboard refreshTrigger={refreshTrigger} />
      </main>

      <footer className="bg-gray-800 text-white text-center p-4 mt-12">
        <p>
          &copy; 2025 Café de El Salvador - Sistema de Análisis de Sentimientos
        </p>
      </footer>
    </div>
  );
}

export default App;
