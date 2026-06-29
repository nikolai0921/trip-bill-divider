param(
  [string]$VersionName = "1.0.0"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidDir = Join-Path $root "android"
$propertiesPath = Join-Path $androidDir "keystore.properties"
$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"

if (-not (Test-Path $propertiesPath)) {
  throw "Missing android/keystore.properties. Run scripts/create-upload-keystore.ps1 first."
}

if (Test-Path $androidStudioJbr) {
  $env:JAVA_HOME = $androidStudioJbr
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Push-Location $root
try {
  npm run cap:sync
  if ($LASTEXITCODE -ne 0) {
    throw "npm run cap:sync failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

$source = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
Remove-Item -Path $source -Force -ErrorAction SilentlyContinue

Push-Location $androidDir
try {
  .\gradlew.bat bundleRelease
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle bundleRelease failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

if (-not (Test-Path $source)) {
  throw "Release AAB was not created: $source"
}

$releaseDir = Join-Path $root "release\android"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
$target = Join-Path $releaseDir "trip-bill-divider-$VersionName.aab"
Copy-Item -Path $source -Destination $target -Force

Write-Host "Signed Android App Bundle created:" -ForegroundColor Green
Write-Host "  $target"
