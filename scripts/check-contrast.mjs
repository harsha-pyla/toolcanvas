// scripts/check-contrast.mjs
function getLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex) {
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

const pairs = [
    { name: 'Light Theme: Ink on Paper', fg: '#14161A', bg: '#FCFCFB' },
    { name: 'Light Theme: Ink on Surface', fg: '#14161A', bg: '#F3F3F0' },
    { name: 'Light Theme: Ink on Marker', fg: '#14161A', bg: '#FFE14D' },
    { name: 'Light Theme: Positive on Paper', fg: '#17603A', bg: '#FCFCFB' },
    { name: 'Light Theme: Negative on Paper', fg: '#A3271B', bg: '#FCFCFB' },
    { name: 'Light Theme: Gray-700 on Paper', fg: '#3d4047', bg: '#FCFCFB' },
    
    { name: 'Dark Theme: Ink on Paper (inverted)', fg: '#FCFCFB', bg: '#14161A' },
    { name: 'Dark Theme: Ink on Surface (inverted)', fg: '#FCFCFB', bg: '#1f2127' },
    { name: 'Dark Theme: Dark Ink on Marker', fg: '#14161A', bg: '#FFE14D' },
    { name: 'Dark Theme: Positive on Paper (inverted)', fg: '#4ade80', bg: '#14161A' },
    { name: 'Dark Theme: Negative on Paper (inverted)', fg: '#f87171', bg: '#14161A' },
    { name: 'Dark Theme: Gray-300 on Paper', fg: '#a4a7af', bg: '#14161A' }
];

let failed = false;

console.log("Checking Contrast Ratios...");
pairs.forEach(pair => {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passed = ratio >= 4.5;
    console.log(`${passed ? '✅' : '❌'} ${pair.name}: ${ratio.toFixed(2)}:1 (${pair.fg} on ${pair.bg})`);
    if (!passed) failed = true;
});

if (failed) {
    console.error("ERROR: Some color pairs fail WCAG AA (4.5:1)");
    process.exit(1);
} else {
    console.log("SUCCESS: All color pairs meet WCAG AA contrast ratio.");
    process.exit(0);
}
