/* =========================================================
   CONFIGURACIÓN DE LA TIENDA
   Cambiá estos datos y se actualizan en toda la página.
   ========================================================= */
const TIENDA = {
  nombre: "MARTÍN",
  bajada: "Auto y Hogar",
  // Número de WhatsApp con código de país, sin +, espacios ni guiones.
  whatsapp: "5491100000000",
  ciudad: "Buenos Aires",
};

/* Los dos mundos del catálogo. "accesorios" es la categoría que se
   sugiere en la ficha cuando no hay una etapa siguiente. */
const MUNDOS = [
  { id: "auto",  nombre: "Auto",  titulo: "Todo el auto", frase: "Del lavado al encerado, de punta a punta.",
    color: "#ff5a1f", rotulo: "Fiat Cronos · hecho en Córdoba", accesorios: "accesorios" },
  { id: "hogar", nombre: "Hogar", titulo: "Toda la casa", frase: "De la cocina al patio, ambiente por ambiente.",
    color: "#ff5a1f", rotulo: "La casa · ambiente por ambiente", accesorios: "utiles" },
];

/* Zonas (los puntos que se tocan en el dibujo del auto o de la casa). */
const ZONAS = [
  { id: "carroceria", mundo: "auto",  nombre: "Carrocería",          color: "#ff5a1f", frase: "Lavar, descontaminar, pulir y proteger. En ese orden." },
  { id: "ruedas",     mundo: "auto",  nombre: "Llantas y cubiertas", color: "#ff4a4a", frase: "Lo más sucio del auto merece productos propios." },
  { id: "vidrios",    mundo: "auto",  nombre: "Vidrios",             color: "#45d4ff", frase: "Sin vetas, sin sarro y con la lluvia resbalando." },
  { id: "interior",   mundo: "auto",  nombre: "Interior",            color: "#3fe08a", frase: "Tapizados, cuero y plásticos como el día uno." },
  { id: "motor",      mundo: "auto",  nombre: "Motor",               color: "#9fb3c8", frase: "Desengrasar y dejar el vano presentable." },
  { id: "accesorios", mundo: "auto",  nombre: "Accesorios",          color: "#d9f24a", frase: "Lo que toca la pintura importa tanto como el producto." },

  { id: "cocina",     mundo: "hogar", nombre: "Cocina",              color: "#ff9a2e", frase: "Grasa, vajilla y horno bajo control." },
  { id: "bano",       mundo: "hogar", nombre: "Baño",                color: "#45d4ff", frase: "Sin sarro, sin hongos y desinfectado." },
  { id: "living",     mundo: "hogar", nombre: "Pisos y muebles",     color: "#b48cff", frase: "Pisos perfumados, muebles lustrados y vidrios sin marcas." },
  { id: "ropa",       mundo: "hogar", nombre: "Ropa",                color: "#ff5fa8", frase: "Lavar, suavizar y sacar manchas." },
  { id: "patio",      mundo: "hogar", nombre: "Patio y pileta",      color: "#3fe08a", frase: "Agua cristalina todo el verano." },
  { id: "utiles",     mundo: "hogar", nombre: "Trapos y accesorios", color: "#d9f24a", frase: "Lo que se gasta siempre: trapos, esponjas y guantes." },
];

/* Categorías. "pref" arma el código del producto (LV-01, LV-02...).
   "color" es el color del líquido / envase en los dibujos. */
const CATEGORIAS = [
  { id: "lavado",         nombre: "Lavado",              zona: "carroceria", pref: "LV", color: "#ff5fa8" },
  { id: "descontaminado", nombre: "Descontaminado",      zona: "carroceria", pref: "DC", color: "#a77bff" },
  { id: "pulido",         nombre: "Pulido",              zona: "carroceria", pref: "PU", color: "#ffd23f" },
  { id: "proteccion",     nombre: "Protección",          zona: "carroceria", pref: "PR", color: "#ff9a2e" },
  { id: "llantas",        nombre: "Llantas y cubiertas", zona: "ruedas",     pref: "LL", color: "#ff4a4a" },
  { id: "vidrios",        nombre: "Vidrios",             zona: "vidrios",    pref: "VD", color: "#45d4ff" },
  { id: "interior",       nombre: "Interior",            zona: "interior",   pref: "IN", color: "#3fe08a" },
  { id: "motor",          nombre: "Motor",               zona: "motor",      pref: "MT", color: "#9fb3c8" },
  { id: "accesorios",     nombre: "Accesorios",          zona: "accesorios", pref: "AC", color: "#d9f24a" },

  { id: "cocina",         nombre: "Cocina",              zona: "cocina",     pref: "CO", color: "#ff9a2e" },
  { id: "bano",           nombre: "Baño",                zona: "bano",       pref: "BA", color: "#45d4ff" },
  { id: "pisos",          nombre: "Pisos",               zona: "living",     pref: "PI", color: "#b48cff" },
  { id: "muebles",        nombre: "Muebles y vidrios",   zona: "living",     pref: "MV", color: "#ffd23f" },
  { id: "ropa",           nombre: "Ropa",                zona: "ropa",       pref: "RO", color: "#ff5fa8" },
  { id: "patio",          nombre: "Patio y pileta",      zona: "patio",      pref: "PP", color: "#3fe08a" },
  { id: "utiles",         nombre: "Trapos y accesorios", zona: "utiles",     pref: "UT", color: "#d9f24a" },
];

/* Kits armados: se suman al pedido con un toque. En "productos" va el
   nombre exacto del producto; si hay dos con el mismo nombre, agregá
   el tamaño después de una barra:  "Detergente Concentrado Limón|5 L" */
const COMBOS = [
  { id: "lavado-basico", mundo: "auto", nombre: "Lavado básico", frase: "Lo justo para lavar bien y sin rayar.",
    productos: ["Shampoo Neutro pH7", "Guante de Lavado Microfibra", "Microfibra de Secado 1200 GSM", "Balde con Rejilla 20 L"] },
  { id: "brillo-finde", mundo: "auto", nombre: "Brillo de fin de semana", frase: "Espuma, cera rápida y cubiertas negras.",
    productos: ["Snow Foam Rosa", "Shampoo con Cera", "Quick Detailer", "Acondicionador de Cubiertas Brillo Húmedo", "Pack 3 Microfibras 350 GSM"] },
  { id: "detailing-completo", mundo: "auto", nombre: "Detailing completo", frase: "Descontaminar, pulir y proteger la pintura.",
    productos: ["Iron Remover Descontaminante Férrico", "Clay Bar Media", "Pulidor One Step", "Pad de Espuma Finish 5\"", "Sellador Sintético", "Cera Carnauba en Pasta"] },
  { id: "interior-impecable", mundo: "auto", nombre: "Interior impecable", frase: "Tapizados, plásticos y vidrios por dentro.",
    productos: ["APC Multipropósito", "Limpia Tapizados Espuma Activa", "Acondicionador de Plásticos Mate", "Limpiavidrios Sin Amoníaco", "Aromatizante Auto Nuevo"] },

  { id: "casa-al-dia", mundo: "hogar", nombre: "Casa al día", frase: "Lo que se usa todas las semanas.",
    productos: ["Detergente Concentrado Limón|5 L", "Lavandina Concentrada", "Desodorante de Pisos Lavanda", "Trapo de Piso Gris", "Rejillas de Cocina x3"] },
  { id: "bano-a-fondo", mundo: "hogar", nombre: "Baño a fondo", frase: "Sarro, hongos e inodoro de una pasada.",
    productos: ["Gel Sanitario para Inodoros", "Antisarro para Baños", "Quita Hongos y Moho", "Guantes de Látex", "Esponjas Doble Faz x3"] },
  { id: "lavadero-completo", mundo: "hogar", nombre: "Lavadero completo", frase: "Lavar, suavizar y sacar manchas.",
    productos: ["Jabón Líquido para Ropa", "Suavizante Concentrado", "Quitamanchas Prelavado"] },
  { id: "pileta-lista", mundo: "hogar", nombre: "Pileta lista", frase: "Agua transparente toda la temporada.",
    productos: ["Cloro Líquido para Pileta", "Alguicida para Pileta", "Clarificador para Pileta"] },
];
