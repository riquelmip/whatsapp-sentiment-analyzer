from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
from datetime import datetime
from typing import List, Dict, Optional
import json
from dotenv import load_dotenv

from database import Database
from ai_analyzer import AIAnalyzer
from models import MessageCreate, MessageResponse, SentimentStats, ThemeStats

# Cargar variables de entorno
load_dotenv()

# Inicializar servicios
database = Database()
ai_analyzer = AIAnalyzer()

# Inicializar conexiones (eventos de startup/shutdown movidos a lifespan)
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - MongoDB connection
    try:
        await database.connect()
        print("Conectado a la base de datos MongoDB al iniciar la aplicación")
    except Exception as e:
        print(f"CRITICAL: No se pudo conectar a MongoDB: {e}")
        print("La aplicación no puede iniciarse sin conexión a la base de datos")
        raise e

    yield
    
    # Shutdown
    try:
        await database.disconnect()
    except Exception as e:
        print(f"Error al desconectar de la base de datos: {e}")

# Crear app con lifespan
app = FastAPI(
    title="WhatsApp Sentiment Analysis API", 
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://whatsapp-sentiment-analyzer.riquelmipalacios.com"
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint de health check"""
    return {"message": "WhatsApp Sentiment Analysis API", "status": "running"}

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Webhook para recibir mensajes de WhatsApp desde Twilio
    """
    try:
        # Obtener datos del formulario (Twilio)
        form_data = await request.form()
        
        # Extraer información del mensaje
        message_body = form_data.get("Body", "")
        sender_number = form_data.get("From", "")
        message_sid = form_data.get("MessageSid", "")
        
        if not message_body or not sender_number:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Crear el objeto del mensaje
        message_data = MessageCreate(
            texto_mensaje=message_body,
            numero_remitente=sender_number,
            message_sid=message_sid,
            timestamp=datetime.utcnow()
        )
        
        # Guardar mensaje en la base de datos
        message_id = await database.save_message(message_data.dict())
        
        # Analizar el mensaje con IA en segundo plano
        try:
            analysis = await ai_analyzer.analyze_message(message_body)
            await database.update_message_analysis(message_id, analysis)
        except Exception as e:
            print(f"Error analyzing message: {e}")
            # El mensaje se guarda aunque falle el análisis
        
        # Respuesta requerida por Twilio 
        return Response(content="<?xml version='1.0' encoding='UTF-8'?><Response></Response>", 
                       media_type="application/xml")
        
    except Exception as e:
        print(f"Error al procesar webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages", response_model=List[MessageResponse])
async def get_messages(limit: int = 50, skip: int = 0):
    """
    Obtener mensajes recientes con análisis
    """
    try:
        messages = await database.get_messages(limit=limit, skip=skip)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiments", response_model=SentimentStats)
async def get_sentiment_stats():
    """
    Obtener estadísticas de sentimientos
    """
    try:
        stats = await database.get_sentiment_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/themes", response_model=List[ThemeStats])
async def get_theme_stats():
    """
    Obtener estadísticas de temas
    """
    try:
        stats = await database.get_theme_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-message")
async def test_message(message: str = Form(...), sender: str = Form(...)):
    """
    Endpoint para probar el sistema sin Twilio
    """
    try:
        message_data = MessageCreate(
            texto_mensaje=message,
            numero_remitente=sender,
            message_sid=f"test_{datetime.utcnow().timestamp()}",
            timestamp=datetime.utcnow()
        )
        
        # Guardar mensaje
        message_id = await database.save_message(message_data.dict())
        
        # Analizar mensaje
        analysis = await ai_analyzer.analyze_message(message)
        await database.update_message_analysis(message_id, analysis)

        return {"message": "Mensaje procesado correctamente", "id": str(message_id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/webhook/test")
async def test_webhook():
    """Endpoint para probar que el webhook está funcionando"""
    return {
        "message": "Webhook endpoint is working!",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "ok"
    }

@app.get("/config/check")
async def check_config():
    """Verificar configuración de las APIs"""
    config_status = {
        "twilio": {
            "configured": bool(os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN")),
            "phone_number": bool(os.getenv("TWILIO_PHONE_NUMBER"))
        },
        "openai": {
            "configured": bool(os.getenv("OPENAI_API_KEY"))
        },
        "database": {
            "connected": database.client is not None,
            "url": os.getenv("MONGODB_URL", "Not configured")[:20] + "..." if os.getenv("MONGODB_URL") else "Not configured"
        }
    }
    return config_status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
