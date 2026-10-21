# Render every slide of a PPTX to PNG with the installed PowerPoint (true rendering).
# Usage: powershell -File render_pptx.ps1 -Pptx <file.pptx> -OutDir <dir> [-Width 1920]
param([Parameter(Mandatory)][string]$Pptx, [Parameter(Mandatory)][string]$OutDir, [int]$Width = 1920)
$Pptx = (Resolve-Path $Pptx).Path
New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($Pptx, $true, $false, $false)  # ReadOnly, no title, no window
  $h = [int]($Width * $pres.PageSetup.SlideHeight / $pres.PageSetup.SlideWidth)
  foreach ($s in $pres.Slides) {
    $f = Join-Path $OutDir ("slide-{0:D2}.png" -f $s.SlideIndex)
    $s.Export($f, "PNG", $Width, $h)
  }
  "rendered $($pres.Slides.Count) slides -> $OutDir"
  $pres.Close()
} finally {
  if ($app.Presentations.Count -eq 0) { $app.Quit() }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
}
