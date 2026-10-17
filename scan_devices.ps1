$ErrorActionPreference = "SilentlyContinue"

$VendorTable = @{
    "046D" = "Logicool / Logitech"
    "1532" = "Razer"
    "045E" = "Microsoft / Xbox"
    "054C" = "Sony PlayStation"
    "057E" = "Nintendo"
    "2DC8" = "8BitDo"
    "1B1C" = "Corsair"
    "31E3" = "Flydigi"
    "37D7" = "Flydigi"
    "04B3" = "IBM"
    "03F0" = "HP / HyperX"
    "1038" = "SteelSeries"
    "0853" = "Topre Realforce"
    "0F0D" = "HORI"
}

$ProductTable = @{
    "1532:0244" = "Razer Tartarus Pro"
    "1532:022B" = "Razer Tartarus V2"
    "1532:01DD" = "Razer Tartarus Classic"
    "1532:0113" = "Razer Orbweaver"
    "046D:C534" = "Logicool Unifying Receiver"
    "046D:C539" = "Logicool LIGHTSPEED Receiver"
    "046D:C08B" = "Logicool G502 HERO Mouse"
    "046D:C094" = "Logicool G PRO X SUPERLIGHT Mouse"
    "046D:C232" = "Logicool G29 / Gaming Driving Force"
    "37D7:2401" = "Flydigi Vader 5 Pro"
    "054C:0CE6" = "Sony DualSense Controller"
    "054C:05C4" = "Sony DUALSHOCK 4 Controller"
    "054C:0EC2" = "Sony PlayStation Controller"
    "057E:2009" = "Nintendo Switch Pro Controller"
}

$pnp = Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status OK

$devices = @()
$seen = @{}

foreach ($dev in $pnp) {
    $inst = $dev.InstanceId
    $vidHex = ""
    $pidHex = ""
    if ($inst -match "VID_([0-9A-Fa-f]{4})") { $vidHex = $Matches[1].ToUpper() }
    if ($inst -match "PID_([0-9A-Fa-f]{4})") { $pidHex = $Matches[1].ToUpper() }

    $brand = ""
    $prod = ""
    if ($VendorTable.ContainsKey($vidHex)) { $brand = $VendorTable[$vidHex] }
    if ($vidHex -ne "" -and $pidHex -ne "") {
        $vpKey = $vidHex + ":" + $pidHex
        if ($ProductTable.ContainsKey($vpKey)) { $prod = $ProductTable[$vpKey] }
    }

    $dispName = ""
    $uniqueKey = ""

    if ($prod -ne "") {
        $dispName = "[" + $brand + "] " + $prod
        $uniqueKey = $vidHex + ":" + $pidHex
    } elseif ($brand -ne "") {
        $baseType = "Input Device"
        if ($dev.Class -eq "Mouse" -or $inst -like "*Mouse*") {
            $baseType = "Mouse"
        } elseif ($dev.Class -eq "Keyboard") {
            $baseType = "Keyboard"
        } elseif ($dev.Class -eq "HIDClass") {
            $baseType = "Controller"
        }
        $dispName = "[" + $brand + "] " + $baseType + " (VID:" + $vidHex + ")"
        $uniqueKey = $vidHex + ":" + $pidHex
    } else {
        $dispName = $dev.FriendlyName
        if (-not $dispName) { $dispName = $dev.Name }
        $uniqueKey = $dispName
    }

    if (-not $dispName -or $seen.ContainsKey($uniqueKey) -or $dispName -like "*Touch Screen*" -or $dispName -like "*Virtual*" -or $dispName -like "*LED*" -or $dispName -like "*Hub*" -or $dispName -like "*Controller -*" -or $dispName -like "*Root*" -or $dispName -like "*Host*") {
        continue
    }
    $seen[$uniqueKey] = $true

    $category = "keyboard"
    if ($inst -like "*1532*0244*" -or $inst -like "*1532*022B*" -or $inst -like "*1532*01DD*" -or $inst -like "*1532*0113*" -or $dispName -like "*Tartarus*" -or $dispName -like "*Orbweaver*") {
        $category = "lefthand"
    } elseif ($dev.Class -eq "Mouse" -or $dispName -like "*Mouse*") {
        $category = "mouse"
    } elseif ($dispName -like "*Controller*" -or $dispName -like "*Gamepad*" -or $dispName -like "*Flydigi*" -or $dispName -like "*DualSense*") {
        $category = "gamepad"
    } elseif ($dispName -like "*Tenkey*" -or $dispName -like "*Numeric*" -or $dispName -like "*IBM*") {
        $category = "tenkey"
    }

    $isBt = $inst -like "*BTHENUM*" -or $inst -like "*BLUETOOTH*" -or $dispName -like "*Bluetooth*"
    $connType = if ($isBt) { "bluetooth" } else { "usb" }

    $devices += [PSCustomObject]@{
        id = "pnp_" + $uniqueKey.Replace(":", "_").Replace(" ", "_").Replace("-", "_")
        name = $dispName
        brand = $brand
        category = $category
        connectionType = $connType
        connectionTypeLabel = if ($isBt) { "Bluetooth" } else { "USB" }
        enabled = $true
        telemetry = "PnP Active"
        lastActive = 0
    }
}

$json = $devices | ConvertTo-Json -Compress
$targetFile = Join-Path $PSScriptRoot "devices_data.js"
$jsContent = "window.DETECTED_PNP_DEVICES = " + $json + ";"
[System.IO.File]::WriteAllText($targetFile, $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "Generated devices_data.js successfully."
