@echo off
echo === PRUEBAS DE NAVEGACION ===
echo.

echo Probando rutas publicas:
echo -------------------------
curl -s -o /dev/null -w "  /: %%{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "  /auth/login: %%{http_code}\n" http://localhost:3000/auth/login
curl -s -o /dev/null -w "  /health: %%{http_code}\n" http://localhost:3000/health
curl -s -o /dev/null -w "  /unauthorized: %%{http_code}\n" http://localhost:3000/unauthorized

echo.
echo Probando rutas protegidas (sin autenticacion):
echo ----------------------------------------------
curl -s -o /dev/null -w "  /mis-visitas: %%{http_code}\n" http://localhost:3000/mis-visitas
curl -s -o /dev/null -w "  /nueva-visita: %%{http_code}\n" http://localhost:3000/nueva-visita
curl -s -o /dev/null -w "  /clientes: %%{http_code}\n" http://localhost:3000/clientes
curl -s -o /dev/null -w "  /visitas: %%{http_code}\n" http://localhost:3000/visitas
curl -s -o /dev/null -w "  /admin: %%{http_code}\n" http://localhost:3000/admin
curl -s -o /dev/null -w "  /supervisor: %%{http_code}\n" http://localhost:3000/supervisor

echo.
echo === VERIFICANDO CONEXION BACKEND ===
curl -s -o /dev/null -w "Backend health: %%{http_code}\n" http://localhost:3001/health

echo.
echo Pruebas completadas.