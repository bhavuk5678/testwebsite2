import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { processChatMessage } from "./services/nlp";
import { processVideoForHeatmap } from "./services/video-processor";
import { insertVideoSchema, insertGateSchema, insertChatMessageSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Video routes
  app.post("/api/videos/upload", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const videoData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      };

      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);

      // Start background processing
      processVideoForHeatmap(video.id).catch(console.error);

      res.json(video);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.get("/api/videos/:id/stream", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const fs = await import('fs');
      const path = await import('path');
      const videoPath = path.join('uploads', video.filename);

      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ message: "Video file not found" });
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': video.mimeType,
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': video.mimeType,
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error('Stream video error:', error);
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  // Gate routes
  app.get("/api/gates", async (req, res) => {
    try {
      const gates = await storage.getAllGates();
      res.json(gates);
    } catch (error) {
      console.error('Get gates error:', error);
      res.status(500).json({ message: "Failed to fetch gates" });
    }
  });

  app.patch("/api/gates/:id", async (req, res) => {
    try {
      const updates = req.body;
      const gate = await storage.updateGate(req.params.id, updates);
      if (!gate) {
        return res.status(404).json({ message: "Gate not found" });
      }
      
      // Check for capacity alerts
      const currentCount = gate.currentCount || 0;
      if (currentCount > gate.capacity) {
        await storage.createAlert({
          gateId: gate.id,
          type: "capacity_exceeded",
          message: `${gate.name} has exceeded capacity (${currentCount}/${gate.capacity})`,
          severity: "critical",
          isActive: true
        });
      }
      
      res.json(gate);
    } catch (error) {
      console.error('Update gate error:', error);
      res.status(500).json({ message: "Failed to update gate" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const alert = await storage.acknowledgeAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const chatResponse = await processChatMessage(message);
      
      // Store the conversation
      const chatMessage = await storage.createChatMessage({
        message,
        response: chatResponse.response
      });

      res.json({
        ...chatMessage,
        ...chatResponse
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const messages = await storage.getRecentChatMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Analytics route
  app.get("/api/analytics", async (req, res) => {
    try {
      const gates = await storage.getAllGates();
      const alerts = await storage.getAllActiveAlerts();
      
      const totalPeople = gates.reduce((sum, gate) => sum + (gate.currentCount || 0), 0);
      const totalCapacity = gates.reduce((sum, gate) => sum + gate.capacity, 0);
      const capacityPercentage = Math.round((totalPeople / totalCapacity) * 100);
      
      const busiestGate = gates.reduce((max, gate) => {
        const maxCount = max.currentCount || 0;
        const gateCount = gate.currentCount || 0;
        return gateCount > maxCount ? gate : max;
      });
      
      const averageWaitTime = 2 + Math.random() * 6; // Simulated
      const entryRate = 15 + Math.random() * 15; // Simulated
      
      res.json({
        totalPeople,
        totalCapacity,
        capacityPercentage,
        activeAlerts: alerts.length,
        busiestGate: busiestGate.name,
        averageWaitTime: Math.round(averageWaitTime * 10) / 10,
        entryRate: Math.round(entryRate),
        peakHour: "7:30 PM" // Simulated
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
