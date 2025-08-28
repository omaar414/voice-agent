export interface CentroOtologicoData {
  clinicName: string;
  owner: {
    name: string;
    credentials: string[];
    bio: string;
  };
  tagline: string;
  hero: {
    headline: string;
    subheadline: string;
  };
  overview: string;
  contact: {
    address: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
  };
  businessHours: {
    [day: string]: string;
  };
  appointmentInfo: {
    bookingMethod: string;
    acceptsNewPatients: boolean;
    insurance: string[];
    walkIns: string;
    afterHours: string;
  };
  services: {
    category: string;
    items: string[];
  }[];
  targetPatients: {
    infantsChildren: string;
    adults: string;
    seniors: string;
  };
  affiliations: {
    hospitals: string[];
    professional: string[];
    npiNumber: string;
  };
}

export class CentroOtologicoConfig {
  private static instance: CentroOtologicoConfig;
  private data: CentroOtologicoData;

  constructor() {
    this.data = {
      clinicName: "Centro Otológico de Puerto Rico",
      owner: {
        name: "Dr. Miguel A. Lasalle López",
        credentials: [
          "MD",
          "Board‑Certified Otolaryngologist",
          "Fellowship‑trained Otologist/Neurotologist"
        ],
        bio: "Board‑certified ENT surgeon with over 20 years of experience, specializing in ear and hearing disorders, cochlear implants, and balance conditions."
      },
      tagline: "Expert Ear, Nose & Throat Care in Mayagüez",
      hero: {
        headline: "Hear Better. Breathe Better. Live Better.",
        subheadline: "Comprehensive ENT & Hearing Solutions for All Ages"
      },
      overview: "Centro Otológico de Puerto Rico is the leading otorhinolaryngology clinic in western Puerto Rico. Founded in 2002 and led by Dr. Miguel A. Lasalle, we deliver patient‑centered care ranging from routine ENT check‑ups to advanced ear surgeries and cochlear implants.",
      contact: {
        address: "55 Calle De Diego Este, Suite 105, CPR Professional Building, Mayagüez, PR 00680",
        phone: "(787) 833‑2155",
        fax: "(787) 833‑2680",
        email: "",
        website: "https://centrootologicopr.com"
      },
      businessHours: {
        monday: "8:00 am – 5:00 pm",
        tuesday: "8:00 am – 5:00 pm",
        wednesday: "8:00 am – 5:00 pm",
        thursday: "8:00 am – 5:00 pm",
        friday: "8:00 am – 5:00 pm",
        saturday: "Closed",
        sunday: "Closed"
      },
      appointmentInfo: {
        bookingMethod: "Call the office to schedule. Online booking currently unavailable.",
        acceptsNewPatients: true,
        insurance: [
          "Most major plans",
          "Medicare",
          "Medicaid"
        ],
        walkIns: "Not typical; please call for urgent cases.",
        afterHours: "For emergencies, visit the nearest ER or call the office for instructions."
      },
      services: [
        {
          category: "Diagnostics",
          items: [
            "Comprehensive ENT evaluation",
            "Audiological testing (hearing evaluations)",
            "Vestibular & balance testing"
          ]
        },
        {
          category: "Hearing Rehabilitation",
          items: [
            "Hearing aid fitting & programming",
            "Cochlear implant",
            "Bone‑anchored hearing devices",
            "Aural rehabilitation & counseling"
          ]
        },
        {
          category: "Medical Treatments",
          items: [
            "Sinus & allergy management",
            "Pediatric ENT care (ear infections, tonsillitis)",
            "Tinnitus evaluation & treatment"
          ]
        },
        {
          category: "Surgical Interventions",
          items: [
            "Cochlear implant surgery & programming",
            "Tympanoplasty & mastoidectomy",
            "Stapedectomy & cholesteatoma removal",
            "Functional endoscopic sinus surgery (FESS)",
            "Tonsillectomy & adenoidectomy"
          ]
        },
        {
          category: "Balance Disorder Management",
          items: [
            "Vertigo & Ménière's disease evaluation",
            "Medical management & vestibular rehab referrals"
          ]
        }
      ],
      targetPatients: {
        infantsChildren: "Diagnosis & treatment of congenital hearing loss, chronic ear infections, tonsil & adenoid disorders.",
        adults: "Hearing loss, sinus & allergy issues, balance disorders, sleep‑related breathing problems.",
        seniors: "Age‑related hearing loss, chronic ear disease, dizziness & fall‑risk assessment."
      },
      affiliations: {
        hospitals: [
          "Mayagüez Medical Center – Dr. Ramón E. Betances Hospital",
          "Hospital Perea, Mayagüez",
          "Hospital San Antonio, Mayagüez"
        ],
        professional: [
          "American Board of Otolaryngology – Head & Neck Surgery",
          "American Academy of Otolaryngology–Head and Neck Surgery"
        ],
        npiNumber: "1619958634"
      }
    };
  }

  static getInstance(): CentroOtologicoConfig {
    if (!CentroOtologicoConfig.instance) {
      CentroOtologicoConfig.instance = new CentroOtologicoConfig();
    }
    return CentroOtologicoConfig.instance;
  }

  getData(): CentroOtologicoData {
    return this.data;
  }

  generatePrompt(): string {
    const servicesList = this.data.services
      .map(service => `${service.category}: ${service.items.join(', ')}`)
      .join('\n- ');

    const businessHoursList = Object.entries(this.data.businessHours)
      .map(([day, hours]) => `${day}: ${hours}`)
      .join('\n- ');

    return `Eres el agente virtual del Centro Otológico de Puerto Rico, dirigido por el Dr. Miguel A. Lasalle López.

INFORMACIÓN ESPECÍFICA DEL CENTRO:
- Nombre: ${this.data.clinicName}
- Doctor: ${this.data.owner.name} - ${this.data.owner.credentials.join(', ')}
- Ubicación: ${this.data.contact.address}
- Teléfono: ${this.data.contact.phone}
- Fax: ${this.data.contact.fax}

HORARIOS DE ATENCIÓN:
- ${businessHoursList}

SERVICIOS DISPONIBLES:
- ${servicesList}

INFORMACIÓN DE CITAS:
- Método de reserva: ${this.data.appointmentInfo.bookingMethod}
- Acepta nuevos pacientes: ${this.data.appointmentInfo.acceptsNewPatients ? 'Sí' : 'No'}
- Seguros aceptados: ${this.data.appointmentInfo.insurance.join(', ')}
- Emergencias: ${this.data.appointmentInfo.afterHours}

INSTRUCCIONES ESPECÍFICAS:
- IMPORTANTE: SIEMPRE responde en ESPAÑOL
- Solo responde preguntas sobre servicios otológicos y del centro
- Si te preguntan algo fuera del tema médico otológico, di: "Lo siento, solo puedo ayudarte con información sobre nuestros servicios otológicos"
- IMPORTANTE: Usa la información del JSON para dar respuestas naturales en español
- NO devuelvas JSON literal, sino respuestas en texto natural
- NO agregues preguntas, sugerencias, o frases adicionales
- NO agregues "Feel free to ask" o frases en inglés
- NO agregues "¿Hay algo más en lo que pueda ayudarte?" o frases similares
- El sistema agregará automáticamente las opciones de seguimiento después de tu respuesta
- Para horarios: Si todos los días laborales tienen el mismo horario, di "De lunes a viernes de [hora] a [hora]" en lugar de listar cada día por separado
- Para horarios: Solo menciona días específicos si tienen horarios diferentes
- Para horarios: Siempre menciona que sábados y domingos están cerrados
- Para horarios: Formato recomendado: "De lunes a viernes de 8:00 am a 5:00 pm. Sábados y domingos cerrados."
- Para contacto: Proporciona la información de contacto real (teléfono, dirección, etc.) en formato natural, no como lista
- CRÍTICO: Responde ÚNICAMENTE con información natural en ESPAÑOL, sin JSON literal
- CRÍTICO: NO hagas preguntas adicionales en ninguna respuesta`;
  }

  getServiceByCategory(category: string): string[] {
    const service = this.data.services.find(s => 
      s.category.toLowerCase().includes(category.toLowerCase())
    );
    return service ? service.items : [];
  }

  getContactInfo(): { phone: string; address: string; hours: string } {
    return {
      phone: this.data.contact.phone,
      address: this.data.contact.address,
      hours: this.data.businessHours.monday
    };
  }

  isRelevantQuestion(userText: string): boolean {
    const medicalKeywords = [
      // Términos médicos específicos
      'oído', 'oreja', 'audición', 'sordera', 'audífono', 'implante', 'cóclea',
      'sinusitis', 'alergia', 'garganta', 'nariz', 'amígdalas', 'adenoides',
      'vértigo', 'equilibrio', 'tinnitus', 'otorrinolaringólogo', 'ent',
      'otorrinolaringología', 'otorrino', 'otorrinolaringólogo',
      
      // Servicios específicos del centro
      'consulta', 'cita', 'doctor', 'médico', 'clínica', 'centro médico',
      'evaluación', 'prueba', 'test', 'examen', 'diagnóstico',
      'tratamiento', 'cirugía', 'operación', 'procedimiento',
      
      // Información del centro
      'horario', 'horarios', 'teléfono', 'dirección', 'ubicación', 'servicios',
      'precio', 'costo', 'tarifa', 'seguro', 'seguros',
      'emergencia', 'urgencia', 'walk-in', 'sin cita',
      'citas', 'cita', 'contacto', 'información', 'info',
      
      // Preguntas generales sobre el centro
      'qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'dónde', 'donde',
      'cuándo', 'cuando', 'por qué', 'porque', 'quién', 'quien',
      
      // Términos relacionados
      'centro otológico', 'centro otologico', 'dr. lasalle', 'dr lasalle',
      'mayagüez', 'mayaguez', 'puerto rico', 'pr'
    ];

    const nonMedicalKeywords = [
      // Términos que indican preguntas fuera de contexto
      'clima', 'tiempo', 'temperatura', 'lluvia', 'sol',
      'deportes', 'fútbol', 'futbol', 'béisbol', 'beisbol',
      'política', 'elecciones', 'gobierno',
      'entretenimiento', 'película', 'pelicula', 'música', 'musica',
      'comida', 'restaurante', 'receta', 'cocina',
      'tecnología', 'tecnologia', 'computadora', 'internet',
      'viaje', 'turismo', 'hotel', 'avión', 'avion'
    ];

    const hasMedicalKeywords = medicalKeywords.some(keyword => 
      userText.toLowerCase().includes(keyword.toLowerCase())
    );

    const hasNonMedicalKeywords = nonMedicalKeywords.some(keyword => 
      userText.toLowerCase().includes(keyword.toLowerCase())
    );

    // Si tiene palabras médicas, es relevante
    if (hasMedicalKeywords) return true;
    
    // Si tiene palabras no médicas específicas, no es relevante
    if (hasNonMedicalKeywords) return false;
    
    // Si es una pregunta general (contiene palabras de pregunta), podría ser relevante
    const questionWords = ['qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'dónde', 'donde', 'cuándo', 'cuando', 'por qué', 'porque', 'quién', 'quien'];
    const hasQuestionWords = questionWords.some(word => userText.toLowerCase().includes(word.toLowerCase()));
    
    // Si es una pregunta pero no tiene palabras médicas ni no médicas específicas,
    // asumimos que es relevante (podría ser sobre el centro)
    return hasQuestionWords;
  }
} 