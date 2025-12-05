# 🚀 Start All Servers

Write-Host "💕 HeartShare - Starting All Servers" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD
    Set-Location -Path "server"
    npm run dev
}

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD
    Set-Location -Path "ZoomChat"
    npm run dev
}

Write-Host "🔄 Starting backend server..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "🔄 Starting frontend server..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Wait for jobs and show output
try {
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob
        $frontendOutput = Receive-Job -Job $frontendJob
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Green
        }
        
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob
    Stop-Job -Job $frontendJob
    Remove-Job -Job $backendJob
    Remove-Job -Job $frontendJob
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
