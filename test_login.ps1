$users = @('promotor@kram.mx', 'sistemas@kram.mx', 'supervisor@kram.mx')
$password = '123456'

foreach ($user in $users) {
    Write-Host "Probando login para: $user"
    
    $body = @{
        email = $user
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
        
        Write-Host "  Éxito: Token recibido" -ForegroundColor Green
        Write-Host "  Rol: $($response.data.user.role)" -ForegroundColor Cyan
        Write-Host "  Token: $($response.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}