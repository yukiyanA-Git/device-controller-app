# Creates InputNexus_Package.zip for easy sharing and distribution
$SourceDir = $PSScriptRoot
$ZipPath = "$SourceDir\InputNexus_Package.zip"

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Write-Host "Creating shareable zip package..." -ForegroundColor Cyan

Compress-Archive -Path "$SourceDir\index_standalone.html", "$SourceDir\Launch-InputNexus.bat", "$SourceDir\Install-InputNexus.ps1", "$SourceDir\README.txt" -DestinationPath $ZipPath -Force

Write-Host "Zip package created successfully: $ZipPath" -ForegroundColor Green
