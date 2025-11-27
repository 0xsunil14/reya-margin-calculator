import { Shield, AlertTriangle } from 'lucide-react'

export default function MarginHealthIndicator({ utilization, usedMargin, availableMargin }) {
  const getRiskLevel = () => {
    if (utilization >= 80) return { 
      level: 'High Risk', 
      color: 'red', 
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/50'
    }
    if (utilization >= 60) return { 
      level: 'Medium Risk', 
      color: 'yellow', 
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500/50'
    }
    return { 
      level: 'Low Risk', 
      color: 'green', 
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/50'
    }
  }
  
  const risk = getRiskLevel()
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Margin Health</h3>
      </div>
      
      <div className="space-y-4">
        {/* Utilization Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Utilization</span>
            <span className="font-semibold">{utilization.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${risk.bg} transition-all duration-500`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Risk Level */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${risk.border} bg-${risk.color}-500/10`}>
          <AlertTriangle className={`w-4 h-4 ${risk.text}`} />
          <span className={`text-sm font-medium ${risk.text}`}>
            {risk.level}
          </span>
        </div>
        
        {/* Margin Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-slate-400">Used</div>
            <div className="font-semibold">${usedMargin.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">Available</div>
            <div className="font-semibold text-green-400">
              ${availableMargin.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
