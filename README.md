# WhatsApp Sentiment Analyzer 📱# WhatsApp Sentiment Analyzer 📱

Hice esta aplicación para analizar automáticamente los sentimientos de mensajes de WhatsApp usando IA. Básicamente conecta WhatsApp con OpenAI para saber si los mensajes son positivos, negativos o neutros, y también extrae los temas principales.

## ¿Qué hace? 🤔## ¿Qué hace? 🤔

- Recibe mensajes de WhatsApp automáticamente

- Los analiza con ChatGPT para determinar el sentimiento

- Extrae los temas de conversación

- Muestra todo en un dashboard con gráficos 

- Guarda todo en una base de datos

## Tecnologías que usé

**Backend:**

- **FastAPI** 

- **Python 3.11** 

- **MongoDB** 

- **OpenAI API** - Para el análisis de IA

- **Twilio** - Para conectar con WhatsApp 

- **React** 

- **Tailwind CSS** - Porque estoy mas acosumbrado, por esa razon no use v0 de Vercel

- **Recharts** - Para los gráficos


## 🚀 Configuración Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/riquelmip/whatsapp-sentiment-analyzer.git
cd whatsapp-sentiment-analyzer
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate
# Activar entorno virtual (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
```

#### Configurar variables de entorno (backend/.env):

```env
# Base de datos MongoDB
MONGODB_URL=mongodb://localhost:27017/whatsapp_sentiment
# O para MongoDB Atlas:
# MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/whatsapp_sentiment

DATABASE_NAME=whatsapp_sentiment
COLLECTION_NAME=messages

# Configuración de Twilio
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_PHONE_NUMBER=whatsapp:+1234567890

# OpenAI API
OPENAI_API_KEY=sk-tu_api_key_aqui

# Configuración del servidor
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### 3. Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

#### Configurar variables de entorno (frontend/.env):

```env
# URL del backend API
REACT_APP_API_URL=http://localhost:8000

# Intervalo de actualización (ms)
REACT_APP_REFRESH_INTERVAL=30000
```

### 4. Ejecutar la Aplicación

#### Terminal 1 - Backend:

```bash
cd backend
python main.py
```

#### Terminal 2 - Frontend:

```bash
cd frontend
npm start
```

La aplicación estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

### 5. Configurar WhatsApp Local (Opcional)

Para probar la funcionalidad de WhatsApp localmente, necesitas exponer tu backend usando ngrok:

#### Terminal 3 - ngrok:

```bash
# Descargar ngrok desde https://ngrok.com/download

# Exponer el puerto 8000 del backend
./ngrok.exe http 8000
```

Esto te dará una URL pública como: `https://abc123.ngrok-free.app`

#### Configuración de Twilio Webhook (Solo para el propietario):

```
⚠️ IMPORTANTE: Solo el propietario del proyecto puede configurar este webhook
en la consola de Twilio, ya que requiere acceso a la cuenta.

URL de Webhook: https://tu-url-de-ngrok.ngrok-free.app/webhook/whatsapp
```

## Mi enfoque con la IA 🧠

git clone https://github.com/riquelmip/whatsapp-sentiment-analyzer.git

Para que ChatGPT analice bien los mensajes, diseñé el prompt de manera que ChatGPT simulara ser un exporto en analisis de sentimientos, le di instrucciones especificas de los temas que deben de haber, y los criterios que tenia que tomar en cuenta:

````
Eres un experto analista de sentimientos especializado en feedback de clientes para restaurantes y cafeterías.

Analiza el siguiente mensaje de un cliente y devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:

{
    "sentimiento": "positivo" | "negativo" | "neutro",
    "tema": "Servicio al Cliente" | "Calidad del Producto" | "Precio" | "Limpieza" | "Otro",
    "resumen": "Descripción concisa de máximo 100 caracteres del mensaje"
}

Criterios ESTRICTOS para SENTIMIENTO:
- NEGATIVO: Cualquier palabra de insatisfacción como "mal", "no me gustó", "horrible", "terrible", "lento", "frío", "no me trataron bien", "decepcionante", "pésimo", quejas o críticas
- POSITIVO: Elogios claros como "excelente", "bueno", "delicioso", "recomiendo", "me encanta", "perfecto", "genial"
- NEUTRO: SOLO consultas informativas sin emociones, preguntas sobre horarios, menús, o comentarios completamente objetivos

IMPORTANTE: Si hay ANY palabra negativa o de queja, clasifica como NEGATIVO, no como neutro.

Criterios para TEMA:
- Servicio al Cliente: Atención, rapidez, amabilidad del personal, reservas
- Calidad del Producto: Sabor, frescura, presentación de comida/bebidas
- Precio: Costos, promociones, valor por dinero
- Limpieza: Higiene del local, baños, mesas, utensilios
- Otro: Cualquier tema que no encaje en las categorías anteriores

Responde SOLO con el JSON, sin explicaciones adicionales.
````



## Demo en vivo 🌐

La aplicación estará disponible en:

- **Frontend**: https://whatsapp-sentiment-analyzer.riquelmipalacios.com

- **API**: https://api-whatsapp-sentiment-analyzer.riquelmipalacios.com



 