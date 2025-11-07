# Script to seed Vocabulary Topic HSK1
# Usage: .\seed_vocabulary_topic.ps1

$apiUrl = "http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1"

Write-Host "Dang seed Vocabulary Topic HSK1..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json"
    
    Write-Host "`nSeed thanh cong!" -ForegroundColor Green
    Write-Host "Vocabulary Topic ID: $($response.vocabularyTopicId)" -ForegroundColor Cyan
    Write-Host "Tong so tu: $($response.totalWords)" -ForegroundColor Cyan
    Write-Host "Da them: $($response.addedWords) tu" -ForegroundColor Cyan
    Write-Host "Da ton tai: $($response.existingWords) tu" -ForegroundColor Cyan
    Write-Host "`n$($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "`nLoi khi seed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Chi tiet: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`nDam bao:" -ForegroundColor Yellow
    Write-Host "1. Backend API dang chay tai http://localhost:5075" -ForegroundColor Yellow
    Write-Host "2. Database da duoc seed tu vung HSK1 (chay migration hoac seed data)" -ForegroundColor Yellow
}

