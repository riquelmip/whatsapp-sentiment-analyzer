FROM python:3.11-slim

WORKDIR /app

# Instalar todas las dependencias SSL necesarias para MongoDB Atlas
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    openssl \
    libssl-dev \
    libffi-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install certifi \
    && pip install -r requirements.txt

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]