$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root 'dist'
$bundle = Join-Path $dist 'snake-exe-app'
$zip = Join-Path $dist 'Snake-Game-EXE-Bundle.zip'

if (Test-Path $bundle) { Remove-Item $bundle -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }
New-Item -ItemType Directory -Path $bundle -Force | Out-Null

Copy-Item (Join-Path $root 'Snake.exe') (Join-Path $bundle 'Snake.exe') -Force
Copy-Item (Join-Path $root 'index.html') (Join-Path $bundle 'index.html') -Force
Copy-Item (Join-Path $root 'snake.css') (Join-Path $bundle 'snake.css') -Force
Copy-Item (Join-Path $root 'snake.js') (Join-Path $bundle 'snake.js') -Force

Set-Content -NoNewline -Path (Join-Path $bundle 'README.txt') -Value @"
Snake EXE App
=============
1) Unzip this folder.
2) Double-click Snake.exe

Important: Keep Snake.exe, index.html, snake.css, and snake.js in the same folder.
"@

Compress-Archive -Path (Join-Path $bundle '*') -DestinationPath $zip -Force
Write-Output "Created: $zip"