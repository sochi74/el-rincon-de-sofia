// Words shown when the mouse is over furniture, rooms and places: Spanish, English and how to say
// the English word, written the way a Spanish speaker would read it. Only data.
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
  lumi: { es: "Lumi", en: "fairy", say: "FÉ-ri" },
  vladi: { es: "Vladi", en: "vampire", say: "VÁM-pai-er" },
  treehouse: { es: "Casa del árbol", en: "treehouse", say: "TRÍI-jaus" },
  castle: { es: "Castillo", en: "castle", say: "KÁ-sel" },
  neighbor: { es: "Vecino", en: "neighbor", say: "NÉI-bor" },
  wings: { es: "Alas", en: "wings", say: "UÍNGS" },
  teddyBear: { es: "Osito de peluche", en: "teddy bear", say: "TÉ-di BER" },

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

  // Krohna's bed by the Carpa
  krohnaBed: { es: "Cama de Krohna", en: "Krohna's bed", say: "KRÓ-nas BED" }
};
