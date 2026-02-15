# Fix component imports after moving to src/components

Write-Host "Fixing imports..." -ForegroundColor Green

$files = Get-ChildItem -Path "." -Include "*.ts","*.tsx" -Recurse -File | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*dist*" 
}

$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix imports
    if ($content -match "from '\./components/") {
        $content = $content -replace "from '\./components/", "from './src/components/"
        $modified = $true
    }
    if ($content -match "from '\.\.\/components/") {
        $content = $content -replace "from '\.\.\/components/", "from '../src/components/"
        $modified = $true
    }
    if ($content -match "from '\.\.\/\.\.\/components/") {
        $content = $content -replace "from '\.\.\/\.\.\/components/", "from '../../src/components/"
        $modified = $true
    }
    if ($content -match "from '\.\.\/\.\.\/\.\.\/components/") {
        $content = $content -replace "from '\.\.\/\.\.\/\.\.\/components/", "from '../../../src/components/"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        $name = $file.FullName.Replace((Get-Location).Path + '\', '')
        Write-Host "Fixed: $name" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Modified $count files" -ForegroundColor Green
