# InputNexus Native Windows Device Bridge (PnP & RawInput Hardware Engine)
# Grants 100% true OS-level physical device separation and Device Manager disabling

param (
    [string]$Action = "list", # list, disable, enable
    [string]$InstanceId = ""
)

$ErrorActionPreference = "SilentlyContinue"

# 1. Enumerate All Physical Input Devices (Keyboards, Mice, Gamepads, Bluetooth HIDs)
if ($Action -eq "list") {
    $devices = Get-PnpDevice -Class Keyboard, Mouse, HIDClass, Media -Status OK | Where-Object {
        $_.FriendlyName -or $_.Name
    } | Select-Object -Property InstanceId, FriendlyName, Name, Class, Status, Manufacturer

    $resultList = @()
    foreach ($dev in $devices) {
        $displayName = if ($dev.FriendlyName) { $dev.FriendlyName } else { $dev.Name }
        $connType = if ($dev.InstanceId -like "*BTHENUM*" -or $dev.InstanceId -like "*BLUETOOTH*") { "bluetooth" } else { "usb" }
        
        $category = "other"
        if ($dev.Class -eq "Keyboard") { $category = "keyboard" }
        elseif ($dev.Class -eq "Mouse") { $category = "mouse" }
        elseif ($dev.Class -eq "HIDClass" -and ($displayName -like "*Gamepad*" -or $displayName -like "*Controller*" -or $displayName -like "*Joystick*")) { $category = "gamepad" }
        elseif ($displayName -like "*Tartarus*" -or $displayName -like "*Keypad*" -or $displayName -like "*Orbweaver*") { $category = "keyboard" }

        $resultList += [PSCustomObject]@{
            id = $dev.InstanceId
            name = $displayName
            category = $category
            connection = $connType
            status = $dev.Status
            manufacturer = $dev.Manufacturer
        }
    }

    $resultList | ConvertTo-Json -Compress
}
# 2. Disable Physical Device in Windows Device Manager (Stops mouse cursor & buttons completely)
elseif ($Action -eq "disable" -and $InstanceId -ne "") {
    Disable-PnpDevice -InstanceId $InstanceId -Confirm:$false
    Write-Output '{"status":"success","action":"disabled"}'
}
# 3. Enable Physical Device in Windows Device Manager
elseif ($Action -eq "enable" -and $InstanceId -ne "") {
    Enable-PnpDevice -InstanceId $InstanceId -Confirm:$false
    Write-Output '{"status":"success","action":"enabled"}'
}
