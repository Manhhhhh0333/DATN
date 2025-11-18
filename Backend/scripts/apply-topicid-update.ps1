$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath "update-words-topicid.sql"

$serverName = "localhost"
$databaseName = "HIHSK"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cap nhat TopicId cho tu vung HSK1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dang ket noi den SQL Server..." -ForegroundColor Gray
$connectionString = "Server=$serverName;Database=$databaseName;Integrated Security=True;TrustServerCertificate=True;"

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Write-Host "  [OK] Ket noi SQL Server thanh cong" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Dang doc SQL script..." -ForegroundColor Gray
    $sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8
    
    Write-Host "Dang chay SQL script de cap nhat TopicId..." -ForegroundColor Gray
    $command = New-Object System.Data.SqlClient.SqlCommand($sqlContent, $connection)
    $command.CommandTimeout = 60
    
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $command
    $dataset = New-Object System.Data.DataSet
    $adapter.Fill($dataset) | Out-Null
    
    Write-Host ""
    if ($dataset.Tables.Count -gt 0) {
        Write-Host "Ket qua cap nhat theo TopicId:" -ForegroundColor Cyan
        if ($dataset.Tables[0].Rows.Count -gt 0) {
            foreach ($row in $dataset.Tables[0].Rows) {
                $topicId = $row[0]
                $count = $row[1]
                Write-Host "  TopicId $topicId : $count tu" -ForegroundColor White
            }
        }
        
        if ($dataset.Tables.Count -gt 1) {
            Write-Host ""
            Write-Host "Ket qua theo chu de:" -ForegroundColor Cyan
            foreach ($row in $dataset.Tables[1].Rows) {
                $topicId = $row[0]
                $title = $row[1]
                $topicIndex = $row[2]
                $count = $row[3]
                Write-Host "  Topic $topicIndex ($title): $count tu" -ForegroundColor White
            }
        }
    } else {
        Write-Host "  Khong co ket qua tra ve" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "[OK] Da cap nhat TopicId thanh cong!" -ForegroundColor Green
    
    $connection.Close()
} catch {
    Write-Host "  [ERROR] Loi khi cap nhat: $_" -ForegroundColor Red
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
    exit 1
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green

