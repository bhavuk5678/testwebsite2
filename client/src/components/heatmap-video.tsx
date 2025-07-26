import { useState, useRef, useEffect } from "react";
import { Play, Pause, Flame, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function HeatmapVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [crowdLevel, setCrowdLevel] = useState<'HIGH' | 'LOW'>('LOW');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: videos = [] } = useQuery({
    queryKey: ['/api/videos'],
  });

  const latestVideo = (videos as any[]).find((video: any) => video);

  // Random crowd analysis updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLevel = Math.random() > 0.5 ? 'HIGH' : 'LOW';
      setCrowdLevel(randomLevel);
      setLastUpdate(Date.now());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-fade-in animate-float shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center animate-slide-in-right">
        <Flame className="text-orange-400 mr-3 animate-rainbow" size={24} />
        Heatmap Analysis
      </h2>

      <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video">
        {latestVideo ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={`/api/videos/${latestVideo.id}/stream`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={false}
              style={{
                filter: 'grayscale(80%) contrast(1.1) brightness(0.95)'
              }}
            />

            {/* Processing Status */}
            {!latestVideo.isProcessed && (
              <div className="absolute top-4 left-4 bg-yellow-600/90 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="font-bold text-sm text-white">
                    PROCESSING...
                  </span>
                </div>
              </div>
            )}

            {/* Crowd Analysis Overlay */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Activity className={`${crowdLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'} animate-pulse`} size={16} />
                <span className={`font-bold text-sm ${crowdLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'}`}>
                  CROWD: {crowdLevel}
                </span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {latestVideo.isProcessed ? 'AI Analysis' : 'Live Simulation'}
              </div>
              <div className="text-xs text-gray-300">
                {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            </div>

            {/* Video Info */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="text-xs text-gray-300">
                {latestVideo.originalName}
              </div>
              <div className="text-xs text-gray-400">
                {(latestVideo.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>

            {/* Heatmap Overlay */}
            <div className="absolute inset-0">
              {latestVideo.isProcessed && latestVideo.heatmapData?.regions?.map((region: any, index: number) => (
                <div
                  key={index}
                  className="absolute opacity-30 animate-pulse"
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                    backgroundColor: region.color,
                    borderRadius: '6px',
                    border: `2px solid ${region.color}`,
                    boxShadow: `0 0 10px ${region.color}50`,
                  }}
                />
              ))}

              {/* Simulated regions when not processed */}
              {!latestVideo.isProcessed && (
                <>
                  <div className={`absolute opacity-25 rounded animate-pulse`}
                    style={{
                      left: '20%', top: '30%', width: '15%', height: '20%',
                      backgroundColor: crowdLevel === 'HIGH' ? '#ef4444' : '#10b981',
                      border: `2px solid ${crowdLevel === 'HIGH' ? '#ef4444' : '#10b981'}`,
                    }} />
                  <div className={`absolute opacity-25 rounded animate-pulse`}
                    style={{
                      left: '60%', top: '45%', width: '12%', height: '18%',
                      backgroundColor: '#f59e0b',
                      border: '2px solid #f59e0b',
                      animationDelay: '0.5s'
                    }} />
                  <div className={`absolute opacity-25 rounded animate-pulse`}
                    style={{
                      left: '40%', top: '20%', width: '18%', height: '25%',
                      backgroundColor: crowdLevel === 'HIGH' ? '#ef4444' : '#10b981',
                      border: `2px solid ${crowdLevel === 'HIGH' ? '#ef4444' : '#10b981'}`,
                      animationDelay: '1s'
                    }} />
                </>
              )}
            </div>

            {/* Play/Pause button overlay for uploaded videos */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                size="lg"
                variant="ghost"
                className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </Button>
            </div>
          </>
        ) : (
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200" 
               style={{ filter: 'grayscale(100%) contrast(1.1)' }}>
            {/* Heatmap Image */}
            <div className="w-full h-full relative">
              {/* Live Crowd Analysis Overlay */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 z-10">
                <div className="flex items-center space-x-2">
                  <Activity className={`${crowdLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'} animate-pulse`} size={16} />
                  <span className={`font-bold text-sm ${crowdLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'}`}>
                    CROWD: {crowdLevel}
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Live Analysis: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              </div>

              {/* Static Heatmap Image */}
              <img 
                src="/attached_assets/download_1753541650895.jpeg" 
                alt="Heatmap Floor Plan" 
                className="w-full h-full object-cover"
                style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.9)' }}
              />

              {/* Dynamic Overlay based on crowd level */}
              <div className={`absolute inset-0 ${crowdLevel === 'HIGH' ? 'bg-red-500/20' : 'bg-green-500/20'} animate-pulse`}></div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-600/30">
              <h4 className="font-semibold text-sm mb-2 text-white">Crowd Density</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${crowdLevel === 'HIGH' ? 'bg-red-400 animate-pulse' : 'bg-red-300'}`}></div>
                  <span className="text-gray-200">High Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-gray-200">Moderate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${crowdLevel === 'LOW' ? 'bg-green-400 animate-pulse' : 'bg-green-300'}`}></div>
                  <span className="text-gray-200">Low Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-200">Access Point</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-300">
                  Analysis: <span className={`font-semibold ${crowdLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'}`}>
                    {crowdLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-xs text-white">Density:</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <div className="w-3 h-3 bg-red-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">Low</div>
          <div className="text-xs text-gray-400">0-300 people</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">Medium</div>
          <div className="text-xs text-gray-400">300-800 people</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">High</div>
          <div className="text-xs text-gray-400">800+ people</div>
        </div>
      </div>
    </div>
  );
}