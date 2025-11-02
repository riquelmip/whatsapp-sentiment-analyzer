import React from "react";

const MessageFeed = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">💬</p>
        <p>No hay mensajes recientes</p>
        <p className="text-sm mt-2">
          Los mensajes aparecerán aquí cuando los clientes escriban
        </p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positivo":
        return "😊";
      case "negativo":
        return "😔";
      case "neutro":
        return "😐";
      default:
        return "❓";
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positivo":
        return "text-green-600 bg-green-50 border-green-200";
      case "negativo":
        return "text-red-600 bg-red-50 border-red-200";
      case "neutro":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case "Servicio al Cliente":
        return "👥";
      case "Calidad del Producto":
        return "☕";
      case "Precio":
        return "💰";
      case "Limpieza":
        return "🧼";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Eliminar el prefijo de WhatsApp si existe
    const cleaned = phoneNumber.replace("whatsapp:", "");
    return cleaned;
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Header del mensaje */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                📱 {formatPhoneNumber(message.numero_remitente)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(message.timestamp)}
              </span>
            </div>

            {/* Badges de sentimiento y tema */}
            <div className="flex space-x-2">
              {message.sentimiento && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                    message.sentimiento
                  )}`}
                >
                  {getSentimentIcon(message.sentimiento)} {message.sentimiento}
                </span>
              )}
              {message.tema && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                  {getThemeIcon(message.tema)} {message.tema}
                </span>
              )}
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className="mb-3">
            <p className="text-gray-800 leading-relaxed">
              {message.texto_mensaje}
            </p>
          </div>

          {/* Resumen de IA (si existe) */}
          {message.resumen && (
            <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-400">
              <p className="text-sm text-gray-700">
                <span className="font-medium">🤖 Resumen IA:</span>{" "}
                {message.resumen}
              </p>
            </div>
          )}

          {/* Mensaje sin análisis */}
          {!message.sentimiento && !message.tema && (
            <div className="bg-yellow-50 rounded-md p-2 border-l-4 border-yellow-400">
              <p className="text-xs text-yellow-700">
                ⏳ Pendiente de análisis
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageFeed;
