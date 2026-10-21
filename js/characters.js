// Data for the two characters. Must always match CHARACTERS.md.
// Each phrase has its text and, when the text is in English, a Spanish subtitle.
var CHARACTERS = [
  {
    id: "realfixer",
    name: "real.fixer",
    nickname: "real.fixer (siempre en minúscula, con el punto). Amigo de Sofía. Vive en una carpa junto al río, con fogata y luciérnagas, y a veces la visita.",
    appearance: {
      skin: "piel clara",
      hair: "pelo oscuro corto bajo una gorra azul marino",
      facialHair: "barba completa oscura con canas",
      top: "camisa negra de manga corta con cuello, siempre por fuera del pantalón",
      bottom: "pantalón azul oscuro",
      accessory: "riñonera negra adelante",
      details: "ojos verde azulados; zapatillas negras; reloj dorado y anillos dorados"
    },
    traits: [
      { id: "calm", name: "Tranquilo", emoji: "🧘" },
      { id: "creative", name: "Creativo", emoji: "🎨" },
      { id: "chatty", name: "Conversador", emoji: "💬" }
    ],
    favoriteActivity: "charlar",
    catchphrase: { text: "Let's fix it.", subtitle: "¡Vamos a arreglarlo!" },
    dialogLanguage: "inglés con subtítulos en español",
    phrases: {
      greeting: [
        { text: "Hey! What's up?", subtitle: "¡Hola! ¿Qué tal?" },
        { text: "Good to see you.", subtitle: "Qué bueno verte." }
      ],
      chat: [
        { text: "I wrote a new song today.", subtitle: "Hoy escribí una canción nueva." },
        { text: "Everything can be fixed.", subtitle: "Todo se puede arreglar." }
      ],
      joke: [
        { text: "I'm not lazy, I'm in energy-saving mode.", subtitle: "No soy flojo, estoy en modo ahorro de energía." },
        { text: "My cap has more fans than me.", subtitle: "Mi gorra tiene más fans que yo." }
      ],
      highFive: [
        { text: "High five!", subtitle: "¡Choca esos cinco!" },
        { text: "Nice one!", subtitle: "¡Bien ahí!" }
      ],
      hunger: [
        { text: "I could eat a whole pizza.", subtitle: "Me comería una pizza entera." },
        { text: "Snack time?", subtitle: "¿Hora de picar algo?" }
      ],
      sleep: [
        { text: "I need a nap.", subtitle: "Necesito una siesta." },
        { text: "Low battery...", subtitle: "Poca batería..." }
      ],
      boredom: [
        { text: "Let's do something fun.", subtitle: "Hagamos algo divertido." },
        { text: "So quiet in here...", subtitle: "Qué silencio aquí..." }
      ],
      happy: [
        { text: "Let's fix it.", subtitle: "¡Vamos a arreglarlo!" },
        { text: "Life is good.", subtitle: "La vida es buena." }
      ]
    },
    relationships: { sofia: 0 }
  },
  {
    id: "sofia",
    name: "Sofía",
    nickname: "Sofía. Vive sola en su casita acogedora.",
    appearance: {
      skin: "piel clara",
      hair: "pelo castaño, largo",
      facialHair: "sin vello facial",
      top: "blusa rosa",
      bottom: "pantalón rosa claro",
      accessory: "collar dorado con una cuentita",
      details: "mejillas sonrosadas"
    },
    traits: [
      { id: "sleepy", name: "Dormilona", emoji: "😴" },
      { id: "foodie", name: "Glotona", emoji: "🍕" },
      { id: "creative", name: "Creativa", emoji: "🎨" }
    ],
    favoriteActivity: "ver tele",
    catchphrase: { text: "Pizza and a movie!", subtitle: "¡Pizza y una peli!" },
    dialogLanguage: "español",
    phrases: {
      greeting: [
        { text: "¡Holaaa! ¿Alguien trajo pizza?", subtitle: null },
        { text: "¡Qué bueno que viniste!", subtitle: null }
      ],
      chat: [
        { text: "Estoy pintando algo nuevo, ¿quieres verlo?", subtitle: null },
        { text: "¿Viste la peli de anoche?", subtitle: null }
      ],
      joke: [
        { text: "Dormí tanto que soñé que dormía.", subtitle: null },
        { text: "¿Pizza en el desayuno? Es pan con tomate, ¡vale!", subtitle: null }
      ],
      highFive: [
        { text: "¡Chócala!", subtitle: null },
        { text: "¡Equipo!", subtitle: null }
      ],
      hunger: [
        { text: "¿Qué hay de comer?", subtitle: null },
        { text: "Mi panza está cantando.", subtitle: null }
      ],
      sleep: [
        { text: "Cinco minutitos más… y después pinto algo.", subtitle: null },
        { text: "Mis ojos se cierran solos.", subtitle: null },
        { text: "Time for a nap!", subtitle: "¡Hora de la siesta!" }
      ],
      boredom: [
        { text: "Necesito pintar algo ya.", subtitle: null },
        { text: "¿Ponemos una peli?", subtitle: null }
      ],
      happy: [
        { text: "¡Pizza and a movie! Este día es perfecto.", subtitle: null },
        { text: "¡Qué lindo es mi rincón!", subtitle: null }
      ]
    },
    relationships: { realfixer: 0 }
  }
];
