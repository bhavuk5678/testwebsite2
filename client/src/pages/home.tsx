import { VideoUpload } from "@/components/video-upload";
import { HeatmapVideo } from "@/components/heatmap-video";
import { GateMonitor } from "@/components/gate-monitor";
import { ChatInterface } from "@/components/chat-interface";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { SecurityAlert } from "@/components/security-alert";
import { SOSDialog } from "@/components/sos-dialog";
import { useQuery } from "@tanstack/react-query";
import { Cloud, AlertTriangle, Wifi } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const { data: gates = [] } = useQuery({
    queryKey: ['/api/gates'],
    refetchInterval: 5000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['/api/alerts'],
    refetchInterval: 3000,
  });

  const activeAlerts = alerts.filter((alert: any) => alert.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center animate-float">
                <img 
                  src="/attached_assets/GCP_1753542184174.png" 
                  alt="Google Cloud Platform" 
                  className="w-8 h-8 object-contain filter brightness-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  GCP
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white animate-slide-in-left">Google Cloud</h1>
                <p className="text-gray-300 text-sm animate-slide-in-left" style={{ animationDelay: '0.2s' }}>Stadium Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/30 rounded-lg animate-glow">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animate-glow"></div>
                <Wifi size={16} className="text-gray-300" />
                <span className="text-sm text-gray-300">System Online</span>
              </div>
              <button
                onClick={() => setShowSOS(true)}
                className="px-4 py-2 bg-red-700 rounded-lg text-white font-medium hover:opacity-90 transition-all animate-scale-pulse shadow-lg"
              >
                🆘 SOS
              </button>
              <button 
                onClick={() => setShowAlerts(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium hover:opacity-90 transition-all animate-scale-pulse shadow-lg"
              >
                <AlertTriangle size={16} className="mr-2 inline" />
                Alerts
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Security Alerts */}
      {(activeAlerts.length > 0 || showAlerts) && (
        <SecurityAlert alerts={activeAlerts.length > 0 ? activeAlerts : [
          {
            id: 'demo-alert',
            type: 'capacity_exceeded',
            message: 'Gate A has exceeded capacity (1,250/1,200)',
            severity: 'critical',
            isActive: true,
            timestamp: new Date()
          }
        ]} onClose={() => setShowAlerts(false)} />
      )}

      {showSOS && (
        <SOSDialog isOpen={showSOS} onClose={() => setShowSOS(false)} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Upload and Heatmap Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <VideoUpload />
          <HeatmapVideo />
        </div>

        {/* Gate Monitoring Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {gates.slice(0, 3).map((gate: any) => (
            <GateMonitor key={gate.id} gate={gate} />
          ))}
        </div>

        {/* Additional Gates Row */}
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          {gates.slice(3).map((gate: any, index: number) => (
            <div 
              key={gate.id} 
              className={`glass-effect rounded-xl p-4 text-center animate-fade-in hover:animate-scale-pulse transition-all ${
                gate.status === 'critical' ? 'animate-glow border-red-400/50' :
                gate.status === 'moderate' ? 'animate-float' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-xl font-bold text-white animate-slide-in-left">{gate.name}</div>
              <div className={`text-2xl font-bold mt-2 animate-scale-pulse ${
                gate.status === 'critical' ? 'text-red-400 animate-rainbow' :
                gate.status === 'moderate' ? 'text-yellow-400 animate-glow' : 'text-green-400'
              }`}>
                {(gate.currentCount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 capitalize animate-fade-in">{gate.status}</div>
            </div>
          ))}

          {gates.length === 0 && Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="glass-effect rounded-xl p-4 text-center animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-2 animate-gradient"></div>
              <div className="h-8 bg-slate-700 rounded mb-2 animate-gradient"></div>
              <div className="h-4 bg-slate-700 rounded animate-gradient"></div>
            </div>
          ))}

          {/* Total Counter */}
          <div className="glass-effect rounded-xl p-4 text-center animate-fade-in animate-glow">
            <div className="text-xl font-bold text-white animate-float">Total</div>
            <div className="text-2xl font-bold text-blue-400 mt-2 animate-scale-pulse">
              {gates.reduce((sum: number, gate: any) => sum + (gate.currentCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 animate-fade-in">Attendees</div>
          </div>
        </div>

        {/* Chat and Analytics Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}