$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $root 'dist'
$bundleDir = Join-Path $outDir 'snake-app'
$zipPath = Join-Path $outDir 'Snake-Game-Windows.zip'

if (Test-Path $bundleDir) { Remove-Item $bundleDir -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

New-Item -ItemType Directory -Path $bundleDir -Force | Out-Null

Copy-Item (Join-Path $root 'index.html') (Join-Path $bundleDir 'index.html')
Copy-Item (Join-Path $root 'snake.css') (Join-Path $bundleDir 'snake.css')
Copy-Item (Join-Path $root 'snake.js') (Join-Path $bundleDir 'snake.js')
Copy-Item (Join-Path $root 'launch_snake.bat') (Join-Path $bundleDir 'launch_snake.bat')
Copy-Item (Join-Path $root 'README_SHARE.txt') (Join-Path $bundleDir 'README_SHARE.txt')

Compress-Archive -Path (Join-Path $bundleDir '*') -DestinationPath $zipPath -Force
Write-Output "Created: $zipPath"