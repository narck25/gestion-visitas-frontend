# Script para probar FormData con multipart/form-data
$token = Get-Content -Path "token_promotor_new.txt" -Raw

# Crear un archivo de prueba simple
$testFile = "test_image.txt"
"Test image content" | Out-File -FilePath $testFile -Encoding UTF8

# Construir el cuerpo multipart/form-data
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
$bodyLines += "Test desde PowerShell"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"latitude`""
$bodyLines += ""
$bodyLines += "19.4326"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"longitude`""
$bodyLines += ""
$bodyLines += "-99.1332"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"beforePhotos`"; filename=`"test_image.txt`""
$bodyLines += "Content-Type: text/plain"
$bodyLines += ""
$bodyLines += (Get-Content -Path $testFile -Raw)
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"afterPhotos`"; filename=`"test_image2.txt`""
$bodyLines += "Content-Type: text/plain"
$bodyLines += ""
$bodyLines += (Get-Content -Path $testFile -Raw)
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

# Limpiar
Remove-Item -Path $testFile -ErrorAction SilentlyContinue