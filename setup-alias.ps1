# Run this once to set up a global PowerShell alias
# This will add the alias to your PowerShell profile

$aliasCommand = @"
# React Native Clean Build Alias
function Clean-RNBuild {
    Remove-Item -Recurse -Force @("android\app\.cxx", "android\app\build", "android\build", "node_modules\.cache") -ErrorAction SilentlyContinue
    Write-Host "✅ All builds removed!" -ForegroundColor Green
}
Set-Alias -Name "rnclean" -Value Clean-RNBuild
"@

# Add to PowerShell profile
$profilePath = $PROFILE
if (!(Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
}

Add-Content -Path $profilePath -Value "`n$aliasCommand"
Write-Host "✅ Alias 'rnclean' added to PowerShell profile!" -ForegroundColor Green
Write-Host "Restart PowerShell or run: . `$PROFILE" -ForegroundColor Yellow
