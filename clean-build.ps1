# Single command to remove all builds
Remove-Item -Recurse -Force @("android\app\.cxx", "android\app\build", "android\build", "node_modules\.cache") -ErrorAction SilentlyContinue; Write-Host "✅ All builds removed!" -ForegroundColor Green
