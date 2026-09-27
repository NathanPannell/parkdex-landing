param(
  [Parameter(Mandatory = $true)]
  # Staging releases go through the Deploy landing staging workflow, which supplies the
  # deployment-scoped staging database URL for the shared project.
  [ValidateSet("production")]
  [string]$Target,
  [Parameter(Mandatory = $true)]
  [string]$ExpectedCommit
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$expectedProject = "parkdex-landing"
$appUrl = "https://web.parkdex.app"

if ($ExpectedCommit -notmatch "\A[0-9a-fA-F]{40}\z") {
  throw "ExpectedCommit must be a full 40-character Git SHA."
}

$actualCommit = (& git -C $repoRoot rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw "Could not read the current Git commit." }
if ($actualCommit -ne $ExpectedCommit.ToLowerInvariant()) {
  throw "Checkout is at $actualCommit, not the expected commit $ExpectedCommit."
}

$changes = @(& git -C $repoRoot status --porcelain)
if ($LASTEXITCODE -ne 0) { throw "Could not check the Git worktree." }
if ($changes.Count -gt 0) { throw "Deploy from a clean checkout; local changes are present." }

$projectLink = Join-Path $repoRoot ".vercel\project.json"
if (-not (Test-Path -LiteralPath $projectLink)) {
  throw "This checkout is not linked to Vercel. Link it to $expectedProject, then rerun."
}

$linkedProject = Get-Content -Raw -LiteralPath $projectLink | ConvertFrom-Json
if ($linkedProject.projectName -ne $expectedProject) {
  throw "Target '$Target' requires linked project '$expectedProject'; this checkout is linked to '$($linkedProject.projectName)'."
}

Write-Output "Deploying $Target landing build for $actualCommit with app destination $appUrl."
Write-Output "Vercel project: $expectedProject. Automatic domain assignment is disabled."

$deployArgs = @(
  "deploy",
  "--prod",
  "--skip-domain",
  "--build-env", "VITE_APP_URL=$appUrl",
  "--meta", "sourceCommit=$actualCommit",
  "--no-color"
)

& vercel @deployArgs --cwd $repoRoot
if ($LASTEXITCODE -ne 0) { throw "Vercel deployment failed with exit code $LASTEXITCODE." }
