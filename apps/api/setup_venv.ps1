# Check if venv exists, if not create it
if (!(Test-Path .venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

# Activate venv
Write-Host "Activating virtual environment..."
& .\.venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing requirements..."
pip install -r requirements.txt

Write-Host "Setup complete. To run the server:"
Write-Host "uvicorn main:app --reload"
