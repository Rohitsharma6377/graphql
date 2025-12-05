# Complete Video Call System - Installation Script
# Run this script to set up everything

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Video Call System - Complete Setup             ║" -ForegroundColor Cyan
Write-Host "║   Node.js + Express + Socket.IO + MongoDB        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version | Select-String "version"
    Write-Host "✅ MongoDB installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB not found. Install from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

# Install server dependencies
Write-Host "`nInstalling server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

# Start MongoDB
Write-Host "`nStarting MongoDB..." -ForegroundColor Yellow
try {
    net start MongoDB 2>$null
    Write-Host "✅ MongoDB started" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB may already be running or not installed as service" -ForegroundColor Yellow
}

# Seed database
Write-Host "`nSeeding database..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
}

# Go back to root
Set-Location ..

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location ZoomChat
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Create .env.local if not exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`nCreating frontend .env.local..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:5000" | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Frontend .env.local created" -ForegroundColor Green
}

Set-Location ..

# Final summary
Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Setup Complete!                              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start the server:" -ForegroundColor White
Write-Host "     cd server && npm run dev" -ForegroundColor Gray
Write-Host "`n  2. Start the frontend (in new terminal):" -ForegroundColor White
Write-Host "     cd ZoomChat && npm run dev" -ForegroundColor Gray
Write-Host "`n  3. Open browser:" -ForegroundColor White
Write-Host "     http://localhost:3000" -ForegroundColor Gray

Write-Host "`n🔐 Default Credentials:" -ForegroundColor Cyan
Write-Host "  Admin:" -ForegroundColor White
Write-Host "    Email: admin@example.com" -ForegroundColor Gray
Write-Host "    Password: Admin@123" -ForegroundColor Gray
Write-Host "`n  Sample User:" -ForegroundColor White
Write-Host "    Email: john@example.com" -ForegroundColor Gray
Write-Host "    Password: password123" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Quick Start: QUICK_START.md" -ForegroundColor Gray
Write-Host "  - API Docs: server/README.md" -ForegroundColor Gray

Write-Host "`n🚀 Happy coding!" -ForegroundColor Green
