$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root 'dist'
$src = Join-Path $dist 'iex_src'
$targetExe = Join-Path $dist 'Snake-Game-App.exe'
$sedPath = Join-Path $dist 'snake_app.sed'

New-Item -ItemType Directory -Path $dist -Force | Out-Null
if (Test-Path $src) { Remove-Item $src -Recurse -Force }
New-Item -ItemType Directory -Path $src -Force | Out-Null

Copy-Item (Join-Path $root 'index.html') (Join-Path $src 'index.html') -Force
Copy-Item (Join-Path $root 'snake.css') (Join-Path $src 'snake.css') -Force
Copy-Item (Join-Path $root 'snake.js') (Join-Path $src 'snake.js') -Force

Set-Content -Encoding ASCII -NoNewline -Path (Join-Path $src 'run_snake.bat') -Value "@echo off`r`nstart `"Snake`" `%~dp0index.html`r`n"

if (Test-Path $targetExe) { Remove-Item $targetExe -Force }

$sed = @"
[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=1
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=
TargetName=$targetExe
FriendlyName=Snake Game
AppLaunched=run_snake.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles

[SourceFiles]
SourceFiles0=$src

[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
%FILE3%=

[Strings]
FILE0=index.html
FILE1=snake.css
FILE2=snake.js
FILE3=run_snake.bat
"@

Set-Content -Encoding ASCII -NoNewline -Path $sedPath -Value $sed

& iexpress.exe /N $sedPath | Out-Null

if (!(Test-Path $targetExe)) {
  throw "IExpress did not produce output: $targetExe"
}

Write-Output "Created: $targetExe"