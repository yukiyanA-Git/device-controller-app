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
    "046D:C534:mouse" = "Logicool Wireless Mouse (Unifying)"
    "046D:C534:keyboard" = "Logicool Wireless Keyboard (Unifying)"
    "046D:C539" = "Logicool LIGHTSPEED Receiver"
    "046D:C08B" = "Logicool G502 HERO Mouse"
    "046D:C094" = "Logicool G PRO X SUPERLIGHT Mouse"
    "37D7:2401" = "Flydigi Vader 5 Pro"
    "045E:028E" = "Flydigi / Xbox Controller"
    "054C:0CE6" = "Sony DualSense Controller"
    "054C:05C4" = "Sony DUALSHOCK 4 Controller"
    "054C:0EC2" = "Sony PlayStation Controller"
    "057E:2009" = "Nintendo Switch Pro Controller"
}

$pnp = Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status OK

$devices = @()
$seen = @{}

$noisePatterns = @(
    "*Touch Screen*", "*Virtual*", "*LED*", "*Hub*", "*Host*", "*Root*",
    "*Feizhi*", "*vendor-defined*", "*consumer control*", "*system controller*",
    "*USB Input Device*", "*HID-compliant device*", "*HID-compliant consumer*",
    "*VID_046D&PID_0000*", "*VID_046D&PID_C232*"
)

# 1. 最初にPnPデバイスからVID/PIDとクラスを抽出
$hasLogicoolMouse = $false

foreach ($dev in $pnp) {
    $inst = $dev.InstanceId
    $friendly = $dev.FriendlyName
    if (-not $friendly) { $friendly = $dev.Name }

    $isNoise = $false
    foreach ($pat in $noisePatterns) {
        if ($inst -like $pat -or $friendly -like $pat) {
            $isNoise = $true
            break
        }
    }
    if ($isNoise) { continue }

    $vidHex = ""
    $pidHex = ""
    if ($inst -match "VID_([0-9A-Fa-f]{4})") { $vidHex = $Matches[1].ToUpper() }
    if ($inst -match "PID_([0-9A-Fa-f]{4})") { $pidHex = $Matches[1].ToUpper() }

    $brand = ""
    if ($VendorTable.ContainsKey($vidHex)) { $brand = $VendorTable[$vidHex] }

    $devTypeKey = if ($dev.Class -eq "Mouse") { "mouse" } elseif ($dev.Class -eq "Keyboard") { "keyboard" } else { "hid" }
    
    $uniqueKey = ""
    $dispName = ""
    $category = "keyboard"

    # 特殊判定: Logicool Unifying (C534) はマウスとキーボードを別個のデバイスとして分離
    if ($vidHex -eq "046D" -and $pidHex -eq "C534") {
        if ($dev.Class -eq "Mouse") {
            $uniqueKey = "046D:C534:mouse"
            $dispName = "[Logicool / Logitech] Wireless Mouse (Unifying)"
            $category = "mouse"
            $hasLogicoolMouse = $true
        } elseif ($dev.Class -eq "Keyboard") {
            $uniqueKey = "046D:C534:keyboard"
            $dispName = "[Logicool / Logitech] Wireless Keyboard (Unifying)"
            $category = "keyboard"
        } else {
            continue
        }
    } elseif ($vidHex -eq "1532" -and $pidHex -eq "0244") {
        $uniqueKey = "1532:0244"
        $dispName = "[Razer] Razer Tartarus Pro"
        $category = "lefthand"
    } elseif ($vidHex -ne "" -and $pidHex -ne "") {
        $vpKey = $vidHex + ":" + $pidHex
        $uniqueKey = $vpKey
        if ($ProductTable.ContainsKey($vpKey)) {
            $dispName = "[" + $brand + "] " + $ProductTable[$vpKey]
        } elseif ($brand -ne "") {
            $baseType = "Input Device"
            if ($dev.Class -eq "Mouse") { $baseType = "Mouse"; $category = "mouse" }
            elseif ($dev.Class -eq "Keyboard") { $baseType = "Keyboard"; $category = "keyboard" }
            elseif ($dev.Class -eq "HIDClass") { $baseType = "Controller"; $category = "gamepad" }
            $dispName = "[" + $brand + "] " + $baseType
        }
    } else {
        # 汎用機器
        if ($dev.Class -eq "Mouse" -and -not $hasLogicoolMouse) {
            $uniqueKey = "generic_mouse"
            $dispName = "Standard Mouse"
            $category = "mouse"
        } elseif ($dev.Class -eq "Keyboard") {
            $uniqueKey = "generic_keyboard"
            $dispName = "Standard Keyboard"
            $category = "keyboard"
        } else {
            continue
        }
    }

    if (-not $dispName -or $seen.ContainsKey($uniqueKey)) {
        continue
    }
    $seen[$uniqueKey] = $true

    if ($dispName -like "*Tartarus*" -or $dispName -like "*Orbweaver*") {
        $category = "lefthand"
    } elseif ($dispName -like "*Mouse*") {
        $category = "mouse"
    } elseif ($dispName -like "*Controller*" -or $dispName -like "*Gamepad*" -or $dispName -like "*Flydigi*" -or $dispName -like "*PlayStation*") {
        $category = "gamepad"
    }

    $isBt = $inst -like "*BTHENUM*" -or $inst -like "*BLUETOOTH*" -or $dispName -like "*Bluetooth*"
    $connType = if ($isBt) { "bluetooth" } else { "usb" }

    # Battery and Power status detection
    $batteryStatus = "wired"
    $batteryType = "wired"
    $batteryLevel = $null
    $batteryNote = "Wired Connection (Direct Power)"

    if ($isBt) {
        $batteryType = "bluetooth"
        try {
            $prop = Get-PnpDeviceProperty -InstanceId $inst -KeyName '{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2' -ErrorAction SilentlyContinue
            if ($prop -and $prop.Data -ne $null) {
                $batteryLevel = [int]$prop.Data
                $batteryStatus = "ok"
                $batteryNote = "Bluetooth BAS Battery"
            } else {
                $batteryStatus = "charging_or_unknown"
                $batteryNote = "Bluetooth Connected (Standby)"
            }
        } catch {
            $batteryStatus = "charging_or_unknown"
            $batteryNote = "Bluetooth Connected (Standby)"
        }
    } elseif ($dispName -like "*Wireless*" -or $dispName -like "*Unifying*" -or $dispName -like "*LIGHTSPEED*" -or $dispName -like "*Flydigi*" -or $uniqueKey -like "*C534*" -or $uniqueKey -like "*C539*" -or $uniqueKey -like "*2401*") {
        $batteryStatus = "unsupported"
        $batteryType = "dongle"
        $batteryLevel = $null
        $batteryNote = "Proprietary 2.4GHz Dongle (Reading unsupported)"
    } else {
        $batteryStatus = "wired"
        $batteryType = "wired"
        $batteryLevel = $null
        $batteryNote = "Wired Connection (Direct Power)"
    }

    $devices += [PSCustomObject]@{
        id = "pnp_" + $uniqueKey.Replace(":", "_").Replace(" ", "_").Replace("-", "_")
        name = $dispName
        brand = $brand
        category = $category
        connectionType = $connType
        connectionTypeLabel = if ($isBt) { "Bluetooth" } elseif ($batteryType -eq "dongle") { "USB (Wireless Dongle)" } else { "USB" }
        enabled = $true
        telemetry = "PnP Active"
        lastActive = 0
        batteryStatus = $batteryStatus
        batteryType = $batteryType
        batteryLevel = $batteryLevel
        batteryNote = $batteryNote
    }
}

if ($devices.Count -gt 0) {
    $json = $devices | ConvertTo-Json -Compress
    $targetFile = Join-Path $PSScriptRoot "devices_data.js"
    $jsContent = "window.DETECTED_PNP_DEVICES = " + $json + ";"
    [System.IO.File]::WriteAllText($targetFile, $jsContent, [System.Text.Encoding]::UTF8)
    Write-Host "Generated clean devices_data.js with $($devices.Count) physical devices."
} else {
    Write-Host "PnP scan returned 0 devices, keeping existing devices_data.js."
}
