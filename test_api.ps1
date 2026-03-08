# Test API integration
Write-Host "=== Testing API Integration ==="

# Login as admin
Write-Host "1. Logging in as admin..."
$loginBody = @{
    email = "admin@empresa.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "   Login successful!"
    
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "   Token obtained (first 50 chars): $($token.Substring(0,50))..."
    
    # Test visits endpoint
    Write-Host "`n2. Testing /api/visits endpoint..."
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $visitsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/visits" -Method Get -Headers $headers
    Write-Host "   Success: $($visitsResponse.success)"
    Write-Host "   Message: $($visitsResponse.message)"
    
    if ($visitsResponse.data) {
        Write-Host "   Data type: $($visitsResponse.data.GetType().Name)"
        if ($visitsResponse.data -is [array]) {
            Write-Host "   Visits count: $($visitsResponse.data.Count)"
            if ($visitsResponse.data.Count -gt 0) {
                Write-Host "`n   First 3 visits:"
                for ($i = 0; $i -lt [Math]::Min(3, $visitsResponse.data.Count); $i++) {
                    $visit = $visitsResponse.data[$i]
                    Write-Host "   - Visit $($i+1): ID=$($visit.id), Client=$($visit.clientName), Status=$($visit.status), Created=$($visit.createdAt)"
                }
            }
        } else {
            Write-Host "   Data: $($visitsResponse.data | ConvertTo-Json -Depth 2)"
        }
    }
    
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host "   Error details:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test completed ==="