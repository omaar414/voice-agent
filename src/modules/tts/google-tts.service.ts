import { Injectable } from '@nestjs/common';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

@Injectable()
export class GoogleTtsService {
  private client: TextToSpeechClient;

  constructor() {
    this.client = new TextToSpeechClient({
      keyFilename: './google-credentials.json',
    });
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const request = {
      input: { text },
      voice: {
        languageCode: 'es-US',
        name: 'es-US-Neural2-A', // Voz femenina Neural2 en español latino (muy natural)
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0, // Velocidad normal (más rápido que 0.9)
        pitch: 0, // Tono normal
        volumeGainDb: 0, // Volumen normal
      },
    };

    try {
      const [response] = await this.client.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }
      return Buffer.from(response.audioContent as string, 'base64');
    } catch (error) {
      console.error('Error generating speech with Google TTS:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async generateSpeechWithOptions(
    text: string,
    options: {
      voice?: string;
      speakingRate?: number;
      pitch?: number;
    } = {}
  ): Promise<Buffer> {
    const request = {
      input: { text },
      voice: {
        languageCode: 'es-ES',
        name: options.voice || 'es-ES-Neural2-A',
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: options.speakingRate || 0.9,
        pitch: options.pitch || 0,
        volumeGainDb: 0,
      },
    };

    try {
      const [response] = await this.client.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }
      return Buffer.from(response.audioContent as string, 'base64');
    } catch (error) {
      console.error('Error generating speech with Google TTS:', error);
      throw new Error('Failed to generate speech');
    }
  }
} 