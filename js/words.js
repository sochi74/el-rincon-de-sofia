// Words shown when the mouse is over furniture, rooms and places: Spanish, English and how to say
// the English word, written the way a Spanish speaker would read it. Only data.
// "diary" is the word that goes to the 📖 Diario instead, when the tag shows a name (like "Lumi · fairy" → "Hada · fairy").
// Also the list of words Professor Hoot teaches (LESSON_WORDS, at the end).
var WORDS = {
  // House
  kitchen: { es: "Cocina", en: "kitchen", say: "KÍ-chen" },
  bedroom: { es: "Dormitorio", en: "bedroom", say: "BÉD-rum" },
  living: { es: "Sala", en: "living room", say: "LÍ-ving rum" },
  fridge: { es: "Refrigerador", en: "fridge", say: "FRICH" },
  bed: { es: "Cama", en: "bed", say: "BED" },
  tv: { es: "Televisión", en: "TV", say: "ti-VÍ" },
  sofa: { es: "Sofá", en: "couch", say: "KÁUCH" },
  door: { es: "Puerta", en: "door", say: "DOR" },

  // City
  house: { es: "Casa de Sofía", en: "Sofía's house", say: "so-FÍ-as JÁUS" },
  river: { es: "Río", en: "river", say: "RÍ-ver" },
  bridge: { es: "Puente", en: "bridge", say: "BRICH" },
  forest: { es: "Bosque", en: "forest", say: "FÓ-rest" },
  tree: { es: "Árbol", en: "tree", say: "TRÍI" },
  square: { es: "Plaza", en: "square", say: "SKUÉR" },
  fountain: { es: "Fuente", en: "fountain", say: "FÁUN-ten" },
  tent: { es: "Carpa", en: "tent", say: "TENT" },
  campfire: { es: "Fogata", en: "campfire", say: "KÁMP-fáier" },
  firefly: { es: "Luciérnaga", en: "firefly", say: "FÁIER-flai" },
  coin: { es: "Moneda", en: "coin", say: "KÓIN" },

  // Garden
  garden: { es: "Jardín", en: "garden", say: "GÁR-den" },
  seed: { es: "Semilla", en: "seed", say: "SÍID" },
  flower: { es: "Flor", en: "flower", say: "FLÁU-er" },
  tulip: { es: "Tulipán", en: "tulip", say: "TÚ-lip" },
  lily: { es: "Lirio", en: "lily", say: "LÍ-li" },
  rainbow: { es: "Flor arcoíris", en: "rainbow flower", say: "RÉIN-bou FLÁU-er" },
  moon: { es: "Flor de luna", en: "moonflower", say: "MÚUN-flau-er" },
  butterfly: { es: "Mariposa", en: "butterfly", say: "BÁ-ter-flai" },

  // River and forest
  fish: { es: "Pez", en: "fish", say: "FISH" },
  crab: { es: "Cangrejo", en: "crab", say: "KRAB" },
  boot: { es: "Bota", en: "boot", say: "BÚUT" },
  berry: { es: "Baya", en: "berry", say: "BÉ-ri" },
  mushroom: { es: "Hongo", en: "mushroom", say: "MÁSH-rum" },
  crystal: { es: "Cristal", en: "crystal", say: "KRÍS-tal" },
  backpack: { es: "Mochila", en: "backpack", say: "BÁK-pak" },

  // Cooking
  stove: { es: "Estufa", en: "stove", say: "STÓUV" },
  cook: { es: "Cocinar", en: "cook", say: "KUK" },
  recipe: { es: "Receta", en: "recipe", say: "RÉ-si-pi" },
  dish: { es: "Plato", en: "dish", say: "DISH" },
  soup: { es: "Sopa", en: "soup", say: "SÚUP" },
  pie: { es: "Tarta", en: "pie", say: "PÁI" },
  eat: { es: "Comer", en: "eat", say: "ÍIT" },

  // Friendship and gifts
  gift: { es: "Regalo", en: "gift", say: "GUIFT" },
  friend: { es: "Amigo", en: "friend", say: "FREND" },
  bestFriends: { es: "Mejores amigos", en: "best friends", say: "BEST FRENDS" },
  kitten: { es: "Gatito", en: "kitten", say: "KÍ-ten" },

  // Neighbors
  lumi: { es: "Lumi", en: "fairy", say: "FÉ-ri", diary: "fairy" },
  vladi: { es: "Vladi", en: "vampire", say: "VÁM-pai-er", diary: "vampire" },
  fairy: { es: "Hada", en: "fairy", say: "FÉ-ri" },
  vampire: { es: "Vampiro", en: "vampire", say: "VÁM-pai-er" },
  treehouse: { es: "Casa del árbol", en: "treehouse", say: "TRÍI-jaus" },
  castle: { es: "Castillo", en: "castle", say: "KÁ-sel" },
  neighbor: { es: "Vecino", en: "neighbor", say: "NÉI-bor" },
  wings: { es: "Alas", en: "wings", say: "UÍNGS" },
  teddyBear: { es: "Osito de peluche", en: "teddy bear", say: "TÉ-di BER" },
  hoot: { es: "Professor Hoot", en: "fox", say: "FOKS", diary: "fox" },
  hollowTree: { es: "Árbol hueco", en: "hollow tree", say: "JÓ-lou TRÍI" },
  chalkboard: { es: "Pizarra", en: "chalkboard", say: "CHÓK-bord" },

  // Sound button
  sound: { es: "Sonido", en: "sound", say: "SÁUND" },

  // Dreams and goals, and the decorations they give
  goal: { es: "Meta", en: "goal", say: "GÓUL" },
  dream: { es: "Sueño", en: "dream", say: "DRÍIM" },
  easel: { es: "Caballete", en: "easel", say: "Í-sel" },
  painting: { es: "Cuadro", en: "painting", say: "PÉIN-ting" },
  vase: { es: "Florero", en: "vase", say: "VÉIS" },
  bunting: { es: "Banderines", en: "bunting", say: "BÁN-ting" },
  guitar: { es: "Guitarra", en: "guitar", say: "gui-TÁR" },
  lantern: { es: "Farol", en: "lantern", say: "LÁN-tern" },
  fairyLights: { es: "Guirnalda de luces", en: "fairy lights", say: "FÉ-ri LÁITS" },
  pot: { es: "Olla", en: "pot", say: "POT" },
  heart: { es: "Corazón", en: "heart", say: "JÁRT" },

  // Modo decorar
  decorate: { es: "Decorar", en: "decorate", say: "DÉ-ko-reit" },
  turn: { es: "Girar", en: "turn", say: "TERN" },
  done: { es: "Listo", en: "done", say: "DAN" },
  rug: { es: "Alfombra", en: "rug", say: "RAG" },
  pizzaOven: { es: "Horno de pizza", en: "pizza oven", say: "PÍT-sa Á-ven" },

  // Baño
  bathroom: { es: "Baño", en: "bathroom", say: "BÁZ-rum" },
  bathtub: { es: "Bañera", en: "bathtub", say: "BÁZ-tab" },
  bubbles: { es: "Burbujas", en: "bubbles", say: "BÁ-bels" },
  sink: { es: "Lavamanos", en: "sink", say: "SINK" },
  mirror: { es: "Espejo", en: "mirror", say: "MÍ-rror" },
  toilet: { es: "Inodoro", en: "toilet", say: "TÓI-let" },
  soap: { es: "Jabón", en: "soap", say: "SÓUP" },
  plant: { es: "Planta", en: "plant", say: "PLANT" },
  towel: { es: "Toalla", en: "towel", say: "TÁU-el" },
  toothbrush: { es: "Cepillo de dientes", en: "toothbrush", say: "TÚZ-brash" },

  // Weather (js/weather.js)
  weather: { es: "Clima", en: "weather", say: "UÉ-der" },
  sunny: { es: "Soleado", en: "sunny", say: "SÁ-ni" },
  rain: { es: "Lluvia", en: "rain", say: "RÉIN" },
  fog: { es: "Niebla", en: "fog", say: "FOG" },
  snow: { es: "Nieve", en: "snow", say: "SNÓU" },
  rainbowSky: { es: "Arcoíris", en: "rainbow", say: "RÉIN-bou" },
  snowman: { es: "Muñeco de nieve", en: "snowman", say: "SNÓU-man" },
  puddle: { es: "Charco", en: "puddle", say: "PÁ-del" },

  // Krohna's bed by the Carpa
  krohnaBed: { es: "Cama de Krohna", en: "Krohna's bed", say: "KRÓ-nas BED" },

  // Professor Hoot and the Diario de palabras (js/lessons.js)
  fox: { es: "Zorro", en: "fox", say: "FOKS" },
  teacher: { es: "Profesor", en: "teacher", say: "TÍI-cher" },
  diary: { es: "Diario", en: "diary", say: "DÁI-a-ri" },
  word: { es: "Palabra", en: "word", say: "UÓRD" },

  // The edge of the valley, the Pradera de flores and the Mapa del valle (js/valleymap.js and js/meadow.js)
  meadow: { es: "Pradera", en: "meadow", say: "MÉ-dou" },
  daisy: { es: "Margarita", en: "daisy", say: "DÉI-si" },
  poppy: { es: "Amapola", en: "poppy", say: "PÓ-pi" },
  lavender: { es: "Lavanda", en: "lavender", say: "LÁ-ven-der" },
  swing: { es: "Columpio", en: "swing", say: "SUÍNG" },
  picnic: { es: "Picnic", en: "picnic", say: "PÍK-nik" },
  bee: { es: "Abeja", en: "bee", say: "BÍI" },
  beehive: { es: "Colmena", en: "beehive", say: "BÍI-jaiv" },
  hill: { es: "Colina", en: "hill", say: "JIL" },
  map: { es: "Mapa", en: "map", say: "MAP" },
  comingSoon: { es: "Próximamente", en: "coming soon", say: "KÁ-ming SÚUN" },

  // The Lago (js/lake.js). Pacífica's tag says her name; in the Diario she is "Sirena · mermaid", like the neighbors.
  lake: { es: "Lago", en: "lake", say: "LÉIK" },
  beach: { es: "Playa", en: "beach", say: "BÍICH" },
  sand: { es: "Arena", en: "sand", say: "SAND" },
  pier: { es: "Muelle", en: "pier", say: "PÍIR" },
  duck: { es: "Pato", en: "duck", say: "DAK" },
  duckling: { es: "Patito", en: "duckling", say: "DÁK-ling" },
  sandcastle: { es: "Castillo de arena", en: "sandcastle", say: "SÁND-ka-sel" },
  shell: { es: "Concha", en: "shell", say: "SHEL" },
  starfish: { es: "Estrella de mar", en: "starfish", say: "STÁR-fish" },
  trout: { es: "Trucha", en: "trout", say: "TRÁUT" },
  shrimp: { es: "Camarón", en: "shrimp", say: "SHRIMP" },
  pearlFish: { es: "Pez perla", en: "pearl fish", say: "PÉRL FISH" },
  beachChair: { es: "Silla de playa", en: "beach chair", say: "BÍICH CHER" },
  umbrella: { es: "Sombrilla", en: "umbrella", say: "am-BRÉ-la" },
  rock: { es: "Roca", en: "rock", say: "ROK" },
  pacifica: { es: "Pacífica", en: "mermaid", say: "MÉR-meid", diary: "mermaid" },
  mermaid: { es: "Sirena", en: "mermaid", say: "MÉR-meid" },

  // The Bosque encantado (js/enchanted.js) and the band-aid of a snake bite
  enchanted: { es: "Bosque encantado", en: "enchanted forest", say: "en-CHÁN-ted FÓ-rest" },
  giantMushroom: { es: "Hongo gigante", en: "giant mushroom", say: "YÁI-ant MÁSH-rum" },
  fairyRing: { es: "Círculo de hongos", en: "fairy ring", say: "FÉ-ri RING" },
  wish: { es: "Deseo", en: "wish", say: "UÍSH" },
  stream: { es: "Arroyo", en: "stream", say: "STRÍIM" },
  spirit: { es: "Espíritu", en: "spirit", say: "SPÍ-rit" },
  snake: { es: "Víbora", en: "snake", say: "SNÉIK" },
  hollowLog: { es: "Tronco hueco", en: "hollow log", say: "JÓ-lou LOG" },
  bandAid: { es: "Curita", en: "band-aid", say: "BÁND-eid" },
  leafFish: { es: "Pez hoja", en: "leaf fish", say: "LÍIF FISH" },
  mushroomFish: { es: "Pez hongo", en: "mushroom fish", say: "MÁSH-rum FISH" },
  spiritFish: { es: "Pez espíritu", en: "spirit fish", say: "SPÍ-rit FISH" },
  mushroomHouse: { es: "Casita de hongo", en: "mushroom house", say: "MÁSH-rum JÁUS" },
  acorn: { es: "Bellota", en: "acorn", say: "ÉI-korn" },
  littleLantern: { es: "Farolito", en: "little lantern", say: "LÍ-tel LÁN-tern" },

  // The sunflower field of the Pradera de flores (js/meadow.js)
  sunflower: { es: "Girasol", en: "sunflower", say: "SÁN-flau-er" },

  // The Montaña (js/mountain.js). Its rocks, the curious ones too, say "Roca · rock" (above, from the Lago).
  mountain: { es: "Montaña", en: "mountain", say: "MÁUN-ten" },
  pine: { es: "Pino", en: "pine", say: "PÁIN" },
  trail: { es: "Sendero", en: "trail", say: "TRÉIL" },
  lookout: { es: "Mirador", en: "lookout", say: "LÚK-aut" },
  bench: { es: "Banco", en: "bench", say: "BENCH" },
  nest: { es: "Nido", en: "nest", say: "NEST" },
  feather: { es: "Pluma", en: "feather", say: "FÉ-der" },
  footprint: { es: "Huella", en: "footprint", say: "FÚT-print" },
  mud: { es: "Barro", en: "mud", say: "MAD" },
  leaf: { es: "Hoja", en: "leaf", say: "LÍIF" },
  goat: { es: "Cabra", en: "goat", say: "GÓUT" },
  babyGoat: { es: "Cabrita", en: "baby goat", say: "BÉI-bi GÓUT" },
  stoneTower: { es: "Torre de piedras", en: "stone tower", say: "STÓUN TÁU-er" },
  cave: { es: "Cueva", en: "cave", say: "KÉIV" },

  // The Cueva (js/cave.js). Its rock walls say "Roca · rock" (above, from the Lago).
  bat: { es: "Murciélago", en: "bat", say: "BAT" },
  drop: { es: "Gota", en: "drop", say: "DROP" },
  stalactite: { es: "Estalactita", en: "stalactite", say: "sta-LÁK-tait" },
  crystalBlue: { es: "Cristal azul", en: "blue crystal", say: "BLÚU KRÍS-tal" },
  crystalAmethyst: { es: "Cristal amatista", en: "amethyst", say: "Á-me-zist" },
  crystalPink: { es: "Cristal rosa", en: "pink crystal", say: "PINK KRÍS-tal" },
  crystalGold: { es: "Cristal dorado", en: "gold crystal", say: "GÓULD KRÍS-tal" },
  crystalNest: { es: "Nido de cristales", en: "crystal nest", say: "KRÍS-tal NEST" },
  chispa: { es: "Chispa", en: "dragon", say: "DRÁ-gon", diary: "dragon" },
  dragon: { es: "Dragón", en: "dragon", say: "DRÁ-gon" },
  sparks: { es: "Chispitas", en: "sparks", say: "SPARKS" },
  sneeze: { es: "Estornudo", en: "sneeze", say: "SNÍIZ" },

  // The hidden treasures (js/treasure.js): the chests, the counter of the Mapa del valle, and the decorations they bring
  // to Sofía's house (the shell lamp and the mushroom lamp both say "Lámpara · lamp").
  chest: { es: "Cofre", en: "chest", say: "CHEST" },
  treasure: { es: "Tesoro", en: "treasure", say: "TRÉ-sher" },
  wallClock: { es: "Reloj de pared", en: "wall clock", say: "UÓL KLOK" },
  pressedFlowers: { es: "Flores prensadas", en: "pressed flowers", say: "PREST FLÁU-ers" },
  lamp: { es: "Lámpara", en: "lamp", say: "LAMP" },
  woolBlanket: { es: "Manta de lana", en: "wool blanket", say: "UÚL BLÁN-ket" },
  geode: { es: "Geoda", en: "geode", say: "YÍ-oud" },

  // The little frogs of the Lago and the stream (js/frogs.js): the frogs, their lily pads, the notes of their chorus and
  // the splash when one jumps into the water.
  frog: { es: "Rana", en: "frog", say: "FROG" },
  colorfulFrog: { es: "Rana de colores", en: "colorful frog", say: "KÁ-lor-ful FROG" },
  lilyPad: { es: "Nenúfar", en: "lily pad", say: "LÍ-li PAD" },
  ribbit: { es: "Croac", en: "ribbit", say: "RÍ-bit" },
  splash: { es: "Salpicadura", en: "splash", say: "SPLASH" }
};

// The words Professor Hoot teaches, one per day of the game, in this order (after the last one they start again).
// Each one has its meaning in Spanish, how to say it, and an example with its Spanish subtitle.
var LESSON_WORDS = [
  { en: "happy", es: "feliz", say: "JÁ-pi", example: { text: "I am happy today.", subtitle: "Estoy feliz hoy." } },
  { en: "book", es: "libro", say: "BUK", example: { text: "I love this book.", subtitle: "Me encanta este libro." } },
  { en: "star", es: "estrella", say: "STAR", example: { text: "Look at that star!", subtitle: "¡Mira esa estrella!" } },
  { en: "cloud", es: "nube", say: "KLÁUD", example: { text: "That cloud looks like a cat.", subtitle: "Esa nube parece un gato." } },
  { en: "blue", es: "azul", say: "BLÚU", example: { text: "The river is blue.", subtitle: "El río es azul." } },
  { en: "sing", es: "cantar", say: "SING", example: { text: "Let's sing a song.", subtitle: "Cantemos una canción." } },
  { en: "dance", es: "bailar", say: "DANS", example: { text: "Lumi loves to dance.", subtitle: "A Lumi le encanta bailar." } },
  { en: "big", es: "grande", say: "BIG", example: { text: "This tree is very big.", subtitle: "Este árbol es muy grande." } },
  { en: "small", es: "pequeño", say: "SMOL", example: { text: "Krohna is small.", subtitle: "Krohna es pequeño." } },
  { en: "warm", es: "cálido", say: "UÓRM", example: { text: "The campfire is warm.", subtitle: "La fogata es cálida." } },
  { en: "cold", es: "frío", say: "KÓULD", example: { text: "Snow is cold.", subtitle: "La nieve es fría." } },
  { en: "apple", es: "manzana", say: "Á-pel", example: { text: "An apple a day!", subtitle: "¡Una manzana al día!" } },
  { en: "read", es: "leer", say: "RÍID", example: { text: "I read every night.", subtitle: "Leo cada noche." } },
  { en: "write", es: "escribir", say: "RÁIT", example: { text: "Write a new word.", subtitle: "Escribe una palabra nueva." } },
  { en: "laugh", es: "reír", say: "LAF", example: { text: "Your jokes make me laugh.", subtitle: "Tus chistes me hacen reír." } },
  { en: "sky", es: "cielo", say: "SKÁI", example: { text: "The sky is pink today.", subtitle: "El cielo está rosado hoy." } },
  { en: "brave", es: "valiente", say: "BRÉIV", example: { text: "Vladi is brave... mostly.", subtitle: "Vladi es valiente... casi siempre." } },
  { en: "beautiful", es: "hermoso", say: "BIÚ-ti-ful", example: { text: "What a beautiful garden!", subtitle: "¡Qué jardín tan hermoso!" } },
  { en: "thank you", es: "gracias", say: "ZÉNK IU", example: { text: "Thank you for the gift!", subtitle: "¡Gracias por el regalo!" } },
  { en: "tomorrow", es: "mañana", say: "tu-MÓ-rrou", example: { text: "See you tomorrow!", subtitle: "¡Nos vemos mañana!" } }
];
