import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getChatResponse(text: string, conversationHistory?: ConversationMessage[]): Promise<string> {
    const messages = conversationHistory ? [...conversationHistory, { role: 'user' as const, content: text }] : [
      { role: 'system' as const, content: 'Eres un agente virtual de atención telefónica. Responde de forma breve y clara.' },
      { role: 'user' as const, content: text },
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 200,
    });
    const message = completion.choices[0]?.message?.content;
    return message ? message.trim() : 'Lo siento, no pude generar una respuesta.';
  }
} 