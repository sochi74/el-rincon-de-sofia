# CHANGELOG.md

## Problemas conocidos actuales
- Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa.
- real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima.
- Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien.
- Las mariposas vuelan por encima de las flores y a veces tapan un poquito una.
- La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta (Sofía prefirió que siga abriéndose abajo a la derecha, como siempre).
- Nadie cuida el jardín, pesca, recolecta, cocina ni regala solo.
- Si recargas mientras alguien pesca o recolecta, esa acción se pierde.
- Los personajes y los vecinos no se esquivan entre ellos: a veces uno pasa por encima de otro.
- Los rasgos de los vecinos que cambian necesidades y su actividad favorita todavía no hacen nada (solo Bromista funciona).
- Nadie empieza solo una conversación con los vecinos (pero Lumi y Vladi ya charlan entre ellos de noche).
- La Guitarra y la Olla son solo decoración: los personajes y los vecinos pueden pasar por encima.
- El Dormitorio es chico: para poner la Televisión y el Sofá ahí, primero hay que llevar la Cama a otra habitación.
- real.fixer no va solo al bosque a buscar bayas: solo se come las que ya están en la mochila.
- Si la camita de Krohna se pone donde no se puede caminar (muy cerca del río o arriba del todo del mapa), Krohna duerme al lado, en el lugar libre más cercano.
- Nadie va solo al Baño todavía.
- En pantallas chicas (celular), con el panel abierto todavía se tapa parte del mapa (la parte de arriba, el bosque y la casa del árbol de Lumi): ciérralo con ✕ para ver todo.
- En pantallas más angostas la casa se ve un poco más chica que la ciudad (porque es más ancha, por el Baño).
- En pantallas anchas, con el panel abierto la casa y la ciudad se ven más chicas (usan el espacio al lado del panel); al cerrarlo con ✕ vuelven a su tamaño.
- En pantallas anchas, el cartel de Modo decorar (arriba a la derecha) puede tapar un poquito la esquina de arriba a la derecha de la casa o la ciudad.
- La ventanita 🌟 Metas elige su lugar al abrirse; si después el personaje camina hasta ahí, puede quedar tapado.
- Las palabras Clima · weather, Charco · puddle y Zorro · fox ya están en js/words.js, pero todavía no aparecen solas al pasar el mouse (Professor Hoot muestra "Professor Hoot · fox").
- El muñeco de nieve se dibuja debajo de los personajes: si alguien camina justo detrás de él, se ve por encima del muñeco.
- En el 📖 Diario, las palabras de los vecinos se guardan como aparecen en su etiqueta (por ejemplo "Lumi · fairy" o "Professor Hoot · fox").
- Professor Hoot no pasea ni charla solo con Lumi y Vladi; nadie va solo a aprender la palabra del día.
- La ciudad está bastante llena: para llevar una casa lejos, primero hay que hacerle lugar moviendo árboles u otras cosas. La Casa de Sofía es grande y casi no tiene otro lugar libre hasta que se mueven árboles del bosque.
- Los caminos de piedra no se mueven: si mueves la Casa de Sofía, el camino sigue empezando donde estaba su puerta.
- La Guitarra y la Olla se quedan donde están cuando mueves la Carpa o el Castillito (se mueven solas, como antes). Si las sueltas justo en su lugar de siempre, junto a la carpa o la puerta del castillito, se ven rojas y vuelven.
- La copa de un árbol puede quedar un poquito encima del borde de una casa (solo el tronco no deja ponerla encima).
- Al tocar ✅ Listo, Lumi y Vladi se quedan donde estaban (si quedaron encima de algo, van al lugar libre más cercano) y van a los lugares nuevos en su próximo paseo.

## 2026-10-22 · Extra: 🏡 Mover casas en la ciudad
- 🛠️ En Modo decorar, en la ciudad, ahora también se arrastran: 🏠 la Casa de Sofía (con su puerta), 🌸 el Jardín de Sofía (sus 6 parcelas con lo que tienen plantado, la cerca y su cartel), ⛺ la Carpa de real.fixer junto con su fogata, el tronco y la camita de Krohna (sin cambiar cómo están ubicados entre sí; la camita se sigue pudiendo mover sola), 🏰 el Castillito de Vladi, 🌳 la Casa de Lumi (su árbol con la casita), 🌳 el Árbol de Professor Hoot (con su pizarrita), ⛲ la fuente (dentro o fuera de la plaza) y 🌲 cada árbol del bosque, uno por uno. Se toman tocando la cosa o su cartel.
- Con cada casa se mueven sus decoraciones colgadas (farolito de luna, farol de cristal, guirnalda, corazón dorado), la nieve de su techo, su cartel y su ventana que brilla de noche. Las luciérnagas se mueven con la carpa.
- No se mueven: el río, el puente, los caminos de piedra, la plaza de piedra, el área del Bosque (con su cartel) y el muñeco de nieve.
- Las casas, los árboles y la fuente no se giran: con ellas, "🔄 Girar" muestra la burbuja "No se puede girar".
- Verde o rojo: cabe en pasto libre, sin encimarse con otra cosa ni con un cartel (los carteles sí pueden quedar sobre la copa de un árbol), sin tapar el río, el puente, los caminos de piedra ni el lugar del muñeco de nieve. En la plaza solo pueden ir la fuente, los árboles y las casas de árbol. Además, desde la puerta de la Casa de Sofía se tiene que poder llegar caminando a la puerta de cada casa, a todas las parcelas y la entrada del jardín, a la carpa, la fogata y el tronco, a las dos orillas del río y al Bosque. Si se suelta en rojo, vuelve a donde estaba.
- Todo usa los lugares nuevos: entrar y salir de la casa, los caminos, el libre albedrío, las visitas de real.fixer (desde su carpa y de vuelta), dormir en la carpa (con sus "Zzz"), sentarse en el tronco y cocinar en la fogata, Krohna y su camita, los paseos de Lumi (su casa y la entrada del jardín) y de Vladi (su castillito y la fogata), Professor Hoot junto a su puerta, el jardín, las monedas y las cosas del bosque (si quedaron debajo de algo o encerradas, se mudan a un lugar libre), la luz de la fogata y de las ventanas de noche, el sonido de la fogata, los charcos (no aparecen debajo de una casa o un árbol) y las etiquetas de palabras.
- Al tocar ✅ Listo, quien quedó encima de algo va al lugar libre más cercano, y quien iba caminando hacia una casa que se movió va a su lugar nuevo.
- 🌲 Volvió el árbol chico que se quitó en el Hito 22, en un lugar libre del bosque (abajo a la derecha del bosque, cerca del río), con el mismo dibujo que los demás. Se mueve como los otros.
- ↩️ Como al principio devuelve todo, en la casa y en la ciudad, a su lugar de siempre (el arbolito, a su lugar nuevo del bosque).
- Guardado: recuerda dónde está cada cosa. Una partida vieja carga todo como al principio; "Reiniciar" también.
- Con permiso de Sofía también se tocaron js/objects.js y js/cooking.js, para que dormir en la carpa, sentarse en el tronco y cocinar en la fogata usen sus lugares nuevos.

## 2026-10-22 · Hito 22: 📖 Vecino profe y diario de palabras
- Sofía cambió la regla fija de los vecinos: ahora son Lumi, Vladi y Professor Hoot (siguen siendo dos jugables).
- 🦊 Ficha nueva en CHARACTERS.md y js/characters.js: Professor Hoot, zorro bibliotecario (Tranquilo, Creativo, Tímido; le encanta el Pescado con hongos; todavía sin metas). Todos tienen Amistad 0 con él.
- 🌳 Su casa: en el bosque, a la derecha de la Casa de Lumi, un árbol grande y hueco (en lugar de un árbol chico que estaba ahí) con puerta redonda de madera, ventanita que brilla de noche y, al lado, una pizarrita que muestra en tiza la palabra del día. Cartel "Árbol de Professor Hoot". Es obstáculo, no tapa caminos ni carteles, y las monedas y las cosas del bosque no aparecen encima. Con nieve, su copa se pone blanca. Uno de los lugares de paseo de Lumi se corrió un poquito para no quedar encima de él.
- De 08:00 a 18:00 está parado junto a su puerta leyendo su libro abierto, y a veces pasa una página o se acomoda los lentes. El resto del tiempo duerme adentro y salen "Zzz" de la ventana. No pasea. Se dibuja de frente, de espalda y de costado, parpadea y respira; Pausa lo congela.
- 📖 Palabra del día: con Sofía o real.fixer seleccionado en la ciudad, tocar a Professor Hoot abre el menú social con "📖 Palabra del día" arriba. El personaje camina hasta él, se miran, y él dice "Today's word is: …!" y la frase de ejemplo. Después una ventanita pregunta "¿Qué significa '…'?" con 3 respuestas en orden al azar. Bien: "Great job!", +10 🪙 flotando y el "cling". Mal: "Almost! It means …" sin monedas. Las dos veces la palabra entra al Diario. Una vez por día del juego; después la opción se ve apagada con "Vuelve mañana 🌙". Las 20 palabras van en orden (en js/words.js) y al terminar vuelven a empezar.
- Charlar, contar un chiste, chocar los cinco, regalar (hasta 3 regalos por día) y la línea "Amistad con Professor Hoot" funcionan como con Lumi y Vladi.
- 📖 Diario: botón "📖 Diario" en el panel; la ventanita se turna con la Mochila y Metas y se cierra con ✕. Muestra "Palabras aprendidas: N", "🎓 Del profe" (con la frase de ejemplo) y "🔍 Descubiertas", las más nuevas arriba, con scroll. La primera vez que aparece la etiqueta de una palabra, entra a Descubiertas y flota "📖 ¡Palabra nueva!" cerca del cursor. Una palabra del profe no se repite en Descubiertas.
- Guardado: la partida recuerda la posición de la lista y si ya se hizo la palabra de hoy (y la Amistad y los regalos de Professor Hoot). El Diario se guarda aparte y "Reiniciar" no lo borra. Una partida vieja carga con Professor Hoot junto a su árbol y el Diario vacío.
- Palabras nuevas en js/words.js: Zorro · fox (FOKS), Profesor · teacher (TÍI-cher) (sobre "🎓 Del profe"), Diario · diary (DÁI-a-ri) (en el botón), Palabra · word (UÓRD) (en "📖 Palabra del día"), Árbol hueco · hollow tree (JÓ-lou TRÍI) y Pizarra · chalkboard (CHÓK-bord). Al pasar el mouse por él: "Professor Hoot · fox (FOKS)".
- Archivo nuevo: js/lessons.js (la palabra del día y el Diario), en el orden de scripts entre goals y pet.

## 2026-10-22 · Hito 21: 🌧️ Clima y magia
- Cada día del juego, a las 06:00, se elige el clima del día: ☀️ Soleado 50 %, 🌧️ Lluvia 20 %, 🌫️ Niebla mágica 20 % o ❄️ Nieve 10 %, y dura hasta las 06:00 siguiente. La partida nueva empieza con el Día 1 soleado.
- Días de lluvia: llueve hasta las 16:00; de 16:00 a 18:00 sale un 🌈 arcoíris sobre la ciudad, y después queda soleado.
- El panel muestra el clima al lado del reloj ("☀️ Día 3 · 10:30 · 🌧️"); al pasar el mouse por el emoji, su palabra (por ejemplo "Lluvia · rain").
- 🌧️ Lluvia en la ciudad: gotitas finas en diagonal, el cielo un poco más gris, ondas en el río y charquitos que se forman poco a poco en el pasto y en la piedra, y se secan solos después.
- 🌈 Arcoíris: un arco grande y translúcido que aparece y se va suavemente, por debajo de los carteles para que siempre se lean.
- 🌫️ Niebla mágica: capas de niebla blanco lila que se mueven despacio, brillitos que titilan y luces redondas que flotan y suben; de noche las luces brillan más.
- ❄️ Nieve: copitos que caen despacio y se mecen; poco a poco se ponen blancos los techos (Casa de Sofía, castillito de Vladi, casita del árbol de Lumi y la carpa) y el pasto, y en la plaza, a la derecha de la fuente, aparece un ⛄ muñeco de nieve con bufanda terracota, nariz de zanahoria y botones. Es solo decoración: los personajes lo rodean. Al día siguiente, si ya no nieva, todo vuelve a verse normal y el muñeco se derrite.
- Dentro de la casa, por las ventanas: gotitas con lluvia, vidrios blanquecinos con niebla y copitos con nieve.
- 🔊 Sonidos (js/audio.js): lluvia suave en la ciudad y más bajita dentro de la casa, como en el techo; con lluvia no cantan los pájaros; con nieve los sonidos del lugar suenan un poco más suaves. Al cambiar de pestaña se calla como todo.
- Lo que cambia en el juego: 🌸 mientras llueve, todas las parcelas con semilla quedan regadas solas (también las que se plantan mientras llueve); 🎣 mientras llueve, el Pez arcoíris sale 25 % y el Pez plateado 30 %; 💎 en días de niebla el bosque puede tener hasta 7 cosas a la vez y la mitad de las nuevas son cristales.
- Los cambios de clima se ven poco a poco, en unos segundos. Pausa y Modo decorar congelan el clima. Todo funciona de día y de noche.
- Guardado: recuerda el clima del día, los charcos, la nieve y el muñeco (y así el arcoíris). Una partida vieja carga con el día de hoy soleado; "Reiniciar" vuelve al Día 1 soleado.
- Palabras nuevas en js/words.js: Clima · weather (UÉ-der), Soleado · sunny (SÁ-ni), Lluvia · rain (RÉIN), Niebla · fog (FOG), Nieve · snow (SNÓU), Arcoíris · rainbow (RÉIN-bou), Muñeco de nieve · snowman (SNÓU-man) (también al pasar el mouse sobre él) y Charco · puddle (PÁ-del).
- Archivo nuevo: js/weather.js (el clima del día, sus efectos y su dibujo), en el orden de scripts entre time y house.

## 2026-10-22 · Extra: 🧹 Pulido 3
- 🐱 Krohna y la puerta: cuando real.fixer pasa por la puerta (de la casa a la ciudad o al revés), Krohna camina hasta la misma puerta y sale del otro lado un momento después, y camina hasta él. Si real.fixer vuelve antes, Krohna se queda con él.
- 🐱 Krohna después de decorar: al tocar ✅ Listo, Krohna se queda donde estaba (en la casa o en la ciudad); solo si quedó encima de algo va al lugar libre más cercano, como los demás.
- 🐱 Nadie queda tapado de forma rara: Sofía, real.fixer, Lumi, Vladi y Krohna se dibujan en orden según su altura en la pantalla (el que está más abajo va encima).
- 🛏️ Dormir y bañarse: mientras alguien duerme en la Cama (girada o no), su brillo de seleccionado rodea su cabeza, su nombre queda justo debajo de su cabeza, encima de la Cama, y su estrellita y sus burbujas van sobre su cabeza. En la Bañera, el brillo rodea la espuma y el nombre queda sobre la Bañera, justo debajo de la espuma.
- 📺 Ver tele en el piso: al tocar la Televisión, si el Sofá está frente a ella y libre, el personaje va al Sofá como antes; si no hay Sofá frente a la tele o está ocupado, se sienta en el piso delante de la tele, mirándola (de espaldas, de frente o de costado, según cómo esté girada la tele). Da lo mismo que antes.
- 🪟 Panel en pantallas anchas: con el panel abierto, el panel es una columna a la izquierda y la casa y la ciudad se dibujan en el espacio libre a su derecha, más chicas si hace falta, sin que el panel tape nada. Al cerrarlo con ✕ vuelven a usar toda la pantalla. Los clics y las etiquetas caen en el lugar correcto. En pantallas chicas (celular) queda como antes.
- 🪟 Ventanita 🌟 Metas: se abre en una esquina donde no tape la carpa de real.fixer, la fogata ni el personaje seleccionado (ni el panel, si puede). La 🎒 Mochila se abre como antes, abajo a la derecha (así lo eligió Sofía).
- 🪟 Carteles: "¡Meta cumplida!" aparece arriba, en el medio del espacio que deja el panel; en pantallas chicas con el panel abierto, abajo. "¡Ahora son…!" se corre para no quedar debajo del panel ni de los botones redondos, y siempre queda dentro de la pantalla.
- 🔊 Fogata: el crujido suena más fuerte cuanto más cerca de la fogata está el personaje seleccionado (sin nadie seleccionado en la ciudad, se mide desde el centro del mapa); lejos casi no se escucha, y dentro de la casa no suena.
- 🔊 Cambiar de pestaña: si cambias de pestaña o minimizas, se callan todos los sonidos (música, río, pájaros, grillos, fogata y tele). Al volver, siguen según el modo de sonido.
- 🔊 Fanfarria: al cumplir una meta, la fanfarria suena solo si el personaje está en el lugar que se ve. El cartel y las monedas siguen igual.
- 🔄 Vecinos: de noche, cuando Lumi elige a dónde ir, a veces vuela hacia donde está Vladi (su castillito, la plaza o la fogata), y más seguido cuando ya pueden volver a charlar. Así se cruzan y charlan al menos una vez por noche, más o menos. La regla de una charla cada 1 a 2 minutos sigue igual.

## 2026-10-22 · Extra: 🛁 Baño con bañera de burbujas
- Sofía cambió la regla fija de la casa: ahora tiene Cocina, Dormitorio, Sala y Baño.
- El Baño está a la derecha de la Sala, con su cartel "Baño", sus paredes y una puerta desde la Sala (donde antes estaba la ventana de la Sala; la ventanita ahora está en el Baño). La casa se agrandó hacia la derecha y ninguna habitación se achicó. Por fuera, en la ciudad, la Casa de Sofía sigue igual. Piso de azulejos celeste agua y blancos (colores nuevos en js/config.js). Se llega caminando, con los caminos de siempre.
- 🛁 Bañera (se usa): blanca, con patitas doradas, llena de agua celeste, espuma y burbujas. Con Sofía o real.fixer seleccionado, tocarla lo hace caminar hasta ella y bañarse: se ve su cabeza dentro de la bañera rodeada de espuma, con burbujas que suben y se revientan, y la burbuja "Bañándose 🫧" unos 5 segundos. Da Diversión +25 y Energía +20 (nunca más de 100); ningún rasgo lo cambia y no es la actividad favorita de nadie. Al terminar, sale y se para junto a la bañera.
- 🪥 Lavamanos con espejo (se usa): un mueblecito de madera con el lavamanos, un espejo redondo y un vasito con dos cepillos de dientes. "Lavándose los dientes 🪥" unos 2 segundos, Diversión +5, y al terminar un ✨ chiquito sobre la cabeza.
- Solo decoración: 🚽 Inodoro, 🧴 estante en la pared con frasquitos de jabón de colores (siempre parados, en cualquier pared), 🪴 plantita en maceta y 🛀 dos toallas colgadas en la pared. El Inodoro y la Plantita están en el piso: los personajes los rodean.
- Lo de siempre: brillan al pasar el mouse, un nuevo clic cancela, Pausa congela todo (también las burbujas y el ✨), y si los dos van a la misma cosa, el segundo dice "Ocupado". El libre albedrío no cambia: nadie va solo al Baño.
- Modo decorar: la Bañera, el Lavamanos, el Inodoro y la Plantita se mueven por el piso a cualquier habitación y se giran; el Estante y las Toallas se deslizan por las paredes. "Como al principio" los devuelve al Baño.
- ⭐ Extra desbloqueado (35 ⭐): Krohna's bed 🐾. En la ciudad, a la derecha de la entrada de la carpa de real.fixer, una camita redonda y acolchada, crema con borde naranja y una mantita verde. Solo decoración (se puede pasar por encima, y las monedas no aparecen encima). No tapa la entrada de la carpa, la fogata, el tronco ni el cartel. Cuando real.fixer duerme en la carpa, Krohna duerme enroscado en su camita con una "z" chiquita. Se mueve y se gira en Modo decorar, como la Guitarra y la Olla.
- Palabras nuevas en js/words.js (al pasar el mouse): Baño · bathroom (BÁZ-rum), Bañera · bathtub (BÁZ-tab), Burbujas · bubbles (BÁ-bels) (en la espuma de la bañera), Lavamanos · sink (SINK), Espejo · mirror (MÍ-rror), Inodoro · toilet (TÓI-let), Jabón · soap (SÓUP) (en el estante), Planta · plant (PLANT), Toalla · towel (TÁU-el), Cepillo de dientes · toothbrush (TÚZ-brash) (en el vasito) y Cama de Krohna · Krohna's bed (KRÓ-nas BED).
- Guardado: recuerda dónde está y hacia dónde mira cada cosa nueva. Una partida vieja carga bien, con el Baño y la camita como al principio. Si en una partida vieja algo quedó tapando la puerta nueva del Baño (o colgado en la pared donde ahora está la puerta), vuelve a su lugar de siempre.

## 2026-10-22 · Hito 20: 🛋️ Mover muebles
- Botón nuevo "🛠️ Decorar" en el panel (junto a Pausa). Al tocarlo, todo se congela como con Pausa (el botón Pausa se apaga mientras tanto), y aparece el cartel "🛠️ Modo decorar: arrastra para mover" con los botones "🔄 Girar", "↩️ Como al principio" y "✅ Listo". En pantallas anchas el cartel va arriba a la derecha; en pantallas más angostas va abajo, en el medio.
- En Modo decorar, tocar ya no camina, no usa muebles ni abre menús: solo elige y arrastra, con mouse o con el dedo. Lo que se puede mover brilla al pasar el mouse; lo último que tocaste queda con un borde punteado; mientras arrastras brilla verde si el lugar está bien y rojo si no. Si lo sueltas en rojo, vuelve a donde estaba. Funciona en el lugar que se está viendo (la casa o la ciudad).
- Casa, en el piso y a cualquier habitación: Refrigerador, Estufa, Cama, Televisión, Sofá, la Alfombra de la Sala, el Caballete y el Florero. El Florero ahora va en el piso de la Sala (arriba a la derecha), más grande, como una maceta con flores, y los personajes lo rodean. El cartel con el nombre de cada mueble se mueve con él.
- Casa, en la pared: el Póster y los Banderines se deslizan por cualquier pared de cualquier habitación (nunca al piso, nunca sobre una puerta) y no se giran. En una pared de costado, el póster escribe "That's / what / she / said!" en cuatro renglones.
- Ciudad: la Guitarra y la Olla (cuando ya están desbloqueadas) van a cualquier pasto libre: no sobre el río, el puente, los caminos de piedra, la plaza, el jardín, las casas, la carpa, la fogata, los carteles, debajo de los árboles, ni encima de una moneda o de algo del bosque.
- Un lugar de la casa está bien si queda dentro del piso de una habitación, no se encima con otro mueble ni decoración (los muebles sí pueden ir sobre la alfombra), no tapa ninguna puerta ni el paso por las puertas ni la puerta mágica, y desde la puerta se sigue pudiendo llegar caminando a todas las habitaciones y a todos los muebles.
- 🔄 Girar gira un cuarto de vuelta lo último que tocaste. Si girado no cabe, no gira y sale la burbuja "No cabe aquí". Los muebles se dibujan bien en las 4 direcciones. El Caballete muestra el cuadro de Krohna, su espalda o su costado. Si el lugar de adelante queda contra una pared, el personaje usa el mueble desde el otro lado o desde el lugar libre más cercano.
- Usar los muebles respeta cómo están girados: en la Cama se acuesta a lo largo con la cabeza en la almohada; en el Sofá se sienta mirando hacia donde mira el Sofá (de espaldas, de frente o de costado); en la Televisión, la Estufa y el Refrigerador se para adelante. El brillo de la tele de noche sale de la pantalla, donde esté.
- ↩️ Como al principio pregunta "¿Volver todo a como estaba al principio?" con Sí y No. Con Sí, todo vuelve a su lugar y dirección de siempre, en la casa y en la ciudad.
- ✅ Listo sale del Modo decorar. Si ya estaba en Pausa, sigue en pausa. Quien quedó encima de algo que se movió aparece en el lugar libre más cercano, y quien iba caminando a un mueble que se movió va a su lugar nuevo.
- Todo usa los lugares nuevos: los caminos (js/path.js), el libre albedrío, la cocina, las etiquetas de palabras, el brillo de la tele y las monedas (nunca aparecen sobre la Guitarra ni la Olla). Si el lugar donde espera real.fixer en sus visitas queda tapado, espera en el lugar libre más cercano de la Sala.
- Si el Florero o los Banderines se desbloquean y su lugar está ocupado por algo que moviste, aparecen en el lugar libre más cercano.
- Guardado: recuerda dónde está y hacia dónde mira cada cosa. Una partida vieja carga con todo en su lugar de siempre. "Reiniciar" también vuelve todo a como estaba al principio.
- Palabras nuevas en js/words.js: Decorar · decorate (DÉ-ko-reit), Girar · turn (TERN), Listo · done (DAN) (al pasar el mouse por sus botones) y Alfombra · rug (RAG) (al pasar el mouse por la alfombra).
- Archivo nuevo: js/decorate.js (el Modo decorar), en el orden de scripts entre audio y ui.

## 2026-10-22 · Extra: 🍒 real.fixer come bayas
- Se cumplió el deseo de Sofía: "quiero que fixer pueda alimentarse de las bayas".
- Libre albedrío de real.fixer: cuando no está seleccionado, está libre y el Hambre es su necesidad más baja (debajo de 50), si hay al menos una 🍒 Baya en la mochila se come una donde está, sin caminar. Prefiere las bayas; si no hay, sigue como antes (el plato más barato de la mochila y, si no hay platos, el Refrigerador).
- Comer una baya: burbuja "Comiendo 🍒" unos 2 segundos, sale 1 baya de la mochila y Hambre +25 (nunca más de 100). Al terminar, más o menos 1 de cada 2 veces dice "Yum, berries!" con subtítulo "¡Mmm, bayas!". Si sigue con hambre y quedan bayas, puede comerse otra la próxima vez que decida.
- Sofía nunca come bayas sola, y los vecinos tampoco. En la Mochila las bayas no tienen botón "Comer" (siguen con Vender y Regalar).
- Si lo seleccionas o tocas otra cosa, deja de comer y la baya vuelve a la mochila. Pausa congela todo. El guardado devuelve a la mochila la baya que se estaba comiendo. Las metas no cambian.
- Palabra nueva en js/words.js: Comer · eat (ÍIT).
- Problemas conocidos: real.fixer no va solo al bosque a buscar bayas: solo se come las que ya están en la mochila.

## 2026-10-22 · Hito 19: 🌟 Sueños y metas
- Cada personaje tiene un sueño: 2 metas en fila (campo nuevo "Metas" en CHARACTERS.md y js/characters.js). Lo que pasa antes de que una meta esté activa no cuenta para ella.
  - 💗 Sofía: 🌸 Cosechar 5 flores (cuenta cada cosecha de Sofía), después 🥧 Comer una Tarta de bayas (con Comer o por libre albedrío).
  - 🧢 real.fixer: 💬 Charlar con todos los vecinos (la primera charla con Lumi y la primera con Vladi), después 🌙 Pescar un Pez luna.
  - 🧚 Lumi: 🎉 Ser amiga de todos (Amistad 30 o más con Sofía y con real.fixer), después 🦋 Ser amiga de Vladi (30 o más).
  - 🧛 Vladi: 💛 Tener un mejor amigo (70 o más con cualquiera), después 🦀 Recibir una Sopa de cangrejo de regalo.
  - Las metas de Amistad miran el valor actual: si ya se cumple cuando la meta empieza, se cumple enseguida.
- Botón "🌟 Metas" en el panel: abre una ventanita con una fila por personaje, su meta actual con emoji, texto, avance (por ejemplo "🌸 Cosechar 5 flores · 2/5") y una barrita dorada, y las metas cumplidas con ✅ debajo, más clarito. Con las 2 cumplidas: "💫 ¡Todos sus sueños cumplidos!". Se cierra con ✕ o con el mismo botón, se actualiza sola, y se turna con la Mochila (al abrir una se cierra la otra). Se ajusta a pantallas chicas.
- Al cumplir una meta: cartel grande unos 3 segundos ("🌟 ¡Meta cumplida! Sofía cosechó 5 flores 🌸"), la fanfarria de subir de nivel, +30 🪙 por la Meta 1 o +50 🪙 por la Meta 2, y enseguida la meta siguiente. Si el personaje está en el lugar que se ve, le cae una lluvia de estrellitas doradas y flota "+30 🪙" (o "+50 🪙"). Si se cumplen dos a la vez, los carteles se turnan. Pausa congela la celebración.
- Decoraciones dibujadas con código, que quedan para siempre: florero con flores del jardín sobre el mueble de la tele (Sofía, Meta 1); banderines de colores en la pared de la Cocina (Sofía, Meta 2); guitarra apoyada al costado de la carpa (real.fixer, Meta 1); farolito con forma de luna colgado de la esquina de la carpa, que brilla de noche (real.fixer, Meta 2); farol de cristal colgado del techo de la casita del árbol, que brilla de noche (Lumi, Meta 1); guirnalda de lucecitas de colores en su árbol, que titilan de noche (Lumi, Meta 2); olla brillante junto a la puerta del castillito (Vladi, Meta 1); corazón dorado en la torrecita derecha (Vladi, Meta 2). No son obstáculos y no tapan puertas, carteles, muebles, caminos ni el póster.
- Lumi y Vladi charlan solos: de noche, cuando los dos están afuera, cerca y libres, como máximo una vez cada 1 a 2 minutos de juego se detienen, se miran y alternan 2 o 3 burbujas con sus frases de saludo y charlar (Vladi en inglés con subtítulo). Cada charla da Amistad +5 a los dos (sin multiplicar por rasgos); si suben de nivel, caen corazones y sale "¡Ahora son…!". Si tocas a uno durante la charla, la charla termina y se abre el menú social de siempre. Al amanecer la charla termina. Pausa la congela.
- Palabras nuevas en js/words.js: Meta · goal (GÓUL), Sueño · dream (DRÍIM), Caballete · easel (Í-sel), Cuadro · painting (PÉIN-ting), Florero · vase (VÉIS), Banderines · bunting (BÁN-ting), Guitarra · guitar (gui-TÁR), Farol · lantern (LÁN-tern), Guirnalda de luces · fairy lights (FÉ-ri LÁITS), Olla · pot (POT) y Corazón · heart (JÁRT). Aparecen al pasar el mouse sobre cada decoración.
- El guardado recuerda la meta de cada uno, su avance y cuáles se cumplieron (y por eso sus decoraciones). Una partida vieja carga bien: todos empiezan en la Meta 1 con avance 0 (las de Amistad se revisan enseguida). "Reiniciar" vuelve todas las metas a la Meta 1 y quita las decoraciones.
- ⭐ Extra desbloqueado (30 ⭐): Painting easel 🎨. En la esquina de abajo a la derecha de la Sala, un caballete de madera con un cuadro de Krohna durmiendo: un gatito naranja con rayitas, enroscado sobre un cojín, con una "z" chiquita. Es obstáculo (los personajes lo rodean) y nunca se quita. Al pasar el mouse: "Caballete · easel (Í-sel)".
- Nuevo archivo js/goals.js.
- Problemas conocidos: El florero está sobre el mueble de la tele: si lo tocas, el personaje va a ver tele. Lumi y Vladi solo charlan si se cruzan de noche; como pasean por lugares distintos, a veces pasa un buen rato sin que charlen. El cartel "¡Meta cumplida!" puede tapar un poquito el panel unos segundos.

## 2026-10-21 · Hito 18: 🧚 Vecinos nuevos
- Sofía cambió la regla fija de los personajes: siguen siendo dos jugables (Sofía y real.fixer), y llegan dos vecinos que no se seleccionan, Lumi y Vladi. Solo la casa de Sofía tiene interior; las casas de los vecinos se ven solo desde afuera en la ciudad.
- Fichas nuevas en CHARACTERS.md y js/characters.js: 🧚 Lumi, un hada pelirroja con trenzas, vestido durazno y alas doradas (Energética, Bromista, Fiestera; le encantan los cristales), y 🧛 Vladi, un vampiro que le tiene miedo a la oscuridad, con capa negra y roja y su osito de peluche (Gamer, Tranquilo, Dormilón; le encantan los cangrejos). Campos nuevos para todos: Tipo (jugable o vecino) y Mascota. Sofía y real.fixer tienen Amistad 0 con Lumi y con Vladi.
- Casas en el mapa de la ciudad, dibujadas con código y con su cartel: la "Casa de Lumi", una casita de madera arriba de un árbol grande del bosque, con techo terracota, ventana redonda, puertita y escalerita de cuerda; y el "Castillito de Vladi", abajo a la derecha, de piedra con dos torrecitas, puerta de madera y dos faroles siempre encendidos. De noche brillan sus ventanas y los faroles tienen un halo de luz cálida. Brillan al pasar el mouse. Son obstáculos para los caminos, y las monedas y las cosas del bosque nunca aparecen encima.
- Lumi y Vladi se dibujan de frente, de espalda y de costado, parpadean y respiran. Lumi es más bajita, flota sobre una sombra suave y aletea siempre. Caminan un poco más despacio que los jugables, rodean obstáculos y no recogen monedas. Nunca entran a la casa de Sofía.
- Lumi pasea día y noche entre su casa, el bosque, la plaza, el puente y la entrada del jardín, y se queda unos segundos en cada lugar. De noche deja una estela corta de brillitos dorados.
- Vladi duerme de día (07:00 a 19:00) dentro de su castillito y de su ventana salen "Zzz". De noche sale y pasea despacio cerca de su castillito, la plaza y la fogata; a veces se detiene, tiembla abrazando su osito y dice "😨" o "Is it dark in here?" (¿Está oscuro aquí?). A las 07:00 vuelve a entrar.
- Hablar con los vecinos: con Sofía o real.fixer seleccionado en la ciudad, tocar a Lumi (o a Vladi de noche) abre el menú "Charlar", "Contar un chiste" y "Chocar los cinco". El vecino se detiene, el seleccionado camina hacia él y alternan sus frases (Lumi en español; Vladi en inglés con subtítulos). Cada par tiene su propia Amistad. Los chistes de Lumi dan Amistad ×1.5 (Bromista).
- Regalos a los vecinos: "Regalar" funciona si hay alguien más en el mismo lugar. Si pueden recibir varios, aparece un menú pequeño con sus nombres. Cristal es el favorito de Lumi y Cangrejo el de Vladi. Cada vecino acepta hasta 3 regalos por día.
- El panel muestra una línea de Amistad por cada uno: con el otro jugable, con Lumi y con Vladi. Al subir de nivel con un vecino caen corazones y aparece el cartel "¡Ahora son…!".
- Palabras nuevas en js/words.js: Lumi · fairy (FÉ-ri), Vladi · vampire (VÁM-pai-er), Casa del árbol · treehouse (TRÍI-jaus), Castillo · castle (KÁ-sel), Vecino · neighbor (NÉI-bor), Alas · wings (UÍNGS) y Osito de peluche · teddy bear (TÉ-di BER).
- El guardado recuerda dónde está cada vecino (y si Vladi está en su castillito), la Amistad de cada par y los regalos del día. Una partida vieja carga bien: los vecinos aparecen junto a su casa con Amistad 0.
- Nuevo archivo js/neighbors.js.
- Problemas conocidos: Los personajes y los vecinos no se esquivan entre ellos: a veces uno pasa por encima de otro. Los rasgos de los vecinos que cambian necesidades y su actividad favorita todavía no hacen nada (solo Bromista funciona). Nadie empieza solo una conversación con los vecinos, y los vecinos no hablan entre ellos. Con el panel abierto se tapa la casa del árbol de Lumi en pantallas chicas.

## 2026-10-21 · Continuidad
- Se agregaron notas para continuar en el Modo Planear, el proceso de traspaso entre arquitectos, y se revisó la coherencia de las biblias.

## 2026-10-21 · Hito 17: 🎵 Sonidos y música
- Todos los sonidos y la música se crean con código, con el audio del navegador (Web Audio). No hay archivos de sonido ni librerías.
- El sonido empieza recién al tocar "Jugar".
- Botón 🔊 redondo, siempre visible, al lado del botón ☰. Cada toque cambia el modo: 🔊 Todo → 🎵 Solo música apagada (solo efectos y sonidos del lugar) → 🔇 Silencio. El juego recuerda el modo al recargar.
- Al pasar el mouse sobre el botón 🔊: "Sonido · sound (SÁUND)" (palabra nueva en js/words.js).
- Efectos cortos y suaves: "pling" al tocar cualquier botón y al abrir los menús (charla, semillas y cocina); "cling" al recoger una moneda brillante y al vender en la mochila; chapoteo al regar; "blup" al pescar algo; campanita al cosechar; chisporroteo al empezar a cocinar; brillitos al regalar; y una pequeña fanfarria al subir de nivel de amistad.
- Krohna maúlla bajito cada 1 a 3 minutos cuando está en el mismo lugar que el personaje seleccionado.
- Sonidos del lugar, muy suaves: en la ciudad, el murmullo del río, pájaros de día, grillos de noche y el crujido de la fogata. En la casa, silencio tranquilo, y un murmullo suave de tele mientras alguien la ve.
- Música de fondo: una melodía tranquila de cajita de música, con acordes suaves y dos melodías que se turnan con una parte de descanso. De noche va más lenta y más suave, con menos notas.
- Los efectos solo suenan si pasan en el lugar que se ve en la pantalla.
- Pausa silencia los sonidos del lugar y la música; al continuar, vuelven.
- Nuevo archivo js/audio.js.
- Problemas conocidos: El crujido de la fogata se escucha igual en toda la ciudad, no solo cerca de la carpa. Todavía no hay sonido de lluvia (llega con el clima). Si cambias de pestaña, la música se detiene, pero el río o la tele pueden seguir sonando bajito. En la Televisión (de pie, sin el Sofá) se sigue viendo tele de pie. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Si recargas mientras alguien pesca o recolecta, esa acción se pierde. Nadie cocina solo. Nadie regala solo. Cuando real.fixer pasa por la puerta, Krohna aparece de golpe del otro lado, junto a él. Krohna puede quedar un poquito detrás de un personaje. Con el panel abierto, el cartel "¡Ahora son…!" puede quedar tapado si los personajes están arriba del mapa.

## 2026-10-21 · Hito 16: 🎁 Amistad y regalos
- Niveles de amistad según el valor de Amistad: 😐 Distantes (menos de 0), 👋 Conocidos (0 a 29), 😊 Amigos (30 a 69) y 💛 Mejores amigos (70 o más).
- El panel muestra el nivel junto al valor, por ejemplo "Amistad con real.fixer: 58 · 😊 Amigos".
- Al subir de nivel (por una charla, un chiste, chocar los cinco o un regalo), entre los dos cae una lluvia de corazones y flota el cartel "¡Ahora son Amigos! 😊" (o el nivel que corresponda) unos segundos. Al bajar de nivel no pasa nada.
- Regalos favoritos (nuevo campo en CHARACTERS.md y js/characters.js): real.fixer: Sopa de cangrejo y Cristal. Sofía: Tarta de bayas y Plato mágico.
- Regalar: en la 🎒 Mochila cada cosa tiene un botón "Regalar". Funciona si hay alguien seleccionado, libre, y el otro está en el mismo lugar (casa o ciudad); si no, se ve apagado. El seleccionado camina hasta el otro, burbuja "Regalando 🎁" unos 2 segundos, y la cosa sale de la mochila. El que recibe deja lo que hacía y reacciona:
  - Favorito: Amistad +15, un ❤️ y una de sus frases de feliz.
  - Bota vieja: Amistad -3, un 😒 y "¿Una bota?…" (real.fixer: "A boot?…" con subtítulo).
  - Cualquier otra cosa: Amistad +6 y un 😊.
  - La Amistad cambia para los dos. Ningún rasgo actual cambia lo que da un regalo.
- Cada uno acepta hasta 3 regalos por día del juego. Después dice "Ya me diste mucho hoy 😊" (real.fixer: "That's enough for today 😊" con subtítulo) y el regalo vuelve a la mochila.
- Un nuevo clic cancela el regalo y la cosa vuelve a la mochila. Pausa congela todo.
- El guardado recuerda cuántos regalos recibió cada uno en el día (y un regalo en camino vuelve a la mochila).
- Palabras nuevas en js/words.js: Regalo · gift (GUIFT), Amigo · friend (FREND), Mejores amigos · best friends (BEST FRENDS) y Gatito · kitten (KÍ-ten).
- ⭐ Extra desbloqueado: Krohna, el gatito naranja de real.fixer, dibujado con código, con rayitas. Lo sigue a poca distancia en el mismo lugar, rodeando obstáculos. Cuando real.fixer se queda quieto, se sienta a su lado y mueve la cola. Cuando duerme en la carpa, Krohna duerme enroscado en la entrada con una "z" chiquita. No tiene necesidades, no se puede seleccionar y en Pausa se queda quieto. Al pasar el mouse: "Krohna · kitten (KÍ-ten)".
- Nuevos archivos js/gifts.js y js/pet.js.
- Problemas conocidos: En la Televisión (de pie, sin el Sofá) se sigue viendo tele de pie. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Si recargas mientras alguien pesca o recolecta, esa acción se pierde. Nadie cocina solo. Nadie regala solo. Cuando real.fixer pasa por la puerta, Krohna aparece de golpe del otro lado, junto a él. Krohna puede quedar un poquito detrás de un personaje. Con el panel abierto, el cartel "¡Ahora son…!" puede quedar tapado si los personajes están arriba del mapa.

## 2026-10-21 · Extra: 🧹 Pulido 2
- Caminos que rodean: los personajes ya no atraviesan nada sólido. Buscan el camino más corto y lo recorren con curvas suaves, sin zigzag y a la misma velocidad de siempre.
  - Casa: no cruzan paredes (solo pasan por las puertas) y rodean el Refrigerador, la Estufa, la Cama, la Televisión y el Sofá.
  - Ciudad: cruzan el río solo por el puente y rodean la Casa de Sofía, los árboles, la fuente, la carpa, la fogata y la cerca del jardín. Al jardín se entra por la abertura de abajo, que ahora es un poco más ancha.
  - Las monedas, las bayas, los hongos, los cristales y las flores de las parcelas no estorban.
- Al ir a usar algo, el personaje camina a un lugar libre junto a eso, no encima. Si tocas un lugar al que no se llega (dentro de un mueble, en el agua, en la fuente), camina al punto más cercano al que sí se llega.
- Todo usa los caminos nuevos: tus clics, el libre albedrío, las visitas de real.fixer, las charlas, el jardín, la pesca, el bosque y la cocina.
- Al caminar en curva, el personaje ya no gira la cara de un lado a otro: cambia hacia dónde mira solo cuando la dirección nueva gana claramente.
- Acostarse: en la Cama, el personaje se acuesta con la cabeza en la almohada, los ojos cerrados y una manta encima, y le salen "Zzz". En la Carpa, real.fixer entra y no se ve, y los "Zzz" salen de la carpa.
- Sentarse: en el Sofá, el personaje se sienta mirando a la Televisión (se le ve la espalda detrás del respaldo). Junto a la Fogata hay un tronco nuevo, y con "Junto a la fogata 🔥" se sienta en él con las rodillas hacia el fuego.
- Cocinar en la Fogata y sentarse en el tronco usan lugares distintos, así que se pueden hacer los dos a la vez.
- Al terminar o cancelar, el personaje se levanta junto al mueble y sigue.
- La Sala cambió un poco: la Televisión, el Sofá y la alfombra están más a la derecha, para que la Televisión no tape la puerta del Dormitorio. El póster "That's what she said!" está ahora en la pared entre las dos puertas, en dos líneas. real.fixer espera sus visitas en otro lugar de la Sala.
- Si una partida guardada deja a alguien encima de un mueble, aparece en el lugar libre más cercano.
- Nuevo archivo js/path.js.
- Problemas conocidos: En la Televisión (de pie, sin el Sofá) se sigue viendo tele de pie. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Si recargas mientras alguien pesca o recolecta, esa acción se pierde. Nadie cocina solo.

## 2026-10-21 · Extra: 🧹 Pulido 1
- Pausa: con Pausa los personajes también dejan de caminar y se quedan donde están (ya no salen ni entran por la puerta ni recogen monedas). Al tocar Continuar, siguen su camino.
- Etiquetas de palabras: con el mouse sobre el panel, el botón ☰, la mochila o un menú abierto, ya no aparece la etiqueta de lo que hay debajo.
- Libre albedrío y platos: el personaje no seleccionado se come el plato más barato de la mochila, así guarda el Plato mágico si hay algo más simple.
- Libre albedrío y charla: si real.fixer quiere charlar solo mientras Sofía usa algo (un mueble, el jardín, la pesca, la recolección o la cocina), espera a que ella termine. Desde el menú social sí se puede interrumpir, como antes.
- El Pescado con hongos ahora usa 🍛 (en la mochila, el menú de cocina y el cartel flotante), y ya no se confunde con el Pez plateado 🐟.
- Mirar al usar: al usar un mueble, la carpa, la fogata, el jardín, el río o el bosque, el personaje se gira hacia eso. En el Sofá mira a la Televisión. La dirección en que mira cada uno se guarda y se recupera al recargar.
- Tele: de noche la Televisión brilla solo mientras alguien la está viendo.
- Menú de cocina: si abres el menú de la Estufa o la Fogata y lo cierras sin elegir, el personaje se detiene donde está.
- Carteles de noche: los carteles de lugares, habitaciones y muebles se dibujan encima de la oscuridad, así se leen igual de noche que de día.
- Monedas brillantes: nunca aparecen encima de una cosa del bosque, del jardín, de la carpa ni de la fogata (y las cosas del bosque no crecen debajo de una moneda).
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa, la fogata y el jardín. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Si recargas mientras alguien pesca o recolecta, esa acción se pierde. Cocinar en la Fogata y sentarse junto a ella usan el mismo lugar, así que no se pueden hacer los dos a la vez ("Ocupado"). Nadie cocina solo.

## 2026-10-21 · Hito 15: 🍲 Cocinar
- 🍳 Estufa nueva en la Cocina, al lado del Refrigerador, dibujada con código (cuatro hornallas y perillas) y con su cartel "Estufa". No tapa el Refrigerador, la puerta ni los carteles.
- Recetas (ingredientes → al comer → precio): 🐟 Pescado con hongos (1 pez plateado + 1 hongo → Hambre +60 → 18 🪙), 🦀 Sopa de cangrejo (1 cangrejo + 1 hongo → Hambre +70 → 25 🪙), 🥧 Tarta de bayas (2 bayas → Hambre +40 y Diversión +15 → 12 🪙) y ✨ Plato mágico (1 pez arcoíris + 1 cristal → Hambre +60 y Energía +40 → 50 🪙).
- Cocinar: con un personaje seleccionado, tocar la Estufa o la Fogata lo hace caminar hasta ahí y abre un menú con las 4 recetas, su emoji, sus ingredientes y cuántos tienes. Las que no se pueden hacer se ven apagadas. Al elegir una: "Cocinando 🍳" unos 4 segundos, se descuentan los ingredientes, el plato sale flotando (por ejemplo "¡Tarta de bayas! 🥧") y va a la mochila.
- En la Fogata el menú también tiene "Junto a la fogata 🔥", que funciona como antes.
- Comer: en la 🎒 Mochila los platos tienen un botón "Comer". Lo come el personaje seleccionado donde está: "Comiendo 🍽️" unos 3 segundos y recibe el efecto. Las necesidades nunca pasan de 100. Si no hay nadie seleccionado o está ocupado, el botón se ve apagado.
- Los platos se venden en la mochila como las otras cosas.
- Libre albedrío: si el personaje no seleccionado tiene el Hambre como necesidad más baja y hay un plato en la mochila, se lo come donde está en vez de ir al Refrigerador.
- Mismas reglas de siempre: caminar hasta ahí, un nuevo clic cancela (si estaba comiendo, el plato vuelve a la mochila), Pausa congela todo, y si los dos van al mismo lugar, el segundo dice "Ocupado".
- El guardado recuerda los platos de la mochila (también el que se está comiendo).
- Palabras nuevas: Estufa · stove (STÓUV) al pasar el mouse sobre la Estufa. También se agregaron Cocinar · cook (KUK), Receta · recipe (RÉ-si-pi), Plato · dish (DISH), Sopa · soup (SÚUP) y Tarta · pie (PÁI) a js/words.js.
- Nuevo archivo js/cooking.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa, la fogata y el jardín. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Una moneda brillante puede caer encima de una cosa del bosque. Si recargas mientras alguien pesca o recolecta, esa acción se pierde. El Pescado con hongos usa el mismo emoji 🐟 que el Pez plateado. Al tocar la Estufa o la Fogata el personaje empieza a caminar aunque cierres el menú sin elegir. Cocinar en la Fogata y sentarse junto a ella usan el mismo lugar, así que no se pueden hacer los dos a la vez ("Ocupado"). Nadie cocina solo. Con el libre albedrío, el personaje se come el primer plato de la mochila, aunque sea el Plato mágico.

## 2026-10-21 · Hito 14: 🎣 Pescar y recolectar
- 🎒 Mochila: una sola para la casa, compartida por Sofía y real.fixer. Un botón "🎒" en el panel abre una ventanita abajo a la derecha (se cierra con ✕ o tocando 🎒 otra vez).
- La mochila muestra cada cosa con su emoji, cuántas hay y su precio, con los botones "Vender 1" y "Vender todo". Al vender, sale "+N 🪙" flotando y el contador de monedas sube. Si está vacía dice "Tu mochila está vacía". Si pescas con la mochila abierta, se actualiza sola.
- 🎣 Pescar: con un personaje seleccionado en la ciudad, tocar el agua del río lo hace caminar a la orilla de su lado del río (no cruza el puente), mirar al río y pescar con una caña y un corcho que flota: burbuja "Pescando 🎣" unos 4 segundos. Después sale lo que pescó flotando sobre su cabeza (por ejemplo "¡Pez arcoíris! 🐠") y va a la mochila. Pescar sube Diversión +10.
- Lo que sale del río: 🐟 Pez plateado 40 % (vale 6), 🦀 Cangrejo 20 % (vale 10), 🐠 Pez arcoíris 15 % (vale 20), 👢 Bota vieja 15 % (vale 1) y 🌙 Pez luna 10 % solo de noche (vale 40; de día ese 10 % es Pez plateado).
- 🌲 Recolectar: en el bosque, entre los árboles y donde se puede caminar, aparecen 🍒 arbustos con bayas (vale 3), 🍄 hongos (vale 5) y 💎 cristales que brillan, más de noche (vale 15). Hay entre 3 y 5 a la vez; cuando juntas una, aparece otra en 45 a 90 segundos de juego. No salen bajo los árboles ni sobre el cartel "Bosque".
- Tocar una: el personaje camina a su lado, "Recolectando 🧺" unos 2 segundos, desaparece y sale "+1 🍒" (con su emoji) flotando. Brillan al pasar el mouse.
- Mismas reglas que las demás acciones: caminar hasta ahí, un nuevo clic cancela, Pausa congela todo (también lo que vuelve a crecer en el bosque), y si los dos van a lo mismo, el segundo dice "Ocupado". Las flores del jardín se siguen vendiendo solas al cosechar.
- El guardado recuerda la mochila y lo que hay en el bosque. "Reiniciar" vacía la mochila.
- Palabras nuevas al pasar el mouse: Baya · berry (BÉ-ri), Hongo · mushroom (MÁSH-rum) y Cristal · crystal (KRÍS-tal) sobre cada cosa del bosque, y Río · river sobre el agua. También se agregaron Pez · fish (FISH), Cangrejo · crab (KRAB), Bota · boot (BÚUT) y Mochila · backpack (BÁK-pak) a js/words.js.
- Nuevos archivos js/inventory.js y js/gather.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa, la fogata y el jardín. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo). Con el panel abierto se tapa casi todo el bosque: ciérralo con ✕ para recolectar. La ventanita de la mochila tapa un poco la carpa de real.fixer mientras está abierta. Nadie pesca ni recolecta solo. Una moneda brillante puede caer encima de una cosa del bosque. Si recargas mientras alguien pesca o recolecta, esa acción se pierde.

## 2026-10-21 · Extra: ☰ Menú plegable
- Un botón redondo siempre visible arriba a la izquierda: muestra "✕" cuando el panel está abierto y "☰" cuando está cerrado.
- Tocar "✕" cierra el panel con una animación suave (se desvanece y se achica hacia el botón) y queda solo el botón, para ver todo el mapa. Tocar "☰" lo abre otra vez.
- Con el panel cerrado todo sigue funcionando igual: caminar, muebles, jardín, menú social, menú de semillas y etiquetas de palabras.
- El juego recuerda si el panel estaba abierto o cerrado al recargar. Si el navegador no deja guardar, empieza abierto. "Reiniciar" no cambia esto.
- El panel ahora está justo debajo del botón. En pantallas chicas los botones del panel bajan a otra fila y las barras son más cortas, para que quepa.
- A pedido de Sofía: el panel ya no muestra la ayuda larga ("Toca el piso para caminar…") cuando hay alguien seleccionado. "Toca a Sofía o a real.fixer" sigue apareciendo cuando nadie está seleccionado.
- ⭐ Extra desbloqueado: 4 mariposas pequeñas (terracota, crema, madera y verde salvia) revolotean suavemente sobre el Jardín de Sofía durante el día, abriendo y cerrando las alas. Al atardecer se desvanecen y de noche no se ven. En Pausa se quedan quietas. Solo son decoración.
- Palabra nueva al pasar el mouse sobre una mariposa: Mariposa · butterfly (BÁ-ter-flai).
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa, la fogata y el jardín. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo. Las mariposas vuelan por encima de las flores y a veces tapan un poquito una. Con el panel abierto, en pantallas chicas todavía puede tapar un poco la parte de arriba del mapa (ciérralo con ✕ para ver todo).

## 2026-10-21 · Hito 13: 🌸 Jardín y cosecha
- En la ciudad, a la derecha de la Casa de Sofía, el "Jardín de Sofía": 6 parcelas de tierra (2 filas de 3) con una cerquita de madera, una entrada abajo y su cartel. No tapa caminos ni carteles.
- Cuatro flores mágicas (semilla → venta): 🌷 Tulipán 5 → 12, 🌼 Lirio 8 → 18, 🌈 Flor arcoíris 12 → 28 (sus pétalos cambian de color poco a poco) y 🌙 Flor de luna 15 → 35 (de noche brilla con un halo azul plateado).
- Plantar: con un personaje seleccionado, tocar una parcela vacía abre un menú con las 4 semillas, su emoji, lo que cuesta la semilla y lo que da la flor. Si no alcanzan las monedas, esa semilla se ve apagada. Al elegir, el personaje camina a la parcela, burbuja "Plantando 🌱" unos 2 segundos, y se descuentan las monedas.
- Regar: la semilla no crece hasta que se riega. Tocar la parcela: "Regando 💧" unos 2 segundos, y la tierra se ve más oscura.
- Crecer: después de regada pasa por semillita, brote (que se va estirando) y flor, en unos 90 segundos de juego.
- Cosechar y vender: la flor lista se mece, brilla y tiene destellos. Tocarla: "Cosechando 🌷" unos 2 segundos, la parcela queda vacía, sale "+N 🪙" flotando y el contador sube.
- Mismas reglas que los muebles: caminar hasta ahí, un nuevo clic cancela, Pausa congela todo (también el crecimiento), y si los dos van a la misma parcela, el segundo dice "Ocupado".
- Las parcelas brillan al pasar el mouse, y sobre un personaje parado en el jardín el clic va a la parcela.
- Las monedas brillantes ya no aparecen dentro del jardín.
- El guardado recuerda cada parcela (vacía, qué flor, si está regada y cuánto creció). "Reiniciar" deja las 6 vacías.
- Palabras nuevas al pasar el mouse: Jardín · garden (GÁR-den), Tulipán · tulip (TÚ-lip), Lirio · lily (LÍ-li), Flor arcoíris · rainbow flower (RÉIN-bou FLÁU-er), Flor de luna · moonflower (MÚUN-flau-er). Cada parcela muestra la palabra de su flor. También se agregaron Semilla · seed (SÍID) y Flor · flower (FLÁU-er) a js/words.js.
- Nuevo archivo js/garden.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa, la fogata y el jardín. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima. Los personajes son grandes al lado de las parcelas: mientras trabajan pueden tapar la parcela de arriba o el cartel del jardín, y después hay que moverlos para ver bien. Nadie cuida el jardín solo.

## 2026-10-21 · Hito 12: 🪙 Monedas mágicas
- Monedas mágicas: un contador de la casa (compartido por los dos) que se ve en el panel, debajo del reloj, como "🪙 N". La partida nueva empieza con 20.
- Monedas brillantes: cada 30 a 60 segundos de juego aparece una moneda dorada en el pasto de la ciudad, en un lugar al azar donde se puede caminar. Nunca sale en el río, el puente, la casa, la plaza, los caminos de piedra, la carpa, la fogata ni bajo los árboles. Como máximo hay 3 a la vez.
- Las monedas brillan, flotan un poquito y giran suavemente, con una estrellita que titila. De noche brillan un poco más.
- Cuando Sofía o real.fixer (seleccionado o no) pasa sobre una moneda, la recoge: desaparece con un destello, sale "+5 🪙" flotando hacia arriba y el contador suma 5.
- En Pausa no aparecen monedas nuevas.
- El guardado recuerda el contador y las monedas que hay en el suelo. "Reiniciar" vuelve a 20 y sin monedas en el suelo.
- Palabra nueva al pasar el mouse sobre una moneda: Moneda · coin (KÓIN).
- Nuevo archivo js/coins.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. Las monedas todavía no se pueden gastar (eso llega en el Hito 13). real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima.

## 2026-10-21 · Hito 11: 🔤 Palabras en las cosas
- Al pasar el mouse sobre un mueble, una habitación o un lugar, aparece cerca del cursor una etiqueta pequeña con su nombre en español (en negrita), en inglés (en cursiva) y cómo se pronuncia (entre paréntesis, más clarito). Por ejemplo: "Cama · bed (BED)".
- Palabras de la casa: Cocina · kitchen (KÍ-chen), Dormitorio · bedroom (BÉD-rum), Sala · living room (LÍ-ving rum), Refrigerador · fridge (FRICH), Cama · bed (BED), Televisión · TV (ti-VÍ), Sofá · couch (KÁUCH), Puerta · door (DOR).
- Palabras de la ciudad: Casa de Sofía · Sofía's house (so-FÍ-as JÁUS), Río · river (RÍ-ver), Puente · bridge (BRICH), Bosque · forest (FÓ-rest), Árbol · tree (TRÍI), Plaza · square (SKUÉR), Fuente · fountain (FÁUN-ten), Carpa · tent (TENT), Fogata · campfire (KÁMP-fáier), Luciérnaga · firefly (FÁIER-flai).
- La etiqueta va abajo a la derecha del cursor para no taparlo; cerca de los bordes se da vuelta para no salirse de la pantalla. Tiene fondo crema, así que se lee igual de día y de noche.
- Las luciérnagas se pueden "atrapar" con el mouse aunque se muevan. Si un personaje está bajo el mouse, no aparece etiqueta.
- En celular o tablet, al tocar una cosa la etiqueta aparece arriba del dedo durante 2 segundos.
- Tocar las cosas sigue haciendo lo mismo de antes, y los carteles que ya existían no cambiaron.
- Nuevo archivo js/words.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel.

## 2026-10-21 · Hito 10: 🌬️ Mundo vivo
- Parpadeo: cada personaje cierra los ojos un instante cada 3 a 6 segundos, en momentos distintos uno del otro.
- Respiración: cuando un personaje está quieto, su cuerpo sube y baja muy suavemente.
- Direcciones: cada personaje se ve de frente, de espalda o de costado (izquierda y derecha) según hacia dónde camina. Al detenerse mantiene la última dirección. Mientras charlan quietos, se miran de costado.
  - real.fixer de espalda: gorra por detrás con su abertura y correa, pelo oscuro, camisa negra y la correa de la riñonera (sin cara ni barba). De costado: visera hacia adelante, barba de perfil, riñonera de lado y reloj dorado.
  - Sofía de espalda: su pelo castaño largo cubre la cabeza y la espalda. De costado: su perfil, con el pelo cayendo por la espalda y un mechón sobre el hombro.
- Árboles: los árboles del bosque se mecen suavemente con el viento, cada uno a su ritmo. En Pausa se quedan quietos.
- Todo funciona en la casa y en la ciudad, de día y de noche. En Pausa siguen parpadeando y respirando.
- ⭐ Extra desbloqueado: Sofía lleva una pequeña corona de princesa dorada, su "Princess crown", visible desde todos los lados.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él.

## 2026-10-21 · Hito 9: 🕰️ Reloj, día y noche
- Reloj del juego: un día completo dura unos 8 minutos reales. La partida nueva empieza el Día 1 a las 08:00.
- El panel muestra arriba "☀️ Día N · HH:MM" de día y "🌙 Día N · HH:MM" de noche.
- De 07:00 a 19:00 es de día. De 19:00 a 20:00 el mundo se oscurece poco a poco con un tono azul-violeta, y de 06:00 a 07:00 se aclara poco a poco. Vale para la casa y para la ciudad. Los personajes siempre se ven bien.
- De noche brillan:
  - La fogata, con un halo de luz cálida que titila.
  - Las ventanas de la Casa de Sofía en el mapa, con luz amarilla.
  - Las luciérnagas, más grandes y brillantes.
  - Dentro de la casa, un brillo suave alrededor de la Televisión.
- De noche (de 19:00 a 07:00), la Energía de los dos baja ×1.3, además de los rasgos.
- Pausa también congela el reloj.
- El guardado recuerda el día y la hora. "Reiniciar" vuelve al Día 1, 08:00.
- Nuevo archivo js/time.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo.

## 2026-10-21 · Hito 8: ⛺ La carpa de real.fixer
- En la ciudad, del otro lado del puente, junto al río, real.fixer tiene su hogar, dibujado con código:
  - Una carpa terracota vista desde arriba, con palo central, cuerdas, estacas y la entrada abierta adelante.
  - Una fogata con piedras, troncos cruzados, llamas que se mueven suavemente, chispitas y una luz cálida.
  - 7 luciérnagas que flotan y titilan alrededor de la carpa y la fogata.
  - Un cartel: "Carpa de real.fixer".
- Dos cosas nuevas para usar, como los muebles (brillan al pasar el mouse):
  - Carpa: "Durmiendo en la carpa 💤", Energía +50 en 6 segundos. Solo la usa real.fixer; si Sofía la toca, dice "Es la carpa de real.fixer".
  - Fogata: "Junto a la fogata 🔥", Diversión +30 en 4 segundos. La usan los dos.
- Al empezar una partida nueva (o con "Reiniciar"), real.fixer aparece junto a su carpa. Sofía sigue empezando en la Sala.
- Libre albedrío de real.fixer: Energía → su Carpa, Diversión → la Fogata, Hambre → el Refrigerador de la casa de Sofía (sale o entra por la puerta si hace falta). Para Sofía no cambia nada.
- Visitas: cuando real.fixer no está seleccionado, está quieto y todas sus necesidades están en 50 o más, cada 1 a 2 minutos camina a la casa de Sofía, entra, se queda unos 30 segundos en la Sala y vuelve a su carpa. Si está en la casa sin nada que hacer, también se queda un rato y luego vuelve.
- El guardado sigue funcionando: recuerda si real.fixer está en la ciudad o en la casa.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa.

## 2026-10-21 · Hito 7: 🚪 La puerta mágica
- Cada personaje está en un lugar: la casa o la ciudad. La pantalla muestra el lugar del personaje seleccionado.
- Con un personaje seleccionado, tocar la puerta (el tapete terracota abajo a la izquierda de la Sala) lo hace caminar hasta ella y salir: aparece en la ciudad, frente a la puerta de su casa.
- Mapa de la ciudad visto desde arriba, dibujado con código:
  - Casa de Sofía por fuera, con techo de tejas, chimenea, ventanas y puerta.
  - Un río que cruza el mapa, con ondas que se mueven, y un puente de madera.
  - Un bosque de árboles redondeados arriba a la izquierda.
  - Una plaza de piedra con una fuente que salpica.
  - Carteles con los nombres: Casa de Sofía, Río, Puente, Bosque, Plaza.
  - Espacio libre junto al río, del otro lado del puente, para la futura carpa de real.fixer.
- En la ciudad, tocar el suelo hace caminar al seleccionado. Nunca pisa el agua: para cruzar usa el puente. Si tocas el agua, va a la orilla más cercana. No sale del mapa.
- Tocar la Casa de Sofía (brilla al pasar el mouse) hace que el personaje camine a su puerta y entre: vuelve a la Sala, junto a la puerta.
- Botones "Sofía" y "real.fixer" en el panel para elegir a cada uno aunque esté en otro lugar; la vista cambia a su lugar. El botón del seleccionado se ve terracota.
- Las necesidades bajan en los dos lugares. Charlar, contar chistes y chocar los cinco solo funcionan si los dos están en el mismo lugar.
- Libre albedrío: si el que no está seleccionado está en la ciudad y tiene una necesidad por debajo de 50, primero vuelve a la casa.
- El guardado recuerda en qué lugar está cada uno y su posición ahí.
- Colores nuevos de la ciudad: verdes de pasto, azul de agua y gris de piedra.
- Nuevo archivo js/city.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles y la fuente. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas.

## 2026-10-20 · Plan de la Parte B
- Se escribió el roadmap del juego completo en paquetes

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
- Arreglo: la estrella de ánimo ahora se ve rellena de color
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
