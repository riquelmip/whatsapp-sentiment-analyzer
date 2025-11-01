import os
import json
from openai import OpenAI
from typing import Dict
import asyncio
import httpx

from models import AIAnalysis

class AIAnalyzer:
    """Clase para analizar mensajes usando OpenAI"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("OPENAI_API_KEY no esta configurada. Usando analisis basico")
            self.client = None
        else:
            # Configurar cliente OpenAI
            self.client = OpenAI(api_key=self.api_key)
        
        # Prompt
        self.system_prompt = """
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
"""

    async def analyze_message(self, message_text: str) -> Dict:
        """
        Analizar un mensaje usando OpenAI y devolver el análisis estructurado
        """
        try:
            if not self.client:
                # Fallback: análisis básico sin IA
                print("Usando analisis basico (OpenAI no configurada)")
                return self._basic_analysis(message_text)
            
            # Usar API de OpenAI
            print(f"Analizando con OpenAI: {message_text[:50]}...")

            # Ejecutar en un hilo separado para evitar bloquear el loop async
            import concurrent.futures
            
            def sync_openai_call():
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": message_text}
                    ],
                    max_tokens=200,
                    temperature=0.1 
                )
                return response.choices[0].message.content.strip()
            
            # Ejecutar la llamada síncrona en un executor
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as executor:
                ai_response = await loop.run_in_executor(executor, sync_openai_call)
            
            print(f"🤖 OpenAI Input: {message_text}")
            print(f"🤖 OpenAI Response: {ai_response}")
            
            # Parsear la respuesta JSON
            try:
                analysis = json.loads(ai_response)
                
                # Validar que tenga los campos requeridos
                required_fields = ["sentimiento", "tema", "resumen"]
                if all(field in analysis for field in required_fields):
                    print(f"✅ Analisis de IA exitoso: {analysis['sentimiento']} - {analysis['tema']}")
                    return analysis
                else:
                    print(f"Formato de respuesta de IA no válido: {analysis}")
                    return self._basic_analysis(message_text)
                    
            except json.JSONDecodeError as e:
                print(f"Error parseando JSON: {e}")
                print(f"IA respuesta: {ai_response}")
                return self._basic_analysis(message_text)
                    
        except Exception as e:
            print(f"Error en el análisis de IA: {e}")
            return self._basic_analysis(message_text)
    
    def _basic_analysis(self, message_text: str) -> Dict:
        """
        Análisis básico basado en palabras clave cuando la IA no está disponible
        """
        message_lower = message_text.lower()
        
        # Análisis de sentimiento básico
        positive_words = ["bueno", "excelente", "genial", "perfecto", "delicioso", "rápido", "amable", "recomiendo", "gracias", "feliz", "contento"]
        negative_words = ["malo", "terrible", "lento", "sucio", "caro", "frío", "queja", "problema", "disgusto", "molesto", "horrible"]
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            sentiment = "positivo"
        elif negative_count > positive_count:
            sentiment = "negativo"
        else:
            sentiment = "neutro"
        
        # Análisis de tema básico
        theme_keywords = {
            "Servicio al Cliente": ["servicio", "atención", "personal", "mesero", "espera", "rápido", "lento", "amable"],
            "Calidad del Producto": ["comida", "café", "sabor", "delicioso", "rico", "frío", "caliente", "fresco"],
            "Precio": ["precio", "caro", "barato", "descuento", "promoción", "cuesta", "valor"],
            "Limpieza": ["limpio", "sucio", "baño", "mesa", "higiene", "limpieza"]
        }
        
        theme_scores = {}
        for theme, keywords in theme_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            theme_scores[theme] = score
        
        # Seleccionar el tema con mayor puntuación
        if theme_scores and max(theme_scores.values()) > 0:
            theme = max(theme_scores, key=theme_scores.get)
        else:
            theme = "Otro"
        
        # Crear resumen básico
        summary = message_text[:97] + "..." if len(message_text) > 100 else message_text
        
        return {
            "sentimiento": sentiment,
            "tema": theme,
            "resumen": summary
        }
