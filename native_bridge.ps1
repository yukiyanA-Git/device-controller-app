# InputNexus Deep Windows PnP Engine (Bluetooth Real Name Extractor & Safety Lockout Prevention)

param (
    [string]$Action = "list", # list, disable, enable, reset_all
    [string]$InstanceId = ""
)

$ErrorActionPreference = "SilentlyContinue"

if ($Action -eq "list") {
    # Query PnP Devices with Deep BusReported Property for True Bluetooth & USB Names
    $pnpDevices = Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status OK
    
    $resultList = @()
    foreach ($dev in $pnpDevices) {
        # Deep query for BusReportedName (Reveals true Bluetooth hardware names like "MX Master 3S", "Elecom Trackball")
        $busName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_BusReportedDeviceDesc").Data
        $friendlyName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_FriendlyName").Data
        $deviceDesc = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_DeviceDesc").Data

        $realName = if ($busName) { $busName } elseif ($friendlyName) { $friendlyName } elseif ($deviceDesc) { $deviceDesc } else { $dev.Name }
        if ([string]::IsNullOrWhiteSpace($realName) -or $realName -eq "HID-compliant mouse" -or $realName -eq "HID-compliant keyboard") {
            # Attempt Vendor ID lookup
            if ($dev.InstanceId -match "VID_([0-9A-F]{4})") {
                $vid = $Matches[1]
                if ($vid -eq "046D") { $realName = "Logicool / Logitech Input Device" }
                elseif ($vid -eq "1532") { $realName = "Razer Input Device / Keypad" }
                elseif ($vid -eq "045E") { $realName = "Microsoft Input Device" }
                elseif ($vid -eq "0853") { $realName = "Realforce / Topre Device" }
                elseif ($vid -eq "04B3" -or $dev.InstanceId -like "*IBM*") { $realName = "IBM Keypad / Keyboard" }
            }
        }

        $connType = if ($dev.InstanceId -like "*BTHENUM*" -or $dev.InstanceId -like "*BLUETOOTH*" -or $realName -like "*Bluetooth*") { "bluetooth" } else { "usb" }
        
        # Categorization Logic: Distinct Left-hand Keypads vs Keyboards vs Tenkeys
        $category = "keyboard"
        if ($dev.Class -eq "Mouse" -or $realName -like "*Mouse*" -or $realName -like "*Trackball*") { 
            $category = "mouse" 
        } elseif ($dev.Class -eq "HIDClass" -and ($realName -like "*Gamepad*" -or $realName -like "*Controller*")) { 
            $category = "gamepad" 
        } elseif ($realName -like "*Tartarus*" -or $realName -like "*Orbweaver*" -or $realName -like "*Keypad*" -or $realName -like "*Tenkey*" -or $realName -like "*IBM*") { 
            $category = "lefthand" 
        }

        $resultList += [PSCustomObject]@{
            id = $dev.InstanceId
            name = $realName
            category = $category
            connection = $connType
            status = $dev.Status
            hardwareId = $dev.InstanceId
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
    # Emergency Fail-safe Reset: Re-enables all disabled Windows PnP input devices!
    Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status Error, Disabled | Enable-PnpDevice -Confirm:$false
    Write-Output '{"status":"success","action":"reset_all"}'
}
