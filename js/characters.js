// Data for the characters. Must always match CHARACTERS.md.
// "type" is "playable" (Sofía and real.fixer, who can be selected) or "neighbor" (Lumi and Vladi, who live in the city).
// Each phrase has its text and, when the text is in English, a Spanish subtitle.
// "goals" are the character's dream: 2 goals, one after the other (js/goals.js counts them). Each one has its emoji, its text,
// how it is said once it is done ("Sofía cosechó 5 flores"), how much it takes and the decoration it gives.
var CHARACTERS = [
  {
    id: "realfixer",
    name: "real.fixer",
    type: "playable",
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
    relationships: { sofia: 0, lumi: 0, vladi: 0 },
    favoriteGifts: [
      { id: "crabSoup", name: "Sopa de cangrejo" },
      { id: "crystal", name: "Cristal" }
    ],
    pet: "Krohna, un gatito naranja",
    goals: [
      { id: "chatNeighbors", emoji: "💬", text: "Charlar con todos los vecinos", done: "charló con todos los vecinos", target: 2,
        decoration: "🎸 una guitarra apoyada al costado de su carpa" },
      { id: "moonFish", emoji: "🌙", text: "Pescar un Pez luna", done: "pescó un Pez luna", target: 1,
        decoration: "🌙 un farolito con forma de luna colgado de la carpa, que brilla de noche" }
    ]
  },
  {
    id: "sofia",
    name: "Sofía",
    type: "playable",
    nickname: "Sofía. Vive sola en su casita acogedora.",
    appearance: {
      skin: "piel clara",
      hair: "pelo castaño, largo",
      facialHair: "sin vello facial",
      top: "blusa rosa",
      bottom: "pantalón rosa claro",
      accessory: "collar dorado con una cuentita",
      details: "mejillas sonrosadas; corona de princesa dorada, Princess crown"
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
    relationships: { realfixer: 0, lumi: 0, vladi: 0 },
    favoriteGifts: [
      { id: "berryPie", name: "Tarta de bayas" },
      { id: "magicDish", name: "Plato mágico" }
    ],
    pet: "ninguna",
    goals: [
      { id: "harvestFlowers", emoji: "🌸", text: "Cosechar 5 flores", done: "cosechó 5 flores", target: 5,
        decoration: "🌸 un florero con flores de colores del jardín en la Sala" },
      { id: "eatBerryPie", emoji: "🥧", text: "Comer una Tarta de bayas", done: "se comió una Tarta de bayas", target: 1,
        decoration: "🎊 banderines de colores en la pared de la Cocina" }
    ]
  },
  {
    id: "lumi",
    name: "Lumi",
    type: "neighbor",
    nickname: "Lumi. Hada vecina del valle. Vive en una casita en un árbol del bosque.",
    appearance: {
      skin: "piel clara con pecas",
      hair: "pelo pelirrojo con dos trenzas",
      facialHair: "sin vello facial",
      top: "vestido color durazno",
      bottom: "vestido color durazno",
      accessory: "alas doradas que aletean",
      details: "zapatitos dorados; es más bajita que Sofía y flota un poquito sobre el suelo, con una sombra suave debajo"
    },
    traits: [
      { id: "energetic", name: "Energética", emoji: "⚡" },
      { id: "jokester", name: "Bromista", emoji: "😜" },
      { id: "party", name: "Fiestera", emoji: "🎉" }
    ],
    favoriteActivity: "recolectar en el bosque",
    catchphrase: { text: "¡A volar se ha dicho!", subtitle: null },
    dialogLanguage: "español",
    phrases: {
      greeting: [
        { text: "¡Hola, hola! ¿Vienes a volar conmigo?", subtitle: null },
        { text: "¡Qué alegría verte!", subtitle: null }
      ],
      chat: [
        { text: "Encontré un cristal que brilla como una estrella.", subtitle: null },
        { text: "Desde mi casita del árbol se ve todo el valle.", subtitle: null }
      ],
      joke: [
        { text: "¿Por qué las hadas nunca llegan tarde? ¡Porque siempre llegan volando!", subtitle: null },
        { text: "Intenté hacer magia con una baya… ¡y me la comí!", subtitle: null }
      ],
      highFive: [
        { text: "¡Choca esas alas!", subtitle: null },
        { text: "¡Chispas!", subtitle: null }
      ],
      hunger: [
        { text: "Se me antoja una baya.", subtitle: null },
        { text: "Mis alas necesitan merienda.", subtitle: null }
      ],
      sleep: [
        { text: "Hasta las hadas bostezan…", subtitle: null },
        { text: "Un ratito en mi árbol y vuelvo.", subtitle: null }
      ],
      boredom: [
        { text: "¿Y si hacemos una fiesta?", subtitle: null },
        { text: "¡Qué quieto está todo!", subtitle: null }
      ],
      happy: [
        { text: "¡A volar se ha dicho!", subtitle: null },
        { text: "¡Brillitos para todos!", subtitle: null }
      ]
    },
    relationships: { sofia: 0, realfixer: 0, vladi: 0 },
    favoriteGifts: [
      { id: "crystal", name: "Cristal" }
    ],
    pet: "ninguna",
    goals: [
      { id: "friendsAll", emoji: "🎉", text: "Ser amiga de todos", done: "es amiga de todos", target: 2,
        decoration: "💎 un farol de cristal colgado en su casita del árbol, que brilla de noche" },
      { id: "friendVladi", emoji: "🦋", text: "Ser amiga de Vladi", done: "es amiga de Vladi", target: 1,
        decoration: "✨ una guirnalda de lucecitas de colores en su árbol, que titilan de noche" }
    ]
  },
  {
    id: "vladi",
    name: "Vladi",
    type: "neighbor",
    nickname: "Vladi. Vampiro vecino del valle, que le tiene miedo a la oscuridad. Vive en un castillito con faroles siempre encendidos.",
    appearance: {
      skin: "piel pálida",
      hair: "pelo negro peinado hacia atrás",
      facialHair: "sin vello facial",
      top: "traje negro con camisa blanca; capa negra por fuera y roja por dentro, con cuello alto",
      bottom: "pantalón negro del traje",
      accessory: "siempre abraza un osito de peluche café",
      details: "dos colmillitos blancos pequeños; zapatos negros"
    },
    traits: [
      { id: "gamer", name: "Gamer", emoji: "🎮" },
      { id: "calm", name: "Tranquilo", emoji: "🧘" },
      { id: "sleepy", name: "Dormilón", emoji: "😴" }
    ],
    favoriteActivity: "cocinar",
    catchphrase: { text: "Is it dark in here?", subtitle: "¿Está oscuro aquí?" },
    dialogLanguage: "inglés con subtítulos en español",
    phrases: {
      greeting: [
        { text: "Oh! Hi... you scared me.", subtitle: "¡Oh! Hola... me asustaste." },
        { text: "Good evening, friend.", subtitle: "Buenas noches, amigo." }
      ],
      chat: [
        { text: "I'm cooking a soup tonight.", subtitle: "Esta noche cocino una sopa." },
        { text: "My teddy bear is very brave.", subtitle: "Mi osito es muy valiente." }
      ],
      joke: [
        { text: "I sleep all day. It's my superpower.", subtitle: "Duermo todo el día. Es mi superpoder." },
        { text: "A vampire who loves garlic soup? That's me!", subtitle: "¿Un vampiro que ama la sopa de ajo? ¡Ese soy yo!" }
      ],
      highFive: [
        { text: "High five! ...gently.", subtitle: "¡Choca esos cinco! ...suavecito." },
        { text: "Cool!", subtitle: "¡Genial!" }
      ],
      hunger: [
        { text: "Is it dinner time?", subtitle: "¿Ya es hora de cenar?" },
        { text: "Crab soup, please!", subtitle: "¡Sopa de cangrejo, por favor!" }
      ],
      sleep: [
        { text: "So sleepy...", subtitle: "Qué sueño..." },
        { text: "Five more minutes.", subtitle: "Cinco minutos más." }
      ],
      boredom: [
        { text: "Let's play a game.", subtitle: "Juguemos un juego." },
        { text: "Is it dark in here?", subtitle: "¿Está oscuro aquí?" }
      ],
      happy: [
        { text: "Is it dark in here? No? Great!", subtitle: "¿Está oscuro aquí? ¿No? ¡Genial!" },
        { text: "I'm brave! ...Mostly.", subtitle: "¡Soy valiente! ...Casi siempre." }
      ]
    },
    relationships: { sofia: 0, realfixer: 0, lumi: 0 },
    favoriteGifts: [
      { id: "crab", name: "Cangrejo" }
    ],
    pet: "ninguna",
    goals: [
      { id: "bestFriend", emoji: "💛", text: "Tener un mejor amigo", done: "tiene un mejor amigo", target: 1,
        decoration: "🍲 una olla brillante junto a la puerta de su castillito" },
      { id: "crabSoupGift", emoji: "🦀", text: "Recibir una Sopa de cangrejo", done: "recibió una Sopa de cangrejo", target: 1,
        decoration: "💛 un corazón dorado en una de las torrecitas" }
    ]
  }
];

// Only the ones that can be selected (Sofía and real.fixer), or only the neighbors.
function playableCharacters() {
  return CHARACTERS.filter(function (c) { return c.type === "playable"; });
}

function neighborCharacters() {
  return CHARACTERS.filter(function (c) { return c.type === "neighbor"; });
}
