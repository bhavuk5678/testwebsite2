import { type User, type InsertUser, type Video, type InsertVideo, type Gate, type InsertGate, type Alert, type InsertAlert, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video methods
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  
  // Gate methods
  createGate(gate: InsertGate): Promise<Gate>;
  getAllGates(): Promise<Gate[]>;
  getGate(id: string): Promise<Gate | undefined>;
  getGateByName(name: string): Promise<Gate | undefined>;
  updateGate(id: string, updates: Partial<Gate>): Promise<Gate | undefined>;
  
  // Alert methods
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAllActiveAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  acknowledgeAlert(id: string): Promise<Alert | undefined>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getRecentChatMessages(limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videos: Map<string, Video>;
  private gates: Map<string, Gate>;
  private alerts: Map<string, Alert>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.gates = new Map();
    this.alerts = new Map();
    this.chatMessages = new Map();
    
    // Initialize default gates
    this.initializeDefaultGates();
  }

  private initializeDefaultGates() {
    const defaultGates = [
      { name: "Gate A", capacity: 1200, currentCount: 1247, status: "critical" },
      { name: "Gate B", capacity: 1200, currentCount: 892, status: "moderate" },
      { name: "Gate C", capacity: 1200, currentCount: 456, status: "normal" },
      { name: "Gate D", capacity: 1200, currentCount: 234, status: "normal" },
      { name: "Gate E", capacity: 1200, currentCount: 678, status: "moderate" },
      { name: "Gate F", capacity: 1200, currentCount: 345, status: "normal" },
    ];

    defaultGates.forEach(async (gateData) => {
      await this.createGate(gateData);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Video methods
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = {
      ...insertVideo,
      id,
      uploadedAt: new Date(),
      processedAt: null,
      heatmapData: null,
      isProcessed: false,
    };
    this.videos.set(id, video);
    return video;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...updates };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  // Gate methods
  async createGate(insertGate: InsertGate): Promise<Gate> {
    const id = randomUUID();
    const gate: Gate = {
      ...insertGate,
      id,
      currentCount: insertGate.currentCount ?? 0,
      status: insertGate.status || "normal",
      lastUpdated: new Date(),
    };
    this.gates.set(id, gate);
    return gate;
  }

  async getAllGates(): Promise<Gate[]> {
    return Array.from(this.gates.values());
  }

  async getGate(id: string): Promise<Gate | undefined> {
    return this.gates.get(id);
  }

  async getGateByName(name: string): Promise<Gate | undefined> {
    return Array.from(this.gates.values()).find(gate => gate.name === name);
  }

  async updateGate(id: string, updates: Partial<Gate>): Promise<Gate | undefined> {
    const gate = this.gates.get(id);
    if (!gate) return undefined;
    
    const updatedGate = { ...gate, ...updates, lastUpdated: new Date() };
    this.gates.set(id, updatedGate);
    return updatedGate;
  }

  // Alert methods
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      isActive: insertAlert.isActive ?? true,
      createdAt: new Date(),
      acknowledgedAt: null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAllActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive);
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async acknowledgeAlert(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, isActive: false, acknowledgedAt: new Date() };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getRecentChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
