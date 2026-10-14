const RAW_WORDS = `
agua alma amor arco azul baja beso boca bolo bote cabo cafe caja cala cama capa cara casa cena cima codo cola copa coro cuba cuna dado daga dama dedo dije duna duro foca foso gato gema giro goma gota hilo hoja isla jugo lago lana lata lazo lema lino lobo loro luna lupa mano mapa mesa mina mito moda mono muro nido nudo nube obra pala paso pata pato pelo pena pera peso pico pino piso pozo puro rama rana rata rayo reja remo rima risa roca rosa ruta saco sapo seda seta soga sopa taco taza teja tela tema tiza toro tren tubo vaca vaso vela vena vida vino yate yema zona faja foro hule lona mora orbe prado reto urna yugo zoco milo nata polo rulo seto topo viga faro lodo muro nata puma rabo sebo telo vado
abeja aguja aldea aliso ancla angel arbol arena arroz atajo avena aviso bahia balsa barca barco bosque brisa bruma burro cabra calle campo canto carne carta causa ceiba cerdo cielo cinco cinta cisne cobre coral corzo costa crema cueva dardo delta duende fuego garra globo grano grito guiso hielo horno hotel huevo humor jaspe joyas jinete kiwi lagoa limon lince llave lucro magia mango marco masa metal metro miel monje monte moral nieve norte novia nube nuera oasis olivo onda orilla oso palma panal papel pared pasta patio pauta perla piano pinar pinza playa pluma polvo porra prado puente pulpo queso radio ramo reloj rioja roble rollo sable salsa selva silla sobre solar suelo tabla tazon techo templo tigre traje tramo truco uvas valle vaso verde viaje vigia villa vino visor yegua
abrigo aceite acero acierto adorno aguja agua alambre alce algodon alianza aliento almendra almidon amistad ancla angel anillo antena aparato arbol arcilla arena arroyo asiento atardecer atlas avena aviso azulejo bahia balanza ballena balcon bambu bandera barba barco barril barrio basura batalla bateria bebe biblioteca bicicleta bocado bosque botella boton brisa brujula buho burro caballo cabeza cabra cadena cafe caja calamar calendario calle calor cama camino camisa campana campo canal cancion canoa canto capa capital caracol carbon carnero carne carpeta carro carta casa cascada casco castillo causa cebolla cedro ceja celda cena cepillo cerca cerdo cereza cerradura cesped cetro charco chile cielo ciencia cierre cinco cinta circo ciruela ciudad clavel clima cobre cocina coco codigo cofre colina cometa comida concha conejo copa coral corbata corcho cordero corona corral costa crema cristal cuadrado cuarzo cubo cuchara cuello cuerda cuenca cueva cumbre curva
daga delta deporte derecho descanso desierto diamante dibujo diente dinero domingo dorado dragon duende dulce duna durazno edificio eje ejemplo elefante energia ensayo entrada equipo era escala escoba escuela escudo espacio espejo esquina establo estrella estudio etiqueta falda familia faro fecha ficha fiebre fiesta figura fila filme flauta flecha flor foco fondo forma foro frase fruta fuego fuente furia gacela galleta gallina gallo garaje garra gato gema genio giro globo golfo goma gorila gorro gota grano grillo grito grupo guante guardia guerra guia guitarra gusano haba habito hacha hada harina hecho helado herida hermana herrero hielo higo hijo hilo hoja hombre hongo horno huerto huevo humo huracan idea iglesia imagen iman indice insecto isla jabon jaguar jarra jaspe jaula jefe jinete jornada joya judia juego juguete julio junio juntos kilo kiwi labio ladrillo lago lagrima lana lanza lapiz lata lazo leccion leche lechuza lectura lejano lengua lente lenteja leon leona letra libro licor lienzo lima limon lince linea lino lista lobo loma lona loro losa lucha luego lugar lujo luna lupa luz llave llanura llave llama llanto llave
madera madre maestro magia maiz malo mama mancha mando manga mango mano manta manzana mapa mariposa marmol martillo masa mayoria medio medalla mejor melon memoria mercado mes mesa metal metro miel milagro mina minuto mirador mision mismo mochila modelo modo moho molino momento mono montaña monte moral mosca motor mueble muestra muro museo musica naranja nata naturaleza nave navidad neblina nido nieve nieto nina nino nivel noche nombre norte nota novela nube nuera nudo nuevo numero oasis objeto obra ocio oido ojera olivo olmo ombligo onda opcion oracion orden oreja organo orgullo orilla oro oso otono oveja pajaro palabra palma paloma panal pantalla panuelo papa papel paraguas pared pareja parque pasaje pasillo paso pasta patio pato pavo pecho pedazo pedido pez pelo pelota pena pera percha perdiz perfil perla perro pesca peso pez piano picara pico piedra piel pieza pila pilar piloto pino pinza piso pista pizarra planeta planta plata playa plaza pluma poblacion poder poesia polvo pomelo porche portal portero poste pozo pradera precio pregunta premio prensa prieto pueblo puerta pulpo punta puro queso quinto radio raiz rama rana rapido raton rayo razon rebaño rebozo receta red reina reloj remero remo renta reposo resina resto retiro revista rey rio roble roca rocio rodeo rojo rollo romero ropa rosa rostro rueda ruido ruta sabana sable sabio saco salero salmo salmon salsa salud salto sandia sapo sauce secreto seda sello selva semana semilla sendero seno señal septimo serie seta sierra signo silbido silla sirena sitio sobre sofia sol solar soldado sombra sonaja sonrisa sopa soporte suela suelo sueno suerte sueter sur tabla tablero tacon tajo talco taller tamano tanque tapa tapiz tardio tazon techo tecla teja tela telefono tema templo tenaza teoria tercer terreno tesoro tiburón tigre tijera tilde timbre tinte tio tipo tiza toldo tomate tono tormenta toro torre tortuga toalla trabajo traje tramo trapo trazo tren tribu trigo trono truco tubo tumba tuna tunel turno uva vaca valle vampiro vaquero vaso vecino vela velero venta ventana verano vestido viaje viento vinagre vino violin virtud visita visor viuda volante volcan yate yegua yema yeso yodo yunque zafiro zanahoria zapato zona zorro zumo
abeja abrigo aceite acero acuario adorno agencia agujero alameda albanil alcazar alce alfarero algodon alheli alianza alimento almanaque almendra almidon almuerzo alpinista altavoz amapola amistad ancla andamio anfitrion angel anillo ancla antorcha aparato arandela arbitro arbol arcada archivo arcilla arena arete armario aroma arpon arroyo artesano asador asiento atardecer ataud atun aullido aurora avena aviso axila ayuda azucar azufre
babero bahia bailarin balanza balcon ballena balneario bambu bandera banqueta baraja barba barbero barco barniz barril barrio bascula basura batalla bateria baterista bebedero bellota berenjena biblioteca bicicleta bigote bisagra bisonte bizcocho bocado bocina bodega boina bolsillo bombero bondad bonete bosque botella botin boton brisa brujula buceo bufanda bufon buho buitre buque burbuja burro
caballo cabeza cabra cadena cafetera cajon calamar caldera calendario calido caliz calle calor camino camisa campana campana campo canal cancion canoa cantera cantimplora canto capa capitan caracol carbon carcel carnero carne carpeta carro carta cartera cascada casco caserio castaña castillo castor catre causa cazuela cebolla cedro ceja celda ceniza cepillo ceramica cerca cerdo cereza cerradura cerro cesped cetro charco chaqueta chile chimenea chiste chocolate chubasco ciclo cielo ciencia cierre cigüeña cinco cinta circo ciruela ciudad clavel clavija clima cobertizo cobre cocina cocodrilo coco codigo cofre colchon colina colmena cometa comida concha conejo confianza copa coral corbata corcho cordero corona corral cortina costa cremallera crema cristal crucero cuadrado cuarzo cubierto cubo cuchara cuchillo cuello cuerda cuenca cuervo cueva cumbre cuna curva
daga delfin delta deporte descanso desierto desayuno destello diamante dibujo diente dinero domingo dorado dragon duende dulce duna durazno
edificio ejemplo elefante embarque energia ensayo entrada equipo era escala escoba escollo escuela escudo espacio espejo esquina establo estatua estrella estuche estudio etiqueta
falda familia faro fecha ficha fiebre fiesta figura fila filme flauta flecha flor foco fondo forma foro frase fruta fuego fuente furia
gacela galleta gallina gallo garaje garfio garra gato gema genio geranio giro globo golfo goma gorila gorro gota grano grillo grito grupo guante guardia guerra guia guitarra gusano
haba habito hacha hada harina helado herida hermano herrero hielo higo hijo hilo hoja hombre hongo horno huerto huevo humo huracan
idea iglesia imagen iman indice insecto instante isla
jabali jabon jaguar jarra jaspe jaula jefe jilguero jinete jornada joyero joya juego juguete julio junio
kilo kiwi
laberinto labio ladrillo lagarto lago lagrima lana lanza lapiz lata laurel lazo leccion leche lechuza lectura lejania lengua lente lenteja leon leona letra libelula libro licor lienzo lima limon lince linea lino lista liviano lobo loma lona loro losa lucha lugar lujo luna lupa
madera madre maestro magia maiz mama mancha mando manga mango mano manta mantel manzana mapa mariposa marmol martillo masa medalla melon memoria mercado meseta mesa metal metro miel milagro mina minuto mirador mision mochila modelo molino momento mono montura monte moral mosca mosquito motor mueble muro museo musica
naranja naturaleza nave navidad neblina nido nieve nieto nivel noche nombre norte nota novela nube nudo numero
oasis objeto obra oido olivo olmo onda opcion oracion orden oreja organo orgullo orilla oro otono oveja
pajaro palabra palma paloma panal pantalla panuelo papel paraguas pared pareja parque pasaje pasillo paso pasta patio pato pavo pecho pedido pelo pelota pena pera percha perdiz perfil perla perro pesca peso piano piedra piel pieza pila pilar piloto pino pinza piso pista pizarra planeta planta plata playa plaza pluma poder poesia polvo pomelo porche portal portero poste pozo pradera precio pregunta premio prensa pueblo puerta puesto pulpo punta
queso
radio raiz rama rana raton rayo razon rebozo receta regalo reina reloj remo renta reposo resina revista rio roble roca rocio rodeo rollo romero ropa rosa rostro rueda ruido ruta
sabana sable sabio saco salero salmon salsa salud salto sandia sapo sauce secreto seda sello selva semana semilla sendero señal serie seta sierra signo silla sirena sitio sobre sol solar soldado sombra sonrisa sopa soporte suelo suerte sueter
tabla tablero tacon taller tanque tapa tapiz tazon techo tecla teja tela tema templo tenaza teoria terreno tesoro tigre tijera timbre tinte tipo tiza toldo tomate tono tormenta toro torre tortuga toalla trabajo traje tramo trapo trazo tren tribu trigo trono truco tubo tumba tunel turno
uva
vaca valle vaquero vaso vecino vela velero venta ventana verano vestido viaje viento vinagre vino violin virtud visita visor viuda volante volcan
yate yegua yema yeso yodo yunque
zafiro zanahoria zapato zona zorro zumo
`

function fold(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

const BANNED = new Set([
  'password',
  'qwerty',
  'asdfgh',
  'zxcvbn',
  'admin',
  'root',
  'hola',
  'dios',
  'abcd',
  'secreto',
])

export const WORDLIST: readonly string[] = [...new Set(RAW_WORDS.split(/\s+/).map(fold))]
  .filter((word) => word.length >= 4 && word.length <= 8 && !BANNED.has(word))
  .sort()

const buckets = new Map<number, string[]>()

for (const word of WORDLIST) {
  const list = buckets.get(word.length) ?? []
  list.push(word)
  buckets.set(word.length, list)
}

export function wordsOfLength(length: number): readonly string[] {
  return buckets.get(length) ?? []
}

export const MIN_WORD_LENGTH = 4
export const MAX_WORD_LENGTH = 8
