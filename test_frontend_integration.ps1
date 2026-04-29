# Test frontend integration with backend
Write-Host "=== Testing Frontend Integration ==="
Write-Host "Frontend URL: http://localhost:3000"
Write-Host "Backend URL: http://localhost:3001"
Write-Host ""

# Test 1: Check if frontend is running
Write-Host "1. Testing frontend availability..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Frontend is running (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend is not accessible: $_" -ForegroundColor Red
}

# Test 2: Check if backend is running
Write-Host "`n2. Testing backend availability..."
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Backend is running (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is not accessible: $_" -ForegroundColor Red
}

# Test 3: Test API endpoint
Write-Host "`n3. Testing API endpoint..."
try {
    $loginBody = @{
        email = "promotor1@empresa.com"
        password = "123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "   ✓ Login successful (Token obtained)" -ForegroundColor Green
    
    # Test visits endpoint
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $visitsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/visits" -Method Get -Headers $headers
    Write-Host "   ✓ Visits endpoint working (Found $($visitsResponse.data.visits.Count) visits)" -ForegroundColor Green
    
} catch {
    Write-Host "   ✗ API test failed: $_" -ForegroundColor Red
}

# Test 4: Check environment configuration
Write-Host "`n4. Checking environment configuration..."
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    Write-Host "   ✓ .env file exists" -ForegroundColor Green
    
    if ($envContent -match "NEXT_PUBLIC_API_URL=http://localhost:3001") {
        Write-Host "   ✓ API URL correctly configured for local development" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ API URL may not be configured correctly" -ForegroundColor Yellow
        Write-Host "     Current .env content:" -ForegroundColor Gray
        Write-Host "     $envContent" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
}

Write-Host "`n=== Integration Test Summary ==="
Write-Host "To test the complete integration:"
Write-Host "1. Open browser to: http://localhost:3000"
Write-Host "2. Login with: promotor1@empresa.com / 123456"
Write-Host "3. Navigate to 'Mis Visitas'"
Write-Host "4. Verify that real visits from backend are displayed"
Write-Host ""
Write-Host "Note: The frontend should now be using real API data instead of hardcoded examples."