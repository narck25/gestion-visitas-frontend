# Script para probar FormData simple sin archivos
$token = Get-Content -Path "token_promotor_new.txt" -Raw

# Construir el cuerpo multipart/form-data simple
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"clientId`""
$bodyLines += ""
$bodyLines += "0aeb08fe-a567-424a-9d02-3875c2795b49"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"notes`""
$bodyLines += ""
$bodyLines += "Test sin archivos"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"latitude`""
$bodyLines += ""
$bodyLines += "19.4326"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"longitude`""
$bodyLines += ""
$bodyLines += "-99.1332"
$bodyLines += "--$boundary--"

$body = $bodyLines -join $LF

# Enviar la solicitud
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/visits" -Method Post -Headers $headers -Body $body
    Write-Host "Success: $($response | ConvertTo-Json -Depth 10)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}