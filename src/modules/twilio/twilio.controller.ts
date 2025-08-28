import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OpenAiService } from '../openai/openai.service';
import { ConversationService } from '../conversation/conversation.service';
import { GoogleTtsService } from '../tts/google-tts.service';
import { GoogleStorageService } from '../storage/google-storage.service';
import { twiml } from 'twilio';

@Controller('twilio')
export class TwilioController {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly conversationService: ConversationService,
    private readonly googleTtsService: GoogleTtsService,
    private readonly googleStorageService: GoogleStorageService,
  ) {}

  private detectEndIntention(userText: string): boolean {
    // Palabras clave directas
    const endKeywords = [
      'adiós', 'hasta luego', 'terminar', 'colgar', 'finalizar', 'chao', 'nos vemos',
      'ya no necesito', 'no necesito más', 'eso es todo', 'ya está', 'listo',
      'gracias por todo', 'me voy', 'hasta la vista', 'que tengas un buen día',
      'finalizar conversación', 'terminar llamada', 'colgar llamada'
    ];
    
    // Detectar palabras clave directas
    const hasDirectKeywords = endKeywords.some(keyword => userText.includes(keyword));
    
    // Detectar frases de agradecimiento que sugieren fin de conversación
    const gratitudePhrases = [
      'gracias', 'muchas gracias', 'te agradezco', 'muy agradecido'
    ];
    const hasGratitude = gratitudePhrases.some(phrase => userText.includes(phrase));
    
    // Detectar frases de satisfacción que sugieren fin
    const satisfactionPhrases = [
      'perfecto', 'excelente', 'muy bien', 'genial', 'está bien'
    ];
    const hasSatisfaction = satisfactionPhrases.some(phrase => userText.includes(phrase));
    
    // Si tiene palabras directas de despedida, definitivamente quiere terminar
    if (hasDirectKeywords) return true;
    
    // Si tiene agradecimiento + satisfacción, probablemente quiere terminar
    if (hasGratitude && hasSatisfaction) return true;
    
    // Si tiene agradecimiento fuerte, probablemente quiere terminar
    if (userText.includes('muchas gracias') || userText.includes('te agradezco mucho')) return true;
    
    return false;
  }

  private detectNoMoreQuestions(userText: string): boolean {
    const noMoreKeywords = [
      'no', 'nada más', 'eso es todo', 'ya está', 'listo', 'no tengo más preguntas',
      'no necesito más', 'ya no', 'eso es', 'nada más'
    ];
    return noMoreKeywords.some(keyword => userText.includes(keyword));
  }

  private detectYesToFollowUp(userText: string): boolean {
    // Solo detectar "sí" cuando es una respuesta simple, no cuando es parte de una pregunta
    const simpleYesResponses = ['sí', 'si', 'yes', 'claro', 'por supuesto', 'exacto'];
    
    // Si el texto es muy corto (respuesta simple), verificar si contiene "sí"
    if (userText.length <= 10) {
      // Verificar que NO contenga palabras de pregunta
      const questionWords = ['qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'dónde', 'donde', 'cuándo', 'cuando', 'por qué', 'porque', 'quién', 'quien'];
      const hasQuestionWords = questionWords.some(word => userText.includes(word));
      
      if (hasQuestionWords) {
        return false; // Es una pregunta, no un "sí"
      }
      
      // Verificar que NO contenga palabras que puedan confundirse
      const confusingWords = ['segur', 'seguro', 'segura', 'seguras', 'seguros', 'seguridad', 'asegurar', 'asegura'];
      const hasConfusingWords = confusingWords.some(word => userText.includes(word));
      
      if (hasConfusingWords) {
        return false; // Contiene palabras que pueden confundirse, no es un "sí"
      }
      
      // Solo detectar respuestas exactas de "sí"
      const exactYesResponses = ['sí', 'si', 'yes'];
      return exactYesResponses.some(keyword => userText.trim() === keyword);
    }
    
    // Si el texto es largo, probablemente es una pregunta, no un "sí" simple
    return false;
  }

  private generateContextualFollowUp(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Follow-ups para servicios
    if (input.includes('servicios') || input.includes('servicio')) {
      return "¿Tienes alguna duda específica sobre nuestros servicios médicos? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para horarios
    if (input.includes('horarios') || input.includes('horario')) {
      return "¿Necesitas información sobre algún horario específico o día en particular? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para citas
    if (input.includes('citas') || input.includes('cita') || input.includes('agendar') || input.includes('reservar')) {
      return "¿Te gustaría saber más sobre cómo agendar una cita o qué documentos necesitas? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para contacto
    if (input.includes('contacto') || input.includes('teléfono') || input.includes('telefono') || input.includes('dirección') || input.includes('direccion') || input.includes('ubicación') || input.includes('ubicacion')) {
      return "¿Necesitas más información de contacto o tienes alguna pregunta sobre nuestra ubicación? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para audífonos
    if (input.includes('audífono') || input.includes('audifono') || input.includes('audífonos') || input.includes('audifonos')) {
      return "¿Tienes alguna pregunta específica sobre nuestros audífonos o quieres saber más sobre otros servicios? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para implantes
    if (input.includes('implante') || input.includes('implantes') || input.includes('cóclea') || input.includes('coclea')) {
      return "¿Te gustaría saber más sobre nuestros implantes cocleares o tienes alguna pregunta específica? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-ups para evaluaciones
    if (input.includes('evaluación') || input.includes('evaluacion') || input.includes('prueba') || input.includes('test') || input.includes('examen')) {
      return "¿Te gustaría saber más sobre nuestras evaluaciones o tienes alguna pregunta específica sobre los procedimientos? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
    }
    
    // Follow-up genérico para otros casos
    return "¿Hay algo más en lo que pueda ayudarte? Puedes decirme o presiona 0 para escuchar el menú nuevamente.";
  }

  private cleanAiResponse(aiResponse: string): string {
    // Remover frases en inglés comunes
    let cleaned = aiResponse
      .replace(/Feel free to ask/g, '')
      .replace(/Feel free to/g, '')
      .replace(/Let me know/g, '')
      .replace(/Please let me know/g, '')
      .replace(/Don't hesitate to/g, '')
      .replace(/Feel free/g, '')
      .replace(/Please/g, '')
      .replace(/Thank you/g, '')
      .replace(/Thanks/g, '');
    
    // Remover preguntas duplicadas o innecesarias
    cleaned = cleaned
      .replace(/¿En qué otro servicio específico estás interesado\?/g, '')
      .replace(/¿En qué otro servicio estás interesado\?/g, '')
      .replace(/¿Te gustaría saber más detalles sobre alguno de estos servicios en específico\?/g, '')
      .replace(/¿Te gustaría saber más sobre alguno de estos servicios\?/g, '')
      .replace(/¿Hay algo específico que te gustaría saber\?/g, '')
      .replace(/¿Necesitas información adicional\?/g, '')
      .replace(/¿Te gustaría más información\?/g, '')
      .replace(/¿Necesitas información adicional sobre.*?\?/g, '')
      .replace(/¿Necesitas información sobre algún.*?específico\?/g, '')
      .replace(/¿Te gustaría saber más sobre.*?\?/g, '')
      .replace(/¿Hay algo específico que te gustaría saber sobre.*?\?/g, '')
      .replace(/¿Necesitas información sobre.*?\?/g, '')
      .replace(/¿Te gustaría más información sobre.*?\?/g, '')
      .replace(/¿Necesitas más ayuda con.*?\?/g, '')
      .replace(/¿Hay algo más en lo que pueda asistirte\?/g, '')
      .replace(/¿Tienes alguna pregunta específica sobre.*?\?/g, '')
      .replace(/¡Estoy aquí para ayudarte!/g, '')
      .replace(/¿Hay algo más en lo que pueda ayudarte\?/g, '')
      .replace(/¿Necesitas más información sobre.*?\?/g, '')
      .replace(/¿tienes alguna otra pregunta\?/g, '')
      .replace(/Estoy aquí para ayudarte/g, '');
    
    // Limpiar espacios extra y puntuación
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\s*\.\s*\./g, '.')
      .replace(/\s*,\s*,/g, ',')
      .trim();
    
    // Remover punto final si termina con punto
    if (cleaned.endsWith('.')) {
      cleaned = cleaned.slice(0, -1);
    }
    
    return cleaned;
  }

  private async generateAndPlayAudio(text: string, twimlResponse: any): Promise<void> {
    try {
      // Generar audio con Google TTS
      const audioBuffer = await this.googleTtsService.generateSpeech(text);
      
      // Generar nombre único para el archivo
      const fileName = this.googleStorageService.generateFileName();
      
      // Subir a Google Storage
      const publicUrl = await this.googleStorageService.uploadAudioFile(audioBuffer, fileName);
      

      
      // Usar <Play> en lugar de <Say>
      twimlResponse.play(publicUrl);
      
      console.log(`Audio generated and uploaded: ${publicUrl}`);
    } catch (error) {
      console.error('Error generating audio with Google TTS:', error);
      // Fallback a Twilio TTS si hay error
      twimlResponse.say({ voice: 'alice', language: 'es-ES' }, text);
    }
  }

  @Post('voice')
  async handleIncomingCall(@Req() req: Request, @Res() res: Response) {
    const twimlResponse = new twiml.VoiceResponse();
    const callSid = req.body.CallSid;

    // Limpiar sesiones antiguas
    this.conversationService.cleanupOldSessions();

    if (!req.body.SpeechResult && !req.body.Digits) {
      // Primera llamada - selección de idioma
      const gather = twimlResponse.gather({
        input: ['dtmf'],
        language: 'es-ES',
        timeout: 10,
        action: '/twilio/voice',
        method: 'POST',
      });
      await this.generateAndPlayAudio('Para español presiona 1, for English press 2.', gather);
    } else if (req.body.Digits && !req.body.SpeechResult && (req.body.Digits === '1' || req.body.Digits === '2') && !this.conversationService.getSession(callSid)) {
      // Usuario seleccionó idioma (solo si no hay SpeechResult Y no hay sesión activa)
      console.log('DEBUG: Entrando en selección de idioma - CallSid:', callSid, 'Digits:', req.body.Digits);
      const isSpanish = req.body.Digits === '1';
      
      if (isSpanish) {
        // Crear sesión en español
        this.conversationService.createSession(callSid);
        
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        await this.generateAndPlayAudio('Hola, soy el agente virtual del Centro Otológico de Puerto Rico. Puedes decirme en qué puedo ayudarte o presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
      } else {
        // Por ahora solo español, redirigir a español
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        await this.generateAndPlayAudio('Hola, soy el agente virtual del Centro Otológico de Puerto Rico. Puedes decirme en qué puedo ayudarte o presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
      }
    } else if (req.body.Digits && !req.body.SpeechResult && this.conversationService.getSession(callSid)) {
      // Usuario presionó botones después de la bienvenida - procesar normalmente
      console.log('DEBUG: Entrando en procesamiento de botones - CallSid:', callSid, 'Digits:', req.body.Digits);
      
      // Verificar si el usuario quiere escuchar el menú nuevamente (después de follow-up)
      // Solo si viene de un follow-up, dar el menú completo
      const currentConversationHistory = this.conversationService.getConversationHistory(callSid);
      const lastAssistantMessage = currentConversationHistory.length > 0 ? currentConversationHistory[currentConversationHistory.length - 1].content : '';
      
      // Verificar si el último mensaje del asistente contiene el follow-up
      const isFromFollowUp = lastAssistantMessage && lastAssistantMessage.includes('presiona 0 para escuchar el menú nuevamente');
      
      console.log('DEBUG: Last assistant message:', lastAssistantMessage);
      console.log('DEBUG: Is from follow-up:', isFromFollowUp);
      console.log('DEBUG: Digits pressed:', req.body.Digits);
      
      if (req.body.Digits === '0') {
        // Dar el menú completo nuevamente
        console.log('DEBUG: Entrando en condición de menú completo');
        
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        await this.generateAndPlayAudio('presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
        res.type('text/xml');
        res.send(twimlResponse.toString());
        return;
      }
      
      // Procesar botones presionados
      let buttonResponse = '';
      switch(req.body.Digits) {
        case '1':
          buttonResponse = 'servicios';
          break;
        case '2':
          buttonResponse = 'horarios';
          break;
        case '3':
          buttonResponse = 'citas';
          break;
        case '4':
          buttonResponse = 'contacto';
          break;
        default:
          buttonResponse = 'servicios'; // Default fallback
      }
      
      console.log('DEBUG: Procesando botón como:', buttonResponse);
      
      // Procesar como si hubiera hablado
      const processedText = buttonResponse;
      
      // Obtener o crear sesión
      let session = this.conversationService.getSession(callSid);
      if (!session) {
        this.conversationService.createSession(callSid);
        session = this.conversationService.getSession(callSid);
      }

      // Agregar mensaje del usuario
      this.conversationService.addUserMessage(callSid, processedText);

      // Obtener historial de conversación
      const conversationHistory = this.conversationService.getConversationHistory(callSid);

      // Generar respuesta con contexto
      const aiResponse = await this.openAiService.getChatResponse(processedText, conversationHistory);

      // Logs para debug
      console.log(`DEBUG: [${buttonResponse.toUpperCase()}] AI Response Original:`, aiResponse);
      
      // Limpiar respuesta del AI (remover frases en inglés y preguntas duplicadas)
      const cleanedAiResponse = this.cleanAiResponse(aiResponse);
      console.log(`DEBUG: [${buttonResponse.toUpperCase()}] AI Response Cleaned:`, cleanedAiResponse);
      
      // Agregar respuesta del asistente con follow-up
      const followUpQuestion = this.generateContextualFollowUp(processedText);
      console.log(`DEBUG: [${buttonResponse.toUpperCase()}] Follow-up Question:`, followUpQuestion);
      
      const fullResponse = `${cleanedAiResponse}. ${followUpQuestion}`;
      console.log(`DEBUG: [${buttonResponse.toUpperCase()}] Full Response:`, fullResponse);
      
      this.conversationService.addAssistantMessage(callSid, fullResponse);

      // Configurar para continuar la conversación con pregunta proactiva
      const gather = twimlResponse.gather({
        input: ['speech', 'dtmf'],
        language: 'es-ES',
        speechTimeout: 'auto',
        timeout: 10,
        action: '/twilio/voice',
        method: 'POST',
      });
      
      // Reproducir el mensaje completo
      await this.generateAndPlayAudio(fullResponse, gather);
    } else {
      // Usuario habló - procesar respuesta normal
      const userText = req.body.SpeechResult.toLowerCase();
      const wantsToEnd = this.detectEndIntention(userText);
      const noMoreQuestions = this.detectNoMoreQuestions(userText);
      const yesToFollowUp = this.detectYesToFollowUp(userText);
      const isRelevantQuestion = this.conversationService.isRelevantQuestion(userText);
    
      if (wantsToEnd) {
        // Preguntar confirmación antes de terminar
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 8,
          action: '/twilio/confirm-end',
          method: 'POST',
        });
        await this.generateAndPlayAudio('¿Estás seguro de que quieres terminar la conversación? Presiona 1 para sí, presiona 2 para no, o dime directamente tu respuesta.', gather);
      } else if (noMoreQuestions) {
        // Usuario dice que no necesita más ayuda - ofrecer terminar
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 8,
          action: '/twilio/confirm-end',
          method: 'POST',
        });
        await this.generateAndPlayAudio('Perfecto, entiendo que ya no necesitas más ayuda. ¿Te parece bien terminar la conversación? Presiona 1 para sí, presiona 2 para no, o dime directamente tu respuesta.', gather);
      } else if (yesToFollowUp) {
        // Usuario dice "sí" a la pregunta de seguimiento - preguntar qué más necesita
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        await this.generateAndPlayAudio('Perfecto, dime directamente en qué puedo ayudarte o presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
      } else if (!isRelevantQuestion) {
        // Pregunta no relevante para el centro médico
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        await this.generateAndPlayAudio('Lo siento, solo puedo ayudarte con información sobre nuestros servicios otológicos. Dime directamente en qué puedo ayudarte o presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
      } else {
        // Obtener o crear sesión
        let session = this.conversationService.getSession(callSid);
        if (!session) {
          this.conversationService.createSession(callSid);
          session = this.conversationService.getSession(callSid);
        }

        // Agregar mensaje del usuario
        this.conversationService.addUserMessage(callSid, userText);

        // Obtener historial de conversación
        const conversationHistory = this.conversationService.getConversationHistory(callSid);

        // Generar respuesta con contexto
        const aiResponse = await this.openAiService.getChatResponse(userText, conversationHistory);

        // Logs para debug
        console.log(`DEBUG: [VOZ] AI Response Original:`, aiResponse);
        
        // Limpiar respuesta del AI (remover frases en inglés y preguntas duplicadas)
        const cleanedAiResponse = this.cleanAiResponse(aiResponse);
        console.log(`DEBUG: [VOZ] AI Response Cleaned:`, cleanedAiResponse);
        
        // Agregar respuesta del asistente con follow-up
        const followUpQuestion = this.generateContextualFollowUp(userText);
        console.log(`DEBUG: [VOZ] Follow-up Question:`, followUpQuestion);
        
        const fullResponse = `${cleanedAiResponse}. ${followUpQuestion}`;
        console.log(`DEBUG: [VOZ] Full Response:`, fullResponse);
        
        this.conversationService.addAssistantMessage(callSid, fullResponse);

        // Configurar para continuar la conversación con pregunta proactiva
        const gather = twimlResponse.gather({
          input: ['speech', 'dtmf'],
          language: 'es-ES',
          speechTimeout: 'auto',
          timeout: 10,
          action: '/twilio/voice',
          method: 'POST',
        });
        
        // Reproducir el mensaje completo
        await this.generateAndPlayAudio(fullResponse, gather);
      }
    }

    res.type('text/xml');
    res.send(twimlResponse.toString());
  }

  @Post('confirm-end')
  async confirmEndCall(@Req() req: Request, @Res() res: Response) {
    const twimlResponse = new twiml.VoiceResponse();
    const callSid = req.body.CallSid;
    const userResponse = req.body.SpeechResult?.toLowerCase() || '';
    const userDigits = req.body.Digits || '';

    // Detectar confirmación (voz o botones)
    const confirmKeywords = ['sí', 'si', 'yes', 'confirmo', 'correcto', 'exacto'];
    const denyKeywords = ['no', 'cancelar', 'continuar', 'seguir'];
    
    let confirmed = false;
    let denied = false;

    if (userDigits) {
      // Usuario presionó botones
      confirmed = userDigits === '1';
      denied = userDigits === '2';
    } else {
      // Usuario habló
      confirmed = confirmKeywords.some(keyword => userResponse.includes(keyword));
      denied = denyKeywords.some(keyword => userResponse.includes(keyword));
    }

    if (confirmed) {
      // Terminar la conversación

      this.conversationService.cleanupOldSessions(0); // Limpiar sesión actual
      await this.generateAndPlayAudio('Gracias por llamar al Centro Otológico de Puerto Rico. ¡Que tengas un buen día!', twimlResponse);
      twimlResponse.hangup();
    } else if (denied) {
      // Continuar la conversación
      const gather = twimlResponse.gather({
        input: ['speech', 'dtmf'],
        language: 'es-ES',
        speechTimeout: 'auto',
        timeout: 10,
        action: '/twilio/voice',
        method: 'POST',
      });
      await this.generateAndPlayAudio('Perfecto, continuemos. Dime directamente en qué puedo ayudarte o presiona 1 para servicios, 2 para horarios, 3 para citas, 4 para contacto.', gather);
    } else {
      // Respuesta no clara, preguntar de nuevo
      const gather = twimlResponse.gather({
        input: ['speech', 'dtmf'],
        language: 'es-ES',
        speechTimeout: 'auto',
        timeout: 8,
        action: '/twilio/confirm-end',
        method: 'POST',
      });
      await this.generateAndPlayAudio('No entendí tu respuesta. Presiona 1 para terminar la conversación, presiona 2 para continuar, o dime directamente tu respuesta.', gather);
    }

    res.type('text/xml');
    res.send(twimlResponse.toString());
  }
} 