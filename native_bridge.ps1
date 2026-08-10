# InputNexus Deep Hardware Engine - VID/PID Master Brand Extractor
param (
    [string]$Action = "list",
    [string]$InstanceId = ""
)

$ErrorActionPreference = "SilentlyContinue"

# USB Vendor ID (VID) Master Lookup Table
$VendorTable = @{
    "046D" = "Logicool / Logitech"
    "1532" = "Razer"
    "045E" = "Microsoft / Xbox"
    "054C" = "Sony PlayStation"
    "057E" = "Nintendo"
    "2DC8" = "8BitDo"
    "1B1C" = "Corsair"
    "0853" = "Topre Realforce"
    "0F0D" = "HORI"
    "31E3" = "Flydigi"
    "256C" = "GameSir"
    "04B3" = "IBM"
    "03F0" = "HP / HyperX"
    "1038" = "SteelSeries"
    "28DE" = "Valve Steam / Index"
    "1E7D" = "Roccat / Turtle Beach"
    "04D9" = "Holtek Keypad"
}

# Product ID (PID) Known Hardware Table
$ProductTable = @{
    "1532:0244" = "Razer Tartarus Pro"
    "1532:022B" = "Razer Tartarus V2"
    "1532:01DD" = "Razer Tartarus Classic"
    "1532:0113" = "Razer Orbweaver"
    "046D:C534" = "Logicool Unifying Receiver"
    "046D:C539" = "Logicool LIGHTSPEED Receiver"
    "046D:C08B" = "Logicool G502 HERO Mouse"
    "046D:C094" = "Logicool G PRO X SUPERLIGHT Mouse"
    "054C:0CE6" = "Sony DualSense Controller"
    "054C:05C4" = "Sony DUALSHOCK 4 Controller"
    "057E:2009" = "Nintendo Switch Pro Controller"
}

if ($Action -eq "list") {
    $pnpDevices = Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status OK
    $resultList = @()

    foreach ($dev in $pnpDevices) {
        $busName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_BusReportedDeviceDesc").Data
        $friendlyName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_FriendlyName").Data
        $deviceDesc = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_DeviceDesc").Data

        $inst = $dev.InstanceId
        $parsedBrand = ""
        $parsedProduct = ""
        $vidHex = ""
        $pidHex = ""

        # Extract VID and PID from InstanceId
        if ($inst -match "VID_([0-9A-Fa-f]{4})") {
            $vidHex = $Matches[1].ToUpper()
            if ($VendorTable.ContainsKey($vidHex)) {
                $parsedBrand = $VendorTable[$vidHex]
            }
        }
        if ($inst -match "PID_([0-9A-Fa-f]{4})") {
            $pidHex = $Matches[1].ToUpper()
        }

        # Check Product Table
        if ($vidHex -ne "" -and $pidHex -ne "") {
            $key = $vidHex + ":" + $pidHex
            if ($ProductTable.ContainsKey($key)) {
                $parsedProduct = $ProductTable[$key]
            }
        }

        # Construct Human-Readable Name
        $displayName = ""
        if ($parsedProduct -ne "") {
            $displayName = "[" + $parsedBrand + "] " + $parsedProduct
        } elseif ($parsedBrand -ne "") {
            $baseType = "Input Device"
            if ($dev.Class -eq "Mouse" -or $inst -like "*Mouse*") {
                $baseType = "Mouse"
            } elseif ($dev.Class -eq "Keyboard") {
                $baseType = "Keyboard / Keypad"
            }
            $displayName = "[" + $parsedBrand + "] " + $baseType + " (VID:" + $vidHex + " PID:" + $pidHex + ")"
        } elseif ($busName) {
            $displayName = $busName
        } elseif ($friendlyName) {
            $displayName = $friendlyName
        } elseif ($deviceDesc) {
            $displayName = $deviceDesc
        } else {
            $displayName = $dev.Name
        }

        # Connection Type
        $connType = "usb"
        if ($inst -like "*BTHENUM*" -or $inst -like "*BLUETOOTH*" -or $displayName -like "*Bluetooth*") {
            $connType = "bluetooth"
        }

        # Category Rules
        $category = "keyboard"
        if ($inst -like "*VID_1532*" -or $displayName -like "*Tartarus*" -or $displayName -like "*Orbweaver*" -or $displayName -like "*Keypad*") {
            $category = "lefthand"
        } elseif ($displayName -like "*Tenkey*" -or $displayName -like "*Numeric*" -or $displayName -like "*IBM*") {
            $category = "tenkey"
        } elseif ($dev.Class -eq "Mouse" -or $displayName -like "*Mouse*" -or $displayName -like "*Trackball*") {
            $category = "mouse"
        } elseif ($dev.Class -eq "HIDClass" -and ($displayName -like "*Gamepad*" -or $displayName -like "*Controller*" -or $displayName -like "*DualSense*" -or $displayName -like "*Switch Pro*")) {
            $category = "gamepad"
        }

        $resultList += [PSCustomObject]@{
            id = $inst
            name = $displayName
            brand = $parsedBrand
            category = $category
            connection = $connType
            status = $dev.Status
            hardwareId = $inst
        }
    }

    $resultList | ConvertTo-Json -Compress
}
elseif ($Action -eq "disable" -and $InstanceId -ne "") {
    Disable-PnpDevice -InstanceId $InstanceId -Confirm:$false
    Write-Output '{"status":"success","action":"disabled"}'
}
elseif ($Action -eq "enable" -and $InstanceId -ne "") {
    Enable-PnpDevice -InstanceId $InstanceId -Confirm:$false
    Write-Output '{"status":"success","action":"enabled"}'
}
elseif ($Action -eq "reset_all") {
    Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status Error, Disabled | Enable-PnpDevice -Confirm:$false
    Write-Output '{"status":"success","action":"reset_all"}'
}
