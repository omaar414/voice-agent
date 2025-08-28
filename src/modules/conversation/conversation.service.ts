import { Injectable } from '@nestjs/common';
import { CentroOtologicoConfig } from '../centro-otologico/centro-otologico.config';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationSession {
  callSid: string;
  messages: Array<ConversationMessage & {
    timestamp: Date;
  }>;
  lastActivity: Date;
}

@Injectable()
export class ConversationService {
  private sessions: Map<string, ConversationSession> = new Map();
  private centroConfig: CentroOtologicoConfig;

  constructor() {
    this.centroConfig = CentroOtologicoConfig.getInstance();
  }

  createSession(callSid: string): void {
    const session: ConversationSession = {
      callSid,
      messages: [
        {
          role: 'system',
          content: this.centroConfig.generatePrompt(),
          timestamp: new Date(),
        },
      ],
      lastActivity: new Date(),
    };
    this.sessions.set(callSid, session);
  }

  getSession(callSid: string): ConversationSession | undefined {
    return this.sessions.get(callSid);
  }

  addUserMessage(callSid: string, content: string): void {
    const session = this.sessions.get(callSid);
    if (session) {
      session.messages.push({
        role: 'user',
        content,
        timestamp: new Date(),
      });
      session.lastActivity = new Date();
    }
  }

  addAssistantMessage(callSid: string, content: string): void {
    const session = this.sessions.get(callSid);
    if (session) {
      session.messages.push({
        role: 'assistant',
        content,
        timestamp: new Date(),
      });
      session.lastActivity = new Date();
    }
  }

  getConversationHistory(callSid: string): ConversationMessage[] {
    const session = this.sessions.get(callSid);
    if (!session) return [];
    
    // Retorna solo los mensajes (sin timestamp) para OpenAI
    return session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  isRelevantQuestion(userText: string): boolean {
    return this.centroConfig.isRelevantQuestion(userText);
  }

  getCentroConfig(): CentroOtologicoConfig {
    return this.centroConfig;
  }

  clearConversationHistory(callSid: string): void {
    const session = this.sessions.get(callSid);
    if (session) {
      // Mantener solo el mensaje del sistema
      session.messages = session.messages.filter(msg => msg.role === 'system');
      session.lastActivity = new Date();
    }
  }

  cleanupOldSessions(maxAgeMinutes: number = 30): void {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    for (const [callSid, session] of this.sessions.entries()) {
      if (session.lastActivity < cutoff) {
        this.sessions.delete(callSid);
      }
    }
  }
} 