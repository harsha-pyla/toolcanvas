// =========================================
// ToolCanvas — Place Name Generator Script
// =========================================

const THEMES = {
    fantasy: {
        prefixes: ["Eld", "Val", "Aer", "Zan", "Oth", "Bel", "Kael", "Thor", "Lys", "Syl"],
        suffixes: ["oria", "glen", "gard", "heim", "vale", "wind", "wood", "shaven", "port", "barrow"],
        prefixMeanings: {
            "Eld": "Ancient", "Val": "Valiant", "Aer": "Windy", "Zan": "Shadowy",
            "Oth": "Sacred", "Bel": "Fair", "Kael": "Noble", "Thor": "Thunderous",
            "Lys": "Luminous", "Syl": "Sylvan"
        },
        suffixMeanings: {
            "oria": "realm", "glen": "dell", "gard": "keep", "heim": "refuge",
            "vale": "hollow", "wind": "crest", "wood": "forest", "shaven": "haven",
            "port": "harbor", "barrow": "hill"
        },
        descriptionTemplate: "A legendary [P-MEAN] [S-MEAN] hidden away in the mythical borders of the world."
    },
    medieval: {
        prefixes: ["Stone", "Iron", "Oak", "Deep", "Green", "Red", "West", "East", "North", "South"],
        suffixes: ["ford", "bridge", "ham", "ton", "bury", "chester", "stead", "wood", "field", "cliff"],
        prefixMeanings: {
            "Stone": "Stoney", "Iron": "Fortified", "Oak": "Oaken", "Deep": "Lowland",
            "Green": "Verdant", "Red": "Crimson", "West": "Western", "East": "Eastern",
            "North": "Northern", "South": "Southern"
        },
        suffixMeanings: {
            "ford": "river-crossing", "bridge": "causeway", "ham": "hamlet", "ton": "estate",
            "bury": "borough", "chester": "castrum", "stead": "homestead", "wood": "thicket",
            "field": "clearing", "cliff": "bluff"
        },
        descriptionTemplate: "A rustic [P-MEAN] [S-MEAN] established near trade routes during the feudal era."
    },
    scifi: {
        prefixes: ["Neo-", "Nova ", "Xeno-", "Aero-", "Kepler-", "Giga-", "Cyber-", "Proxima ", "Sector ", "Station "],
        suffixes: [" Prime", " Beta", "-9", "-IV", " Alpha", " Nebula", " City", " Complex", " Grid", " Colony"],
        prefixMeanings: {
            "Neo-": "New-era", "Nova ": "Stellar", "Xeno-": "Extraterrestrial", "Aero-": "Atmospheric",
            "Kepler-": "Kepler-zone", "Giga-": "Super-sized", "Cyber-": "Synthetic", "Proxima ": "Centauri-side",
            "Sector ": "Quadrant", "Station ": "Orbital"
        },
        suffixMeanings: {
            " Prime": "Command Center", " Beta": "Research Lab", "-9": "Deep Outpost", "-IV": "Orbital Sphere",
            " Alpha": "Main Colony", " Nebula": "Gas Sprawl", " City": "Megacity", " Complex": "Industrial Grid",
            " Grid": "Network Center", " Colony": "Biodome"
        },
        descriptionTemplate: "An advanced [P-MEAN] [S-MEAN] supporting research, terraforming, or mining operations."
    },
    nature: {
        prefixes: ["River", "Mountain", "Valley", "Forest", "Whispering ", "Shadow ", "Sunny ", "Silver ", "Golden ", "Crystal "],
        suffixes: [" Wood", " Glen", " Falls", " Bay", " Peak", " Creek", " Ridge", " Lake", " Meadow", " Island"],
        prefixMeanings: {
            "River": "Water-fed", "Mountain": "Highland", "Valley": "Low-lying", "Forest": "Tree-lined",
            "Whispering ": "Echoing", "Shadow ": "Canopied", "Sunny ": "Sunlit", "Silver ": "Bright-stream",
            "Golden ": "Sun-dappled", "Crystal ": "Glassy"
        },
        suffixMeanings: {
            " Wood": "timberland", " Glen": "ravine", " Falls": "cascade", " Bay": "cove",
            " Peak": "summit", " Creek": "brook", " Ridge": "escarpment", " Lake": "tarn",
            " Meadow": "plateau", " Island": "atoll"
        },
        descriptionTemplate: "A pristine [P-MEAN] [S-MEAN] celebrated for its natural geography and scenery."
    },
    realistic: {
        prefixes: ["Spring", "Port ", "New ", "Saint ", "Grand ", "High ", "Fort ", "Green ", "Lake ", "West "],
        suffixes: ["field", "ville", "town", "port", "wood", "burg", "land", "mont", "view", "hope"],
        prefixMeanings: {
            "Spring": "Fresh-spring", "Port ": "Coastal", "New ": "Modern", "Saint ": "Chartered",
            "Grand ": "Spacious", "High ": "Elevated", "Fort ": "Garrisoned", "Green ": "Parkside",
            "Lake ": "Lakeside", "West ": "Western"
        },
        suffixMeanings: {
            "field": "agricultural fields", "ville": "township", "town": "municipality", "port": "harbor",
            "wood": "woodlands", "burg": "incorporated city", "land": "territory", "mont": "mountain settlement",
            "view": "vista", "hope": "haven"
        },
        descriptionTemplate: "A modern, bustling [P-MEAN] [S-MEAN] containing active residential and commercial sectors."
    }
};

// DOM Selectors
const nameCategory = document.getElementById("name-category");
const nameCount = document.getElementById("name-count");
const countVal = document.getElementById("count-val");
const chkMeanings = document.getElementById("chk-meanings");
const generateBtn = document.getElementById("generate-btn");
const copyNamesBtn = document.getElementById("copy-names-btn");
const downloadNamesBtn = document.getElementById("download-names-btn");
const namesList = document.getElementById("names-list");
const copyTooltip = document.getElementById("copy-tooltip");

let currentGeneratedList = [];

// Initialize Page Controls
window.addEventListener("DOMContentLoaded", () => {
    // Slider label updates
    nameCount.addEventListener("input", (e) => {
        countVal.textContent = e.target.value;
    });

    // Generate Button click
    generateBtn.addEventListener("click", generateNames);

    // List copy & download
    copyNamesBtn.addEventListener("click", copyListToClipboard);
    downloadNamesBtn.addEventListener("click", downloadListAsText);

    // Run first generation
    generateNames();
});

// Cryptographically secure random helper
function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

// Name composition logic
function generateNames() {
    namesList.innerHTML = "";
    currentGeneratedList = [];

    const category = nameCategory.value;
    const count = parseInt(nameCount.value);
    const showMeaning = chkMeanings.checked;

    for (let i = 0; i < count; i++) {
        let activeCategory = category;
        if (category === "mix") {
            const keys = ["fantasy", "medieval", "scifi", "nature", "realistic"];
            activeCategory = keys[getSecureRandomInt(keys.length)];
        }

        const theme = THEMES[activeCategory];
        const pref = theme.prefixes[getSecureRandomInt(theme.prefixes.length)];
        const suff = theme.suffixes[getSecureRandomInt(theme.suffixes.length)];
        const name = pref + suff;

        // Calculate combined description details
        const prefMean = theme.prefixMeanings[pref] || "undocumented";
        const suffMean = theme.suffixMeanings[suff] || "region";
        let desc = theme.descriptionTemplate
            .replace("[P-MEAN]", prefMean.toLowerCase())
            .replace("[S-MEAN]", suffMean.toLowerCase());
        
        // Capitalize first letter of description for sentence structure
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);

        currentGeneratedList.push({ name, desc });

        // Build list elements
        const li = document.createElement("li");

        const nameSpan = document.createElement("span");
        nameSpan.className = "name-item-title";
        nameSpan.textContent = name;
        li.appendChild(nameSpan);

        if (showMeaning) {
            const descSpan = document.createElement("span");
            descSpan.className = "name-item-desc";
            descSpan.textContent = desc;
            li.appendChild(descSpan);
        }

        namesList.appendChild(li);
    }
}

// Copy names list string to clipboard
function copyListToClipboard() {
    if (currentGeneratedList.length === 0) return;

    const includeMeaning = chkMeanings.checked;
    const textToCopy = currentGeneratedList.map(item => {
        return includeMeaning ? `${item.name} - ${item.desc}` : item.name;
    }).join("\r\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyTooltip.classList.add("show");
        setTimeout(() => {
            copyTooltip.classList.remove("show");
        }, 1500);
    }).catch(err => {
        console.error("Failed to copy list: ", err);
    });
}

// Download list as .txt file
function downloadListAsText() {
    if (currentGeneratedList.length === 0) return;

    const includeMeaning = chkMeanings.checked;
    const textContent = currentGeneratedList.map(item => {
        return includeMeaning ? `${item.name} - ${item.desc}` : item.name;
    }).join("\r\n");

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `toolcanvas_generated_places.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
