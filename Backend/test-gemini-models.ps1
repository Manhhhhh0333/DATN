# Script test các model names có sẵn trong Gemini API
$apiKey = "AIzaSyCsv7g5pqe7TTzYezFw40UAsGATpOc3OxE"  # Thay bằng API key của bạn
$baseUrl = "https://generativelanguage.googleapis.com"

# Danh sách models để test
$models = @(
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
)

# Test với API v1
Write-Host "=== TEST VỚI API V1 ===" -ForegroundColor Green
foreach ($model in $models) {
    $url = "$baseUrl/v1/models/$model`:generateContent?key=$apiKey"
    $body = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = "Hello"
                    }
                )
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✓ $model - OK" -ForegroundColor Green
        break
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "✗ $model - NOT FOUND (404)" -ForegroundColor Red
        } else {
            Write-Host "✗ $model - ERROR ($statusCode): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== TEST VỚI API V1BETA ===" -ForegroundColor Green
foreach ($model in $models) {
    $url = "$baseUrl/v1beta/models/$model`:generateContent?key=$apiKey"
    $body = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = "Hello"
                    }
                )
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✓ $model - OK" -ForegroundColor Green
        break
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "✗ $model - NOT FOUND (404)" -ForegroundColor Red
        } else {
            Write-Host "✗ $model - ERROR ($statusCode): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== KIỂM TRA DANH SÁCH MODELS ===" -ForegroundColor Green
try {
    $listUrl = "$baseUrl/v1/models?key=$apiKey"
    $modelsList = Invoke-RestMethod -Uri $listUrl -Method Get
    Write-Host "Các models có sẵn:" -ForegroundColor Cyan
    foreach ($model in $modelsList.models) {
        Write-Host "  - $($model.name)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Không thể lấy danh sách models: $($_.Exception.Message)" -ForegroundColor Red
}

