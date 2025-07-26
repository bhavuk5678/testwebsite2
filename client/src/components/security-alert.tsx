import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SecurityAlertProps {
  alerts: Array<{
    id: string;
    gateId?: string;
    type: string;
    message: string;
    severity: string;
    isActive: boolean;
    timestamp?: Date;
  }>;
  onClose?: () => void;
}

export function SecurityAlert({ alerts, onClose }: SecurityAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest('PATCH', `/api/alerts/${alertId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
  });

  useEffect(() => {
    if (alerts.length > 0) {
      setIsVisible(true);
    }
  }, [alerts]);

  const handleAcknowledge = (alertId: string) => {
    acknowledgeMutation.mutate(alertId);
    if (alerts.length === 1) {
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  const primaryAlert = alerts[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-2xl max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-white animate-bounce-slow" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Security Alert</h3>
              <p className="text-red-100">Crowd Threshold Exceeded</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/10"
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <p className="text-white mb-2">{primaryAlert.message}</p>
          <p className="text-red-100 text-sm">
            <strong>Severity:</strong> {primaryAlert.severity.toUpperCase()}
          </p>
          <p className="text-red-100 text-sm">Immediate attention required</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            className="flex-1 bg-white/20 text-white hover:bg-white/30"
            onClick={() => handleAcknowledge(primaryAlert.id)}
            disabled={acknowledgeMutation.isPending}
          >
            Acknowledge
          </Button>
          <Button
            className="flex-1 bg-white text-red-600 hover:bg-red-50"
            onClick={() => handleAcknowledge(primaryAlert.id)}
            disabled={acknowledgeMutation.isPending}
          >
            Take Action
          </Button>
        </div>
        
        {alerts.length > 1 && (
          <p className="text-center text-red-100 text-sm mt-3">
            +{alerts.length - 1} more alert{alerts.length > 2 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
