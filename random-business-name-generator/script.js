/* =========================================
   ToolCanvas — Business Name Generator Script
   Archetype B — Generate with list of results
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const industrySelect = document.getElementById('business-industry');
    const styleSelect = document.getElementById('business-style');
    const countSlider = document.getElementById('name-count');
    const countValSpan = document.getElementById('count-val');
    const slogansCheckbox = document.getElementById('chk-slogans');
    const generateBtn = document.getElementById('generate-btn');
    const namesList = document.getElementById('names-list');
    const copyBtn = document.getElementById('copy-names-btn');
    const copyTooltip = document.getElementById('copy-tooltip');
    const downloadBtn = document.getElementById('download-names-btn');
    const copyLive = document.getElementById('copy-live');

    const dataByIndustry = {
        tech: {
            roots: ["Cyber", "Quantum", "Byte", "Apex", "Cloud", "Synapse", "Hyper", "Nexus", "Core", "Grid", "Optima", "Volt", "Vertex", "Nano", "Helix", "Silicon", "Altus", "Prism", "Pixel", "Vector", "Bit", "Data", "Matrix", "Krypton", "Zeta", "Cognitive", "Synthetix", "Pulse", "Stratum"],
            suffixes: ["Labs", "Solutions", "Grid", "Net", "Systems", "Tech", "Digital", "Intelligence", "Logic", "Flow", "Node", "Base", "Link", "Loop", "Space", "Works", "Engine", "Metrics", "Hub", "Scale", "Lab", "Wave", "Point"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Accelerating digital futures.","Smart intelligence, simplified.","Next-generation software solutions.","Powering the digital ecosystem.","Innovating beyond limits.","The infrastructure for tomorrow.","Engineered for high performance.","Transforming pixels into progress.","Connecting data, empowering minds.","Reimagining what technology can do."]
        },
        creative: {
            roots: ["Velvet", "Loom", "Pixel", "Prism", "Bold", "Canvas", "Neon", "Spark", "Craft", "Hue", "Flow", "Flare", "Vivid", "Sketch", "Wave", "Odd", "Story", "Think", "Studio", "Fable", "Design", "Concept", "Melt", "Form", "Echo", "Primal", "Duo", "Solo", "Forge"],
            suffixes: ["Agency", "Studios", "Design", "Media", "Creative", "Labs", "Collective", "Press", "Brand", "Concept", "Ink", "Hub", "Room", "House", "Lab", "Arts", "Society", "Space", "Guild", "Studio", "Network"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Crafting bold brand experiences.","Where ideas find their form.","Creative ideas, real results.","Designing memorable digital stories.","Visual concepts with purpose.","Making brands stand out.","Design that speaks volumes.","Shaping the identity of tomorrow.","Artistic integrity, modern strategy.","Igniting commercial imagination."]
        },
        finance: {
            roots: ["Apex", "Crest", "Vanguard", "Oak", "Sterling", "Summit", "Trust", "Capital", "Shield", "Crown", "Merit", "Legacy", "Haven", "Charter", "Anchor", "Beacon", "Fortress", "Sentry", "Stone", "Valour", "Veritas", "Iron", "Marble", "Equator", "Cairn", "Spire"],
            suffixes: ["Advisors", "Partners", "Wealth", "Capital", "Consulting", "Trust", "Equity", "Management", "Holdings", "Securities", "Group", "Associates", "Ventures", "Advisory", "Fund", "Partnership", "Solutions"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Securing wealth across generations.","Strategic advice for sustainable growth.","Grounded advice, reliable execution.","Your partners in financial clarity.","Navigating complex financial paths.","Building lasting capital.","Preserving values, securing futures.","Grounded in trust, geared for growth.","Expert guidance, reliable metrics.","Strategic investment planning."]
        },
        wellness: {
            roots: ["Aura", "Lotus", "Bloom", "Zen", "Vital", "Sol", "Pure", "Nature", "Eco", "Breathe", "Haven", "Oasis", "Heal", "Earth", "Spirit", "Leaf", "Silk", "Meadow", "Clarity", "Rise", "Cure", "Glow", "Sana", "True", "Herb", "Green", "Fresh", "Dew", "Sage"],
            suffixes: ["Wellness", "Health", "Life", "Care", "Therapy", "Space", "Living", "Sanctuary", "Path", "Flow", "Balance", "Roots", "Clinic", "Vibe", "Organics", "Essentials", "Retreat", "Labs", "Center", "Studio"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Restoring balance to daily living.","Pure products for natural health.","Nourishing mind, body, and spirit.","Your path to holistic wellness.","Everyday care for healthy lives.","Sustainable roots for mindful living.","Feel better, live deeper.","Where nature meets modern science.","Pure living, revitalized energy.","Healthy balances, happier moments."]
        },
        retail: {
            roots: ["Vault", "Loom", "Bazaar", "Thread", "Market", "Shelf", "Hub", "Prime", "Cart", "Trend", "Style", "Pack", "Box", "Lane", "West", "North", "Coast", "Deck", "Coop", "Direct", "Stock", "Source", "Find", "Standard", "Bulk", "Row", "Glove", "Yard"],
            suffixes: ["Shop", "Market", "Co", "Collective", "Outlet", "Store", "Goods", "Depot", "Closet", "Cart", "Corner", "Boutique", "Merchants", "Supply", "Warehouse", "Guild", "Studio", "Box", "West", "North"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Curated goods for everyday life.","Premium products delivered directly.","Quality essentials, simple prices.","Your daily essentials hub.","Modern products, timeless quality.","Shop smart, live beautifully.","Exceptional products, everyday utility.","Bringing quality to your doorstep.","Handcrafted goods with integrity.","Modern shopping, simplified layout."]
        },
        generic: {
            roots: ["Alpha", "Omnia", "Nova", "Stellar", "Orion", "Atlas", "Unity", "Vibe", "True", "Grand", "Peak", "Swift", "Horizon", "Liberty", "Choice", "First", "Royal", "Prime", "Imperial", "Elite", "Focus", "Direct", "Beacon", "Vanguard", "Catalyst", "Core", "Global"],
            suffixes: ["Group", "Global", "Services", "Ventures", "Unlimited", "Direct", "Line", "Way", "Point", "Source", "Hub", "Union", "Enterprises", "Alliance", "Corporation", "Holdings", "Partners", "Systems"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: ["Leading service with integrity.","Simplifying your daily tasks.","Reliable solutions when they matter.","Quality services for global needs.","Your trusted everyday partner.","Delivering excellence consistently.","Efficiency combined with reliability.","Making business operations smoother.","Modern strategies, simple practices.","Helping you perform at your peak."]
        }
    };

    let generatedResults = [];

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

    updateRangeFill(countSlider);
    countSlider.addEventListener('input', (e) => {
        countValSpan.textContent = e.target.value;
        updateRangeFill(e.target);
    });

    function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

    function generateBusinessNames() {
        const industry = industrySelect.value;
        const style = styleSelect.value;
        const count = parseInt(countSlider.value, 10);
        const includeSlogan = slogansCheckbox.checked;
        const db = dataByIndustry[industry];
        generatedResults = [];
        const usedNames = new Set();
        for (let i = 0; i < count; i++) {
            let name = ""; let slogan = "";
            let attempts = 0;
            while (attempts < 50) {
                const root1 = getRandomElement(db.roots);
                if (style === 'modern') {
                    if (Math.random() > 0.4) name = root1 + " " + getRandomElement(["Labs", "Co", "Studio", "Inc", "Flow", "Hub", "Core", "Point", "Base"]);
                    else name = root1;
                } else if (style === 'classic') {
                    name = root1 + " " + getRandomElement(db.suffixes);
                } else if (style === 'abstract') {
                    const ending = getRandomElement(db.abstractEndings);
                    let base = root1.toLowerCase();
                    if (/[aeiou]$/.test(base)) base = base.slice(0,-1);
                    name = capitalize(base + ending);
                } else if (style === 'compound') {
                    let root2 = getRandomElement(db.roots);
                    while (root2 === root1) root2 = getRandomElement(db.roots);
                    name = root1 + root2;
                }
                if (!usedNames.has(name)) { usedNames.add(name); break; }
                attempts++;
            }
            if (includeSlogan) slogan = getRandomElement(db.slogans);
            generatedResults.push({ name, slogan, industry, style });
        }
        renderResults();
    }

    function renderResults() {
        namesList.innerHTML = '';
        if (generatedResults.length === 0) {
            namesList.innerHTML = '<li class="names-empty">Click "Generate Names" to start brainstorming brand ideas!</li>';
            return;
        }
        generatedResults.forEach((item, idx) => {
            const li = document.createElement('li');
            const stagger = Math.min(idx, 6);
            if (stagger < 6) { li.classList.add("is-animating"); li.style.animationDelay = (stagger * 40) + "ms"; }

            const main = document.createElement('div');
            main.className = "place-card-main";

            const title = document.createElement('div');
            title.className = 'name-item-title';
            title.textContent = item.name;

            const desc = document.createElement('div');
            desc.className = 'name-item-desc';
            if (item.slogan) desc.textContent = "“" + item.slogan + "”";
            else desc.textContent = (item.industry.charAt(0).toUpperCase() + item.industry.slice(1)) + " \u00B7 " + item.style;

            const tagRow = document.createElement('div');
            tagRow.className = 'place-tags';
            const indTag = document.createElement('span');
            indTag.className = 'tag tag-beautiful';
            indTag.textContent = industrySelect.options[industrySelect.selectedIndex].text;
            const styleTag = document.createElement('span');
            styleTag.className = 'tag tag-trip';
            styleTag.textContent = styleSelect.options[styleSelect.selectedIndex].text;
            tagRow.appendChild(indTag);
            tagRow.appendChild(styleTag);

            main.appendChild(title);
            if (item.slogan) main.appendChild(desc);
            main.appendChild(tagRow);

            const actions = document.createElement('div');
            actions.className = 'place-card-actions';
            const copyOne = document.createElement('button');
            copyOne.type = 'button';
            copyOne.className = 'place-copy';
            copyOne.setAttribute('aria-label', 'Copy ' + item.name);
            copyOne.innerHTML = iconCopySVG();
            let t;
            copyOne.addEventListener('click', () => {
                const txt = item.slogan ? item.name + " — " + item.slogan : item.name;
                navigator.clipboard.writeText(txt).then(() => {
                    copyOne.innerHTML = iconCheckSVG();
                    copyOne.classList.add("copied");
                    if (copyLive) copyLive.textContent = "Copied " + item.name;
                    clearTimeout(t);
                    t = setTimeout(() => { copyOne.innerHTML = iconCopySVG(); copyOne.classList.remove("copied"); }, 1200);
                });
            });
            actions.appendChild(copyOne);

            li.appendChild(main);
            li.appendChild(actions);
            namesList.appendChild(li);
        });
    }

    copyBtn.addEventListener('click', () => {
        if (generatedResults.length === 0) return;
        const textToCopy = generatedResults.map(item => item.slogan ? `${item.name} - ${item.slogan}` : item.name).join('\n');
        const originalHTML = copyBtn.innerHTML;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = iconCheckSVG() + '<span class="tooltip show">Copied!</span>';
            copyBtn.classList.add("copied");
            if (copyLive) copyLive.textContent = "Copied " + generatedResults.length + " names";
            if (copyTooltip) copyTooltip.classList.add('show');
            setTimeout(() => { copyBtn.innerHTML = originalHTML; copyBtn.classList.remove("copied"); if (copyTooltip) copyTooltip.classList.remove('show'); }, 1200);
            setTimeout(() => copyBtn.classList.remove("copied"), 200);
        });
    });

    downloadBtn.addEventListener('click', () => {
        if (generatedResults.length === 0) return;
        const textContent = generatedResults.map((item, idx) => item.slogan ? `${idx + 1}. ${item.name}\n   Slogan: “${item.slogan}”\n` : `${idx + 1}. ${item.name}\n`).join('\n');
        const headerInfo = "=========================================\nGenerated Business Names - ToolCanvas\nOperational Year: 2026\n=========================================\n\n";
        const blob = new Blob([headerInfo + textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'toolcanvas-business-names.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

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

    generateBtn.addEventListener('click', generateBusinessNames);
    initFAQ();
    generateBusinessNames();
});
