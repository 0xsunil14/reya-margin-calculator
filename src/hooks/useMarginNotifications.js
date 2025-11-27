// src/hooks/useMarginNotifications.js

import { useEffect, useRef } from 'react'

export function useMarginNotifications(utilization, availableMargin) {
  const lastNotificationRef = useRef(null)
  const utilizationRef = useRef(utilization)
  
  useEffect(() => {
    // Don't run on initial mount
    if (utilizationRef.current === null) {
      utilizationRef.current = utilization
      return
    }
    
    // Check if notifications are enabled
    const browserNotifications = localStorage.getItem('browserNotifications') === 'true'
    if (!browserNotifications || Notification.permission !== 'granted') {
      return
    }
    
    // Get threshold from settings
    const threshold = parseInt(localStorage.getItem('alertThreshold')) || 75
    
    // Check if utilization crossed threshold
    const previousUtilization = utilizationRef.current
    const currentUtilization = utilization
    
    // Update ref for next check
    utilizationRef.current = currentUtilization
    
    // Only notify if crossing threshold upward (not when going down)
    if (previousUtilization < threshold && currentUtilization >= threshold) {
      sendNotification(currentUtilization, availableMargin, 'warning')
    }
    
    // Critical alert at 90%
    if (previousUtilization < 90 && currentUtilization >= 90) {
      sendNotification(currentUtilization, availableMargin, 'critical')
    }
    
    // Throttle notifications (don't spam) - max one every 5 minutes
    const now = Date.now()
    const lastNotification = lastNotificationRef.current
    if (lastNotification && now - lastNotification < 1 * 60 * 1000) {
      return
    }
    
  }, [utilization, availableMargin])
  
  const sendNotification = (currentUtilization, availableMargin, type) => {
    const now = Date.now()
    
    // Throttle: Don't send if last notification was < 5 minutes ago
    if (lastNotificationRef.current && now - lastNotificationRef.current < 1 * 60 * 1000) {
      return
    }
    
    lastNotificationRef.current = now
    
    let title, body, icon
    
    if (type === 'critical') {
      title = '🚨 CRITICAL: Margin Alert'
      body = `Margin utilization at ${currentUtilization.toFixed(1)}%! Available: $${availableMargin.toLocaleString()}. Risk of liquidation.`
      icon = '🚨'
    } else {
      title = '⚠️ Warning: High Margin Utilization'
      body = `Margin utilization reached ${currentUtilization.toFixed(1)}%. Available: $${availableMargin.toLocaleString()}`
      icon = '⚠️'
    }
    
    try {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: 'margin-alert',
        requireInteraction: type === 'critical', // Critical alerts require user interaction
        vibrate: type === 'critical' ? [200, 100, 200] : undefined
      })
      
      // Click notification to focus the tab
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
      
      // Auto-close after 10 seconds (except critical)
      if (type !== 'critical') {
        setTimeout(() => notification.close(), 10000)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }
}

export default useMarginNotifications