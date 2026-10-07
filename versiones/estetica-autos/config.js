/* =========================================================
   CONFIGURACIÓN DE LA TIENDA
   Cambiá estos datos y se actualizan en toda la página.
   ========================================================= */
const TIENDA = {
  nombre: "MARTÍN",
  bajada: "Car Care",
  // Número de WhatsApp con código de país, sin +, espacios ni guiones.
  whatsapp: "5491100000000",
  ciudad: "Buenos Aires",
};

/* Zonas del auto (los puntos que se tocan en el dibujo). */
const ZONAS = [
  { id: "todo",       nombre: "Todo el auto",        color: "#ff5a1f", frase: "El catálogo completo, de punta a punta." },
  { id: "carroceria", nombre: "Carrocería",          color: "#ff5a1f", frase: "Lavar, descontaminar, pulir y proteger. En ese orden." },
  { id: "ruedas",     nombre: "Llantas y cubiertas", color: "#ff4a4a", frase: "Lo más sucio del auto merece productos propios." },
  { id: "vidrios",    nombre: "Vidrios",             color: "#45d4ff", frase: "Sin vetas, sin sarro y con la lluvia resbalando." },
  { id: "interior",   nombre: "Interior",            color: "#3fe08a", frase: "Tapizados, cuero y plásticos como el día uno." },
  { id: "motor",      nombre: "Motor",               color: "#9fb3c8", frase: "Desengrasar y dejar el vano presentable." },
  { id: "accesorios", nombre: "Accesorios",          color: "#d9f24a", frase: "Lo que toca la pintura importa tanto como el producto." },
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
];
