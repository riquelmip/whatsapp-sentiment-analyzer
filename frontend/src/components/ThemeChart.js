import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ThemeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg">📊</p>
          <p>No hay datos de temas disponibles</p>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map((item) => ({
    tema:
      item.tema.length > 15 ? item.tema.substring(0, 15) + "..." : item.tema,
    temaCompleto: item.tema,
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.temaCompleto}</p>
          <p className="text-sm text-gray-600">
            Mensajes:{" "}
            <span className="font-bold text-blue-600">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Determinar color de las barras basado en el tema
  const getBarColor = (tema) => {
    switch (tema) {
      case "Servicio al Cliente":
        return "#3B82F6"; // Blue
      case "Calidad del Producto":
        return "#10B981"; // Green
      case "Precio":
        return "#F59E0B"; // Yellow
      case "Limpieza":
        return "#8B5CF6"; // Purple
      default:
        return "#6B7280"; // Gray
    }
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="tema"
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
            stroke="#6B7280"
          />
          <YAxis fontSize={12} stroke="#6B7280" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Lista detallada de temas */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: getBarColor(item.tema) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {item.tema}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {item.count}
            </span>
          </div>
        ))}
        {data.length > 5 && (
          <div className="text-center text-sm text-gray-500 pt-2">
            y {data.length - 5} temas más...
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeChart;
