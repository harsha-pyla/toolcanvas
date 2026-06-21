/* =========================================
   ToolCanvas — Video Thumbnail Generator Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const mediaInput = document.getElementById("media-input");
    const editorWorkspace = document.getElementById("editor-workspace");
    const canvas = document.getElementById("thumbnail-canvas");
    const ctx = canvas.getContext("2d");

    // Hidden Video Element
    const hiddenVideo = document.getElementById("hidden-video");

    // Controls
    const presetButtons = document.querySelectorAll(".btn-preset");
    const timelineCard = document.getElementById("timeline-card");
    const frameSeeker = document.getElementById("frame-seeker");
    const videoTimer = document.getElementById("video-timer");
    const btnPlayPause = document.getElementById("btn-play-pause");

    // Text Customizer Controls
    const overlayText = document.getElementById("overlay-text");
    const textFont = document.getElementById("text-font");
    const textSize = document.getElementById("text-size");
    const textColor = document.getElementById("text-color");
    const strokeColor = document.getElementById("stroke-color");
    const textAlign = document.getElementById("text-align");
    const shadowBlur = document.getElementById("shadow-blur");

    // Badge Customizer Controls
    const badgeText = document.getElementById("badge-text");
    const badgeColor = document.getElementById("badge-color");

    // Filters Controls
    const filterBrightness = document.getElementById("filter-brightness");
    const filterContrast = document.getElementById("filter-contrast");
    const filterBlur = document.getElementById("filter-blur");
    const gradientOverlay = document.getElementById("gradient-overlay");

    // Action Buttons
    const btnReset = document.getElementById("btn-reset");
    const btnDownload = document.getElementById("btn-download");

    // Editor State variables
    let backgroundSource = null; // Can be img or hiddenVideo
    let sourceType = ""; // "image" or "video"
    let bgImage = null; // Holds loaded Image object if image
    let isPlaying = false;
    let objectUrl = null;

    // Text position variables (in canvas coordinate space)
    let textX = 640;
    let textY = 540;
    let isDraggingText = false;
    let dragStartX = 0;
    let dragStartY = 0;

    // Default Canvas Size (YouTube Thumbnail 16:9)
    canvas.width = 1280;
    canvas.height = 720;

    // Drag & Drop Media loading
    dropZone.addEventListener("click", () => mediaInput.click());

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            loadMedia(files[0]);
        }
    });

    mediaInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            loadMedia(e.target.files[0]);
        }
    });

    // Load Image or Video
    function loadMedia(file) {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }

        objectUrl = URL.createObjectURL(file);

        if (file.type.startsWith("video/")) {
            sourceType = "video";
            backgroundSource = hiddenVideo;
            hiddenVideo.src = objectUrl;
            hiddenVideo.load();
            timelineCard.style.display = "block";
            isPlaying = false;
            btnPlayPause.textContent = "Play";

            hiddenVideo.onloadedmetadata = () => {
                // Initialize timeline seeker
                frameSeeker.min = 0;
                frameSeeker.max = hiddenVideo.duration;
                frameSeeker.value = 0;
                updateTimerText(0, hiddenVideo.duration);

                // Set initial text position centered at bottom
                textX = canvas.width / 2;
                textY = canvas.height * 0.75;

                // Wait a moment for frame to load then render
                hiddenVideo.currentTime = 0;
            };

            hiddenVideo.onseeked = () => {
                renderCanvas();
            };

            hiddenVideo.ontimeupdate = () => {
                frameSeeker.value = hiddenVideo.currentTime;
                updateTimerText(hiddenVideo.currentTime, hiddenVideo.duration);
                renderCanvas();
            };
        } else if (file.type.startsWith("image/")) {
            sourceType = "image";
            timelineCard.style.display = "none";
            
            bgImage = new Image();
            bgImage.src = objectUrl;
            backgroundSource = bgImage;
            
            bgImage.onload = () => {
                // Set initial text position centered at bottom
                textX = canvas.width / 2;
                textY = canvas.height * 0.75;
                renderCanvas();
            };
        } else {
            alert("Incompatible Format: Please select an image or video file.");
            return;
        }

        dropZone.style.display = "none";
        editorWorkspace.style.display = "block";
    }

    // Timer display formatter
    function updateTimerText(curr, dur) {
        const format = (t) => {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
        };
        videoTimer.textContent = `${format(curr)} / ${format(dur)}`;
    }

    // Video Playback Controls
    btnPlayPause.addEventListener("click", () => {
        if (sourceType !== "video") return;
        if (isPlaying) {
            hiddenVideo.pause();
            isPlaying = false;
            btnPlayPause.textContent = "Play";
        } else {
            hiddenVideo.play();
            isPlaying = true;
            btnPlayPause.textContent = "Pause";
        }
    });

    frameSeeker.addEventListener("input", (e) => {
        if (sourceType !== "video") return;
        if (isPlaying) {
            hiddenVideo.pause();
            isPlaying = false;
            btnPlayPause.textContent = "Play";
        }
        hiddenVideo.currentTime = parseFloat(e.target.value);
    });

    // Dimension Preset Switch
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            presetButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const w = parseInt(btn.getAttribute("data-w"));
            const h = parseInt(btn.getAttribute("data-h"));
            
            // Adjust canvas properties
            canvas.width = w;
            canvas.height = h;

            // Recenter text overlay on resolution change
            textX = w / 2;
            textY = h * 0.75;
            
            renderCanvas();
        });
    });

    // Dragging text logic directly on preview canvas
    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mousemove", dragText);
    window.addEventListener("mouseup", stopDrag);

    canvas.addEventListener("touchstart", startDrag, { passive: false });
    canvas.addEventListener("touchmove", dragText, { passive: false });
    window.addEventListener("touchend", stopDrag);

    function startDrag(e) {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = (clientX - rect.left) * (canvas.width / rect.width);
        const clickY = (clientY - rect.top) * (canvas.height / rect.height);

        // Standard bounding area check centered around text
        // Allow dragging from anywhere inside the canvas, prioritizing shifting position
        isDraggingText = true;
        dragStartX = clickX - textX;
        dragStartY = clickY - textY;
    }

    function dragText(e) {
        if (!isDraggingText) return;
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = (clientX - rect.left) * (canvas.width / rect.width);
        const currentY = (clientY - rect.top) * (canvas.height / rect.height);

        textX = Math.round(currentX - dragStartX);
        textY = Math.round(currentY - dragStartY);

        // Clamp to canvas borders
        textX = Math.max(0, Math.min(canvas.width, textX));
        textY = Math.max(0, Math.min(canvas.height, textY));

        renderCanvas();
    }

    function stopDrag() {
        isDraggingText = false;
    }

    // Input listeners to trigger real-time re-rendering
    const liveControls = [
        overlayText, textFont, textSize, textColor, strokeColor, textAlign, shadowBlur,
        badgeText, badgeColor,
        filterBrightness, filterContrast, filterBlur, gradientOverlay
    ];

    liveControls.forEach(ctrl => {
        ctrl.addEventListener("input", renderCanvas);
        ctrl.addEventListener("change", renderCanvas);
    });

    // Main Canvas Render Loop
    function renderCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!backgroundSource) return;

        // 1. Draw Background Media with Cover Alignment
        ctx.save();
        
        // Apply filters to background drawing context
        const brightness = filterBrightness.value;
        const contrast = filterContrast.value;
        const blurValue = filterBlur.value;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blurValue}px)`;

        // Calculate aspect ratios for coverage (fill cover)
        let sourceW, sourceH;
        if (sourceType === "video") {
            sourceW = hiddenVideo.videoWidth || 1280;
            sourceH = hiddenVideo.videoHeight || 720;
        } else {
            sourceW = bgImage.width || 1280;
            sourceH = bgImage.height || 720;
        }

        const canvasRatio = canvas.width / canvas.height;
        const mediaRatio = sourceW / sourceH;

        let sx = 0, sy = 0, sw = sourceW, sh = sourceH;

        if (mediaRatio > canvasRatio) {
            // Media is wider, crop horizontal margins
            sw = sourceH * canvasRatio;
            sx = (sourceW - sw) / 2;
        } else {
            // Media is taller, crop vertical margins
            sh = sourceW / canvasRatio;
            sy = (sourceH - sh) / 2;
        }

        // Draw image frame covering full canvas
        ctx.drawImage(backgroundSource, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 2. Bottom Shadow Gradient Overlay
        const overlayMode = gradientOverlay.value;
        if (overlayMode !== "none") {
            const gradientHeight = overlayMode === "full" ? canvas.height : canvas.height * 0.45;
            const startY = overlayMode === "full" ? 0 : canvas.height - gradientHeight;
            const grad = ctx.createLinearGradient(0, startY, 0, canvas.height);
            
            grad.addColorStop(0, "rgba(0, 0, 0, 0)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0.75)");

            ctx.fillStyle = grad;
            ctx.fillRect(0, startY, canvas.width, gradientHeight);
        }

        // 3. Draw Corner Badge
        const label = badgeText.value.trim().toUpperCase();
        if (label) {
            ctx.save();
            ctx.font = "bold 20px 'Inter', sans-serif";
            const textWidth = ctx.measureText(label).width;
            
            const badgeW = textWidth + 24;
            const badgeH = 36;
            const bx = 20;
            const by = 20;

            // Draw rounded badge rectangle
            ctx.fillStyle = badgeColor.value;
            ctx.beginPath();
            ctx.roundRect(bx, by, badgeW, badgeH, 6);
            ctx.fill();

            // Draw text centered in badge
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, bx + badgeW / 2, by + badgeH / 2 + 1);
            ctx.restore();
        }

        // 4. Draw Typography Text Overlay
        const textMsg = overlayText.value.trim();
        if (textMsg) {
            ctx.save();
            const fSize = parseInt(textSize.value);
            const fFamily = textFont.value;
            
            ctx.font = `900 ${fSize}px '${fFamily}', Impact, sans-serif`;
            ctx.textAlign = textAlign.value;
            ctx.textBaseline = "middle";

            // Outline styling (stroke)
            ctx.strokeStyle = strokeColor.value;
            ctx.lineWidth = Math.max(4, fSize / 7);
            ctx.lineJoin = "round";

            // Glow / Shadow effect
            const bRadius = parseInt(shadowBlur.value);
            if (bRadius > 0) {
                ctx.shadowColor = strokeColor.value;
                ctx.shadowBlur = bRadius;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            // Fill color
            ctx.fillStyle = textColor.value;

            // Handle multi-line break strings
            const lines = textMsg.split("\\n");
            const lineHeight = fSize * 1.15;
            const totalHeight = lineHeight * (lines.length - 1);
            
            lines.forEach((line, index) => {
                const lineY = textY + (index * lineHeight) - (totalHeight / 2);
                ctx.strokeText(line, textX, lineY);
                ctx.fillText(line, textX, lineY);
            });
            
            ctx.restore();
        }
    }

    // Action: Download Created Thumbnail
    btnDownload.addEventListener("click", () => {
        if (!backgroundSource) return;

        // Force a re-render to make sure canvas has latest settings
        renderCanvas();

        const imageQuality = 0.92;
        const downloadAnchor = document.createElement("a");
        
        downloadAnchor.setAttribute("href", canvas.toDataURL("image/jpeg", imageQuality));
        downloadAnchor.setAttribute("download", `thumbnail_${Date.now()}.jpg`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Action: Reset Workspace / Change Media
    btnReset.addEventListener("click", resetWorkspace);

    function resetWorkspace() {
        hiddenVideo.pause();
        hiddenVideo.src = "";
        
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }

        backgroundSource = null;
        sourceType = "";
        bgImage = null;
        isPlaying = false;
        isDraggingText = false;
        mediaInput.value = "";

        // Reset text positions
        textX = 640;
        textY = 540;

        // Reset control values to default
        overlayText.value = "MY FIRST THUMBNAIL";
        textSize.value = "48";
        filterBrightness.value = "100";
        filterContrast.value = "100";
        filterBlur.value = "0";
        badgeText.value = "";

        editorWorkspace.style.display = "none";
        dropZone.style.display = "block";
    }
});
