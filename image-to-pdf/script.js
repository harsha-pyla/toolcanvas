/* =========================================
   ToolCanvas — Image to PDF script.js
   ========================================= */

(function () {
    'use strict';

    // PDF Dimensions in Points (1 point = 1/72 inch)
    const PAGE_SIZES = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612.00, height: 792.00 }
    };

    // State Variables
    let selectedImages = [];
    let generatedPdfUrl = null;

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const converterWorkspace = document.getElementById('converter-workspace');
    const imageListContainer = document.getElementById('image-list-container');
    const imageCountEl = document.getElementById('image-count');
    const addMoreBtn = document.getElementById('add-more-btn');
    
    // settings Controls
    const pageSizeSelect = document.getElementById('page-size');
    const orientationGroup = document.getElementById('orientation-group');
    const pageOrientationSelect = document.getElementById('page-orientation');
    const pageMarginSelect = document.getElementById('page-margin');
    
    // Progress
    const conversionProgress = document.getElementById('conversion-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Actions
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const convertAnotherBtn = document.getElementById('convert-another-btn');
    
    // Results
    const resultPanel = document.getElementById('result-panel');
    const downloadBtn = document.getElementById('download-btn');

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
                processFiles(e.dataTransfer.files);
            }
        });

        // Add more images button
        addMoreBtn.addEventListener('click', () => {
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.accept = 'image/*';
            tempInput.multiple = true;
            tempInput.style.display = 'none';
            tempInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    processFiles(e.target.files);
                }
            });
            document.body.appendChild(tempInput);
            tempInput.click();
            document.body.removeChild(tempInput);
        });

        // Page Size toggling (hide orientation for 'fit')
        pageSizeSelect.addEventListener('change', function() {
            if (this.value === 'fit') {
                orientationGroup.style.display = 'none';
            } else {
                orientationGroup.style.display = 'block';
            }
        });

        // Action triggers
        convertBtn.addEventListener('click', generatePDF);
        resetBtn.addEventListener('click', resetWorkspace);
        convertAnotherBtn.addEventListener('click', resetWorkspace);
        downloadBtn.addEventListener('click', downloadPDF);
    }

    // Process Selected Files
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }

    function processFiles(files) {
        const imageFiles = Array.from(files).filter(file => file.type.match('image.*'));
        if (imageFiles.length === 0) return;

        let loadedCount = 0;
        const totalImages = imageFiles.length;

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Create canvas to flatten image and convert to JPEG
                    const canvas = document.createElement('canvas');
                    canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill background with white (handles PNG/WebP transparency)
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0);
                    
                    // Export to optimized JPEG
                    const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);

                    selectedImages.push({
                        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        size: file.size,
                        width: this.naturalWidth,
                        height: this.naturalHeight,
                        dataUrl: jpegUrl
                    });

                    loadedCount++;
                    if (loadedCount === totalImages) {
                        renderImageList();
                        dropZone.style.display = 'none';
                        converterWorkspace.style.display = 'block';
                        resultPanel.style.display = 'none';
                    }
                };
                img.onerror = function() {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        renderImageList();
                        if (selectedImages.length > 0) {
                            dropZone.style.display = 'none';
                            converterWorkspace.style.display = 'block';
                            resultPanel.style.display = 'none';
                        }
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Render image lists
    function renderImageList() {
        imageListContainer.innerHTML = '';
        imageCountEl.textContent = selectedImages.length;

        selectedImages.forEach((img, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <div class="image-card__index">${index + 1}</div>
                <div class="image-card__thumb">
                    <img src="${img.dataUrl}" alt="Thumbnail">
                </div>
                <div class="image-card__info">
                    <div class="image-card__name" title="${escapeHTML(img.name)}">${escapeHTML(img.name)}</div>
                    <div class="image-card__meta">${formatBytes(img.size)} • ${img.width} × ${img.height} px</div>
                </div>
                <div class="image-card__actions">
                    <button type="button" class="action-btn" title="Move Up" ${index === 0 ? 'disabled' : ''} onclick="window.moveImage(${index}, -1)">▲</button>
                    <button type="button" class="action-btn" title="Move Down" ${index === selectedImages.length - 1 ? 'disabled' : ''} onclick="window.moveImage(${index}, 1)">▼</button>
                    <button type="button" class="action-btn action-btn--delete" title="Delete" onclick="window.removeImage(${index})">✕</button>
                </div>
            `;
            imageListContainer.appendChild(card);
        });
    }

    // Expose Up/Down/Delete Globally for onclick bindings
    window.moveImage = function(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= selectedImages.length) return;
        
        // Swap elements
        const temp = selectedImages[index];
        selectedImages[index] = selectedImages[targetIndex];
        selectedImages[targetIndex] = temp;
        
        renderImageList();
    };

    window.removeImage = function(index) {
        selectedImages.splice(index, 1);
        renderImageList();
        
        if (selectedImages.length === 0) {
            resetWorkspace();
        }
    };

    // Generate PDF Client-Side
    function generatePDF() {
        if (selectedImages.length === 0) return;

        convertBtn.disabled = true;
        resetBtn.disabled = true;
        conversionProgress.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = 'Preparing PDF compiler...';

        const { jsPDF } = window.jspdf;
        
        // PDF Settings
        const pageSize = pageSizeSelect.value;
        const pageOrientation = pageOrientationSelect.value;
        const marginSelect = pageMarginSelect.value;
        
        // Margin Points
        let margin = 0;
        if (marginSelect === 'small') margin = 15;
        else if (marginSelect === 'medium') margin = 30;

        let doc = null;
        let currentPageIndex = 0;

        function addPageSequentially() {
            if (currentPageIndex >= selectedImages.length) {
                // Done compiling, save output
                progressText.textContent = 'Saving PDF document...';
                progressBar.style.width = '100%';
                
                setTimeout(() => {
                    if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
                    const pdfBlob = doc.output('blob');
                    generatedPdfUrl = URL.createObjectURL(pdfBlob);
                    
                    conversionProgress.style.display = 'none';
                    convertBtn.disabled = false;
                    resetBtn.disabled = false;
                    
                    resultPanel.style.display = 'block';
                    resultPanel.scrollIntoView({ behavior: 'smooth' });
                }, 300);
                return;
            }

            const img = selectedImages[currentPageIndex];
            progressText.textContent = `Compiling page ${currentPageIndex + 1} of ${selectedImages.length}...`;
            progressBar.style.width = Math.round((currentPageIndex / selectedImages.length) * 100) + '%';

            // Page Size calculation (Points)
            let pWidth = 0;
            let pHeight = 0;
            let orientation = 'p';

            if (pageSize === 'fit') {
                pWidth = img.width + 2 * margin;
                pHeight = img.height + 2 * margin;
                orientation = pWidth > pHeight ? 'l' : 'p';
            } else {
                // Fixed sizes: A4 or Letter
                const standard = PAGE_SIZES[pageSize];
                
                // Determine orientation
                if (pageOrientation === 'auto') {
                    orientation = img.width > img.height ? 'l' : 'p';
                } else {
                    orientation = pageOrientation === 'landscape' ? 'l' : 'p';
                }

                if (orientation === 'p') {
                    pWidth = standard.width;
                    pHeight = standard.height;
                } else {
                    pWidth = standard.height;
                    pHeight = standard.width;
                }
            }

            // Fit Image inside available bounds
            const availWidth = pWidth - 2 * margin;
            const availHeight = pHeight - 2 * margin;
            
            let drawWidth = img.width;
            let drawHeight = img.height;

            if (pageSize !== 'fit') {
                const ratio = Math.min(availWidth / img.width, availHeight / img.height);
                drawWidth = img.width * ratio;
                drawHeight = img.height * ratio;
            }

            // Centering math
            const x = margin + (availWidth - drawWidth) / 2;
            const y = margin + (availHeight - drawHeight) / 2;

            // Instantiate or Add Page
            if (currentPageIndex === 0) {
                doc = new jsPDF({
                    orientation: orientation,
                    unit: 'pt',
                    format: [pWidth, pHeight]
                });
            } else {
                doc.addPage([pWidth, pHeight], orientation);
            }

            // Draw image on page
            doc.addImage(img.dataUrl, 'JPEG', x, y, drawWidth, drawHeight, null, 'FAST');

            currentPageIndex++;
            // Yield execution to let browser repaint progress bar
            setTimeout(addPageSequentially, 50);
        }

        // Start sequential compilation
        addPageSequentially();
    }

    // Trigger PDF Download
    function downloadPDF() {
        if (!generatedPdfUrl) return;
        
        const a = document.createElement('a');
        a.href = generatedPdfUrl;
        
        // Create title name
        let downloadName = 'merged_images.pdf';
        if (selectedImages.length > 0) {
            const first = selectedImages[0].name;
            const dot = first.lastIndexOf('.');
            const base = dot !== -1 ? first.substring(0, dot) : first;
            downloadName = `${base}_images.pdf`;
        }
        
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Reset workspace to initial state
    function resetWorkspace() {
        selectedImages = [];
        if (generatedPdfUrl) {
            URL.revokeObjectURL(generatedPdfUrl);
            generatedPdfUrl = null;
        }
        
        fileInput.value = '';
        imageListContainer.innerHTML = '';
        
        dropZone.style.display = 'block';
        converterWorkspace.style.display = 'none';
        resultPanel.style.display = 'none';
        
        pageSizeSelect.value = 'a4';
        orientationGroup.style.display = 'block';
        pageOrientationSelect.value = 'auto';
        pageMarginSelect.value = 'none';
        
        convertBtn.disabled = false;
        resetBtn.disabled = false;
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

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    document.addEventListener('DOMContentLoaded', init);
})();
