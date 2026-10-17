# Creates InputNexus_Package.zip for easy sharing and distribution
$SourceDir = $PSScriptRoot
$ZipPath = "$SourceDir\InputNexus_Package.zip"

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Write-Host "Creating shareable zip package with native executable and custom icon..." -ForegroundColor Cyan

Compress-Archive -Path "$SourceDir\InputNexus.exe", "$SourceDir\index_standalone.html", "$SourceDir\devices_data.js", "$SourceDir\scan_devices.ps1", "$SourceDir\native_bridge.ps1", "$SourceDir\Launch-InputNexus.bat", "$SourceDir\Install-InputNexus.ps1", "$SourceDir\README.txt", "$SourceDir\icon.jpg", "$SourceDir\app.ico" -DestinationPath $ZipPath -Force

Write-Host "Zip package created successfully: $ZipPath" -ForegroundColor Green
