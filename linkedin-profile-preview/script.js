document.addEventListener('DOMContentLoaded', () => {

    // Default configuration and data
    const DEFAULT_DATA = {
        theme: 'light',
        mode: 'owner',
        fullname: 'Alex Mercer',
        pronouns: '(He/Him)',
        premium: true,
        headline: 'Senior AI Product Manager at Google | Former Technical Lead | Author & Speaker',
        location: 'San Francisco Bay Area',
        connections: '500+ connections',
        mutualConnections: 'Followed by Sarah Jenkins, John Doe, and 14 others',
        website: 'Visit my portfolio ↗',
        talksAbout: '#productmanagement, #artificialintelligence, #softwareengineering, #productdesign',
        coverBanner: '',
        avatar: '',
        currentCompany: 'Google',
        currentSchool: 'Stanford University',
        experience: [
            {
                id: 'exp-1',
                title: 'Senior AI Product Manager',
                company: 'Google',
                logo: '',
                duration: 'Jan 2024 - Present · 2 yrs 6 mos',
                description: 'Lead AI developer workflows and large-scale model features inside Google Cloud. Oversee cross-functional teams of engineers, researchers, and designers to ship developer services.'
            },
            {
                id: 'exp-2',
                title: 'Technical Lead — Machine Learning',
                company: 'Microsoft',
                logo: '',
                duration: 'Jun 2021 - Dec 2023 · 2 yrs 7 mos',
                description: 'Spearheaded ML engineering for search and recommendation systems. Developed and optimized neural networks that increased user engagement metrics by 14%.'
            }
        ],
        education: [
            {
                id: 'edu-1',
                school: 'Stanford University',
                logo: '',
                degree: 'Master of Science in Computer Science (AI Specialization)',
                duration: '2019 - 2021',
                description: 'Focused on Deep Learning and Natural Language Processing. Graduate teaching assistant in neural network design.'
            }
        ]
    };

    let profileData = {};

    // DOM references
    const btnThemeLight = document.getElementById('btn-theme-light');
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const btnModeOwner = document.getElementById('btn-mode-owner');
    const btnModeVisitor = document.getElementById('btn-mode-visitor');
    const btnResetMockup = document.getElementById('btn-reset-mockup');
    const btnDownloadMockup = document.getElementById('btn-download-mockup');

    const mockupContainer = document.getElementById('linkedin-mockup');
    const mockupCoverImg = document.getElementById('mockup-cover-img');
    const coverPlaceholder = document.getElementById('cover-placeholder');
    const coverBannerContainer = document.getElementById('cover-banner-container');
    const mockupAvatarImg = document.getElementById('mockup-avatar-img');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarContainer = document.getElementById('avatar-container');
    const mockupFullname = document.querySelector('.linkedin-fullname');
    const premiumBadgeTrigger = document.getElementById('premium-badge-trigger');
    const mockupPronouns = document.querySelector('.linkedin-pronouns');
    const mockupHeadline = document.querySelector('.linkedin-headline');
    const mockupLocation = document.querySelector('.linkedin-location');
    const mockupWebsite = document.querySelector('.linkedin-website');
    const mockupConnections = document.querySelector('.linkedin-connections-count');
    const mockupMutual = document.querySelector('.mutual-connections-text');
    const talksHashtags = document.querySelector('.talks-hashtags');

    const quickCompanyText = document.querySelector('#quick-link-company .quick-link-text');
    const quickSchoolText = document.querySelector('#quick-link-school .quick-link-text');

    const experienceListContainer = document.getElementById('experience-list-container');
    const educationListContainer = document.getElementById('education-list-container');

    const btnAddExperience = document.getElementById('btn-add-experience');
    const btnAddEducation = document.getElementById('btn-add-education');

    const hiddenAvatarInput = document.getElementById('hidden-avatar-input');
    const hiddenBannerInput = document.getElementById('hidden-banner-input');
    const hiddenExpLogoInput = document.getElementById('hidden-exp-logo-input');
    const hiddenEduLogoInput = document.getElementById('hidden-edu-logo-input');

    let activeExpIdForUpload = null;
    let activeEduIdForUpload = null;

    // Initialize State
    loadState();
    bindEvents();
    renderAll();

    // === State Persistence ===
    function loadState() {
        try {
            const saved = localStorage.getItem('toolcanvas_li_preview_v1');
            if (saved) {
                profileData = JSON.parse(saved);
                // Ensure all expected fields exist
                profileData = Object.assign({}, DEFAULT_DATA, profileData);
            } else {
                profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
        } catch (e) {
            console.warn('Load state failed, using default data:', e);
            profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    function saveState() {
        try {
            localStorage.setItem('toolcanvas_li_preview_v1', JSON.stringify(profileData));
        } catch (e) {
            console.warn('Save state failed:', e);
        }
    }

    // === Event Bindings ===
    function bindEvents() {
        // Theme selector buttons
        btnThemeLight.addEventListener('click', () => setTheme('light'));
        btnThemeDark.addEventListener('click', () => setTheme('dark'));

        // View Mode buttons
        btnModeOwner.addEventListener('click', () => setViewMode('owner'));
        btnModeVisitor.addEventListener('click', () => setViewMode('visitor'));

        // Reset button
        btnResetMockup.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all profile details to default?')) {
                profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                saveState();
                renderAll();
            }
        });

        // Download button
        btnDownloadMockup.addEventListener('click', exportMockupToImage);

        // --- WYSIWYG Contenteditable Listeners ---
        
        // Fullname
        mockupFullname.addEventListener('blur', (e) => {
            profileData.fullname = e.target.textContent.trim() || 'Your Name';
            mockupFullname.textContent = profileData.fullname;
            saveState();
        });
        mockupFullname.addEventListener('keydown', preventEnter);

        // Gold Premium badge toggle
        premiumBadgeTrigger.addEventListener('click', () => {
            profileData.premium = !profileData.premium;
            togglePremiumDisplay();
            saveState();
        });

        // Pronouns
        mockupPronouns.addEventListener('blur', (e) => {
            profileData.pronouns = e.target.textContent.trim();
            saveState();
        });
        mockupPronouns.addEventListener('keydown', preventEnter);

        // Headline
        mockupHeadline.addEventListener('blur', (e) => {
            profileData.headline = e.target.textContent.trim() || 'Professional Headline';
            mockupHeadline.textContent = profileData.headline;
            saveState();
        });

        // Location
        mockupLocation.addEventListener('blur', (e) => {
            profileData.location = e.target.textContent.trim() || 'Location';
            mockupLocation.textContent = profileData.location;
            saveState();
        });
        mockupLocation.addEventListener('keydown', preventEnter);

        // Connections count
        mockupConnections.addEventListener('blur', (e) => {
            profileData.connections = e.target.textContent.trim() || '500+ connections';
            mockupConnections.textContent = profileData.connections;
            saveState();
        });
        mockupConnections.addEventListener('keydown', preventEnter);

        // Mutual Connections summary
        mockupMutual.addEventListener('blur', (e) => {
            profileData.mutualConnections = e.target.textContent.trim();
            mockupMutual.textContent = profileData.mutualConnections;
            saveState();
        });
        mockupMutual.addEventListener('keydown', preventEnter);

        // Custom site link
        mockupWebsite.addEventListener('blur', (e) => {
            profileData.website = e.target.textContent.trim();
            mockupWebsite.textContent = profileData.website;
            saveState();
        });
        mockupWebsite.addEventListener('keydown', preventEnter);

        // Company text top right
        quickCompanyText.addEventListener('blur', (e) => {
            profileData.currentCompany = e.target.textContent.trim();
            saveState();
        });
        quickCompanyText.addEventListener('keydown', preventEnter);

        // School text top right
        quickSchoolText.addEventListener('blur', (e) => {
            profileData.currentSchool = e.target.textContent.trim();
            saveState();
        });
        quickSchoolText.addEventListener('keydown', preventEnter);

        // Talks about hashtags
        talksHashtags.addEventListener('blur', (e) => {
            profileData.talksAbout = e.target.textContent.trim();
            saveState();
        });
        talksHashtags.addEventListener('keydown', preventEnter);

        // --- Cover & Profile Image File Upload Handlers ---
        coverBannerContainer.addEventListener('click', () => {
            hiddenBannerInput.click();
        });

        hiddenBannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileData.coverBanner = event.target.result;
                    renderBanner();
                    saveState();
                };
                reader.readAsDataURL(file);
            }
            hiddenBannerInput.value = '';
        });

        avatarContainer.addEventListener('click', () => {
            hiddenAvatarInput.click();
        });

        hiddenAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileData.avatar = event.target.result;
                    renderAvatar();
                    saveState();
                };
                reader.readAsDataURL(file);
            }
            hiddenAvatarInput.value = '';
        });

        // About section
        document.querySelector('.linkedin-about-text').addEventListener('blur', (e) => {
            profileData.about = e.target.innerText.trim();
            saveState();
        });

        // --- Experience & Education dynamic buttons ---
        btnAddExperience.addEventListener('click', addExperienceItem);
        btnAddEducation.addEventListener('click', addEducationItem);

        // Hidden input callbacks for Experience & Education logo uploads
        hiddenExpLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const targetExpId = activeExpIdForUpload;
            if (file && targetExpId) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const item = profileData.experience.find(exp => exp.id === targetExpId);
                    if (item) {
                        item.logo = event.target.result;
                        renderExperienceList();
                        saveState();
                    }
                };
                reader.readAsDataURL(file);
            }
            hiddenExpLogoInput.value = '';
            activeExpIdForUpload = null;
        });

        hiddenEduLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const targetEduId = activeEduIdForUpload;
            if (file && targetEduId) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const item = profileData.education.find(edu => edu.id === targetEduId);
                    if (item) {
                        item.logo = event.target.result;
                        renderEducationList();
                        saveState();
                    }
                };
                reader.readAsDataURL(file);
            }
            hiddenEduLogoInput.value = '';
            activeEduIdForUpload = null;
        });
    }

    // === Helper: Prevent Carriage Return on editable inputs ===
    function preventEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }

    // === Render Controls & Elements ===
    function renderAll() {
        setTheme(profileData.theme);
        setViewMode(profileData.mode);

        mockupFullname.textContent = profileData.fullname;
        mockupPronouns.textContent = profileData.pronouns || '';
        togglePremiumDisplay();

        mockupHeadline.textContent = profileData.headline;
        mockupLocation.textContent = profileData.location;
        mockupConnections.textContent = profileData.connections;
        mockupMutual.textContent = profileData.mutualConnections || '';

        mockupWebsite.textContent = profileData.website || '';
        mockupWebsite.style.display = profileData.website ? 'inline-block' : 'none';

        quickCompanyText.textContent = profileData.currentCompany || 'Company';
        quickSchoolText.textContent = profileData.currentSchool || 'University';

        talksHashtags.textContent = profileData.talksAbout || '';
        document.querySelector('.talks-about-row').style.display = profileData.talksAbout ? 'flex' : 'none';

        if (profileData.about !== undefined) {
            document.querySelector('.linkedin-about-text').innerText = profileData.about;
        } else {
            // Populate defaults on initial load
            profileData.about = document.querySelector('.linkedin-about-text').innerText;
        }

        renderBanner();
        renderAvatar();
        renderExperienceList();
        renderEducationList();
    }

    function setTheme(theme) {
        profileData.theme = theme;
        if (theme === 'dark') {
            mockupContainer.classList.remove('mockup-light');
            mockupContainer.classList.add('mockup-dark');
            btnThemeDark.classList.add('active');
            btnThemeLight.classList.remove('active');
        } else {
            mockupContainer.classList.remove('mockup-dark');
            mockupContainer.classList.add('mockup-light');
            btnThemeLight.classList.add('active');
            btnThemeDark.classList.remove('active');
        }
        saveState();
    }

    function setViewMode(mode) {
        profileData.mode = mode;
        if (mode === 'visitor') {
            mockupContainer.classList.remove('mode-owner');
            mockupContainer.classList.add('mode-visitor');
            btnModeVisitor.classList.add('active');
            btnModeOwner.classList.remove('active');
        } else {
            mockupContainer.classList.remove('mode-visitor');
            mockupContainer.classList.add('mode-owner');
            btnModeOwner.classList.add('active');
            btnModeVisitor.classList.remove('active');
        }
        saveState();
    }

    function togglePremiumDisplay() {
        if (profileData.premium) {
            premiumBadgeTrigger.style.display = 'inline-flex';
        } else {
            // Keep container but set opacity lower so user can click to restore it, or hide?
            // In LinkedIn preview, let's keep it visible at 0.15 opacity in Owner Mode so it can be clicked, but hide in visitor mode if disabled.
            if (profileData.mode === 'owner') {
                premiumBadgeTrigger.style.display = 'inline-flex';
                premiumBadgeTrigger.style.opacity = '0.15';
            } else {
                premiumBadgeTrigger.style.display = 'none';
            }
        }
        if (profileData.premium) {
            premiumBadgeTrigger.style.opacity = '1';
        }
    }

    function renderBanner() {
        if (profileData.coverBanner) {
            mockupCoverImg.src = profileData.coverBanner;
            mockupCoverImg.classList.remove('has-placeholder');
            coverPlaceholder.style.display = 'none';
        } else {
            mockupCoverImg.src = '';
            mockupCoverImg.classList.add('has-placeholder');
            coverPlaceholder.style.display = 'block';
        }
    }

    function renderAvatar() {
        if (profileData.avatar) {
            mockupAvatarImg.src = profileData.avatar;
            mockupAvatarImg.classList.remove('has-placeholder');
            avatarPlaceholder.style.display = 'none';
        } else {
            mockupAvatarImg.src = '';
            mockupAvatarImg.classList.add('has-placeholder');
            avatarPlaceholder.style.display = 'flex';
        }
    }

    // === Render lists (Experience & Education) ===

    function renderExperienceList() {
        experienceListContainer.innerHTML = '';
        profileData.experience.forEach(item => {
            const expDiv = document.createElement('div');
            expDiv.className = 'list-item';
            expDiv.dataset.id = item.id;

            const logoHtml = item.logo 
                ? `<img src="${item.logo}" alt="Logo">`
                : `<div class="list-item-logo-placeholder"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>`;

            expDiv.innerHTML = `
                <div class="list-item-logo" title="Click to upload company logo">
                    <div class="logo-overlay">Upload</div>
                    ${logoHtml}
                </div>
                <div class="list-item-content">
                    <div class="list-item-title" contenteditable="true" title="Click to edit job title">${item.title}</div>
                    <div class="list-item-subtitle" contenteditable="true" title="Click to edit company name">${item.company}</div>
                    <div class="list-item-duration" contenteditable="true" title="Click to edit dates / duration">${item.duration}</div>
                    <div class="list-item-desc" contenteditable="true" title="Click to edit details">${item.description}</div>
                    <div class="list-item-actions">
                        <button type="button" class="btn-remove-item">Remove</button>
                    </div>
                </div>
            `;

            // Bind click to logo uploader
            expDiv.querySelector('.list-item-logo').addEventListener('click', () => {
                activeExpIdForUpload = item.id;
                hiddenExpLogoInput.click();
            });

            // Bind inline edit events
            expDiv.querySelector('.list-item-title').addEventListener('blur', (e) => {
                item.title = e.target.textContent.trim() || 'Job Title';
                saveState();
            });
            expDiv.querySelector('.list-item-title').addEventListener('keydown', preventEnter);

            expDiv.querySelector('.list-item-subtitle').addEventListener('blur', (e) => {
                item.company = e.target.textContent.trim() || 'Company';
                saveState();
            });
            expDiv.querySelector('.list-item-subtitle').addEventListener('keydown', preventEnter);

            expDiv.querySelector('.list-item-duration').addEventListener('blur', (e) => {
                item.duration = e.target.textContent.trim() || 'Duration';
                saveState();
            });
            expDiv.querySelector('.list-item-duration').addEventListener('keydown', preventEnter);

            expDiv.querySelector('.list-item-desc').addEventListener('blur', (e) => {
                item.description = e.target.innerText.trim();
                saveState();
            });

            // Bind remove button
            expDiv.querySelector('.btn-remove-item').addEventListener('click', () => {
                profileData.experience = profileData.experience.filter(exp => exp.id !== item.id);
                renderExperienceList();
                saveState();
            });

            experienceListContainer.appendChild(expDiv);
        });
    }

    function renderEducationList() {
        educationListContainer.innerHTML = '';
        profileData.education.forEach(item => {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'list-item';
            eduDiv.dataset.id = item.id;

            const logoHtml = item.logo 
                ? `<img src="${item.logo}" alt="Logo">`
                : `<div class="list-item-logo-placeholder"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.58 11.23L12 15.83l8.42-4.6c.15-.08.15-.3.02-.38L12 6.25 3.56 10.85c-.13.08-.13.3.02.38zM12 17c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/></svg></div>`;

            eduDiv.innerHTML = `
                <div class="list-item-logo" title="Click to upload school logo">
                    <div class="logo-overlay">Upload</div>
                    ${logoHtml}
                </div>
                <div class="list-item-content">
                    <div class="list-item-title" contenteditable="true" title="Click to edit school name">${item.school}</div>
                    <div class="list-item-subtitle" contenteditable="true" title="Click to edit degree details">${item.degree}</div>
                    <div class="list-item-duration" contenteditable="true" title="Click to edit dates / duration">${item.duration}</div>
                    <div class="list-item-desc" contenteditable="true" title="Click to edit details">${item.description}</div>
                    <div class="list-item-actions">
                        <button type="button" class="btn-remove-item">Remove</button>
                    </div>
                </div>
            `;

            // Bind click to logo uploader
            eduDiv.querySelector('.list-item-logo').addEventListener('click', () => {
                activeEduIdForUpload = item.id;
                hiddenEduLogoInput.click();
            });

            // Bind inline edit events
            eduDiv.querySelector('.list-item-title').addEventListener('blur', (e) => {
                item.school = e.target.textContent.trim() || 'School';
                saveState();
            });
            eduDiv.querySelector('.list-item-title').addEventListener('keydown', preventEnter);

            eduDiv.querySelector('.list-item-subtitle').addEventListener('blur', (e) => {
                item.degree = e.target.textContent.trim() || 'Degree / Field';
                saveState();
            });
            eduDiv.querySelector('.list-item-subtitle').addEventListener('keydown', preventEnter);

            eduDiv.querySelector('.list-item-duration').addEventListener('blur', (e) => {
                item.duration = e.target.textContent.trim() || 'Duration';
                saveState();
            });
            eduDiv.querySelector('.list-item-duration').addEventListener('keydown', preventEnter);

            eduDiv.querySelector('.list-item-desc').addEventListener('blur', (e) => {
                item.description = e.target.innerText.trim();
                saveState();
            });

            // Bind remove button
            eduDiv.querySelector('.btn-remove-item').addEventListener('click', () => {
                profileData.education = profileData.education.filter(edu => edu.id !== item.id);
                renderEducationList();
                saveState();
            });

            educationListContainer.appendChild(eduDiv);
        });
    }

    // === Add Items Functions ===
    function addExperienceItem() {
        const newId = 'exp-' + Date.now();
        profileData.experience.push({
            id: newId,
            title: 'Job Title',
            company: 'Company Name',
            logo: '',
            duration: 'Dates (e.g. 2024 - Present)',
            description: 'Write roles, achievements, and responsibilities here...'
        });
        renderExperienceList();
        saveState();

        // Focus the title of the newly added element
        setTimeout(() => {
            const newlyAdded = experienceListContainer.querySelector(`[data-id="${newId}"] .list-item-title`);
            if (newlyAdded) newlyAdded.focus();
        }, 100);
    }

    function addEducationItem() {
        const newId = 'edu-' + Date.now();
        profileData.education.push({
            id: newId,
            school: 'School / University Name',
            logo: '',
            degree: 'Degree or Field of Study',
            duration: 'Dates (e.g. 2020 - 2024)',
            description: 'Summarize your studies, grades, or activities...'
        });
        renderEducationList();
        saveState();

        // Focus the title of the newly added element
        setTimeout(() => {
            const newlyAdded = educationListContainer.querySelector(`[data-id="${newId}"] .list-item-title`);
            if (newlyAdded) newlyAdded.focus();
        }, 100);
    }

    // === Image Export (html2canvas) ===
    function exportMockupToImage() {
        const area = document.getElementById('linkedin-mockup');
        if (!area) return;

        const originalText = btnDownloadMockup.textContent;
        btnDownloadMockup.textContent = 'Generating Mockup...';
        btnDownloadMockup.disabled = true;

        // Force premium badge trigger display status for correct capture
        togglePremiumDisplay();

        html2canvas(area, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: -window.scrollY,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            const sanitizedName = profileData.fullname.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            link.download = `linkedin_profile_${sanitizedName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            btnDownloadMockup.textContent = originalText;
            btnDownloadMockup.disabled = false;
        }).catch(err => {
            alert('Failed to generate preview image. Please verify if your custom uploaded images are valid.');
            console.error('Export failed:', err);
            btnDownloadMockup.textContent = originalText;
            btnDownloadMockup.disabled = false;
        });
    }
});
