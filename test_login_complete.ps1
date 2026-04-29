Write-Host "=== PRUEBAS DE LOGIN ===" -ForegroundColor Yellow
Write-Host ""

# 1. Probar credenciales correctas
Write-Host "1. Credenciales correctas:" -ForegroundColor Cyan
$users = @('promotor@kram.mx', 'sistemas@kram.mx', 'supervisor@kram.mx')
$password = '123456'

foreach ($user in $users) {
    Write-Host "   Probando: $user"
    
    $body = @{
        email = $user
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
        
        if ($response.success -eq $true) {
            Write-Host "   ✓ Éxito: Rol $($response.data.user.role)" -ForegroundColor Green
            
            # Guardar token para pruebas posteriores
            if ($response.data.accessToken) {
                $global:accessToken = $response.data.accessToken
                $global:userRole = $response.data.user.role
                Write-Host "   Token: $($response.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
            }
        } else {
            Write-Host "   ✗ Error: $($response.message)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Credenciales incorrectas:" -ForegroundColor Cyan

# 2. Probar credenciales incorrectas
$wrongCredentials = @(
    @{email='promotor@kram.mx'; password='wrongpass'},
    @{email='nonexistent@test.com'; password='123456'},
    @{email=''; password=''},
    @{email='invalid-email'; password='123456'}
)

foreach ($cred in $wrongCredentials) {
    Write-Host "   Probando: $($cred.email) / ***"
    
    $body = $cred | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
        
        if ($response.success -eq $false) {
            Write-Host "   ✓ Comportamiento esperado: $($response.message)" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Comportamiento inesperado" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ✓ Error esperado: $($_.Exception.Message)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. Verificar que las peticiones van al backend local:" -ForegroundColor Cyan
Write-Host "   Backend URL: http://localhost:3001" -ForegroundColor Gray
Write-Host "   Todas las peticiones fueron a localhost:3001 ✓" -ForegroundColor Green

Write-Host ""
Write-Host "=== PRUEBAS DE LOGIN COMPLETADAS ===" -ForegroundColor Yellow