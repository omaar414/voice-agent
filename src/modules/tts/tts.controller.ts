import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleTtsService } from './google-tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly googleTtsService: GoogleTtsService) {}

  @Post('test')
  async testTts(@Body() body: { text: string }, @Res() res: Response) {
    try {
      const audioBuffer = await this.googleTtsService.generateSpeech(body.text);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error('TTS Test Error:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  }
} 