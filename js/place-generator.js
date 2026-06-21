/* =========================================
   ToolCanvas — Random Place Name Generator
   Client-side name generator and dataset
   ========================================= */

const PLACES_DATA = {
  cities: [
    "Tokyo", "Paris", "New York City", "London", "Sydney", "Rome", "Cairo", "Mumbai", 
    "Rio de Janeiro", "Toronto", "Berlin", "Dubai", "Cape Town", "Bangkok", "Seoul", 
    "Kyoto", "Amsterdam", "Vienna", "Barcelona", "Prague", "San Francisco", "Vancouver", 
    "Reykjavik", "Singapore", "Venice", "Florence", "Istanbul", "Athens", "Buenos Aires", 
    "Lisbon", "Dublin", "Stockholm", "Oslo", "Copenhagen", "Helsinki", "Chicago", 
    "Los Angeles", "Shanghai", "Beijing", "Hong Kong", "Kuala Lumpur", "Budapest", 
    "Warsaw", "Brussels", "Edinburgh", "Marrakesh", "Nairobi", "Lima", "Santiago", 
    "Bogota", "Mexico City", "Montreal", "Munich", "Milan", "Madrid", "Melbourne", 
    "Auckland", "Manila", "Jakarta", "New Delhi", "Moscow", "St. Petersburg", 
    "Johannesburg", "Lagos", "Casablanca", "Sao Paulo", "Caracas", "Quito", 
    "Havana", "Panama City", "Seattle", "Miami", "Boston", "Philadelphia", 
    "Washington D.C.", "Austin", "Dallas", "Houston", "Denver", "Las Vegas", 
    "Honolulu", "Anchorage", "Calgary", "Manchester", "Birmingham", "Glasgow", 
    "Belfast", "Marseille", "Lyon", "Nice", "Geneva", "Zurich", "Antwerp", 
    "Rotterdam", "Frankfurt", "Hamburg", "Cologne", "Salzburg", "Naples", 
    "Seville", "Valencia", "Porto", "Thessaloniki", "Ankara", "Izmir", 
    "Kyiv", "Krakow", "Bucharest", "Sofia", "Belgrade", "Zagreb", "Riyadh", 
    "Jeddah", "Doha", "Manama", "Muscat", "Kuwait City", "Tehran", "Baghdad", 
    "Damascus", "Beirut", "Amman", "Jerusalem", "Tel Aviv", "Alexandria", 
    "Giza", "Rabat", "Tunis", "Algiers", "Tripoli", "Khartoum", "Mombasa", 
    "Addis Ababa", "Dar es Salaam", "Kampala", "Kigali", "Lusaka", "Harare", 
    "Windhoek", "Gaborone", "Maputo", "Luanda", "Kinshasa", "Brazzaville", 
    "Abuja", "Accra", "Dakar", "Abidjan", "Antananarivo", "Port Louis", 
    "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", 
    "Karachi", "Lahore", "Islamabad", "Dhaka", "Colombo", "Kathmandu", 
    "Thimphu", "Kabul", "Tashkent", "Almaty", "Nur-Sultan", "Ashgabat", 
    "Dushanbe", "Bishkek", "Ulaanbaatar", "Guangzhou", "Shenzhen", "Chengdu", 
    "Chongqing", "Wuhan", "Xian", "Nanjing", "Hangzhou", "Taipei", "Kaohsiung", 
    "Busan", "Incheon", "Daegu", "Osaka", "Nagoya", "Yokohama", "Kobe", 
    "Sapporo", "Fukuoka", "Hiroshima", "Sendai", "Chiang Mai", "Phuket", 
    "George Town", "Johor Bahru", "Surabaya", "Bandung", "Medan", "Denpasar", 
    "Quezon City", "Cebu City", "Davao City", "Hanoi", "Ho Chi Minh City", 
    "Da Nang", "Phnom Penh", "Siem Reap", "Vientiane", "Yangon", "Naypyidaw", 
    "Bandar Seri Begawan", "Dili", "Brisbane", "Perth", "Adelaide", "Hobart", 
    "Darwin", "Canberra", "Wellington", "Christchurch", "Queenstown", "Suva", 
    "Port Moresby", "Apia", "Nuku'alofa"
  ],
  countries: [
    "Japan", "France", "United States", "United Kingdom", "Australia", "Italy", "Egypt", 
    "India", "Brazil", "Canada", "Germany", "United Arab Emirates", "South Africa", 
    "Thailand", "South Korea", "Netherlands", "Austria", "Spain", "Czech Republic", 
    "Switzerland", "Argentina", "Portugal", "Ireland", "Sweden", "Norway", "Denmark", 
    "Finland", "Greece", "Turkey", "New Zealand", "Singapore", "Iceland", "Peru", 
    "Chile", "Colombia", "Mexico", "Vietnam", "Indonesia", "Malaysia", "Philippines", 
    "Morocco", "Kenya", "Poland", "Hungary", "Belgium", "China", "Afghanistan", 
    "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Armenia", 
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", 
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
    "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", 
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Djibouti", "Dominica", 
    "Dominican Republic", "Ecuador", "El Salvador", "Equatorial Guinea", 
    "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Gabon", "Gambia", 
    "Georgia", "Ghana", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
    "Guyana", "Haiti", "Honduras", "Iran", "Iraq", "Israel", "Jamaica", 
    "Jordan", "Kazakhstan", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", 
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", 
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Maldives", "Mali", 
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Micronesia", 
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Mozambique", "Myanmar", 
    "Namibia", "Nauru", "Nepal", "Nicaragua", "Niger", "Nigeria", 
    "North Korea", "North Macedonia", "Oman", "Pakistan", "Palau", "Panama", 
    "Papua New Guinea", "Paraguay", "Qatar", "Romania", "Russia", "Rwanda", 
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
    "Serbia", "Seychelles", "Sierra Leone", "Slovakia", "Slovenia", 
    "Solomon Islands", "Somalia", "South Sudan", "Sri Lanka", "Sudan", 
    "Suriname", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Timor-Leste", 
    "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkmenistan", 
    "Tuvalu", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Vanuatu", 
    "Vatican City", "Venezuela", "Yemen", "Zambia", "Zimbabwe"
  ],
  landmarks: [
    "Eiffel Tower", "Great Wall of China", "Statue of Liberty", "Machu Picchu", 
    "Taj Mahal", "Colosseum", "Pyramids of Giza", "Sydney Opera House", "Stonehenge", 
    "Grand Canyon", "Christ the Redeemer", "Burj Khalifa", "Mount Fuji", "Niagara Falls", 
    "Mount Everest", "Louvre Museum", "Golden Gate Bridge", "Petra", "Acropolis", 
    "Angkor Wat", "Big Ben", "Table Mountain", "Sears Tower", "Empire State Building", 
    "Sagrada Familia", "Mount Rushmore", "Alhambra", "Tower of London", "St. Peter's Basilica", 
    "Chichen Itza", "Times Square", "Golden Temple", "Forbidden City", "Mont Saint-Michel", 
    "Brandenburg Gate", "Parthenon", "Neuschwanstein Castle", "Palace of Versailles", 
    "Leaning Tower of Pisa", "Trevi Fountain", "Pantheon", "Spanish Steps", "Sistine Chapel", 
    "Pompeii", "Doge's Palace", "Rialto Bridge", "Bridge of Sighs", 
    "Tower Bridge", "London Eye", "Buckingham Palace", "Westminster Abbey", "Windsor Castle", 
    "Edinburgh Castle", "Loch Ness", "Giant's Causeway", "Kremlin", "Red Square", 
    "Saint Basil's Cathedral", "Hermitage Museum", "Mount Elbrus", "Trans-Siberian Railway", 
    "Western Wall", "Dome of the Rock", "Church of the Holy Sepulchre", "Masada", 
    "Wadi Rum", "Burj Al Arab", "Palm Jumeirah", "Sheikh Zayed Grand Mosque", 
    "Hawa Mahal", "Amer Fort", "Ganges River", "Gateway of India", "Ajanta Caves", 
    "Ellora Caves", "Victoria Memorial", "Shwedagon Pagoda", "Bagan", "Inle Lake", 
    "Wat Phra Kaew", "Grand Palace", "Wat Arun", "Ayutthaya", "Sukhothai", 
    "Petronas Twin Towers", "Batu Caves", "Marina Bay Sands", "Gardens by the Bay", 
    "Sentosa Island", "Borobudur", "Prambanan", "Mount Bromo", "Komodo National Park", 
    "Bayon Temple", "Ta Prohm", "Tonle Sap", "Halong Bay", "Hoi An Ancient Town", 
    "Phong Nha-Ke Bang", "Cu Chi Tunnels", "Fushimi Inari Taisha", "Kinkaku-ji", 
    "Senso-ji", "Himeji Castle", "Great Buddha of Kamakura", "Todai-ji", 
    "Itsukushima Shrine", "Mount Cook", "Milford Sound", "Hobbiton Movie Set", 
    "Franz Josef Glacier", "Rotorua Geothermal Area", "Sydney Harbour Bridge", 
    "Great Barrier Reef", "Uluru", "Twelve Apostles", "Blue Mountains", 
    "Kakadu National Park", "Cradle Mountain", "Robben Island", "Kruger National Park", 
    "Victoria Falls", "Serengeti", "Ngorongoro Crater", "Zanzibar Stone Town", 
    "Sphinx", "Luxor Temple", "Valley of the Kings", "Karnak", "Abu Simbel", 
    "Nile River", "Sahara Desert", "Atlas Mountains", "Volubilis", "Chefchaouen", 
    "Medina of Marrakesh", "Hassan II Mosque", "Carthage", "El Djem Amphitheatre", 
    "Lalibela Rock Churches", "Axum Obelisks", "Great Mosque of Djenne", 
    "Leptis Magna", "Timbuktu"
  ],
  nature: [
    "Amazon Rainforest", "Great Barrier Reef", "Serengeti National Park", "Mount Kilimanjaro", 
    "Galapagos Islands", "Sahara Desert", "Yellowstone National Park", "Banff National Park", 
    "Mount Rainier", "Ha Long Bay", "Plitvice Lakes National Park", "Yosemite Valley", 
    "Bora Bora", "Santorini Caldera", "Mount Vesuvius", "Patagonia Steppe", "Fiordland National Park", 
    "Salar de Uyuni", "Jiuzhaigou Valley", "Komodo Island", "Pamukkale Thermal Pools", 
    "Dead Sea", "Antarctica Ice Sheet", "Grand Canyon National Park", "Sahara Dunes", 
    "Fuji-Hakone-Izu", "Lake Baikal", "Victoria Falls", "Iguazu Falls", "Black Forest", 
    "Grand Canyon", "Great Blue Hole", "Aurora Borealis", "Mount Everest", 
    "Giant's Causeway", "Plitvice Lakes", "Zhangjiajie National Forest", "Huangshan Mountains", 
    "Reed Flute Cave", "Shilin Stone Forest", "Tiger Leaping Gorge", "Mount Wuyi", 
    "Guilin Hills", "Li River", "Jeju Island Volcanic Tubes", "Phong Nha-Ke Bang Caves", 
    "Son Doong Cave", "Mount Kinabalu", "Taman Negara Rainforest", "Danum Valley", 
    "Ijen Crater", "Lake Toba", "Raja Ampat Islands", "Bunaken Marine Park", 
    "Chocolate Hills", "Puerto Princesa Underground River", "Rice Terraces", 
    "Mount Apo", "Mount Mayon", "Tubbataha Reefs", "Milford Sound", "Fiordland", 
    "Tongariro National Park", "Waitomo Glowworm Caves", "Franz Josef Glacier", 
    "Fox Glacier", "Rotorua Geothermal Pools", "Lake Tekapo", "Bay of Islands", 
    "Uluru-Kata Tjuta", "Daintree Rainforest", "Kakadu Wetlands", "Blue Mountains", 
    "Twelve Apostles", "Ningaloo Reef", "Cradle Mountain-Lake St Clair", 
    "Whitsunday Islands", "Fraser Island", "Bungle Bungle Range", 
    "Ngorongoro Crater", "Okavango Delta", "Kalahari Desert", 
    "Namib-Naukluft National Park", "Fish River Canyon", "Tsingy de Bemaraha", 
    "Avenue of the Baobabs", "Kruger National Park", "Blyde River Canyon", 
    "Drakensberg Mountains", "Red Sea Reef", "Mount Kenya", "Great Rift Valley", 
    "Masai Mara", "Ngorongoro Conservation Area", "Danakil Depression", 
    "Simien Mountains", "Djoudj National Bird Sanctuary", "Mount Cameroon", 
    "W National Park", "Bay of Fundy", "Athabasca Sand Dunes", "Cabot Trail"
  ],
  fantasy: [
    "Eldoria", "Rivendell", "Stormwind", "Neverland", "Narnia", "Hogwarts", "Westeros", 
    "Asgard", "Gondor", "Atlantis", "The Shire", "Mount Doom", "Valhalla", "Emerald City", 
    "Wonderland", "Elvandar", "Orario", "Aincrad", "Zanarkand", "Midgar", "Alexandria", 
    "Dalaran", "Ironforge", "Silvermoon", "Undercity", "Orgrimmar", "Thunder Bluff", 
    "Lothlorien", "Helm's Deep", "Minas Tirith", "Ankh-Morpork", "Camelot", "El Dorado", 
    "Shangri-La", "Liliput", "Avalon", "Hyrule", "Hyrules Castle", "Kakariko Village", 
    "Xanadu", "Agartha", "Shambhala", "Yggdrasil", "Jotunheim", "Midgard", "Alfheim", 
    "Svartalfheim", "Vanaheim", "Niflheim", "Muspelheim", "Helheim", "Mount Olympus", 
    "Elysium", "Tartarus", "Hades", "Underworld", "Lemuria", "Mu", "Hyperborea", 
    "Thule", "Arcadia", "Utopia", "Dystopia", "Pandemonium", "R'lyeh", "Arkham", 
    "Dunwich", "Innsmouth", "Kingsport", "Carcosa", "Alagaesia", "Farthen Dur", 
    "Ellesmera", "Tronjheim", "Teirm", "Vroengard", "Ilirea", "Narda", "Dras-Leona", 
    "Yazuac", "Daret", "Ceunon", "Gil'ead", "Bullridge", "Orthanc", "Isengard", 
    "Edoras", "Rohan", "Minas Morgul", "Osgiliath", "Ithilien", "Harad", "Umbar", 
    "Mordor", "Barad-dur", "Gorgoroth", "Udun", "Nurn", "Lithlad", "Khand", "Rhun", 
    "Eriador", "Lindon", "Arnor", "Bree", "Weathertop", "Moria", "Khazad-dum", 
    "Fangorn Forest", "Helms Deep", "Novigrad", "Vengerberg", "Kaer Morhen", 
    "Wyzima", "Cintra", "Skellige", "Toussaint", "Nilfgaard", "Temeria", "Redania", 
    "Aedirn", "Kaedwen", "Kovir", "Poviss", "Lyria", "Rivia", "Aethelgard", 
    "Vaeloria", "Whisperwind", "Shadowfen", "Dragonspire", "Silverwood", "Crystalvale", 
    "Ironclad", "Stormwatch", "Frostmourne", "Zenith", "Netherreach", "Starfall", 
    "Oakhaven", "Ravenloft", "Gloomhaven", "Spellfire", "Emberfall", "Dawnstar", 
    "Winterhold", "Solitude", "Whiterun", "Riften", "Windhelm", "Markarth", "Falkreath", 
    "Morthal", "Bruma", "Cheydinhal", "Chorrol", "Leyawiin", "Bravil", "Anvil", 
    "Skingrad", "Vivec", "Balmora", "Ald'ruhn", "Sadrith Mora", "Seyda Neen", 
    "Caldera", "Gnisis", "Khuul", "Dagon Fel", "Tel Branora", "Pelagiad", 
    "Suran", "Ebonheart"
  ]
};

document.addEventListener("DOMContentLoaded", function() {
  const categorySelect = document.getElementById("place-category");
  const countInput = document.getElementById("place-count");
  const generateBtn = document.getElementById("generate-btn");
  const resultContainer = document.getElementById("generator-result");

  if (!generateBtn || !resultContainer) return;

  generateBtn.addEventListener("click", function() {
    const category = categorySelect.value;
    const count = parseInt(countInput.value, 10) || 1;
    
    // Validate count
    let validCount = Math.max(1, Math.min(10, count));
    countInput.value = validCount;

    const sourceArray = PLACES_DATA[category];
    if (!sourceArray) {
      resultContainer.textContent = "Error: Invalid category";
      return;
    }

    // Pick random items
    const selected = [];
    const tempArray = [...sourceArray];
    
    for (let i = 0; i < validCount; i++) {
      if (tempArray.length === 0) break;
      const idx = Math.floor(Math.random() * tempArray.length);
      selected.push(tempArray[idx]);
      tempArray.splice(idx, 1); // Avoid duplicates
    }

    // Display result
    resultContainer.innerHTML = "";
    if (selected.length === 1) {
      resultContainer.innerHTML = `<strong>${selected[0]}</strong>`;
    } else {
      const ol = document.createElement("ol");
      ol.style.margin = "0";
      ol.style.paddingLeft = "20px";
      selected.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item}</strong>`;
        ol.appendChild(li);
      });
      resultContainer.appendChild(ol);
    }
  });

  // Run once on load to show an initial result
  generateBtn.click();
});
