import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";

interface GateMonitorProps {
  gate: {
    id: string;
    name: string;
    currentCount: number;
    capacity: number;
    status: string;
  };
}

export function GateMonitor({ gate }: GateMonitorProps) {
  const percentage = Math.round((gate.currentCount / gate.capacity) * 100);
  
  const getStatusIcon = () => {
    switch (gate.status) {
      case 'critical':
        return <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />;
      case 'moderate':
        return <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />;
      default:
        return <CheckCircle className="w-3 h-3 text-green-400 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (gate.status) {
      case 'critical':
        return '⚠️ Over Capacity';
      case 'moderate':
        return '⚡ Moderate';
      default:
        return '✓ Normal';
    }
  };

  const getStatusColor = () => {
    switch (gate.status) {
      case 'critical':
        return 'text-red-400';
      case 'moderate':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const getProgressColor = () => {
    switch (gate.status) {
      case 'critical':
        return 'bg-red-400';
      case 'moderate':
        return 'bg-yellow-400';
      default:
        return 'bg-green-400';
    }
  };

  return (
    <div className={`bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 hover:scale-105 transition-all animate-fade-in shadow-2xl ${
      gate.status === 'critical' ? 'animate-glow border-red-400/50' :
      gate.status === 'moderate' ? 'animate-float' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white animate-slide-in-left">{gate.name}</h3>
        <div className="animate-bounce-slow">{getStatusIcon()}</div>
      </div>
      
      <div className={`text-3xl font-bold text-white mb-2 animate-scale-pulse ${
        gate.status === 'critical' ? 'animate-rainbow' : ''
      }`}>
        {gate.currentCount.toLocaleString()}
      </div>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <span className={getStatusColor()}>{getStatusText()}</span>
        <span className="text-slate-400">Cap: {gate.capacity.toLocaleString()}</span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      
      {percentage > 100 && (
        <div className="mt-2 text-xs text-red-400 font-medium">
          {percentage - 100}% over capacity
        </div>
      )}
    </div>
  );
}
