# Export a .docx to PDF with the installed Microsoft Word (true rendering).
param([Parameter(Mandatory)][string]$Docx, [Parameter(Mandatory)][string]$Pdf)
$Docx = (Resolve-Path $Docx).Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
  $doc = $word.Documents.Open($Docx, $false, $true)
  $doc.ExportAsFixedFormat([System.IO.Path]::GetFullPath($Pdf), 17)
  "pages: $($doc.ComputeStatistics(2))"
  $doc.Close($false)
} finally { $word.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
