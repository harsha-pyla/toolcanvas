// =========================================
// ToolCanvas — Real Place Generator Script
// Real places, country filter, trip/beautiful tags, map links
// Archetype B — Generate with list of results
// =========================================

const REAL_PLACES = [
  // United States (12)
  {name:"Grand Canyon", state:"Arizona", country:"United States", categories:["trip","beautiful"]},
  {name:"Yellowstone National Park", state:"Wyoming", country:"United States", categories:["trip","beautiful"]},
  {name:"Times Square", state:"New York", country:"United States", categories:["trip"]},
  {name:"Golden Gate Bridge", state:"California", country:"United States", categories:["trip","beautiful"]},
  {name:"Waikiki Beach", state:"Hawaii", country:"United States", categories:["trip","beautiful"]},
  {name:"Antelope Canyon", state:"Arizona", country:"United States", categories:["beautiful"]},
  {name:"Yosemite Valley", state:"California", country:"United States", categories:["trip","beautiful"]},
  {name:"Miami Beach", state:"Florida", country:"United States", categories:["trip","beautiful"]},
  {name:"Nashville Broadway", state:"Tennessee", country:"United States", categories:["trip"]},
  {name:"Chicago Riverwalk", state:"Illinois", country:"United States", categories:["trip"]},
  {name:"Glacier National Park", state:"Montana", country:"United States", categories:["beautiful","trip"]},
  {name:"New Orleans French Quarter", state:"Louisiana", country:"United States", categories:["trip"]},
  // Canada (7)
  {name:"Banff National Park", state:"Alberta", country:"Canada", categories:["trip","beautiful"]},
  {name:"Niagara Falls", state:"Ontario", country:"Canada", categories:["trip","beautiful"]},
  {name:"Old Quebec", state:"Quebec", country:"Canada", categories:["trip","beautiful"]},
  {name:"Stanley Park", state:"British Columbia", country:"Canada", categories:["trip","beautiful"]},
  {name:"CN Tower", state:"Ontario", country:"Canada", categories:["trip"]},
  {name:"Lake Louise", state:"Alberta", country:"Canada", categories:["beautiful"]},
  {name:"Peggy's Cove", state:"Nova Scotia", country:"Canada", categories:["beautiful","trip"]},
  // United Kingdom (7)
  {name:"Tower of London", state:"England", country:"United Kingdom", categories:["trip"]},
  {name:"Edinburgh Castle", state:"Scotland", country:"United Kingdom", categories:["trip","beautiful"]},
  {name:"Stonehenge", state:"England", country:"United Kingdom", categories:["trip"]},
  {name:"Lake District", state:"England", country:"United Kingdom", categories:["beautiful"]},
  {name:"Giant's Causeway", state:"Northern Ireland", country:"United Kingdom", categories:["beautiful","trip"]},
  {name:"Cotswolds", state:"England", country:"United Kingdom", categories:["beautiful","trip"]},
  {name:"Oxford University", state:"England", country:"United Kingdom", categories:["trip"]},
  // France (7)
  {name:"Eiffel Tower", state:"Île-de-France", country:"France", categories:["trip"]},
  {name:"Mont Saint-Michel", state:"Normandy", country:"France", categories:["trip","beautiful"]},
  {name:"Palace of Versailles", state:"Île-de-France", country:"France", categories:["trip"]},
  {name:"French Riviera", state:"Provence-Alpes-Côte d'Azur", country:"France", categories:["trip","beautiful"]},
  {name:"Loire Valley", state:"Centre-Val de Loire", country:"France", categories:["beautiful","trip"]},
  {name:"Chamonix", state:"Auvergne-Rhône-Alpes", country:"France", categories:["beautiful","trip"]},
  {name:"Annecy Old Town", state:"Auvergne-Rhône-Alpes", country:"France", categories:["beautiful","trip"]},
  // Italy (7)
  {name:"Colosseum", state:"Lazio", country:"Italy", categories:["trip"]},
  {name:"Venice Canals", state:"Veneto", country:"Italy", categories:["trip","beautiful"]},
  {name:"Amalfi Coast", state:"Campania", country:"Italy", categories:["trip","beautiful"]},
  {name:"Cinque Terre", state:"Liguria", country:"Italy", categories:["beautiful","trip"]},
  {name:"Florence Duomo", state:"Tuscany", country:"Italy", categories:["trip"]},
  {name:"Dolomites", state:"Trentino-Alto Adige", country:"Italy", categories:["beautiful"]},
  {name:"Lake Como", state:"Lombardy", country:"Italy", categories:["beautiful","trip"]},
  // Spain (6)
  {name:"Sagrada Família", state:"Catalonia", country:"Spain", categories:["trip"]},
  {name:"Alhambra", state:"Andalusia", country:"Spain", categories:["trip","beautiful"]},
  {name:"Seville Cathedral", state:"Andalusia", country:"Spain", categories:["trip"]},
  {name:"Park Güell", state:"Catalonia", country:"Spain", categories:["trip","beautiful"]},
  {name:"Ibiza Old Town", state:"Balearic Islands", country:"Spain", categories:["trip","beautiful"]},
  {name:"Santiago de Compostela", state:"Galicia", country:"Spain", categories:["trip"]},
  // Germany (6)
  {name:"Neuschwanstein Castle", state:"Bavaria", country:"Germany", categories:["trip","beautiful"]},
  {name:"Brandenburg Gate", state:"Berlin", country:"Germany", categories:["trip"]},
  {name:"Black Forest", state:"Baden-Württemberg", country:"Germany", categories:["beautiful","trip"]},
  {name:"Cologne Cathedral", state:"North Rhine-Westphalia", country:"Germany", categories:["trip"]},
  {name:"Heidelberg Old Town", state:"Baden-Württemberg", country:"Germany", categories:["trip","beautiful"]},
  {name:"Hamburg Harbor", state:"Hamburg", country:"Germany", categories:["trip"]},
  // Japan (7)
  {name:"Mount Fuji", state:"Shizuoka", country:"Japan", categories:["beautiful","trip"]},
  {name:"Fushimi Inari Shrine", state:"Kyoto", country:"Japan", categories:["trip","beautiful"]},
  {name:"Shibuya Crossing", state:"Tokyo", country:"Japan", categories:["trip"]},
  {name:"Arashiyama Bamboo Grove", state:"Kyoto", country:"Japan", categories:["beautiful","trip"]},
  {name:"Osaka Castle", state:"Osaka", country:"Japan", categories:["trip"]},
  {name:"Hiroshima Peace Memorial", state:"Hiroshima", country:"Japan", categories:["trip"]},
  {name:"Nara Deer Park", state:"Nara", country:"Japan", categories:["trip","beautiful"]},
  // China (6)
  {name:"Great Wall", state:"Beijing", country:"China", categories:["trip"]},
  {name:"Forbidden City", state:"Beijing", country:"China", categories:["trip"]},
  {name:"Zhangjiajie National Park", state:"Hunan", country:"China", categories:["beautiful","trip"]},
  {name:"West Lake", state:"Zhejiang", country:"China", categories:["beautiful","trip"]},
  {name:"Terracotta Army", state:"Shaanxi", country:"China", categories:["trip"]},
  {name:"Li River", state:"Guangxi", country:"China", categories:["beautiful","trip"]},
  // India (7)
  {name:"Taj Mahal", state:"Uttar Pradesh", country:"India", categories:["trip"]},
  {name:"Jaipur Pink City", state:"Rajasthan", country:"India", categories:["trip","beautiful"]},
  {name:"Kerala Backwaters", state:"Kerala", country:"India", categories:["beautiful","trip"]},
  {name:"Varanasi Ghats", state:"Uttar Pradesh", country:"India", categories:["trip","beautiful"]},
  {name:"Leh Ladakh", state:"Ladakh", country:"India", categories:["beautiful","trip"]},
  {name:"Goa Beaches", state:"Goa", country:"India", categories:["trip","beautiful"]},
  {name:"Mysore Palace", state:"Karnataka", country:"India", categories:["trip"]},
  // Australia (6)
  {name:"Sydney Opera House", state:"New South Wales", country:"Australia", categories:["trip"]},
  {name:"Great Barrier Reef", state:"Queensland", country:"Australia", categories:["beautiful","trip"]},
  {name:"Uluru", state:"Northern Territory", country:"Australia", categories:["trip","beautiful"]},
  {name:"Melbourne Laneways", state:"Victoria", country:"Australia", categories:["trip"]},
  {name:"Blue Mountains", state:"New South Wales", country:"Australia", categories:["beautiful","trip"]},
  {name:"Bondi Beach", state:"New South Wales", country:"Australia", categories:["trip","beautiful"]},
  // Brazil (5)
  {name:"Christ the Redeemer", state:"Rio de Janeiro", country:"Brazil", categories:["trip"]},
  {name:"Iguazu Falls", state:"Paraná", country:"Brazil", categories:["beautiful","trip"]},
  {name:"Copacabana Beach", state:"Rio de Janeiro", country:"Brazil", categories:["trip","beautiful"]},
  {name:"Amazon Rainforest", state:"Amazonas", country:"Brazil", categories:["beautiful","trip"]},
  {name:"Salvador Pelourinho", state:"Bahia", country:"Brazil", categories:["trip"]},
  // Mexico (5)
  {name:"Chichen Itza", state:"Yucatán", country:"Mexico", categories:["trip"]},
  {name:"Tulum Ruins", state:"Quintana Roo", country:"Mexico", categories:["trip","beautiful"]},
  {name:"Mexico City Zocalo", state:"Mexico City", country:"Mexico", categories:["trip"]},
  {name:"Cabo San Lucas", state:"Baja California Sur", country:"Mexico", categories:["trip","beautiful"]},
  {name:"Oaxaca Historic Center", state:"Oaxaca", country:"Mexico", categories:["trip","beautiful"]},
  // Thailand (5)
  {name:"Grand Palace", state:"Bangkok", country:"Thailand", categories:["trip"]},
  {name:"Phi Phi Islands", state:"Krabi", country:"Thailand", categories:["beautiful","trip"]},
  {name:"Chiang Mai Old City", state:"Chiang Mai", country:"Thailand", categories:["trip","beautiful"]},
  {name:"Ayutthaya Temples", state:"Phra Nakhon Si Ayutthaya", country:"Thailand", categories:["trip"]},
  {name:"Railay Beach", state:"Krabi", country:"Thailand", categories:["beautiful","trip"]},
  // Greece (5)
  {name:"Santorini", state:"South Aegean", country:"Greece", categories:["trip","beautiful"]},
  {name:"Acropolis", state:"Attica", country:"Greece", categories:["trip"]},
  {name:"Meteora", state:"Thessaly", country:"Greece", categories:["beautiful","trip"]},
  {name:"Mykonos Town", state:"South Aegean", country:"Greece", categories:["trip","beautiful"]},
  {name:"Navagio Beach", state:"Ionian Islands", country:"Greece", categories:["beautiful","trip"]},
  // Turkey (5)
  {name:"Hagia Sophia", state:"Istanbul", country:"Turkey", categories:["trip"]},
  {name:"Cappadocia", state:"Nevşehir", country:"Turkey", categories:["beautiful","trip"]},
  {name:"Pamukkale", state:"Denizli", country:"Turkey", categories:["beautiful","trip"]},
  {name:"Ephesus", state:"Izmir", country:"Turkey", categories:["trip"]},
  {name:"Bodrum Marina", state:"Muğla", country:"Turkey", categories:["trip","beautiful"]},
  // Egypt (4)
  {name:"Pyramids of Giza", state:"Giza", country:"Egypt", categories:["trip"]},
  {name:"Luxor Temple", state:"Luxor", country:"Egypt", categories:["trip"]},
  {name:"Nile River Cruise", state:"Cairo", country:"Egypt", categories:["trip","beautiful"]},
  {name:"Abu Simbel", state:"Aswan", country:"Egypt", categories:["trip"]},
  // United Arab Emirates (4)
  {name:"Burj Khalifa", state:"Dubai", country:"United Arab Emirates", categories:["trip"]},
  {name:"Sheikh Zayed Mosque", state:"Abu Dhabi", country:"United Arab Emirates", categories:["trip","beautiful"]},
  {name:"Dubai Marina", state:"Dubai", country:"United Arab Emirates", categories:["trip"]},
  {name:"Al Fahidi Quarter", state:"Dubai", country:"United Arab Emirates", categories:["trip","beautiful"]},
  // Switzerland (5)
  {name:"Zermatt & Matterhorn", state:"Valais", country:"Switzerland", categories:["beautiful","trip"]},
  {name:"Lake Geneva", state:"Vaud", country:"Switzerland", categories:["beautiful","trip"]},
  {name:"Lucerne Chapel Bridge", state:"Lucerne", country:"Switzerland", categories:["trip","beautiful"]},
  {name:"Interlaken", state:"Bern", country:"Switzerland", categories:["beautiful","trip"]},
  {name:"Jungfraujoch", state:"Bern", country:"Switzerland", categories:["beautiful","trip"]},
  // Austria (4)
  {name:"Schönbrunn Palace", state:"Vienna", country:"Austria", categories:["trip"]},
  {name:"Hallstatt Village", state:"Upper Austria", country:"Austria", categories:["beautiful","trip"]},
  {name:"Salzburg Old Town", state:"Salzburg", country:"Austria", categories:["trip","beautiful"]},
  {name:"Innsbruck Alps", state:"Tyrol", country:"Austria", categories:["beautiful","trip"]},
  // Netherlands (4)
  {name:"Amsterdam Canals", state:"North Holland", country:"Netherlands", categories:["trip","beautiful"]},
  {name:"Keukenhof Gardens", state:"South Holland", country:"Netherlands", categories:["beautiful","trip"]},
  {name:"Zaanse Schans", state:"North Holland", country:"Netherlands", categories:["trip","beautiful"]},
  {name:"Rotterdam Markthal", state:"South Holland", country:"Netherlands", categories:["trip"]},
  // Portugal (5)
  {name:"Belém Tower", state:"Lisbon", country:"Portugal", categories:["trip"]},
  {name:"Porto Ribeira", state:"Porto", country:"Portugal", categories:["trip","beautiful"]},
  {name:"Algarve Cliffs", state:"Algarve", country:"Portugal", categories:["beautiful","trip"]},
  {name:"Sintra Palaces", state:"Lisbon", country:"Portugal", categories:["trip","beautiful"]},
  {name:"Douro Valley", state:"Porto", country:"Portugal", categories:["beautiful","trip"]},
  // Norway (5)
  {name:"Geirangerfjord", state:"Møre og Romsdal", country:"Norway", categories:["beautiful","trip"]},
  {name:"Tromsø Arctic", state:"Troms", country:"Norway", categories:["trip","beautiful"]},
  {name:"Bergen Bryggen", state:"Vestland", country:"Norway", categories:["trip","beautiful"]},
  {name:"Oslo Opera House", state:"Oslo", country:"Norway", categories:["trip"]},
  {name:"Lofoten Islands", state:"Nordland", country:"Norway", categories:["beautiful","trip"]},
  // Sweden (4)
  {name:"Stockholm Old Town", state:"Stockholm", country:"Sweden", categories:["trip","beautiful"]},
  {name:"Vasa Museum", state:"Stockholm", country:"Sweden", categories:["trip"]},
  {name:"Kiruna Icehotel", state:"Norrbotten", country:"Sweden", categories:["trip","beautiful"]},
  {name:"Gothenburg Archipelago", state:"Västra Götaland", country:"Sweden", categories:["beautiful","trip"]},
  // Iceland (4)
  {name:"Blue Lagoon", state:"Reykjanesbær", country:"Iceland", categories:["trip","beautiful"]},
  {name:"Golden Circle", state:"South", country:"Iceland", categories:["trip","beautiful"]},
  {name:"Reykjavik Hallgrímskirkja", state:"Capital Region", country:"Iceland", categories:["trip"]},
  {name:"Jökulsárlón Glacier Lagoon", state:"East", country:"Iceland", categories:["beautiful","trip"]},
  // Ireland (4)
  {name:"Cliffs of Moher", state:"Clare", country:"Ireland", categories:["beautiful","trip"]},
  {name:"Dublin Temple Bar", state:"Dublin", country:"Ireland", categories:["trip"]},
  {name:"Giant's Causeway", state:"Antrim", country:"Ireland", categories:["beautiful","trip"]},
  {name:"Galway Old Town", state:"Galway", country:"Ireland", categories:["trip","beautiful"]},
  // Morocco (4)
  {name:"Marrakech Medina", state:"Marrakesh-Safi", country:"Morocco", categories:["trip"]},
  {name:"Chefchaouen", state:"Tanger-Tetouan", country:"Morocco", categories:["beautiful","trip"]},
  {name:"Sahara Dunes", state:"Drâa-Tafilalet", country:"Morocco", categories:["beautiful","trip"]},
  {name:"Fes Old City", state:"Fes-Meknes", country:"Morocco", categories:["trip"]},
  // South Africa (5)
  {name:"Table Mountain", state:"Western Cape", country:"South Africa", categories:["trip","beautiful"]},
  {name:"Kruger National Park", state:"Limpopo", country:"South Africa", categories:["trip","beautiful"]},
  {name:"Cape Winelands", state:"Western Cape", country:"South Africa", categories:["beautiful","trip"]},
  {name:"Robben Island", state:"Western Cape", country:"South Africa", categories:["trip"]},
  {name:"Boulders Beach Penguins", state:"Western Cape", country:"South Africa", categories:["trip","beautiful"]},
  // Kenya (3)
  {name:"Maasai Mara", state:"Narok", country:"Kenya", categories:["beautiful","trip"]},
  {name:"Diani Beach", state:"Kwale", country:"Kenya", categories:["beautiful","trip"]},
  {name:"Nairobi National Park", state:"Nairobi", country:"Kenya", categories:["trip"]},
  // Tanzania (3)
  {name:"Serengeti", state:"Mara", country:"Tanzania", categories:["beautiful","trip"]},
  {name:"Zanzibar Stone Town", state:"Zanzibar", country:"Tanzania", categories:["trip","beautiful"]},
  {name:"Mount Kilimanjaro", state:"Kilimanjaro", country:"Tanzania", categories:["beautiful","trip"]},
  // Peru (4)
  {name:"Machu Picchu", state:"Cusco", country:"Peru", categories:["trip"]},
  {name:"Sacred Valley", state:"Cusco", country:"Peru", categories:["beautiful","trip"]},
  {name:"Lima Historic Center", state:"Lima", country:"Peru", categories:["trip"]},
  {name:"Rainbow Mountain", state:"Cusco", country:"Peru", categories:["beautiful","trip"]},
  // Argentina (4)
  {name:"Iguazu Falls Argentina", state:"Misiones", country:"Argentina", categories:["beautiful","trip"]},
  {name:"Perito Moreno Glacier", state:"Santa Cruz", country:"Argentina", categories:["beautiful","trip"]},
  {name:"Buenos Aires La Boca", state:"Buenos Aires", country:"Argentina", categories:["trip"]},
  {name:"Mendoza Vineyards", state:"Mendoza", country:"Argentina", categories:["trip","beautiful"]},
  // Chile (4)
  {name:"Atacama Desert", state:"Antofagasta", country:"Chile", categories:["beautiful","trip"]},
  {name:"Torres del Paine", state:"Magallanes", country:"Chile", categories:["beautiful","trip"]},
  {name:"Valparaiso Hills", state:"Valparaíso", country:"Chile", categories:["trip","beautiful"]},
  {name:"Santiago Plaza de Armas", state:"Santiago", country:"Chile", categories:["trip"]},
  // Colombia (3)
  {name:"Cartagena Walled City", state:"Bolívar", country:"Colombia", categories:["trip","beautiful"]},
  {name:"Medellín Comuna 13", state:"Antioquia", country:"Colombia", categories:["trip"]},
  {name:"Tayrona National Park", state:"Magdalena", country:"Colombia", categories:["beautiful","trip"]},
  // Vietnam (4)
  {name:"Ha Long Bay", state:"Quảng Ninh", country:"Vietnam", categories:["beautiful","trip"]},
  {name:"Hoi An Ancient Town", state:"Quảng Nam", country:"Vietnam", categories:["trip","beautiful"]},
  {name:"Ho Chi Minh City", state:"Ho Chi Minh City", country:"Vietnam", categories:["trip"]},
  {name:"Sapa Terraces", state:"Lào Cai", country:"Vietnam", categories:["beautiful","trip"]},
  // Indonesia (5)
  {name:"Bali Ubud", state:"Bali", country:"Indonesia", categories:["trip","beautiful"]},
  {name:"Komodo Island", state:"East Nusa Tenggara", country:"Indonesia", categories:["trip","beautiful"]},
  {name:"Borobudur Temple", state:"Central Java", country:"Indonesia", categories:["trip"]},
  {name:"Raja Ampat", state:"West Papua", country:"Indonesia", categories:["beautiful","trip"]},
  {name:"Jakarta Old Town", state:"Jakarta", country:"Indonesia", categories:["trip"]},
  // Philippines (4)
  {name:"El Nido Palawan", state:"Palawan", country:"Philippines", categories:["beautiful","trip"]},
  {name:"Boracay White Beach", state:"Aklan", country:"Philippines", categories:["trip","beautiful"]},
  {name:"Chocolate Hills", state:"Bohol", country:"Philippines", categories:["beautiful","trip"]},
  {name:"Intramuros Manila", state:"Manila", country:"Philippines", categories:["trip"]},
  // Singapore (3)
  {name:"Marina Bay Sands", state:"Central Region", country:"Singapore", categories:["trip"]},
  {name:"Gardens by the Bay", state:"Central Region", country:"Singapore", categories:["trip","beautiful"]},
  {name:"Sentosa Island", state:"South West", country:"Singapore", categories:["trip","beautiful"]},
  // Malaysia (4)
  {name:"Petronas Towers", state:"Kuala Lumpur", country:"Malaysia", categories:["trip"]},
  {name:"Langkawi Sky Bridge", state:"Kedah", country:"Malaysia", categories:["trip","beautiful"]},
  {name:"Georgetown Penang", state:"Penang", country:"Malaysia", categories:["trip","beautiful"]},
  {name:"Borneo Rainforest", state:"Sabah", country:"Malaysia", categories:["beautiful","trip"]},
  // South Korea (4)
  {name:"Gyeongbokgung Palace", state:"Seoul", country:"South Korea", categories:["trip"]},
  {name:"Jeju Island", state:"Jeju", country:"South Korea", categories:["beautiful","trip"]},
  {name:"Busan Haeundae Beach", state:"Busan", country:"South Korea", categories:["trip","beautiful"]},
  {name:"Bukchon Hanok Village", state:"Seoul", country:"South Korea", categories:["trip","beautiful"]},
  // New Zealand (5)
  {name:"Milford Sound", state:"Southland", country:"New Zealand", categories:["beautiful","trip"]},
  {name:"Queenstown", state:"Otago", country:"New Zealand", categories:["trip","beautiful"]},
  {name:"Hobbiton", state:"Waikato", country:"New Zealand", categories:["trip"]},
  {name:"Rotorua Geothermal", state:"Bay of Plenty", country:"New Zealand", categories:["trip","beautiful"]},
  {name:"Auckland Harbour", state:"Auckland", country:"New Zealand", categories:["trip"]},
  // Croatia (3)
  {name:"Dubrovnik Old Town", state:"Dubrovnik-Neretva", country:"Croatia", categories:["trip","beautiful"]},
  {name:"Plitvice Lakes", state:"Lika-Senj", country:"Croatia", categories:["beautiful","trip"]},
  {name:"Split Diocletian Palace", state:"Split-Dalmatia", country:"Croatia", categories:["trip"]},
  // Czech Republic (3)
  {name:"Prague Old Town", state:"Prague", country:"Czech Republic", categories:["trip","beautiful"]},
  {name:"Charles Bridge", state:"Prague", country:"Czech Republic", categories:["trip"]},
  {name:"Český Krumlov", state:"South Bohemian", country:"Czech Republic", categories:["trip","beautiful"]},
  // Poland (3)
  {name:"Krakow Main Square", state:"Lesser Poland", country:"Poland", categories:["trip"]},
  {name:"Warsaw Old Town", state:"Masovia", country:"Poland", categories:["trip"]},
  {name:"Zakopane Mountains", state:"Lesser Poland", country:"Poland", categories:["beautiful","trip"]},
  // Belgium (2)
  {name:"Bruges Canals", state:"West Flanders", country:"Belgium", categories:["trip","beautiful"]},
  {name:"Brussels Grand Place", state:"Brussels", country:"Belgium", categories:["trip"]},
  // Denmark (2)
  {name:"Nyhavn Copenhagen", state:"Capital Region", country:"Denmark", categories:["trip","beautiful"]},
  {name:"Tivoli Gardens", state:"Capital Region", country:"Denmark", categories:["trip"]},
  // Finland (2)
  {name:"Helsinki Cathedral", state:"Uusimaa", country:"Finland", categories:["trip"]},
  {name:"Lapland Northern Lights", state:"Lapland", country:"Finland", categories:["beautiful","trip"]},
  // Russia (3)
  {name:"Red Square", state:"Moscow", country:"Russia", categories:["trip"]},
  {name:"Hermitage Museum", state:"Saint Petersburg", country:"Russia", categories:["trip"]},
  {name:"Lake Baikal", state:"Irkutsk", country:"Russia", categories:["beautiful","trip"]},
  // Other notable
  {name:"Petra", state:"Ma'an", country:"Jordan", categories:["trip","beautiful"]},
  {name:"Dubai Desert Safari", state:"Dubai", country:"United Arab Emirates", categories:["trip","beautiful"]},
  {name:"Victoria Falls", state:"Livingstone", country:"Zambia", categories:["beautiful","trip"]},
  {name:"Angkor Wat", state:"Siem Reap", country:"Cambodia", categories:["trip"]},
  {name:"Bora Bora", state:"Society Islands", country:"French Polynesia", categories:["beautiful","trip"]},
  {name:"Santorini Oia", state:"South Aegean", country:"Greece", categories:["beautiful","trip"]},
  {name:"Hallstatt Lake", state:"Upper Austria", country:"Austria", categories:["beautiful","trip"]},
  {name:"Cinque Terre Viewpoint", state:"Liguria", country:"Italy", categories:["beautiful","trip"]}
];

// DOM Elements
const countrySelect = document.getElementById("country-select");
const chkBeautiful = document.getElementById("chk-beautiful");
const chkTrip = document.getElementById("chk-trip");
const placeCount = document.getElementById("place-count");
const countVal = document.getElementById("count-val");
const generateBtn = document.getElementById("generate-btn");
const namesList = document.getElementById("names-list");
const copyBtn = document.getElementById("copy-names-btn");
const downloadBtn = document.getElementById("download-names-btn");
const copyTooltip = document.getElementById("copy-tooltip");
const copyLive = document.getElementById("copy-live");

let currentResults = [];

// Secure random
function getSecureRandomInt(max) {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
}
function shuffleSecure(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function initCountries() {
  const countries = [...new Set(REAL_PLACES.map(p => p.country))].sort((a,b) => a.localeCompare(b));
  countries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    countrySelect.appendChild(opt);
  });
}
function mapLink(place) {
  const query = `${place.name}, ${place.state}, ${place.country}`;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}
function getFiltered() {
  const country = countrySelect.value;
  const wantsBeautiful = chkBeautiful.checked;
  const wantsTrip = chkTrip.checked;
  let filtered = REAL_PLACES;
  if (country !== "Any") filtered = filtered.filter(p => p.country === country);
  if (wantsBeautiful || wantsTrip) {
    const wanted = [];
    if (wantsBeautiful) wanted.push("beautiful");
    if (wantsTrip) wanted.push("trip");
    filtered = filtered.filter(p => p.categories.some(c => wanted.includes(c)));
  }
  return filtered;
}
function updateRangeFill(el) {
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  const val = parseFloat(el.value);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty("--fill", pct + "%");
}
function iconCopySVG() {
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="1.2"/><path d="M15 9V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/></svg>';
}
function iconCheckSVG() {
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
}
function generatePlaces() {
  const count = parseInt(placeCount.value, 10);
  const filtered = getFiltered();
  namesList.innerHTML = "";
  currentResults = [];
  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "names-empty";
    li.textContent = "No places match this filter. Try checking both categories or selecting “Any Country”.";
    namesList.appendChild(li);
    return;
  }
  const shuffled = shuffleSecure(filtered);
  const take = Math.min(count, shuffled.length);
  const seen = new Set();
  const picks = [];
  for (const p of shuffled) {
    const key = p.name + "|" + p.country;
    if (seen.has(key)) continue;
    seen.add(key); picks.push(p);
    if (picks.length >= take) break;
  }
  currentResults = picks;
  picks.forEach((place, idx) => {
    const li = document.createElement("li");
    li.className = "place-card";
    const stagger = Math.min(idx, 6);
    if (stagger < 6) {
      li.classList.add("is-animating");
      li.style.animationDelay = (stagger * 40) + "ms";
    }

    const main = document.createElement("div");
    main.className = "place-card-main";

    const nameEl = document.createElement("div");
    nameEl.className = "place-name";
    nameEl.textContent = place.name;

    const locEl = document.createElement("div");
    locEl.className = "place-loc";
    locEl.textContent = place.state + ", " + place.country;

    const tags = document.createElement("div");
    tags.className = "place-tags";
    place.categories.forEach(cat => {
      const span = document.createElement("span");
      span.className = "tag " + (cat === "beautiful" ? "tag-beautiful" : "tag-trip");
      span.textContent = cat === "beautiful" ? "Beautiful" : "Trip";
      tags.appendChild(span);
    });

    main.appendChild(nameEl);
    main.appendChild(locEl);
    main.appendChild(tags);

    const actions = document.createElement("div");
    actions.className = "place-card-actions";

    const a = document.createElement("a");
    a.href = mapLink(place);
    a.target = "_blank"; a.rel = "noopener";
    a.className = "map-link";
    a.textContent = "View on Map \u2192";

    const copyOne = document.createElement("button");
    copyOne.type = "button";
    copyOne.className = "place-copy";
    copyOne.setAttribute("aria-label", "Copy " + place.name);
    copyOne.innerHTML = iconCopySVG();
    let copyTimer;
    copyOne.addEventListener("click", () => {
      const text = `${place.name}, ${place.state}, ${place.country} — ${mapLink(place)}`;
      navigator.clipboard.writeText(text).then(() => {
        copyOne.innerHTML = iconCheckSVG();
        copyOne.classList.add("copied");
        if (copyLive) copyLive.textContent = "Copied " + place.name;
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
          copyOne.innerHTML = iconCopySVG();
          copyOne.classList.remove("copied");
        }, 1200);
      });
    });

    actions.appendChild(a);
    actions.appendChild(copyOne);

    li.appendChild(main);
    li.appendChild(actions);
    namesList.appendChild(li);
  });
}
function copyAll() {
  if (currentResults.length === 0) return;
  const text = currentResults.map(p => `${p.name}, ${p.state}, ${p.country} — ${mapLink(p)}`).join("\r\n");
  const originalHTML = copyBtn.innerHTML;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = iconCheckSVG() + '<span class="tooltip show">Copied!</span>';
    copyBtn.classList.add("copied");
    if (copyLive) copyLive.textContent = "Copied " + currentResults.length + " places";
    if (copyTooltip) { copyTooltip.classList.add("show"); }
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove("copied");
      if (copyTooltip) copyTooltip.classList.remove("show");
    }, 1200);
    setTimeout(() => copyBtn.classList.remove("copied"), 200);
  });
}
function downloadAll() {
  if (currentResults.length === 0) return;
  const text = currentResults.map(p => `${p.name}, ${p.state}, ${p.country} — ${mapLink(p)}`).join("\r\n");
  const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "toolcanvas_places.txt";
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-question");
    const ans = item.querySelector(".faq-answer");
    if (!btn || !ans) return;
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
}
window.addEventListener("DOMContentLoaded", () => {
  initCountries();
  updateRangeFill(placeCount);
  placeCount.addEventListener("input", e => {
    countVal.textContent = e.target.value;
    updateRangeFill(e.target);
  });
  generateBtn.addEventListener("click", generatePlaces);
  copyBtn.addEventListener("click", copyAll);
  downloadBtn.addEventListener("click", downloadAll);
  initFAQ();
  generatePlaces();
});
