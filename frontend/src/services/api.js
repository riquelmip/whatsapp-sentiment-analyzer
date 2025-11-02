import axios from "axios";

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Tiempo de espera agotado. Verifica que el servidor esté ejecutándose."
      );
    }

    if (error.response) {
      // Error del servidor
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        "Error del servidor";
      throw new Error(message);
    } else if (error.request) {
      // Error de red
      throw new Error(
        "No se pudo conectar al servidor. Verifica que esté ejecutándose en " +
          API_BASE_URL
      );
    } else {
      // Error de configuración
      throw new Error("Error en la configuración de la petición");
    }
  }
);

// Funciones de la API

/**
 * Obtener estadísticas de sentimientos
 */
export const fetchSentimentStats = async () => {
  try {
    const response = await api.get("/api/sentiments");
    return response.data;
  } catch (error) {
    console.error("Error fetching sentiment stats:", error);
    throw error;
  }
};

/**
 * Obtener estadísticas de temas
 */
export const fetchThemeStats = async () => {
  try {
    const response = await api.get("/api/themes");
    return response.data;
  } catch (error) {
    console.error("Error fetching theme stats:", error);
    throw error;
  }
};

/**
 * Obtener mensajes recientes
 */
export const fetchMessages = async (limit = 20, skip = 0) => {
  try {
    const response = await api.get("/api/messages", {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Enviar mensaje de prueba
 */
export const sendTestMessage = async (message, sender) => {
  try {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("sender", sender);

    const response = await api.post("/api/test-message", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending test message:", error);
    throw error;
  }
};

/**
 * Verificar estado del servidor
 */
export const checkServerHealth = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    console.error("Error checking server health:", error);
    throw error;
  }
};

export default api;
