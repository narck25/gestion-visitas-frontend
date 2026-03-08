# Obtener token
$loginResponse = curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "@login_data.json"
$loginData = $loginResponse | ConvertFrom-Json
$token = $loginData.data.tokens.accessToken

Write-Host "Token obtenido: $($token.Substring(0, 50))..."

# Probar endpoint de visitas
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $visitsResponse = curl -s -H $headers http://localhost:3001/api/visits
    $visitsData = $visitsResponse | ConvertFrom-Json
    
    Write-Host "Success: $($visitsData.success)"
    Write-Host "Message: $($visitsData.message)"
    
    if ($visitsData.data) {
        Write-Host "Data type: $($visitsData.data.GetType().Name)"
        if ($visitsData.data -is [array]) {
            Write-Host "Visitas encontradas: $($visitsData.data.Count)"
            for ($i = 0; $i -lt [Math]::Min(3, $visitsData.data.Count); $i++) {
                $visit = $visitsData.data[$i]
                Write-Host "  Visita $($i+1): ID=$($visit.id), Cliente=$($visit.clientName), Estado=$($visit.status)"
            }
        } else {
            Write-Host "Data: $($visitsData.data)"
        }
    }
} catch {
    Write-Host "Error al obtener visitas: $_"
}