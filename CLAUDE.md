# CLAUDE.md

## Qué es
El Rincón de Sofía: un juego de vida acogedor con nombre y arte propios. Una casa vista desde arriba donde vive Sofía, y su amigo real.fixer viene de visita.

## Reglas fijas (nunca cambiarlas)
- HTML, CSS y JavaScript puros con canvas 2D. Sin build, sin Node ni npm, sin frameworks, sin librerías, sin CDN, sin fuentes web (solo fuentes del sistema y emoji), sin imágenes: todo el arte se dibuja con código.
- Funciona igual con doble clic en index.html (file://) y en GitHub Pages: <script src> clásicos en orden fijo, sin módulos ES, sin fetch, todos los datos dentro de archivos .js.
- Nombres de archivo en minúsculas; referencias con las mismas mayúsculas exactas.
- Nunca usar "Sims", "The Sims", nombres o logos de EA, Simlish ni arte de EA.
- Personajes jugables: exactamente dos, Sofía y real.fixer. Vecinos: Lumi, Vladi y Professor Hoot (no se seleccionan). Solo la casa de Sofía tiene interior, con Cocina, Dormitorio, Sala y Baño; las casas de los vecinos se ven solo desde afuera en la ciudad. El mundo tiene la ciudad y zonas alrededor a las que se llega caminando por sus bordes (por ahora la Pradera de flores, el Lago y el Bosque encantado).
- Criaturas mágicas de las zonas: no son vecinos, no se seleccionan y no se charla con ellas. Por ahora: Pacífica, la sirena del Lago, y en el Bosque encantado los espíritus del bosque, las víboras de los troncos huecos, las bellotitas de la Casita de hongo y los farolitos vivos.
- Guardado (Hito 6): localStorage dentro de try/catch; el juego funciona aunque falle.
- Repo público; GitHub Pages desde main, carpeta raíz.

## Estructura
- index.html: página, pantalla de inicio y canvas
- style.css: estilos
- .nojekyll: GitHub Pages sin Jekyll
- js/config.js: colores, tamaños y constantes
- js/words.js: palabras en español e inglés con pronunciación, y las palabras que enseña Professor Hoot
- js/characters.js: datos de los personajes
- js/time.js: reloj del juego, día y noche
- js/house.js: dibujo de la casa y los muebles
- js/city.js: mapa de la ciudad y sus lugares
- js/coins.js: monedas mágicas y monedas brillantes
- js/sims.js: dibujo, selección y movimiento
- js/neighbors.js: los vecinos Lumi, Vladi y Professor Hoot: dibujo, paseo y horarios
- js/ui.js: panel
- js/main.js: arranque y bucle del juego
- js/needs.js: necesidades y cómo bajan
- js/objects.js: muebles que se pueden usar y sus acciones
- js/social.js: interacciones y amistad
- js/save.js: guardado y carga de la partida
- js/garden.js: jardín, semillas, crecimiento y cosecha
- js/inventory.js: mochila compartida y venta
- js/gather.js: pescar en el río y recolectar en el bosque
- js/cooking.js: recetas, estufa y fogata para cocinar
- js/path.js: caminos que esquivan obstáculos
- js/gifts.js: regalos desde la mochila
- js/goals.js: sueños y metas de cada personaje, su avance, la celebración y la ventana 🌟 Metas
- js/lessons.js: la palabra del día de Professor Hoot (con su pregunta) y el 📖 Diario de palabras
- js/pet.js: Krohna, el gatito de real.fixer
- js/audio.js: sonidos y música creados con código
- js/decorate.js: Modo decorar: mover y girar muebles y decoraciones, y volver a como estaba
- js/weather.js: el clima de cada día (sol, lluvia con arcoíris, niebla mágica, nieve), sus efectos en el juego y su dibujo, y las estrellas fugaces de noche (Wishing stars)
- js/valleymap.js: el borde del valle (el senderito de arriba a la Pradera, el senderito de arena de la derecha al Lago, el senderito con hojitas de la izquierda al Bosque encantado y el cartel Próximamente de abajo) y el 🗺️ Mapa del valle
- js/meadow.js: la Pradera de flores: dibujo, flores silvestres, columpio, manta de picnic, abejitas y campo de girasoles
- js/lake.js: el Lago: dibujo, muelle y pesca, conchitas, castillo de arena, sillas, patitos y Pacífica
- js/enchanted.js: el Bosque encantado: dibujo, hongos gigantes, hongo para descansar, círculo de hongos y deseo, arroyo con puentecito y pesca, espíritus del bosque, víboras de los troncos huecos y curitas, la Casita de hongo con sus bellotitas y los farolitos vivos
- Orden de scripts: config, words, characters, time, weather, house, city, valleymap, meadow, lake, enchanted, coins, garden, inventory, gather, cooking, path, sims, neighbors, needs, objects, social, gifts, goals, lessons, pet, audio, decorate, ui, save, main
- Todo archivo nuevo se anota aquí.

## Convenciones
- Español: textos del juego, biblias, pull requests y la conversación con Sofía. Inglés: nombres en el código, nombres de archivo y mensajes de commit.
- Hito 1 va directo a main. Desde el Hito 2: una sesión = un hito = una rama hito-N-<slug>.
- Commits estilo conventional commits en inglés (feat, fix, docs).
- Pull request con secciones: Qué construimos, Cómo probarlo, Archivos que cambiaron, Biblias actualizadas, Problemas conocidos, Ideas para después.
- En cada hito, actualizar en README.md la sección 'Para el Modo Planear' (estrellas, regalos desbloqueados y siguiente paso). Ver ahí el proceso de traspaso entre arquitectos.

## Forma de cada sesión
1. Leer las cinco biblias. 2. git checkout main y git pull. 3. Hacer un solo hito. 4. Probarlo con Sofía. 5. Actualizar las biblias. 6. Abrir el pull request. 7. Nunca hacer merge.

## Prohibido
- Cambiar las reglas fijas, agregar librerías, tocar archivos fuera del hito, hacer merge.
- CHARACTERS.md y js/characters.js cambian siempre juntos.

## Entorno de Sofía
Windows con terminal Linux (WSL). Para abrir el juego: explorer.exe index.html

## Paleta (estilo acogedor)
Crema #F5EBDD · Madera #B07A4F · Terracota #C8664A · Verde salvia #8FA88A · Café oscuro #4A3428
Ciudad: Pasto #A8C686 · Pasto claro #C6DCA4 · Pasto oscuro #6F9460 · Agua #7DB9D6 · Agua clara #B5DCEC · Piedra #B8B2A7 · Piedra clara #DAD4C8
