import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class GoogleStorageService {
  private storage: Storage;
  private bucketName = 'voice-agent-audio';

  constructor() {
    this.storage = new Storage({
      keyFilename: './google-credentials.json',
    });
  }

  async uploadAudioFile(audioBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      // Subir el archivo (sin ACL, usando IAM)
      await file.save(audioBuffer, {
        metadata: {
          contentType: 'audio/mpeg',
        },
      });

      // Generar URL pública
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      
      console.log(`Audio file uploaded: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw new Error('Failed to upload audio file');
    }
  }

  async deleteAudioFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      
      await file.delete();
      console.log(`Audio file deleted: ${fileName}`);
    } catch (error) {
      console.error('Error deleting audio file:', error);
      // No lanzar error aquí, solo log
    }
  }

  generateFileName(): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `audio-${timestamp}-${randomId}.mp3`;
  }


} 