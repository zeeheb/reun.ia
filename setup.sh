#!/bin/bash

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing requirements..."
pip install -r requirements.txt

# Run the FastAPI app
echo "Starting FastAPI application..."
uvicorn app:app --reload --host 0.0.0.0 --port 8000 