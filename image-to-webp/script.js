/* =========================================
   ToolCanvas — Image to WebP script.js
   ========================================= */

(function () {
    'use strict';

    // State Variables
    let filesQueue = [];

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const converterWorkspace = document.getElementById('converter-workspace');
    
    // Controls
    const losslessCheck = document.getElementById('lossless-check');
    const qualityGroup = document.getElementById('quality-group');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityVal = document.getElementById('quality-val');
    
    const enableResize = document.getElementById('enable-resize');
    const resizeFields = document.getElementById('resize-fields');
    const resizeWidth = document.getElementById('resize-width');
    const resizeHeight = document.getElementById('resize-height');
    const aspectRatioLock = document.getElementById('aspect-ratio');
    
    // Actions
    const convertBtn = document.getElementById('convert-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const resetBtn = document.getElementById('reset-btn');

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

        // Lossless Toggle (disables quality slider)
        losslessCheck.addEventListener('change', function() {
            if (this.checked) {
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

        // Resize Checkbox toggle
        enableResize.addEventListener('change', function() {
            if (this.checked) {
                resizeFields.style.display = 'block';
                resizeWidth.value = '';
                resizeHeight.value = '';
                resizeWidth.placeholder = 'e.g. 1200';
                resizeHeight.placeholder = 'e.g. 800';
            } else {
                resizeFields.style.display = 'none';
            }
        });

        // Aspect ratio lock auto placeholders
        resizeWidth.addEventListener('input', function() {
            if (aspectRatioLock.checked && this.value > 0) {
                resizeHeight.placeholder = 'Auto';
                resizeHeight.value = '';
            }
        });

        resizeHeight.addEventListener('input', function() {
            if (aspectRatioLock.checked && this.value > 0) {
                resizeWidth.placeholder = 'Auto';
                resizeWidth.value = '';
            }
        });

        aspectRatioLock.addEventListener('change', function() {
            if (this.checked) {
                if (resizeWidth.value > 0) {
                    resizeHeight.placeholder = 'Auto';
                    resizeHeight.value = '';
                } else if (resizeHeight.value > 0) {
                    resizeWidth.placeholder = 'Auto';
                    resizeWidth.value = '';
                }
            } else {
                resizeWidth.placeholder = 'e.g. 1200';
                resizeHeight.placeholder = 'e.g. 800';
            }
        });

        // Action triggers
        convertBtn.addEventListener('click', convertAllImages);
        downloadAllBtn.addEventListener('click', downloadAllImages);
        resetBtn.addEventListener('click', resetWorkspace);
    }

    // Process Selected Files
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }

    function processFiles(files) {
        let loadedCount = 0;
        const totalFiles = files.length;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) {
                continue;
            }

            const fileObj = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                originalImage: null,
                originalWidth: 0,
                originalHeight: 0,
                originalAspectRatio: 1,
                convertedDataUrl: null,
                outputSize: 0,
                status: 'ready'
            };

            filesQueue.push(fileObj);

            const reader = new FileReader();
            reader.onload = (function(obj) {
                return function (e) {
                    const img = new Image();
                    img.onload = function () {
                        obj.originalImage = img;
                        obj.originalWidth = this.naturalWidth;
                        obj.originalHeight = this.naturalHeight;
                        obj.originalAspectRatio = this.naturalWidth / this.naturalHeight;
                        
                        loadedCount++;
                        if (loadedCount === totalFiles) {
                            renderFilesList();
                        } else {
                            updateFileCard(obj);
                        }
                    };
                    img.src = e.target.result;
                    obj.previewSrc = e.target.result;
                };
            })(fileObj);
            reader.readAsDataURL(file);
        }

        // Show Workspace
        dropZone.style.display = 'none';
        converterWorkspace.style.display = 'block';
        
        // Reset controls state on first batch load
        if (filesQueue.length === totalFiles) {
            enableResize.checked = false;
            resizeFields.style.display = 'none';
            losslessCheck.checked = false;
            qualitySlider.disabled = false;
            qualitySlider.value = 80;
            qualityVal.textContent = '80%';
            qualityGroup.style.opacity = '1';
            downloadAllBtn.style.display = 'none';
        }
        
        renderFilesList();
    }

    // Render Files List in UI
    function renderFilesList() {
        const container = document.getElementById('files-list-container');
        if (!container) return;
        container.innerHTML = '';

        if (filesQueue.length === 0) {
            resetWorkspace();
            return;
        }

        filesQueue.forEach(function (obj) {
            const card = createFileCardDOM(obj);
            container.appendChild(card);
        });
    }

    function updateFileCard(obj) {
        const existingCard = document.getElementById(obj.id);
        if (existingCard && existingCard.parentNode) {
            const newCard = createFileCardDOM(obj);
            existingCard.parentNode.replaceChild(newCard, existingCard);
        }
    }

    function createFileCardDOM(obj) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.id = obj.id;
        
        // Header (Thumb & Name)
        const header = document.createElement('div');
        header.className = 'file-card-header';
        
        const img = document.createElement('img');
        img.className = 'file-card-thumb checkerboard';
        img.src = obj.previewSrc || '#';
        img.alt = 'Thumbnail';
        
        const info = document.createElement('div');
        info.className = 'file-card-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'file-card-name';
        nameSpan.title = obj.name;
        nameSpan.textContent = obj.name;
        
        const metaSpan = document.createElement('span');
        metaSpan.className = 'file-card-meta';
        metaSpan.textContent = `Original: ${formatBytes(obj.size)}`;
        if (obj.originalWidth > 0) {
            metaSpan.textContent += ` | ${obj.originalWidth} × ${obj.originalHeight} px`;
        }
        
        info.appendChild(nameSpan);
        info.appendChild(metaSpan);
        header.appendChild(img);
        header.appendChild(info);
        card.appendChild(header);
        
        // Status Row
        const statusContainer = document.createElement('div');
        statusContainer.className = 'file-card-status-container';
        
        const statusBadge = document.createElement('span');
        statusBadge.className = 'file-card-status ' + (obj.status === 'ready' ? 'status-ready' : obj.status === 'converting' ? 'status-converting' : 'status-success');
        statusBadge.textContent = obj.status === 'ready' ? 'Ready' : obj.status === 'converting' ? 'Converting...' : 'Success ✓';
        statusContainer.appendChild(statusBadge);
        
        if (obj.status === 'done' && obj.outputSize > 0) {
            const savingsSpan = document.createElement('span');
            savingsSpan.className = 'file-card-savings';
            
            const savingsPercent = Math.round(((obj.size - obj.outputSize) / obj.size) * 100);
            const formattedOutput = formatBytes(obj.outputSize);
            if (savingsPercent > 0) {
                savingsSpan.textContent = `${formattedOutput} (Saved ${savingsPercent}%)`;
                savingsSpan.style.color = '#16a34a';
            } else if (savingsPercent < 0) {
                savingsSpan.textContent = `${formattedOutput} (+${Math.abs(savingsPercent)}%)`;
                savingsSpan.style.color = '#b45309';
            } else {
                savingsSpan.textContent = formattedOutput;
                savingsSpan.style.color = '#475569';
            }
            statusContainer.appendChild(savingsSpan);
        }
        
        card.appendChild(statusContainer);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'file-card-actions';
        
        if (obj.status === 'ready') {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-file';
            removeBtn.innerHTML = '✕';
            removeBtn.title = 'Remove file';
            removeBtn.addEventListener('click', function() {
                removeFileFromQueue(obj.id);
            });
            actions.appendChild(removeBtn);
        } else if (obj.status === 'done') {
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'btn-download-file';
            downloadBtn.href = obj.convertedDataUrl;
            
            const dotIndex = obj.name.lastIndexOf('.');
            const baseName = dotIndex !== -1 ? obj.name.substring(0, dotIndex) : obj.name;
            
            downloadBtn.download = `${baseName}_converted.webp`;
            downloadBtn.textContent = 'Download';
            actions.appendChild(downloadBtn);
        }
        
        card.appendChild(actions);
        return card;
    }

    function removeFileFromQueue(id) {
        filesQueue = filesQueue.filter(function(obj) {
            return obj.id !== id;
        });
        renderFilesList();
    }

    // Perform Local Conversion
    function convertAllImages() {
        if (filesQueue.length === 0) return;
        
        let completedCount = 0;
        
        filesQueue.forEach(function (obj) {
            if (!obj.originalImage) return;
            
            obj.status = 'converting';
            updateFileCard(obj);
            
            setTimeout(function() {
                // Calculate Target dimensions
                let targetWidth = obj.originalWidth;
                let targetHeight = obj.originalHeight;

                if (enableResize.checked) {
                    const w = parseInt(resizeWidth.value, 10);
                    const h = parseInt(resizeHeight.value, 10);
                    if (aspectRatioLock.checked) {
                        if (w > 0) {
                            targetWidth = w;
                            targetHeight = Math.round(w / obj.originalAspectRatio);
                        } else if (h > 0) {
                            targetHeight = h;
                            targetWidth = Math.round(h * obj.originalAspectRatio);
                        }
                    } else {
                        if (w > 0 && h > 0) {
                            targetWidth = w;
                            targetHeight = h;
                        }
                    }
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                // Clear transparent canvas for WebP
                ctx.clearRect(0, 0, targetWidth, targetHeight);

                // Draw image onto canvas
                ctx.drawImage(obj.originalImage, 0, 0, targetWidth, targetHeight);

                // Export WebP data URL
                let webpDataUrl = '';
                if (losslessCheck.checked) {
                    webpDataUrl = canvas.toDataURL('image/webp', 1.0);
                } else {
                    const quality = parseFloat(qualitySlider.value) / 100;
                    webpDataUrl = canvas.toDataURL('image/webp', quality);
                }

                // Calculate output size
                const base64Data = webpDataUrl.split(',')[1];
                obj.outputSize = Math.round(base64Data.length * 3 / 4);
                obj.convertedDataUrl = webpDataUrl;
                obj.status = 'done';
                
                updateFileCard(obj);
                
                completedCount++;
                if (completedCount === filesQueue.length) {
                    downloadAllBtn.style.display = 'block';
                }
            }, 50);
        });
    }

    // Trigger Sequential Downloads
    function downloadAllImages() {
        let index = 0;
        function downloadNext() {
            if (index >= filesQueue.length) return;
            const obj = filesQueue[index];
            if (obj.status === 'done' && obj.convertedDataUrl) {
                const link = document.createElement('a');
                link.href = obj.convertedDataUrl;
                
                const dotIndex = obj.name.lastIndexOf('.');
                const baseName = dotIndex !== -1 ? obj.name.substring(0, dotIndex) : obj.name;
                
                link.download = `${baseName}_converted.webp`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            index++;
            setTimeout(downloadNext, 200);
        }
        downloadNext();
    }

    // Reset workspace to initial state
    function resetWorkspace() {
        filesQueue = [];
        fileInput.value = '';
        dropZone.style.display = 'block';
        converterWorkspace.style.display = 'none';
        downloadAllBtn.style.display = 'none';
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
