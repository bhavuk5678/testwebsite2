import { storage } from "../storage";

export interface ChatResponse {
  response: string;
  gateData?: any;
  actionRequired?: boolean;
}

export async function processChatMessage(message: string): Promise<ChatResponse> {
  try {
    // Get current gate data with real-time timestamps
    const gates = await storage.getAllGates();
    const message_lower = message.toLowerCase();
    const timestamp = new Date().toLocaleTimeString();
    
    // Calculate dynamic stats for varied responses
    const totalPeople = gates.reduce((sum, gate) => sum + (gate.currentCount || 0), 0);
    const totalCapacity = gates.reduce((sum, gate) => sum + gate.capacity, 0);
    const utilizationRate = Math.round((totalPeople / totalCapacity) * 100);
    const criticalGates = gates.filter(gate => gate.status === 'critical');
    const moderateGates = gates.filter(gate => gate.status === 'moderate');
    const normalGates = gates.filter(gate => gate.status === 'normal');
    
    // Specific gate queries with dynamic responses
    const gateMatch = message_lower.match(/gate\s+([a-f])/i);
    if (gateMatch) {
      const gateName = `Gate ${gateMatch[1].toUpperCase()}`;
      const gate = gates.find(g => g.name === gateName);
      
      if (gate) {
        const currentCount = gate.currentCount || 0;
        const percentage = Math.round((currentCount / gate.capacity) * 100);
        const statusEmoji = gate.status === 'critical' ? '🚨' : gate.status === 'moderate' ? '⚡' : '✅';
        const overCapacity = currentCount > gate.capacity;
        
        // Varied response patterns
        const responseVariations = [
          `${gateName} status update (${timestamp}): **${currentCount.toLocaleString()} people** (${percentage}% capacity). ${gate.status.toUpperCase()} ${statusEmoji}`,
          `Current crowd at ${gateName}: **${currentCount.toLocaleString()}** out of ${gate.capacity.toLocaleString()} max capacity. Status: ${gate.status} ${statusEmoji}`,
          `${gateName} real-time data: **${currentCount.toLocaleString()} attendees** - ${percentage}% full. Condition: ${gate.status} ${statusEmoji}`
        ];
        
        const randomResponse = responseVariations[Math.floor(Math.random() * responseVariations.length)];
        
        return {
          response: `${randomResponse}${overCapacity ? ' - **IMMEDIATE ATTENTION REQUIRED!**' : ''}`,
          gateData: gate,
          actionRequired: overCapacity
        };
      }
    }
    
    // Busiest gate queries
    if (message_lower.includes('busiest') || message_lower.includes('highest') || message_lower.includes('most crowded')) {
      const busiestGate = gates.reduce((max, gate) => {
        const maxCount = max.currentCount || 0;
        const gateCount = gate.currentCount || 0;
        return gateCount > maxCount ? gate : max;
      });
      
      const busiestCount = busiestGate.currentCount || 0;
      const overCapacity = busiestCount > busiestGate.capacity;
      
      return {
        response: `${busiestGate.name} is currently the busiest with **${busiestCount.toLocaleString()} people**. ${overCapacity ? 'This gate is **OVER CAPACITY** and requires immediate attention!' : 'Crowd levels are manageable.'}`,
        gateData: busiestGate,
        actionRequired: overCapacity
      };
    }
    
    // Total/all gates queries with dynamic responses
    if (message_lower.includes('total') || message_lower.includes('all') || message_lower.includes('overall')) {
      
      const responseVariations = [
        `Stadium overview (${timestamp}): **${totalPeople.toLocaleString()} attendees** across all gates. Total capacity utilization: ${utilizationRate}% (${totalCapacity.toLocaleString()} max).`,
        `Real-time totals: **${totalPeople.toLocaleString()} people** currently in venue. Overall capacity: ${utilizationRate}% of ${totalCapacity.toLocaleString()} maximum.`,
        `Current stadium status: **${totalPeople.toLocaleString()} total attendees**. Facility running at ${utilizationRate}% capacity out of ${totalCapacity.toLocaleString()} total.`
      ];
      
      const statusMessages = [
        utilizationRate > 85 ? `🔥 Peak attendance levels!` : '',
        utilizationRate > 70 ? `⚡ High activity period.` : '',
        utilizationRate < 50 ? `✅ Plenty of space available.` : ''
      ].filter(Boolean);
      
      const randomResponse = responseVariations[Math.floor(Math.random() * responseVariations.length)];
      const randomStatus = statusMessages[Math.floor(Math.random() * statusMessages.length)];
      
      return {
        response: `${randomResponse} ${randomStatus || '📊 Normal operations.'}`,
        gateData: { totalPeople, totalCapacity, utilizationRate },
        actionRequired: utilizationRate > 90
      };
    }
    
    // Status check queries
    if (message_lower.includes('status') || message_lower.includes('how many')) {
      const gateStatuses = gates.map(gate => {
        const count = gate.currentCount || 0;
        const percentage = Math.round((count / gate.capacity) * 100);
        return `${gate.name}: ${count.toLocaleString()} people (${percentage}% full, ${gate.status})`;
      }).join('\n');
      
      const criticalGates = gates.filter(gate => gate.status === 'critical').length;
      
      return {
        response: `Current gate status:\n${gateStatuses}\n\n${criticalGates > 0 ? `⚠️ ${criticalGates} gate(s) require immediate attention!` : '✅ All gates operating normally.'}`,
        gateData: gates.map(g => ({ name: g.name, count: g.currentCount || 0, status: g.status })),
        actionRequired: criticalGates > 0
      };
    }
    
    // Alerts and warnings
    if (message_lower.includes('alert') || message_lower.includes('warning') || message_lower.includes('emergency')) {
      const criticalGates = gates.filter(gate => gate.status === 'critical');
      const moderateGates = gates.filter(gate => gate.status === 'moderate');
      
      if (criticalGates.length > 0) {
        const criticalNames = criticalGates.map(g => g.name).join(', ');
        return {
          response: `🚨 **CRITICAL ALERT:** ${criticalNames} ${criticalGates.length === 1 ? 'is' : 'are'} over capacity! Immediate crowd control measures needed. Consider redirecting attendees to other gates.`,
          gateData: criticalGates,
          actionRequired: true
        };
      } else if (moderateGates.length > 0) {
        return {
          response: `⚡ Moderate crowd levels detected at ${moderateGates.length} gate(s). Monitor closely but no immediate action required.`,
          gateData: moderateGates,
          actionRequired: false
        };
      } else {
        return {
          response: `✅ No active alerts. All gates are operating within normal capacity limits.`,
          actionRequired: false
        };
      }
    }
    
    // Recommendations
    if (message_lower.includes('recommend') || message_lower.includes('suggest') || message_lower.includes('advice')) {
      const normalGates = gates.filter(gate => gate.status === 'normal');
      const criticalGates = gates.filter(gate => gate.status === 'critical');
      
      if (criticalGates.length > 0 && normalGates.length > 0) {
        return {
          response: `💡 **Recommendation:** Redirect traffic from overcrowded gates (${criticalGates.map(g => g.name).join(', ')}) to available gates (${normalGates.map(g => g.name).join(', ')}). This will help balance crowd distribution.`,
          gateData: { criticalGates, normalGates },
          actionRequired: true
        };
      } else if (normalGates.length === 0) {
        return {
          response: `⚠️ All gates are experiencing high traffic. Consider opening additional entry points or implementing crowd control measures.`,
          actionRequired: true
        };
      } else {
        return {
          response: `✅ Crowd distribution is well balanced. Continue monitoring for optimal flow management.`,
          actionRequired: false
        };
      }
    }
    
    // Default fallback responses
    const responses = [
      "I can help you monitor crowd levels! Ask me about specific gates (A-F), total attendance, or which gate is busiest.",
      "Try asking me 'Gate A status?' or 'Which gate is busiest?' for real-time crowd information.",
      "I'm here to help with crowd monitoring. You can ask about gate status, total capacity, or get recommendations for crowd control."
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      actionRequired: false
    };

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact support if the issue persists.",
      actionRequired: false
    };
  }
}
