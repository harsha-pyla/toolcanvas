// =========================================
// ToolCanvas — String Randomizer Script
// Archetype B — Generate with list of results
// =========================================

const tabShuffler = document.getElementById("tab-shuffler");
const tabKeyGen = document.getElementById("tab-key-gen");
const panelShuffler = document.getElementById("panel-shuffler");
const panelKeyGen = document.getElementById("panel-key-gen");
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

let activeTab = "shuffler";

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

window.addEventListener("DOMContentLoaded", () => {
    tabShuffler.addEventListener("click", () => switchTab("shuffler"));
    tabKeyGen.addEventListener("click", () => switchTab("key-gen"));
    randomizeMode.addEventListener("change", () => {
        if (randomizeMode.value === "pick") {
            pickCountGroup.style.display = "block";
            shuffleBtn.textContent = "Draw Items";
        } else {
            pickCountGroup.style.display = "none";
            shuffleBtn.textContent = "Shuffle List";
        }
    });
    updateRangeFill(keyLength);
    keyLength.addEventListener("input", (e) => {
        keyLenVal.textContent = e.target.value;
        updateRangeFill(e.target);
    });
    shuffleBtn.addEventListener("click", processShuffler);
    copyShuffledBtn.addEventListener("click", () => copyWithSwap(copyShuffledBtn, copyTooltipShuffled, listOutput.value, "Output copied"));
    downloadShuffledBtn.addEventListener("click", () => downloadTextFile(listOutput.value, "toolcanvas_shuffled_output.txt"));
    keysGenBtn.addEventListener("click", processKeyGenerator);
    copyKeysBtn.addEventListener("click", () => copyWithSwap(copyKeysBtn, copyTooltipKeys, keysOutput.value, "Keys copied"));
    downloadKeysBtn.addEventListener("click", () => downloadTextFile(keysOutput.value, "toolcanvas_generated_keys.txt"));
    initFAQ();
});

function switchTab(tab) {
    activeTab = tab;
    if (tab === "shuffler") {
        tabShuffler.classList.add("active"); tabShuffler.setAttribute("aria-selected","true");
        tabKeyGen.classList.remove("active"); tabKeyGen.setAttribute("aria-selected","false");
        panelShuffler.style.display = "block";
        panelKeyGen.style.display = "none";
    } else {
        tabShuffler.classList.remove("active"); tabShuffler.setAttribute("aria-selected","false");
        tabKeyGen.classList.add("active"); tabKeyGen.setAttribute("aria-selected","true");
        panelShuffler.style.display = "none";
        panelKeyGen.style.display = "block";
    }
}
function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
    }
    return arr;
}
function parseInputItems(inputVal, delimiterType) {
    let items = [];
    if (delimiterType === "newline") items = inputVal.split(/\r?\n/);
    else if (delimiterType === "comma") items = inputVal.split(",");
    else if (delimiterType === "semicolon") items = inputVal.split(";");
    else if (delimiterType === "space") items = inputVal.split(/\s+/);
    return items.map(item => item.trim()).filter(item => item.length > 0);
}
function formatOutputItems(outputArr, delimiterType) {
    if (delimiterType === "newline") return outputArr.join("\r\n");
    else if (delimiterType === "comma") return outputArr.join(", ");
    else if (delimiterType === "semicolon") return outputArr.join("; ");
    else if (delimiterType === "space") return outputArr.join(" ");
    return outputArr.join("\r\n");
}
function processShuffler() {
    const rawVal = listInput.value;
    if (!rawVal.trim()) { alert("Please enter some items in the input list first!"); return; }
    const delimiter = listDelimiter.value;
    const items = parseInputItems(rawVal, delimiter);
    if (items.length === 0) { alert("No valid items found to randomize."); return; }
    const mode = randomizeMode.value;
    if (mode === "shuffle") {
        const shuffled = shuffleArray(items);
        listOutput.value = formatOutputItems(shuffled, delimiter);
        flashTextarea(listOutput);
    } else {
        const countToPick = parseInt(pickCount.value);
        if (isNaN(countToPick) || countToPick < 1) { alert("Please enter a valid count of items to pick."); return; }
        const allowDuplicates = chkAllowDuplicates.checked;
        const picked = [];
        if (allowDuplicates) {
            for (let i = 0; i < countToPick; i++) picked.push(items[getSecureRandomInt(items.length)]);
        } else {
            if (countToPick > items.length) { alert("Cannot pick more items than the input list contains without duplicates enabled."); return; }
            const shuffled = shuffleArray(items);
            for (let i = 0; i < countToPick; i++) picked.push(shuffled[i]);
        }
        listOutput.value = formatOutputItems(picked, delimiter);
        flashTextarea(listOutput);
    }
}
function flashTextarea(el) {
    el.style.transition = "border-color 200ms";
    el.style.borderColor = "var(--accent-green)";
    setTimeout(() => el.style.borderColor = "", 400);
}
function processKeyGenerator() {
    const count = parseInt(keyCount.value);
    const length = parseInt(keyLength.value);
    const charsetType = keyCharset.value;
    const prefix = keyPrefix.value;
    if (isNaN(count) || count < 1) { alert("Please enter a valid number of keys to generate."); return; }
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
        for (let j = 0; j < length; j++) key += pool[getSecureRandomInt(pool.length)];
        keys.push(prefix + key);
    }
    keysOutput.value = keys.join("\r\n");
    flashTextarea(keysOutput);
}
function copyWithSwap(btn, tooltipEl, text, liveMsg) {
    if (!text || text.trim() === "") return;
    const original = btn.innerHTML;
    const liveEl = document.getElementById(btn.id === "copy-shuffled-btn" ? "copy-live-shuffled" : "copy-live-keys");
    navigator.clipboard.writeText(text).then(() => {
        // swap icon to check
        const check = iconCheckSVG();
        // keep tooltip if present
        const tooltipHTML = tooltipEl ? '<span class="tooltip show">Copied!</span>' : '';
        // preserve structure: replace inner but keep tooltip
        btn.innerHTML = check + tooltipHTML;
        btn.classList.add("copied");
        if (liveEl) liveEl.textContent = liveMsg || "Copied";
        if (tooltipEl) tooltipEl.classList.add("show");
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove("copied"); if (tooltipEl) tooltipEl.classList.remove("show"); }, 1200);
        setTimeout(() => btn.classList.remove("copied"), 200);
    }).catch(err => console.error("Failed to copy", err));
}
function downloadTextFile(text, filename) {
    if (!text || text.trim() === "") return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function initFAQ() {
    document.querySelectorAll(".faq-item").forEach(item => {
        const btn = item.querySelector(".faq-question");
        if (!btn) return;
        btn.addEventListener("click", () => {
            const open = item.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
    });
}
