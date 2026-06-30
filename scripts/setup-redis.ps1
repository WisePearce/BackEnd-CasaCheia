# Configura Redis do WSL para ser acessível pelo Windows
# Uso: 
#   .\scripts\setup-redis.ps1              (atualiza .env com IP atual do WSL)
#   .\scripts\setup-redis.ps1 -PortProxy   (configura portproxy + .env, requer Admin)

param([switch]$PortProxy)

$envPath = Join-Path $PSScriptRoot "..\.env"

# Pega o IP do WSL
$wslIp = wsl hostname -I | ForEach-Object { $_.Split(' ')[0] }
Write-Host "WSL IP: $wslIp" -ForegroundColor Cyan

if ($PortProxy) {
    # Remove regra antiga se existir
    netsh interface portproxy delete v4tov4 listenport=6379 listenaddress=127.0.0.1 2>$null
    netsh interface portproxy add v4tov4 listenport=6379 listenaddress=127.0.0.1 connectport=6379 connectaddress=$wslIp
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Portproxy configurado! Redis acessível via localhost:6379" -ForegroundColor Green
        $redisUrl = "redis://localhost:6379"
    } else {
        Write-Host "Falha ao configurar portproxy (execute como Administrador)" -ForegroundColor Red
        $redisUrl = "redis://${wslIp}:6379"
    }
} else {
    $redisUrl = "redis://${wslIp}:6379"
}

# Atualiza .env
$content = Get-Content $envPath -Raw
$content = $content -replace 'REDIS_URL_DEV=redis://.*:6379', "REDIS_URL_DEV=$redisUrl"
Set-Content $envPath -Value $content
Write-Host ".env atualizado: REDIS_URL_DEV=$redisUrl" -ForegroundColor Green
