/* =========================================
   ToolCanvas — Video Screenshot Tool Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const videoInput = document.getElementById("video-input");
    const capturerWorkspace = document.getElementById("capturer-workspace");
    const mainVideo = document.getElementById("main-video");
    const canvas = document.getElementById("render-canvas");
    const ctx = canvas.getContext("2d");

    // Controls
    const timeSeeker = document.getElementById("time-seeker");
    const timestampDisplay = document.getElementById("timestamp-display");
    const btnPlay = document.getElementById("btn-play");
    const btnPrevFrame = document.getElementById("btn-prev-frame");
    const btnNextFrame = document.getElementById("btn-next-frame");

    // Export Settings
    const exportFormat = document.getElementById("export-format");
    const exportQuality = document.getElementById("export-quality");
    const qualityGroup = document.getElementById("quality-group");
    const qualityDisplay = document.getElementById("quality-display");

    // Capture Actions
    const btnCaptureFrame = document.getElementById("btn-capture-frame");
    const btnCopyClipboard = document.getElementById("btn-copy-clipboard");

    // Captured Snapshots Panel
    const capturedCount = document.getElementById("captured-count");
    const snapshotsGrid = document.getElementById("snapshots-grid");
    const emptyMsg = document.getElementById("empty-msg");
    const groupActions = document.getElementById("group-actions");
    const btnReset = document.getElementById("btn-reset");
    const btnClearAll = document.getElementById("btn-clear-all");
    const btnDownloadAll = document.getElementById("btn-download-all");

    // Session State
    let currentVideoFile = null;
    let objectUrl = null;
    let isVideoPlaying = false;
    let capturedFrames = [];

    // Quality slider display toggle
    exportFormat.addEventListener("change", () => {
        if (exportFormat.value === "image/png") {
            qualityGroup.style.display = "none";
        } else {
            qualityGroup.style.display = "flex";
        }
    });

    exportQuality.addEventListener("input", (e) => {
        qualityDisplay.textContent = `${e.target.value}%`;
    });

    // Drag and Drop Video Selectors
    dropZone.addEventListener("click", () => videoInput.click());

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
            loadVideo(files[0]);
        }
    });

    videoInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            loadVideo(e.target.files[0]);
        }
    });

    // Initialize Video State
    function loadVideo(file) {
        if (!file.type.startsWith("video/")) {
            alert("Incompatible File Type: Please select a valid video file.");
            return;
        }

        currentVideoFile = file;
        
        // Reset previous sessions
        resetWorkspace();

        objectUrl = URL.createObjectURL(file);
        mainVideo.src = objectUrl;
        mainVideo.load();

        mainVideo.onloadedmetadata = () => {
            // Setup seeker
            timeSeeker.min = 0;
            timeSeeker.max = mainVideo.duration;
            timeSeeker.value = 0;
            timeSeeker.step = 0.001; // millisecond scrubbing

            updateTimerDisplay(0, mainVideo.duration);

            dropZone.style.display = "none";
            capturerWorkspace.style.display = "block";
        };

        mainVideo.ontimeupdate = () => {
            timeSeeker.value = mainVideo.currentTime;
            updateTimerDisplay(mainVideo.currentTime, mainVideo.duration);
        };

        // Fallback error handler
        mainVideo.onerror = () => {
            alert("Error Loading Video: The browser could not decode or load the video timeline.");
            resetWorkspace();
        };
    }

    // Timer display update helper
    function updateTimerDisplay(curr, dur) {
        timestampDisplay.textContent = `${formatTimestamp(curr)} / ${formatTimestamp(dur)}`;
    }

    function formatTimestamp(sec) {
        if (isNaN(sec) || sec === Infinity) return "00:00.000";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 1000);
        
        const pad2 = (val) => val < 10 ? "0" + val : val;
        const pad3 = (val) => val < 100 ? (val < 10 ? "00" + val : "0" + val) : val;
        
        return `${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
    }

    // Playback Navigation Event Listeners
    btnPlay.addEventListener("click", () => {
        if (isVideoPlaying) {
            mainVideo.pause();
            isVideoPlaying = false;
            btnPlay.textContent = "Play";
        } else {
            mainVideo.play();
            isVideoPlaying = true;
            btnPlay.textContent = "Pause";
        }
    });

    timeSeeker.addEventListener("input", (e) => {
        if (isVideoPlaying) {
            mainVideo.pause();
            isVideoPlaying = false;
            btnPlay.textContent = "Play";
        }
        mainVideo.currentTime = parseFloat(e.target.value);
    });

    btnPrevFrame.addEventListener("click", () => {
        stepFrame(-0.1);
    });

    btnNextFrame.addEventListener("click", () => {
        stepFrame(0.1);
    });

    function stepFrame(stepSeconds) {
        if (isVideoPlaying) {
            mainVideo.pause();
            isVideoPlaying = false;
            btnPlay.textContent = "Play";
        }
        let targetTime = mainVideo.currentTime + stepSeconds;
        targetTime = Math.max(0, Math.min(mainVideo.duration, targetTime));
        mainVideo.currentTime = targetTime;
    }

    // Capture Frame Logic
    btnCaptureFrame.addEventListener("click", () => {
        if (!mainVideo.videoWidth || !mainVideo.videoHeight) return;

        // Sync canvas resolution dynamically to match video stream resolution
        canvas.width = mainVideo.videoWidth;
        canvas.height = mainVideo.videoHeight;

        // Draw video frame on canvas
        ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);

        const format = exportFormat.value;
        const quality = format === "image/png" ? 1 : parseInt(exportQuality.value) / 100;
        
        const dataUrl = canvas.toDataURL(format, quality);

        // Approximate file size from base64 string length
        const base64Content = dataUrl.split(",")[1];
        const approxBytes = Math.round(base64Content.length * 0.75);

        const newFrame = {
            id: Date.now(),
            timestamp: mainVideo.currentTime,
            timestampStr: formatTimestamp(mainVideo.currentTime),
            format: format.split("/")[1].toUpperCase(),
            size: formatBytes(approxBytes),
            dataUrl: dataUrl
        };

        capturedFrames.push(newFrame);
        renderSnapshotsGrid();

        // Button Click micro-animation feedback
        const originalHtml = btnCaptureFrame.innerHTML;
        btnCaptureFrame.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
            <span>Captured!</span>
        `;
        setTimeout(() => {
            btnCaptureFrame.innerHTML = originalHtml;
        }, 1200);
    });

    // Copy to Clipboard (High-Wow Feature)
    btnCopyClipboard.addEventListener("click", () => {
        if (!mainVideo.videoWidth || !mainVideo.videoHeight) return;

        canvas.width = mainVideo.videoWidth;
        canvas.height = mainVideo.videoHeight;
        ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);

        // Copying works best by generating a PNG blob
        canvas.toBlob((blob) => {
            if (!blob) {
                alert("Clipboard Error: Canvas conversion failed.");
                return;
            }
            
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            navigator.clipboard.write([clipboardItem]).then(() => {
                const originalHtml = btnCopyClipboard.innerHTML;
                btnCopyClipboard.innerHTML = `
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
                    <span>Copied PNG to Clipboard!</span>
                `;
                setTimeout(() => {
                    btnCopyClipboard.innerHTML = originalHtml;
                }, 2000);
            }).catch(() => {
                alert("Clipboard Security Block: This feature is blocked by your browser. Copy actions usually require active user focus and secure HTTPS connections.");
            });
        }, "image/png");
    });

    // Format bytes to human readable sizes
    function formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    // Render Snapshots list cards
    function renderSnapshotsGrid() {
        // Clear grid
        snapshotsGrid.innerHTML = "";

        if (capturedFrames.length === 0) {
            snapshotsGrid.appendChild(emptyMsg);
            capturedCount.textContent = "0 frames captured";
            groupActions.style.display = "none";
            return;
        }

        emptyMsg.remove();
        capturedCount.textContent = `${capturedFrames.length} frame(s) captured`;
        groupActions.style.display = "flex";

        capturedFrames.forEach((frame) => {
            const card = document.createElement("div");
            card.className = "snapshot-card";

            card.innerHTML = `
                <div class="snap-thumb-wrapper">
                    <img class="snap-thumb" src="${frame.dataUrl}" alt="Snapshot at ${frame.timestampStr}">
                </div>
                <div class="snap-info">
                    <div class="snap-time">${frame.timestampStr}</div>
                    <div class="snap-meta">
                        <span>Format: ${frame.format}</span>
                        <span>Size: ${frame.size}</span>
                    </div>
                </div>
                <div class="snap-actions">
                    <button type="button" class="btn snap-btn-delete" data-id="${frame.id}">Delete</button>
                    <button type="button" class="btn snap-btn-download" data-id="${frame.id}">Download</button>
                </div>
            `;

            // Delete click event
            card.querySelector(".snap-btn-delete").addEventListener("click", () => {
                deleteFrame(frame.id);
            });

            // Download click event
            card.querySelector(".snap-btn-download").addEventListener("click", () => {
                downloadFrame(frame);
            });

            snapshotsGrid.appendChild(card);
        });
    }

    // Delete single snapshot
    function deleteFrame(id) {
        capturedFrames = capturedFrames.filter(frame => frame.id !== id);
        renderSnapshotsGrid();
    }

    // Download single snapshot file
    function downloadFrame(frame) {
        const downloadAnchor = document.createElement("a");
        const baseName = currentVideoFile.name.substring(0, currentVideoFile.name.lastIndexOf('.')) || "video";
        const fileExt = frame.format.toLowerCase();

        downloadAnchor.setAttribute("href", frame.dataUrl);
        downloadAnchor.setAttribute("download", `${baseName}_frame_${frame.timestampStr.replace(':', '-').replace('.', '-')}.${fileExt}`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // Group Action: Download All Snapshots Sequentially
    btnDownloadAll.addEventListener("click", () => {
        if (capturedFrames.length === 0) return;

        // Sequentially trigger downloads to prevent browser throttling
        capturedFrames.forEach((frame, idx) => {
            setTimeout(() => {
                downloadFrame(frame);
            }, idx * 250);
        });
    });

    // Group Action: Clear All Snapshots
    btnClearAll.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all captured snapshots?")) {
            capturedFrames = [];
            renderSnapshotsGrid();
        }
    });

    // Group Action: Change Video / Reset Workspace
    btnReset.addEventListener("click", () => {
        mainVideo.pause();
        mainVideo.onerror = null;
        mainVideo.onloadedmetadata = null;
        mainVideo.src = "";
        
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }

        currentVideoFile = null;
        isVideoPlaying = false;
        capturedFrames = [];
        videoInput.value = "";
        btnPlay.textContent = "Play";

        renderSnapshotsGrid();

        capturerWorkspace.style.display = "none";
        dropZone.style.display = "block";
    });

    // Reset workspace completely when exiting page or unloading
    function resetWorkspace() {
        mainVideo.pause();
        mainVideo.src = "";
        isVideoPlaying = false;
        btnPlay.textContent = "Play";
        capturedFrames = [];
        renderSnapshotsGrid();
    }
});
