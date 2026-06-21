/* =========================================
   ToolCanvas — Image Resizer script.js
   ========================================= */

(function () {
    'use strict';

    // State Variables
    let originalImage = null;
    let originalFileName = '';
    let originalFileSize = 0;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalAspectRatio = 1;

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const converterWorkspace = document.getElementById('converter-workspace');
    const imagePreview = document.getElementById('image-preview');
    const fileNameEl = document.getElementById('file-name');
    const fileSizeEl = document.getElementById('file-size');
    const fileDimensionsEl = document.getElementById('file-dimensions');
    
    // Controls
    const resizeModeSelect = document.getElementById('resize-mode');
    const dimensionsGroup = document.getElementById('dimensions-group');
    const percentGroup = document.getElementById('percent-group');
    
    const resizeWidth = document.getElementById('resize-width');
    const resizeHeight = document.getElementById('resize-height');
    const aspectRatioLock = document.getElementById('aspect-ratio');
    
    const percentSlider = document.getElementById('percent-slider');
    const percentVal = document.getElementById('percent-val');
    
    const outputFormatSelect = document.getElementById('output-format');
    const qualityGroup = document.getElementById('quality-group');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityVal = document.getElementById('quality-val');
    
    // Actions
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const convertAnotherBtn = document.getElementById('convert-another-btn');
    
    // Results
    const resultPanel = document.getElementById('result-panel');
    const origComparisonSize = document.getElementById('orig-comparison-size');
    const newComparisonSize = document.getElementById('new-comparison-size');
    const origComparisonDim = document.getElementById('orig-comparison-dim');
    const newComparisonDim = document.getElementById('new-comparison-dim');
    const savingsBadge = document.getElementById('savings-badge');
    const downloadLink = document.getElementById('download-link');

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

        // Resize Mode selector
        resizeModeSelect.addEventListener('change', function() {
            if (this.value === 'pixels') {
                dimensionsGroup.style.display = 'block';
                percentGroup.style.display = 'none';
            } else {
                dimensionsGroup.style.display = 'none';
                percentGroup.style.display = 'block';
            }
        });

        // Aspect ratio locked inputs
        resizeWidth.addEventListener('input', function() {
            if (aspectRatioLock.checked && originalHeight && originalWidth) {
                const val = parseInt(this.value, 10);
                if (val > 0) {
                    resizeHeight.value = Math.round(val / originalAspectRatio);
                } else {
                    resizeHeight.value = '';
                }
            }
        });

        resizeHeight.addEventListener('input', function() {
            if (aspectRatioLock.checked && originalHeight && originalWidth) {
                const val = parseInt(this.value, 10);
                if (val > 0) {
                    resizeWidth.value = Math.round(val * originalAspectRatio);
                } else {
                    resizeWidth.value = '';
                }
            }
        });

        // Percent slider input
        percentSlider.addEventListener('input', function() {
            percentVal.textContent = this.value + '%';
        });

        // Output format change (disable quality for PNG)
        outputFormatSelect.addEventListener('change', function() {
            if (this.value === 'image/png') {
                qualitySlider.disabled = true;
                qualityGroup.style.opacity = '0.5';
            } else {
                qualitySlider.disabled = false;
                qualityGroup.style.opacity = '1';
            }
        });

        // Quality slider display
        qualitySlider.addEventListener('input', function() {
            qualityVal.textContent = this.value + '%';
        });

        // Action triggers
        convertBtn.addEventListener('click', resizeImage);
        resetBtn.addEventListener('click', resetWorkspace);
        convertAnotherBtn.addEventListener('click', resetWorkspace);
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
                originalImage = img;
                originalWidth = this.naturalWidth;
                originalHeight = this.naturalHeight;
                originalAspectRatio = originalWidth / originalHeight;

                // Populate UI
                imagePreview.src = e.target.result;
                fileNameEl.textContent = originalFileName;
                fileSizeEl.textContent = formatBytes(originalFileSize);
                fileDimensionsEl.textContent = `${originalWidth} × ${originalHeight} px`;

                // Show Workspace
                dropZone.style.display = 'none';
                converterWorkspace.style.display = 'block';
                resultPanel.style.display = 'none';
                
                // Reset inputs
                resizeModeSelect.value = 'pixels';
                dimensionsGroup.style.display = 'block';
                percentGroup.style.display = 'none';
                
                resizeWidth.value = originalWidth;
                resizeHeight.value = originalHeight;
                aspectRatioLock.checked = true;
                
                percentSlider.value = 50;
                percentVal.textContent = '50%';
                
                outputFormatSelect.value = 'image/jpeg';
                qualitySlider.disabled = false;
                qualitySlider.value = 85;
                qualityVal.textContent = '85%';
                qualityGroup.style.opacity = '1';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Perform Resizing & Sizing Conversion
    function resizeImage() {
        if (!originalImage) return;

        let targetWidth = 0;
        let targetHeight = 0;

        // Calculate Target Dimensions
        if (resizeModeSelect.value === 'pixels') {
            const w = parseInt(resizeWidth.value, 10);
            const h = parseInt(resizeHeight.value, 10);
            if (w > 0 && h > 0) {
                targetWidth = w;
                targetHeight = h;
            } else {
                alert('Please enter valid width and height dimensions.');
                return;
            }
        } else {
            // Percent Sizing
            const factor = parseFloat(percentSlider.value) / 100;
            targetWidth = Math.round(originalWidth * factor);
            targetHeight = Math.round(originalHeight * factor);
            if (targetWidth < 1) targetWidth = 1;
            if (targetHeight < 1) targetHeight = 1;
        }

        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        const format = outputFormatSelect.value;

        // Draw background or clear transparent details
        if (format === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else {
            ctx.clearRect(0, 0, targetWidth, targetHeight);
        }

        // Draw image onto canvas
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        // Export data URL
        let dataUrl = '';
        if (format === 'image/png') {
            dataUrl = canvas.toDataURL('image/png');
        } else {
            // JPEG and WebP support quality settings
            const quality = parseFloat(qualitySlider.value) / 100;
            dataUrl = canvas.toDataURL(format, quality);
        }

        // Calculate output size
        const base64Data = dataUrl.split(',')[1];
        const outputSizeInBytes = Math.round(base64Data.length * 3 / 4);

        // Update results UI
        origComparisonSize.textContent = formatBytes(originalFileSize);
        newComparisonSize.textContent = formatBytes(outputSizeInBytes);
        origComparisonDim.textContent = `${originalWidth} × ${originalHeight} px`;
        newComparisonDim.textContent = `${targetWidth} × ${targetHeight} px`;
        
        // Savings percentage
        const savingsPercent = Math.round(((originalFileSize - outputSizeInBytes) / originalFileSize) * 100);
        if (savingsPercent > 0) {
            savingsBadge.textContent = `Saved ${savingsPercent}%`;
            savingsBadge.style.backgroundColor = '#15803d'; // Green
            savingsBadge.style.display = 'inline-block';
        } else if (savingsPercent < 0) {
            savingsBadge.textContent = `Increased +${Math.abs(savingsPercent)}%`;
            savingsBadge.style.backgroundColor = '#b45309'; // Orange/amber
            savingsBadge.style.display = 'inline-block';
        } else {
            savingsBadge.style.display = 'none';
        }

        // Set download attributes
        downloadLink.href = dataUrl;
        
        // Determine download name & extension
        let ext = 'jpg';
        if (format === 'image/png') ext = 'png';
        else if (format === 'image/webp') ext = 'webp';

        const dotIndex = originalFileName.lastIndexOf('.');
        const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
        downloadLink.download = `${baseName}_resized.${ext}`;
        downloadLink.textContent = `Download ${ext.toUpperCase()}`;

        // Display results panel
        resultPanel.style.display = 'block';
        resultPanel.scrollIntoView({ behavior: 'smooth' });
    }

    // Reset workspace to initial state
    function resetWorkspace() {
        originalImage = null;
        originalFileName = '';
        originalFileSize = 0;
        originalWidth = 0;
        originalHeight = 0;
        
        fileInput.value = '';
        imagePreview.src = '#';
        
        dropZone.style.display = 'block';
        converterWorkspace.style.display = 'none';
        resultPanel.style.display = 'none';
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
