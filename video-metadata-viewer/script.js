/* =========================================
   ToolCanvas — Video Metadata Viewer Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const resultsPanel = document.getElementById("results-panel");
    const videoPreview = document.getElementById("video-preview");

    // Metadata Elements
    const metaFilename = document.getElementById("meta-filename");
    const metaFilesize = document.getElementById("meta-filesize");
    const metaMimetype = document.getElementById("meta-mimetype");
    const metaModified = document.getElementById("meta-modified");
    const metaResolution = document.getElementById("meta-resolution");
    const metaWidth = document.getElementById("meta-width");
    const metaHeight = document.getElementById("meta-height");
    const metaAspect = document.getElementById("meta-aspect");
    const metaOrientation = document.getElementById("meta-orientation");
    const metaDuration = document.getElementById("meta-duration");
    const metaDurationSec = document.getElementById("meta-duration-sec");
    const metaHasaudio = document.getElementById("meta-hasaudio");
    const metaPlayable = document.getElementById("meta-playable");

    // Action Buttons
    const btnCopy = document.getElementById("btn-copy");
    const btnExport = document.getElementById("btn-export");
    const btnClear = document.getElementById("btn-clear");

    let currentFile = null;
    let objectUrl = null;
    let extractedMetadata = {};

    // Drag and Drop Events
    dropZone.addEventListener("click", () => fileInput.click());

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
            handleVideoSelection(files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleVideoSelection(e.target.files[0]);
        }
    });

    // Handle Video File Selection
    function handleVideoSelection(file) {
        if (!file.type.startsWith("video/")) {
            alert("Incompatible File Type: Please select a valid video file.");
            return;
        }

        currentFile = file;
        
        // Clear previous object URLs to prevent memory leaks
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }

        // Show loading state
        resultsPanel.style.display = "none";
        dropZone.style.display = "none";

        objectUrl = URL.createObjectURL(file);
        videoPreview.src = objectUrl;

        // General file stats (ready immediately)
        metaFilename.textContent = file.name;
        metaFilesize.textContent = formatBytes(file.size);
        metaMimetype.textContent = file.type || "Unknown";
        metaModified.textContent = new Date(file.lastModified).toLocaleString();

        // Listen for metadata loading
        videoPreview.onloadedmetadata = () => {
            // Read dimensions
            const width = videoPreview.videoWidth;
            const height = videoPreview.videoHeight;
            const resolution = width && height ? `${width} x ${height}` : "Unknown";
            const aspect = width && height ? getAspectRatio(width, height) : "Unknown";
            const orientation = width && height ? getOrientation(width, height) : "Unknown";

            // Duration
            const duration = videoPreview.duration;
            const formattedDuration = formatDuration(duration);
            const durationSec = duration ? `${duration.toFixed(3)}s` : "Unknown";

            // Audio track presence check
            const hasAudio = checkAudioPresence(videoPreview);
            
            // Browser compatibility check
            const playability = checkPlayability(file.type);

            // Populate DOM
            metaResolution.textContent = resolution;
            metaWidth.textContent = width ? `${width} px` : "-";
            metaHeight.textContent = height ? `${height} px` : "-";
            metaAspect.textContent = aspect;
            metaOrientation.textContent = orientation;
            metaDuration.textContent = formattedDuration;
            metaDurationSec.textContent = durationSec;
            metaHasaudio.textContent = hasAudio;
            metaPlayable.textContent = playability;

            // Save extracted metadata state for export/copy
            extractedMetadata = {
                "File Info": {
                    "File Name": file.name,
                    "File Size": formatBytes(file.size),
                    "MIME Type": file.type || "Unknown",
                    "Last Modified": new Date(file.lastModified).toISOString()
                },
                "Video Track": {
                    "Resolution": resolution,
                    "Width": width ? `${width}px` : "Unknown",
                    "Height": height ? `${height}px` : "Unknown",
                    "Aspect Ratio": aspect,
                    "Orientation": orientation
                },
                "Playback Specs": {
                    "Duration": formattedDuration,
                    "Duration (Raw)": duration ? duration : 0,
                    "Has Audio": hasAudio,
                    "Browser Compatible": playability
                }
            };

            // Display results dashboard
            resultsPanel.style.display = "block";
        };

        // Fallback error handler
        videoPreview.onerror = () => {
            alert("Error Loading Video: The browser could not decode or load the video file metadata.");
            clearSession();
        };
    }

    // Helper: Format bytes to human readable sizes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }

    // Helper: Compute greatest common divisor for aspect ratio
    function getAspectRatio(w, h) {
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const divisor = gcd(w, h);
        const ratioX = w / divisor;
        const ratioY = h / divisor;
        const decimal = (w / h).toFixed(2);
        return `${ratioX}:${ratioY} (${decimal})`;
    }

    // Helper: Determine video orientation
    function getOrientation(w, h) {
        if (w > h) return "Landscape";
        if (h > w) return "Portrait";
        return "Square";
    }

    // Helper: Format duration into HH:MM:SS
    function formatDuration(sec) {
        if (isNaN(sec) || sec === Infinity) return "Unknown";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        
        let parts = [];
        if (h > 0) {
            parts.push(h < 10 ? "0" + h : h);
        }
        parts.push(m < 10 ? "0" + m : m);
        parts.push(s < 10 ? "0" + s : s);
        return parts.join(":");
    }

    // Helper: Check audio presence
    function checkAudioPresence(vid) {
        if (vid.mozHasAudio !== undefined) {
            return vid.mozHasAudio ? "Yes" : "No";
        }
        if (vid.webkitAudioDecodedByteCount !== undefined) {
            return vid.webkitAudioDecodedByteCount > 0 ? "Yes" : "No";
        }
        if (vid.audioTracks !== undefined) {
            return vid.audioTracks.length > 0 ? "Yes" : "No";
        }
        // General fallback check for playback support
        return "Yes (Detected)";
    }

    // Helper: Check playability based on MIME type
    function checkPlayability(mimeType) {
        if (!mimeType) return "Unknown";
        const canPlay = videoPreview.canPlayType(mimeType);
        if (canPlay === "probably") return "Yes (High Support)";
        if (canPlay === "maybe") return "Yes (Partial Support)";
        return "No (Incompatible)";
    }

    // Action: Copy Text to Clipboard
    btnCopy.addEventListener("click", () => {
        if (Object.keys(extractedMetadata).length === 0) return;

        let text = "=========================================\n";
        text += "        TOOLCANVAS VIDEO METADATA        \n";
        text += "=========================================\n\n";

        for (const [section, props] of Object.entries(extractedMetadata)) {
            text += `[${section}]\n`;
            for (const [key, val] of Object.entries(props)) {
                text += `${key.padEnd(20)}: ${val}\n`;
            }
            text += "\n";
        }

        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
                <span>Copied!</span>
            `;
            setTimeout(() => {
                btnCopy.innerHTML = originalText;
            }, 2000);
        }).catch(() => {
            alert("Clipboard Error: Could not copy video metadata.");
        });
    });

    // Action: Export JSON File
    btnExport.addEventListener("click", () => {
        if (Object.keys(extractedMetadata).length === 0) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extractedMetadata, null, 4));
        const downloadAnchor = document.createElement("a");
        
        // Clean filename for the export
        const cleanName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || currentFile.name;
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${cleanName}_metadata.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Action: Clear Session / State Reset
    btnClear.addEventListener("click", clearSession);

    function clearSession() {
        // Detach listeners to prevent infinite error alert loops when clearing the video src
        videoPreview.onerror = null;
        videoPreview.onloadedmetadata = null;
        
        videoPreview.pause();
        videoPreview.removeAttribute("src");
        videoPreview.load();
        
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }

        currentFile = null;
        extractedMetadata = {};
        fileInput.value = "";

        resultsPanel.style.display = "none";
        dropZone.style.display = "block";
    }
});
