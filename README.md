# 🎤 Voice Agent - AI-Powered Voice Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.17.0-green" alt="Node.js Version">
  <img src="https://img.shields.io/badge/NestJS-11.1.4-red" alt="NestJS Version">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

<p align="center">
  <strong>Intelligent voice assistant powered by AI for natural conversations</strong>
</p>

---

## 🚀 Features

### 🎯 Core Capabilities
- **🎤 Voice-to-Text**: Real-time speech recognition
- **🤖 AI Conversations**: Natural language processing with OpenAI
- **🔊 Text-to-Speech**: High-quality voice synthesis
- **📞 Phone Integration**: Twilio voice call handling
- **🌐 Webhook Support**: RESTful API endpoints
- **⚡ Real-time Processing**: Low-latency voice interactions

### 🛠️ Technical Stack
- **Backend**: NestJS with TypeScript
- **AI/ML**: OpenAI GPT models
- **Voice**: Twilio Voice API
- **STT/TTS**: OpenAI Whisper & TTS
- **Configuration**: Environment-based settings

---

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Twilio Account** with Voice capabilities
- **OpenAI API Key**
- **ngrok** (for local webhook testing)

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd voice-agent-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

### 4. Required Environment Variables
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## 🚀 Running the Application

### Development Mode
```bash
# Start with hot reload
npm run start:dev

# Or start normally
npm run start
```

### Production Mode
```bash
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📡 API Endpoints

### Voice Call Endpoints

#### `POST /twilio/voice`
Handles incoming voice calls and initiates conversation flow.

**Request Body:**
```json
{
  "CallSid": "CA1234567890",
  "From": "+1234567890",
  "To": "+0987654321",
  "CallStatus": "ringing"
}
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! How can I help you today?</Say>
  <Record action="/twilio/confirm-end" maxLength="30"/>
</Response>
```

#### `POST /twilio/confirm-end`
Processes recorded audio and generates AI response.

**Request Body:**
```json
{
  "CallSid": "CA1234567890",
  "RecordingUrl": "https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123",
  "RecordingDuration": "15"
}
```

### TTS Testing Endpoint

#### `POST /tts/test`
Test text-to-speech functionality.

**Request Body:**
```json
{
  "text": "Hello, this is a test message!"
}
```

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://api.openai.com/v1/audio/speech/...",
  "duration": 2.5
}
```

---

## 🔧 Configuration

### Twilio Setup
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number with Voice capabilities
4. Configure webhook URL: `https://your-domain.com/twilio/voice`

### OpenAI Setup
1. Create an OpenAI account at [openai.com](https://openai.com)
2. Generate an API key
3. Ensure you have credits for API usage

### Webhook Testing with ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run start:dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL as your webhook endpoint
# Example: https://abc123.ngrok.io/twilio/voice
```

---

## 🏗️ Project Structure

```
voice-agent-backend/
├── src/
│   ├── modules/
│   │   ├── twilio/
│   │   │   ├── twilio.controller.ts    # Voice call endpoints
│   │   │   └── twilio.service.ts       # Twilio integration
│   │   ├── openai/
│   │   │   └── openai.service.ts       # AI conversation handling
│   │   └── dialogflow/
│   │       └── dialogflow.service.ts   # Intent recognition
│   ├── app.module.ts                   # Main application module
│   └── main.ts                         # Application entry point
├── test/                               # Test files
├── package.json                        # Dependencies and scripts
└── README.md                           # This file
```

---

## 🔄 Workflow

### 1. Incoming Call
```
User calls → Twilio → /twilio/voice → Greeting + Record
```

### 2. Audio Processing
```
Recording → OpenAI Whisper → Text → OpenAI GPT → Response
```

### 3. Voice Response
```
AI Response → OpenAI TTS → Audio → Twilio → User hears response
```

---

## 🧪 Testing

### Manual Testing
1. **Start the server**: `npm run start:dev`
2. **Expose with ngrok**: `ngrok http 3000`
3. **Configure Twilio webhook** with ngrok URL
4. **Make a test call** to your Twilio number
5. **Check logs** for debugging information

### Automated Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Twilio Webhook Errors
- Ensure webhook URL is publicly accessible
- Check Twilio logs in console
- Verify environment variables

#### OpenAI API Errors
- Check API key validity
- Ensure sufficient credits
- Verify API rate limits

---

## 📊 Performance & Scaling

### Current Limitations
- **Single-threaded** processing
- **Synchronous** API calls
- **No caching** implemented

### Future Improvements
- **Redis caching** for responses
- **Queue system** for high volume
- **Load balancing** for multiple instances
- **Database storage** for conversation history

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [NestJS Docs](https://docs.nestjs.com/)
- **Twilio Support**: [Twilio Docs](https://www.twilio.com/docs)
- **OpenAI Support**: [OpenAI Docs](https://platform.openai.com/docs)
- **Issues**: Create an issue in this repository

---

## 🙏 Acknowledgments

- **NestJS** for the amazing framework
- **Twilio** for voice communication infrastructure
- **OpenAI** for AI capabilities
- **Community** for contributions and feedback

---

<p align="center">
  <strong>Made with ❤️ for intelligent voice interactions</strong>
</p>
