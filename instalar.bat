@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title GITT - Instalador automatico

REM ============================================================
REM   Instalador automatico del proyecto GITT
REM   - Detecta la carpeta del proyecto (funciona donde sea
REM     que se haya clonado el repositorio).
REM   - Verifica dependencias del sistema (Node, npm, Docker).
REM   - Si falta algo, intenta instalarlo con winget; si no
REM     puede, muestra instrucciones claras.
REM   - Instala dependencias de backend y frontend.
REM   - Levanta Oracle XE en Docker e inicializa el esquema.
REM ============================================================

REM ---------- Detectar carpeta del proyecto ----------
set "RAIZ=%~dp0"
if "%RAIZ:~-1%"=="\" set "RAIZ=%RAIZ:~0,-1%"

set "BACKEND=%RAIZ%\gitt\backend"
set "FRONTEND=%RAIZ%\gitt\frontend"
set "COMPOSE=%RAIZ%\docker-compose.yml"

echo.
echo ============================================================
echo   INSTALADOR GITT - Gestion de Inventario Tecnologico FISEI
echo ============================================================
echo.
echo Carpeta del proyecto detectada:
echo   %RAIZ%
echo.

REM ---------- Verificar estructura del proyecto ----------
if not exist "%BACKEND%\package.json" goto :error_estructura
if not exist "%FRONTEND%\package.json" goto :error_estructura
if not exist "%COMPOSE%"               goto :error_estructura

REM ============================================================
REM   PASO 1: Node.js
REM ============================================================
echo [1/6] Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 goto :falta_node
for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
echo       OK - Node.js !NODE_VER!
goto :paso_npm

:falta_node
echo       [X] Node.js NO esta instalado.
call :intentar_winget "OpenJS.NodeJS.LTS" "Node.js LTS"
if errorlevel 1 (
    echo.
    echo Instala Node.js manualmente:
    echo   1) Abre https://nodejs.org/  ^(version LTS^)
    echo   2) Ejecuta el instalador y deja marcado "Add to PATH".
    echo   3) Cierra y vuelve a abrir esta ventana, luego corre instalar.bat de nuevo.
    pause
    exit /b 1
)
echo       Reabre una nueva ventana CMD para que Node aparezca en PATH y vuelve a ejecutar instalar.bat
pause
exit /b 0

REM ============================================================
REM   PASO 2: npm
REM ============================================================
:paso_npm
echo [2/6] Verificando npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo       [X] npm no esta disponible aunque Node si. Reinstala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set "NPM_VER=%%v"
echo       OK - npm !NPM_VER!

REM ============================================================
REM   PASO 3: Docker
REM ============================================================
echo [3/6] Verificando Docker...
where docker >nul 2>nul
if errorlevel 1 goto :falta_docker

REM Comprobar que el daemon este corriendo
docker info >nul 2>nul
if errorlevel 1 goto :docker_no_corre
echo       OK - Docker instalado y en ejecucion
goto :paso_backend

:falta_docker
echo       [X] Docker Desktop NO esta instalado.
call :intentar_winget "Docker.DockerDesktop" "Docker Desktop"
if errorlevel 1 (
    echo.
    echo Instala Docker Desktop manualmente:
    echo   1) Abre https://www.docker.com/products/docker-desktop/
    echo   2) Descarga e instala Docker Desktop para Windows.
    echo   3) Reinicia el equipo si el instalador lo pide.
    echo   4) Abre Docker Desktop al menos una vez para que arranque el motor.
    echo   5) Vuelve a ejecutar instalar.bat
    pause
    exit /b 1
)
echo.
echo Docker Desktop fue instalado. Ahora:
echo   1) ABRELO manualmente desde el menu de inicio.
echo   2) Espera a que diga "Docker Desktop is running".
echo   3) Vuelve a ejecutar instalar.bat
pause
exit /b 0

:docker_no_corre
echo       [!] Docker esta instalado pero el motor no responde.
echo           Abre Docker Desktop desde el menu de inicio y espera a que
echo           aparezca el mensaje "Docker Desktop is running" en la bandeja.
echo           Luego vuelve a ejecutar este .bat.
pause
exit /b 1

REM ============================================================
REM   PASO 4: Backend - npm install + .env
REM ============================================================
:paso_backend
echo.
echo [4/6] Instalando dependencias del BACKEND...
echo       Ruta: %BACKEND%
pushd "%BACKEND%"
call npm install
if errorlevel 1 (
    popd
    echo.
    echo [X] Fallo "npm install" en el backend.
    echo     Causas frecuentes:
    echo       - Sin conexion a internet o proxy/firewall bloqueando npm.
    echo       - Permisos: prueba abrir CMD como Administrador.
    echo       - Cache corrupta: ejecuta   npm cache clean --force
    echo     Vuelve a ejecutar instalar.bat tras solucionarlo.
    pause
    exit /b 1
)
popd

if not exist "%BACKEND%\.env" (
    if exist "%BACKEND%\.env.example" (
        copy /Y "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
        echo       .env creado a partir de .env.example
    )
)
echo       OK - Backend listo

REM ============================================================
REM   PASO 5: Frontend - npm install
REM ============================================================
echo.
echo [5/6] Instalando dependencias del FRONTEND...
echo       Ruta: %FRONTEND%
pushd "%FRONTEND%"
call npm install
if errorlevel 1 (
    popd
    echo.
    echo [X] Fallo "npm install" en el frontend.
    echo     Soluciones a probar:
    echo       - Verifica tu conexion a internet.
    echo       - Borra %FRONTEND%\node_modules y vuelve a intentar.
    echo       - Ejecuta   npm cache clean --force
    pause
    exit /b 1
)
popd
echo       OK - Frontend listo

REM ============================================================
REM   PASO 6: Base de datos Oracle en Docker
REM ============================================================
echo.
echo [6/6] Levantando Oracle XE en Docker...
echo       Esto puede tardar 2-5 minutos la primera vez
echo       (descarga la imagen ~2GB e inicializa el esquema).
echo.

pushd "%RAIZ%"
docker compose up -d
if errorlevel 1 (
    popd
    echo.
    echo [X] Fallo "docker compose up".
    echo     Posibles causas:
    echo       - Docker Desktop no esta corriendo. Abrelo y espera 30s.
    echo       - Puerto 1521 ya esta en uso por otra instancia de Oracle.
    echo         Detenla o cambia el puerto en docker-compose.yml
    echo       - Sin espacio en disco (la imagen pesa ~2GB).
    pause
    exit /b 1
)
popd

echo.
echo       Esperando a que Oracle este listo (puede tardar varios minutos)...
set /a INTENTOS=0
:esperar_oracle
set /a INTENTOS+=1
if !INTENTOS! GTR 60 (
    echo.
    echo [!] Oracle todavia no responde despues de varios minutos.
    echo     Revisa los logs con:   docker logs gitt-oracle
    echo     El contenedor sigue arrancando en segundo plano; cuando termine,
    echo     el backend podra conectarse.
    goto :final
)
for /f "tokens=*" %%h in ('docker inspect -f "{{.State.Health.Status}}" gitt-oracle 2^>nul') do set "ESTADO=%%h"
if /I "!ESTADO!"=="healthy" (
    echo       OK - Oracle XE listo y saludable
    goto :final
)
echo       ...estado actual: !ESTADO!  ^(intento !INTENTOS!/60^)
timeout /t 10 /nobreak >nul
goto :esperar_oracle

REM ============================================================
:final
echo.
echo ============================================================
echo   INSTALACION COMPLETADA
echo ============================================================
echo.
echo Servicios:
echo   - Oracle XE      :  localhost:1521/XEPDB1
echo   - Usuario BD     :  GITT_SCHEMA  /  GittPass2024
echo   - SYSTEM (admin) :  SYSTEM       /  GittRoot2024
echo.
echo Para arrancar la aplicacion:
echo.
echo   Backend  (API en http://localhost:3001):
echo     cd "%BACKEND%"
echo     npm run dev
echo.
echo   Frontend (UI en http://localhost:5173):
echo     cd "%FRONTEND%"
echo     npm run dev
echo.
echo Comandos utiles de Docker:
echo   docker compose ps           ^<-- ver estado de Oracle
echo   docker compose logs -f      ^<-- ver logs en tiempo real
echo   docker compose stop         ^<-- apagar Oracle
echo   docker compose start        ^<-- volver a encender Oracle
echo   docker compose down -v      ^<-- borrar TODO (incluida la BD)
echo.
pause
exit /b 0

REM ============================================================
REM   Subrutinas
REM ============================================================
:error_estructura
echo [ERROR] La estructura del proyecto no es la esperada.
echo Faltan uno o varios de:
echo   - %BACKEND%\package.json
echo   - %FRONTEND%\package.json
echo   - %COMPOSE%
echo.
echo Asegurate de ejecutar este .bat desde la raiz del repositorio clonado,
echo sin haber movido los archivos.
pause
exit /b 1

:intentar_winget
REM %1 = id de winget, %2 = nombre amigable
where winget >nul 2>nul
if errorlevel 1 (
    echo       winget no esta disponible en este Windows.
    exit /b 1
)
echo.
set /p "RESP=Quieres que intente instalar %~2 con winget? (s/n): "
if /I not "!RESP!"=="s" exit /b 1
winget install --id=%~1 -e --accept-source-agreements --accept-package-agreements
if errorlevel 1 (
    echo       winget no pudo instalar %~2 automaticamente.
    exit /b 1
)
exit /b 0
