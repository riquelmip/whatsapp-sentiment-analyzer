FROM python:3.11-slim

WORKDIR /app

# Instalar certificados SSL y curl para MongoDB Atlas
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]