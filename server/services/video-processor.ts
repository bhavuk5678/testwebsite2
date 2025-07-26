import { storage } from "../storage";

export interface HeatmapData {
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    density: number; // 0-1 scale
    color: string;
  }>;
  processingTime: number;
  timestamp: Date;
}

export async function processVideoForHeatmap(videoId: string): Promise<HeatmapData> {
  // Simulate video processing time
  const processingStartTime = Date.now();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate simulated heatmap data
  const heatmapData: HeatmapData = {
    regions: generateSimulatedHeatmapRegions(),
    processingTime: Date.now() - processingStartTime,
    timestamp: new Date()
  };
  
  // Update video with processed data
  await storage.updateVideo(videoId, {
    isProcessed: true,
    processedAt: new Date(),
    heatmapData: heatmapData
  });
  
  return heatmapData;
}

function generateSimulatedHeatmapRegions(): HeatmapData['regions'] {
  const regions = [];
  
  // Generate multiple regions with different density levels
  for (let i = 0; i < 8; i++) {
    const density = Math.random();
    let color;
    
    if (density < 0.3) {
      color = '#10b981'; // green - low density
    } else if (density < 0.7) {
      color = '#f59e0b'; // yellow - medium density
    } else {
      color = '#ef4444'; // red - high density
    }
    
    regions.push({
      x: Math.random() * 80, // percentage
      y: Math.random() * 80,
      width: 10 + Math.random() * 15,
      height: 10 + Math.random() * 15,
      density,
      color
    });
  }
  
  return regions;
}

export function getHeatmapColors() {
  return {
    low: '#10b981',    // green
    medium: '#f59e0b', // yellow
    high: '#ef4444'    // red
  };
}
