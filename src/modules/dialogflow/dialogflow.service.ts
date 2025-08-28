import { Injectable } from '@nestjs/common';

@Injectable()
export class DialogflowService {
  async detectIntent(text: string): Promise<string> {
    // TODO: Integrate with Dialogflow CX/ES
    // For now, return a mock response
    return `Dialogflow response to: ${text}`;
  }
} 