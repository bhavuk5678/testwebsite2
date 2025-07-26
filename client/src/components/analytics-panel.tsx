import { TrendingUp, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

export function AnalyticsPanel() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 5000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['/api/alerts'],
    refetchInterval: 3000,
  });

  const activeAlertsCount = alerts.filter((alert: any) => alert.isActive).length || 0;

  if (!analytics) {
    return (
      <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-fade-in shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="text-yellow-400 mr-3" size={20} />
          Live Analytics
        </h3>
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
          <div className="h-32 bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-fade-in shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <BarChart3 className="text-yellow-400 mr-3" size={20} />
        Live Analytics
      </h3>

      <div className="space-y-6">
        {/* Total Capacity */}
        <div className="text-center p-4 bg-gray-900/60 rounded-lg border border-gray-700/30">
          <div className="text-2xl font-bold text-white mb-1">
            {analytics.capacityPercentage}%
          </div>
          <div className="text-sm text-gray-400 mb-2">Total Capacity</div>
          <Progress 
            value={analytics.capacityPercentage} 
            className="h-2 bg-gray-700"
          />
          <div className="text-xs text-gray-500 mt-1">
            {analytics.totalPeople.toLocaleString()} / {analytics.totalCapacity.toLocaleString()}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="text-center p-4 bg-gray-900/60 rounded-lg border border-gray-700/30">
          <div className={`text-2xl font-bold mb-1 ${activeAlertsCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {activeAlertsCount}
          </div>
          <div className="text-sm text-gray-400">Active Alerts</div>
          {activeAlertsCount > 0 && (
            <button className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
              View Details →
            </button>
          )}
        </div>

        {/* Live Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Peak Hour</span>
            <span className="text-sm text-white font-medium">{analytics.peakHour}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Avg. Wait Time</span>
            <span className="text-sm text-white font-medium">{analytics.averageWaitTime} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Entry Rate</span>
            <span className="text-sm text-green-400 font-medium flex items-center">
              <TrendingUp size={12} className="mr-1" />
              {analytics.entryRate}/min
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Busiest Gate</span>
            <span className="text-sm text-white font-medium">{analytics.busiestGate}</span>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-slate-700">
          <Button className="w-full gradient-secondary hover:opacity-90 text-sm">
            <Download size={14} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}
