// =========================================
// ToolCanvas — String Randomizer Script
// =========================================

// DOM Selectors - Tabs & Panels
const tabShuffler = document.getElementById("tab-shuffler");
const tabKeyGen = document.getElementById("tab-key-gen");
const panelShuffler = document.getElementById("panel-shuffler");
const panelKeyGen = document.getElementById("panel-key-gen");

// DOM Selectors - Shuffler Panel
const listInput = document.getElementById("list-input");
const listOutput = document.getElementById("list-output");
const listDelimiter = document.getElementById("list-delimiter");
const randomizeMode = document.getElementById("randomize-mode");
const pickCountGroup = document.getElementById("pick-count-group");
const pickCount = document.getElementById("pick-count");
const chkAllowDuplicates = document.getElementById("chk-allow-duplicates");
const shuffleBtn = document.getElementById("shuffle-btn");
const copyShuffledBtn = document.getElementById("copy-shuffled-btn");
const downloadShuffledBtn = document.getElementById("download-shuffled-btn");
const copyTooltipShuffled = document.getElementById("copy-tooltip-shuffled");

// DOM Selectors - Key Gen Panel
const keyLength = document.getElementById("key-length");
const keyLenVal = document.getElementById("key-len-val");
const keyCharset = document.getElementById("key-charset");
const keyCount = document.getElementById("key-count");
const keyPrefix = document.getElementById("key-prefix");
const keysGenBtn = document.getElementById("keys-gen-btn");
const keysOutput = document.getElementById("keys-output");
const copyKeysBtn = document.getElementById("copy-keys-btn");
const downloadKeysBtn = document.getElementById("download-keys-btn");
const copyTooltipKeys = document.getElementById("copy-tooltip-keys");

// State
let activeTab = "shuffler"; // shuffler or key-gen

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    tabShuffler.addEventListener("click", () => switchTab("shuffler"));
    tabKeyGen.addEventListener("click", () => switchTab("key-gen"));

    // Action Mode switch (Shuffle vs Pick)
    randomizeMode.addEventListener("change", () => {
        if (randomizeMode.value === "pick") {
            pickCountGroup.style.display = "block";
            shuffleBtn.textContent = "Draw Items";
        } else {
            pickCountGroup.style.display = "none";
            shuffleBtn.textContent = "Shuffle List";
        }
    });

    // Length slider update
    keyLength.addEventListener("input", (e) => {
        keyLenVal.textContent = e.target.value;
    });

    // Shuffler Actions
    shuffleBtn.addEventListener("click", processShuffler);
    copyShuffledBtn.addEventListener("click", () => copyTextToClipboard(listOutput.value, copyTooltipShuffled));
    downloadShuffledBtn.addEventListener("click", () => downloadTextFile(listOutput.value, "toolcanvas_shuffled_output.txt"));

    // Key Gen Actions
    keysGenBtn.addEventListener("click", processKeyGenerator);
    copyKeysBtn.addEventListener("click", () => copyTextToClipboard(keysOutput.value, copyTooltipKeys));
    downloadKeysBtn.addEventListener("click", () => downloadTextFile(keysOutput.value, "toolcanvas_generated_keys.txt"));
});

// Tab Switcher logic
function switchTab(tab) {
    activeTab = tab;
    if (tab === "shuffler") {
        tabShuffler.classList.add("active");
        tabKeyGen.classList.remove("active");
        panelShuffler.style.display = "block";
        panelKeyGen.style.display = "none";
    } else {
        tabShuffler.classList.remove("active");
        tabKeyGen.classList.add("active");
        panelShuffler.style.display = "none";
        panelKeyGen.style.display = "block";
    }
}

// Secure random helper
function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

// Parse input string using selected divider
function parseInputItems(inputVal, delimiterType) {
    let items = [];
    if (delimiterType === "newline") {
        items = inputVal.split(/\r?\n/);
    } else if (delimiterType === "comma") {
        items = inputVal.split(",");
    } else if (delimiterType === "semicolon") {
        items = inputVal.split(";");
    } else if (delimiterType === "space") {
        items = inputVal.split(/\s+/);
    }

    // Clean whitespace and filter out empty cells
    return items.map(item => item.trim()).filter(item => item.length > 0);
}

// Format output array back into string using selected divider
function formatOutputItems(outputArr, delimiterType) {
    if (delimiterType === "newline") {
        return outputArr.join("\r\n");
    } else if (delimiterType === "comma") {
        return outputArr.join(", ");
    } else if (delimiterType === "semicolon") {
        return outputArr.join("; ");
    } else if (delimiterType === "space") {
        return outputArr.join(" ");
    }
    return outputArr.join("\r\n");
}

// Main Process for Shuffler Tab
function processShuffler() {
    const rawVal = listInput.value;
    if (!rawVal.trim()) {
        alert("Please enter some items in the input list first!");
        return;
    }

    const delimiter = listDelimiter.value;
    const items = parseInputItems(rawVal, delimiter);

    if (items.length === 0) {
        alert("No valid items found to randomize.");
        return;
    }

    const mode = randomizeMode.value;

    if (mode === "shuffle") {
        const shuffled = shuffleArray(items);
        listOutput.value = formatOutputItems(shuffled, delimiter);
    } else {
        // Pick mode
        const countToPick = parseInt(pickCount.value);
        if (isNaN(countToPick) || countToPick < 1) {
            alert("Please enter a valid count of items to pick.");
            return;
        }

        const allowDuplicates = chkAllowDuplicates.checked;
        const picked = [];

        if (allowDuplicates) {
            // Pick with replacement
            for (let i = 0; i < countToPick; i++) {
                picked.push(items[getSecureRandomInt(items.length)]);
            }
        } else {
            // Pick without replacement
            if (countToPick > items.length) {
                alert("Cannot pick more items than the input list contains without duplicates enabled.");
                return;
            }
            const shuffled = shuffleArray(items);
            for (let i = 0; i < countToPick; i++) {
                picked.push(shuffled[i]);
            }
        }

        listOutput.value = formatOutputItems(picked, delimiter);
    }
}

// Main Process for Key Gen Tab
function processKeyGenerator() {
    const count = parseInt(keyCount.value);
    const length = parseInt(keyLength.value);
    const charsetType = keyCharset.value;
    const prefix = keyPrefix.value;

    if (isNaN(count) || count < 1) {
        alert("Please enter a valid number of keys to generate.");
        return;
    }

    const charPools = {
        alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        numeric: "0123456789",
        hex: "0123456789abcdef",
        alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz"
    };

    const pool = charPools[charsetType] || charPools.alphanumeric;
    const keys = [];

    for (let i = 0; i < count; i++) {
        let key = "";
        for (let j = 0; j < length; j++) {
            key += pool[getSecureRandomInt(pool.length)];
        }
        keys.push(prefix + key);
    }

    keysOutput.value = keys.join("\r\n");
}

// Helper to copy text to clipboard
function copyTextToClipboard(text, tooltipEl) {
    if (!text || text.trim() === "") return;

    navigator.clipboard.writeText(text).then(() => {
        tooltipEl.classList.add("show");
        setTimeout(() => {
            tooltipEl.classList.remove("show");
        }, 1500);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}

// Helper to download text files
function downloadTextFile(text, filename) {
    if (!text || text.trim() === "") return;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
