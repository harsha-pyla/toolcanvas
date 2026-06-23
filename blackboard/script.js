/* =========================================
   ToolCanvas — Infinite Blackboard Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas Initialization
    const canvas = document.getElementById('blackboard-canvas');
    const ctx = canvas.getContext('2d');

    // DOM UI Elements
    const zoomPercentSpan = document.getElementById('zoom-percent');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const shareBtn = document.getElementById('share-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const themeToggleGroup = document.getElementById('theme-toggle-group');
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
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const blackboardAppCard = document.getElementById('blackboard-app-card');

    // State Variables
    let strokes = []; // Array of drawn strokes: { tool, color, width, points: [{x, y}] }
    let undoHistory = [];
    let redoHistory = [];
    
    let isDrawing = false;
    let isPanning = false;
    let activeTool = 'pen'; // hand, pen, pencil, eraser
    let activeColor = '#ffffff'; // Default chalk color is white
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
    let boardTheme = 'chalkboard'; // chalkboard (green), charcoal (black), navy (blue)
    let bgType = 'plain'; // plain, grid, dots
    let preserveData = true;
    let boardId = '';
    let boardName = 'Untitled Blackboard';

    // Base chalk color palette
    const colorPalette = ["#ffffff", "#fef08a", "#93c5fd", "#fbcfe8", "#a7f3d0"];

    // -------------------------------------------------------------
    // Viewport Size Management
    // -------------------------------------------------------------
    function resizeCanvas() {
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
        boardId = new URLSearchParams(window.location.search).get('b') || 'blackboard_' + Date.now();
        boardName = 'Blackboard ' + new Date().toLocaleDateString();
        
        if (preserveData) {
            const listJson = localStorage.getItem('toolcanvas_blackboards');
            if (listJson) {
                const list = JSON.parse(listJson);
                const found = list.find(b => b.id === boardId);
                if (found) {
                    strokes = found.strokes || [];
                    bgType = found.bgType || 'plain';
                    boardTheme = found.boardTheme || 'chalkboard';
                    boardName = found.name || boardName;
                    
                    // Sync settings background toggles
                    document.querySelectorAll('#bg-toggle-group .btn-toggle').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.bg === bgType);
                    });

                    // Sync settings theme toggles
                    document.querySelectorAll('#theme-toggle-group .btn-toggle').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.theme === boardTheme);
                    });

                    applyBoardTheme(boardTheme);
                }
            }
        }
        undoHistory = [];
        redoHistory = [];
        updateHistoryButtons();
        renderRecentList();
    }

    function applyBoardTheme(themeName) {
        if (!blackboardAppCard) return;
        const isMaximized = blackboardAppCard.classList.contains('maximized');
        blackboardAppCard.className = 'blackboard-app-card';
        if (isMaximized) {
            blackboardAppCard.classList.add('maximized');
        }
        blackboardAppCard.classList.add('theme-' + themeName);
        requestAnimationFrame(render);
    }

    function saveBoardToLocalStorage() {
        if (!preserveData) return;
        
        const listJson = localStorage.getItem('toolcanvas_blackboards') || '[]';
        let list = JSON.parse(listJson);
        
        const boardIdx = list.findIndex(b => b.id === boardId);
        const dataToSave = {
            id: boardId,
            name: boardName,
            timestamp: Date.now(),
            strokes: strokes,
            bgType: bgType,
            boardTheme: boardTheme
        };

        if (boardIdx !== -1) {
            list[boardIdx] = dataToSave;
        } else {
            list.unshift(dataToSave);
        }

        if (list.length > 15) {
            list = list.slice(0, 15);
        }

        localStorage.setItem('toolcanvas_blackboards', JSON.stringify(list));
        renderRecentList();
    }

    function deleteBoardFromLocalStorage(id) {
        const listJson = localStorage.getItem('toolcanvas_blackboards') || '[]';
        let list = JSON.parse(listJson);
        list = list.filter(b => b.id !== id);
        localStorage.setItem('toolcanvas_blackboards', JSON.stringify(list));
        
        // If we deleted the active board, reset and open a new session
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
        const listJson = localStorage.getItem('toolcanvas_blackboards');
        if (!listJson || JSON.parse(listJson).length === 0) {
            recentDrawingsList.innerHTML = '<li class="empty-recent-msg">No recent sketches yet.</li>';
            return;
        }

        const list = JSON.parse(listJson);
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
                window.location.hash = '';
                const newUrl = window.location.pathname + '?b=' + b.id;
                window.history.pushState({}, '', newUrl);
                initBoardSession();
                closeAllDialogs();
                centerOnContent(true);
            });
            li.appendChild(btn);

            // Trash delete button
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
                    color = colorPalette[color] || "#ffffff";
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

    function loadSharedLink() {
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
        const threshold = toolSizes.eraser / zoom; // Scales tolerance relative to zoom and eraser size
        let modified = false;
        
        const nextStrokes = strokes.filter(s => {
            if (s.points.length === 0) return false;
            if (s.points.length === 1) {
                const dx = s.points[0].x - worldCoords.x;
                const dy = s.points[0].y - worldCoords.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < threshold + s.width / 2) {
                    modified = true;
                    return false;
                }
                return true;
            }

            for (let i = 0; i < s.points.length - 1; i++) {
                const dist = getDistanceToSegment(worldCoords, s.points[i], s.points[i+1]);
                if (dist < threshold + s.width / 2) {
                    modified = true;
                    return false;
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

            if (s.tool === 'pencil') {
                ctx.globalAlpha = 0.7; // Chalky graphite translucency
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
                ctx.globalAlpha = 0.7;
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; // Semi-transparent chalk white grid lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';   // Semi-transparent dots

        const xMin = -panX / zoom;
        const xMax = (canvas.width - panX) / zoom;
        const yMin = -panY / zoom;
        const yMax = (canvas.height - panY) / zoom;

        const step = gridSize;
        const startX = Math.floor(xMin / step) * step;
        const startY = Math.floor(yMin / step) * step;

        if (bgType === 'grid') {
            ctx.lineWidth = 1;
            for (let x = startX; x <= xMax; x += step) {
                const screenPos = worldToScreen(x, 0);
                ctx.beginPath();
                ctx.moveTo(screenPos.x, 0);
                ctx.lineTo(screenPos.x, canvas.height);
                ctx.stroke();
            }
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
        const cx = box.count > 0 ? (box.minX + box.maxX) / 2 : 0;
        const cy = box.count > 0 ? (box.minY + box.maxY) / 2 : 0;
        targetCenterCoords = { x: cx, y: cy };

        const sc = worldToScreen(cx, cy);
        const margin = 50;
        const isVisible = (sc.x >= margin && sc.x <= canvas.width - margin &&
                           sc.y >= margin && sc.y <= canvas.height - margin);

        if (box.count === 0 || isVisible) {
            panIndicatorArrow.classList.add('hidden');
            return;
        }

        panIndicatorArrow.classList.remove('hidden');
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        
        const dx = sc.x - screenCenterX;
        const dy = sc.y - screenCenterY;
        const angle = Math.atan2(dy, dx);

        const borderPadding = 30;
        const borderW = screenCenterX - borderPadding;
        const borderH = screenCenterY - borderPadding;

        let arrowX, arrowY;
        const slope = dy / dx;
        if (Math.abs(slope) <= borderH / borderW) {
            arrowX = dx > 0 ? screenCenterX + borderW : screenCenterX - borderW;
            arrowY = screenCenterY + slope * (arrowX - screenCenterX);
        } else {
            arrowY = dy > 0 ? screenCenterY + borderH : screenCenterY - borderH;
            arrowX = screenCenterX + (arrowY - screenCenterY) / slope;
        }

        panIndicatorArrow.style.left = `${arrowX}px`;
        panIndicatorArrow.style.top = `${arrowY}px`;
        
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

            if (contentW > 0 || contentH > 0) {
                const paddingScale = 0.85;
                const zoomX = (canvas.width * paddingScale) / Math.max(contentW, 100);
                const zoomY = (canvas.height * paddingScale) / Math.max(contentH, 100);
                targetZoom = Math.max(minZoom, Math.min(zoomX, zoomY, 1.25));
            }
            
            targetPanX = screenCenterX - cx * targetZoom;
            targetPanY = screenCenterY - cy * targetZoom;
        }

        if (smooth) {
            let startPanX = panX;
            let startPanY = panY;
            let startZoom = zoom;
            let progress = 0;
            const duration = 24;

            function animStep() {
                progress++;
                const t = progress / duration;
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
        }
    });

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
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            activePointers[touch.identifier] = touch;
        }

        const pointerKeys = Object.keys(activePointers);

        if (pointerKeys.length === 1) {
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
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (activePointers[touch.identifier] !== undefined) {
                activePointers[touch.identifier] = touch;
            }
        }

        const pointerKeys = Object.keys(activePointers);

        if (pointerKeys.length === 1 && !isPanning && isDrawing && currentStroke) {
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
            const touch = activePointers[pointerKeys[0]];
            panX = touch.clientX - panStartX;
            panY = touch.clientY - panStartY;
            requestAnimationFrame(render);
        } else if (pointerKeys.length === 2 && isPanning) {
            const t1 = activePointers[pointerKeys[0]];
            const t2 = activePointers[pointerKeys[1]];

            const currentDist = getTouchDistance(t1, t2);
            const center = getTouchCenter(t1, t2);

            if (initialTouchDist > 0) {
                const scale = currentDist / initialTouchDist;
                zoom = Math.max(minZoom, Math.min(initialZoom * scale, maxZoom));
                updateZoomPercent();
            }

            panX = center.x - initialWorldCenter.x * zoom;
            panY = center.y - initialWorldCenter.y * zoom;

            requestAnimationFrame(render);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            delete activePointers[e.changedTouches[i].identifier];
        }

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

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = 1.08;
        const nextZoom = e.deltaY < 0 ? zoom * factor : zoom / factor;
        zoomTo(nextZoom, e.clientX, e.clientY);
    }, { passive: false });

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
        if (e.code === 'Space') {
            if (!spacePressed) {
                spacePressed = true;
                if (!isDrawing) {
                    canvas.style.cursor = 'grab';
                }
            }
            if (e.target === document.body || e.target === canvas) {
                e.preventDefault();
            }
        }

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

        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            redo();
        }

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
            if (fullscreenBtn && blackboardAppCard && blackboardAppCard.classList.contains('maximized')) {
                toggleFullscreen();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spacePressed = false;
            if (!isPanning) {
                canvas.style.cursor = activeTool === 'hand' ? 'grab' : 'crosshair';
            }
        }
    });

    // -------------------------------------------------------------
    // Drawing Dock Interactions (Tools & Color Toggles)
    // -------------------------------------------------------------
    function updateSizePreview() {
        if (!sizePreviewDot) return;
        const size = toolSizes[activeTool] || 4;
        
        const scaleVal = Math.max(0.2, Math.min(size / 14, 2.5));
        sizePreviewDot.style.transform = `scale(${scaleVal})`;
        
        if (activeTool === 'eraser') {
            sizePreviewDot.style.backgroundColor = 'transparent';
            sizePreviewDot.style.border = '1.5px dashed #94a3b8';
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
            
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (activeTool === 'eraser' || activeTool === 'hand') {
                selectTool('pen');
            }
            updateSizePreview();
        });
    });

    customColorPicker.addEventListener('input', (e) => {
        activeColor = e.target.value;
        colorButtons.forEach(b => b.classList.remove('active'));
        customColorLabel.classList.add('active');
        
        if (activeTool === 'eraser' || activeTool === 'hand') {
            selectTool('pen');
        }
        updateSizePreview();
    });

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

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPopover.classList.toggle('hidden');
    });

    // Theme Toggle Toggles
    themeToggleGroup.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            themeToggleGroup.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            boardTheme = btn.dataset.theme;
            applyBoardTheme(boardTheme);
            triggerSave(true);
        });
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

    preserveDataCheckbox.addEventListener('change', (e) => {
        preserveData = e.target.checked;
        if (preserveData) {
            triggerSave(true);
        } else {
            localStorage.removeItem('toolcanvas_blackboards');
            renderRecentList();
        }
    });

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

    document.addEventListener('click', (e) => {
        if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPopover.classList.add('hidden');
        }
    });

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

    newBoardBtn.addEventListener('click', () => {
        triggerSave(true);
        strokes = [];
        undoHistory = [];
        redoHistory = [];
        updateHistoryButtons();
        
        window.location.hash = '';
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
        
        initBoardSession();
        selectTool('pen');
        closeAllDialogs();
        centerOnContent();
    });

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

        const shareUrl = window.location.origin + window.location.pathname + '#' + compressed;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            showShareModal(shareUrl);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            showShareModal(shareUrl);
        });
    });

    function showToast(message) {
        if (window.showToast) {
            window.showToast(message, 3500);
        } else {
            alert(message);
        }
    }

    // Custom sharing modal with direct app integrations
    function showShareModal(shareUrl) {
        // Ensure style tag exists
        let styleTag = document.getElementById('share-modal-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'share-modal-styles';
            styleTag.textContent = `
                .share-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .share-overlay.active {
                    opacity: 1;
                }
                .share-dialog {
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 32px;
                    width: 90%;
                    max-width: 440px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    position: relative;
                    transform: scale(0.9) translateY(10px);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .share-overlay.active .share-dialog {
                    transform: scale(1) translateY(0);
                }
                .share-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    font-weight: bold;
                    font-size: 18px;
                    transition: all 0.2s ease;
                }
                .share-close-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .share-dialog h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.35rem;
                    color: #0f172a;
                    font-weight: 700;
                }
                .share-dialog p {
                    margin: 0 0 24px 0;
                    font-size: 0.9rem;
                    color: #64748b;
                    line-height: 1.45;
                }
                .share-link-box {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .share-link-input {
                    flex-grow: 1;
                    padding: 12px 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    color: #334155;
                    background: #f8fafc;
                    outline: none;
                    width: 100%;
                }
                .share-copy-btn {
                    background: #0f172a;
                    color: #ffffff;
                    border: none;
                    border-radius: 12px;
                    padding: 0 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .share-copy-btn:hover {
                    background: #1e293b;
                }
                .share-apps-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .share-app-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 500;
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                .share-app-link:hover {
                    transform: translateY(-2px);
                    color: #0f172a;
                }
                .share-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                }
                .share-icon-wrapper svg {
                    width: 22px;
                    height: 22px;
                    fill: currentColor;
                }
                .bg-wa { background: #25d366; }
                .bg-tw { background: #000000; }
                .bg-fb { background: #1877f2; }
                .bg-mail { background: #64748b; }
            `;
            document.head.appendChild(styleTag);
        }

        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'share-overlay';
        
        const mailtoUrl = `mailto:?subject=${encodeURIComponent('My Blackboard Sketch')}&body=${encodeURIComponent('Check out my drawing on ToolCanvas:\n\n' + shareUrl)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my drawing on ToolCanvas! ' + shareUrl)}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my drawing on ToolCanvas! ')}&url=${encodeURIComponent(shareUrl)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

        overlay.innerHTML = `
            <div class="share-dialog">
                <button class="share-close-btn">&times;</button>
                <h3>Share Your Drawing</h3>
                <p>Anyone opening this link can view your sketch directly in their browser.</p>
                
                <div class="share-link-box">
                    <input type="text" class="share-link-input" readonly value="${shareUrl}">
                    <button class="share-copy-btn">Copy</button>
                </div>
                
                <div class="share-apps-grid">
                    <a href="${whatsappUrl}" target="_blank" class="share-app-link">
                        <div class="share-icon-wrapper bg-wa">
                            <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.887-6.968C16.584 1.865 14.12 .84 11.49.84c-5.44 0-9.866 4.421-9.87 9.854 0 1.63.454 3.223 1.317 4.625L1.874 20.89l5.773-1.736zM17.487 14.39c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-1.03-.52-1.92-1.02-2.66-2.28-.2-.35 0-.54.15-.71.135-.15.3-.35.45-.52.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.5-.508-.675-.517-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8 1.01-.275 1.01-1.05 1.01-1.25 1.1-.19.09-.64-.09-1.29-.69-1.75-1.56-2.93-3.97-3.23-4.52-.3-.55-.03-.85.24-1.12.25-.24.52-.58.78-.88.26-.3.35-.5.52-.83.18-.33.09-.63-.04-.88-.13-.25-.925-2.225-1.275-3.05-.34-.81-.69-.7-1.12-.7-.3 0-.6-.05-.9.1-.3.15-1.175 1.15-1.175 2.8 0 1.65 1.2 3.25 1.365 3.48.165.225 2.36 3.6 5.72 5.05.8.35 1.425.56 1.912.72.805.257 1.54.22 2.115.135.64-.095 1.78-.73 2.03-1.435.25-.705.25-1.31.175-1.435-.075-.125-.275-.2-.575-.35z"/></svg>
                        </div>
                        <span>WhatsApp</span>
                    </a>
                    <a href="${twitterUrl}" target="_blank" class="share-app-link">
                        <div class="share-icon-wrapper bg-tw">
                            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </div>
                        <span>X (Twitter)</span>
                    </a>
                    <a href="${facebookUrl}" target="_blank" class="share-app-link">
                        <div class="share-icon-wrapper bg-fb">
                            <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.85z"/></svg>
                        </div>
                        <span>Facebook</span>
                    </a>
                    <a href="${mailtoUrl}" class="share-app-link">
                        <div class="share-icon-wrapper bg-mail">
                            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                        <span>Email</span>
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Force layout reflow to trigger overlay CSS transition
        overlay.offsetWidth;
        overlay.classList.add('active');

        function closeShareModal() {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }

        // Dismiss on clicking background overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeShareModal();
        });

        // Close on close button click
        const closeBtn = overlay.querySelector('.share-close-btn');
        closeBtn.addEventListener('click', closeShareModal);

        // Manual copy button action
        const copyBtn = overlay.querySelector('.share-copy-btn');
        const linkInput = overlay.querySelector('.share-link-input');

        copyBtn.addEventListener('click', () => {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            
            navigator.clipboard.writeText(shareUrl).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#10b981';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.style.background = '#0f172a';
                }, 2000);
                showToast("Link copied to clipboard!");
            }).catch(err => {
                console.error("Clipboard copy failed:", err);
            });
        });
    }

    // -------------------------------------------------------------
    // Fullscreen / Maximize Toggle Logic
    // -------------------------------------------------------------
    function toggleFullscreen() {
        if (!blackboardAppCard) return;
        const isMaximized = blackboardAppCard.classList.contains('maximized');
        
        if (!isMaximized) {
            blackboardAppCard.classList.add('maximized');
            document.body.classList.add('blackboard-maximized-active');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/></svg>`;
                fullscreenBtn.title = "Restore Screen";
            }
        } else {
            blackboardAppCard.classList.remove('maximized');
            document.body.classList.remove('blackboard-maximized-active');
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
    
    if (window.location.hash) {
        loadSharedLink();
    } else {
        centerOnContent();
    }
});
