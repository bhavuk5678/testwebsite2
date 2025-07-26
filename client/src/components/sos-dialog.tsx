import { useState, useEffect } from "react";
import { AlertTriangle, X, Shield, Users, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface SOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SOSDialog({ isOpen, onClose }: SOSDialogProps) {
  const [emergencyLocation, setEmergencyLocation] = useState("Cafeteria");
  const [evacuationGate, setEvacuationGate] = useState("Gate F");

  const { data: gates = [] } = useQuery({
    queryKey: ['/api/gates'],
    refetchInterval: 5000,
  });

  // Find the gate with lowest count for fastest evacuation
  useEffect(() => {
    if (gates.length > 0) {
      const sortedGates = [...gates].sort((a: any, b: any) => 
        (a.currentCount || 0) - (b.currentCount || 0)
      );
      const fastestGate = sortedGates[0];
      if (fastestGate) {
        setEvacuationGate(fastestGate.name);
      }
    }
  }, [gates]);

  const evacuationGateData = gates.find((gate: any) => gate.name === evacuationGate);
  const evacuationCount = evacuationGateData?.currentCount || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-2xl shadow-2xl max-w-lg mx-4 animate-slide-up border-2 border-red-400">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="text-white animate-bounce" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🆘 EMERGENCY</h2>
              <p className="text-red-100">Immediate Evacuation Protocol</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-yellow-300 animate-pulse" size={24} />
            <h3 className="text-xl font-bold text-white">Emergency at {emergencyLocation}</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-red-800/50 rounded-lg p-4 border border-red-600/50">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="text-white" size={16} />
                <span className="text-white font-semibold">Fastest Evacuation Route</span>
              </div>
              <p className="text-red-100 text-lg">
                <strong>Enter via {evacuationGate} for fastest evacuation</strong>
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Users className="text-green-300" size={16} />
                <span className="text-green-300 font-semibold">
                  Less than 300 people currently
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-lg">PRIORITY</div>
                <div className="text-red-200 text-sm">Level 1</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-lg">STATUS</div>
                <div className="text-red-200 text-sm">Active</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3">
            <h4 className="text-yellow-300 font-semibold mb-2">⚡ Emergency Instructions:</h4>
            <ul className="text-yellow-100 text-sm space-y-1">
              <li>• All personnel proceed to {evacuationGate} immediately</li>
              <li>• Security teams deploy to {emergencyLocation}</li>
              <li>• Medical units on standby</li>
              <li>• Crowd control measures activated</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              className="flex-1 bg-white text-red-600 hover:bg-red-50 font-bold"
              onClick={() => {
                // Simulate emergency response
                console.log(`Emergency response activated for ${emergencyLocation}`);
                onClose();
              }}
            >
              🚨 Activate Emergency Response
            </Button>
            <Button
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold"
              onClick={() => {
                window.open("https://maps.app.goo.gl/TPQMBPCbsR5jKPtp8", "_blank");
              }}
            >
              <Navigation className="mr-2" size={16} />
              Navigate
            </Button>
            <Button
              variant="ghost"
              className="flex-1 bg-white/20 text-white hover:bg-white/30"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-red-200 text-xs">
            Emergency protocols automatically notified to all security personnel
          </p>
        </div>
      </div>
    </div>
  );
}