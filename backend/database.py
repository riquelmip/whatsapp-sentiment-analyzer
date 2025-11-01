import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from datetime import datetime
from typing import List, Dict, Optional
from bson import ObjectId
import asyncio

from models import MessageResponse, SentimentStats, ThemeStats

class Database:
    """Clase para manejar operaciones de MongoDB - Solo producción"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self.connected = False
        
    async def connect(self):
        """Conectar a MongoDB"""
        try:
            mongodb_url = os.getenv("MONGODB_URL")
            if not mongodb_url:
                raise ValueError("MONGODB_URL environment variable is required")
                
            database_name = os.getenv("DATABASE_NAME", "whatsapp_sentiment")
            collection_name = os.getenv("COLLECTION_NAME", "messages")
            
            self.client = AsyncIOMotorClient(mongodb_url, serverSelectionTimeoutMS=10000)
            
            # Verificar conexión
            await self.client.admin.command('ping')
            print("Conectado a MongoDB exitosamente")
            
            self.db = self.client[database_name]
            self.collection = self.db[collection_name]
            self.connected = True
            
            # Crear índices
            await self._create_indexes()
            
        except Exception as e:
            print(f"Error al conectar a MongoDB: {e}")
            self.connected = False
            raise ConnectionError(f"MongoDB conexion fallida: {e}")
    
    async def disconnect(self):
        """Desconectar de MongoDB"""
        if self.client:
            self.client.close()
            print("Conexión a MongoDB cerrada")

    async def _create_indexes(self):
        """Crear índices para optimizar consultas"""
        try:
            await self.collection.create_index("timestamp")
            await self.collection.create_index("sentimiento")
            await self.collection.create_index("tema")
            await self.collection.create_index("numero_remitente")
            print("Índices de la base de datos creados exitosamente")
        except Exception as e:
            print(f"Error al crear índices: {e}")

    async def save_message(self, message_data: Dict) -> ObjectId:
        """Guardar un nuevo mensaje en la base de datos"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se puede guardar el mensaje.")
        
        try:
            result = await self.collection.insert_one(message_data)
            print(f"Mensaje guardado con ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            print(f"Error al guardar el mensaje: {e}")
            raise
    
    async def update_message_analysis(self, message_id: ObjectId, analysis: Dict):
        """Actualizar un mensaje con el análisis de IA"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se puede actualizar el mensaje.")
        
        try:
            update_data = {
                "sentimiento": analysis.get("sentimiento"),
                "tema": analysis.get("tema"),
                "resumen": analysis.get("resumen")
            }
            
            result = await self.collection.update_one(
                {"_id": message_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                print(f"Mensaje {message_id} actualizado con análisis de IA")
            else:
                print(f"Mensaje {message_id} no encontrado para actualizar")

        except Exception as e:
            print(f"Error al actualizar el análisis del mensaje: {e}")
            raise
    
    async def get_messages(self, limit: int = 50, offset: int = 0) -> List[MessageResponse]:
        """Obtener mensajes ordenados por timestamp (más recientes primero)"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se pueden recuperar mensajes.")

        try:
            cursor = self.collection.find().sort("timestamp", -1).skip(offset).limit(limit)
            messages = []
            
            async for doc in cursor:
                message = MessageResponse(
                    id=str(doc["_id"]),
                    texto_mensaje=doc["texto_mensaje"],
                    numero_remitente=doc["numero_remitente"],
                    timestamp=doc["timestamp"],
                    sentimiento=doc.get("sentimiento", "pendiente"),
                    tema=doc.get("tema", "Sin clasificar"),
                    resumen=doc.get("resumen", ""),
                    message_sid=doc.get("message_sid", "")
                )
                messages.append(message)

            print(f"Se recuperaron {len(messages)} mensajes de la base de datos")
            return messages
            
        except Exception as e:
            print(f"Error al recuperar mensajes: {e}")
            raise
    
    async def get_sentiment_stats(self) -> SentimentStats:
        """Obtener estadísticas de sentimientos"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se pueden obtener estadísticas.")

        try:
            pipeline = [
                {"$group": {
                    "_id": "$sentimiento",
                    "count": {"$sum": 1}
                }}
            ]
            
            result = {}
            async for doc in self.collection.aggregate(pipeline):
                sentiment = doc["_id"]
                count = doc["count"]
                result[sentiment] = count
            
            stats = SentimentStats(
                positivo=result.get("positivo", 0),
                negativo=result.get("negativo", 0),
                neutro=result.get("neutro", 0)
            )

            print(f"Estadísticas de sentimientos: +{stats.positivo} -{stats.negativo} ={stats.neutro}")
            return stats
            
        except Exception as e:
            print(f"Error al obtener estadísticas de sentimientos: {e}")
            raise
    
    async def get_theme_stats(self) -> List[ThemeStats]:
        """Obtener estadísticas de temas"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se pueden obtener estadísticas de temas.")

        try:
            pipeline = [
                {"$group": {
                    "_id": "$tema",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}}
            ]
            
            themes = []
            async for doc in self.collection.aggregate(pipeline):
                theme = ThemeStats(
                    tema=doc["_id"] or "Sin clasificar",
                    count=doc["count"]
                )
                themes.append(theme)

            print(f"Estadísticas de temas: {len(themes)} temas diferentes encontrados")
            return themes
            
        except Exception as e:
            print(f"Error al obtener estadísticas de temas: {e}")
            raise

    async def get_total_messages(self) -> int:
        """Obtener el número total de mensajes"""
        if not self.connected:
            raise ConnectionError("Base de datos no conectada. No se pueden contar los mensajes.")

        try:
            count = await self.collection.count_documents({})
            return count
        except Exception as e:
            print(f"Error al contar los mensajes: {e}")
            raise
