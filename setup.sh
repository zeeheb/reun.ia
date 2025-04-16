#!/bin/bash

# Create a virtual environment
echo "Creating virtual environment..."
python -m venv streamlit_env

# Activate virtual environment
echo "Activating virtual environment..."
source streamlit_env/bin/activate

# Install dependencies 
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the Streamlit app
echo "Starting Streamlit app..."
streamlit run streamlit_app.py 