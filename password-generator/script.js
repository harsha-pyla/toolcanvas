// =========================================
// ToolCanvas — Password Generator Script
// =========================================

// Curated list of 600 easy, clear English words for passphrase generation
const WORD_LIST = [
    "about", "above", "active", "actor", "acute", "adapt", "admit", "adopt", "adult", "after",
    "again", "agent", "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow",
    "alone", "along", "alter", "among", "anger", "angle", "angry", "animal", "ankle", "apart",
    "apple", "apply", "arena", "argue", "arise", "armed", "armor", "army", "arrow", "asset",
    "assist", "assume", "atom", "attack", "audio", "audit", "autumn", "avoid", "awake", "award",
    "aware", "awful", "badly", "baked", "baker", "basic", "basin", "basis", "basket", "beach",
    "beard", "beast", "beauty", "beefy", "begin", "being", "below", "bench", "berry", "bible",
    "birth", "black", "blade", "blame", "blank", "blast", "blend", "blind", "block", "blood",
    "bloom", "board", "boast", "body", "bold", "bomb", "bond", "bonus", "boost", "boot",
    "border", "boss", "brain", "branch", "brand", "brave", "bread", "break", "brick", "bride",
    "brief", "bright", "bring", "broad", "broke", "brown", "brush", "bubble", "bucket", "budget",
    "build", "built", "bunch", "buyer", "cabin", "cable", "cake", "camel", "camp", "canal",
    "candy", "cane", "cargo", "case", "cast", "cave", "cell", "chain", "chair", "chalk",
    "chaos", "charm", "chart", "chase", "cheap", "check", "cheek", "cheer", "chef", "chess",
    "chest", "chief", "child", "chin", "chip", "choir", "choose", "chord", "chorus", "chunk",
    "church", "cider", "cigar", "cinema", "circle", "circus", "city", "civil", "claim",
    "clamp", "clash", "class", "classic", "claw", "clay", "clean", "clear", "clerk", "click",
    "cliff", "climb", "clip", "clock", "close", "cloth", "cloud", "clover", "clown", "club",
    "clump", "coach", "coal", "coast", "coat", "cobra", "coffee", "coin", "cold", "collar",
    "colony", "color", "colt", "column", "combat", "comedy", "comet", "comfort", "comic", "common",
    "compact", "compare", "compass", "complex", "comply", "compute", "comrade", "conceal", "concept", "concern",
    "concert", "concrete", "conduct", "cone", "confer", "confess", "conflict", "conform", "connect", "conquer",
    "consent", "consist", "console", "constant", "consult", "consume", "contact", "contain", "content", "contest",
    "context", "contour", "contract", "control", "convert", "convey", "convict", "convoy", "cook", "cool",
    "cope", "copper", "copy", "coral", "cord", "core", "cork", "corner", "corona", "corpse",
    "correct", "cosmos", "cost", "cottage", "cotton", "couch", "cough", "could", "council", "counsel",
    "count", "counter", "country", "county", "couple", "courage", "course", "court", "cousin", "cover",
    "craft", "crane", "crash", "crater", "crawl", "crayon", "crazy", "cream", "create", "credit",
    "creed", "creek", "creep", "crew", "cricket", "crime", "crimson", "crisis", "critic", "crook",
    "crop", "cross", "crowd", "crown", "crude", "cruel", "cruise", "crumb", "crush", "crust",
    "crystal", "cube", "cubic", "cuckoo", "cuff", "culture", "cup", "curb", "cure", "curfew",
    "curl", "current", "curry", "curse", "cursor", "curve", "cushion", "custody", "custom", "daily",
    "dairy", "damage", "dance", "danger", "danish", "dark", "darling", "dash", "data", "date",
    "dawn", "deal", "debate", "debris", "debt", "decade", "decay", "decent", "decide", "deck",
    "declare", "decor", "decree", "deduct", "deed", "deep", "defeat", "defend", "define", "defy",
    "degree", "delay", "delicate", "delight", "deliver", "delta", "demand", "demise", "demo", "denim",
    "denounce", "dense", "dental", "depart", "depend", "depict", "deploy", "deposit", "depot", "depth",
    "deputy", "derive", "desert", "design", "desire", "desk", "desktop", "despair", "despite", "destroy",
    "detail", "detect", "develop", "device", "devil", "devote", "devour", "diagram", "dial", "dialog",
    "diamond", "diary", "dice", "dictate", "diet", "differ", "digest", "digit", "dignity", "dilemma",
    "dilute", "dime", "diminish", "dine", "diner", "dinner", "dinosaur", "dioxide", "dip", "diploma",
    "direct", "dirt", "dirty", "disable", "disarm", "disaster", "disc", "disclose", "discount", "discover",
    "disgust", "dish", "dislike", "dismiss", "disorder", "displace", "display", "disposal", "dispute", "disrupt",
    "distance", "distant", "distinct", "distort", "district", "distrust", "disturb", "ditch", "dive", "diver",
    "diverse", "divide", "divine", "divorce", "dock", "doctor", "doctrine", "document", "dog", "doll",
    "domain", "dome", "domestic", "dominant", "donate", "donor", "door", "dose", "dot", "double",
    "doubt", "dough", "dove", "down", "draft", "drag", "dragon", "drain", "drama", "drastic",
    "draw", "drawer", "drawing", "dread", "dream", "dress", "drift", "drill", "drink", "drip",
    "drive", "driver", "highway", "runway", "metro", "local", "subway", "train", "flight", "pilot",
    "travel", "trip", "tourist", "guide", "hotel", "cabin", "resort", "hostel", "motel", "palace",
    "castle", "temple", "monk", "shrine", "chapel", "altar", "priest", "bishop", "abbey", "church",
    "heaven", "angel", "spirit", "ghost", "witch", "wizard", "magic", "spell", "potion", "charm",
    "ritual", "mystery", "secret", "puzzle", "riddle", "enigma", "clue", "hint", "detective", "spy",
    "agent", "scout", "guard", "sentry", "ranger", "knight", "soldier", "warrior", "hero", "champion"
];

// DOM Elements
const passwordDisplay = document.getElementById("password-display");
const toggleVisibilityBtn = document.getElementById("toggle-visibility-btn");
const copyPasswordBtn = document.getElementById("copy-password-btn");
const copyTooltip = document.getElementById("copy-tooltip");
const generateBtn = document.getElementById("generate-btn");

const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const entropyText = document.getElementById("entropy-text");

const tabStandard = document.getElementById("tab-standard");
const tabPassphrase = document.getElementById("tab-passphrase");
const panelStandard = document.getElementById("panel-standard");
const panelPassphrase = document.getElementById("panel-passphrase");

// Standard Controls
const passwordLength = document.getElementById("password-length");
const lengthVal = document.getElementById("length-val");
const chkUppercase = document.getElementById("chk-uppercase");
const chkLowercase = document.getElementById("chk-lowercase");
const chkNumbers = document.getElementById("chk-numbers");
const chkSymbols = document.getElementById("chk-symbols");

// Passphrase Controls
const passphraseWords = document.getElementById("passphrase-words");
const wordsVal = document.getElementById("words-val");
const passphraseSeparator = document.getElementById("passphrase-separator");
const passphraseCase = document.getElementById("passphrase-case");

// Advanced Options
const chkExcludeAmbiguous = document.getElementById("chk-exclude-ambiguous");
const chkEasySay = document.getElementById("chk-easy-say");

// History
const clearHistoryBtn = document.getElementById("clear-history-btn");
const historyList = document.getElementById("history-list");

// State
let activeTab = "standard"; // standard or passphrase
let isVisible = true;
let sessionHistory = [];

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    tabStandard.addEventListener("click", () => switchTab("standard"));
    tabPassphrase.addEventListener("click", () => switchTab("passphrase"));

    // Real-time slider updates
    passwordLength.addEventListener("input", (e) => {
        lengthVal.textContent = e.target.value;
        generate();
    });
    passphraseWords.addEventListener("input", (e) => {
        wordsVal.textContent = e.target.value;
        generate();
    });

    // Checkboxes & Selects triggers
    const inputsToSync = [
        chkUppercase, chkLowercase, chkNumbers, chkSymbols,
        passphraseSeparator, passphraseCase,
        chkExcludeAmbiguous, chkEasySay
    ];
    inputsToSync.forEach(input => {
        input.addEventListener("change", () => generate());
    });

    // Action buttons
    generateBtn.addEventListener("click", () => generate());
    toggleVisibilityBtn.addEventListener("click", toggleVisibility);
    copyPasswordBtn.addEventListener("click", copyToClipboard);
    clearHistoryBtn.addEventListener("click", clearHistory);

    // Initial password generation
    generate();
});

// Switch Tab logic
function switchTab(tab) {
    activeTab = tab;
    if (tab === "standard") {
        tabStandard.classList.add("active");
        tabPassphrase.classList.remove("active");
        panelStandard.style.display = "block";
        panelPassphrase.style.display = "none";
    } else {
        tabStandard.classList.remove("active");
        tabPassphrase.classList.add("active");
        panelStandard.style.display = "none";
        panelPassphrase.style.display = "block";
    }
    generate();
}

// Toggle field visibility
function toggleVisibility() {
    isVisible = !isVisible;
    const eyeOpen = toggleVisibilityBtn.querySelector(".eye-open-icon");
    const eyeClosed = toggleVisibilityBtn.querySelector(".eye-closed-icon");

    if (isVisible) {
        passwordDisplay.classList.remove("redacted");
        eyeOpen.style.display = "block";
        eyeClosed.style.display = "none";
    } else {
        passwordDisplay.classList.add("redacted");
        eyeOpen.style.display = "none";
        eyeClosed.style.display = "block";
    }
}

// Cryptographically secure random integer generation between [0, max-1]
function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    let randomVal;
    const maxSafe = Math.floor(4294967296 / max) * max;
    
    do {
        window.crypto.getRandomValues(array);
        randomVal = array[0];
    } while (randomVal >= maxSafe);

    return randomVal % max;
}

// Fisher-Yates array shuffle using secure random number generator
function secureShuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Generate secure credentials
function generate() {
    let password = "";
    let entropy = 0;

    if (activeTab === "standard") {
        const uppercasePool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercasePool = "abcdefghijklmnopqrstuvwxyz";
        const numbersPool = "0123456789";
        const symbolsPool = "!@#$%^&*";
        const ambiguousChars = "l1IoO0sS5zZ2";

        let finalPool = "";
        let requiredChars = [];

        // Build character pools
        let useUpper = chkUppercase.checked;
        let useLower = chkLowercase.checked;
        let useNum = chkNumbers.checked;
        let useSym = chkSymbols.checked;

        // "Easy to Say" bypasses numbers/symbols
        if (chkEasySay.checked) {
            useNum = false;
            useSym = false;
        }

        // Filter and collect potential characters
        const filterAmbiguous = (str) => {
            if (!chkExcludeAmbiguous.checked) return str;
            return str.split("").filter(c => !ambiguousChars.includes(c)).join("");
        };

        if (useUpper) {
            const pool = filterAmbiguous(uppercasePool);
            if (pool.length > 0) {
                finalPool += pool;
                requiredChars.push(pool[getSecureRandomInt(pool.length)]);
            }
        }
        if (useLower) {
            const pool = filterAmbiguous(lowercasePool);
            if (pool.length > 0) {
                finalPool += pool;
                requiredChars.push(pool[getSecureRandomInt(pool.length)]);
            }
        }
        if (useNum) {
            const pool = filterAmbiguous(numbersPool);
            if (pool.length > 0) {
                finalPool += pool;
                requiredChars.push(pool[getSecureRandomInt(pool.length)]);
            }
        }
        if (useSym) {
            const pool = filterAmbiguous(symbolsPool);
            if (pool.length > 0) {
                finalPool += pool;
                requiredChars.push(pool[getSecureRandomInt(pool.length)]);
            }
        }

        // Fallback if no sets are checked
        if (finalPool.length === 0) {
            const pool = filterAmbiguous(lowercasePool);
            finalPool += pool;
            requiredChars.push(pool[getSecureRandomInt(pool.length)]);
        }

        const length = parseInt(passwordLength.value);
        let passwordArray = [];

        // Add mandatory character types first
        for (let i = 0; i < Math.min(length, requiredChars.length); i++) {
            passwordArray.push(requiredChars[i]);
        }

        // Fill remaining password slots with random pool selection
        while (passwordArray.length < length) {
            passwordArray.push(finalPool[getSecureRandomInt(finalPool.length)]);
        }

        // Shuffle securely to hide positions of initial mandatory types
        passwordArray = secureShuffleArray(passwordArray);
        password = passwordArray.join("");

        // Calculate Entropy: E = L * log2(R)
        entropy = Math.round(length * Math.log2(finalPool.length));

    } else {
        // Passphrase generation
        const wordCount = parseInt(passphraseWords.value);
        const separator = passphraseSeparator.value;
        const casing = passphraseCase.value;
        const ambiguousChars = "l1IoO0sS5zZ2";

        let selectedWords = [];
        let filteredWordList = [...WORD_LIST];

        if (chkExcludeAmbiguous.checked) {
            filteredWordList = WORD_LIST.filter(word => {
                return !word.split("").some(char => ambiguousChars.includes(char));
            });
        }

        for (let i = 0; i < wordCount; i++) {
            let word = filteredWordList[getSecureRandomInt(filteredWordList.length)];
            
            if (casing === "uppercase") {
                word = word.toUpperCase();
            } else if (casing === "capitalize") {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            } else {
                word = word.toLowerCase();
            }
            selectedWords.push(word);
        }

        password = selectedWords.join(separator);

        // Entropy: W * log2(D)
        entropy = Math.round(wordCount * Math.log2(filteredWordList.length));
    }

    passwordDisplay.value = password;
    updateStrengthMeter(entropy);
    addToHistory(password);
}

// Update strength visual bar and labels
function updateStrengthMeter(entropy) {
    entropyText.textContent = `${entropy} bits of entropy`;

    // Remove old classes
    strengthBar.className = "strength-bar";
    
    let pct = 0;
    let strength = "Too Short / Weak";
    let cls = "weak";

    if (entropy < 50) {
        pct = Math.max(10, Math.round((entropy / 50) * 25));
        strength = "Weak (Insecure)";
        cls = "weak";
    } else if (entropy < 80) {
        pct = 25 + Math.round(((entropy - 50) / 30) * 25);
        strength = "Medium (Fair)";
        cls = "medium";
    } else if (entropy < 120) {
        pct = 50 + Math.round(((entropy - 80) / 40) * 25);
        strength = "Strong (Secure)";
        cls = "strong";
    } else {
        pct = Math.min(100, 75 + Math.round(((entropy - 120) / 100) * 25));
        strength = "Very Strong (Military Grade)";
        cls = "very-strong";
    }

    strengthBar.style.width = `${pct}%`;
    strengthBar.classList.add(cls);
    strengthText.textContent = strength;
}

// Clipboard copying
function copyToClipboard() {
    const text = passwordDisplay.value;
    if (!text || text === "Loading...") return;

    navigator.clipboard.writeText(text).then(() => {
        copyTooltip.classList.add("show");
        setTimeout(() => {
            copyTooltip.classList.remove("show");
        }, 1500);
    }).catch(err => {
        console.error("Failed to copy password: ", err);
    });
}

// Add newly generated password to history list
function addToHistory(password) {
    // Avoid duplicate addition if clicking generate frequently
    if (sessionHistory[0] === password) return;

    sessionHistory.unshift(password);
    
    // Cap at 10 items
    if (sessionHistory.length > 10) {
        sessionHistory.pop();
    }

    renderHistory();
}

// Clear history log
function clearHistory() {
    sessionHistory = [];
    renderHistory();
}

// Render history log list
function renderHistory() {
    historyList.innerHTML = "";

    if (sessionHistory.length === 0) {
        historyList.innerHTML = '<li class="history-empty">No passwords generated in this session yet.</li>';
        return;
    }

    sessionHistory.forEach((pw, index) => {
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.className = "history-item-pw";
        span.textContent = pw;
        li.appendChild(span);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "history-item-copy-btn";
        btn.textContent = "Copy";
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(pw).then(() => {
                btn.textContent = "Copied!";
                btn.style.borderColor = "var(--color-badge-active)";
                btn.style.color = "var(--color-badge-active)";
                setTimeout(() => {
                    btn.textContent = "Copy";
                    btn.style.borderColor = "";
                    btn.style.color = "";
                }, 1200);
            });
        });
        
        li.appendChild(btn);
        historyList.appendChild(li);
    });
}
