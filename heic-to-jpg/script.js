/* =========================================
   ToolCanvas — HEIC to JPG script.js
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

        qualitySlider.addEventListener('input', function() {
            qualityVal.textContent = this.value + '%';
        });

        enableResize.addEventListener('change', function() {
            if (this.checked) {
                resizeFields.style.display = 'block';
                resizeWidth.value = '';
                resizeHeight.value = '';
                resizeWidth.placeholder = 'e.g. 1920';
                resizeHeight.placeholder = 'e.g. 1080';
            } else {
                resizeFields.style.display = 'none';
            }
        });

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
                resizeWidth.placeholder = 'e.g. 1920';
                resizeHeight.placeholder = 'e.g. 1080';
            }
        });

        convertBtn.addEventListener('click', convertAllImages);
        downloadAllBtn.addEventListener('click', downloadAllImages);
        resetBtn.addEventListener('click', resetWorkspace);
    }

    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }

    function isHeicFile(file) {
        return /\.heics?$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif' || file.type === '' && /\.heics?$/i.test(file.name);
    }

    function processFiles(files) {
        let validCount = 0;
        const startQueueLen = filesQueue.length;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isHeic = isHeicFile(file);
            // For this dedicated tool, only accept HEIC/HEIF
            if (!isHeic) {
                continue;
            }
            validCount++;

            const fileObj = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type || 'image/heic',
                originalImage: null,
                originalWidth: 0,
                originalHeight: 0,
                originalAspectRatio: 1,
                convertedDataUrl: null,
                outputSize: 0,
                status: 'ready',
                previewSrc: null,
                decodedBlob: null
            };

            filesQueue.push(fileObj);

            // For HEIC, use heic2any to decode to JPEG blob first
            if (typeof heic2any !== 'undefined') {
                // Use heic2any to convert to JPEG blob for preview
                heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9
                }).then(function(jpegBlob) {
                    // Handle case where heic2any returns array (for multiple images)
                    const blob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
                    fileObj.decodedBlob = blob;
                    const url = URL.createObjectURL(blob);
                    const img = new Image();
                    img.onload = function() {
                        fileObj.originalImage = img;
                        fileObj.originalWidth = this.naturalWidth;
                        fileObj.originalHeight = this.naturalHeight;
                        fileObj.originalAspectRatio = this.naturalWidth / this.naturalHeight;
                        fileObj.previewSrc = url;
                        renderFilesList();
                    };
                    img.onerror = function() {
                        // Fallback: try as data URL
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const fallbackImg = new Image();
                            fallbackImg.onload = function() {
                                fileObj.originalImage = fallbackImg;
                                fileObj.originalWidth = this.naturalWidth;
                                fileObj.originalHeight = this.naturalHeight;
                                fileObj.originalAspectRatio = this.naturalWidth / this.naturalHeight;
                                fileObj.previewSrc = e.target.result;
                                renderFilesList();
                            };
                            fallbackImg.src = e.target.result;
                        };
                        reader.readAsDataURL(blob);
                    };
                    img.src = url;
                }).catch(function(err) {
                    console.error('HEIC decode failed', err);
                    fileObj.status = 'error';
                    fileObj.previewSrc = '';
                    if (window.showToast) window.showToast('Failed to decode HEIC: ' + file.name);
                    renderFilesList();
                });
            } else {
                // heic2any not loaded — try direct FileReader fallback (may fail on non-Safari)
                const reader = new FileReader();
                reader.onload = (function(obj) {
                    return function (e) {
                        const img = new Image();
                        img.onload = function () {
                            obj.originalImage = img;
                            obj.originalWidth = this.naturalWidth;
                            obj.originalHeight = this.naturalHeight;
                            obj.originalAspectRatio = this.naturalWidth / this.naturalHeight;
                            obj.previewSrc = e.target.result;
                            renderFilesList();
                        };
                        img.onerror = function() {
                            obj.status = 'error';
                            renderFilesList();
                            if (window.showToast) window.showToast('HEIC not supported in this browser for ' + obj.name);
                        };
                        img.src = e.target.result;
                        obj.previewSrc = e.target.result;
                    };
                })(fileObj);
                reader.readAsDataURL(file);
            }
        }

        if (validCount === 0) {
            if (window.showToast) window.showToast('Please select HEIC/HEIF files only');
            return;
        }

        dropZone.style.display = 'none';
        converterWorkspace.style.display = 'block';
        
        if (startQueueLen === 0) {
            enableResize.checked = false;
            resizeFields.style.display = 'none';
            qualitySlider.value = 90;
            qualityVal.textContent = '90%';
            downloadAllBtn.style.display = 'none';
        }
        
        renderFilesList();
    }

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
        
        const header = document.createElement('div');
        header.className = 'file-card-header';
        
        const img = document.createElement('img');
        img.className = 'file-card-thumb';
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
        } else if (obj.status === 'error') {
            metaSpan.textContent += ` | Failed to decode`;
            metaSpan.style.color = '#ef4444';
        }
        
        info.appendChild(nameSpan);
        info.appendChild(metaSpan);
        header.appendChild(img);
        header.appendChild(info);
        card.appendChild(header);
        
        const statusContainer = document.createElement('div');
        statusContainer.className = 'file-card-status-container';
        
        const statusBadge = document.createElement('span');
        let statusText = 'Ready';
        let statusClass = 'status-ready';
        if (obj.status === 'converting') { statusText = 'Converting...'; statusClass = 'status-converting'; }
        else if (obj.status === 'done') { statusText = 'Success ✓'; statusClass = 'status-success'; }
        else if (obj.status === 'error') { statusText = 'Error'; statusClass = 'status-converting'; }
        statusBadge.className = 'file-card-status ' + statusClass;
        statusBadge.textContent = statusText;
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
        
        const actions = document.createElement('div');
        actions.className = 'file-card-actions';
        
        if (obj.status === 'ready' || obj.status === 'error') {
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
            downloadBtn.download = `${baseName}.jpg`;
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

    function convertAllImages() {
        if (filesQueue.length === 0) return;
        
        let completedCount = 0;
        
        filesQueue.forEach(function (obj) {
            if (!obj.originalImage) {
                // Try to skip error files
                if (obj.status === 'error') {
                    completedCount++;
                    return;
                }
                return;
            }
            
            obj.status = 'converting';
            updateFileCard(obj);
            
            setTimeout(function() {
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

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(obj.originalImage, 0, 0, targetWidth, targetHeight);

                const quality = parseFloat(qualitySlider.value) / 100;
                const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);

                const base64Data = jpegDataUrl.split(',')[1];
                obj.outputSize = Math.round(base64Data.length * 3 / 4);
                obj.convertedDataUrl = jpegDataUrl;
                obj.status = 'done';
                
                updateFileCard(obj);
                
                completedCount++;
                if (completedCount === filesQueue.filter(o=>o.status!=='error').length) {
                    downloadAllBtn.style.display = 'block';
                }
            }, 50);
        });
    }

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
                link.download = `${baseName}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            index++;
            setTimeout(downloadNext, 200);
        }
        downloadNext();
    }

    function resetWorkspace() {
        filesQueue = [];
        fileInput.value = '';
        dropZone.style.display = 'block';
        converterWorkspace.style.display = 'none';
        downloadAllBtn.style.display = 'none';
    }

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
