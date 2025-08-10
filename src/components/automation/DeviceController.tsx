'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDeviceStore } from '@/lib/stores/deviceStore'
import { toast } from 'sonner'

export function DeviceController() {
  const { 
    connectedDevices, 
    isConnecting, 
    selectedDevice, 
    setSelectedDevice, 
    refreshDevices,
    updateDeviceStatus 
  } = useDeviceStore()

  const handleDeviceSelect = (device: any) => {
    setSelectedDevice(device)
    toast.success(`Selected ${device.name}`)
  }

  const handleDeviceAction = async (action: string) => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    try {
      updateDeviceStatus(selectedDevice.id, 'busy')
      toast.info(`${action} started on ${selectedDevice.name}`)
      
      // Map UI actions to API actions
      let apiAction = ''
      let parameters = {}
      
      switch (action) {
        case 'Screenshot':
          apiAction = 'screenshot'
          break
        case 'Open Instagram':
          apiAction = 'open_instagram'
          break
        case 'Toggle Airplane Mode':
          apiAction = 'toggle_airplane_mode'
          break
        case 'Restart App':
          apiAction = 'home'
          parameters = {}
          break
        default:
          apiAction = action.toLowerCase().replace(' ', '_')
      }
      
      // Call real device action API
      console.log('Making API call to /api/devices/action with:', {
        deviceId: selectedDevice.id,
        action: apiAction,
        parameters
      })
      
      const response = await fetch('/api/devices/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          action: apiAction,
          parameters
        })
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API response:', result)
      
      if (result.success) {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.success(`${action} completed successfully`)
        console.log('Device action result:', result)
      } else {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.error(`Failed to ${action.toLowerCase()}: ${result.error || 'Unknown error'}`)
        console.error('Device action failed:', result)
      }
    } catch (error) {
      updateDeviceStatus(selectedDevice.id, 'connected')
      
      // Provide more detailed error information
      let errorMessage = `Failed to ${action.toLowerCase()}`
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
        console.error('Device action error:', error.message, error.stack)
      } else {
        console.error('Device action error:', error)
      }
      
      toast.error(errorMessage)
    }
  }

  const handleTouchEvent = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    try {
      updateDeviceStatus(selectedDevice.id, 'busy')
      toast.info('TOUCH EVENT: Sending touch event to device...')
      
      // Default coordinates for testing - center of screen
      const parameters = {
        x: 500,
        y: 1000
      }
      
      const response = await fetch('/api/devices/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          action: 'touch_event',
          parameters
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.success(`TOUCH EVENT: Successfully executed at (${result.coordinates.x}, ${result.coordinates.y})`)
        console.log('Touch event result:', result)
      } else {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.error(`TOUCH EVENT: Failed - ${result.error || 'Unknown error'}`)
        console.error('Touch event failed:', result)
      }
    } catch (error) {
      updateDeviceStatus(selectedDevice.id, 'connected')
      
      let errorMessage = 'TOUCH EVENT: Failed to execute'
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
        console.error('Touch event error:', error.message, error.stack)
      } else {
        console.error('Touch event error:', error)
      }
      
      toast.error(errorMessage)
    }
  }

  const handleSmartEngagement = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    try {
      updateDeviceStatus(selectedDevice.id, 'busy')
      toast.info('SMART ENGAGEMENT: Starting sequence - unlock, Instagram, verification...')
      
      const parameters = {
        instagramUsername: null // Will use current active account
      }
      
      const response = await fetch('/api/devices/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          action: 'smart_engagement',
          parameters
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.success('SMART ENGAGEMENT: Sequence completed! Device unlocked, Instagram opened, ready for engagement.')
        console.log('Smart engagement result:', result)
        
        // Show additional success info
        setTimeout(() => {
          toast.info('Navigate to Smart Engagement tab to start automation features!')
        }, 2000)
      } else {
        updateDeviceStatus(selectedDevice.id, 'connected')
        toast.error(`SMART ENGAGEMENT: Failed - ${result.error || 'Unknown error'}`)
        console.error('Smart engagement failed:', result)
      }
    } catch (error) {
      updateDeviceStatus(selectedDevice.id, 'connected')
      
      let errorMessage = 'SMART ENGAGEMENT: Failed to execute sequence'
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
        console.error('Smart engagement error:', error.message, error.stack)
      } else {
        console.error('Smart engagement error:', error)
      }
      
      toast.error(errorMessage)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Controller</CardTitle>
        <CardDescription>
          Manage connected iOS and Android devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connected Devices</span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDevices}
            disabled={isConnecting}
          >
            {isConnecting ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="space-y-2">
          {connectedDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No devices connected</p>
              <p className="text-sm">Connect your iPhone or Android device to get started</p>
            </div>
          ) : (
            connectedDevices.map((device) => (
              <div
                key={device.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDevice?.id === device.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => handleDeviceSelect(device)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{device.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {device.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {device.ipAddress} • Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      device.status === 'connected' ? 'default' :
                      device.status === 'busy' ? 'secondary' : 'destructive'
                    }
                  >
                    {device.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedDevice && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Device Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeviceAction('Screenshot')}
                disabled={selectedDevice.status === 'busy'}
              >
                Screenshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeviceAction('Open Instagram')}
                disabled={selectedDevice.status === 'busy'}
              >
                Open Instagram
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeviceAction('Toggle Airplane Mode')}
                disabled={selectedDevice.status === 'busy'}
              >
                Airplane Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeviceAction('Restart App')}
                disabled={selectedDevice.status === 'busy'}
              >
                Restart App
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTouchEvent()}
                disabled={selectedDevice.status === 'busy'}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                Send Touch Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSmartEngagement()}
                disabled={selectedDevice.status === 'busy'}
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                Smart Engagement
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
