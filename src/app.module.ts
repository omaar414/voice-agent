import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioController } from './modules/twilio/twilio.controller';
import { TtsController } from './modules/tts/tts.controller';
import { OpenAiService } from './modules/openai/openai.service';
import { ConversationService } from './modules/conversation/conversation.service';
import { CentroOtologicoConfig } from './modules/centro-otologico/centro-otologico.config';
import { GoogleTtsService } from './modules/tts/google-tts.service';
import { GoogleStorageService } from './modules/storage/google-storage.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TwilioController, TtsController],
  providers: [OpenAiService, ConversationService, CentroOtologicoConfig, GoogleTtsService, GoogleStorageService],
})
export class AppModule {}
