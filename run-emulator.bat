@echo off
title Pixel Lite Emulator
echo ====================================================
echo Starting Lightweight Pixel_Lite Virtual Phone...
echo (Android Studio is NOT needed - saves ~2.5GB RAM)
echo ====================================================
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_Lite -memory 1536 -no-boot-anim
pause
