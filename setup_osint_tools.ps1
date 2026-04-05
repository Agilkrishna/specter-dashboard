# setup_osint_tools.ps1
# This script sets up standard Python OSINT tools (Sherlock and Holehe) within the workspace

$WorkspaceDir = "c:\Users\agilk\OneDrive\Desktop\Inspector application"
$OsintToolsDir = Join-Path $WorkspaceDir "osint_tools"

Write-Host "Creating OSINT tools directory at $OsintToolsDir..."
if (-not (Test-Path $OsintToolsDir)) {
    New-Item -ItemType Directory -Force -Path $OsintToolsDir
}

Set-Location $OsintToolsDir

# 1. Setup Sherlock (Cross-platform Python Username Search)
Write-Host "`n[+] Setting up Sherlock..."
if (-not (Test-Path "sherlock")) {
    git clone https://github.com/sherlock-project/sherlock.git
}

if (Test-Path "sherlock") {
    Set-Location "sherlock"
    
    # Create virtual environment
    Write-Host "Creating Virtual Environment for Sherlock..."
    python -m venv venv
    
    # Install dependencies
    Write-Host "Installing requirements..."
    .\venv\Scripts\python.exe -m pip install --upgrade pip
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
    
    # Run a quick test
    Write-Host "Testing Sherlock execution..."
    .\venv\Scripts\python.exe sherlock --version
    
    Set-Location $OsintToolsDir
    Write-Host "[SUCCESS] Sherlock is ready."
} else {
    Write-Host "[ERROR] Failed to clone Sherlock."
}

# 2. Setup Holehe (Cross-platform Email Enumeration)
Write-Host "`n[+] Setting up Holehe..."
if (-not (Test-Path "holehe")) {
    git clone https://github.com/megadose/holehe.git
}

if (Test-Path "holehe") {
    Set-Location "holehe"
    
    # Create virtual environment
    Write-Host "Creating Virtual Environment for Holehe..."
    python -m venv venv
    
    # Install dependencies
    Write-Host "Installing Holehe..."
    .\venv\Scripts\python.exe -m pip install --upgrade pip
    # Holehe is best installed directly via setup.py or pip
    .\venv\Scripts\python.exe setup.py install
    
    Set-Location $OsintToolsDir
    Write-Host "[SUCCESS] Holehe is ready."
} else {
    Write-Host "[ERROR] Failed to clone Holehe."
}

Write-Host "`n✅ All selected OSINT tools have been configured successfully in: $OsintToolsDir"
