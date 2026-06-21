/* =========================================
   ToolCanvas — Business Name Generator Script
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // Industry vocabulary databases
    const dataByIndustry = {
        tech: {
            roots: ["Cyber", "Quantum", "Byte", "Apex", "Cloud", "Synapse", "Hyper", "Nexus", "Core", "Grid", "Optima", "Volt", "Vertex", "Nano", "Helix", "Silicon", "Altus", "Prism", "Pixel", "Vector", "Bit", "Data", "Matrix", "Krypton", "Zeta", "Cognitive", "Synthetix", "Pulse", "Stratum"],
            suffixes: ["Labs", "Solutions", "Grid", "Net", "Systems", "Tech", "Digital", "Intelligence", "Logic", "Flow", "Node", "Base", "Link", "Loop", "Space", "Works", "Engine", "Metrics", "Hub", "Scale", "Lab", "Wave", "Point"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Accelerating digital futures.",
                "Smart intelligence, simplified.",
                "Next-generation software solutions.",
                "Powering the digital ecosystem.",
                "Innovating beyond limits.",
                "The infrastructure for tomorrow.",
                "Engineered for high performance.",
                "Transforming pixels into progress.",
                "Connecting data, empowering minds.",
                "Reimagining what technology can do."
            ]
        },
        creative: {
            roots: ["Velvet", "Loom", "Pixel", "Prism", "Bold", "Canvas", "Neon", "Spark", "Craft", "Hue", "Flow", "Flare", "Vivid", "Sketch", "Wave", "Odd", "Story", "Think", "Studio", "Fable", "Design", "Concept", "Melt", "Form", "Echo", "Primal", "Duo", "Solo", "Forge"],
            suffixes: ["Agency", "Studios", "Design", "Media", "Creative", "Labs", "Collective", "Press", "Brand", "Concept", "Ink", "Hub", "Room", "House", "Lab", "Arts", "Society", "Space", "Guild", "Studio", "Network"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Crafting bold brand experiences.",
                "Where ideas find their form.",
                "Creative ideas, real results.",
                "Designing memorable digital stories.",
                "Visual concepts with purpose.",
                "Making brands stand out.",
                "Design that speaks volumes.",
                "Shaping the identity of tomorrow.",
                "Artistic integrity, modern strategy.",
                "Igniting commercial imagination."
            ]
        },
        finance: {
            roots: ["Apex", "Crest", "Vanguard", "Oak", "Sterling", "Summit", "Trust", "Capital", "Shield", "Crown", "Merit", "Legacy", "Haven", "Charter", "Anchor", "Beacon", "Fortress", "Sentry", "Stone", "Valour", "Veritas", "Iron", "Marble", "Equator", "Cairn", "Spire"],
            suffixes: ["Advisors", "Partners", "Wealth", "Capital", "Consulting", "Trust", "Equity", "Management", "Holdings", "Securities", "Group", "Associates", "Ventures", "Advisory", "Fund", "Partnership", "Solutions"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Securing wealth across generations.",
                "Strategic advice for sustainable growth.",
                "Grounded advice, reliable execution.",
                "Your partners in financial clarity.",
                "Navigating complex financial paths.",
                "Building lasting capital.",
                "Preserving values, securing futures.",
                "Grounded in trust, geared for growth.",
                "Expert guidance, reliable metrics.",
                "Strategic investment planning."
            ]
        },
        wellness: {
            roots: ["Aura", "Lotus", "Bloom", "Zen", "Vital", "Sol", "Pure", "Nature", "Eco", "Breathe", "Haven", "Oasis", "Heal", "Earth", "Spirit", "Leaf", "Silk", "Meadow", "Clarity", "Rise", "Cure", "Glow", "Sana", "True", "Herb", "Green", "Fresh", "Dew", "Sage"],
            suffixes: ["Wellness", "Health", "Life", "Care", "Therapy", "Space", "Living", "Sanctuary", "Path", "Flow", "Balance", "Roots", "Clinic", "Vibe", "Organics", "Essentials", "Retreat", "Labs", "Center", "Studio"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Restoring balance to daily living.",
                "Pure products for natural health.",
                "Nourishing mind, body, and spirit.",
                "Your path to holistic wellness.",
                "Everyday care for healthy lives.",
                "Sustainable roots for mindful living.",
                "Feel better, live deeper.",
                "Where nature meets modern science.",
                "Pure living, revitalized energy.",
                "Healthy balances, happier moments."
            ]
        },
        retail: {
            roots: ["Vault", "Loom", "Bazaar", "Thread", "Market", "Shelf", "Hub", "Prime", "Cart", "Trend", "Style", "Pack", "Box", "Lane", "West", "North", "Coast", "Deck", "Coop", "Direct", "Stock", "Source", "Find", "Standard", "Bulk", "Row", "Glove", "Yard"],
            suffixes: ["Shop", "Market", "Co", "Collective", "Outlet", "Store", "Goods", "Depot", "Closet", "Cart", "Corner", "Boutique", "Merchants", "Supply", "Warehouse", "Guild", "Studio", "Box", "West", "North"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Curated goods for everyday life.",
                "Premium products delivered directly.",
                "Quality essentials, simple prices.",
                "Your daily essentials hub.",
                "Modern products, timeless quality.",
                "Shop smart, live beautifully.",
                "Exceptional products, everyday utility.",
                "Bringing quality to your doorstep.",
                "Handcrafted goods with integrity.",
                "Modern shopping, simplified layout."
            ]
        },
        generic: {
            roots: ["Alpha", "Omnia", "Nova", "Stellar", "Orion", "Atlas", "Unity", "Vibe", "True", "Grand", "Peak", "Swift", "Horizon", "Liberty", "Choice", "First", "Royal", "Prime", "Imperial", "Elite", "Focus", "Direct", "Beacon", "Vanguard", "Catalyst", "Core", "Global"],
            suffixes: ["Group", "Global", "Services", "Ventures", "Unlimited", "Direct", "Line", "Way", "Point", "Source", "Hub", "Union", "Enterprises", "Alliance", "Corporation", "Holdings", "Partners", "Systems"],
            abstractEndings: ["ify", "ly", "io", "ia", "ora", "ix", "ux", "a", "o", "ex", "is", "us", "ry"],
            slogans: [
                "Leading service with integrity.",
                "Simplifying your daily tasks.",
                "Reliable solutions when they matter.",
                "Quality services for global needs.",
                "Your trusted everyday partner.",
                "Delivering excellence consistently.",
                "Efficiency combined with reliability.",
                "Making business operations smoother.",
                "Modern strategies, simple practices.",
                "Helping you perform at your peak."
            ]
        }
    };

    let generatedResults = [];

    // Sync Slider value
    countSlider.addEventListener('input', (e) => {
        countValSpan.textContent = e.target.value;
    });

    // Helper functions
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Generator logic
    function generateBusinessNames() {
        const industry = industrySelect.value;
        const style = styleSelect.value;
        const count = parseInt(countSlider.value, 10);
        const includeSlogan = slogansCheckbox.checked;

        const db = dataByIndustry[industry];
        generatedResults = [];

        // Temporary arrays to avoid duplicates during a single generation run
        const usedNames = new Set();

        for (let i = 0; i < count; i++) {
            let name = "";
            let slogan = "";

            // Retry loops to generate unique names
            let attempts = 0;
            while (attempts < 50) {
                const root1 = getRandomElement(db.roots);
                
                if (style === 'modern') {
                    // Simple Root + modern suffix or single root
                    if (Math.random() > 0.4) {
                        name = root1 + " " + getRandomElement(["Labs", "Co", "Studio", "Inc", "Flow", "Hub", "Core", "Point", "Base"]);
                    } else {
                        name = root1;
                    }
                } else if (style === 'classic') {
                    // Traditional style: Root + Classic Suffix
                    const classicSuffix = getRandomElement(db.suffixes);
                    name = root1 + " " + classicSuffix;
                } else if (style === 'abstract') {
                    // Root + abstract ending
                    const ending = getRandomElement(db.abstractEndings);
                    let base = root1.toLowerCase();
                    
                    // Remove double vowels or tidy up endings
                    if (base.endsWith('a') || base.endsWith('e') || base.endsWith('i') || base.endsWith('o') || base.endsWith('u')) {
                        base = base.slice(0, -1);
                    }
                    name = capitalize(base + ending);
                } else if (style === 'compound') {
                    // Join two roots together
                    let root2 = getRandomElement(db.roots);
                    while (root2 === root1) {
                        root2 = getRandomElement(db.roots);
                    }
                    name = root1 + root2;
                }

                if (!usedNames.has(name)) {
                    usedNames.add(name);
                    break;
                }
                attempts++;
            }

            if (includeSlogan) {
                slogan = getRandomElement(db.slogans);
            }

            generatedResults.push({ name, slogan });
        }

        renderResults();
    }

    // Render results in HTML list
    function renderResults() {
        namesList.innerHTML = '';

        if (generatedResults.length === 0) {
            namesList.innerHTML = '<li class="names-empty">Click "Generate Names" to start brainstorming brand ideas!</li>';
            return;
        }

        generatedResults.forEach(item => {
            const li = document.createElement('li');
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'name-item-title';
            titleSpan.textContent = item.name;
            li.appendChild(titleSpan);

            if (item.slogan) {
                const descSpan = document.createElement('span');
                descSpan.className = 'name-item-desc';
                descSpan.textContent = `“${item.slogan}”`;
                li.appendChild(descSpan);
            }

            namesList.appendChild(li);
        });
    }

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        if (generatedResults.length === 0) return;

        const textToCopy = generatedResults.map(item => {
            return item.slogan ? `${item.name} - ${item.slogan}` : item.name;
        }).join('\n');

        navigator.clipboard.writeText(textToCopy).then(() => {
            copyTooltip.classList.add('show');
            setTimeout(() => {
                copyTooltip.classList.remove('show');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Could not copy text automatically. Please select and copy manually.');
        });
    });

    // Download as Text File
    downloadBtn.addEventListener('click', () => {
        if (generatedResults.length === 0) return;

        const textContent = generatedResults.map((item, idx) => {
            return item.slogan ? `${idx + 1}. ${item.name}\n   Slogan: “${item.slogan}”\n` : `${idx + 1}. ${item.name}\n`;
        }).join('\n');

        const headerInfo = "=========================================\n" +
                           "Generated Business Names - ToolCanvas\n" +
                           "Operational Year: 2026\n" +
                           "=========================================\n\n";

        const blob = new Blob([headerInfo + textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'toolcanvas-business-names.txt';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Event Listeners
    generateBtn.addEventListener('click', generateBusinessNames);

    // Run initial generation on load
    generateBusinessNames();
});
