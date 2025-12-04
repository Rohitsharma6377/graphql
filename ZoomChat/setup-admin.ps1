# Admin Panel Setup Script

Write-Host "🎯 Setting up HeartShare Admin Panel..." -ForegroundColor Cyan

# Check if MongoDB is installed
Write-Host "`n📦 Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>$null
    if ($mongoVersion) {
        Write-Host "✅ MongoDB is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ MongoDB not found. Please install MongoDB:" -ForegroundColor Red
    Write-Host "   Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "   Or use: choco install mongodb" -ForegroundColor Yellow
}

# Install required dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install mongoose

# Create environment file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "`n📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local - Please configure MongoDB URI" -ForegroundColor Green
} else {
    Write-Host "`n✅ .env.local already exists" -ForegroundColor Green
}

Write-Host "`n🎉 Admin Panel setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start MongoDB: mongod --dbpath C:\data\db" -ForegroundColor White
Write-Host "2. Configure .env.local with your MongoDB URI" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Visit: http://localhost:3000/admin" -ForegroundColor White
Write-Host "`n📚 Documentation: ADMIN_PANEL_DOCS.md" -ForegroundColor Cyan
