/* =========================================
   ToolCanvas — Image to Text script.js
   ========================================= */

(function () {
    'use strict';

    // State Variables
    let originalImageSrc = null;
    let originalFileName = '';
    let originalFileSize = 0;
    let originalWidth = 0;
    let originalHeight = 0;

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const converterWorkspace = document.getElementById('converter-workspace');
    const imagePreview = document.getElementById('image-preview');
    const fileNameEl = document.getElementById('file-name');
    const fileSizeEl = document.getElementById('file-size');
    const fileDimensionsEl = document.getElementById('file-dimensions');
    
    // Controls
    const ocrLangSelect = document.getElementById('ocr-lang');
    const ocrProgress = document.getElementById('ocr-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Actions
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const convertAnotherBtn = document.getElementById('convert-another-btn');
    
    // Results
    const resultPanel = document.getElementById('result-panel');
    const extractedTextarea = document.getElementById('extracted-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadTxtBtn = document.getElementById('download-txt-btn');

    // Initialize Event Listeners
    function init() {
        // Drop zone clicks and drags
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                processFile(e.dataTransfer.files[0]);
            }
        });

        // Action triggers
        convertBtn.addEventListener('click', runOCR);
        resetBtn.addEventListener('click', resetWorkspace);
        convertAnotherBtn.addEventListener('click', resetWorkspace);
        
        copyBtn.addEventListener('click', copyText);
        downloadTxtBtn.addEventListener('click', downloadTextFile);
    }

    // Process Selected File
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    }

    function processFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select a valid image file.');
            return;
        }

        originalFileName = file.name;
        originalFileSize = file.size;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                originalImageSrc = e.target.result;
                originalWidth = this.naturalWidth;
                originalHeight = this.naturalHeight;

                // Populate UI
                imagePreview.src = e.target.result;
                fileNameEl.textContent = originalFileName;
                fileSizeEl.textContent = formatBytes(originalFileSize);
                fileDimensionsEl.textContent = `${originalWidth} × ${originalHeight} px`;

                // Show Workspace
                dropZone.style.display = 'none';
                converterWorkspace.style.display = 'block';
                resultPanel.style.display = 'none';
                ocrProgress.style.display = 'none';
                
                // Reset controls
                convertBtn.disabled = false;
                resetBtn.disabled = false;
                ocrLangSelect.value = 'eng';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Run Tesseract OCR Client-Side
    function runOCR() {
        if (!originalImageSrc) return;

        // UI Feedback
        convertBtn.disabled = true;
        resetBtn.disabled = true;
        ocrProgress.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = 'Loading OCR Engine...';

        const lang = ocrLangSelect.value;

        // Call Tesseract.recognize (provided by CDN script)
        Tesseract.recognize(
            originalImageSrc,
            lang,
            {
                logger: function (m) {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        progressBar.style.width = progress + '%';
                        progressText.textContent = `Extracting characters... (${progress}%)`;
                    } else {
                        // Map status names to cleaner text
                        let cleanStatus = m.status;
                        if (cleanStatus === 'loading tesseract core') cleanStatus = 'Loading recognition core';
                        else if (cleanStatus === 'initializing api') cleanStatus = 'Initializing engine';
                        else if (cleanStatus === 'initialized api') cleanStatus = 'Engine initialized';
                        else if (cleanStatus === 'loading language traineddata') cleanStatus = `Loading ${lang} dictionaries`;
                        else if (cleanStatus === 'loaded language traineddata') cleanStatus = `Dictionaries loaded`;
                        
                        progressText.textContent = cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1) + '...';
                    }
                }
            }
        ).then(function (result) {
            // Hide progress
            ocrProgress.style.display = 'none';
            convertBtn.disabled = false;
            resetBtn.disabled = false;

            // Populate text
            const text = result.data.text || '';
            extractedTextarea.value = text.trim();

            // Display Results
            resultPanel.style.display = 'block';
            resultPanel.scrollIntoView({ behavior: 'smooth' });
        }).catch(function (err) {
            console.error(err);
            ocrProgress.style.display = 'none';
            convertBtn.disabled = false;
            resetBtn.disabled = false;
            alert('Error during character recognition: ' + err.message);
        });
    }

    // Copy Extracted Text
    function copyText() {
        const text = extractedTextarea.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(function () {
            const oldText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#15803d'; // Green success feedback
            copyBtn.style.borderColor = '#15803d';
            
            setTimeout(() => {
                copyBtn.textContent = oldText;
                copyBtn.style.backgroundColor = ''; // Revert to default
                copyBtn.style.borderColor = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback selection copy
            extractedTextarea.select();
            document.execCommand('copy');
        });
    }

    // Download plain .TXT file
    function downloadTextFile() {
        const text = extractedTextarea.value;
        if (!text) return;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Base name
        const dotIndex = originalFileName.lastIndexOf('.');
        const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
        a.download = `${baseName}_extracted.txt`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Reset workspace to initial state
    function resetWorkspace() {
        originalImageSrc = null;
        originalFileName = '';
        originalFileSize = 0;
        originalWidth = 0;
        originalHeight = 0;
        
        fileInput.value = '';
        imagePreview.src = '#';
        extractedTextarea.value = '';
        
        dropZone.style.display = 'block';
        converterWorkspace.style.display = 'none';
        resultPanel.style.display = 'none';
        ocrProgress.style.display = 'none';
    }

    // Helpers
    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    document.addEventListener('DOMContentLoaded', init);
})();
