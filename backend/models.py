from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class MessageCreate(BaseModel):
    """Modelo para crear un nuevo mensaje"""
    texto_mensaje: str
    numero_remitente: str
    message_sid: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MessageResponse(BaseModel):
    """Modelo para respuesta de mensaje con análisis"""
    id: str
    texto_mensaje: str
    numero_remitente: str
    timestamp: datetime
    sentimiento: Optional[str] = None
    tema: Optional[str] = None
    resumen: Optional[str] = None
    message_sid: Optional[str] = None

class SentimentStats(BaseModel):
    """Estadísticas de sentimientos"""
    positivo: int = 0
    negativo: int = 0
    neutro: int = 0
    total: int = 0

class ThemeStats(BaseModel):
    """Estadísticas de temas"""
    tema: str
    count: int

class AIAnalysis(BaseModel):
    """Resultado del análisis de IA"""
    sentimiento: str = Field(..., pattern="^(positivo|negativo|neutro)$")
    tema: str = Field(..., pattern="^(Servicio al Cliente|Calidad del Producto|Precio|Limpieza|Otro)$")
    resumen: str
