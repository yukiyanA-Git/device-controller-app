@echo off
title InputNexus - Input Device Manager
:: Check if MS Edge exists (Pre-installed on all Windows 10 & 11 PCs)
set EDGE_PATH="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set EDGE_PATH64="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

set APP_PATH=%~dp0index_standalone.html

if exist %EDGE_PATH64% (
    start "" %EDGE_PATH64% --app="file:///%APP_PATH:\=/%" --window-size=1280,850
) else if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app="file:///%APP_PATH:\=/%" --window-size=1280,850
) else (
    start "" "%APP_PATH%"
)
