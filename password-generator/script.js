// =========================================
// ToolCanvas — Password Generator Script — Archetype C
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
let activeTab = "standard";
let isVisible = true;
let sessionHistory = [];
let lastEntropy = 0;

// Helpers
function updateRangeFill(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
}

function setCopyLive(msg) {
    const live = document.getElementById("copy-live");
    if (live) {
        live.textContent = msg;
        setTimeout(() => { live.textContent = ""; }, 1200);
    }
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    if (tabStandard) tabStandard.addEventListener("click", () => switchTab("standard"));
    if (tabPassphrase) tabPassphrase.addEventListener("click", () => switchTab("passphrase"));

    // Real-time slider updates + fill
    if (passwordLength) {
        updateRangeFill(passwordLength);
        passwordLength.addEventListener("input", (e) => {
            lengthVal.textContent = e.target.value;
            updateRangeFill(e.target);
            generate();
        });
    }
    if (passphraseWords) {
        updateRangeFill(passphraseWords);
        passphraseWords.addEventListener("input", (e) => {
            wordsVal.textContent = e.target.value;
            updateRangeFill(e.target);
            generate();
        });
    }

    // Checkboxes & Selects triggers
    const inputsToSync = [
        chkUppercase, chkLowercase, chkNumbers, chkSymbols,
        passphraseSeparator, passphraseCase,
        chkExcludeAmbiguous, chkEasySay
    ];
    inputsToSync.forEach(input => {
        if (input) input.addEventListener("change", () => generate());
    });

    // Action buttons
    if (generateBtn) generateBtn.addEventListener("click", () => generate());
    if (toggleVisibilityBtn) toggleVisibilityBtn.addEventListener("click", toggleVisibility);
    if (copyPasswordBtn) copyPasswordBtn.addEventListener("click", copyToClipboard);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);

    // Disclosure toggle
    const disclosureToggle = document.getElementById("disclosure-toggle");
    const advancedPanel = document.getElementById("advanced-panel");
    if (disclosureToggle && advancedPanel) {
        disclosureToggle.addEventListener("click", () => {
            const isOpen = disclosureToggle.getAttribute("aria-expanded") === "true";
            const next = !isOpen;
            disclosureToggle.setAttribute("aria-expanded", String(next));
            if (next) {
                advancedPanel.hidden = false;
                requestAnimationFrame(() => advancedPanel.classList.add("is-open"));
            } else {
                advancedPanel.classList.remove("is-open");
                setTimeout(() => { advancedPanel.hidden = true; }, 160);
            }
        });
    }

    // FAQ accordion — multiple open, 200ms height, chevron 160ms, line dividers
    document.querySelectorAll(".faq-item").forEach(item => {
        const btn = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!btn || !answer) return;
        btn.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");
            if (isOpen) {
                item.classList.remove("is-open");
                btn.setAttribute("aria-expanded", "false");
                answer.style.maxHeight = "0";
            } else {
                item.classList.add("is-open");
                btn.setAttribute("aria-expanded", "true");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Initial password generation
    generate();
});

// Switch Tab logic
function switchTab(tab) {
    activeTab = tab;
    if (tab === "standard") {
        tabStandard.classList.add("active");
        tabStandard.setAttribute("aria-selected", "true");
        tabPassphrase.classList.remove("active");
        tabPassphrase.setAttribute("aria-selected", "false");
        panelStandard.style.display = "block";
        panelPassphrase.style.display = "none";
    } else {
        tabStandard.classList.remove("active");
        tabStandard.setAttribute("aria-selected", "false");
        tabPassphrase.classList.add("active");
        tabPassphrase.setAttribute("aria-selected", "true");
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
        if (eyeOpen) eyeOpen.style.display = "block";
        if (eyeClosed) eyeClosed.style.display = "none";
        toggleVisibilityBtn.setAttribute("aria-label", "Hide password");
    } else {
        passwordDisplay.classList.add("redacted");
        if (eyeOpen) eyeOpen.style.display = "none";
        if (eyeClosed) eyeClosed.style.display = "block";
        toggleVisibilityBtn.setAttribute("aria-label", "Show password");
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

        let useUpper = chkUppercase.checked;
        let useLower = chkLowercase.checked;
        let useNum = chkNumbers.checked;
        let useSym = chkSymbols.checked;

        if (chkEasySay.checked) {
            useNum = false;
            useSym = false;
        }

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

        if (finalPool.length === 0) {
            const pool = filterAmbiguous(lowercasePool);
            finalPool += pool;
            requiredChars.push(pool[getSecureRandomInt(pool.length)]);
        }

        const length = parseInt(passwordLength.value);
        let passwordArray = [];

        for (let i = 0; i < Math.min(length, requiredChars.length); i++) {
            passwordArray.push(requiredChars[i]);
        }

        while (passwordArray.length < length) {
            passwordArray.push(finalPool[getSecureRandomInt(finalPool.length)]);
        }

        passwordArray = secureShuffleArray(passwordArray);
        password = passwordArray.join("");

        entropy = Math.round(length * Math.log2(finalPool.length));

    } else {
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
        entropy = Math.round(wordCount * Math.log2(filteredWordList.length));
    }

    passwordDisplay.value = password;
    lastEntropy = entropy;
    updateStrengthMeter(entropy);
    addToHistory(password);
}

// Update strength visual bar and labels — 4 segments
function updateStrengthMeter(entropy) {
    entropyText.textContent = `${entropy} bits of entropy`;

    let strength = "";
    let segs = 0;

    if (entropy < 50) {
        strength = "Weak";
        segs = 1;
    } else if (entropy < 80) {
        strength = "Medium";
        segs = 2;
    } else if (entropy < 120) {
        strength = "Strong";
        segs = 3;
    } else {
        strength = "Very Strong";
        segs = 4;
    }

    // Update segments
    const segEls = strengthBar ? strengthBar.querySelectorAll(".strength-seg") : [];
    segEls.forEach((el, idx) => {
        if (idx < segs) el.classList.add("is-filled");
        else el.classList.remove("is-filled");
    });

    // Legacy width support for fallback — no longer used visually but keep for compat
    if (strengthBar) {
        // keep class for potential CSS hooks, but not width
        strengthBar.className = "strength-bar-container";
        if (segs === 1) strengthBar.classList.add("weak");
        if (segs === 2) strengthBar.classList.add("medium");
        if (segs === 3) strengthBar.classList.add("strong");
        if (segs === 4) strengthBar.classList.add("very-strong");
    }

    strengthText.textContent = strength;
}

// Clipboard copying — swap to check 1200ms, border flash 200ms, aria-live polite
function copyToClipboard() {
    const text = passwordDisplay.value;
    if (!text || text === "Loading...") return;

    const doCopiedUI = () => {
        const iconCopy = copyPasswordBtn.querySelector(".icon-copy");
        const iconCheck = copyPasswordBtn.querySelector(".icon-check");
        if (iconCopy) iconCopy.style.display = "none";
        if (iconCheck) iconCheck.style.display = "block";
        copyPasswordBtn.classList.add("copied");
        if (copyTooltip) {
            copyTooltip.classList.add("show");
            copyTooltip.textContent = "Copied!";
        }
        setCopyLive("Copied to clipboard");
        setTimeout(() => {
            if (iconCopy) iconCopy.style.display = "block";
            if (iconCheck) iconCheck.style.display = "none";
            copyPasswordBtn.classList.remove("copied");
            if (copyTooltip) copyTooltip.classList.remove("show");
        }, 1200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(doCopiedUI).catch(err => {
            console.error("Failed to copy password: ", err);
            // fallback
            fallbackCopy(text, doCopiedUI);
        });
    } else {
        fallbackCopy(text, doCopiedUI);
    }
}

function fallbackCopy(text, cb) {
    passwordDisplay.select();
    try {
        document.execCommand("copy");
        if (cb) cb();
    } catch (e) {
        console.error("fallback copy failed", e);
    }
    window.getSelection()?.removeAllRanges();
}

// Add newly generated password to history list
function addToHistory(password) {
    if (sessionHistory[0] === password) return;
    sessionHistory.unshift(password);
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

// Render history log list — reuses result list row pattern, plain text link + copy icon button, stack on mobile, no card-in-card
function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";

    if (sessionHistory.length === 0) {
        historyList.innerHTML = '<li class="history-empty">No passwords generated in this session yet.</li>';
        return;
    }

    sessionHistory.forEach((pw) => {
        const li = document.createElement("li");

        const main = document.createElement("div");
        main.className = "history-item-main";

        const title = document.createElement("span");
        title.className = "history-item-pw";
        title.textContent = pw;
        main.appendChild(title);

        const meta = document.createElement("span");
        meta.className = "history-item-meta";
        // approximate meta from current mode entropy/length stored — show char count
        meta.textContent = `${pw.length} characters`;
        main.appendChild(meta);

        const tags = document.createElement("div");
        tags.className = "history-tags";
        const chip = document.createElement("span");
        chip.className = "chip chip--green";
        chip.textContent = activeTab === "passphrase" ? "Passphrase" : "Password";
        tags.appendChild(chip);
        main.appendChild(tags);

        li.appendChild(main);

        const actions = document.createElement("div");
        actions.className = "history-item-actions";

        const textBtn = document.createElement("button");
        textBtn.type = "button";
        textBtn.className = "text-link";
        textBtn.textContent = "Copy";
        textBtn.setAttribute("aria-label", "Copy " + pw.slice(0, 8) + "…");
        textBtn.addEventListener("click", () => copyHistoryItem(pw, textBtn, iconBtn));

        const iconBtn = document.createElement("button");
        iconBtn.type = "button";
        iconBtn.className = "history-item-copy-btn";
        iconBtn.setAttribute("aria-label", "Copy password");
        iconBtn.title = "Copy";
        iconBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="1.2"/><path d="M15 9V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/></svg><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" style="display:none;"><path d="M5 13l4 4L19 7"/></svg>';
        iconBtn.addEventListener("click", () => copyHistoryItem(pw, textBtn, iconBtn));

        actions.appendChild(textBtn);
        actions.appendChild(iconBtn);
        li.appendChild(actions);

        historyList.appendChild(li);
    });
}

function copyHistoryItem(pw, textBtn, iconBtn) {
    const doUI = () => {
        if (textBtn) {
            textBtn.textContent = "Copied!";
            setTimeout(() => { textBtn.textContent = "Copy"; }, 1200);
        }
        if (iconBtn) {
            iconBtn.classList.add("copied");
            const svgs = iconBtn.querySelectorAll("svg");
            if (svgs[0]) svgs[0].style.display = "none";
            if (svgs[1]) svgs[1].style.display = "block";
            setTimeout(() => {
                iconBtn.classList.remove("copied");
                if (svgs[0]) svgs[0].style.display = "block";
                if (svgs[1]) svgs[1].style.display = "none";
            }, 1200);
        }
        setCopyLive("Copied to clipboard");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pw).then(doUI);
    } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = pw;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); doUI(); } catch(e){ console.error(e);}
        ta.remove();
    }
}
