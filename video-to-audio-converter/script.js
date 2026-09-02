/* =========================================
   ToolCanvas — Video to Audio Converter Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const videoInput = document.getElementById("video-input");
    const converterWorkspace = document.getElementById("converter-workspace");
    
    // Metadata Display
    const metaFilename = document.getElementById("meta-filename");
    const metaFilesize = document.getElementById("meta-filesize");
    const metaMimetype = document.getElementById("meta-mimetype");
    const metaDuration = document.getElementById("meta-duration");

    // Preview Display
    const previewVideo = document.getElementById("preview-video");
    const previewFilename = document.getElementById("preview-filename");
    const previewDurationBadge = document.getElementById("preview-duration-badge");

    // Progress Bar Elements
    const progressContainer = document.getElementById("progress-container");
    const progressStatus = document.getElementById("progress-status");
    const progressPercentage = document.getElementById("progress-percentage");
    const progressBar = document.getElementById("progress-bar");

    // Action Buttons
    const btnReset = document.getElementById("btn-reset");
    const btnConvert = document.getElementById("btn-convert");

    // Settings
    const outputChannels = document.getElementById("output-channels");
    const outputSampleRate = document.getElementById("output-samplerate");

    let selectedFile = null;
    let tempVideoEl = null;
    let previewObjectURL = null;

    // Drag and Drop Files loader — robust
    dropZone.addEventListener("click", () => {
        videoInput.click();
    });

    dropZone.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            videoInput.click();
        }
    });

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
            handleVideoLoad(files[0]);
        }
    });

    videoInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleVideoLoad(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Handle Video file load
    function handleVideoLoad(file) {
        console.log("handleVideoLoad called for:", file.name, file.type, file.size);

        // Accept video MIME types OR supported video extensions.
        const isVideoByType = file.type && file.type.startsWith("video/");
        const isVideoByExt = /\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv|mpg|mpeg)$/i.test(file.name);

        if (!isVideoByType && !isVideoByExt) {
            if (window.showToast) {
                window.showToast("Please select a valid video file.");
            } else {
                alert("Please select a valid video file.");
            }
            return;
        }

        // Save selected video immediately.
        selectedFile = file;

        // Clear previous state.
        clearWorkspaceState();

        // Show file information immediately.
        metaFilename.textContent = file.name;
        metaFilesize.textContent = formatBytes(file.size);
        metaMimetype.textContent = file.type || getMimeTypeFromExtension(file.name);
        metaDuration.textContent = "Reading...";
        if (previewFilename) previewFilename.textContent = file.name;
        if (previewDurationBadge) previewDurationBadge.textContent = "—";

        // IMPORTANT:
        // Open the workspace immediately.
        // Do NOT wait for video metadata.
        dropZone.style.display = "none";
        converterWorkspace.style.display = "block";

        // Show actual video preview on left side
        try {
            if (previewVideo) {
                if (previewObjectURL) {
                    URL.revokeObjectURL(previewObjectURL);
                    previewObjectURL = null;
                }
                previewObjectURL = URL.createObjectURL(file);
                previewVideo.src = previewObjectURL;
                previewVideo.load();
            }
        } catch (e) {
            console.warn("Preview video failed:", e);
        }

        // Try to read duration separately.
        // Failure here must NOT prevent importing the video.
        try {
            const objectURL = URL.createObjectURL(file);

            const video = document.createElement("video");
            tempVideoEl = video;

            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            video.src = objectURL;

            const cleanup = () => {
                URL.revokeObjectURL(objectURL);

                video.removeAttribute("src");
                video.load();

                if (tempVideoEl === video) {
                    tempVideoEl = null;
                }
            };

            video.addEventListener("loadedmetadata", () => {
                const d = formatDuration(video.duration);
                metaDuration.textContent = d;
                if (previewDurationBadge) previewDurationBadge.textContent = d;
                cleanup();
            }, { once: true });

            video.addEventListener("error", () => {
                console.warn("Could not read video metadata.");
                metaDuration.textContent = "Unknown";
                if (previewDurationBadge) previewDurationBadge.textContent = "--:--";
                cleanup();
            }, { once: true });

            video.load();

        } catch (err) {
            console.error("Video metadata error:", err);
            metaDuration.textContent = "Unknown";
            if (previewDurationBadge) previewDurationBadge.textContent = "--:--";
            tempVideoEl = null;
        }
    }

    // MIME fallback for browsers that return an empty file.type.
    function getMimeTypeFromExtension(filename) {
        const ext = filename.split(".").pop().toLowerCase();

        const mimeMap = {
            mp4: "video/mp4",
            webm: "video/webm",
            ogg: "video/ogg",
            mov: "video/quicktime",
            avi: "video/x-msvideo",
            mkv: "video/x-matroska",
            m4v: "video/x-m4v",
            "3gp": "video/3gpp",
            flv: "video/x-flv",
            wmv: "video/x-ms-wmv",
            mpg: "video/mpeg",
            mpeg: "video/mpeg"
        };

        return mimeMap[ext] || "video/*";
    }

    // Helper: Format bytes to human readable sizes
    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }

    // Helper: Format seconds duration into MM:SS
    function formatDuration(sec) {
        if (isNaN(sec) || sec === Infinity) return "Unknown";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    }

    // Action: Convert Video to Audio
    btnConvert.addEventListener("click", () => {
        if (!selectedFile) return;

        // Disable elements and show progress
        btnConvert.classList.add("disabled");
        btnReset.style.pointerEvents = "none";
        progressContainer.style.display = "block";
        updateProgress("Reading file streams...", 0);

        const reader = new FileReader();

        reader.onload = (e) => {
            updateProgress("Decoding audio track...", 20);
            decodeAudioData(e.target.result);
        };

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 18);
                updateProgress("Reading video file...", percent);
            }
        };

        reader.onerror = () => {
            alert("Error Reading Video File: Access denied or storage read error.");
            resetProgressState();
        };

        reader.readAsArrayBuffer(selectedFile);
    });

    // Step 2: Decode Audio Track from Video File
    function decodeAudioData(arrayBuffer) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        audioCtx.decodeAudioData(arrayBuffer)
            .then((audioBuffer) => {
                resampleAndFormat(audioBuffer);
            })
            .catch(() => {
                alert("Decoding Failure: The browser failed to decode the audio track. Ensure the video contains an audio track, and that the browser natively supports its audio codec (like AAC or Opus).");
                resetProgressState();
            });
    }

    // Step 3: Resample and Intermix Channels using OfflineAudioContext
    function resampleAndFormat(audioBuffer) {
        updateProgress("Resampling audio stream...", 60);

        const targetSampleRate = parseInt(outputSampleRate.value);
        const targetChannels = parseInt(outputChannels.value);
        const duration = audioBuffer.duration;

        // Create OfflineAudioContext at target rate and channels
        const offlineCtx = new OfflineAudioContext(
            targetChannels,
            duration * targetSampleRate,
            targetSampleRate
        );

        // Source buffer node
        const bufferSource = offlineCtx.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(offlineCtx.destination);
        bufferSource.start();

        // Render audio
        offlineCtx.startRendering()
            .then((renderedBuffer) => {
                encodeToWav(renderedBuffer);
            })
            .catch(() => {
                alert("Processing Error: Failed to resample/downmix the audio track.");
                resetProgressState();
            });
    }

    // Step 4: Encode PCM Audio Buffer to WAV File
    function encodeToWav(audioBuffer) {
        updateProgress("Encoding WAV audio stream...", 85);

        // Run in setTimeout to prevent UI freezing
        setTimeout(() => {
            try {
                const wavBlob = bufferToWav(audioBuffer);
                updateProgress("Conversion finished!", 100);

                setTimeout(() => {
                    downloadAudioFile(wavBlob);
                    resetProgressState();
                }, 400);

            } catch (err) {
                alert("Encoding Error: Failed to compile WAV header metadata.");
                resetProgressState();
            }
        }, 50);
    }

    // WAV Encoder Implementation (Lossless PCM 16-bit)
    function bufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // raw PCM
        const bitDepth = 16; // 16-bit samples

        let result;
        if (numOfChan === 2) {
            result = interleaveChannels(buffer.getChannelData(0), buffer.getChannelData(1));
        } else {
            result = buffer.getChannelData(0);
        }

        const bufferLength = result.length * 2;
        const arrayBuffer = new ArrayBuffer(44 + bufferLength);
        const view = new DataView(arrayBuffer);

        // RIFF Identifier
        writeString(view, 0, "RIFF");
        // File Length
        view.setUint32(4, 36 + bufferLength, true);
        // RIFF Type
        writeString(view, 8, "WAVE");
        // Format Chunk Identifier
        writeString(view, 12, "fmt ");
        // Format Chunk Length
        view.setUint32(16, 16, true);
        // Sample Format (PCM)
        view.setUint16(20, format, true);
        // Channel Count
        view.setUint16(22, numOfChan, true);
        // Sample Rate
        view.setUint32(24, sampleRate, true);
        // Byte Rate (sampleRate * blockAlign)
        view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
        // Block Align (channelCount * bytesPerSample)
        view.setUint16(32, numOfChan * (bitDepth / 8), true);
        // Bits per Sample
        view.setUint16(34, bitDepth, true);
        // Data Chunk Identifier
        writeString(view, 36, "data");
        // Data Chunk Length
        view.setUint32(40, bufferLength, true);

        // Write 16-bit PCM values
        floatTo16BitPCM(view, 44, result);

        return new Blob([arrayBuffer], { type: "audio/wav" });
    }

    // Helper: Interleave stereo channels
    function interleaveChannels(inputL, inputR) {
        const length = inputL.length + inputR.length;
        const result = new Float32Array(length);

        let index = 0;
        let inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    }

    // Helper: Convert Float32 array to 16-bit signed PCM
    function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            // Scale float to 16-bit integer range
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    // Helper: Write ASCII string to DataView
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Trigger local download
    function downloadAudioFile(blob) {
        const downloadAnchor = document.createElement("a");
        const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || "audio";
        
        downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
        downloadAnchor.setAttribute("download", `${baseName}_audio.wav`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        // Revoke audio object URL after tick
        setTimeout(() => {
            URL.revokeObjectURL(downloadAnchor.href);
        }, 100);
    }

    // Progress Bar updater
    function updateProgress(status, percent) {
        if (progressStatus) {
            progressStatus.textContent = status;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${percent}%`;
        }

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    // Reset Progress Bar
    function resetProgressState() {
        btnConvert.classList.remove("disabled");
        btnReset.style.pointerEvents = "auto";
        progressContainer.style.display = "none";
        updateProgress("Preparing file...", 0);
    }

    // Reset Workspace Action
    btnReset.addEventListener("click", () => {
        clearWorkspaceState();
        selectedFile = null;
        videoInput.value = "";
        
        converterWorkspace.style.display = "none";
        dropZone.style.display = "block";
    });

    function clearWorkspaceState() {
        resetProgressState();
        if (tempVideoEl) {
            try { URL.revokeObjectURL(tempVideoEl.src); } catch(e) {}
            tempVideoEl = null;
        }
        if (previewObjectURL) {
            try { URL.revokeObjectURL(previewObjectURL); } catch(e) {}
            previewObjectURL = null;
        }
        if (previewVideo) {
            previewVideo.removeAttribute("src");
            try { previewVideo.load(); } catch(e) {}
        }
        if (previewFilename) previewFilename.textContent = "";
        if (previewDurationBadge) previewDurationBadge.textContent = "--:--";
    }
});
