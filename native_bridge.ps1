# InputNexus Deep Hardware Engine - Razer Tartarus Pro Matcher
param (
    [string]$Action = "list",
    [string]$InstanceId = ""
)

$ErrorActionPreference = "SilentlyContinue"

if ($Action -eq "list") {
    $pnpDevices = Get-PnpDevice -Class Keyboard, Mouse, HIDClass -Status OK
    $resultList = @()

    foreach ($dev in $pnpDevices) {
        $busName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_BusReportedDeviceDesc").Data
        $friendlyName = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_FriendlyName").Data
        $deviceDesc = (Get-PnpDeviceProperty -InputObject $dev -KeyName "DEVPKEY_Device_DeviceDesc").Data

        $realName = if ($busName) { $busName } elseif ($friendlyName) { $friendlyName } elseif ($deviceDesc) { $deviceDesc } else { $dev.Name }
        $inst = $dev.InstanceId

        # 1. Hardware Matcher for Razer Tartarus Pro (VID 0x1532)
        if ($inst -like "*VID_1532*") {
            if ($inst -like "*PID_0244*") {
                $realName = "Razer Tartarus Pro"
            } elseif ($inst -like "*PID_022B*") {
                $realName = "Razer Tartarus V2"
            } elseif ($inst -like "*PID_01DD*" -or $inst -like "*PID_0113*") {
                $realName = "Razer Orbweaver / Tartarus Classic"
            } elseif ($realName -notlike "*Razer*") {
                $realName = "Razer Left-hand Keypad (Tartarus)"
            }
        }

        # 2. IBM Keypad / Tenkey Matcher
        if ($inst -like "*VID_04B3*" -or $realName -like "*IBM*") {
            $realName = "IBM Keypad / Tenkey"
        }

        # 3. Connection Type
        $connType = "usb"
        if ($inst -like "*BTHENUM*" -or $inst -like "*BLUETOOTH*" -or $realName -like "*Bluetooth*") {
            $connType = "bluetooth"
        }

        # 4. Category Rules
        $category = "keyboard"
        if ($inst -like "*VID_1532*" -or $realName -like "*Tartarus*" -or $realName -like "*Orbweaver*" -or $realName -like "*Keypad*") {
            $category = "lefthand"
        } elseif ($realName -like "*Tenkey*" -or $realName -like "*Numeric*" -or $realName -like "*IBM*") {
            $category = "tenkey"
        } elseif ($dev.Class -eq "Mouse" -or $realName -like "*Mouse*" -or $realName -like "*Trackball*") {
            $category = "mouse"
        } elseif ($dev.Class -eq "HIDClass" -and ($realName -like "*Gamepad*" -or $realName -like "*Controller*")) {
            $category = "gamepad"
        }

        $resultList += [PSCustomObject]@{
            id = $inst
            name = $realName
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
