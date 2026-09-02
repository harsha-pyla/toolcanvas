document.addEventListener('DOMContentLoaded', () => {

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
        about: 'I am a passionate AI Product Manager with over 8 years of experience leading cross-functional engineering and design teams. Specialized in machine learning lifecycle development, large language model deployment, and high-fidelity user experiences. Highly motivated to bridge the gap between technical infrastructure and customer-facing products.',
        experience: [
            { id: 'exp-1', title: 'Senior AI Product Manager', company: 'Google', logo: '', duration: 'Jan 2024 - Present · 2 yrs 6 mos', description: 'Lead AI developer workflows and large-scale model features inside Google Cloud. Oversee cross-functional teams of engineers, researchers, and designers to ship developer services.' },
            { id: 'exp-2', title: 'Technical Lead — Machine Learning', company: 'Microsoft', logo: '', duration: 'Jun 2021 - Dec 2023 · 2 yrs 7 mos', description: 'Spearheaded ML engineering for search and recommendation systems. Developed and optimized neural networks that increased user engagement metrics by 14%.' }
        ],
        education: [
            { id: 'edu-1', school: 'Stanford University', logo: '', degree: 'Master of Science in Computer Science (AI Specialization)', duration: '2019 - 2021', description: 'Focused on Deep Learning and Natural Language Processing. Graduate teaching assistant in neural network design.' }
        ]
    };

    let profileData = {};

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

    // new form aliases
    const coverInputAlias = document.getElementById('cover-input');
    const avatarAlias = document.getElementById('avatar');
    const coverDropzone = document.getElementById('cover-dropzone');
    const avatarDropzone = document.getElementById('avatar-dropzone');
    const inputFullname = document.getElementById('input-fullname');
    const inputPronouns = document.getElementById('input-pronouns');
    const headline = document.getElementById('headline');
    const inputLocation = document.getElementById('input-location');
    const inputWebsite = document.getElementById('input-website');
    const inputConnections = document.getElementById('input-connections');
    const inputCompany = document.getElementById('input-company');
    const inputSchool = document.getElementById('input-school');
    const inputTalk = document.getElementById('input-talk');
    const inputAbout = document.getElementById('input-about');
    const inputPremium = document.getElementById('input-premium');

    let activeExpIdForUpload = null;
    let activeEduIdForUpload = null;

    loadState();
    bindEvents();
    renderAll();
    bindForm();
    initFaq();

    function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

    function bindForm(){
        const d=debounce((field, val)=>{
            switch(field){
                case 'fullname': profileData.fullname=val||'Your Name'; mockupFullname.textContent=profileData.fullname; break;
                case 'pronouns': profileData.pronouns=val; mockupPronouns.textContent=val; break;
                case 'headline': profileData.headline=val||'Professional Headline'; mockupHeadline.textContent=profileData.headline; break;
                case 'location': profileData.location=val||'Location'; mockupLocation.textContent=profileData.location; break;
                case 'website': profileData.website=val; mockupWebsite.textContent=val; mockupWebsite.style.display=val?'inline-block':'none'; break;
                case 'connections': profileData.connections=val||'500+ connections'; mockupConnections.textContent=profileData.connections; break;
                case 'company': profileData.currentCompany=val; quickCompanyText.textContent=val||'Company'; break;
                case 'school': profileData.currentSchool=val; quickSchoolText.textContent=val||'University'; break;
                case 'talk': profileData.talksAbout=val; talksHashtags.textContent=val; document.querySelector('.talks-about-row').style.display=val?'flex':'none'; break;
                case 'about': profileData.about=val; document.querySelector('.linkedin-about-text').innerText=val; break;
            }
            saveState();
        },80);
        if(inputFullname) inputFullname.addEventListener('input', e=> d('fullname', e.target.value));
        if(inputPronouns) inputPronouns.addEventListener('input', e=> d('pronouns', e.target.value));
        if(headline) headline.addEventListener('input', e=> d('headline', e.target.value));
        if(inputLocation) inputLocation.addEventListener('input', e=> d('location', e.target.value));
        if(inputWebsite) inputWebsite.addEventListener('input', e=> d('website', e.target.value));
        if(inputConnections) inputConnections.addEventListener('input', e=> d('connections', e.target.value));
        if(inputCompany) inputCompany.addEventListener('input', e=> d('company', e.target.value));
        if(inputSchool) inputSchool.addEventListener('input', e=> d('school', e.target.value));
        if(inputTalk) inputTalk.addEventListener('input', e=> d('talk', e.target.value));
        if(inputAbout) inputAbout.addEventListener('input', e=> d('about', e.target.value));
        if(inputPremium) inputPremium.addEventListener('change', e=>{
            profileData.premium=e.target.checked;
            togglePremiumDisplay(); saveState();
        });
        if(coverDropzone){
            coverDropzone.addEventListener('click', ()=> hiddenBannerInput.click());
            coverDropzone.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hiddenBannerInput.click(); }});
            coverDropzone.addEventListener('dragover', e=>{ e.preventDefault(); coverDropzone.style.borderColor='var(--accent-green)';});
            coverDropzone.addEventListener('dragleave', ()=> coverDropzone.style.borderColor='');
            coverDropzone.addEventListener('drop', e=>{
                e.preventDefault(); coverDropzone.style.borderColor='';
                const f=e.dataTransfer.files[0]; if(f) readBanner(f);
            });
        }
        if(avatarDropzone){
            avatarDropzone.addEventListener('click', ()=> hiddenAvatarInput.click());
            avatarDropzone.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hiddenAvatarInput.click(); }});
            avatarDropzone.addEventListener('dragover', e=>{ e.preventDefault(); avatarDropzone.style.borderColor='var(--accent-green)';});
            avatarDropzone.addEventListener('dragleave', ()=> avatarDropzone.style.borderColor='');
            avatarDropzone.addEventListener('drop', e=>{
                e.preventDefault(); avatarDropzone.style.borderColor='';
                const f=e.dataTransfer.files[0]; if(f) readAvatar(f);
            });
        }
        if(coverInputAlias){
            coverInputAlias.addEventListener('change', e=>{ const f=e.target.files[0]; if(f) readBanner(f); coverInputAlias.value=''; });
        }
        if(avatarAlias){
            avatarAlias.addEventListener('change', e=>{ const f=e.target.files[0]; if(f) readAvatar(f); avatarAlias.value=''; });
        }
    }
    function readBanner(f){
        const r=new FileReader(); r.onload=ev=>{ profileData.coverBanner=ev.target.result; renderBanner(); saveState(); }; r.readAsDataURL(f);
    }
    function readAvatar(f){
        const r=new FileReader(); r.onload=ev=>{ profileData.avatar=ev.target.result; renderAvatar(); saveState(); }; r.readAsDataURL(f);
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('toolcanvas_li_preview_v1');
            if (saved) {
                profileData = JSON.parse(saved);
                profileData = Object.assign({}, DEFAULT_DATA, profileData);
            } else {
                profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
        } catch (e) {
            profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    function saveState() {
        try { localStorage.setItem('toolcanvas_li_preview_v1', JSON.stringify(profileData)); } catch(e){}
    }

    function bindEvents() {
        if(btnThemeLight) btnThemeLight.addEventListener('click', () => setTheme('light'));
        if(btnThemeDark) btnThemeDark.addEventListener('click', () => setTheme('dark'));
        if(btnModeOwner) btnModeOwner.addEventListener('click', () => setViewMode('owner'));
        if(btnModeVisitor) btnModeVisitor.addEventListener('click', () => setViewMode('visitor'));
        if(btnResetMockup) btnResetMockup.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all profile details to default?')) {
                profileData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                saveState(); renderAll();
            }
        });
        if(btnDownloadMockup) btnDownloadMockup.addEventListener('click', exportMockupToImage);

        mockupFullname.addEventListener('blur', (e) => {
            profileData.fullname = e.target.textContent.trim() || 'Your Name';
            mockupFullname.textContent = profileData.fullname;
            if(inputFullname) inputFullname.value=profileData.fullname;
            saveState();
        });
        mockupFullname.addEventListener('keydown', preventEnter);
        premiumBadgeTrigger.addEventListener('click', () => {
            profileData.premium = !profileData.premium;
            if(inputPremium) inputPremium.checked=profileData.premium;
            togglePremiumDisplay(); saveState();
        });
        mockupPronouns.addEventListener('blur', (e) => {
            profileData.pronouns = e.target.textContent.trim();
            if(inputPronouns) inputPronouns.value=profileData.pronouns;
            saveState();
        });
        mockupPronouns.addEventListener('keydown', preventEnter);
        mockupHeadline.addEventListener('blur', (e) => {
            profileData.headline = e.target.textContent.trim() || 'Professional Headline';
            mockupHeadline.textContent = profileData.headline;
            if(headline) headline.value=profileData.headline;
            saveState();
        });
        mockupLocation.addEventListener('blur', (e) => {
            profileData.location = e.target.textContent.trim() || 'Location';
            mockupLocation.textContent = profileData.location;
            if(inputLocation) inputLocation.value=profileData.location;
            saveState();
        });
        mockupLocation.addEventListener('keydown', preventEnter);
        mockupConnections.addEventListener('blur', (e) => {
            profileData.connections = e.target.textContent.trim() || '500+ connections';
            mockupConnections.textContent = profileData.connections;
            if(inputConnections) inputConnections.value=profileData.connections;
            saveState();
        });
        mockupConnections.addEventListener('keydown', preventEnter);
        mockupMutual.addEventListener('blur', (e) => {
            profileData.mutualConnections = e.target.textContent.trim();
            mockupMutual.textContent = profileData.mutualConnections;
            saveState();
        });
        mockupMutual.addEventListener('keydown', preventEnter);
        mockupWebsite.addEventListener('blur', (e) => {
            profileData.website = e.target.textContent.trim();
            mockupWebsite.textContent = profileData.website;
            if(inputWebsite) inputWebsite.value=profileData.website;
            saveState();
        });
        mockupWebsite.addEventListener('keydown', preventEnter);
        quickCompanyText.addEventListener('blur', (e) => {
            profileData.currentCompany = e.target.textContent.trim();
            if(inputCompany) inputCompany.value=profileData.currentCompany;
            saveState();
        });
        quickCompanyText.addEventListener('keydown', preventEnter);
        quickSchoolText.addEventListener('blur', (e) => {
            profileData.currentSchool = e.target.textContent.trim();
            if(inputSchool) inputSchool.value=profileData.currentSchool;
            saveState();
        });
        quickSchoolText.addEventListener('keydown', preventEnter);
        talksHashtags.addEventListener('blur', (e) => {
            profileData.talksAbout = e.target.textContent.trim();
            if(inputTalk) inputTalk.value=profileData.talksAbout;
            saveState();
        });
        talksHashtags.addEventListener('keydown', preventEnter);
        coverBannerContainer.addEventListener('click', () => { hiddenBannerInput.click(); });
        hiddenBannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) { const reader = new FileReader(); reader.onload = (event) => { profileData.coverBanner = event.target.result; renderBanner(); saveState(); }; reader.readAsDataURL(file); }
            hiddenBannerInput.value = '';
        });
        avatarContainer.addEventListener('click', () => { hiddenAvatarInput.click(); });
        hiddenAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) { const reader = new FileReader(); reader.onload = (event) => { profileData.avatar = event.target.result; renderAvatar(); saveState(); }; reader.readAsDataURL(file); }
            hiddenAvatarInput.value = '';
        });
        const aboutEl=document.querySelector('.linkedin-about-text');
        if(aboutEl) aboutEl.addEventListener('blur', (e) => {
            profileData.about = e.target.innerText.trim();
            if(inputAbout) inputAbout.value=profileData.about;
            saveState();
        });
        if(btnAddExperience) btnAddExperience.addEventListener('click', addExperienceItem);
        if(btnAddEducation) btnAddEducation.addEventListener('click', addEducationItem);
        hiddenExpLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const targetExpId = activeExpIdForUpload;
            if (file && targetExpId) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const item = profileData.experience.find(exp => exp.id === targetExpId);
                    if (item) { item.logo = event.target.result; renderExperienceList(); saveState(); }
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
                    if (item) { item.logo = event.target.result; renderEducationList(); saveState(); }
                };
                reader.readAsDataURL(file);
            }
            hiddenEduLogoInput.value = '';
            activeEduIdForUpload = null;
        });
    }

    function preventEnter(e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }

    function renderAll() {
        if(btnThemeLight||btnThemeDark) setTheme(profileData.theme);
        if(btnModeOwner||btnModeVisitor) setViewMode(profileData.mode);
        mockupFullname.textContent = profileData.fullname;
        if(inputFullname) inputFullname.value=profileData.fullname;
        mockupPronouns.textContent = profileData.pronouns || '';
        if(inputPronouns) inputPronouns.value=profileData.pronouns||'';
        togglePremiumDisplay();
        if(inputPremium) inputPremium.checked=!!profileData.premium;
        mockupHeadline.textContent = profileData.headline;
        if(headline) headline.value=profileData.headline;
        mockupLocation.textContent = profileData.location;
        if(inputLocation) inputLocation.value=profileData.location;
        mockupConnections.textContent = profileData.connections;
        if(inputConnections) inputConnections.value=profileData.connections;
        mockupMutual.textContent = profileData.mutualConnections || '';
        mockupWebsite.textContent = profileData.website || '';
        if(inputWebsite) inputWebsite.value=profileData.website||'';
        mockupWebsite.style.display = profileData.website ? 'inline-block' : 'none';
        quickCompanyText.textContent = profileData.currentCompany || 'Company';
        if(inputCompany) inputCompany.value=profileData.currentCompany||'';
        quickSchoolText.textContent = profileData.currentSchool || 'University';
        if(inputSchool) inputSchool.value=profileData.currentSchool||'';
        talksHashtags.textContent = profileData.talksAbout || '';
        if(inputTalk) inputTalk.value=profileData.talksAbout||'';
        document.querySelector('.talks-about-row').style.display = profileData.talksAbout ? 'flex' : 'none';
        const aboutEl=document.querySelector('.linkedin-about-text');
        if(aboutEl) aboutEl.innerText = profileData.about||'';
        if(inputAbout) inputAbout.value=profileData.about||'';
        renderBanner(); renderAvatar(); renderExperienceList(); renderEducationList();
    }

    function setTheme(theme) {
        profileData.theme = theme;
        if (theme === 'dark') {
            mockupContainer.classList.remove('mockup-light'); mockupContainer.classList.add('mockup-dark');
            if(btnThemeDark) btnThemeDark.classList.add('active');
            if(btnThemeLight) btnThemeLight.classList.remove('active');
        } else {
            mockupContainer.classList.remove('mockup-dark'); mockupContainer.classList.add('mockup-light');
            if(btnThemeLight) btnThemeLight.classList.add('active');
            if(btnThemeDark) btnThemeDark.classList.remove('active');
        }
        saveState();
    }

    function setViewMode(mode) {
        profileData.mode = mode;
        if (mode === 'visitor') {
            mockupContainer.classList.remove('mode-owner'); mockupContainer.classList.add('mode-visitor');
            if(btnModeVisitor) btnModeVisitor.classList.add('active');
            if(btnModeOwner) btnModeOwner.classList.remove('active');
        } else {
            mockupContainer.classList.remove('mode-visitor'); mockupContainer.classList.add('mode-owner');
            if(btnModeOwner) btnModeOwner.classList.add('active');
            if(btnModeVisitor) btnModeVisitor.classList.remove('active');
        }
        saveState(); togglePremiumDisplay();
    }

    function togglePremiumDisplay() {
        if (profileData.premium) {
            premiumBadgeTrigger.style.display = 'inline-flex'; premiumBadgeTrigger.style.opacity='1';
        } else {
            if (profileData.mode === 'owner') { premiumBadgeTrigger.style.display = 'inline-flex'; premiumBadgeTrigger.style.opacity = '0.15'; }
            else { premiumBadgeTrigger.style.display = 'none'; }
        }
    }

    function renderBanner() {
        if (profileData.coverBanner) {
            mockupCoverImg.src = profileData.coverBanner; mockupCoverImg.classList.remove('has-placeholder'); coverPlaceholder.style.display = 'none';
        } else {
            mockupCoverImg.src = ''; mockupCoverImg.classList.add('has-placeholder'); coverPlaceholder.style.display = 'block';
        }
    }

    function renderAvatar() {
        if (profileData.avatar) {
            mockupAvatarImg.src = profileData.avatar; mockupAvatarImg.classList.remove('has-placeholder'); avatarPlaceholder.style.display = 'none';
        } else {
            mockupAvatarImg.src = ''; mockupAvatarImg.classList.add('has-placeholder'); avatarPlaceholder.style.display = 'flex';
        }
    }

    function renderExperienceList() {
        experienceListContainer.innerHTML = '';
        profileData.experience.forEach(item => {
            const expDiv = document.createElement('div'); expDiv.className = 'list-item'; expDiv.dataset.id = item.id;
            const logoHtml = item.logo ? `<img src="${item.logo}" alt="Logo">` : `<div class="list-item-logo-placeholder"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>`;
            expDiv.innerHTML = `<div class="list-item-logo" title="Click to upload company logo"><div class="logo-overlay">Upload</div>${logoHtml}</div><div class="list-item-content"><div class="list-item-title" contenteditable="true" title="Click to edit job title">${item.title}</div><div class="list-item-subtitle" contenteditable="true" title="Click to edit company name">${item.company}</div><div class="list-item-duration" contenteditable="true" title="Click to edit dates / duration">${item.duration}</div><div class="list-item-desc" contenteditable="true" title="Click to edit details">${item.description}</div><div class="list-item-actions"><button type="button" class="btn-remove-item">Remove</button></div></div>`;
            expDiv.querySelector('.list-item-logo').addEventListener('click', () => { activeExpIdForUpload = item.id; hiddenExpLogoInput.click(); });
            expDiv.querySelector('.list-item-title').addEventListener('blur', (e) => { item.title = e.target.textContent.trim() || 'Job Title'; saveState(); });
            expDiv.querySelector('.list-item-title').addEventListener('keydown', preventEnter);
            expDiv.querySelector('.list-item-subtitle').addEventListener('blur', (e) => { item.company = e.target.textContent.trim() || 'Company'; saveState(); });
            expDiv.querySelector('.list-item-subtitle').addEventListener('keydown', preventEnter);
            expDiv.querySelector('.list-item-duration').addEventListener('blur', (e) => { item.duration = e.target.textContent.trim() || 'Duration'; saveState(); });
            expDiv.querySelector('.list-item-duration').addEventListener('keydown', preventEnter);
            expDiv.querySelector('.list-item-desc').addEventListener('blur', (e) => { item.description = e.target.innerText.trim(); saveState(); });
            expDiv.querySelector('.btn-remove-item').addEventListener('click', () => { profileData.experience = profileData.experience.filter(exp => exp.id !== item.id); renderExperienceList(); saveState(); });
            experienceListContainer.appendChild(expDiv);
        });
    }

    function renderEducationList() {
        educationListContainer.innerHTML = '';
        profileData.education.forEach(item => {
            const eduDiv = document.createElement('div'); eduDiv.className = 'list-item'; eduDiv.dataset.id = item.id;
            const logoHtml = item.logo ? `<img src="${item.logo}" alt="Logo">` : `<div class="list-item-logo-placeholder"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.58 11.23L12 15.83l8.42-4.6c.15-.08.15-.3.02-.38L12 6.25 3.56 10.85c-.13.08-.13.3.02.38zM12 17c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/></svg></div>`;
            eduDiv.innerHTML = `<div class="list-item-logo" title="Click to upload school logo"><div class="logo-overlay">Upload</div>${logoHtml}</div><div class="list-item-content"><div class="list-item-title" contenteditable="true" title="Click to edit school name">${item.school}</div><div class="list-item-subtitle" contenteditable="true" title="Click to edit degree details">${item.degree}</div><div class="list-item-duration" contenteditable="true" title="Click to edit dates / duration">${item.duration}</div><div class="list-item-desc" contenteditable="true" title="Click to edit details">${item.description}</div><div class="list-item-actions"><button type="button" class="btn-remove-item">Remove</button></div></div>`;
            eduDiv.querySelector('.list-item-logo').addEventListener('click', () => { activeEduIdForUpload = item.id; hiddenEduLogoInput.click(); });
            eduDiv.querySelector('.list-item-title').addEventListener('blur', (e) => { item.school = e.target.textContent.trim() || 'School'; saveState(); });
            eduDiv.querySelector('.list-item-title').addEventListener('keydown', preventEnter);
            eduDiv.querySelector('.list-item-subtitle').addEventListener('blur', (e) => { item.degree = e.target.textContent.trim() || 'Degree / Field'; saveState(); });
            eduDiv.querySelector('.list-item-subtitle').addEventListener('keydown', preventEnter);
            eduDiv.querySelector('.list-item-duration').addEventListener('blur', (e) => { item.duration = e.target.textContent.trim() || 'Duration'; saveState(); });
            eduDiv.querySelector('.list-item-duration').addEventListener('keydown', preventEnter);
            eduDiv.querySelector('.list-item-desc').addEventListener('blur', (e) => { item.description = e.target.innerText.trim(); saveState(); });
            eduDiv.querySelector('.btn-remove-item').addEventListener('click', () => { profileData.education = profileData.education.filter(edu => edu.id !== item.id); renderEducationList(); saveState(); });
            educationListContainer.appendChild(eduDiv);
        });
    }

    function addExperienceItem() {
        const newId = 'exp-' + Date.now();
        profileData.experience.push({ id: newId, title: 'Job Title', company: 'Company Name', logo: '', duration: 'Dates (e.g. 2024 - Present)', description: 'Write roles, achievements, and responsibilities here...' });
        renderExperienceList(); saveState();
        setTimeout(() => { const el = experienceListContainer.querySelector(`[data-id="${newId}"] .list-item-title`); if (el) el.focus(); }, 100);
    }
    function addEducationItem() {
        const newId = 'edu-' + Date.now();
        profileData.education.push({ id: newId, school: 'School / University Name', logo: '', degree: 'Degree or Field of Study', duration: 'Dates (e.g. 2020 - 2024)', description: 'Summarize your studies, grades, or activities...' });
        renderEducationList(); saveState();
        setTimeout(() => { const el = educationListContainer.querySelector(`[data-id="${newId}"] .list-item-title`); if (el) el.focus(); }, 100);
    }

    function exportMockupToImage() {
        const area = document.getElementById('linkedin-mockup');
        if (!area) return;
        const originalText = btnDownloadMockup.textContent;
        btnDownloadMockup.textContent = 'Generating Mockup...'; btnDownloadMockup.disabled = true;
        togglePremiumDisplay();
        html2canvas(area, { scale: 2, useCORS: true, allowTaint: true, scrollX: 0, scrollY: -window.scrollY, backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            const sanitizedName = profileData.fullname.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            link.download = `linkedin_profile_${sanitizedName}.png`;
            link.href = canvas.toDataURL('image/png'); link.click();
            btnDownloadMockup.textContent = originalText; btnDownloadMockup.disabled = false;
        }).catch(err => {
            alert('Failed to generate preview image. Please verify if your custom uploaded images are valid.');
            console.error(err); btnDownloadMockup.textContent = originalText; btnDownloadMockup.disabled = false;
        });
    }

    function initFaq(){
        const items=document.querySelectorAll('#faq-accordion .faq-item');
        items.forEach(item=>{
            const btn=item.querySelector('.faq-question');
            const ans=item.querySelector('.faq-answer');
            if(!btn||!ans) return;
            btn.addEventListener('click', ()=>{
                const open=item.classList.contains('open');
                if(open){ item.classList.remove('open'); btn.setAttribute('aria-expanded','false'); ans.style.maxHeight='0'; }
                else { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); ans.style.maxHeight=ans.scrollHeight+'px'; }
            });
        });
    }
});
