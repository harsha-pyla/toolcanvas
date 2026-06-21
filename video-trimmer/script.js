/* =========================================
   ToolCanvas — Video Trimmer Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const videoInput = document.getElementById("video-input");
    const trimmerWorkspace = document.getElementById("trimmer-workspace");

    // Video Player & Controls
    const videoPreview = document.getElementById("video-preview");
    const btnPlayRange = document.getElementById("btn-play-range");
    const playbackTime = document.getElementById("playback-time");

    // Timeline Slider Track & Handles
    const sliderTrack = document.getElementById("slider-track");
    const sliderRangeBar = document.getElementById("slider-range-bar");
    const handleStart = document.getElementById("handle-start");
    const handleEnd = document.getElementById("handle-end");

    // Time Inputs
    const timeStartInput = document.getElementById("time-start");
    const timeEndInput = document.getElementById("time-end");
    const btnSetStart = document.getElementById("btn-set-start");
    const btnSetEnd = document.getElementById("btn-set-end");

    // Metadata Display
    const metaDuration = document.getElementById("meta-duration");
    const metaTrimmedDuration = document.getElementById("meta-trimmed-duration");
    const metaType = document.getElementById("meta-type");

    // Actions
    const btnReset = document.getElementById("btn-reset");
    const btnTrim = document.getElementById("btn-trim");

    // Progress Bar
    const progressContainer = document.getElementById("progress-container");
    const progressStatus = document.getElementById("progress-status");
    const progressPercentage = document.getElementById("progress-percentage");
    const progressBar = document.getElementById("progress-bar");

    // Variables for Trim Logic
    let selectedFile = null;
    let duration = 0;
    let startTime = 0;
    let endTime = 0;
    let isPlayingRange = false;
    let rangePlayTimer = null;

    // Web Audio Variables (for silent recording)
    let audioCtx = null;
    let sourceNode = null;
    let destNode = null;
    let gainNode = null;

    // MediaRecorder Variables
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let recordTimer = null;

    // --- Drag and Drop Interface ---
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
            handleVideoLoad(files[0]);
        }
    });

    videoInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleVideoLoad(e.target.files[0]);
        }
    });

    // Handle Loaded Video
    function handleVideoLoad(file) {
        if (!file.type.startsWith("video/")) {
            alert("Incompatible File Type: Please select a valid video file.");
            return;
        }

        selectedFile = file;
        metaType.textContent = file.type || "Unknown";

        // Create Object URL and bind to player
        const objectURL = URL.createObjectURL(file);
        videoPreview.src = objectURL;
        videoPreview.load();

        videoPreview.onloadedmetadata = () => {
            duration = videoPreview.duration;
            startTime = 0;
            endTime = duration;

            // Populate Metadata
            metaDuration.textContent = formatTime(duration);
            metaTrimmedDuration.textContent = formatTime(duration);
            playbackTime.textContent = `00:00.00 / ${formatTime(duration)}`;

            // Init values in input fields
            timeStartInput.value = formatTime(0);
            timeEndInput.value = formatTime(duration);

            // Update UI workspace layout
            dropZone.style.display = "none";
            trimmerWorkspace.style.display = "block";

            // Draw/position handles
            updateSliderUI();
        };

        videoPreview.onerror = () => {
            alert("Failed to load video file. Ensure the codec is supported by your browser.");
            resetWorkspace();
        };
    }

    // --- Time Formatting Helpers ---
    // Output format: MM:SS.cc (Minutes:Seconds.Centiseconds)
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "00:00.00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const c = Math.floor((seconds % 1) * 100);
        
        const mStr = m < 10 ? "0" + m : m;
        const sStr = s < 10 ? "0" + s : s;
        const cStr = c < 10 ? "0" + c : c;
        
        return `${mStr}:${sStr}.${cStr}`;
    }

    // Parse time formats like "MM:SS.cc" or decimal seconds "12.34"
    function parseTimeInput(val) {
        val = val.trim();
        if (!val) return 0;

        // If in MM:SS.cc or MM:SS format
        if (val.includes(":")) {
            const parts = val.split(":");
            const mins = parseFloat(parts[0]) || 0;
            const secs = parseFloat(parts[1]) || 0;
            return (mins * 60) + secs;
        }

        // Default to decimal float
        return parseFloat(val) || 0;
    }

    // --- Slider UI & Dragging Logic ---
    function updateSliderUI() {
        if (duration <= 0) return;

        const startPct = (startTime / duration) * 100;
        const endPct = (endTime / duration) * 100;

        handleStart.style.left = `${startPct}%`;
        handleEnd.style.left = `${endPct}%`;

        sliderRangeBar.style.left = `${startPct}%`;
        sliderRangeBar.style.width = `${endPct - startPct}%`;

        metaTrimmedDuration.textContent = formatTime(endTime - startTime);
    }

    // Drag Handle handlers
    function setupDrag(handle, type) {
        handle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.body.style.cursor = "ew-resize";
            
            const onMouseMove = (moveEvent) => {
                const rect = sliderTrack.getBoundingClientRect();
                let clientX = moveEvent.clientX;

                // Handle touch move helper if ever expanded
                if (moveEvent.touches) {
                    clientX = moveEvent.touches[0].clientX;
                }

                let offsetX = clientX - rect.left;
                offsetX = Math.max(0, Math.min(offsetX, rect.width));

                const timeVal = (offsetX / rect.width) * duration;

                if (type === "start") {
                    startTime = Math.min(timeVal, endTime - 0.1);
                    startTime = Math.max(0, startTime);
                    timeStartInput.value = formatTime(startTime);
                } else {
                    endTime = Math.max(timeVal, startTime + 0.1);
                    endTime = Math.min(duration, endTime);
                    timeEndInput.value = formatTime(endTime);
                }

                updateSliderUI();
                syncPlaybackPosition(type === "start" ? startTime : endTime);
            };

            const onMouseUp = () => {
                document.body.style.cursor = "default";
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        // Touch support
        handle.addEventListener("touchstart", (e) => {
            document.body.style.cursor = "ew-resize";
            
            const onTouchMove = (moveEvent) => {
                const rect = sliderTrack.getBoundingClientRect();
                const clientX = moveEvent.touches[0].clientX;

                let offsetX = clientX - rect.left;
                offsetX = Math.max(0, Math.min(offsetX, rect.width));

                const timeVal = (offsetX / rect.width) * duration;

                if (type === "start") {
                    startTime = Math.min(timeVal, endTime - 0.1);
                    startTime = Math.max(0, startTime);
                    timeStartInput.value = formatTime(startTime);
                } else {
                    endTime = Math.max(timeVal, startTime + 0.1);
                    endTime = Math.min(duration, endTime);
                    timeEndInput.value = formatTime(endTime);
                }

                updateSliderUI();
                syncPlaybackPosition(type === "start" ? startTime : endTime);
            };

            const onTouchEnd = () => {
                document.body.style.cursor = "default";
                document.removeEventListener("touchmove", onTouchMove);
                document.removeEventListener("touchend", onTouchEnd);
            };

            document.addEventListener("touchmove", onTouchMove);
            document.addEventListener("touchend", onTouchEnd);
        });
    }

    setupDrag(handleStart, "start");
    setupDrag(handleEnd, "end");

    // Seek player to coordinate
    function syncPlaybackPosition(time) {
        videoPreview.currentTime = time;
    }

    // Set slider coordinates via clicking track
    sliderTrack.addEventListener("click", (e) => {
        // Prevent click if clicking a handle directly
        if (e.target.classList.contains("slider-handle")) return;

        const rect = sliderTrack.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const clickTime = (offsetX / rect.width) * duration;

        // Determine which handle is closer
        const distStart = Math.abs(clickTime - startTime);
        const distEnd = Math.abs(clickTime - endTime);

        if (distStart < distEnd) {
            startTime = Math.min(clickTime, endTime - 0.1);
            startTime = Math.max(0, startTime);
            timeStartInput.value = formatTime(startTime);
        } else {
            endTime = Math.max(clickTime, startTime + 0.1);
            endTime = Math.min(duration, endTime);
            timeEndInput.value = formatTime(endTime);
        }

        updateSliderUI();
        syncPlaybackPosition(distStart < distEnd ? startTime : endTime);
    });

    // Inputs sync
    timeStartInput.addEventListener("blur", () => {
        let parsed = parseTimeInput(timeStartInput.value);
        parsed = Math.max(0, Math.min(parsed, endTime - 0.1));
        startTime = parsed;
        timeStartInput.value = formatTime(startTime);
        updateSliderUI();
        syncPlaybackPosition(startTime);
    });

    timeStartInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") timeStartInput.blur();
    });

    timeEndInput.addEventListener("blur", () => {
        let parsed = parseTimeInput(timeEndInput.value);
        parsed = Math.max(startTime + 0.1, Math.min(parsed, duration));
        endTime = parsed;
        timeEndInput.value = formatTime(endTime);
        updateSliderUI();
        syncPlaybackPosition(endTime);
    });

    timeEndInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") timeEndInput.blur();
    });

    // "Set Current" buttons
    btnSetStart.addEventListener("click", () => {
        const cur = videoPreview.currentTime;
        if (cur < endTime) {
            startTime = cur;
            timeStartInput.value = formatTime(startTime);
            updateSliderUI();
        } else {
            alert("Start time must be before the end time.");
        }
    });

    btnSetEnd.addEventListener("click", () => {
        const cur = videoPreview.currentTime;
        if (cur > startTime) {
            endTime = cur;
            timeEndInput.value = formatTime(endTime);
            updateSliderUI();
        } else {
            alert("End time must be after the start time.");
        }
    });

    // Track playback updates
    videoPreview.addEventListener("timeupdate", () => {
        playbackTime.textContent = `${formatTime(videoPreview.currentTime)} / ${formatTime(duration)}`;
    });

    // --- Range Playback Logic ---
    btnPlayRange.addEventListener("click", () => {
        if (isPlayingRange) {
            stopRangePlayback();
        } else {
            startRangePlayback();
        }
    });

    function startRangePlayback() {
        isPlayingRange = true;
        btnPlayRange.classList.add("btn-primary");
        btnPlayRange.classList.remove("btn-secondary");
        btnPlayRange.querySelector("span").textContent = "Pause Range Playback";
        
        // Seek to start and play
        videoPreview.currentTime = startTime;
        videoPreview.play();

        // Timer monitor
        rangePlayTimer = setInterval(() => {
            if (videoPreview.currentTime >= endTime) {
                stopRangePlayback();
            }
        }, 30);
    }

    function stopRangePlayback() {
        isPlayingRange = false;
        clearInterval(rangePlayTimer);
        videoPreview.pause();
        videoPreview.currentTime = startTime;
        
        btnPlayRange.classList.remove("btn-primary");
        btnPlayRange.classList.add("btn-secondary");
        btnPlayRange.querySelector("span").textContent = "Play Selected Range";
    }

    // --- Silent MediaRecorder Trimming Engine ---
    btnTrim.addEventListener("click", () => {
        if (isRecording) return;
        
        stopRangePlayback();

        // Init Web Audio if needed (must be done on user action click)
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                sourceNode = audioCtx.createMediaElementSource(videoPreview);
                destNode = audioCtx.createMediaStreamDestination();
                gainNode = audioCtx.createGain();

                // routing structure:
                // Source Node -> Monitor Gain (0) -> Audio Destination (Speakers)
                // Source Node -> Recording Destination (MediaStream Destination)
                sourceNode.connect(destNode);
                sourceNode.connect(gainNode);
                gainNode.connect(audioCtx.destination);
            } catch (err) {
                console.warn("Web Audio Routing Error:", err);
            }
        }

        // Mute speaker monitor gain node
        if (gainNode) {
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Silent monitor!
        }

        // Capture video streams
        let stream;
        try {
            if (videoPreview.captureStream) {
                stream = videoPreview.captureStream(30); // 30 FPS
            } else if (videoPreview.mozCaptureStream) {
                stream = videoPreview.mozCaptureStream(30);
            } else {
                throw new Error("Stream Capture not supported by browser");
            }
        } catch (err) {
            alert("Trimming Error: Your browser does not support local canvas video capture streams.");
            resetProgressState();
            return;
        }

        // If we have a Web Audio stream node, add the audio track to our capture stream
        if (destNode) {
            const audioTracks = destNode.stream.getAudioTracks();
            if (audioTracks.length > 0) {
                // Remove existing audio tracks from video capture stream first
                const defaultAudioTracks = stream.getAudioTracks();
                defaultAudioTracks.forEach(t => stream.removeTrack(t));

                // Add routed clean track
                stream.addTrack(audioTracks[0]);
            }
        }

        // Detect supported codecs
        let options = { mimeType: "video/webm;codecs=vp9,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: "video/webm;codecs=vp8,opus" };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: "video/webm" };
        }

        // Setup Media Recorder
        try {
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream, options);
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                compileAndDownload();
            };

        } catch (err) {
            alert("Recorder Error: Failed to initialize browser media writer node.");
            resetProgressState();
            return;
        }

        // Disable interaction elements
        isRecording = true;
        btnTrim.classList.add("disabled");
        btnReset.style.pointerEvents = "none";
        progressContainer.style.display = "block";
        updateProgress("Preparing video streams...", 0);

        // Seek video to start point
        videoPreview.currentTime = startTime;

        // Start recording once seek completes
        const startRecordProcess = () => {
            videoPreview.removeEventListener("seeked", startRecordProcess);
            
            // Start video playback and recording
            videoPreview.play();
            mediaRecorder.start();
            updateProgress("Trimming range...", 0);

            const totalDuration = endTime - startTime;

            recordTimer = setInterval(() => {
                const elapsed = videoPreview.currentTime - startTime;
                let percent = Math.floor((elapsed / totalDuration) * 100);
                percent = Math.max(0, Math.min(100, percent));

                updateProgress("Slicing timeline frames...", percent);

                if (videoPreview.currentTime >= endTime || videoPreview.ended) {
                    stopRecordingProcess();
                }
            }, 50);
        };

        // Bind seek callback
        videoPreview.addEventListener("seeked", startRecordProcess);
    });

    function stopRecordingProcess() {
        clearInterval(recordTimer);
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        videoPreview.pause();
        videoPreview.currentTime = startTime;

        // Restore speaker gain monitor volume
        if (gainNode) {
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        }
    }

    function compileAndDownload() {
        updateProgress("Compiling trimmed files...", 95);

        setTimeout(() => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            
            const downloadAnchor = document.createElement("a");
            const originalName = selectedFile.name;
            const dotIdx = originalName.lastIndexOf(".");
            const baseName = dotIdx !== -1 ? originalName.substring(0, dotIdx) : "video";
            
            downloadAnchor.href = url;
            downloadAnchor.download = `${baseName}_trimmed.webm`;
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            updateProgress("Trim completed!", 100);

            setTimeout(() => {
                URL.revokeObjectURL(url);
                resetProgressState();
            }, 600);
        }, 500);
    }

    // --- Progress UI Helpers ---
    function updateProgress(status, percent) {
        progressStatus.textContent = status;
        progressPercentage.textContent = `${percent}%`;
        progressBar.style.width = `${percent}%`;
    }

    function resetProgressState() {
        isRecording = false;
        btnTrim.classList.remove("disabled");
        btnReset.style.pointerEvents = "auto";
        progressContainer.style.display = "none";
        updateProgress("Preparing file...", 0);
    }

    // --- Reset Workspace ---
    btnReset.addEventListener("click", () => {
        resetWorkspace();
    });

    function resetWorkspace() {
        stopRangePlayback();
        clearInterval(recordTimer);
        
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        // Clean video previews
        if (videoPreview.src) {
            URL.revokeObjectURL(videoPreview.src);
            videoPreview.src = "";
            videoPreview.load();
        }

        selectedFile = null;
        duration = 0;
        startTime = 0;
        endTime = 0;
        videoInput.value = "";

        // Reset progress UI
        resetProgressState();

        // Restore UI view
        trimmerWorkspace.style.display = "none";
        dropZone.style.display = "block";
    }
});
