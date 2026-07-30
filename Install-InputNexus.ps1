# InputNexus 1-Click Installer for Windows
# Installs InputNexus as a Desktop App and creates Desktop/Start Menu Shortcuts

$ErrorActionPreference = "Stop"

$InstallDir = "$env:LocalAppData\InputNexus"
$SourceDir = $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " InputNexus Windows Desktop App Installer " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Create target installation folder
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 2. Copy application files
Write-Host "[1/3] Copying application files to $InstallDir..." -ForegroundColor Yellow
Copy-Item "$SourceDir\index_standalone.html" "$InstallDir\" -Force
Copy-Item "$SourceDir\Launch-InputNexus.bat" "$InstallDir\" -Force

# 3. Create Desktop Shortcut
Write-Host "[2/3] Creating Desktop shortcut..." -ForegroundColor Yellow
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\InputNexus.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "$InstallDir\Launch-InputNexus.bat"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "InputNexus - Multi-Device Input Manager & Realtime Analyzer"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

# 4. Create Start Menu Shortcut
Write-Host "[3/3] Creating Start Menu shortcut..." -ForegroundColor Yellow
$StartMenuPath = [System.Environment]::GetFolderPath("StartMenu") + "\Programs"
$StartShortcutPath = "$StartMenuPath\InputNexus.lnk"
$StartShortcut = $WshShell.CreateShortcut($StartShortcutPath)
$StartShortcut.TargetPath = "$InstallDir\Launch-InputNexus.bat"
$StartShortcut.WorkingDirectory = $InstallDir
$StartShortcut.Description = "InputNexus - Multi-Device Input Manager & Realtime Analyzer"
$StartShortcut.WindowStyle = 1
$StartShortcut.Save()

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " INSTALLATION COMPLETED SUCCESSFULLY!    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Desktop shortcut created: InputNexus.lnk" -ForegroundColor White
Write-Host "You can now launch InputNexus from your Desktop or Start Menu!" -ForegroundColor White
