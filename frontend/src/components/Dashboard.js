import React, { useState, useEffect } from "react";
import SentimentChart from "./SentimentChart";
import ThemeChart from "./ThemeChart";
import MessageFeed from "./MessageFeed";
import StatsCards from "./StatsCards";
import {
  fetchSentimentStats,
  fetchThemeStats,
  fetchMessages,
} from "../services/api";

const Dashboard = ({ refreshTrigger }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [themeData, setThemeData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sentiments, themes, recentMessages] = await Promise.all([
        fetchSentimentStats(),
        fetchThemeStats(),
        fetchMessages(20), // Últimos 20 mensajes
      ]);

      setSentimentData(sentiments);
      setThemeData(themes);
      setMessages(recentMessages);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Error cargando los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={loadData}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Tarjetas de estadísticas */}
      <StatsCards sentimentData={sentimentData} themeData={themeData} />

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Distribución de Sentimientos
          </h2>
          <SentimentChart data={sentimentData} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Temas Más Mencionados
          </h2>
          <ThemeChart data={themeData} />
        </div>
      </div>

      {/* Feed de mensajes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Mensajes Recientes
        </h2>
        <MessageFeed messages={messages} />
      </div>
    </div>
  );
};

export default Dashboard;
