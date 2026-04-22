// data.jsx — Seed data for the Trip Organizer prototype
// Minimal, generic placeholders — not the user's actual trip.

const TRIP = {
  title: "France + Spain",
  year: "2026",
  start: new Date("2026-07-31T00:00:00"),
  end:   new Date("2026-08-24T00:00:00"),
  today: new Date("2026-04-21T00:00:00"),
};

const TYPE_META = {
  flight:   { label: "Flight",   icon: "✈",  color: "var(--sky)"    },
  train:    { label: "Train",    icon: "🚆", color: "var(--sea)"    },
  hotel:    { label: "Hotel",    icon: "🏨", color: "var(--gold)"   },
  activity: { label: "Activity", icon: "🎟",  color: "var(--accent)" },
};

// Geographic coords are normalized 0-1 for our stylized map canvas.
// (0,0) = top-left, (1,1) = bottom-right.
const CITY = {
  yul: { name: "Montreal",  code: "YUL",  x: 0.08, y: 0.30, country: "CA" },
  cdg: { name: "Paris",     code: "CDG",  x: 0.52, y: 0.38, country: "FR" },
  ory: { name: "Paris",     code: "ORY",  x: 0.52, y: 0.39, country: "FR" },
  lyn: { name: "Lyon",      code: "LYS",  x: 0.56, y: 0.50, country: "FR" },
  avi: { name: "Avignon",   code: "AVN",  x: 0.55, y: 0.58, country: "FR" },
  nce: { name: "Nice",      code: "NCE",  x: 0.62, y: 0.60, country: "FR" },
  bcn: { name: "Barcelona", code: "BCN",  x: 0.52, y: 0.68, country: "ES" },
  mad: { name: "Madrid",    code: "MAD",  x: 0.40, y: 0.74, country: "ES" },
  seville: { name: "Seville", code: "SVQ", x: 0.34, y: 0.82, country: "ES" },
  bilbao:  { name: "Bilbao",  code: "BIO", x: 0.38, y: 0.62, country: "ES" },
};

const BOOKINGS = [
  {
    id: "b1",
    type: "flight",
    title: "YUL → CDG",
    airline: "Air Canada",
    flightNumber: "AC 888",
    seat: "14A",
    terminal: "T1",
    start: "2026-07-31T19:20",
    end:   "2026-08-01T08:40",
    tz: "America/Montreal",
    tzEnd: "Europe/Paris",
    from: { label: "Montréal-Trudeau (YUL)", ...CITY.yul },
    to:   { label: "Paris CDG", ...CITY.cdg },
    confirmation: "A3K7XQ",
    price: { amount: 842.10, currency: "CAD" },
    cad: 842.10,
    fx: null,
    receipt: true,
    notes: "Aisle seat requested. Meal: vegetarian.",
  },
  {
    id: "b2",
    type: "hotel",
    title: "Hôtel du Marais",
    address: "12 rue de Rivoli, 75004 Paris",
    roomType: "Chambre double, vue cour",
    start: "2026-08-01T15:00",
    end:   "2026-08-06T11:00",
    tz: "Europe/Paris",
    from: { label: "Paris, Le Marais", ...CITY.cdg, x: 0.518, y: 0.378 },
    confirmation: "BK-551203",
    price: { amount: 1240.00, currency: "EUR" },
    cad: 1854.60,
    fx: 1.495,
    receipt: true,
    notes: "Breakfast included. Late check-in ok.",
  },
  {
    id: "b3",
    type: "activity",
    title: "Musée d'Orsay",
    venue: "Musée d'Orsay",
    address: "Esplanade Valéry Giscard d'Estaing, 75007 Paris",
    ticketUrl: "https://billetterie.musee-orsay.fr/",
    start: "2026-08-03T10:00",
    end:   "2026-08-03T13:00",
    tz: "Europe/Paris",
    from: { label: "Musée d'Orsay", ...CITY.cdg, x: 0.515, y: 0.384 },
    confirmation: "MO-8872",
    price: { amount: 16.00, currency: "EUR" },
    cad: 23.92,
    fx: 1.495,
    receipt: false,
    notes: "Timed entry. Arrive 10 min early.",
  },
  {
    id: "b4",
    type: "activity",
    title: "Dinner, Le Petit Bouillon",
    venue: "Le Petit Bouillon Pharamond",
    address: "24 rue de la Grande Truanderie, 75001 Paris",
    start: "2026-08-04T19:30",
    end:   "2026-08-04T21:30",
    tz: "Europe/Paris",
    from: { label: "Le Petit Bouillon", ...CITY.cdg, x: 0.521, y: 0.379 },
    confirmation: "",
    price: { amount: 0, currency: "EUR" },
    cad: 0,
    receipt: false,
    notes: "Walk-in — no reservation needed.",
  },
  {
    id: "b5",
    type: "train",
    title: "Paris → Barcelona",
    operator: "SNCF TGV INOUI",
    trainNumber: "TGV 9722",
    coach: "Voiture 14",
    seat: "27",
    start: "2026-08-06T14:12",
    end:   "2026-08-06T20:44",
    tz: "Europe/Paris",
    from: { label: "Gare de Lyon, Paris", ...CITY.cdg },
    to:   { label: "Barcelona Sants", ...CITY.bcn },
    confirmation: "TG-Q2R8",
    price: { amount: 168.00, currency: "EUR" },
    cad: 251.16,
    fx: 1.495,
    receipt: true,
    notes: "Duplex upper, window side. Bike storage reserved.",
  },
  {
    id: "b6",
    type: "hotel",
    title: "Casa Bonay",
    address: "Gran Via de les Corts Catalanes 700, 08010 Barcelona",
    roomType: "Bonay Room, balcony",
    start: "2026-08-06T21:30",
    end:   "2026-08-12T11:00",
    tz: "Europe/Madrid",
    from: { label: "Barcelona, Eixample", ...CITY.bcn, x: 0.522, y: 0.676 },
    confirmation: "CB-40211",
    price: { amount: 1580.00, currency: "EUR" },
    cad: 2362.10,
    fx: 1.495,
    receipt: true,
    notes: "",
  },
  {
    id: "b7",
    type: "activity",
    title: "Sagrada Família",
    venue: "Basílica de la Sagrada Família",
    address: "Carrer de Mallorca 401, 08013 Barcelona",
    ticketUrl: "https://sagradafamilia.org/tickets",
    start: "2026-08-08T11:15",
    end:   "2026-08-08T13:00",
    tz: "Europe/Madrid",
    from: { label: "Sagrada Família", ...CITY.bcn, x: 0.523, y: 0.671 },
    confirmation: "SF-20088",
    price: { amount: 36.00, currency: "EUR" },
    cad: 53.82,
    fx: 1.495,
    receipt: false,
    notes: "Tower access ticket. Passport required at entry.",
  },
  {
    id: "b8",
    type: "activity",
    title: "Park Güell",
    venue: "Park Güell — Monumental Zone",
    address: "08024 Barcelona",
    ticketUrl: "https://parkguell.barcelona/",
    start: "2026-08-10T09:30",
    end:   "2026-08-10T12:00",
    tz: "Europe/Madrid",
    from: { label: "Park Güell", ...CITY.bcn, x: 0.521, y: 0.672 },
    confirmation: "PG-7733",
    price: { amount: 22.00, currency: "EUR" },
    cad: 32.89,
    fx: 1.495,
    receipt: false,
    notes: "",
  },
  {
    id: "b9",
    type: "train",
    title: "Barcelona → Madrid",
    operator: "Renfe AVE",
    trainNumber: "AVE 03162",
    coach: "Coche 5",
    seat: "12C",
    start: "2026-08-12T12:40",
    end:   "2026-08-12T15:10",
    tz: "Europe/Madrid",
    from: { label: "Barcelona Sants", ...CITY.bcn },
    to:   { label: "Madrid Atocha", ...CITY.mad },
    confirmation: "RF-88AA",
    price: { amount: 92.00, currency: "EUR" },
    cad: 137.54,
    fx: 1.495,
    receipt: true,
    notes: "",
  },
  {
    id: "b10",
    type: "hotel",
    title: "Hotel Único Madrid",
    address: "Calle de Claudio Coello 67, 28001 Madrid",
    roomType: "Deluxe King",
    start: "2026-08-12T15:30",
    end:   "2026-08-18T12:00",
    tz: "Europe/Madrid",
    from: { label: "Madrid, Salamanca", ...CITY.mad, x: 0.401, y: 0.738 },
    confirmation: "HU-11245",
    price: { amount: 1790.00, currency: "EUR" },
    cad: 2676.05,
    fx: 1.495,
    receipt: true,
    notes: "",
  },
  {
    id: "b11",
    type: "activity",
    title: "Museo del Prado",
    venue: "Museo Nacional del Prado",
    address: "C. de Ruiz de Alarcón 23, 28014 Madrid",
    ticketUrl: "https://www.museodelprado.es/",
    start: "2026-08-13T10:00",
    end:   "2026-08-13T13:30",
    tz: "Europe/Madrid",
    from: { label: "Museo del Prado", ...CITY.mad, x: 0.404, y: 0.742 },
    confirmation: "PR-2088",
    price: { amount: 15.00, currency: "EUR" },
    cad: 22.43,
    fx: 1.495,
    receipt: false,
    notes: "",
  },
  {
    id: "b12",
    type: "train",
    title: "Madrid → Seville",
    operator: "Renfe AVE",
    trainNumber: "AVE 02091",
    coach: "Coche 3",
    seat: "4A",
    start: "2026-08-18T13:05",
    end:   "2026-08-18T15:37",
    tz: "Europe/Madrid",
    from: { label: "Madrid Atocha", ...CITY.mad },
    to:   { label: "Seville Santa Justa", ...CITY.seville },
    confirmation: "RF-22BB",
    price: { amount: 68.00, currency: "EUR" },
    cad: 101.66,
    fx: 1.495,
    receipt: true,
    notes: "",
  },
  {
    id: "b13",
    type: "hotel",
    title: "Hotel Alfonso XIII",
    address: "C. San Fernando 2, 41004 Seville",
    roomType: "Classic Double",
    start: "2026-08-18T16:00",
    end:   "2026-08-22T11:00",
    tz: "Europe/Madrid",
    from: { label: "Seville", ...CITY.seville, x: 0.342, y: 0.821 },
    confirmation: "AX-55712",
    price: { amount: 1120.00, currency: "EUR" },
    cad: 1674.40,
    fx: 1.495,
    receipt: false,
    notes: "",
  },
  {
    id: "b14",
    type: "flight",
    title: "SVQ → YUL (via MAD)",
    airline: "Air Canada / Iberia",
    flightNumber: "IB 8450 · AC 837",
    seat: "22F",
    terminal: "T4",
    start: "2026-08-24T07:50",
    end:   "2026-08-24T16:10",
    tz: "Europe/Madrid",
    tzEnd: "America/Montreal",
    from: { label: "Seville SVQ", ...CITY.seville },
    to:   { label: "Montréal YUL", ...CITY.yul },
    confirmation: "A3K7XQ",
    price: { amount: 0, currency: "CAD" },
    cad: 0,
    receipt: true,
    notes: "Return segment of outbound booking.",
  },
];

// Helpers ----------------------------------------------------
const DAYS_IN_TRIP = () => {
  const ms = TRIP.end - TRIP.start;
  return Math.round(ms / 86400000) + 1;
};

const pad = (n) => String(n).padStart(2, "0");
const fmtDateISO = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

function dayList() {
  const out = [];
  for (let i = 0; i < DAYS_IN_TRIP(); i++) {
    const d = new Date(TRIP.start);
    d.setDate(d.getDate() + i);
    out.push({ idx: i+1, date: d, iso: fmtDateISO(d) });
  }
  return out;
}

function bookingsByDay() {
  const map = {};
  for (const b of BOOKINGS) {
    const iso = b.start.slice(0, 10);
    (map[iso] ||= []).push(b);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.start.localeCompare(b.start));
  }
  return map;
}

function totalCAD() {
  return BOOKINGS.reduce((s, b) => s + (b.cad || 0), 0);
}

function daysUntilTrip() {
  const ms = TRIP.start - TRIP.today;
  return Math.max(0, Math.ceil(ms / 86400000));
}

function fmtTime(iso) {
  const t = iso.slice(11, 16);
  return t;
}
function tzAbbr(tz) {
  if (!tz) return "";
  if (tz === "America/Montreal") return "EDT";
  if (tz === "Europe/Paris") return "CEST";
  if (tz === "Europe/Madrid") return "CEST";
  return "UTC";
}
function fmtDateLong(d) {
  const wk = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return { wk, mo, day: d.getDate() };
}
function fmtPrice(amount, currency) {
  if (!amount) return "—";
  const sym = { CAD: "$", USD: "$", EUR: "€", GBP: "£", CHF: "CHF " }[currency] || "";
  return `${sym}${amount.toFixed(2)}`;
}
function fmtCAD(amount) {
  if (!amount) return "—";
  return `CA$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

Object.assign(window, {
  TRIP, TYPE_META, CITY, BOOKINGS,
  dayList, bookingsByDay, totalCAD, daysUntilTrip,
  fmtTime, tzAbbr, fmtDateLong, fmtPrice, fmtCAD, fmtDateISO,
});
