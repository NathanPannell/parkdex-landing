param(
  [string]$TestEmail,
  [switch]$DeleteTestEmail
)

$ErrorActionPreference = 'Stop'
$credentialFile = 'C:\Users\n8tew\.codex\secrets\full-stack-delivery.env'
$projectId = 'noisy-smoke-89213665'

if (-not (Test-Path -LiteralPath $credentialFile)) { throw 'Protected provider credential file is unavailable.' }
if ($TestEmail -and $TestEmail -cnotmatch '^codex-landing-[a-f0-9]{8}@example\.com$') {
  throw 'Only an owned codex-landing test address may be inspected or deleted.'
}
if ($DeleteTestEmail -and -not $TestEmail) { throw '-DeleteTestEmail requires -TestEmail.' }

$vars = @{}
Get-Content -LiteralPath $credentialFile | ForEach-Object {
  if ($_ -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') { $vars[$matches[1]] = $matches[2] }
}
$env:NEON_API_KEY = $vars['NEON_API_KEY']
$url = neon connection-string main --project-id $projectId --database-name app --role-name app_owner --no-color --no-analytics
if ($LASTEXITCODE -ne 0 -or $url -notmatch '^postgres(ql)?://') { throw 'Could not obtain isolated landing database connection.' }

$uri = [Uri]$url
$parts = $uri.UserInfo.Split(':', 2)
$env:PGPASSWORD = [Uri]::UnescapeDataString($parts[1])
$env:PGSSLMODE = 'require'
$pgUser = [Uri]::UnescapeDataString($parts[0])
$pgPort = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$psqlArgs = @('-h', $uri.Host, '-p', $pgPort, '-U', $pgUser, '-d', 'app', '-v', 'ON_ERROR_STOP=1', '-At')

try {
  $exists = & psql @psqlArgs -c "SELECT to_regclass('public.android_beta_signups') IS NOT NULL"
  if ($LASTEXITCODE -ne 0 -or $exists -ne 't') { throw 'Landing waitlist table is missing.' }
  if ($TestEmail) {
    $count = & psql @psqlArgs -c "SELECT count(*) FROM android_beta_signups WHERE email_normalized = '$TestEmail'"
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect test signup.' }
    Write-Output "Owned test signup rows: $count"
    if ($DeleteTestEmail) {
      & psql @psqlArgs -c "DELETE FROM android_beta_signups WHERE email_normalized = '$TestEmail'" | Out-Null
      if ($LASTEXITCODE -ne 0) { throw 'Could not delete owned test signup.' }
      $after = & psql @psqlArgs -c "SELECT count(*) FROM android_beta_signups WHERE email_normalized = '$TestEmail'"
      if ($LASTEXITCODE -ne 0 -or $after -ne '0') { throw 'Owned test signup deletion not verified.' }
      Write-Output 'Owned test signup deleted and absence verified.'
    }
  } else {
    Write-Output 'Landing waitlist table exists.'
  }
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:NEON_API_KEY -ErrorAction SilentlyContinue
}
