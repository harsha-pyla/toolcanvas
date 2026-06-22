/* ===== Link in Bio Generator — script.js ===== */

(function () {
    'use strict';

    // ---- State ----
    const state = {
        displayName: '',
        bio: '',
        profileImage: '', // Will hold the cropped Base64 photo data URL
        links: [],
        theme: 'sunshine'
    };

    const MAX_LINKS = 10;

    // ---- Crop State ----
    let cropImgWidth = 0;
    let cropImgHeight = 0;
    let cropImgX = 0;
    let cropImgY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    // ---- DOM References ----
    const displayNameInput = document.getElementById('display-name');
    const bioTextInput = document.getElementById('bio-text');
    const charCounter = document.getElementById('char-counter');
    
    // Upload elements
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('profile-upload');
    const previewContainer = document.getElementById('upload-preview-container');
    const uploadPreview = document.getElementById('upload-preview');
    const removeUploadBtn = document.getElementById('remove-upload-btn');
    
    // Crop Modal elements
    const cropModal = document.getElementById('crop-modal');
    const cropArea = document.getElementById('crop-area');
    const cropImg = document.getElementById('crop-image');
    const cropZoom = document.getElementById('crop-zoom');
    const cropCancelBtn = document.getElementById('crop-cancel-btn');
    const cropApplyBtn = document.getElementById('crop-apply-btn');

    const linksList = document.getElementById('links-list');
    const addLinkBtn = document.getElementById('add-link-btn');
    const linkCountHint = document.getElementById('link-count-hint');
    const themeOptions = document.getElementById('theme-options');
    const customColorControls = document.getElementById('custom-color-controls');
    
    // Custom color pickers
    const customBgInput = document.getElementById('custom-bg-color');
    const customTextInput = document.getElementById('custom-text-color');
    const customBtnBgInput = document.getElementById('custom-btn-bg');
    const customBtnTextColorInput = document.getElementById('custom-btn-text');
    
    // Action buttons
    const previewBtn = document.getElementById('preview-btn');
    const generateBtn = document.getElementById('generate-btn');
    
    // Success panel
    const successPanel = document.getElementById('success-panel');
    const shareableUrlInput = document.getElementById('shareable-url');
    const copyUrlBtn = document.getElementById('copy-url-btn');
    const toast = document.getElementById('toast');

    // ---- Unicode Base64 Helpers ----
    function toUrlSafeBase64(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        } catch (e) {
            console.error("Error encoding to base64", e);
            return "";
        }
    }

    function fromUrlSafeBase64(str) {
        try {
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            return decodeURIComponent(escape(atob(base64)));
        } catch (e) {
            console.error("Error decoding from base64", e);
            return "";
        }
    }

    // ---- Initialize ----
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const compressedParam = urlParams.get('p');
        const hasParams = compressedParam || urlParams.has('username') || urlParams.has('bio') || urlParams.has('links');

        if (hasParams) {
            // View Mode
            document.body.classList.add('view-mode-active');
            
            if (compressedParam) {
                // Decode from short URL safe base64
                const jsonStr = fromUrlSafeBase64(compressedParam);
                if (jsonStr) {
                    try {
                        const payload = JSON.parse(jsonStr);
                        state.displayName = payload.u || '';
                        state.bio = payload.b || '';
                        state.theme = payload.t || 'sunshine';
                        state.profileImage = payload.i || '';
                        
                        if (state.theme === 'custom') {
                            customBgInput.value = payload.bg || '#ffffff';
                            customTextInput.value = payload.tx || '#1a1a1a';
                            customBtnBgInput.value = payload.bb || '#2563eb';
                            customBtnTextColorInput.value = payload.bt || '#ffffff';
                        }
                        
                        if (payload.l && Array.isArray(payload.l)) {
                            state.links = payload.l.map(arr => ({
                                title: arr[0] || '',
                                url: arr[1] || ''
                            }));
                        } else {
                            state.links = [];
                        }
                    } catch (e) {
                        console.error("Error parsing compressed param", e);
                    }
                }
            } else {
                // Backwards compatibility with verbose parameters
                state.displayName = urlParams.get('username') || '';
                state.bio = urlParams.get('bio') || '';
                state.theme = urlParams.get('theme') || 'sunshine';
                state.profileImage = urlParams.get('image') || '';
                
                if (state.theme === 'custom') {
                    customBgInput.value = urlParams.get('bg') || '#ffffff';
                    customTextInput.value = urlParams.get('text') || '#1a1a1a';
                    customBtnBgInput.value = urlParams.get('btnBg') || '#2563eb';
                    customBtnTextColorInput.value = urlParams.get('btnText') || '#ffffff';
                }

                const linksParam = urlParams.get('links');
                if (linksParam) {
                    try {
                        state.links = JSON.parse(linksParam);
                    } catch (e) {
                        console.error("Error parsing links parameter", e);
                        state.links = [];
                    }
                }
            }
            updatePreview();
        } else {
            // Edit Mode
            addLink();
            addLink();
            updatePreview();
            bindEvents();
        }
    }

    // ---- Event Binding ----
    function bindEvents() {
        // Step 1: Profile name input
        displayNameInput.addEventListener('input', function () {
            state.displayName = this.value;
            updatePreview();
        });

        // Step 1: Upload and Drag-and-drop
        uploadZone.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            handleFileUpload(this.files[0]);
        });

        uploadZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', function () {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        removeUploadBtn.addEventListener('click', function () {
            clearFileUploadState();
            updatePreview();
        });

        // Crop Modal dragging (Mouse)
        cropArea.addEventListener('mousedown', function (e) {
            isDragging = true;
            dragStartX = e.clientX - cropImgX;
            dragStartY = e.clientY - cropImgY;
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            cropImgX = e.clientX - dragStartX;
            cropImgY = e.clientY - dragStartY;
            updateCropImageStyle();
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });

        // Crop Modal dragging (Touch)
        cropArea.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                isDragging = true;
                dragStartX = e.touches[0].clientX - cropImgX;
                dragStartY = e.touches[0].clientY - cropImgY;
            }
        });

        document.addEventListener('touchmove', function (e) {
            if (!isDragging || e.touches.length !== 1) return;
            cropImgX = e.touches[0].clientX - dragStartX;
            cropImgY = e.touches[0].clientY - dragStartY;
            updateCropImageStyle();
        });

        document.addEventListener('touchend', function () {
            isDragging = false;
        });

        // Zoom slider
        cropZoom.addEventListener('input', updateCropImageStyle);

        // Crop modal buttons
        cropCancelBtn.addEventListener('click', function () {
            cropModal.style.display = 'none';
            fileInput.value = '';
        });

        cropApplyBtn.addEventListener('click', applyCrop);

        // Step 2: Bio input and counter
        bioTextInput.addEventListener('input', function () {
            state.bio = this.value;
            charCounter.textContent = this.value.length + ' / 40';
            if (this.value.length >= 40) {
                charCounter.classList.add('limit-reached');
            } else {
                charCounter.classList.remove('limit-reached');
            }
            updatePreview();
        });

        // Step 3: Links event delegation
        linksList.addEventListener('input', function (e) {
            const item = e.target.closest('.link-item');
            if (!item) return;
            const index = parseInt(item.dataset.index, 10);
            if (e.target.classList.contains('link-title-input')) {
                state.links[index].title = e.target.value;
            } else if (e.target.classList.contains('link-url-input')) {
                state.links[index].url = e.target.value;
            }
            updatePreview();
        });

        linksList.addEventListener('click', function (e) {
            const deleteBtn = e.target.closest('.link-delete-btn');
            if (!deleteBtn) return;
            const item = deleteBtn.closest('.link-item');
            if (!item) return;
            const index = parseInt(item.dataset.index, 10);
            removeLink(index);
        });

        addLinkBtn.addEventListener('click', addLink);

        // Step 4: Theme options
        themeOptions.addEventListener('change', function (e) {
            if (e.target.name === 'theme') {
                changeTheme(e.target.value);
            }
        });

        themeOptions.addEventListener('click', function (e) {
            const card = e.target.closest('.theme-card');
            if (!card) return;
            document.querySelectorAll('.theme-card').forEach(function (c) {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
        });

        // Custom color pickers
        [customBgInput, customTextInput, customBtnBgInput, customBtnTextColorInput].forEach(picker => {
            picker.addEventListener('input', updatePreview);
        });

        // Action buttons
        previewBtn.addEventListener('click', openLivePreview);
        generateBtn.addEventListener('click', generateLinkUrl);
        copyUrlBtn.addEventListener('click', copyShareableUrl);
    }

    // ---- File Upload & Drag-and-drop ----
    function handleFileUpload(file) {
        if (!file) return;

        // Size check (max 500KB)
        if (file.size > 500 * 1024) {
            alert('File size exceeds the 500KB limit. Please choose a smaller image.');
            return;
        }

        // Type check
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG or JPG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            cropImg.src = e.target.result;
            cropModal.style.display = 'flex';

            // Reset cropping transforms and slider values
            cropZoom.value = 1;
            cropImgX = 0;
            cropImgY = 0;

            cropImg.onload = function () {
                cropImgWidth = this.naturalWidth;
                cropImgHeight = this.naturalHeight;

                // Scale image so that the shorter dimension matches the 150px viewport
                const minRatio = 150 / Math.min(cropImgWidth, cropImgHeight);
                cropImg.style.width = (cropImgWidth * minRatio) + 'px';
                cropImg.style.height = (cropImgHeight * minRatio) + 'px';

                // Center image in viewport
                cropImgX = 50 - (cropImgWidth * minRatio - 150) / 2;
                cropImgY = 50 - (cropImgHeight * minRatio - 150) / 2;

                updateCropImageStyle();
            };
        };
        reader.readAsDataURL(file);
    }

    function updateCropImageStyle() {
        const scale = parseFloat(cropZoom.value);
        const minRatio = 150 / Math.min(cropImgWidth, cropImgHeight);
        const renderedWidth = cropImgWidth * minRatio * scale;
        const renderedHeight = cropImgHeight * minRatio * scale;

        // Clamp positions to ensure the 150x150 viewport (located from x=50, y=50 to x=200, y=200) remains fully covered
        cropImgX = Math.max(200 - renderedWidth, Math.min(50, cropImgX));
        cropImgY = Math.max(200 - renderedHeight, Math.min(50, cropImgY));

        cropImg.style.transform = `translate(${cropImgX}px, ${cropImgY}px) scale(${scale})`;
        cropImg.style.transformOrigin = '0 0';
    }

    function applyCrop() {
        const canvas = document.createElement('canvas');
        canvas.width = 90;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');

        const scale = parseFloat(cropZoom.value);
        const minRatio = 150 / Math.min(cropImgWidth, cropImgHeight);
        const renderedWidth = cropImgWidth * minRatio * scale;
        const renderedHeight = cropImgHeight * minRatio * scale;

        // Calculate offset relative to the viewport (which starts at 50, 50)
        const xOffset = cropImgX - 50;
        const yOffset = cropImgY - 50;

        // Fill background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 90, 90);

        // Draw image onto 90x90 canvas (scaling by 0.6 to fit 90px down from 150px)
        ctx.drawImage(cropImg, xOffset * 0.6, yOffset * 0.6, renderedWidth * 0.6, renderedHeight * 0.6);

        // Export as optimized low-size JPEG Base64 (~1-2KB)
        state.profileImage = canvas.toDataURL('image/jpeg', 0.5);

        // Update preview in UI
        uploadZone.style.display = 'none';
        previewContainer.style.display = 'flex';
        uploadPreview.src = state.profileImage;
        cropModal.style.display = 'none';

        updatePreview();
    }

    function clearFileUploadState() {
        fileInput.value = '';
        state.profileImage = '';
        uploadZone.style.display = '';
        previewContainer.style.display = 'none';
        uploadPreview.src = '#';
    }

    // ---- Link Management ----
    function addLink() {
        if (state.links.length >= MAX_LINKS) return;
        state.links.push({ title: '', url: '' });
        renderLinks();
        updatePreview();
    }

    function removeLink(index) {
        state.links.splice(index, 1);
        renderLinks();
        updatePreview();
    }

    // Render edit list input fields
    function renderLinks() {
        linksList.innerHTML = '';
        state.links.forEach(function (link, i) {
            var item = document.createElement('div');
            item.className = 'link-item';
            item.dataset.index = i;
            item.innerHTML =
                '<span class="link-item-number">' + (i + 1) + '</span>' +
                '<div class="link-item-fields">' +
                '  <input type="text" class="link-title-input" placeholder="Link title" value="' + escapeAttr(link.title) + '" maxlength="80">' +
                '  <input type="url" class="link-url-input" placeholder="https://..." value="' + escapeAttr(link.url) + '">' +
                '</div>' +
                '<button type="button" class="link-delete-btn" title="Remove link">✕</button>';
            linksList.appendChild(item);
        });

        linkCountHint.textContent = state.links.length + ' / ' + MAX_LINKS + ' links';

        if (state.links.length >= MAX_LINKS) {
            addLinkBtn.style.display = 'none';
        } else {
            addLinkBtn.style.display = '';
        }
    }

    // ---- Theme Selection ----
    function changeTheme(themeName) {
        state.theme = themeName;
        if (themeName === 'custom') {
            customColorControls.style.display = 'block';
        } else {
            customColorControls.style.display = 'none';
        }
        updatePreview();
    }

    // ---- Live Preview / View Page Rendering ----
    function updatePreview() {
        var name = state.displayName || 'Your Name';
        var bio = state.bio || 'Your bio goes here';
        var theme = state.theme;

        const bioPreview = document.getElementById('bio-preview');
        if (!bioPreview) return;

        // Reset inline styling variables
        bioPreview.style.removeProperty('--bio-bg');
        bioPreview.style.removeProperty('--bio-text');
        bioPreview.style.removeProperty('--bio-btn-bg');
        bioPreview.style.removeProperty('--bio-btn-text');
        bioPreview.style.removeProperty('--bio-btn-border');
        bioPreview.style.removeProperty('--bio-btn-radius');
        bioPreview.style.removeProperty('--bio-btn-shadow');
        bioPreview.style.removeProperty('--bio-avatar-bg');
        bioPreview.style.removeProperty('--bio-avatar-text');
        
        let t;
        if (theme === 'custom') {
            // Apply custom colors to CSS variables directly on container element
            bioPreview.style.setProperty('--bio-bg', customBgInput.value);
            bioPreview.style.setProperty('--bio-text', customTextInput.value);
            bioPreview.style.setProperty('--bio-btn-bg', customBtnBgInput.value);
            bioPreview.style.setProperty('--bio-btn-text', customBtnTextColorInput.value);
            bioPreview.style.setProperty('--bio-btn-border', 'none');
            bioPreview.style.setProperty('--bio-btn-radius', '30px');
            bioPreview.style.setProperty('--bio-btn-shadow', 'none');
            bioPreview.style.setProperty('--bio-avatar-bg', customBtnBgInput.value);
            bioPreview.style.setProperty('--bio-avatar-text', customBtnTextColorInput.value);
            
            t = {
                avatarBg: customBtnBgInput.value,
                avatarColor: customBtnTextColorInput.value
            };
        } else {
            t = BIO_THEMES[theme] || BIO_THEMES.sunshine;
        }

        // Build avatar
        var avatarHTML;
        if (state.profileImage) {
            avatarHTML = '<img class="preview-avatar" src="' + escapeAttr(state.profileImage) + '" alt="Profile" onerror="this.style.display=\'none\'">';
        } else {
            var initial = name.charAt(0).toUpperCase();
            avatarHTML = '<div class="preview-avatar-placeholder">' + escapeHTML(initial) + '</div>';
        }

        // Build links list
        var linksHTML = '';
        var hasLinks = false;
        state.links.forEach(function (link) {
            var title = link.title || 'Link';
            if (link.title || link.url) {
                hasLinks = true;
                // Buttons render cleanly using inherited stylesheet variables
                linksHTML += '<a class="preview-link-btn" href="' + escapeAttr(link.url || '#') + '" target="_blank" rel="noopener">' + escapeHTML(title) + '</a>';
            }
        });

        if (!hasLinks) {
            linksHTML = '<p class="preview-empty-hint">Add links to see them here</p>';
        }

        bioPreview.innerHTML =
            avatarHTML +
            '<p class="preview-name">' + escapeHTML(name) + '</p>' +
            '<p class="preview-bio">' + escapeHTML(bio) + '</p>' +
            '<div class="preview-links">' + linksHTML + '</div>';

        // Apply theme class (forces preset CSS variables mapping from themes.css)
        bioPreview.className = 'bio-preview theme-' + theme;

        if (document.body.classList.contains('view-mode-active')) {
            document.body.className = 'view-mode-active theme-' + theme;
            if (theme === 'custom') {
                document.body.style.setProperty('--bio-bg', customBgInput.value);
                document.body.style.setProperty('--bio-text', customTextInput.value);
                document.body.style.setProperty('--bio-btn-bg', customBtnBgInput.value);
                document.body.style.setProperty('--bio-btn-text', customBtnTextColorInput.value);
                document.body.style.setProperty('--bio-btn-border', 'none');
                document.body.style.setProperty('--bio-btn-radius', '30px');
                document.body.style.setProperty('--bio-btn-shadow', 'none');
                document.body.style.setProperty('--bio-avatar-bg', customBtnBgInput.value);
                document.body.style.setProperty('--bio-avatar-text', customBtnTextColorInput.value);
            } else {
                document.body.style.removeProperty('--bio-bg');
                document.body.style.removeProperty('--bio-text');
                document.body.style.removeProperty('--bio-btn-bg');
                document.body.style.removeProperty('--bio-btn-text');
                document.body.style.removeProperty('--bio-btn-border');
                document.body.style.removeProperty('--bio-btn-radius');
                document.body.style.removeProperty('--bio-btn-shadow');
                document.body.style.removeProperty('--bio-avatar-bg');
                document.body.style.removeProperty('--bio-avatar-text');
            }
        }
    }

    // ---- Get Theme Data ----
    function getActiveThemeData() {
        if (state.theme === 'custom') {
            return {
                bg: customBgInput.value,
                text: customTextInput.value,
                buttonBg: customBtnBgInput.value,
                buttonText: customBtnTextColorInput.value,
                buttonBorder: 'none',
                avatarBg: customBtnBgInput.value,
                avatarColor: customBtnTextColorInput.value,
                css: ''
            };
        }
        return BIO_THEMES[state.theme] || BIO_THEMES.sunshine;
    }

    // ---- HTML Generation ----
    function generateHTML() {
        var t = getActiveThemeData();
        var name = state.displayName || 'Your Name';
        var bio = state.bio || '';
        var isGradient = t.bg.indexOf('gradient') !== -1;
        var bgCSS = isGradient ? 'background:' + t.bg + ';' : 'background-color:' + t.bg + ';';

        // Avatar HTML
        var avatarHTML;
        if (state.profileImage) {
            avatarHTML = '<img src="' + escapeAttr(state.profileImage) + '" alt="' + escapeAttr(name) + '" style="width:88px;height:88px;border-radius:50%;object-fit:cover;margin-bottom:12px;border:3px solid rgba(255,255,255,0.3);">';
        } else {
            var initial = name.charAt(0).toUpperCase();
            avatarHTML = '<div style="width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-weight:700;margin-bottom:12px;background:' + t.avatarBg + ';color:' + t.avatarColor + ';">' + escapeHTML(initial) + '</div>';
        }

        // Links HTML
        var linksHTML = '';
        state.links.forEach(function (link) {
            if (!link.title && !link.url) return;
            var title = link.title || 'Link';
            var url = link.url || '#';
            var borderCSS = t.buttonBorder && t.buttonBorder !== 'none' ? 'border:' + t.buttonBorder + ';' : 'border:none;';
            var shadowCSS = t.css ? t.css + ';' : '';
            linksHTML += '      <a href="' + escapeAttr(url) + '" target="_blank" rel="noopener" style="display:block;width:100%;padding:14px 16px;font-family:\'Inter\',sans-serif;font-size:0.95rem;font-weight:600;text-decoration:none;border-radius:30px;text-align:center;box-sizing:border-box;background:' + t.buttonBg + ';color:' + t.buttonText + ';' + borderCSS + shadowCSS + 'transition:transform 0.15s,opacity 0.15s;" onmouseover="this.style.transform=\'scale(1.03)\';this.style.opacity=\'0.9\'" onmouseout="this.style.transform=\'scale(1)\';this.style.opacity=\'1\'">' + escapeHTML(title) + '</a>\n';
        });

        var bioHTML = bio ? '    <p style="font-size:0.9rem;line-height:1.6;opacity:0.75;margin:0 0 24px;max-width:320px;word-break:break-word;">' + escapeHTML(bio) + '</p>\n' : '';

        var html =
            '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '  <meta charset="UTF-8">\n' +
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '  <title>' + escapeHTML(name) + ' — Links</title>\n' +
            '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
            '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
            '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
            '  <style>\n' +
            '    * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '    body { ' + bgCSS + ' color: ' + t.text + '; font-family: \'Inter\', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }\n' +
            '    .container { max-width: 420px; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; }\n' +
            '    .links { width: 100%; display: flex; flex-direction: column; gap: 12px; }\n' +
            '  </style>\n' +
            '</head>\n' +
            '<body>\n' +
            '  <div class="container">\n' +
            '    ' + avatarHTML + '\n' +
            '    <h1 style="font-size:1.4rem;font-weight:700;margin:0 0 6px;">' + escapeHTML(name) + '</h1>\n' +
            bioHTML +
            '    <div class="links">\n' +
            linksHTML +
            '    </div>\n' +
            '  </div>\n' +
            '</body>\n' +
            '</html>';

        return html;
    }

    // ---- Download (kept for generateHTML calls in javascript but button is removed from UI) ----
    function downloadHTML() {
        var html = generateHTML();
        var blob = new Blob([html], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'my-bio.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ---- Copy HTML Code (kept for generateHTML calls in javascript but button is removed from UI) ----
    function copyHTML() {
        var html = generateHTML();
        navigator.clipboard.writeText(html).then(function () {
            showToast('Copied HTML code!');
        }).catch(function () {
            var textarea = document.createElement('textarea');
            textarea.value = html;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Copied HTML code!');
            } catch (err) {
                showToast('Failed to copy. Try manually.');
            }
            document.body.removeChild(textarea);
        });
    }

    // ---- Preview Live Link Compilation ----
    function compileQueryUrl() {
        const payload = {
            u: state.displayName,
            b: state.bio,
            t: state.theme,
            i: state.profileImage,
            l: state.links.map(link => [link.title || '', link.url || ''])
        };

        if (state.theme === 'custom') {
            payload.bg = customBgInput.value;
            payload.tx = customTextInput.value;
            payload.bb = customBtnBgInput.value;
            payload.bt = customBtnTextColorInput.value;
        }

        const serialized = JSON.stringify(payload);
        const compressed = toUrlSafeBase64(serialized);
        return `?p=${compressed}`;
    }

    function openLivePreview() {
        const queryUrl = compileQueryUrl();
        window.open(queryUrl, '_blank');
    }

    // ---- Generate URL and show Success panel ----
    function shortenUrl(longUrl) {
        return new Promise(function (resolve) {
            // Set a timeout of 3.5 seconds
            var timeout = setTimeout(function () {
                resolve(longUrl);
            }, 3500);

            var callbackName = 'isgd_callback_' + Math.floor(Math.random() * 1000000);
            
            var script = document.createElement('script');
            script.src = 'https://is.gd/create.php?format=json&callback=' + callbackName + '&url=' + encodeURIComponent(longUrl);
            
            window[callbackName] = function (data) {
                clearTimeout(timeout);
                delete window[callbackName];
                try {
                    document.body.removeChild(script);
                } catch (e) {}
                
                if (data && data.shorturl) {
                    resolve(data.shorturl);
                } else {
                    resolve(longUrl);
                }
            };

            script.onerror = function () {
                clearTimeout(timeout);
                delete window[callbackName];
                try {
                    document.body.removeChild(script);
                } catch (e) {}
                resolve(longUrl);
            };

            document.body.appendChild(script);
        });
    }

    // ---- Generate URL and show Success panel ----
    function generateLinkUrl() {
        const queryUrl = compileQueryUrl();
        const fullUrl = window.location.origin + window.location.pathname + queryUrl;
        
        // Show loading state on button
        const originalText = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
        
        shortenUrl(fullUrl).then(function (shortUrl) {
            shareableUrlInput.value = shortUrl;
            
            // Restore button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
            
            // Show success panel
            successPanel.style.display = 'block';
            successPanel.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function copyShareableUrl() {
        shareableUrlInput.select();
        navigator.clipboard.writeText(shareableUrlInput.value).then(function () {
            showToast('Copied shareable link!');
        }).catch(function () {
            showToast('Select text to copy manually.');
        });
    }

    // ---- Toast ----
    var toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('show');
        }, 2200);
    }

    // ---- Helpers ----
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ---- Start ----
    document.addEventListener('DOMContentLoaded', init);
})();
