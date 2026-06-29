param(
  [string]$Alias = "upload",
  [string]$DName = "CN=nikolai0921, OU=Trip Bill Divider, O=nikolai0921, L=Taipei, ST=Taiwan, C=TW",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidDir = Join-Path $root "android"
$keystorePath = Join-Path $androidDir "upload-keystore.jks"
$propertiesPath = Join-Path $androidDir "keystore.properties"
$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
$keytool = Join-Path $androidStudioJbr "bin\keytool.exe"

if (-not (Test-Path $keytool)) {
  $keytoolCommand = Get-Command keytool -ErrorAction SilentlyContinue
  if ($keytoolCommand) {
    $keytool = $keytoolCommand.Source
  } else {
    throw "keytool not found. Install Android Studio or add Java keytool to PATH."
  }
}

if ((Test-Path $keystorePath) -and -not $Force) {
  throw "Keystore already exists: $keystorePath. Re-run with -Force only if you intentionally want to replace it."
}

function ConvertTo-PlainText {
  param([securestring]$SecureValue)
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

Write-Host "Create Android upload keystore for Google Play." -ForegroundColor Cyan
Write-Host "Use a strong password and store it somewhere safe. Losing it can block future app updates." -ForegroundColor Yellow

$storePasswordSecure = Read-Host "Keystore password" -AsSecureString
$keyPasswordSecure = Read-Host "Key password (can be the same)" -AsSecureString
$storePassword = ConvertTo-PlainText $storePasswordSecure
$keyPassword = ConvertTo-PlainText $keyPasswordSecure

if ($storePassword.Length -lt 6 -or $keyPassword.Length -lt 6) {
  throw "Passwords must be at least 6 characters."
}

$env:TRIP_BILL_STORE_PASSWORD = $storePassword
$env:TRIP_BILL_KEY_PASSWORD = $keyPassword

try {
  & $keytool `
    -genkeypair `
    -v `
    -keystore $keystorePath `
    -storetype JKS `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -alias $Alias `
    -dname $DName `
    -storepass:env TRIP_BILL_STORE_PASSWORD `
    -keypass:env TRIP_BILL_KEY_PASSWORD

  $properties = @"
storeFile=upload-keystore.jks
storePassword=$storePassword
keyAlias=$Alias
keyPassword=$keyPassword
"@
  Set-Content -Path $propertiesPath -Value $properties -Encoding UTF8
} finally {
  Remove-Item Env:\TRIP_BILL_STORE_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:\TRIP_BILL_KEY_PASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Created:" -ForegroundColor Green
Write-Host "  $keystorePath"
Write-Host "  $propertiesPath"
Write-Host "Both files are ignored by git. Back them up securely." -ForegroundColor Yellow
