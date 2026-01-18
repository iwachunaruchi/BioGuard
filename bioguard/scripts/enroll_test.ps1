if (-not $env:ACCESS_TOKEN) { Write-Error "ACCESS_TOKEN no definido"; exit 1 }
if (-not $env:API_BASE_URL) { Write-Error "API_BASE_URL no definido"; exit 1 }
$body = @{
  image_base64 = "data:image/jpeg;base64,REEMPLAZA"
  angle_type   = "front"
  full_name    = "Juan Perez"
  role         = "whitelist"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$($env:API_BASE_URL)/api/enroll" -Headers @{ Authorization = "Bearer $($env:ACCESS_TOKEN)"; "Content-Type" = "application/json" } -Body $body
