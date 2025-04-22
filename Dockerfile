FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads static

# Expose the port that the app runs on
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"] 