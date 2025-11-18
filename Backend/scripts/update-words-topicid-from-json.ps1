$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataPath = Join-Path $scriptPath ".." "data"
$jsonFile = Join-Path $dataPath "seed-data-hsk1.json"
$sqlFile = Join-Path $scriptPath "update-words-topicid-from-json.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cap nhat TopicId cho tu vung HSK1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dang doc file JSON..." -ForegroundColor Gray
$jsonContent = Get-Content $jsonFile -Raw -Encoding UTF8
$data = $jsonContent | ConvertFrom-Json

Write-Host "Dang tao SQL script..." -ForegroundColor Gray

$sqlStatements = @()
$sqlStatements += "USE [HIHSK];"
$sqlStatements += ""
$sqlStatements += "-- Cap nhat TopicId cho tu vung HSK1 tu file JSON"
$sqlStatements += "-- Script duoc tao tu file seed-data-hsk1.json"
$sqlStatements += ""

$topicGroups = @{}
foreach ($word in $data.words) {
    if ($word.topicId) {
        $topicId = $word.topicId
        if (-not $topicGroups.ContainsKey($topicId)) {
            $topicGroups[$topicId] = @()
        }
        $topicGroups[$topicId] += $word.character
    }
}

foreach ($topicId in 1..12) {
    if ($topicGroups.ContainsKey($topicId)) {
        $characters = $topicGroups[$topicId]
        $charList = ($characters | ForEach-Object { "N'$_'" }) -join ",`n    "
        
        $topicName = @{
            1 = "Chao hoi & Giao tiep co ban"
            2 = "So dem & Thoi gian"
            3 = "Nguoi & Gia dinh"
            4 = "Dong tu co ban"
            5 = "Tinh tu & Mo ta"
            6 = "Dia diem & Phuong huong"
            7 = "Thuc an & Do uong"
            8 = "Mau sac & Do vat"
            9 = "Thoi tiet & Thien nhien"
            10 = "Co the & Suc khoe"
            11 = "Hoat dong hang ngay"
            12 = "Tong hop & On tap"
        }[$topicId]
        
        $sqlStatements += "-- Topic $topicId : $topicName"
        $sqlStatements += "UPDATE Words SET TopicId = $topicId WHERE HSKLevel = 1 AND Character IN ("
        $sqlStatements += "    $charList"
        $sqlStatements += ");"
        $sqlStatements += ""
    }
}

$sqlStatements += "-- Kiem tra ket qua"
$sqlStatements += "SELECT "
$sqlStatements += "    TopicId,"
$sqlStatements += "    COUNT(*) AS SoTu"
$sqlStatements += "FROM Words"
$sqlStatements += "WHERE HSKLevel = 1"
$sqlStatements += "GROUP BY TopicId"
$sqlStatements += "ORDER BY TopicId;"
$sqlStatements += ""
$sqlStatements += "SELECT "
$sqlStatements += "    t.Id AS TopicId,"
$sqlStatements += "    t.Title AS TenChuDe,"
$sqlStatements += "    COUNT(w.Id) AS SoTu"
$sqlStatements += "FROM LessonTopics t"
$sqlStatements += "LEFT JOIN Words w ON w.TopicId = t.Id AND w.HSKLevel = 1"
$sqlStatements += "WHERE t.HSKLevel = 1"
$sqlStatements += "GROUP BY t.Id, t.Title"
$sqlStatements += "ORDER BY t.TopicIndex;"

$sqlContent = $sqlStatements -join "`n"
[System.IO.File]::WriteAllText($sqlFile, $sqlContent, [System.Text.Encoding]::UTF8)

Write-Host "[OK] Da tao SQL script: $sqlFile" -ForegroundColor Green
Write-Host ""
Write-Host "Thong ke tu file JSON:" -ForegroundColor Cyan
foreach ($topicId in 1..12) {
    if ($topicGroups.ContainsKey($topicId)) {
        $count = $topicGroups[$topicId].Count
        $topicName = @{
            1 = "Chao hoi & Giao tiep co ban"
            2 = "So dem & Thoi gian"
            3 = "Nguoi & Gia dinh"
            4 = "Dong tu co ban"
            5 = "Tinh tu & Mo ta"
            6 = "Dia diem & Phuong huong"
            7 = "Thuc an & Do uong"
            8 = "Mau sac & Do vat"
            9 = "Thoi tiet & Thien nhien"
            10 = "Co the & Suc khoe"
            11 = "Hoat dong hang ngay"
            12 = "Tong hop & On tap"
        }[$topicId]
        Write-Host "  Topic $topicId ($topicName): $count tu" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "De cap nhat database, chay lenh:" -ForegroundColor Yellow
Write-Host "  sqlcmd -S localhost -d HIHSK -i `"$sqlFile`"" -ForegroundColor White

