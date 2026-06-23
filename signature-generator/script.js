/* Signature Generator & Document Signer Script */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Tabs switching ----
    const tabDrawBtn = document.getElementById('tab-draw-btn');
    const tabTypeBtn = document.getElementById('tab-type-btn');
    const drawTab = document.getElementById('draw-tab');
    const typeTab = document.getElementById('type-tab');
    let activeTab = 'draw'; // 'draw' or 'type'

    tabDrawBtn.addEventListener('click', () => {
        tabDrawBtn.classList.add('active');
        tabTypeBtn.classList.remove('active');
        drawTab.classList.add('active');
        typeTab.classList.remove('active');
        activeTab = 'draw';
        updateSignerOverlay();
    });

    tabTypeBtn.addEventListener('click', () => {
        tabTypeBtn.classList.add('active');
        tabDrawBtn.classList.remove('active');
        typeTab.classList.add('active');
        drawTab.classList.remove('active');
        activeTab = 'type';
        renderTypePreviews();
        updateSignerOverlay();
    });

    // ---- Canvas Drawing Logic ----
    const canvas = document.getElementById('signature-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let penColor = '#000000';
    let penWidth = 3;
    let isCanvasEmpty = true;

    // Canvas line configuration
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches && e.touches.length > 0) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        const coords = getCoordinates(e);
        lastX = coords.x;
        lastY = coords.y;
        isCanvasEmpty = false;
        
        // Hide the signature line hint overlay when user starts drawing
        const lineHint = document.querySelector('.canvas-line-hint');
        if (lineHint) lineHint.style.opacity = '0';
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent touch scrolling
        const coords = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        ctx.stroke();

        lastX = coords.x;
        lastY = coords.y;
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            updateSignerOverlay();
        }
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Color pickers
    const colorCircles = document.querySelectorAll('.color-circle');
    colorCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            colorCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            penColor = circle.getAttribute('data-color');
            if (activeTab === 'type') {
                renderTypePreviews();
                updateSignerOverlay();
            }
        });
    });

    // Width buttons
    const widthButtons = document.querySelectorAll('.width-btn');
    widthButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            widthButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            penWidth = parseInt(btn.getAttribute('data-width'), 10);
        });
    });

    // Clear Canvas
    const clearBtn = document.getElementById('clear-canvas-btn');
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isCanvasEmpty = true;
        const lineHint = document.querySelector('.canvas-line-hint');
        if (lineHint) lineHint.style.opacity = '1';
        updateSignerOverlay();
    });

    // ---- Type Signature Logic ----
    const nameInput = document.getElementById('type-name-input');
    const fontsGrid = document.getElementById('fonts-grid');
    let selectedFontIndex = 0;

    const fonts = [
        { name: 'Caveat', class: 'font-caveat', style: 'Caveat, cursive' },
        { name: 'Great Vibes', class: 'font-greatvibes', style: '"Great Vibes", cursive' },
        { name: 'Sacramento', class: 'font-sacramento', style: 'Sacramento, cursive' },
        { name: 'Alex Brush', class: 'font-alexbrush', style: '"Alex Brush", cursive' },
        { name: 'Pacifico', class: 'font-pacifico', style: 'Pacifico, cursive' }
    ];

    function renderTypePreviews() {
        const text = nameInput.value.trim() || 'Signature';
        fontsGrid.innerHTML = '';

        fonts.forEach((font, index) => {
            const card = document.createElement('div');
            card.className = `font-card ${index === selectedFontIndex ? 'active' : ''}`;
            card.style.fontFamily = font.style;
            card.setAttribute('data-index', index);

            const previewText = document.createElement('div');
            previewText.className = 'font-preview-text';
            previewText.textContent = text;
            previewText.style.color = penColor; // sync color with pen

            const label = document.createElement('span');
            label.className = 'font-name-label';
            label.textContent = font.name;

            card.appendChild(previewText);
            card.appendChild(label);

            card.addEventListener('click', () => {
                selectedFontIndex = index;
                document.querySelectorAll('.font-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                updateSignerOverlay();
            });

            fontsGrid.appendChild(card);
        });
    }

    nameInput.addEventListener('input', renderTypePreviews);

    // ---- Signature PNG Rendering & Cropping ----
    function getCroppedCanvas(sourceCanvas) {
        const sCtx = sourceCanvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;
        const imgData = sCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let hasPixels = false;

        // Loop pixels to find non-transparent bounds
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha > 0) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                    hasPixels = true;
                }
            }
        }

        if (!hasPixels) return null;

        // Add 12px padding
        const pad = 12;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(width, maxX + pad);
        maxY = Math.min(height, maxY + pad);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = maxX - minX;
        cropCanvas.height = maxY - minY;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(sourceCanvas, minX, minY, cropCanvas.width, cropCanvas.height, 0, 0, cropCanvas.width, cropCanvas.height);
        return cropCanvas;
    }

    function generateSignaturePNG() {
        if (activeTab === 'draw') {
            if (isCanvasEmpty) return null;
            const cropped = getCroppedCanvas(canvas);
            return cropped ? cropped.toDataURL('image/png') : null;
        } else {
            // Render text signature to high-res temporary canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 750;
            tempCanvas.height = 250;
            const tCtx = tempCanvas.getContext('2d');

            const text = nameInput.value.trim() || 'Signature';
            const selectedFont = fonts[selectedFontIndex];

            tCtx.textBaseline = 'middle';
            tCtx.textAlign = 'center';
            tCtx.fillStyle = penColor;
            tCtx.font = `65px ${selectedFont.style}`;
            tCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

            const cropped = getCroppedCanvas(tempCanvas);
            return cropped ? cropped.toDataURL('image/png') : null;
        }
    }

    // ---- Download & Clipboard Actions ----
    const downloadSigBtn = document.getElementById('download-sig-btn');
    const copySigBtn = document.getElementById('copy-sig-btn');

    downloadSigBtn.addEventListener('click', () => {
        const dataUrl = generateSignaturePNG();
        if (!dataUrl) {
            window.showToast('Please draw or type your signature first.');
            return;
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'signature.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.showToast('Signature downloaded successfully!');
    });

    copySigBtn.addEventListener('click', () => {
        const dataUrl = generateSignaturePNG();
        if (!dataUrl) {
            window.showToast('Please draw or type your signature first.');
            return;
        }

        // Convert base64 DataURL to Blob
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                if (navigator.clipboard && navigator.clipboard.write) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item])
                        .then(() => window.showToast('Signature copied to clipboard!'))
                        .catch(err => {
                            console.error(err);
                            window.showToast('Clipboard write permission denied.');
                        });
                } else {
                    window.showToast('Clipboard copy is not supported in this browser.');
                }
            });
    });

    // ---- Document Signer Overlay Workspace ----
    const docDropZone = document.getElementById('doc-drop-zone');
    const docFileInput = document.getElementById('doc-file-input');
    const signerWorkspace = document.getElementById('signer-workspace');
    const bgDocImg = document.getElementById('bg-doc-img');
    const sigOverlayImg = document.getElementById('sig-overlay-img');
    const sigOverlay = document.getElementById('signature-overlay');
    const documentWrapper = document.getElementById('document-wrapper');
    const sigScaleSlider = document.getElementById('sig-scale-slider');
    const scaleValue = document.getElementById('scale-value');
    const downloadDocBtn = document.getElementById('download-doc-btn');
    const removeDocBtn = document.getElementById('remove-doc-btn');

    let documentLoaded = false;
    let overlayBaseWidth = 160;
    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 1;
    let fileType = 'image'; // 'image' or 'pdf'

    // Helper to load image as Promise
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    // Trigger browse files
    docDropZone.addEventListener('click', () => docFileInput.click());

    docFileInput.addEventListener('change', handleDocFileSelect);

    // Drag over handlers
    docDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        docDropZone.classList.add('dragover');
    });

    docDropZone.addEventListener('dragleave', () => {
        docDropZone.classList.remove('dragover');
    });

    docDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        docDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.match('image.*') || file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                loadDocument(file);
            } else {
                window.showToast('Please upload an image or PDF document.');
            }
        }
    });

    function handleDocFileSelect(e) {
        if (e.target.files.length > 0) {
            loadDocument(e.target.files[0]);
        }
    }

    function loadDocument(file) {
        pdfDoc = null;
        currentPage = 1;
        totalPages = 1;
        document.getElementById('pdf-page-controls').style.display = 'none';

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            fileType = 'pdf';
            const reader = new FileReader();
            reader.onload = function() {
                const typedarray = new Uint8Array(this.result);
                if (typeof pdfjsLib === 'undefined') {
                    window.showToast('PDF.js library failed to load.');
                    return;
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                
                pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
                    pdfDoc = pdf;
                    totalPages = pdf.numPages;
                    documentLoaded = true;

                    docDropZone.style.display = 'none';
                    signerWorkspace.style.display = 'block';

                    // Clear any manual offset positioning so it re-centers
                    sigOverlay.style.left = '';
                    sigOverlay.style.top = '';

                    if (totalPages > 1) {
                        document.getElementById('pdf-page-controls').style.display = 'flex';
                        document.getElementById('pdf-total-pages').textContent = totalPages;
                        updatePdfPageControls();
                    }

                    renderPdfPage(1);
                }).catch(err => {
                    console.error(err);
                    window.showToast('Failed to parse PDF document.');
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            fileType = 'image';
            const reader = new FileReader();
            reader.onload = (event) => {
                bgDocImg.src = event.target.result;
                bgDocImg.onload = () => {
                    docDropZone.style.display = 'none';
                    signerWorkspace.style.display = 'block';
                    documentLoaded = true;

                    // Clear any manual offset positioning so it re-centers
                    sigOverlay.style.left = '';
                    sigOverlay.style.top = '';

                    updateSignerOverlay();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    function renderPdfPage(pageNum) {
        if (!pdfDoc) return;

        pdfDoc.getPage(pageNum).then(page => {
            // Render at scale 1.5 for a sharp workspace preview
            const viewport = page.getViewport({ scale: 1.5 });
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = viewport.width;
            pageCanvas.height = viewport.height;
            const pCtx = pageCanvas.getContext('2d');

            const renderTask = page.render({
                canvasContext: pCtx,
                viewport: viewport
            });

            renderTask.promise.then(() => {
                bgDocImg.src = pageCanvas.toDataURL('image/png');
                bgDocImg.onload = () => {
                    document.getElementById('pdf-current-page').textContent = pageNum;
                    updateSignerOverlay();
                };
            });
        });
    }

    function updatePdfPageControls() {
        document.getElementById('pdf-prev-page').disabled = currentPage <= 1;
        document.getElementById('pdf-next-page').disabled = currentPage >= totalPages;
    }

    // PDF Pagination event listeners
    document.getElementById('pdf-prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPdfPage(currentPage);
            updatePdfPageControls();
        }
    });

    document.getElementById('pdf-next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPdfPage(currentPage);
            updatePdfPageControls();
        }
    });

    function updateSignerOverlay() {
        if (!documentLoaded) return;
        const sigDataUrl = generateSignaturePNG();
        if (sigDataUrl) {
            sigOverlayImg.src = sigDataUrl;
            sigOverlay.style.display = 'block';
            
            // Set base dimensions of the overlay proportional to signature image aspect ratio
            const tempImg = new Image();
            tempImg.src = sigDataUrl;
            tempImg.onload = () => {
                const aspect = tempImg.height / tempImg.width;
                const scaleVal = parseInt(sigScaleSlider.value, 10) / 100;
                
                const newWidth = overlayBaseWidth * scaleVal;
                const newHeight = overlayBaseWidth * scaleVal * aspect;
                sigOverlay.style.width = `${newWidth}px`;
                sigOverlay.style.height = `${newHeight}px`;

                // Center initially if not already manually positioned
                if (!sigOverlay.style.left || sigOverlay.style.left === '') {
                    const left = (documentWrapper.clientWidth - newWidth) / 2;
                    const top = (documentWrapper.clientHeight - newHeight) / 2;
                    sigOverlay.style.left = `${left}px`;
                    sigOverlay.style.top = `${top}px`;
                }
            };
        } else {
            sigOverlay.style.display = 'none';
        }
    }

    // Size Slider listener
    sigScaleSlider.addEventListener('input', () => {
        const val = sigScaleSlider.value;
        scaleValue.textContent = `${val}%`;
        
        if (documentLoaded && sigOverlayImg.src) {
            const aspect = sigOverlayImg.naturalHeight / sigOverlayImg.naturalWidth;
            const scaleVal = val / 100;
            const finalW = overlayBaseWidth * scaleVal;
            const finalH = overlayBaseWidth * scaleVal * aspect;
            
            sigOverlay.style.width = `${finalW}px`;
            sigOverlay.style.height = `${finalH}px`;

            // Adjust position if resizing drives it outside boundary
            const maxLeft = documentWrapper.clientWidth - finalW;
            const maxTop = documentWrapper.clientHeight - finalH;
            let left = parseFloat(sigOverlay.style.left) || 0;
            let top = parseFloat(sigOverlay.style.top) || 0;

            if (left > maxLeft) sigOverlay.style.left = `${Math.max(0, maxLeft)}px`;
            if (top > maxTop) sigOverlay.style.top = `${Math.max(0, maxTop)}px`;
        }
    });

    // Draggable & Resizable logic for Signature Overlay
    let activeDrag = false;
    let activeResize = false;
    let startX, startY;
    let initialLeft, initialTop;
    let startResizeX, startResizeY;
    let initialWidth, initialHeight;

    sigOverlay.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    sigOverlay.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (!documentLoaded) return;
        
        // Handle Resize instead of Drag if clicking the handle
        if (e.target.classList.contains('resize-handle')) {
            resizeStart(e);
            return;
        }

        e.preventDefault();
        activeDrag = true;
        sigOverlay.classList.add('dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        initialLeft = sigOverlay.offsetLeft;
        initialTop = sigOverlay.offsetTop;
    }

    function drag(e) {
        if (activeResize) {
            resizeDrag(e);
            return;
        }
        if (!activeDrag) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let left = initialLeft + deltaX;
        let top = initialTop + deltaY;

        // Constraint within wrapper bounds
        const maxLeft = documentWrapper.clientWidth - sigOverlay.clientWidth;
        const maxTop = documentWrapper.clientHeight - sigOverlay.clientHeight;

        left = Math.max(0, Math.min(left, maxLeft));
        top = Math.max(0, Math.min(top, maxTop));

        sigOverlay.style.left = `${left}px`;
        sigOverlay.style.top = `${top}px`;
    }

    function dragEnd() {
        if (activeResize) {
            resizeEnd();
            return;
        }
        if (activeDrag) {
            activeDrag = false;
            sigOverlay.classList.remove('dragging');
        }
    }

    // Resize handlers
    function resizeStart(e) {
        e.preventDefault();
        e.stopPropagation();
        activeResize = true;
        sigOverlay.classList.add('resizing');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        startResizeX = clientX;
        startResizeY = clientY;

        initialWidth = sigOverlay.clientWidth;
        initialHeight = sigOverlay.clientHeight;
    }

    function resizeDrag(e) {
        if (!activeResize) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startResizeX;
        let newWidth = initialWidth + deltaX;

        // Map dimensions to slider percentages
        let newPercent = (newWidth / overlayBaseWidth) * 100;

        // Clamp between slider min and max limits
        const minPercent = parseInt(sigScaleSlider.min, 10) || 20;
        const maxPercent = parseInt(sigScaleSlider.max, 10) || 250;
        newPercent = Math.max(minPercent, Math.min(newPercent, maxPercent));

        // Update slider value & display label
        sigScaleSlider.value = Math.round(newPercent);
        scaleValue.textContent = `${Math.round(newPercent)}%`;

        // Update overlay dimensions
        const aspect = sigOverlayImg.naturalHeight / sigOverlayImg.naturalWidth;
        const scaleVal = newPercent / 100;
        const finalW = overlayBaseWidth * scaleVal;
        const finalH = overlayBaseWidth * scaleVal * aspect;

        sigOverlay.style.width = `${finalW}px`;
        sigOverlay.style.height = `${finalH}px`;

        // Maintain coordinate bounds alignment
        const maxLeft = documentWrapper.clientWidth - finalW;
        const maxTop = documentWrapper.clientHeight - finalH;
        let left = parseFloat(sigOverlay.style.left) || 0;
        let top = parseFloat(sigOverlay.style.top) || 0;

        if (left > maxLeft) sigOverlay.style.left = `${Math.max(0, maxLeft)}px`;
        if (top > maxTop) sigOverlay.style.top = `${Math.max(0, maxTop)}px`;
    }

    function resizeEnd() {
        if (activeResize) {
            activeResize = false;
            sigOverlay.classList.remove('resizing');
        }
    }

    // Clean Document workspace
    removeDocBtn.addEventListener('click', () => {
        bgDocImg.src = '';
        docDropZone.style.display = 'block';
        signerWorkspace.style.display = 'none';
        documentLoaded = false;
        docFileInput.value = '';
        pdfDoc = null;
        document.getElementById('pdf-page-controls').style.display = 'none';
    });

    // Export Signed document
    downloadDocBtn.addEventListener('click', async () => {
        if (!documentLoaded) return;
        
        const sigDataUrl = generateSignaturePNG();
        if (!sigDataUrl) {
            window.showToast('Please create a signature first.');
            return;
        }

        if (fileType === 'pdf') {
            // PDF Compiler Branch
            downloadDocBtn.textContent = 'Preparing pages...';
            downloadDocBtn.disabled = true;

            try {
                const { jsPDF } = window.jspdf;
                let pdfCompiler = null;

                for (let i = 1; i <= totalPages; i++) {
                    downloadDocBtn.textContent = `Compiling page ${i} of ${totalPages}...`;
                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = viewport.width;
                    pageCanvas.height = viewport.height;
                    const pCtx = pageCanvas.getContext('2d');

                    await page.render({
                        canvasContext: pCtx,
                        viewport: viewport
                    }).promise;

                    // Overlay signature on the active selected page only
                    if (i === currentPage) {
                        const sigImg = await loadImage(sigDataUrl);
                        
                        const dispWidth = bgDocImg.clientWidth;
                        const scale = viewport.width / dispWidth;

                        const sigLeft = sigOverlay.offsetLeft;
                        const sigTop = sigOverlay.offsetTop;
                        const sigWidth = sigOverlay.clientWidth;
                        const sigHeight = sigOverlay.clientHeight;

                        const drawX = sigLeft * scale;
                        const drawY = sigTop * scale;
                        const drawW = sigWidth * scale;
                        const drawH = sigHeight * scale;

                        pCtx.drawImage(sigImg, drawX, drawY, drawW, drawH);
                    }

                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                    const orientation = viewport.width > viewport.height ? 'l' : 'p';

                    if (i === 1) {
                        pdfCompiler = new jsPDF({
                            orientation: orientation,
                            unit: 'px',
                            format: [viewport.width, viewport.height]
                        });
                    } else {
                        pdfCompiler.addPage([viewport.width, viewport.height], orientation);
                    }

                    pdfCompiler.addImage(pageImgData, 'JPEG', 0, 0, viewport.width, viewport.height);
                }

                if (pdfCompiler) {
                    pdfCompiler.save('signed-document.pdf');
                    window.showToast('Signed PDF downloaded successfully!');
                }
            } catch (err) {
                console.error(err);
                window.showToast('Error creating signed PDF file.');
            } finally {
                downloadDocBtn.textContent = '💾 Download Signed Document';
                downloadDocBtn.disabled = false;
            }
        } else {
            // Image Exporter Branch
            downloadDocBtn.textContent = 'Generating Signed Copy...';
            downloadDocBtn.disabled = true;

            const exportCanvas = document.createElement('canvas');
            const eCtx = exportCanvas.getContext('2d');

            exportCanvas.width = bgDocImg.naturalWidth;
            exportCanvas.height = bgDocImg.naturalHeight;

            eCtx.drawImage(bgDocImg, 0, 0);

            const overlayImgElement = new Image();
            overlayImgElement.src = sigDataUrl;
            overlayImgElement.onload = () => {
                const dispWidth = bgDocImg.clientWidth;
                const scale = bgDocImg.naturalWidth / dispWidth;

                const sigLeft = sigOverlay.offsetLeft;
                const sigTop = sigOverlay.offsetTop;
                const sigWidth = sigOverlay.clientWidth;
                const sigHeight = sigOverlay.clientHeight;

                const drawX = sigLeft * scale;
                const drawY = sigTop * scale;
                const drawW = sigWidth * scale;
                const drawH = sigHeight * scale;

                eCtx.drawImage(overlayImgElement, drawX, drawY, drawW, drawH);

                const docUrl = exportCanvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = docUrl;
                link.download = 'signed-document.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                downloadDocBtn.textContent = '💾 Download Signed Document';
                downloadDocBtn.disabled = false;
                window.showToast('Signed document downloaded successfully!');
            };
        }
    });
});
