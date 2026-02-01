# ai-python/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (needed for PDF processing)
RUN apt-get update && apt-get install -y build-essential libpoppler-cpp-dev

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 5001

# Run the app
CMD ["python", "main.py"]