import React from "react";

const StatsCards = ({ sentimentData, themeData }) => {
  const totalMessages = sentimentData ? sentimentData.total : 0;
  const totalThemes = themeData ? themeData.length : 0;

  // Calcular porcentaje de satisfacción (positivos vs total analizados)
  const satisfactionRate =
    sentimentData && sentimentData.total > 0
      ? ((sentimentData.positivo / sentimentData.total) * 100).toFixed(1)
      : 0;

  // Tema más popular
  const topTheme =
    themeData && themeData.length > 0 ? themeData[0].tema : "N/A";

  const cards = [
    {
      title: "Total Mensajes",
      value: totalMessages,
      icon: "💬",
      color: "bg-blue-500",
      description: "Mensajes recibidos",
    },
    {
      title: "Tasa de Satisfacción",
      value: `${satisfactionRate}%`,
      icon: "😊",
      color: "bg-green-500",
      description: "Sentimientos positivos",
    },
    {
      title: "Temas Identificados",
      value: totalThemes,
      icon: "📊",
      color: "bg-purple-500",
      description: "Categorías diferentes",
    },
    {
      title: "Tema Principal",
      value:
        topTheme.length > 12 ? topTheme.substring(0, 12) + "..." : topTheme,
      icon: "🔥",
      color: "bg-orange-500",
      description: "Más mencionado",
      fullValue: topTheme,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200 hover:shadow-lg transition-shadow"
        >
          {/* Header de la tarjeta */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-full ${card.color} text-white text-xl`}
            >
              {card.icon}
            </div>
            <div className="text-right">
              <p
                className="text-2xl font-bold text-gray-800"
                title={card.fullValue}
              >
                {card.value}
              </p>
            </div>
          </div>

          {/* Información de la tarjeta */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {card.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </div>

          {/* Indicador visual adicional para satisfacción */}
          {card.title === "Tasa de Satisfacción" && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    satisfactionRate >= 70
                      ? "bg-green-500"
                      : satisfactionRate >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${satisfactionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {satisfactionRate >= 70
                  ? "¡Excelente!"
                  : satisfactionRate >= 50
                  ? "Regular"
                  : "Necesita mejora"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
