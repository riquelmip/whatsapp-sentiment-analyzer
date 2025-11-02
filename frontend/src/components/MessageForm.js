import React, { useState } from "react";
import { sendTestMessage } from "../services/api";

const MessageForm = ({ onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("+50312345678");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setFeedback({ type: "error", message: "Por favor ingresa un mensaje" });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      await sendTestMessage(message, sender);
      setFeedback({
        type: "success",
        message: "Mensaje enviado y procesado correctamente",
      });
      setMessage("");

      // Notificar al componente padre para actualizar el dashboard
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setFeedback({
        type: "error",
        message: "Error al procesar el mensaje: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleMessages = [
    "Excelente servicio, el café estaba delicioso y el personal muy amable. ¡Recomendado!",
    "El servicio fue muy lento, esperé 20 minutos por mi pedido. Pueden mejorar.",
    "¿A qué hora abren los domingos? Quiero pasar a desayunar.",
    "La limpieza del baño necesita mejorarse, estaba bastante sucio.",
    "Los precios están un poco altos comparado con otros lugares.",
    "El café de la casa es espectacular, definitivamente vuelvo mañana.",
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        🧪 Probar Sistema (Simulador de WhatsApp)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de número de teléfono */}
        <div>
          <label
            htmlFor="sender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número de teléfono del cliente:
          </label>
          <input
            type="text"
            id="sender"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="+503XXXXXXXX"
          />
        </div>

        {/* Campo de mensaje */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mensaje del cliente:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Escribe aquí el mensaje que enviaría un cliente..."
            disabled={isLoading}
          />
        </div>

        {/* Botones de mensajes de ejemplo */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Mensajes de ejemplo:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sampleMessages.map((sample, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(sample)}
                className="text-left text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 transition-colors"
                disabled={isLoading}
              >
                {sample.substring(0, 60)}...
              </button>
            ))}
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || !message.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isLoading ? "⏳ Procesando..." : "📤 Enviar Mensaje de Prueba"}
        </button>
      </form>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 p-3 rounded-md ${
            feedback.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Este formulario simula mensajes de WhatsApp
          para probar el sistema. En producción, los mensajes llegan
          automáticamente vía webhook de Twilio.
        </p>
      </div>
    </div>
  );
};

export default MessageForm;
