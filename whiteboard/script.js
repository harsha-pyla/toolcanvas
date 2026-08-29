/* =========================================
   ToolCanvas — Infinite Whiteboard Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas Initialization
    const canvas = document.getElementById('whiteboard-canvas');
    const ctx = canvas.getContext('2d');

    // DOM UI Elements
    const zoomPercentSpan = document.getElementById('zoom-percent');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const shareBtn = document.getElementById('share-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const bgToggleGroup = document.getElementById('bg-toggle-group');
    const preserveDataCheckbox = document.getElementById('setting-preserve-data');
    const showShortcutsBtn = document.getElementById('show-shortcuts-btn');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const closeShortcutsModal = document.getElementById('close-shortcuts-modal');
    
    // Tools Docks
    const toolButtons = document.querySelectorAll('.btn-tool');
    const colorButtons = document.querySelectorAll('.btn-color');
    const customColorPicker = document.getElementById('custom-color-picker');
    const customColorLabel = document.getElementById('custom-color-label');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    const sizePreviewDot = document.getElementById('size-preview-dot');
    const sizeDockSection = document.getElementById('size-dock-section');

    // Footers / Drawers / Dialogs
    const drawerToggle = document.getElementById('drawer-toggle');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const newBoardBtn = document.getElementById('new-board-btn');
    const recentDrawingsList = document.getElementById('recent-drawings-list');
    const aboutTriggerBtn = document.getElementById('about-trigger-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutModal = document.getElementById('close-about-modal');
    const panIndicatorArrow = document.getElementById('pan-indicator-arrow');

    // State Variables
    let strokes = []; // Array of drawn strokes: { tool, color, width, points: [{x, y}] }
    let undoHistory = [];
    let redoHistory = [];
    
    let isDrawing = false;
    let isPanning = false;
    let activeTool = 'pen'; // hand, pen, pencil, eraser
    let activeColor = '#1a1a1a';
    let currentStroke = null;
    let toolSizes = {
        pen: 4,
        pencil: 2,
        eraser: 15
    };
    let preActionState = [];
    let erasedAnything = false;

    // Viewport transforms (Infinite zoom/pan)
    let panX = 0;
    let panY = 0;
    let zoom = 1.0;
    const minZoom = 0.1; // 10%
    const maxZoom = 5.0; // 500%
    const gridSize = 40; // spacing for grid/dots

    // Panning & Pointers tracking
    let panStartX = 0;
    let panStartY = 0;
    let spacePressed = false;
    let activePointers = {}; // Track touch pointers for pinch zoom
    let initialTouchDist = 0;
    let initialZoom = 1.0;
    let initialWorldCenter = { x: 0, y: 0 };

    // Settings
    let bgType = 'plain'; // plain, grid, dots
    let preserveData = true;
    let boardId = '';
    let boardName = 'Untitled Sketch';

    
    // ---- Supabase Short Link Helpers (clean, no long hash) ----
    let supabaseClient = null;
    let supabaseConfigPromise = null;
    function getSupabaseConfig() {
        if (!supabaseConfigPromise) {
            supabaseConfigPromise = fetch('/api/supabase-config')
                .then(r => { if (!r.ok) throw new Error('no vercel config'); return r.json(); })
                .then(d => {
                    if (!d.supabaseUrl || !d.supabaseKey) throw new Error('missing creds');
                    return d;
                })
                .catch(() => fetch('../js/local-config.json')
                    .then(r => { if (!r.ok) throw new Error('no local config'); return r.json(); })
                    .catch(() => ({
                        supabaseUrl: 'https://xldublyrjqnlbyfwjpwd.supabase.co',
                        supabaseKey: 'sb_publishable_yjD30uSZL1QRD2_t3_JCTg_lqMExOhT'
                    }))
                );
        }
        return supabaseConfigPromise;
    }
    function loadSupabase(cb) {
        if (window.supabase) {
            if (supabaseClient) { if (cb) cb(supabaseClient); return; }
            getSupabaseConfig().then(cfg => {
                if (!supabaseClient && window.supabase) supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
                if (cb) cb(supabaseClient);
            });
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.onload = () => {
            getSupabaseConfig().then(cfg => {
                if (window.supabase && !supabaseClient) supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
                if (cb) cb(supabaseClient);
            });
        };
        document.head.appendChild(s);
    }
    function generateShortId(len) {
        len = len || 7;
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const arr = new Uint32Array(len);
        window.crypto.getRandomValues(arr);
        let id = '';
        for (let i=0;i<len;i++) id += chars[arr[i] % chars.length];
        return id;
    }
// Base Color Palette
    const colorPalette = ["#1a1a1a", "#2563eb", "#10b981", "#ef4444", "#f59e0b"];

    // -------------------------------------------------------------
    // Viewport Size Management
    // -------------------------------------------------------------
    function resizeCanvas() {
        // Capture size from window bounding rect
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        requestAnimationFrame(render);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // -------------------------------------------------------------
    // Coordinate Conversions
    // -------------------------------------------------------------
    function screenToWorld(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left - panX) / zoom,
            y: (clientY - rect.top - panY) / zoom
        };
    }

    function worldToScreen(worldX, worldY) {
        return {
            x: worldX * zoom + panX,
            y: worldY * zoom + panY
        };
    }

    // -------------------------------------------------------------
    // History & Storage Actions (Optimized Smooth Operations)
    // -------------------------------------------------------------
    let saveTimeout = null;
    function triggerSave(immediate = false) {
        if (!preserveData) return;
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }
        if (immediate) {
            saveBoardToLocalStorage();
        } else {
            saveTimeout = setTimeout(saveBoardToLocalStorage, 1000);
        }
    }

    function commitAction() {
        undoHistory.push(preActionState);
        redoHistory = []; // Clear redo stack on new action
        updateHistoryButtons();
        triggerSave();
    }

    function updateHistoryButtons() {
        undoBtn.disabled = undoHistory.length === 0;
        redoBtn.disabled = redoHistory.length === 0;
    }

    function undo() {
        if (undoHistory.length === 0) return;
        redoHistory.push(structuredClone(strokes));
        strokes = undoHistory.pop();
        updateHistoryButtons();
        triggerSave();
        requestAnimationFrame(render);
    }

    function redo() {
        if (redoHistory.length === 0) return;
        undoHistory.push(structuredClone(strokes));
        strokes = redoHistory.pop();
        updateHistoryButtons();
        triggerSave();
        requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // LocalStorage Preserving
    // -------------------------------------------------------------
    function initBoardSession() {
        let urlParams = new URLSearchParams(window.location.search);
        boardId = urlParams.get('b');
        if (!boardId) {
            const lastList = JSON.parse(localStorage.getItem('toolcanvas_whiteboards') || '[]');
            const lastId = lastList.length ? lastList[0].id : null;
            if (lastId && lastList[0].strokes && lastList[0].strokes.length === 0) {
                boardId = lastId;
            } else {
                boardId = 'board_' + Date.now();
            }
            const url = new URL(window.location.href);
            url.searchParams.set('b', boardId);
            window.history.replaceState({}, '', url);
        }
        boardName = 'Whiteboard ' + new Date().toLocaleDateString();
        
        if (preserveData) {
            const listJson = localStorage.getItem('toolcanvas_whiteboards');
            if (listJson) {
                const list = JSON.parse(listJson);
                const found = list.find(b => b.id === boardId);
                if (found) {
                    strokes = found.strokes || [];
                    bgType = found.bgType || 'plain';
                    boardName = found.name || boardName;
                    
                    // Sync settings background toggles
                    document.querySelectorAll('#bg-toggle-group .btn-toggle').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.bg === bgType);
                    });
                }
            }
        }
        undoHistory = [];
        redoHistory = [];
        updateHistoryButtons();
        renderRecentList();
    }

    function saveBoardToLocalStorage() {
        if (!preserveData) return;
        const isEmptyBoard = strokes.length === 0;
        const listJson = localStorage.getItem('toolcanvas_whiteboards') || '[]';
        let list = JSON.parse(listJson);
        list = list.filter((b, idx, arr) => arr.findIndex(x => x.id === b.id) === idx);
        const boardIdx = list.findIndex(b => b.id === boardId);
        if (isEmptyBoard && boardIdx === -1 && list.length > 0 && list[0].strokes && list[0].strokes.length === 0) {
            return;
        }
        const dataToSave = {
            id: boardId,
            name: boardName,
            timestamp: Date.now(),
            strokes: strokes,
            bgType: bgType
        };
        if (boardIdx !== -1) {
            list.splice(boardIdx, 1);
            list.unshift(dataToSave);
        } else {
            list.unshift(dataToSave);
        }
        if (list.length > 15) {
            list = list.slice(0, 15);
        }
        localStorage.setItem('toolcanvas_whiteboards', JSON.stringify(list));
        renderRecentList();
    }

    function deleteBoardFromLocalStorage(id) {
        const listJson = localStorage.getItem('toolcanvas_whiteboards') || '[]';
        let list = JSON.parse(listJson);
        list = list.filter(b => b.id !== id);
        localStorage.setItem('toolcanvas_whiteboards', JSON.stringify(list));
        
        if (boardId === id) {
            strokes = [];
            undoHistory = [];
            redoHistory = [];
            updateHistoryButtons();
            
            window.location.hash = '';
            const newUrl = window.location.pathname;
            window.history.pushState({}, '', newUrl);
            
            initBoardSession();
            selectTool('pen');
            centerOnContent();
        } else {
            renderRecentList();
        }
    }

    function renderRecentList() {
        recentDrawingsList.innerHTML = '';
        const listJson = localStorage.getItem('toolcanvas_whiteboards');
        let rawList = [];
        try { rawList = JSON.parse(listJson || '[]'); } catch(_) { rawList = []; }
        const seen = new Set();
        const list = [];
        rawList.forEach(b => {
            if (seen.has(b.id)) return;
            seen.add(b.id);
            const isEmpty = !b.strokes || b.strokes.length === 0;
            if (isEmpty && b.id !== boardId) return;
            list.push(b);
        });
        if (list.length === 0) {
            recentDrawingsList.innerHTML = '<li class="empty-recent-msg">No recent sketches yet.</li>';
            return;
        }
        list.forEach(b => {
            const li = document.createElement('li');
            li.className = 'recent-item-container';

            const btn = document.createElement('button');
            btn.className = 'recent-board-btn';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'recent-name';
            nameSpan.textContent = b.name;
            btn.appendChild(nameSpan);

            const timeSpan = document.createElement('span');
            timeSpan.className = 'recent-time';
            timeSpan.textContent = new Date(b.timestamp).toLocaleString();
            btn.appendChild(timeSpan);

            btn.addEventListener('click', () => {
                triggerSave(true);
                // Clear URL hash when opening a local whiteboard
                window.location.hash = '';
                const newUrl = window.location.pathname + '?b=' + b.id;
                window.history.pushState({}, '', newUrl);
                initBoardSession();
                closeAllDialogs();
                centerOnContent(true);
            });
            li.appendChild(btn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-recent';
            deleteBtn.title = 'Delete Sketch';
            deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>`;
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${b.name}"?`)) {
                    deleteBoardFromLocalStorage(b.id);
                }
            });
            li.appendChild(deleteBtn);

            recentDrawingsList.appendChild(li);
        });
    }

    // -------------------------------------------------------------
    // Data Compression & Sharing (Self-Contained Hash Links)
    // -------------------------------------------------------------
    function compressDrawingData(strokeList) {
        const packed = strokeList.map(s => {
            const colorIdx = colorPalette.indexOf(s.color);
            const colorVal = colorIdx !== -1 ? colorIdx : s.color;
            const toolChar = s.tool === 'pen' ? 'p' : (s.tool === 'pencil' ? 'l' : 'e');
            
            // Delta compress points
            let lastX = 0;
            let lastY = 0;
            const pts = s.points.map((p, idx) => {
                const x = Math.round(p.x);
                const y = Math.round(p.y);
                if (idx === 0) {
                    lastX = x;
                    lastY = y;
                    return [x, y];
                }
                const dx = x - lastX;
                const dy = y - lastY;
                lastX = x;
                lastY = y;
                return [dx, dy];
            });
            return [toolChar, colorVal, s.width, pts];
        });
        
        try {
            const jsonStr = JSON.stringify(packed);
            // URL safe Base64 encoding
            return btoa(unescape(encodeURIComponent(jsonStr)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        } catch(e) {
            console.error("Compression error:", e);
            return "";
        }
    }

    function decompressDrawingData(hashStr) {
        if (!hashStr) return [];
        try {
            // Restore URL safe characters
            let base64 = hashStr.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            const jsonStr = decodeURIComponent(escape(atob(base64)));
            const packed = JSON.parse(jsonStr);
            return packed.map(s => {
                const toolChar = s[0];
                const tool = toolChar === 'p' ? 'pen' : (toolChar === 'l' ? 'pencil' : 'eraser');
                let color = s[1];
                if (typeof color === 'number') {
                    color = colorPalette[color] || "#1a1a1a";
                }
                const width = s[2];
                const ptsRaw = s[3];
                
                let lastX = 0;
                let lastY = 0;
                const points = ptsRaw.map((p, idx) => {
                    if (idx === 0) {
                        lastX = p[0];
                        lastY = p[1];
                        return { x: lastX, y: lastY };
                    }
                    lastX += p[0];
                    lastY += p[1];
                    return { x: lastX, y: lastY };
                });
                return { tool, color, width, points };
            });
        } catch(e) {
            console.error("Decompression failed:", e);
            showToast("Failed to load shared drawing: link is invalid.");
            return [];
        }
    }

    async function loadSharedLink() {
        const params = new URLSearchParams(window.location.search);
        const shortId = params.get('s') || params.get('share') || params.get('id');
        if (shortId) {
            showToast("Loading shared whiteboard…");
            loadSupabase(async (supabase) => {
                try {
                    if (!supabase) throw new Error('no supabase');
                    const { data, error } = await supabase.from('whiteboard_shares').select('data, bg').eq('id', shortId).maybeSingle();
                    if (error) throw error;
                    if (!data || !data.data) throw new Error('not found');
                    const loaded = decompressDrawingData(data.data);
                    if (loaded && loaded.length > 0) {
                        strokes = loaded;
                        if (data.bg) { bgType = data.bg; }
                        undoHistory = []; redoHistory = [];
                        updateHistoryButtons();
                        centerOnContent(true);
                        showToast("Shared whiteboard loaded!");
                        return;
                    }
                    throw new Error('empty drawing');
                } catch (e) {
                    console.warn('Short link load failed:', e);
                    showToast("Could not load short link — link may be expired");
                }
            });
            return;
        }
        const hash = window.location.hash.substring(1);
        if (hash) {
            const loadedStrokes = decompressDrawingData(hash);
            if (loadedStrokes && loadedStrokes.length > 0) {
                strokes = loadedStrokes;
                undoHistory = [];
                redoHistory = [];
                updateHistoryButtons();
                centerOnContent(true);
                showToast("Shared drawing loaded successfully!");
            }
        }
    }

    // -------------------------------------------------------------
    // Stroke Eraser Math (Line Segment Proximity check)
    // -------------------------------------------------------------
    function getDistanceToSegment(p, a, b) {
        const x = p.x, y = p.y;
        const x1 = a.x, y1 = a.y;
        const x2 = b.x, y2 = b.y;
        
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
            
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function eraseIntersectingStrokes(worldCoords) {
        const base = toolSizes.eraser * 0.55;
        const threshold = base / Math.max(zoom, 0.5);
        let modified = false;
        
        const nextStrokes = strokes.filter(s => {
            if (s.points.length === 0) return false;
            if (s.points.length === 1) {
                // Point-based distance
                const dx = s.points[0].x - worldCoords.x;
                const dy = s.points[0].y - worldCoords.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < threshold + s.width * 0.4) {
                    modified = true;
                    return false;
                }
                return true;
            }

            // Check distance to all segments
            for (let i = 0; i < s.points.length - 1; i++) {
                const dist = getDistanceToSegment(worldCoords, s.points[i], s.points[i+1]);
                if (dist < threshold + s.width * 0.4) {
                    modified = true;
                    return false; // Erases the entire line stroke
                }
            }
            return true;
        });

        if (modified) {
            strokes = nextStrokes;
            erasedAnything = true;
            requestAnimationFrame(render);
        }
    }

    // -------------------------------------------------------------
    // Core Rendering Loop
    // -------------------------------------------------------------
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Background grid/dots
        drawInfiniteBackground();

        // Apply infinite viewport transformations
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(zoom, zoom);

        // Draw all strokes
        strokes.forEach(s => {
            if (s.points.length === 0) return;
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width;

            // Opacity mapping (Pencil vs. Pen)
            if (s.tool === 'pencil') {
                ctx.globalAlpha = 0.8;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++) {
                ctx.lineTo(s.points[i].x, s.points[i].y);
            }
            ctx.stroke();
        });

        // Draw active drawing stroke
        if (isDrawing && currentStroke && currentStroke.points.length > 0) {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = currentStroke.color;
            ctx.lineWidth = currentStroke.width;

            if (currentStroke.tool === 'pencil') {
                ctx.globalAlpha = 0.8;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
            for (let i = 1; i < currentStroke.points.length; i++) {
                ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
            }
            ctx.stroke();
        }

        ctx.restore();

        // Update direction indicators
        updateDirectionArrow();
    }

    function drawInfiniteBackground() {
        if (bgType === 'plain') return;

        ctx.save();
        ctx.strokeStyle = '#e2e8f0';
        ctx.fillStyle = '#cbd5e1';

        // Viewport bounds in world coordinates
        const xMin = -panX / zoom;
        const xMax = (canvas.width - panX) / zoom;
        const yMin = -panY / zoom;
        const yMax = (canvas.height - panY) / zoom;

        // Dynamic grid cell sizing
        const step = gridSize;
        const startX = Math.floor(xMin / step) * step;
        const startY = Math.floor(yMin / step) * step;

        if (bgType === 'grid') {
            ctx.lineWidth = 1;
            // Draw vertical grid lines
            for (let x = startX; x <= xMax; x += step) {
                const screenPos = worldToScreen(x, 0);
                ctx.beginPath();
                ctx.moveTo(screenPos.x, 0);
                ctx.lineTo(screenPos.x, canvas.height);
                ctx.stroke();
            }
            // Draw horizontal grid lines
            for (let y = startY; y <= yMax; y += step) {
                const screenPos = worldToScreen(0, y);
                ctx.beginPath();
                ctx.moveTo(0, screenPos.y);
                ctx.lineTo(canvas.width, screenPos.y);
                ctx.stroke();
            }
        } else if (bgType === 'dots') {
            const dotRadius = Math.max(1, 1.25 * zoom);
            for (let x = startX; x <= xMax; x += step) {
                for (let y = startY; y <= yMax; y += step) {
                    const screenPos = worldToScreen(x, y);
                    ctx.beginPath();
                    ctx.arc(screenPos.x, screenPos.y, dotRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    }

    // -------------------------------------------------------------
    // Recenter Arrow Direction Indicator
    // -------------------------------------------------------------
    let targetCenterCoords = { x: 0, y: 0 };

    function getContentBoundingBox() {
        if (strokes.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0, count: 0 };
        }
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        strokes.forEach(s => {
            s.points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });
        });
        return { minX, maxX, minY, maxY, count: strokes.length };
    }

    function updateDirectionArrow() {
        const box = getContentBoundingBox();
        
        // Bounding center world coordinates
        const cx = box.count > 0 ? (box.minX + box.maxX) / 2 : 0;
        const cy = box.count > 0 ? (box.minY + box.maxY) / 2 : 0;
        targetCenterCoords = { x: cx, y: cy };

        // Convert world center to screen coordinates
        const sc = worldToScreen(cx, cy);

        // Check if center is visible inside viewport boundaries (with padding)
        const margin = 50;
        const isVisible = (sc.x >= margin && sc.x <= canvas.width - margin &&
                           sc.y >= margin && sc.y <= canvas.height - margin);

        // Do not display recenter arrow if drawing is empty or center is visible
        if (box.count === 0 || isVisible) {
            panIndicatorArrow.classList.add('hidden');
            return;
        }

        panIndicatorArrow.classList.remove('hidden');

        // Bounding position of arrow to screen edges
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        
        const dx = sc.x - screenCenterX;
        const dy = sc.y - screenCenterY;
        const angle = Math.atan2(dy, dx); // Radians

        // Find intersections on border layout rectangle
        const borderPadding = 30;
        const borderW = screenCenterX - borderPadding;
        const borderH = screenCenterY - borderPadding;

        // Ray box intersection math
        let arrowX, arrowY;
        const slope = dy / dx;
        if (Math.abs(slope) <= borderH / borderW) {
            // Intersects left or right edges
            arrowX = dx > 0 ? screenCenterX + borderW : screenCenterX - borderW;
            arrowY = screenCenterY + slope * (arrowX - screenCenterX);
        } else {
            // Intersects top or bottom edges
            arrowY = dy > 0 ? screenCenterY + borderH : screenCenterY - borderH;
            arrowX = screenCenterX + (arrowY - screenCenterY) / slope;
        }

        panIndicatorArrow.style.left = `${arrowX}px`;
        panIndicatorArrow.style.top = `${arrowY}px`;
        
        // Rotate arrow icon SVG relative to slope direction
        const arrowSvg = panIndicatorArrow.querySelector('svg');
        if (arrowSvg) {
            arrowSvg.style.transform = `rotate(${angle * 180 / Math.PI - 90}deg)`;
        }
    }

    function centerOnContent(smooth = false) {
        const box = getContentBoundingBox();
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;

        let targetPanX = screenCenterX;
        let targetPanY = screenCenterY;
        let targetZoom = 1.0;

        if (box.count > 0) {
            const cx = (box.minX + box.maxX) / 2;
            const cy = (box.minY + box.maxY) / 2;
            const contentW = box.maxX - box.minX;
            const contentH = box.maxY - box.minY;

            // Fit content into viewport with padding
            if (contentW > 0 || contentH > 0) {
                const paddingScale = 0.85;
                const zoomX = (canvas.width * paddingScale) / Math.max(contentW, 100);
                const zoomY = (canvas.height * paddingScale) / Math.max(contentH, 100);
                targetZoom = Math.max(minZoom, Math.min(zoomX, zoomY, 1.25)); // Cap maximum auto zoom to 1.25
            }
            
            targetPanX = screenCenterX - cx * targetZoom;
            targetPanY = screenCenterY - cy * targetZoom;
        }

        if (smooth) {
            // Smoothly animate transition over frames
            let startPanX = panX;
            let startPanY = panY;
            let startZoom = zoom;
            let progress = 0;
            const duration = 24; // 24 frames (~400ms)

            function animStep() {
                progress++;
                const t = progress / duration;
                // Easing curve (ease-out cubic)
                const ease = 1 - Math.pow(1 - t, 3);
                
                panX = startPanX + (targetPanX - startPanX) * ease;
                panY = startPanY + (targetPanY - startPanY) * ease;
                zoom = startZoom + (targetZoom - startZoom) * ease;
                
                updateZoomPercent();
                render();

                if (progress < duration) {
                    requestAnimationFrame(animStep);
                }
            }
            requestAnimationFrame(animStep);
        } else {
            panX = targetPanX;
            panY = targetPanY;
            zoom = targetZoom;
            updateZoomPercent();
            requestAnimationFrame(render);
        }
    }

    panIndicatorArrow.addEventListener('click', () => {
        centerOnContent(true);
    });

    // -------------------------------------------------------------
    // Mouse Event Handlers
    // -------------------------------------------------------------
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        // Panning trigger (Spacebar + Left drag, Right button click, Middle scroll wheel click, or Hand tool)
        const isRightClick = e.button === 2;
        const isMiddleClick = e.button === 1;
        const isPanAction = spacePressed || isRightClick || isMiddleClick || activeTool === 'hand';

        if (isPanAction) {
            isPanning = true;
            panStartX = e.clientX - panX;
            panStartY = e.clientY - panY;
            canvas.style.cursor = 'grabbing';
            return;
        }

        // Drawing triggers
        if (e.button === 0) {
            isDrawing = true;
            preActionState = structuredClone(strokes);
            erasedAnything = false;
            const worldPos = screenToWorld(e.clientX, e.clientY);
            
            if (activeTool === 'eraser') {
                eraseIntersectingStrokes(worldPos);
            } else {
                const width = toolSizes[activeTool];
                currentStroke = {
                    tool: activeTool,
                    color: activeColor,
                    width: width,
                    points: [worldPos]
                };
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isPanning) {
            panX = e.clientX - panStartX;
            panY = e.clientY - panStartY;
            requestAnimationFrame(render);
            return;
        }

        if (isDrawing) {
            const worldPos = screenToWorld(e.clientX, e.clientY);

            if (activeTool === 'eraser') {
                eraseIntersectingStrokes(worldPos);
            } else if (currentStroke) {
                // Prevent duplicate consecutive coordinates to save space
                const pts = currentStroke.points;
                if (pts.length > 0) {
                    const last = pts[pts.length - 1];
                    const dist = Math.hypot(last.x - worldPos.x, last.y - worldPos.y);
                    if (dist > 1.5) { // Minimum distance step
                        pts.push(worldPos);
                    }
                } else {
                    pts.push(worldPos);
                }
                requestAnimationFrame(render);
            }
        }
    });

    // Handle viewport edge scrolling
    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = activeTool === 'hand' ? 'grab' : 'crosshair';
        }
        if (isDrawing) {
            isDrawing = false;
            let actionCommitted = false;
            if (activeTool === 'eraser') {
                if (erasedAnything) {
                    actionCommitted = true;
                }
            } else if (currentStroke && currentStroke.points.length > 1) {
                strokes.push(currentStroke);
                actionCommitted = true;
            }
            if (actionCommitted) {
                commitAction();
            }
            currentStroke = null;
            requestAnimationFrame(render);
        }
    });

    // Disable Right-Click Context Menu on canvas to allow panning
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // -------------------------------------------------------------
    // Touch / Mobile Event Handlers (iOS optimized smooth design)
    // -------------------------------------------------------------
    function getTouchDistance(t1, t2) {
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    function getTouchCenter(t1, t2) {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
        };
    }

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        // Capture touch pointer IDs
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            activePointers[touch.identifier] = touch;
        }

        const pointerKeys = Object.keys(activePointers);

        if (pointerKeys.length === 1) {
            // Single finger drawing / panning
            const touch = activePointers[pointerKeys[0]];
            const isPanAction = spacePressed || activeTool === 'hand';

            if (isPanAction) {
                isPanning = true;
                panStartX = touch.clientX - panX;
                panStartY = touch.clientY - panY;
            } else {
                isDrawing = true;
                preActionState = structuredClone(strokes);
                erasedAnything = false;
                const worldPos = screenToWorld(touch.clientX, touch.clientY);
                if (activeTool === 'eraser') {
                    eraseIntersectingStrokes(worldPos);
                } else {
                    const width = toolSizes[activeTool];
                    currentStroke = {
                        tool: activeTool,
                        color: activeColor,
                        width: width,
                        points: [worldPos]
                    };
                }
            }
        } else if (pointerKeys.length === 2) {
            // Multitouch gesture: stop drawing, start pinch/pan viewport
            isDrawing = false;
            currentStroke = null;
            isPanning = true;

            const t1 = activePointers[pointerKeys[0]];
            const t2 = activePointers[pointerKeys[1]];
            
            initialTouchDist = getTouchDistance(t1, t2);
            initialZoom = zoom;

            const center = getTouchCenter(t1, t2);
            panStartX = center.x - panX;
            panStartY = center.y - panY;
            initialWorldCenter = screenToWorld(center.x, center.y);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        // Update active touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (activePointers[touch.identifier] !== undefined) {
                activePointers[touch.identifier] = touch;
            }
        }

        const pointerKeys = Object.keys(activePointers);

        if (pointerKeys.length === 1 && !isPanning && isDrawing && currentStroke) {
            // Single finger drawing
            const touch = activePointers[pointerKeys[0]];
            const worldPos = screenToWorld(touch.clientX, touch.clientY);

            if (activeTool === 'eraser') {
                eraseIntersectingStrokes(worldPos);
            } else {
                const pts = currentStroke.points;
                if (pts.length > 0) {
                    const last = pts[pts.length - 1];
                    const dist = Math.hypot(last.x - worldPos.x, last.y - worldPos.y);
                    if (dist > 1.5) {
                        pts.push(worldPos);
                    }
                } else {
                    pts.push(worldPos);
                }
                requestAnimationFrame(render);
            }
        } else if (pointerKeys.length === 1 && isPanning) {
            // Single finger panning
            const touch = activePointers[pointerKeys[0]];
            panX = touch.clientX - panStartX;
            panY = touch.clientY - panStartY;
            requestAnimationFrame(render);
        } else if (pointerKeys.length === 2 && isPanning) {
            // Pinch-to-zoom and two-finger panning simultaneously
            const t1 = activePointers[pointerKeys[0]];
            const t2 = activePointers[pointerKeys[1]];

            const currentDist = getTouchDistance(t1, t2);
            const center = getTouchCenter(t1, t2);

            // Calculate zoom scale
            if (initialTouchDist > 0) {
                const scale = currentDist / initialTouchDist;
                zoom = Math.max(minZoom, Math.min(initialZoom * scale, maxZoom));
                updateZoomPercent();
            }

            // Sync translation offset relative to the zoom center
            panX = center.x - initialWorldCenter.x * zoom;
            panY = center.y - initialWorldCenter.y * zoom;

            requestAnimationFrame(render);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        // Clear finished touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            delete activePointers[touch.identifier];
        }

        // Clean flags
        if (Object.keys(activePointers).length === 0) {
            if (isPanning) {
                isPanning = false;
            }
            if (isDrawing) {
                isDrawing = false;
                let actionCommitted = false;
                if (activeTool === 'eraser') {
                    if (erasedAnything) {
                        actionCommitted = true;
                    }
                } else if (currentStroke && currentStroke.points.length > 1) {
                    strokes.push(currentStroke);
                    actionCommitted = true;
                }
                if (actionCommitted) {
                    commitAction();
                }
                currentStroke = null;
                requestAnimationFrame(render);
            }
        } else {
            // Recalculate pan start for remaining finger to prevent coordinate jump
            const pointerKeys = Object.keys(activePointers);
            if (pointerKeys.length === 1 && isPanning) {
                const touch = activePointers[pointerKeys[0]];
                panStartX = touch.clientX - panX;
                panStartY = touch.clientY - panY;
            }
        }
    });

    canvas.addEventListener('touchcancel', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            delete activePointers[e.changedTouches[i].identifier];
        }
        isDrawing = false;
        isPanning = false;
        currentStroke = null;
        requestAnimationFrame(render);
    });

    // -------------------------------------------------------------
    // Zooming Actions
    // -------------------------------------------------------------
    function updateZoomPercent() {
        zoomPercentSpan.textContent = `${Math.round(zoom * 100)}%`;
    }

    function zoomTo(nextZoom, centerX = canvas.width / 2, centerY = canvas.height / 2) {
        const worldCoords = screenToWorld(centerX, centerY);
        zoom = Math.max(minZoom, Math.min(nextZoom, maxZoom));
        panX = centerX - worldCoords.x * zoom;
        panY = centerY - worldCoords.y * zoom;
        updateZoomPercent();
        requestAnimationFrame(render);
    }

    // Scroll Wheel zoom logic centered at cursor
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = 1.08;
        const nextZoom = e.deltaY < 0 ? zoom * factor : zoom / factor;
        zoomTo(nextZoom, e.clientX, e.clientY);
    }, { passive: false });

    // Header zoom click controls
    zoomInBtn.addEventListener('click', () => {
        zoomTo(zoom * 1.2);
    });

    zoomOutBtn.addEventListener('click', () => {
        zoomTo(zoom / 1.2);
    });

    // -------------------------------------------------------------
    // Keyboard Event Handlers
    // -------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        // Spacebar panning toggle
        if (e.code === 'Space') {
            if (!spacePressed) {
                spacePressed = true;
                if (!isDrawing) {
                    canvas.style.cursor = 'grab';
                }
            }
            // Prevent browser scroll behaviors
            if (e.target === document.body || e.target === canvas) {
                e.preventDefault();
            }
        }

        // Tool Selectors
        if (e.key === 'p' || e.key === 'P') {
            selectTool('pen');
        }
        if (e.key === 'l' || e.key === 'L') {
            selectTool('pencil');
        }
        if (e.key === 'e' || e.key === 'E') {
            selectTool('eraser');
        }
        if (e.key === 'h' || e.key === 'H') {
            selectTool('hand');
        }

        // Undo/Redo Shortcuts
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            redo();
        }

        // Zoom keys
        if ((e.ctrlKey || e.metaKey) && e.key === '=') {
            e.preventDefault();
            zoomInBtn.click();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOutBtn.click();
        }

        if (e.key === 'Escape') {
            closeAllDialogs();
            if (fullscreenBtn && whiteboardAppCard && whiteboardAppCard.classList.contains('maximized')) {
                toggleFullscreen();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spacePressed = false;
            if (!isPanning) {
                canvas.style.cursor = 'crosshair';
            }
        }
    });

    // -------------------------------------------------------------
    // Drawing Dock Interactions (Tools & Color Toggles)
    // -------------------------------------------------------------
    function updateSizePreview() {
        if (!sizePreviewDot) return;
        const size = toolSizes[activeTool] || 4;
        
        // Scale preview dot representation dynamically (reference size 14px)
        const scaleVal = Math.max(0.2, Math.min(size / 14, 2.5));
        sizePreviewDot.style.transform = `scale(${scaleVal})`;
        
        if (activeTool === 'eraser') {
            sizePreviewDot.style.backgroundColor = 'transparent';
            sizePreviewDot.style.border = '1.5px dashed #475569';
        } else {
            sizePreviewDot.style.backgroundColor = activeColor;
            sizePreviewDot.style.border = 'none';
        }
    }

    function selectTool(toolName) {
        activeTool = toolName;
        toolButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolName);
        });

        // Hide/disable panels relative to active tool
        const colorDock = document.getElementById('color-dock-section');
        
        if (activeTool === 'hand') {
            if (colorDock) {
                colorDock.style.opacity = '0.3';
                colorDock.style.pointerEvents = 'none';
            }
            if (sizeDockSection) {
                sizeDockSection.style.opacity = '0.3';
                sizeDockSection.style.pointerEvents = 'none';
            }
            canvas.style.cursor = 'grab';
        } else {
            if (colorDock) {
                colorDock.style.opacity = activeTool === 'eraser' ? '0.3' : '1';
                colorDock.style.pointerEvents = activeTool === 'eraser' ? 'none' : 'auto';
            }
            if (sizeDockSection) {
                sizeDockSection.style.opacity = '1';
                sizeDockSection.style.pointerEvents = 'auto';
            }
            canvas.style.cursor = 'crosshair';
            
            // Adjust range limits and sync size slider
            if (sizeSlider) {
                if (activeTool === 'pen') {
                    sizeSlider.min = 1;
                    sizeSlider.max = 40;
                } else if (activeTool === 'pencil') {
                    sizeSlider.min = 1;
                    sizeSlider.max = 15;
                } else if (activeTool === 'eraser') {
                    sizeSlider.min = 5;
                    sizeSlider.max = 100;
                }
                sizeSlider.value = toolSizes[activeTool];
                if (sizeValue) {
                    sizeValue.textContent = `${toolSizes[activeTool]}px`;
                }
            }
        }
        updateSizePreview();
    }

    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectTool(btn.dataset.tool);
        });
    });

    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('custom-picker-label')) return;
            activeColor = btn.dataset.color;
            
            // Remove active status from all color dots including picker label
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Force tool back to Pen if erasers or hand were active
            if (activeTool === 'eraser' || activeTool === 'hand') {
                selectTool('pen');
            }
            updateSizePreview();
        });
    });

    // Custom Color picker
    customColorPicker.addEventListener('input', (e) => {
        activeColor = e.target.value;
        colorButtons.forEach(b => b.classList.remove('active'));
        customColorLabel.classList.add('active');
        
        if (activeTool === 'eraser' || activeTool === 'hand') {
            selectTool('pen');
        }
        updateSizePreview();
    });

    // Brush Size slider input
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            toolSizes[activeTool] = val;
            if (sizeValue) {
                sizeValue.textContent = `${val}px`;
            }
            updateSizePreview();
        });
    }

    // Undo/Redo Click Triggers
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // -------------------------------------------------------------
    // Header & Popovers Actions
    // -------------------------------------------------------------
    function closeAllDialogs() {
        settingsPopover.classList.add('hidden');
        shortcutsModal.classList.add('hidden');
        aboutModal.classList.add('hidden');
        sideDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
    }

    // Settings Toggle
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPopover.classList.toggle('hidden');
    });

    // Background toggle selections
    bgToggleGroup.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            bgToggleGroup.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bgType = btn.dataset.bg;
            triggerSave(true);
            requestAnimationFrame(render);
        });
    });

    // Preserving toggle
    preserveDataCheckbox.addEventListener('change', (e) => {
        preserveData = e.target.checked;
        if (preserveData) {
            triggerSave(true);
        } else {
            localStorage.removeItem('toolcanvas_whiteboards');
            renderRecentList();
        }
    });

    // Shortcuts modal
    showShortcutsBtn.addEventListener('click', () => {
        closeAllDialogs();
        shortcutsModal.classList.remove('hidden');
    });

    closeShortcutsModal.addEventListener('click', () => {
        shortcutsModal.classList.add('hidden');
    });

    shortcutsModal.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) {
            shortcutsModal.classList.add('hidden');
        }
    });

    // About modal
    aboutTriggerBtn.addEventListener('click', () => {
        closeAllDialogs();
        aboutModal.classList.remove('hidden');
    });

    closeAboutModal.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });

    // Close settings popover on outside clicks
    document.addEventListener('click', (e) => {
        if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPopover.classList.add('hidden');
        }
    });

    // Hamburger Side drawer Toggle
    drawerToggle.addEventListener('click', () => {
        closeAllDialogs();
        sideDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
    });

    drawerClose.addEventListener('click', () => {
        sideDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
    });

    drawerOverlay.addEventListener('click', () => {
        sideDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
    });

    // New Whiteboard Action
    
    function showClearConfirm(onConfirm) {
        const prev = document.getElementById('wb-clear-confirm');
        if (prev) prev.remove();
        let styleTag = document.getElementById('wb-clear-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'wb-clear-styles';
            styleTag.textContent = `
                #wb-clear-confirm {
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,42,0.45);
                    backdrop-filter: blur(3px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100001;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                #wb-clear-confirm.show { opacity: 1; }
                .wb-clear-box {
                    background: #fff;
                    border-radius: 14px;
                    padding: 22px;
                    width: 92%;
                    max-width: 380px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.18);
                    text-align: center;
                    font-family: Inter, system-ui, sans-serif;
                }
                .wb-clear-box h4 { margin: 0 0 8px 0; font-size: 15px; color: #0f172a; }
                .wb-clear-box p { margin: 0 0 18px 0; font-size: 13px; color: #64748b; line-height: 1.4; }
                .wb-clear-actions { display: flex; gap: 10px; justify-content: center; }
                .wb-clear-cancel { flex:1; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; padding:9px; font-size:13px; font-weight:600; cursor:pointer; color:#334155; }
                .wb-clear-ok { flex:1; background:#ef4444; border:none; border-radius:8px; padding:9px; font-size:13px; font-weight:600; cursor:pointer; color:#fff; }
                .wb-clear-ok:hover { background:#dc2626; }
            `;
            document.head.appendChild(styleTag);
        }
        const overlay = document.createElement('div');
        overlay.id = 'wb-clear-confirm';
        overlay.innerHTML = `
            <div class="wb-clear-box">
                <h4>Clear entire board?</h4>
                <p>This will erase all strokes. You can undo with Ctrl+Z.</p>
                <div class="wb-clear-actions">
                    <button class="wb-clear-cancel">Cancel</button>
                    <button class="wb-clear-ok">Clear All</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));
        const close = () => { overlay.classList.remove('show'); setTimeout(()=>overlay.remove(), 200); };
        overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
        overlay.querySelector('.wb-clear-cancel').addEventListener('click', close);
        overlay.querySelector('.wb-clear-ok').addEventListener('click', ()=>{ close(); onConfirm(); });
    }

newBoardBtn.addEventListener('click', () => {
        if (strokes.length === 0) {
            showTopToast('Board is already empty', 1600);
            return;
        }
        showClearConfirm(() => {
            preActionState = structuredClone(strokes);
            commitAction();
            strokes = [];
            updateHistoryButtons();
            window.location.hash = '';
            const newUrl = window.location.pathname + '?b=' + boardId;
            window.history.replaceState({}, '', newUrl);
            triggerSave(true);
            selectTool('pen');
            closeAllDialogs();
            centerOnContent();
            showTopToast('Board cleared', 1800);
        });
    });

    const exportPngBtn = document.getElementById('export-png-btn');
    function exportToPNG() {
        if (strokes.length === 0) {
            showTopToast('Nothing to export — draw first', 1800);
            return;
        }
        const box = getContentBoundingBox();
        const pad = 24;
        const minX = box.minX - pad;
        const minY = box.minY - pad;
        const w = (box.maxX - box.minX) + pad*2;
        const h = (box.maxY - box.minY) + pad*2;
        const exportW = Math.max(800, Math.ceil(w));
        const exportH = Math.max(600, Math.ceil(h));
        const tmp = document.createElement('canvas');
        tmp.width = exportW;
        tmp.height = exportH;
        const tctx = tmp.getContext('2d');
        tctx.fillStyle = '#ffffff';
        tctx.fillRect(0, 0, exportW, exportH);
        if (bgType !== 'plain') {
            tctx.strokeStyle = 'rgba(0,0,0,0.08)';
            tctx.fillStyle = 'rgba(0,0,0,0.12)';
            const step = 40;
            const offsetX = (-minX) % step;
            const offsetY = (-minY) % step;
            if (bgType === 'grid') {
                tctx.lineWidth = 1;
                for (let x = offsetX; x < exportW; x += step) { tctx.beginPath(); tctx.moveTo(x, 0); tctx.lineTo(x, exportH); tctx.stroke(); }
                for (let y = offsetY; y < exportH; y += step) { tctx.beginPath(); tctx.moveTo(0, y); tctx.lineTo(exportW, y); tctx.stroke(); }
            } else if (bgType === 'dots') {
                for (let x = offsetX; x < exportW; x += step) for (let y = offsetY; y < exportH; y += step) { tctx.beginPath(); tctx.arc(x, y, 1.5, 0, Math.PI*2); tctx.fill(); }
            }
        }
        tctx.save();
        tctx.translate(-minX, -minY);
        strokes.forEach(s => {
            if (!s.points.length) return;
            tctx.beginPath();
            tctx.lineCap = 'round';
            tctx.lineJoin = 'round';
            tctx.strokeStyle = s.color;
            tctx.lineWidth = s.width;
            tctx.globalAlpha = s.tool === 'pencil' ? 0.7 : 1;
            tctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i=1;i<s.points.length;i++) tctx.lineTo(s.points[i].x, s.points[i].y);
            tctx.stroke();
        });
        tctx.restore();
        const url = tmp.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `whiteboard-${new Date().toISOString().slice(0,10)}.png`;
        a.click();
        showTopToast('PNG exported', 1800);
        closeAllDialogs();
    }
    if (exportPngBtn) exportPngBtn.addEventListener('click', exportToPNG);

    // Window beforeunload logic
    window.addEventListener('beforeunload', () => {
        triggerSave(true);
    });

    // -------------------------------------------------------------
    // Share Button Action (Compression URL hash generator)
    // -------------------------------------------------------------
    shareBtn.addEventListener('click', () => {
        if (strokes.length === 0) {
            showToast("Draw something on the canvas first before sharing!");
            return;
        }
        const compressed = compressDrawingData(strokes);
        if (!compressed) {
            showToast("Failed to compile drawing data.");
            return;
        }
        const prevHTML = shareBtn.innerHTML;
        shareBtn.disabled = true;
        shareBtn.style.opacity = '0.6';
        shareBtn.style.pointerEvents = 'none';
        showToast("Creating short link…");

        const shortId = generateShortId(7);

        loadSupabase(async (supabase) => {
            try {
                if (!supabase) throw new Error('Supabase not available');
                const { error } = await supabase.from('whiteboard_shares').insert([{ id: shortId, data: compressed, bg: bgType }]);
                if (error) throw error;
                const shortUrl = window.location.origin + window.location.pathname + '?s=' + shortId;
                window.history.replaceState({}, '', shortUrl);
                try { await navigator.clipboard.writeText(shortUrl); } catch(_) {}
                showShareModal(shortUrl);
                showToast("Short link copied!");
            } catch (err) {
                console.warn("Short link failed, falling back to long link:", err && err.message ? err.message : err);
                const fallbackUrl = window.location.origin + window.location.pathname + '#' + compressed;
                try { await navigator.clipboard.writeText(fallbackUrl); } catch(_) {}
                showShareModal(fallbackUrl);
                if (err && err.message && err.message.toLowerCase().includes('whiteboard_shares')) {
                    showToast("Short links need table whiteboard_shares — using long link");
                } else {
                    showToast("Short link unavailable — long link copied");
                }
            } finally {
                shareBtn.disabled = false;
                shareBtn.style.opacity = '';
                shareBtn.style.pointerEvents = '';
                shareBtn.innerHTML = prevHTML;
            }
        });
    });

    // Toast notification utility
    function showToast(message, duration) {
        showTopToast(message, duration || 2600);
    }

    function showTopToast(message, duration) {
        duration = duration || 2600;
        const existing = document.getElementById('wb-top-toast');
        if (existing) existing.remove();
        let styleTag = document.getElementById('wb-toast-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'wb-toast-styles';
            styleTag.textContent = `
                #wb-top-toast {
                    position: fixed;
                    top: 14px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-8px);
                    background: #0f172a;
                    color: #f8fafc;
                    padding: 10px 18px;
                    border-radius: 9999px;
                    font-size: 13px;
                    font-weight: 500;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                    z-index: 100000;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.22s ease, transform 0.22s ease;
                    will-change: opacity, transform;
                    white-space: nowrap;
                    max-width: calc(100vw - 32px);
                    text-align: center;
                    font-family: Inter, system-ui, sans-serif;
                }
                #wb-top-toast.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            `;
            document.head.appendChild(styleTag);
        }
        const el = document.createElement('div');
        el.id = 'wb-top-toast';
        el.textContent = message;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 220);
        }, duration);
    }

    // Clean top-middle share popup — no large modal, no glitch, auto-close
    function showShareModal(shareUrl) {
        const prev = document.getElementById('wb-share-popup');
        if (prev) prev.remove();
        let styleTag = document.getElementById('wb-share-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'wb-share-styles';
            styleTag.textContent = `
                #wb-share-popup {
                    position: fixed;
                    top: 14px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-10px);
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    padding: 10px 12px 10px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 100000;
                    opacity: 0;
                    transition: opacity 0.24s ease, transform 0.24s ease;
                    will-change: opacity, transform;
                    max-width: 560px;
                    width: calc(100% - 24px);
                    font-family: Inter, system-ui, sans-serif;
                }
                #wb-share-popup.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                .wb-share-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #0f172a;
                    white-space: nowrap;
                }
                .wb-share-link {
                    font-size: 12px;
                    color: #334155;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 6px 10px;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .wb-share-copy {
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 7px 14px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .wb-share-copy:active { transform: scale(0.98); }
                .wb-share-close {
                    background: #f1f5f9;
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                .wb-share-close:hover { background: #e2e8f0; color: #0f172a; }
                @media (max-width: 480px) {
                    .wb-share-label { display: none; }
                }
            `;
            document.head.appendChild(styleTag);
        }
        const wrap = document.createElement('div');
        wrap.id = 'wb-share-popup';
        wrap.innerHTML = `
            <span class="wb-share-label">Short link</span>
            <span class="wb-share-link" title="${shareUrl}">${shareUrl}</span>
            <button class="wb-share-copy">Copy</button>
            <button class="wb-share-close" aria-label="Close">&times;</button>
        `;
        document.body.appendChild(wrap);
        requestAnimationFrame(() => wrap.classList.add('show'));
        let closed = false;
        let timer = setTimeout(close, 4200);
        function close() {
            if (closed) return;
            closed = true;
            wrap.classList.remove('show');
            setTimeout(() => wrap.remove(), 240);
        }
        wrap.addEventListener('mouseenter', () => clearTimeout(timer));
        wrap.addEventListener('mouseleave', () => { timer = setTimeout(close, 1800); });
        wrap.querySelector('.wb-share-close').addEventListener('click', close);
        wrap.querySelector('.wb-share-copy').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(shareUrl); } catch(_){ const ta=document.createElement('textarea'); ta.value=shareUrl; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
            const btn = wrap.querySelector('.wb-share-copy');
            const prev = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#10b981';
            showTopToast('Copied!', 1400);
            setTimeout(() => { btn.textContent = prev; btn.style.background = '#0f172a'; }, 1400);
            clearTimeout(timer);
            timer = setTimeout(close, 1600);
        });
        setTimeout(() => {
            const onDocClick = (e) => {
                if (!wrap.contains(e.target)) { close(); document.removeEventListener('click', onDocClick); }
            };
            document.addEventListener('click', onDocClick);
        }, 100);
    }

        // -------------------------------------------------------------
    // Fullscreen / Maximize Toggle Logic
    // -------------------------------------------------------------
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const whiteboardAppCard = document.getElementById('whiteboard-app-card');

    function toggleFullscreen() {
        if (!whiteboardAppCard) return;
        const isMaximized = whiteboardAppCard.classList.contains('maximized');
        
        if (!isMaximized) {
            whiteboardAppCard.classList.add('maximized');
            document.body.classList.add('whiteboard-maximized-active');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/></svg>`;
                fullscreenBtn.title = "Restore Screen";
            }
        } else {
            whiteboardAppCard.classList.remove('maximized');
            document.body.classList.remove('whiteboard-maximized-active');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" id="maximize-icon"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>`;
                fullscreenBtn.title = "Toggle Full Screen (Maximize)";
            }
        }
        
        setTimeout(resizeCanvas, 100);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // -------------------------------------------------------------
    // Initial Startup Procedures
    // -------------------------------------------------------------
    initBoardSession();
    selectTool('pen');
    
    const qp = new URLSearchParams(window.location.search);
    if (qp.get('s') || qp.get('share') || qp.get('id') || window.location.hash) {
        loadSharedLink();
        setTimeout(() => { if (strokes.length===0) centerOnContent(); }, 1200);
    } else {
        centerOnContent();
    }
});
