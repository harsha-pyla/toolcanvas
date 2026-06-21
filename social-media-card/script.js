/**
 * Social Media Card — Premium Digital Visiting Card Builder
 * Fully client-side card compilation, QR canvas, and PNG exports.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Default card data structure matching index.html placeholders
    const DEFAULT_DATA = {
        name: 'Jane Doe',
        title: 'Product Designer',
        company: 'Design Studio',
        avatar: '', // Base64 profile photo
        email: 'jane@designstudio.com',
        phone: '+1 (555) 019-2834',
        website: 'www.designstudio.com',
        location: 'Seattle, WA',
        theme: 'minimalist',
        customColor: '#4f46e5',
        typography: 'sans',
        orientation: 'horizontal',
        links: [
            { platform: 'linkedin', url: 'https://linkedin.com/in/janedoe' },
            { platform: 'instagram', url: 'https://instagram.com/janedoe' }
        ]
    };

    // Inline SVG Icon Paths for Supported Social Networks
    const SVG_ICONS = {
        linkedin: '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        github: '<svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24"><path d="M23.498 6.163c-.272-1.022-1.078-1.826-2.099-2.099C19.558 3.5 12 3.5 12 3.5s-7.558 0-9.399.564c-1.022.273-1.827 1.077-2.099 2.099C0 8.002 0 12 0 12s0 3.997.502 5.837c.272 1.022 1.077 1.827 2.099 2.099C4.442 20.5 12 20.5 12 20.5s7.558 0 9.399-.564c1.022-.272 1.827-1.077 2.099-2.099C24 15.997 24 12 24 12s0-3.998-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        tiktok: '<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.02-2.89-.35-4.2-1-.28-.15-.57-.33-.82-.51V14.5c.01 1.91-.48 3.86-1.52 5.43-1.52 2.33-4.22 3.89-7.05 3.99-2.57.1-5.26-.8-7.14-2.56C-.17 19.34-.63 16.03.62 13.1c1-2.31 3.26-4.14 5.78-4.52.88-.13 1.78-.1 2.67.06V12.8c-.89-.25-1.87-.24-2.75.12-1.43.58-2.53 1.88-2.73 3.4-.29 2.15 1.25 4.31 3.39 4.74 2.21.43 4.67-.84 5.34-3 .24-.76.25-1.57.24-2.37.01-4.91.01-9.82.01-14.73.01-.3-.06-.64-.24-.9z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>',
        snapchat: '<svg viewBox="0 0 24 24"><path d="M12 2c-3.79 0-6.84 2.63-6.84 5.88 0 .86.22 1.68.61 2.4.15.28.1.62-.12.85-.35.36-1 .94-1 .94-.28.24-.26.68.04.89.37.26.83.33 1.26.19.37-.12.78-.02 1.08.24.47.41 1.09.7 1.77.83.21.04.38.19.46.39.38.97 1.07 2.76 1.27 3.27.18.47.66.77 1.17.77.08 0 .16-.01.24-.02.58-.08 1.04-.51 1.16-1.08.19-.89.65-2.88.94-3.41.07-.13.2-.23.36-.26.6-.13 1.13-.39 1.54-.75.31-.27.75-.36 1.14-.23.44.15.93.07 1.3-.2.31-.23.31-.69.01-.93l-.97-.84c-.21-.2-.26-.52-.13-.78.4-.81.63-1.74.63-2.73C18.84 4.63 15.79 2 12 2z"/></svg>'
    };

    let state = {};
    let qrCodeInstance = null;

    // Check if we are in public view mode
    const isPublicView = document.documentElement.classList.contains('public-view-active');

    if (isPublicView) {
        parseUrlParams();
        renderCardPreview();
        initQr();
        updateQrCode();

    } else {
        // Creator Mode
        loadState();
        syncStateToInputs();
        toggleCustomColorVisibility();
        renderCardPreview();
        renderEditorLinksList();
        initQr();
        updateQrCode();
        bindInputs();
    }

    // === Parse URL parameters ===
    function parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        state = {
            name: params.get('n') || '',
            title: params.get('t') || '',
            company: params.get('co') || '',
            avatar: '', // Base64 profile photo isn't stored in URL to prevent giant URLs
            email: params.get('em') || '',
            phone: params.get('ph') || '',
            website: params.get('w') || '',
            location: params.get('lo') || '',
            theme: params.get('th') || 'minimalist',
            customColor: params.get('col') || '#4f46e5',
            typography: params.get('ty') || 'sans',
            orientation: params.get('or') || 'horizontal',
            links: []
        };

        const linksStr = params.get('l');
        if (linksStr) {
            try {
                state.links = JSON.parse(linksStr);
            } catch (e) {
                console.warn('Failed to parse links from query string:', e);
            }
        }
    }

    // === Load state from LocalStorage ===
    function loadState() {
        try {
            const saved = localStorage.getItem('toolcanvas_sm_card_state');
            if (saved) {
                state = JSON.parse(saved);
                state = Object.assign({}, DEFAULT_DATA, state);
            } else {
                state = JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
        } catch (e) {
            console.warn('LocalStorage load failed, using defaults:', e);
            state = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    // === Save state to LocalStorage ===
    function saveState() {
        if (isPublicView) return; // Don't overwrite creator's local storage when visiting a public link
        try {
            localStorage.setItem('toolcanvas_sm_card_state', JSON.stringify(state));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    // === Populate inputs from state ===
    function syncStateToInputs() {
        const nameInput = document.getElementById('input-name');
        if (nameInput) nameInput.value = state.name;

        const titleInput = document.getElementById('input-title');
        if (titleInput) titleInput.value = state.title;

        const companyInput = document.getElementById('input-company');
        if (companyInput) companyInput.value = state.company;

        const emailInput = document.getElementById('input-email');
        if (emailInput) emailInput.value = state.email;

        const phoneInput = document.getElementById('input-phone');
        if (phoneInput) phoneInput.value = state.phone;

        const websiteInput = document.getElementById('input-website');
        if (websiteInput) websiteInput.value = state.website;

        const locationInput = document.getElementById('input-location');
        if (locationInput) locationInput.value = state.location;

        const customColorInput = document.getElementById('input-color');
        if (customColorInput) customColorInput.value = state.customColor;

        // Theme radio choices
        const themeRadio = document.querySelector(`input[name="card-theme"][value="${state.theme}"]`);
        if (themeRadio) themeRadio.checked = true;

        // Typography radio choices
        const typographyRadio = document.querySelector(`input[name="card-typography"][value="${state.typography}"]`);
        if (typographyRadio) typographyRadio.checked = true;

        // Orientation radio choices
        const orientationRadio = document.querySelector(`input[name="card-orientation"][value="${state.orientation}"]`);
        if (orientationRadio) orientationRadio.checked = true;
    }

    // === Toggle custom accent color picker visibility ===
    function toggleCustomColorVisibility() {
        const wrapper = document.getElementById('color-picker-wrapper');
        if (wrapper) {
            if (state.theme === 'custom') {
                wrapper.style.display = 'flex';
            } else {
                wrapper.style.display = 'none';
            }
        }
    }

    // === Initialize QR Code Canvas ===
    function initQr() {
        const canvas = document.getElementById('preview-qr-canvas');
        if (!canvas) return;

        // We instantiate the QR code generator with high error correction and crisp size.
        // It is scaled down via CSS styles to remain sharp when downloaded.
        qrCodeInstance = new QRious({
            element: canvas,
            size: 160,
            level: 'H',
            background: '#ffffff',
            foreground: '#000000'
        });
    }

    // === Generate the encoded shareable URL ===
    function getShareUrl() {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        params.set('n', state.name);
        params.set('t', state.title);
        params.set('co', state.company);
        params.set('em', state.email);
        params.set('ph', state.phone);
        params.set('w', state.website);
        params.set('lo', state.location);
        params.set('th', state.theme);
        if (state.theme === 'custom') {
            params.set('col', state.customColor);
        }
        params.set('ty', state.typography);
        params.set('or', state.orientation);
        if (state.links && state.links.length > 0) {
            params.set('l', JSON.stringify(state.links));
        }
        return baseUrl + '?' + params.toString();
    }

    // === Update QR code image ===
    function updateQrCode() {
        if (!qrCodeInstance) return;
        let targetUrl = '';
        if (state.website && state.website.trim()) {
            let webUrl = state.website.trim();
            if (!/^https?:\/\//i.test(webUrl)) {
                webUrl = 'https://' + webUrl;
            }
            targetUrl = webUrl;
        } else if (state.email && state.email.trim()) {
            targetUrl = 'mailto:' + state.email.trim();
        } else {
            targetUrl = getShareUrl();
        }
        qrCodeInstance.value = targetUrl;
    }

    // === Render real-time visual card mockup ===
    function renderCardPreview() {
        const mockup = document.getElementById('social-card-mockup');
        if (!mockup) return;

        // Update name, title, company text
        const nameEl = document.getElementById('preview-name');
        if (nameEl) nameEl.textContent = state.name || 'Your Name';

        const titleEl = document.getElementById('preview-title');
        if (titleEl) titleEl.textContent = state.title || 'Job Title';

        const companyEl = document.getElementById('preview-company');
        if (companyEl) companyEl.textContent = state.company || 'Company';

        // Toggle company separator line
        const separatorEl = mockup.querySelector('.company-separator');
        if (separatorEl) {
            if (state.title && state.company) {
                separatorEl.style.display = 'inline';
            } else {
                separatorEl.style.display = 'none';
            }
        }

        // Email row
        const emailEl = document.getElementById('preview-email');
        const emailRow = document.getElementById('contact-email-row');
        if (emailEl && emailRow) {
            if (state.email) {
                emailEl.textContent = state.email;
                emailRow.style.display = 'flex';
            } else {
                emailRow.style.display = 'none';
            }
        }

        // Phone row
        const phoneEl = document.getElementById('preview-phone');
        const phoneRow = document.getElementById('contact-phone-row');
        if (phoneEl && phoneRow) {
            if (state.phone) {
                phoneEl.textContent = state.phone;
                phoneRow.style.display = 'flex';
            } else {
                phoneRow.style.display = 'none';
            }
        }

        // Website row
        const websiteEl = document.getElementById('preview-website');
        const websiteRow = document.getElementById('contact-website-row');
        if (websiteEl && websiteRow) {
            if (state.website) {
                websiteEl.textContent = state.website;
                websiteRow.style.display = 'flex';
            } else {
                websiteRow.style.display = 'none';
            }
        }

        // Location row
        const locationEl = document.getElementById('preview-location');
        const locationRow = document.getElementById('contact-location-row');
        if (locationEl && locationRow) {
            if (state.location) {
                locationEl.textContent = state.location;
                locationRow.style.display = 'flex';
            } else {
                locationRow.style.display = 'none';
            }
        }

        // Toggle contact list container visibility
        const contactsSection = document.getElementById('card-contacts-section');
        if (contactsSection) {
            const hasContacts = !!(state.email || state.phone || state.website || state.location);
            contactsSection.style.display = hasContacts ? 'flex' : 'none';
        }

        // Profile Avatar or Logo
        const imgEl = document.getElementById('preview-avatar-img');
        const placeholderEl = document.getElementById('preview-avatar-placeholder');
        const btnClearPhoto = document.getElementById('btn-clear-photo');

        if (imgEl && placeholderEl) {
            if (state.avatar) {
                imgEl.src = state.avatar;
                imgEl.style.display = 'block';
                placeholderEl.style.display = 'none';
                if (btnClearPhoto) btnClearPhoto.style.display = 'inline-block';
            } else {
                imgEl.src = '';
                imgEl.style.display = 'none';
                placeholderEl.style.display = 'flex';
                if (btnClearPhoto) btnClearPhoto.style.display = 'none';
            }
        }

        // Update mockup class names for theme, orientation, and font family
        mockup.className = `social-card-box theme-${state.theme} layout-${state.orientation} font-${state.typography}`;

        // Set inline CSS variable if custom accent color is selected
        if (state.theme === 'custom') {
            mockup.style.setProperty('--accent-color', state.customColor);
        } else {
            mockup.style.removeProperty('--accent-color');
        }

        // Render inline social links icons
        const socialsBar = document.getElementById('card-socials-bar');
        if (socialsBar) {
            socialsBar.innerHTML = '';
            if (state.links && state.links.length > 0) {
                state.links.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.title = capitalize(link.platform);
                    a.innerHTML = SVG_ICONS[link.platform] || '🔗';
                    socialsBar.appendChild(a);
                });
                socialsBar.style.display = 'flex';
            } else {
                socialsBar.style.display = 'none';
            }
        }
    }

    // === Render added links in editor ===
    function renderEditorLinksList() {
        const linksCountEl = document.getElementById('links-count');
        if (linksCountEl) linksCountEl.textContent = state.links.length;

        const addBtn = document.getElementById('btn-add-link');
        const linkUrlInput = document.getElementById('input-link-url');

        // Disable add controls if limit reached
        const maxLinksReached = state.links.length >= 5;
        if (addBtn) addBtn.disabled = maxLinksReached;
        if (linkUrlInput) linkUrlInput.disabled = maxLinksReached;

        const listEl = document.getElementById('added-links-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        state.links.forEach((link, index) => {
            const item = document.createElement('div');
            item.className = 'link-entry-item';
            item.innerHTML = `
                <div class="link-entry-details">
                    <span class="platform-icon-indicator">${getEmojiIndicator(link.platform)}</span>
                    <strong>${capitalize(link.platform)}:</strong>
                    <span class="link-url-text">${link.url}</span>
                </div>
                <button type="button" class="btn-remove-link" data-index="${index}">Remove</button>
            `;

            item.querySelector('.btn-remove-link').addEventListener('click', () => {
                state.links.splice(index, 1);
                saveState();
                renderCardPreview();
                renderEditorLinksList();
                updateQrCode();
            });

            listEl.appendChild(item);
        });
    }



    // === Add social link ===
    function addLink() {
        const selectPlatform = document.getElementById('select-platform');
        const inputLinkUrl = document.getElementById('input-link-url');
        if (!selectPlatform || !inputLinkUrl) return;

        const platform = selectPlatform.value;
        let url = inputLinkUrl.value.trim();

        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }

        // Auto prepending protocol if missing
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        if (state.links.length >= 5) {
            alert('Maximum 5 social links allowed.');
            return;
        }

        state.links.push({ platform, url });
        inputLinkUrl.value = '';

        saveState();
        renderCardPreview();
        renderEditorLinksList();
        updateQrCode();
    }

    // === Bind Editor Input Listeners ===
    function bindInputs() {
        const nameInput = document.getElementById('input-name');
        const titleInput = document.getElementById('input-title');
        const companyInput = document.getElementById('input-company');
        const emailInput = document.getElementById('input-email');
        const phoneInput = document.getElementById('input-phone');
        const websiteInput = document.getElementById('input-website');
        const locationInput = document.getElementById('input-location');
        const customColorInput = document.getElementById('input-color');

        const textInputs = [
            { el: nameInput, field: 'name' },
            { el: titleInput, field: 'title' },
            { el: companyInput, field: 'company' },
            { el: emailInput, field: 'email' },
            { el: phoneInput, field: 'phone' },
            { el: websiteInput, field: 'website' },
            { el: locationInput, field: 'location' }
        ];

        textInputs.forEach(item => {
            if (item.el) {
                item.el.addEventListener('input', (e) => {
                    state[item.field] = e.target.value.trim();
                    saveState();
                    renderCardPreview();
                    updateQrCode();
                });
            }
        });

        // Custom accent color picker
        if (customColorInput) {
            customColorInput.addEventListener('input', (e) => {
                state.customColor = e.target.value;
                saveState();
                renderCardPreview();
            });
        }

        // Avatar file uploader (Closures safe from null pointer resets)
        const avatarInput = document.getElementById('input-avatar');
        const avatarImg = document.getElementById('preview-avatar-img');
        const avatarPlaceholder = document.getElementById('preview-avatar-placeholder');
        const btnClearPhoto = document.getElementById('btn-clear-photo');

        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    // Capture DOM elements in local scope variables
                    const localImg = avatarImg;
                    const localPlaceholder = avatarPlaceholder;
                    const localClearBtn = btnClearPhoto;

                    reader.onload = (event) => {
                        const base64Data = event.target.result;
                        state.avatar = base64Data;
                        saveState();

                        if (localImg) {
                            localImg.src = base64Data;
                            localImg.style.display = 'block';
                        }
                        if (localPlaceholder) {
                            localPlaceholder.style.display = 'none';
                        }
                        if (localClearBtn) {
                            localClearBtn.style.display = 'inline-block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
                avatarInput.value = ''; // Reset uploader input
            });
        }

        // Clear photo action
        if (btnClearPhoto) {
            btnClearPhoto.addEventListener('click', () => {
                state.avatar = '';
                saveState();
                if (avatarImg) {
                    avatarImg.src = '';
                    avatarImg.style.display = 'none';
                }
                if (avatarPlaceholder) {
                    avatarPlaceholder.style.display = 'flex';
                }
                btnClearPhoto.style.display = 'none';
            });
        }

        // Theme radios
        const themeRadios = document.querySelectorAll('input[name="card-theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.theme = e.target.value;
                saveState();
                toggleCustomColorVisibility();
                renderCardPreview();
                updateQrCode();
            });
        });

        // Typography radios
        const typographyRadios = document.querySelectorAll('input[name="card-typography"]');
        typographyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.typography = e.target.value;
                saveState();
                renderCardPreview();
                updateQrCode();
            });
        });

        // Orientation radios
        const orientationRadios = document.querySelectorAll('input[name="card-orientation"]');
        orientationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.orientation = e.target.value;
                saveState();
                renderCardPreview();
                updateQrCode();
            });
        });



        // Copy Shareable Link Action
        const btnCopyLink = document.getElementById('btn-copy-link');
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', () => {
                const shareUrl = getShareUrl();
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const originalText = btnCopyLink.innerHTML;
                    btnCopyLink.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" class="btn-icon"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg><span>Copied Share Link!</span>';
                    btnCopyLink.disabled = true;
                    setTimeout(() => {
                        btnCopyLink.innerHTML = originalText;
                        btnCopyLink.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy share link: ', err);
                    prompt('Copy your visiting card link below:', shareUrl);
                });
            });
        }

        // Reset Card Settings Action
        const btnReset = document.getElementById('btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all visiting card settings to default?')) {
                    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
                    saveState();
                    syncStateToInputs();
                    toggleCustomColorVisibility();
                    renderCardPreview();
                    renderEditorLinksList();
                    updateQrCode();
                }
            });
        }

        // Export/Download PNG Action
        const btnDownload = document.getElementById('btn-download-card');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const mockup = document.getElementById('social-card-mockup');
                if (!mockup) return;

                const originalText = btnDownload.innerHTML;
                btnDownload.innerHTML = '<span>Rendering PNG...</span>';
                btnDownload.disabled = true;

                // Brief timeout to let button rendering settle before canvas capture
                setTimeout(() => {
                    html2canvas(mockup, {
                        useCORS: true,
                        allowTaint: true,
                        scale: 2, // High resolution rendering
                        backgroundColor: null // Keeps transparent border corners intact
                    }).then(canvas => {
                        const link = document.createElement('a');
                        const nameFormatted = (state.name || 'digital-card').toLowerCase().replace(/\s+/g, '-');
                        link.download = `${nameFormatted}-visiting-card.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();

                        btnDownload.innerHTML = originalText;
                        btnDownload.disabled = false;
                    }).catch(err => {
                        console.error('html2canvas capture error:', err);
                        alert('Could not export image. Please verify uploaded asset formats.');
                        btnDownload.innerHTML = originalText;
                        btnDownload.disabled = false;
                    });
                }, 100);
            });
        }
    }

    // === Helper functions ===
    function getEmojiIndicator(platform) {
        switch (platform) {
            case 'linkedin': return '💼';
            case 'instagram': return '📸';
            case 'github': return '💻';
            case 'twitter': return '🐦';
            case 'youtube': return '🎥';
            case 'tiktok': return '🎵';
            case 'facebook': return '👥';
            case 'snapchat': return '👻';
            default: return '🔗';
        }
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
