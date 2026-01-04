/**
 * Simple in-memory database for development
 * Replace with Firestore in production
 */

import { User, Automation, AutomationLog } from '@/types';

// In-memory stores
const users = new Map<string, User>();
const automations = new Map<string, Automation>();
const automationLogs: AutomationLog[] = [];

// User operations
export const db = {
  // Users
  async createUser(user: User): Promise<User> {
    users.set(user.id, user);
    return user;
  },

  async getUserById(id: string): Promise<User | null> {
    return users.get(id) || null;
  },

  async getUserByInstagramId(instagramUserId: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.instagramUserId === instagramUserId) {
        return user;
      }
    }
    return null;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: Date.now() };
    users.set(id, updated);
    return updated;
  },

  // Automations
  async createAutomation(automation: Automation): Promise<Automation> {
    automations.set(automation.id, automation);
    return automation;
  },

  async getAutomationById(id: string): Promise<Automation | null> {
    return automations.get(id) || null;
  },

  async getAutomationsByUserId(userId: string): Promise<Automation[]> {
    const results: Automation[] = [];
    for (const automation of automations.values()) {
      if (automation.userId === userId) {
        results.push(automation);
      }
    }
    return results;
  },

  async getActiveAutomationByMediaId(mediaId: string): Promise<Automation | null> {
    for (const automation of automations.values()) {
      if (automation.mediaId === mediaId && automation.isActive) {
        return automation;
      }
    }
    return null;
  },

  async updateAutomation(id: string, updates: Partial<Automation>): Promise<Automation | null> {
    const automation = automations.get(id);
    if (!automation) return null;
    const updated = { ...automation, ...updates, updatedAt: Date.now() };
    automations.set(id, updated);
    return updated;
  },

  async deleteAutomation(id: string): Promise<boolean> {
    return automations.delete(id);
  },

  // Automation Logs
  async createLog(log: AutomationLog): Promise<AutomationLog> {
    automationLogs.push(log);
    return log;
  },

  async hasUserReceivedDM(automationId: string, commenterInstagramId: string): Promise<boolean> {
    return automationLogs.some(
      log => 
        log.automationId === automationId && 
        log.commenterInstagramId === commenterInstagramId &&
        log.status === 'sent'
    );
  },

  async getLogsByAutomationId(automationId: string): Promise<AutomationLog[]> {
    return automationLogs.filter(log => log.automationId === automationId);
  },

  async incrementDmsSent(automationId: string): Promise<void> {
    const automation = automations.get(automationId);
    if (automation) {
      automation.dmsSent += 1;
      automations.set(automationId, automation);
    }
  }
};

