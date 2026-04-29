Write-Host "=== PRUEBAS CRUD AVANZADAS ===" -ForegroundColor Yellow
Write-Host ""

# 1. Obtener token de autenticación
Write-Host "1. Obteniendo token de autenticación..." -ForegroundColor Cyan
$loginBody = @{
    email = "promotor@kram.mx"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -eq $true) {
        $accessToken = $loginResponse.data.tokens.accessToken
        $userRole = $loginResponse.data.user.role
        Write-Host "   ✓ Token obtenido para rol: $userRole" -ForegroundColor Green
        Write-Host "   Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Error al obtener token: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Configurar headers con token
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

# 3. Probar operaciones CRUD
Write-Host "2. Probando operaciones CRUD..." -ForegroundColor Cyan

# a. Listar clientes
Write-Host "   a. Listar clientes (GET /api/clients)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/clients" -Method Get -Headers $headers
    Write-Host "      ✓ Éxito: $($response.data.Count) clientes encontrados" -ForegroundColor Green
}
catch {
    Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# b. Listar visitas
Write-Host "   b. Listar visitas (GET /api/visits)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/visits" -Method Get -Headers $headers
    Write-Host "      ✓ Éxito: $($response.data.Count) visitas encontradas" -ForegroundColor Green
}
catch {
    Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# c. Crear cliente de prueba
Write-Host "   c. Crear cliente de prueba (POST /api/clients)" -ForegroundColor White
$clienteBody = @{
    name = "Cliente Test QA"
    email = "cliente_test@example.com"
    phone = "5551234567"
    address = "Calle Test 123"
    city = "Ciudad Test"
    state = "Estado Test"
    postalCode = "12345"
    company = "Empresa Test"
    contactPerson = "Persona Test"
    notes = "Cliente creado durante pruebas QA"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/clients" -Method Post -Body $clienteBody -Headers $headers
    if ($response.success -eq $true) {
        $clienteId = $response.data.id
        Write-Host "      ✓ Cliente creado con ID: $clienteId" -ForegroundColor Green
        
        # d. Actualizar cliente
        Write-Host "   d. Actualizar cliente (PUT /api/clients/$clienteId)" -ForegroundColor White
        $updateBody = @{
            name = "Cliente Test QA Actualizado"
            phone = "5557654321"
            notes = "Cliente actualizado durante pruebas QA"
        } | ConvertTo-Json
        
        try {
            $updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/clients/$clienteId" -Method Put -Body $updateBody -Headers $headers
            if ($updateResponse.success -eq $true) {
                Write-Host "      ✓ Cliente actualizado correctamente" -ForegroundColor Green
            } else {
                Write-Host "      ✗ Error al actualizar: $($updateResponse.message)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # e. Eliminar cliente
        Write-Host "   e. Eliminar cliente (DELETE /api/clients/$clienteId)" -ForegroundColor White
        try {
            $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/clients/$clienteId" -Method Delete -Headers $headers
            if ($deleteResponse.success -eq $true) {
                Write-Host "      ✓ Cliente eliminado correctamente" -ForegroundColor Green
            } else {
                Write-Host "      ✗ Error al eliminar: $($deleteResponse.message)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "      ✗ Error al crear cliente: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Probando formularios y validaciones..." -ForegroundColor Cyan

# f. Probar formulario vacío
Write-Host "   f. Probar creación con datos inválidos" -ForegroundColor White
$invalidBody = @{
    name = ""
    email = "email-invalido"
    phone = ""
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/clients" -Method Post -Body $invalidBody -Headers $headers
    if ($response.success -eq $false -and $response.errors) {
        Write-Host "      ✓ Validaciones funcionan: $($response.message)" -ForegroundColor Green
        foreach ($err in $response.errors.GetEnumerator()) {
            Write-Host "        - $($err.Key): $($err.Value -join ', ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "      ✗ Validaciones no funcionan como se esperaba" -ForegroundColor Red
    }
}
catch {
    Write-Host "      ✓ Error de validación esperado: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== PRUEBAS CRUD COMPLETADAS ===" -ForegroundColor Yellow