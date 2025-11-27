import React, { useState } from 'react'
import { Bell, Save } from 'lucide-react'

export default function AlertSettings() {
  const [threshold, setThreshold] = useState(75)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const handleSave = () => {
    // In production, this would save to backend/local storage
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        
        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Email Notifications</span>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              emailNotifications ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              emailNotifications ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
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
          Get notified when your margin utilization exceeds {threshold}%
        </p>
      </div>
    </div>
  )
}