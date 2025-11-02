import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const SentimentChart = ({ data }) => {
  if (!data || data.total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg">📭</p>
          <p>No hay datos de sentimientos disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Positivo", value: data.positivo, color: "#10B981" },
    { name: "Negativo", value: data.negativo, color: "#EF4444" },
    { name: "Neutro", value: data.neutro, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    // Solo mostrar etiqueta si el porcentaje es mayor al 5%
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = data.positivo + data.negativo + data.neutro;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{item.name}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-bold">{item.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje:{" "}
            <span className="font-bold">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>

      {/* Resumen numérico */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {data.positivo}
          </div>
          <div className="text-sm text-green-800">Positivos</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{data.negativo}</div>
          <div className="text-sm text-red-800">Negativos</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {data.neutro}
          </div>
          <div className="text-sm text-yellow-800">Neutros</div>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
