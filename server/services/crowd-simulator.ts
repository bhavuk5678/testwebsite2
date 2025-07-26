import { storage } from "../storage";

export class CrowdSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting crowd simulation...');
    
    // Update crowd levels every 10 seconds
    this.intervalId = setInterval(async () => {
      await this.updateCrowdLevels();
    }, 10000);
    
    // Initial update
    setTimeout(() => this.updateCrowdLevels(), 2000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Crowd simulation stopped');
  }

  private async updateCrowdLevels() {
    try {
      const gates = await storage.getAllGates();
      
      for (const gate of gates) {
        const currentCount = gate.currentCount || 0;
        
        // Simulate realistic crowd flow with some randomness
        const change = this.generateCrowdChange(currentCount, gate.capacity);
        const newCount = Math.max(0, currentCount + change);
        
        // Determine status based on capacity
        let status = 'normal';
        const percentage = (newCount / gate.capacity) * 100;
        
        if (percentage > 100) {
          status = 'critical';
        } else if (percentage > 75) {
          status = 'moderate';
        }
        
        // Update gate with new count and status
        await storage.updateGate(gate.id, {
          currentCount: Math.round(newCount),
          status
        });
        
        // Create alert if over capacity
        if (newCount > gate.capacity && currentCount <= gate.capacity) {
          await storage.createAlert({
            gateId: gate.id,
            type: "capacity_exceeded",
            message: `${gate.name} has exceeded capacity (${Math.round(newCount)}/${gate.capacity})`,
            severity: "critical",
            isActive: true
          });
        }
      }
      
      console.log('📊 Crowd levels updated');
    } catch (error) {
      console.error('Error updating crowd levels:', error);
    }
  }

  private generateCrowdChange(currentCount: number, capacity: number): number {
    const percentage = (currentCount / capacity) * 100;
    
    // Base change range
    let baseChange = Math.random() * 60 - 30; // -30 to +30
    
    // Apply realistic factors
    if (percentage > 90) {
      // Near capacity, more likely to decrease
      baseChange *= 0.3;
      baseChange -= Math.random() * 20;
    } else if (percentage < 20) {
      // Low capacity, more likely to increase
      baseChange *= 0.5;
      baseChange += Math.random() * 40;
    } else if (percentage > 70) {
      // High capacity, gradual changes
      baseChange *= 0.6;
    }
    
    // Add time-based factors (simulating peak hours)
    const hour = new Date().getHours();
    if (hour >= 18 && hour <= 22) {
      // Peak evening hours
      baseChange += Math.random() * 15;
    } else if (hour >= 10 && hour <= 12) {
      // Morning rush
      baseChange += Math.random() * 10;
    }
    
    // Add periodic surge events
    if (Math.random() < 0.1) {
      // 10% chance of surge event
      baseChange += Math.random() * 50;
    }
    
    return Math.round(baseChange);
  }
}

export const crowdSimulator = new CrowdSimulator();