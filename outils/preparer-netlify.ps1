<#
  Prépare un dossier propre d'un site, prêt à glisser sur Netlify Drop.
  Copie sites/<nom> vers _deploy/<nom>, SANS assets/brut, README.md ni netlify.toml.

  Utilisation (depuis le dossier Sites) :
    powershell -ExecutionPolicy Bypass -File .\outils\preparer-netlify.ps1 cafe-grain
#>
param(
  [Parameter(Mandatory = $true)][string]$Site
)

$racine = Split-Path $PSScriptRoot -Parent
$source = Join-Path $racine "sites\$Site"
$destination = Join-Path $racine "_deploy\$Site"

if (-not (Test-Path $source)) { throw "Site introuvable : $source" }

# On repart d'un dossier vide (il est régénéré à chaque fois, rien à perdre)
if (Test-Path $destination) { Remove-Item $destination -Recurse -Force -Confirm:$false }
New-Item -ItemType Directory -Force $destination | Out-Null

robocopy $source $destination /E /XD (Join-Path $source 'assets\brut') /XF README.md netlify.toml /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Erreur pendant la copie (code robocopy $LASTEXITCODE)" }

$fichiers = Get-ChildItem $destination -Recurse -File
$tailleKo = [math]::Round(($fichiers | Measure-Object Length -Sum).Sum / 1KB)
Write-Host "Dossier prêt : $destination"
Write-Host "$($fichiers.Count) fichiers, $tailleKo Ko"
Write-Host "Glisse ce dossier sur https://app.netlify.com/drop"
exit 0
