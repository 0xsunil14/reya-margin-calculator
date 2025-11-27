import React, { useState, useEffect } from 'react'
import { Bell, Save, CheckCircle } from 'lucide-react'

export default function AlertSettings() {
  const [threshold, setThreshold] = useState(75)
  const [browserNotifications, setBrowserNotifications] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [saved, setSaved] = useState(false)
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      
      // Load saved settings from localStorage
      const savedThreshold = localStorage.getItem('alertThreshold')
      const savedNotifications = localStorage.getItem('browserNotifications')
      
      if (savedThreshold) setThreshold(parseInt(savedThreshold))
      if (savedNotifications === 'true') setBrowserNotifications(true)
    }
  }, [])
  
  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser notifications are not supported in your browser')
      return
    }
    
    if (Notification.permission === 'granted') {
      setBrowserNotifications(true)
      return
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        setBrowserNotifications(true)
        
        // Send test notification
        new Notification('Reya Margin Calculator', {
          body: `You'll be notified when margin utilization exceeds ${threshold}%`,
          icon: '/favicon.ico',
          tag: 'test-notification'
        })
      }
    } else {
      alert('Notifications are blocked. Please enable them in your browser settings.')
    }
  }
  
  const toggleNotifications = async () => {
    if (!browserNotifications) {
      // Turning ON notifications - request permission
      await requestNotificationPermission()
    } else {
      // Turning OFF notifications
      setBrowserNotifications(false)
    }
  }
  
  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('alertThreshold', threshold.toString())
    localStorage.setItem('browserNotifications', browserNotifications.toString())
    
    // Show saved confirmation
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Send test notification if enabled
    if (browserNotifications && Notification.permission === 'granted') {
      new Notification('Alert Settings Saved', {
        body: `You'll be notified when margin utilization exceeds ${threshold}%`,
        icon: '/favicon.ico',
        tag: 'settings-saved'
      })
    }
  }
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Alert Settings</h3>
      </div>
      
      <div className="space-y-4">
        {/* Threshold Slider */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">
            Margin Utilization Alert: {threshold}%
          </label>
          <input
            type="range"
            min="50"
            max="95"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>50%</span>
            <span>Safe</span>
            <span>95%</span>
          </div>
        </div>
        
        {/* Browser Notifications Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Browser Notifications</span>
            <button
              onClick={toggleNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                browserNotifications ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                browserNotifications ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          {/* Permission Status */}
          {notificationPermission === 'denied' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs text-red-400">
              Notifications blocked. Enable in browser settings.
            </div>
          )}
          
          {notificationPermission === 'default' && !browserNotifications && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-xs text-blue-400">
              Click the toggle to enable notifications
            </div>
          )}
          
          {browserNotifications && notificationPermission === 'granted' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Notifications enabled
            </div>
          )}
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            saved 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        
        {/* Info Text */}
        <p className="text-xs text-slate-500">
          Get browser notifications when your margin utilization exceeds {threshold}%
        </p>
      </div>
    </div>
  )
}