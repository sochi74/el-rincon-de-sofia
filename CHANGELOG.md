# CHANGELOG.md

## 2026-10-20 · Hito 6: ✨ Vida propia
- Libre albedrío: el personaje que no está seleccionado, cuando está quieto y tiene una necesidad por debajo de 50, va solo a resolver la más baja:
  - Hambre → Refrigerador. Energía → Cama. Diversión → Sofá o Televisión. Social → "Charlar" con el otro.
  - Usa las mismas acciones, multiplicadores y esperas de siempre.
  - Si el mueble está ocupado o hay que esperar para charlar, espera unos segundos y vuelve a intentar.
  - Si nadie está seleccionado, los dos actúan solos. Con Pausa, nadie decide nada.
- Ánimo: una estrella flota sobre la cabeza de cada uno, según el promedio de sus cuatro necesidades: verde por encima de 60, amarilla de 30 a 60, roja por debajo de 30. Las burbujas de pensamiento, acción y diálogo se dibujan encima de la estrella.
- Guardado: cada 10 segundos y al cerrar o recargar la página se guardan las necesidades, la posición de cada personaje y la amistad. Al abrir el juego, se carga la partida guardada.
- Botón "🔄 Reiniciar" en el panel: borra lo guardado y vuelve a empezar.
- Si el navegador no deja guardar, el juego funciona igual, sin guardar.
- Nuevo archivo js/save.js.
- ⭐ Extra desbloqueado: un póster con marco de madera en la pared de la Sala que dice "That's what she said!".
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar.

## 2026-10-20 · Hito 5: 💬 ¡A socializar!
- Con un personaje seleccionado, tocar al otro abre un menú: "Charlar", "Contar un chiste" y "Chocar los cinco". Tocar al otro dos veces lo selecciona.
- Al elegir, los dos caminan uno hacia el otro, se miran y alternan de 2 a 4 burbujas con sus frases de js/characters.js (saludo, charlar, chiste o chocar los cinco).
- real.fixer habla en inglés con el subtítulo en español debajo, más pequeño. Sofía habla en español.
- Si alguno estaba usando un mueble, lo deja para socializar.
- Efectos para los dos:
  - Charlar: Social +15, Amistad +5.
  - Contar un chiste: Social +10, Amistad +8.
  - Chocar los cinco: Social +8, Amistad +4, y aparece un 🙌 entre ellos.
- Rasgos: Fiestero/a da Social ×1.5, Tímido/a ×0.7; Conversador/a: Charlar da Social ×1.5; Bromista: sus chistes dan Amistad ×1.5. Hoy nadie es Fiestero, Tímido ni Bromista.
- Actividad favorita: ×1.25 y un ❤️. A real.fixer le encanta charlar.
- Social nunca pasa de 100. Amistad va de -100 a 100 y empieza en 0.
- El panel muestra "Amistad con <el otro>: <valor>".
- Hay que esperar unos segundos entre interacciones; si se intenta antes, sale la burbuja "Un momento…".
- El botón Pausa también congela las conversaciones.
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar.

## 2026-10-20 · Hito 4: 🛋️ Cosas de la casa
- Los muebles se iluminan con un brillo verde salvia cuando el mouse pasa por encima.
- Con un personaje seleccionado, tocar un mueble lo hace caminar hasta él y usarlo, con una burbuja encima:
  - Refrigerador: "Comiendo 🍳", Hambre +35 en 4 segundos.
  - Cama: "Durmiendo 💤", Energía +50 en 6 segundos.
  - Sofá o Televisión: "Viendo tele 📺", Diversión +35 en 4 segundos.
- Las necesidades nunca pasan de 100.
- Los rasgos pueden cambiar lo que da una actividad (Gamer: la tele da Diversión ×1.5). Hoy ningún personaje es Gamer.
- Actividad favorita: da ×1.25 y un ❤️ sobre la cabeza. A Sofía le encanta ver tele.
- Un solo personaje por mueble; si está ocupado, aparece la burbuja "Ocupado".
- Tocar el piso u otro mueble cancela la acción. Tocar a un personaje que está usando un mueble lo detiene.
- El botón Pausa también congela las acciones.
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie.

## 2026-10-20 · Hito 3: 📊 Necesidades
- Sofía y real.fixer tienen cuatro necesidades: 🍔 Hambre, 😴 Energía, 🎮 Diversión y 💬 Social, de 0 a 100.
- Empiezan cerca de 80, con una pequeña variación.
- Bajan con el tiempo, un poco distinto cada una (más o menos 1 punto cada 4 segundos).
- Los rasgos cambian la velocidad: Sofía (Dormilona, Glotona, Creativa) pierde Energía, Hambre y Diversión ×1.5; real.fixer (Tranquilo, Creativo) pierde todo ×0.85 y Diversión además ×1.5.
- El panel muestra las cuatro barras del personaje seleccionado: verde, amarilla o roja.
- Cuando una necesidad está en rojo, flota una burbuja de pensamiento con su emoji.
- Botón "Pausa / Continuar" para congelar el tiempo de las necesidades.
- Problemas conocidos: Los personajes atraviesan los muebles. Las necesidades todavía no se pueden subir (eso llega en el Hito 4).

## 2026-10-20 · Hito 2: 📦 Mudanza
- Sofía y real.fixer se mudan a la casa y empiezan en lugares distintos de la Sala.
- Dibujados como figuritas: real.fixer con gorra azul marino, barba con canas, camisa negra, riñonera y reloj dorado; Sofía con pelo castaño largo, blusa rosa y collar dorado. Cada uno con su nombre debajo.
- Tocar a un personaje lo selecciona: círculo brillante bajo sus pies y su nombre en un panel.
- Tocar el piso hace caminar al seleccionado en línea recta, con un pequeño rebote, sin salir de la casa. Para ir a otra habitación pasan por la puerta.
- Datos de los dos personajes en js/characters.js, iguales a CHARACTERS.md.
- ⭐ Extra desbloqueado: Sofía tiene una frase nueva de Sueño: "Time for a nap!" (¡Hora de la siesta!).
- Problemas conocidos: Los personajes atraviesan los muebles.

## 2026-10-20 · Hito 1: 🧱 Primera piedra
- Pantalla de inicio con "El Rincón de Sofía" y botón "Jugar".
- Casa vista desde arriba con Cocina, Dormitorio y Sala, y muebles decorativos: Refrigerador, Cama, Televisión y Sofá.
- Publicado en GitHub Pages.
- Problemas conocidos: ninguno por ahora.
