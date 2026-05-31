import { Photo, PortfolioConfig, ClientReviewSession } from "./types";

export const sampleUnsplashPresets = [
  { label: "Moda Étnica", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200", cat: "Moda y Editorial | Fashion & Editorial" },
  { label: "Retrato Melancólico", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200", cat: "Retrato | Portrait" },
  { label: "Espacio Minimalista", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", cat: "Paisaje | Landscape" },
  { label: "Boda Atardecer", url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200", cat: "Casamiento y Evento | Wedding & Event" }
];

export const DEFAULT_CONFIG: PortfolioConfig = {
  photographerName: "Christian Rotger",
  title: "Wild Earth Exposition | Exposición Tierra Salvaje",
  bio: "Fotógrafo documental y de conservación especializado en vida silvestre y paisajes de climas extremos y selvas tropicales. Explorando los glaciares de la Antártida, las colonias de South Georgia, la biodiversidad de Costa Rica y las cumbres de Europa. | Documentary and conservation photographer specializing in wildlife and landscapes of extreme climates and tropical rainforests. Exploring the glaciers of Antarctica, the colonies of South Georgia, the biodiversity of Costa Rica, and the peaks of Europe.",
  email: "wildlife@rotger.com",
  instagram: "christian.rotger.ph",
  twitter: "crotger_wild",
  brandColor: "#0f766e", // Deep Teal / Ocean Pine
  categories: [
    "Vida Silvestre | Wildlife",
    "Paisaje | Landscape",
    "Costa Rica | Costa Rica",
    "Antártida | Antarctica",
    "South Georgias | South Georgias",
    "Europa | Europe",
    "Ushuaia | Ushuaia",
    "Sport | Sport",
    "Retrato | Portrait",
    "Moda y Editorial | Fashion & Editorial",
    "Casamiento y Evento | Wedding & Event",
    "Otro | Other"
  ]
};

export const DEFAULT_PHOTOS: Photo[] = [
  {
    id: "photo_1",
    url: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=1200",
    title: "Catedrales de Hielo Azul | Blue Ice Cathedrals",
    description: "Iceberg colosal a la deriva en el Estrecho de Gerlache, Antártida. Un laberinto de franjas de azul eléctrico producidas por la inmensa compresión del hielo milenario. | Colossal iceberg drifting in the Gerlache Strait, Antarctica. A labyrinth of electric blue stripes produced by the immense compression of ancient ice.",
    category: "Antártida | Antarctica",
    date: "2026-01-15",
    camera: "Nikon Z9",
    lens: "Nikkor Z 24-70mm f/2.8 S",
    settings: "f/8, 1/1250s, ISO 64",
    editorialReview: "Una captura majestuosa que retrata la magnificencia efímera del continente antártico. La sutileza tonal del blanco sobre el agua profunda transmite calma pero también la fragilidad de nuestros polos. | A majestic capture portraying the fleeting magnificence of the Antarctic continent. The tonal subtlety of white against the deep water transmits calm but also the fragility of our poles.",
    suggestedSettings: "Para fotografiar hielo en contraste con agua oscura bajo luz dura, subexponga de -0.3 a -0.7 EV para preservar los detalles sutiles de las altas luces sin quemar la nieve. | When photographing ice against dark water under harsh light, underexpose by -0.3 to -0.7 EV to preserve subtle highlight details without blowing out the snow.",
  },
  {
    id: "photo_2",
    url: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=1200",
    title: "Monarcas de Bahía de Salisbury | Monarchs of Salisbury Plain",
    description: "Centenares de miles de Pingüinos Rey reunidos frente al oleaje del Atlántico Sur en las escarpadas costas volcánicas de South Georgia. | Hundreds of thousands of King Penguins gathered before the South Atlantic surf on the rugged volcanic shores of South Georgia.",
    category: "South Georgias | South Georgias",
    date: "2026-02-04",
    camera: "Sony Alpha 1",
    lens: "FE 200-600mm f/5.6-6.3 G OSS",
    settings: "f/6.3, 1/1000s, ISO 320",
    editorialReview: "Un documento visual impactante del milagro de la vida silvestre. La compresión de lentes largos realza la escala abrumadora y la elegancia de los pelajes dorados bajo el cielo nublado. | Un impactful visual document of the miracle of wildlife. Telephoto lens compression enhances the overwhelming scale and elegance of the golden coats under cloudy skies.",
    suggestedSettings: "Se recomienda disparar desde una posición baja de la playa a la altura de los animales para lograr una perspectiva inmersiva y un hermoso desenfoque del fondo (bokeh) marino. | Shooting from a low angle on the beach at the animal's eye level is recommended to achieve an immersive perspective and a beautiful ocean bokeh.",
  },
  {
    id: "photo_3",
    url: "https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?q=80&w=1200",
    title: "Niebla del Volcán Tenorio | Tenorio Volcano Mist",
    description: "El dosel de la selva tropical de Costa Rica envuelto en bruma matinal y nubes bajas, revelando un color verde esmeralda denso y misterioso. | The canopy of the Costa Rican rainforest shrouded in morning mist and low clouds, revealing a dense and mysterious emerald green.",
    category: "Costa Rica | Costa Rica",
    date: "2026-04-12",
    camera: "Nikon Z9",
    lens: "Nikkor Z 70-200mm f/2.8 VR S",
    settings: "f/5.6, 1/400s, ISO 160",
    editorialReview: "La fotografía logra aislar capas sucesivas de follaje tropical húmedo creando una sensación tridimensional excepcional que rinde homenaje a la mística costarricense. | The photograph succeeds in isolating successive layers of wet tropical canopy, creating a wonderful three-dimensional feeling that honors the Costa Rican mystique.",
    suggestedSettings: "Con niebla espesa, la cámara tiende a subexponer. Ajuste el balance de blancos a nublado o preajuste de temperatura cálida para destacar los espectros de clorofila verde. | Under heavy fog, the camera tends to underexpose. Set white balance to cloudy or warm to highlight the green chlorophyll spectra.",
  },
  {
    id: "photo_4",
    url: "https://images.unsplash.com/photo-1552084117-56a987666449?q=80&w=1200",
    title: "Vigilante de la Canopia | Canopy Sentinel",
    description: "Un Tucán Pico Iris descansando pacientemente sobre una rama húmeda de lianas en el Parque Nacional Corcovado, Costa Rica. | A Keel-billed Toucan resting patiently on a damp vine branch in Corcovado National Park, Costa Rica.",
    category: "Costa Rica | Costa Rica",
    date: "2026-04-18",
    camera: "Canon EOS R3",
    lens: "RF 400mm f/2.8L IS USM",
    settings: "f/2.8, 1/800s, ISO 400",
    editorialReview: "Un primer plano vibrante donde la nitidez del plumaje contrasta de manera espectacular con los colores cálidos de las flores selváticas lejanas en el fondo. | A vibrant close-up where the sharp plumage contrasts spectacularly with the warm colors of the distant wildflowers in the background.",
    suggestedSettings: "Para capturar aves activas en la penumbra de la selva, use una apertura amplia como f/2.8 o f/4 y active la prioridad al obturador a un mínimo de 1/800s para resguardar la nitidez. | To capture active birds in the rainforest dimness, use a wide aperture like f/2.8 or f/4 and shutter speed priority of at least 1/800s.",
  },
  {
    id: "photo_5",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    title: "Gigantes de la Cordillera | Giants of the Mountain Range",
    description: "La silueta escarpada del macizo de los Alpes durante los últimos rayos crepusculares de un frío atardecer de otoño en Europa alpina. | The rugged silhouette of the Alps massif during the last twilight rays of a cold autumn sunset in alpine Europe.",
    category: "Europa | Europe",
    date: "2026-05-02",
    camera: "Fujifilm GFX 100S",
    lens: "GF 32-64mm f/4 R LM WR",
    settings: "f/11, 2s, ISO 100",
    editorialReview: "Una oda clásica al paisaje de montaña europeo. Las texturas crudas del granito y los neveros se combinan con gradientes de color que evocan paz y solemne eternidad. | A classic ode to the European alpine landscape. The raw textures of granite and snowfields combine with color gradients evocating peace and solemn eternity.",
    suggestedSettings: "Es recomendable un trípode pesado para larga exposición a f/11 para maximizar la profundidad de campo y lograr la máxima nitidez posible del sensor de formato medio. | A sturdy tripod is recommended for long exposure at f/11 to maximize depth of field and achieve maximum sharpness from the medium format sensor.",
  },
  {
    id: "photo_6",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200",
    title: "Centinela Polar | Polar Sentry",
    description: "Un zorro ártico camuflado entre la tundra en las islas Svalbard, vigilando las cumbres nevadas del norte europeo. | An Arctic fox camouflaged among the tundra in the Svalbard islands, watching the snowy peaks of northern Europe.",
    category: "Europa | Europe",
    date: "2026-05-18",
    camera: "Sony Alpha 1",
    lens: "FE 400mm f/2.8 GM OSS",
    settings: "f/4.0, 1/1600s, ISO 200",
    editorialReview: "Este retrato de fauna logra transmitir una conmovedora comunión entre el animal y su ecosistema escarchado gracias a una paleta cromática minimalista y ártica. | This wildlife portrait conveys a poignant communion between the animal and its frosty ecosystem thanks to an arctic, minimalist color palette.",
    suggestedSettings: "En parajes con abundante nieve de fondo, es imprescindible calibrar la medición de exposición a puntual para evitar que el animal salga oscuro debido al reflejo blanco circundante. | In snowy conditions, it is essential to calibrate spot metering to avoid underexposing the subject due to surrounding bright snow reflections.",
  },
];

export const DEFAULT_CLIENT_REVIEWS: ClientReviewSession[] = [];

// Helper function to handle bilingual splitting
export function getLocalizedText(text: string | undefined, lang: "es" | "en"): string {
  if (!text) return "";
  if (text.includes(" | ")) {
    const parts = text.split(" | ");
    return lang === "es" ? parts[0].trim() : parts[1].trim();
  }
  return text;
}
