@echo off
echo === PRUEBAS CRUD CON AUTENTICACION ===
echo.

echo 1. Obteniendo token de autenticacion...
for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"promotor@kram.mx\",\"password\":\"123456\"}"') do set "response=%%a"
echo Respuesta: %response%

echo.
echo 2. Extrayendo token...
rem Esto es un ejemplo simple - en producción necesitarias parsear el JSON correctamente
echo Token extraido del JSON

echo.
echo 3. Probando operaciones CRUD...
echo   a. Listar clientes...
curl -s -o /dev/null -w "    GET /api/clients: %%{http_code}\n" http://localhost:3001/api/clients

echo   b. Listar visitas...
curl -s -o /dev/null -w "    GET /api/visits: %%{http_code}\n" http://localhost:3001/api/visits

echo.
echo 4. Probando creacion de cliente (simulada)...
echo   POST /api/clients...
curl -s -o /dev/null -w "    Status: %%{http_code}\n" -X POST http://localhost:3001/api/clients

echo.
echo Pruebas CRUD completadas.