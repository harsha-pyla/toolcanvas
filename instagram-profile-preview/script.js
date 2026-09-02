/* ========================================================
   ToolCanvas — Instagram Profile Preview JavaScript
   Archetype E — debounced live preview
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    let profileData = {
        username: 'yourbrandname',
        fullname: 'Your Brand Name',
        category: 'Digital creator',
        bio: '✨ Creating amazing content\n🌍 Based in New York\n📩 Business inquiries ↓',
        website: 'yourbrand.com',
        verified: true,
        posts: '385',
        followers: '211K',
        following: '1,140',
        avatar: '',
        theme: 'light',
        highlights: [
            { id: 1, title: 'About', image: '' },
            { id: 2, title: 'Reviews', image: '' },
            { id: 3, title: 'Travel', image: '' },
            { id: 4, title: 'Tips', image: '' }
        ],
        gridPhotos: ['', '', '', '', '', '']
    };

    const btnThemeLight = document.getElementById('btn-theme-light');
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const btnResetMockup = document.getElementById('btn-reset-mockup');
    const btnDownloadMockup = document.getElementById('btn-download-mockup');

    const mockupContainer = document.getElementById('instagram-mockup');
    const mockupUsername = document.querySelector('.mockup-username');
    const mockupVerifiedBadge = document.getElementById('mockup-verified-badge');
    const mockupAvatarImg = document.getElementById('mockup-avatar-img');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const mockupAvatarContainer = document.querySelector('.mockup-avatar-container');
    const mockupStatPosts = document.getElementById('mockup-stat-posts');
    const mockupStatFollowers = document.getElementById('mockup-stat-followers');
    const mockupStatFollowing = document.getElementById('mockup-stat-following');
    const mockupFullname = document.querySelector('.mockup-fullname');
    const mockupCategory = document.querySelector('.mockup-category');
    const mockupBioText = document.querySelector('.mockup-bio-text');
    const mockupWebsite = document.querySelector('.mockup-website');
    const mockupHighlightsScroll = document.getElementById('mockup-highlights-scroll');
    const mockupHighlightsWrapper = document.getElementById('mockup-highlights-wrapper');
    const mockupPhotoGrid = document.getElementById('mockup-photo-grid');
    const mockupBottomAvatarImg = document.getElementById('mockup-bottom-avatar-img');

    const hiddenAvatarInput = document.getElementById('hidden-avatar-input');
    const hiddenHighlightInput = document.getElementById('hidden-highlight-input');
    const hiddenGridInput = document.getElementById('hidden-grid-input');

    // New form inputs (Archetype E)
    const usernameInput = document.getElementById('username-input');
    const fullnameInput = document.getElementById('fullname-input');
    const categoryInput = document.getElementById('category-input');
    const bioInput = document.getElementById('bio-input');
    const websiteInput = document.getElementById('website-input');
    const postsInput = document.getElementById('posts-input');
    const followersInput = document.getElementById('followers-input');
    const followingInput = document.getElementById('following-input');
    const verifiedInput = document.getElementById('verified-input');
    const avatarDropzone = document.getElementById('avatar-dropzone');
    const avatarInputAlias = document.getElementById('avatar-input');
    const btnAddHighlight = document.getElementById('btn-add-highlight');
    const btnAddGrid = document.getElementById('btn-add-grid');

    let activeHighlightIdForUpload = null;
    let activeGridPhotoIndexForUpload = null;

    loadState();
    bindEvents();
    renderAll();
    bindFormInputs();
    initFaq();

    function debounce(fn, wait){
        let t;
        return function(...args){
            clearTimeout(t);
            t=setTimeout(()=>fn.apply(this,args), wait);
        };
    }

    function bindFormInputs(){
        if(!usernameInput) return;
        const syncUsername = debounce((v)=>{
            let cleaned = v.trim().toLowerCase().replace(/[^a-z0-9_.]/g,'');
            if(!cleaned) cleaned='username';
            profileData.username=cleaned;
            mockupUsername.textContent=cleaned;
            saveState();
        },80);
        usernameInput.addEventListener('input', e=> syncUsername(e.target.value));
        usernameInput.addEventListener('blur', e=>{
            let c=e.target.value.trim().toLowerCase().replace(/[^a-z0-9_.]/g,'');
            if(!c) c='username';
            e.target.value=c;
        });

        if(fullnameInput){
            const s=debounce(v=>{profileData.fullname=v; mockupFullname.textContent=v; saveState();},80);
            fullnameInput.addEventListener('input', e=> s(e.target.value));
        }
        if(categoryInput){
            const s=debounce(v=>{profileData.category=v; mockupCategory.textContent=v; mockupCategory.style.display=v?'block':'none'; saveState();},80);
            categoryInput.addEventListener('input', e=> s(e.target.value));
        }
        if(bioInput){
            const s=debounce(v=>{profileData.bio=v; formatBio(); saveState();},80);
            bioInput.addEventListener('input', e=> s(e.target.value));
        }
        if(websiteInput){
            const s=debounce(v=>{profileData.website=v.trim(); mockupWebsite.textContent=profileData.website; mockupWebsite.style.display=profileData.website?'inline-block':'none'; saveState();},80);
            websiteInput.addEventListener('input', e=> s(e.target.value));
        }
        if(postsInput){
            const s=debounce(v=>{profileData.posts=v.trim()||'0'; mockupStatPosts.textContent=profileData.posts; saveState();},80);
            postsInput.addEventListener('input', e=> s(e.target.value));
        }
        if(followersInput){
            const s=debounce(v=>{profileData.followers=v.trim()||'0'; mockupStatFollowers.textContent=profileData.followers; saveState();},80);
            followersInput.addEventListener('input', e=> s(e.target.value));
        }
        if(followingInput){
            const s=debounce(v=>{profileData.following=v.trim()||'0'; mockupStatFollowing.textContent=profileData.following; saveState();},80);
            followingInput.addEventListener('input', e=> s(e.target.value));
        }
        if(verifiedInput){
            verifiedInput.addEventListener('change', e=>{
                profileData.verified=e.target.checked;
                mockupVerifiedBadge.style.opacity=profileData.verified?'1':'0.2';
                saveState();
            });
        }
        if(avatarDropzone){
            avatarDropzone.addEventListener('click', ()=> hiddenAvatarInput.click());
            avatarDropzone.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hiddenAvatarInput.click(); }});
            avatarDropzone.addEventListener('dragover', e=>{ e.preventDefault(); avatarDropzone.style.borderColor='var(--accent-green)';});
            avatarDropzone.addEventListener('dragleave', ()=>{ avatarDropzone.style.borderColor='';});
            avatarDropzone.addEventListener('drop', e=>{
                e.preventDefault(); avatarDropzone.style.borderColor='';
                const f=e.dataTransfer.files[0];
                if(f){ readAvatarFile(f); }
            });
        }
        if(avatarInputAlias){
            avatarInputAlias.addEventListener('change', e=>{
                const f=e.target.files[0];
                if(f) readAvatarFile(f);
                avatarInputAlias.value='';
            });
        }
        if(btnAddHighlight){
            btnAddHighlight.addEventListener('click', ()=>{
                profileData.highlights.push({id:Date.now(), title:'Highlight', image:''});
                renderHighlights(); saveState();
            });
        }
        if(btnAddGrid){
            btnAddGrid.addEventListener('click', ()=>{
                activeGridPhotoIndexForUpload=null;
                hiddenGridInput.click();
            });
        }
    }

    function readAvatarFile(file){
        const reader=new FileReader();
        reader.onload=ev=>{
            profileData.avatar=ev.target.result;
            setAvatarImage(profileData.avatar);
            saveState();
        };
        reader.readAsDataURL(file);
    }

    function bindEvents() {

        mockupUsername.addEventListener('blur', (e) => {
            let cleaned = e.target.textContent.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
            if (!cleaned) cleaned = 'username';
            profileData.username = cleaned;
            mockupUsername.textContent = cleaned;
            if(usernameInput) usernameInput.value=cleaned;
            saveState();
        });
        mockupUsername.addEventListener('keydown', preventEnter);

        mockupStatPosts.addEventListener('blur', (e) => {
            profileData.posts = e.target.textContent.trim() || '0';
            if(postsInput) postsInput.value=profileData.posts;
            saveState();
        });
        mockupStatPosts.addEventListener('keydown', preventEnter);

        mockupStatFollowers.addEventListener('blur', (e) => {
            profileData.followers = e.target.textContent.trim() || '0';
            if(followersInput) followersInput.value=profileData.followers;
            saveState();
        });
        mockupStatFollowers.addEventListener('keydown', preventEnter);

        mockupStatFollowing.addEventListener('blur', (e) => {
            profileData.following = e.target.textContent.trim() || '0';
            if(followingInput) followingInput.value=profileData.following;
            saveState();
        });
        mockupStatFollowing.addEventListener('keydown', preventEnter);

        mockupFullname.addEventListener('blur', (e) => {
            profileData.fullname = e.target.textContent.trim();
            if(fullnameInput) fullnameInput.value=profileData.fullname;
            saveState();
        });
        mockupFullname.addEventListener('keydown', preventEnter);

        mockupCategory.addEventListener('blur', (e) => {
            profileData.category = e.target.textContent.trim();
            mockupCategory.style.display = profileData.category ? 'block' : 'none';
            if(categoryInput) categoryInput.value=profileData.category;
            saveState();
        });
        mockupCategory.addEventListener('keydown', preventEnter);

        mockupBioText.addEventListener('focus', () => {
            mockupBioText.innerText = profileData.bio;
        });

        mockupBioText.addEventListener('blur', () => {
            profileData.bio = mockupBioText.innerText.trim();
            if(bioInput) bioInput.value=profileData.bio;
            formatBio();
            saveState();
        });

        mockupWebsite.addEventListener('blur', (e) => {
            profileData.website = e.target.textContent.trim();
            mockupWebsite.style.display = profileData.website ? 'inline-block' : 'none';
            if(websiteInput) websiteInput.value=profileData.website;
            saveState();
        });
        mockupWebsite.addEventListener('keydown', preventEnter);

        mockupVerifiedBadge.addEventListener('click', () => {
            profileData.verified = !profileData.verified;
            mockupVerifiedBadge.style.opacity = profileData.verified ? '1' : '0.2';
            if(verifiedInput) verifiedInput.checked=profileData.verified;
            saveState();
        });

        mockupAvatarContainer.addEventListener('click', () => {
            hiddenAvatarInput.click();
        });

        hiddenAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileData.avatar = event.target.result;
                    setAvatarImage(profileData.avatar);
                    saveState();
                };
                reader.readAsDataURL(file);
            }
            hiddenAvatarInput.value = '';
        });

        hiddenHighlightInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const targetId = activeHighlightIdForUpload;
            if (file && targetId !== null) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const hlIndex = profileData.highlights.findIndex(h => h.id === targetId);
                    if (hlIndex !== -1) {
                        profileData.highlights[hlIndex].image = event.target.result;
                        renderHighlights();
                        saveState();
                    }
                };
                reader.readAsDataURL(file);
            }
            hiddenHighlightInput.value = '';
            activeHighlightIdForUpload = null;
        });

        hiddenGridInput.addEventListener('change', (e) => {
            const MAX_GRID = 6;
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            const targetIndex = activeGridPhotoIndexForUpload;
            if (targetIndex !== null) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileData.gridPhotos[targetIndex] = event.target.result;
                    renderGrid();
                    saveState();
                };
                reader.readAsDataURL(files[0]);
                activeGridPhotoIndexForUpload = null;
            } else {
                const currentCount = profileData.gridPhotos.filter(p => p !== '').length;
                const slotsAvailable = MAX_GRID - currentCount;
                if (slotsAvailable <= 0) {
                    alert('Maximum 6 photos allowed in the grid.');
                    hiddenGridInput.value = '';
                    return;
                }
                const filesToProcess = files.slice(0, slotsAvailable);
                let loadedCount = 0;
                let emptyIdx;
                let removed = 0;
                while ((emptyIdx = profileData.gridPhotos.indexOf('')) !== -1 && removed < filesToProcess.length) {
                    profileData.gridPhotos.splice(emptyIdx, 1);
                    removed++;
                }
                filesToProcess.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        profileData.gridPhotos.unshift(event.target.result);
                        loadedCount++;
                        if (loadedCount === filesToProcess.length) {
                            profileData.gridPhotos = profileData.gridPhotos.slice(0, MAX_GRID);
                            profileData.posts = profileData.gridPhotos.filter(p => p !== '').length.toString();
                            mockupStatPosts.textContent = profileData.posts;
                            if(postsInput) postsInput.value=profileData.posts;
                            renderGrid();
                            saveState();
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
            hiddenGridInput.value = '';
        });

        if(btnThemeLight) btnThemeLight.addEventListener('click', () => setTheme('light'));
        if(btnThemeDark) btnThemeDark.addEventListener('click', () => setTheme('dark'));

        btnResetMockup.addEventListener('click', () => {
            if (confirm('Reset the entire profile mockup? All photos and data will be cleared.')) {
                localStorage.removeItem('toolcanvas_ig_preview_v3');
                location.reload();
            }
        });

        btnDownloadMockup.addEventListener('click', exportMockup);
    }

    function preventEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }

    function setAvatarImage(src) {
        mockupAvatarImg.src = src;
        mockupAvatarImg.classList.remove('has-placeholder');
        avatarPlaceholder.style.display = 'none';
        mockupBottomAvatarImg.src = src;
    }

    function clearAvatar() {
        mockupAvatarImg.src = '';
        mockupAvatarImg.classList.add('has-placeholder');
        avatarPlaceholder.style.display = 'flex';
        mockupBottomAvatarImg.src = '';
    }

    function formatBio() {
        if (!profileData.bio) {
            mockupBioText.style.display = 'none';
            mockupBioText.innerHTML = '';
            return;
        }
        mockupBioText.style.display = 'block';
        let formatted = profileData.bio
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        formatted = formatted
            .replace(/(\n)/g, '<br>')
            .replace(/(#[a-zA-Z0-9_]+)/g, '<a href="#" onclick="event.preventDefault();">$1</a>')
            .replace(/(@[a-zA-Z0-9_.]+)/g, '<a href="#" onclick="event.preventDefault();">$1</a>');
        mockupBioText.innerHTML = formatted;
    }

    function setTheme(theme) {
        profileData.theme = theme;
        if (theme === 'dark') {
            mockupContainer.classList.remove('mockup-light');
            mockupContainer.classList.add('mockup-dark');
            if(btnThemeDark) btnThemeDark.classList.add('active');
            if(btnThemeLight) btnThemeLight.classList.remove('active');
        } else {
            mockupContainer.classList.remove('mockup-dark');
            mockupContainer.classList.add('mockup-light');
            if(btnThemeLight) btnThemeLight.classList.add('active');
            if(btnThemeDark) btnThemeDark.classList.remove('active');
        }
        saveState();
    }

    function renderHighlights() {
        mockupHighlightsScroll.innerHTML = '';
        profileData.highlights.forEach((hl, index) => {
            const item = document.createElement('div');
            item.className = 'mockup-highlight-item';
            item.dataset.id = hl.id;
            item.innerHTML = `
                <button class="highlight-delete" title="Remove highlight">✕</button>
                <div class="mockup-highlight-circle" title="Click to change cover">
                    <div class="highlight-placeholder-svg" id="hl-placeholder-${hl.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <img src="${hl.image || ''}" class="has-placeholder" id="hl-img-${hl.id}" alt="${hl.title}">
                </div>
                <span class="mockup-highlight-title" contenteditable="true" title="Click to edit">${hl.title || 'Highlight'}</span>
            `;
            mockupHighlightsScroll.appendChild(item);
            const hlImg = item.querySelector(`#hl-img-${hl.id}`);
            const hlPlaceholder = item.querySelector(`#hl-placeholder-${hl.id}`);
            if (hl.image) {
                hlImg.src = hl.image;
                hlImg.classList.remove('has-placeholder');
                hlPlaceholder.style.display = 'none';
            } else {
                hlImg.classList.add('has-placeholder');
                hlPlaceholder.style.display = 'flex';
            }
            item.querySelector('.mockup-highlight-circle').addEventListener('click', (e) => {
                e.stopPropagation();
                activeHighlightIdForUpload = hl.id;
                hiddenHighlightInput.click();
            });
            const titleEl = item.querySelector('.mockup-highlight-title');
            titleEl.addEventListener('blur', (e) => {
                hl.title = e.target.textContent.trim();
                saveState();
            });
            titleEl.addEventListener('keydown', preventEnter);
            item.querySelector('.highlight-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                profileData.highlights.splice(index, 1);
                renderHighlights();
                saveState();
            });
        });
        const addItem = document.createElement('div');
        addItem.className = 'mockup-highlight-item add-highlight-btn';
        addItem.innerHTML = `
            <div class="mockup-highlight-circle"><span class="plus-icon">+</span></div>
            <span class="mockup-highlight-title">New</span>
        `;
        mockupHighlightsScroll.appendChild(addItem);
        addItem.addEventListener('click', () => {
            profileData.highlights.push({
                id: Date.now(),
                title: 'Highlight',
                image: ''
            });
            renderHighlights();
            saveState();
        });
    }

    function renderGrid() {
        const MAX_GRID = 6;
        mockupPhotoGrid.innerHTML = '';
        profileData.gridPhotos = profileData.gridPhotos.slice(0, MAX_GRID);
        profileData.gridPhotos.forEach((photo, index) => {
            const cell = document.createElement('div');
            cell.className = 'mockup-grid-photo';
            cell.setAttribute('draggable', photo !== '' ? 'true' : 'false');
            cell.dataset.index = index;
            cell.innerHTML = `
                <button class="grid-photo-delete" title="Delete">✕</button>
                <div class="grid-placeholder-svg" id="grid-placeholder-${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <img src="${photo || ''}" class="has-placeholder" id="grid-img-${index}" alt="Post">
            `;
            mockupPhotoGrid.appendChild(cell);
            const gridImg = cell.querySelector(`#grid-img-${index}`);
            const gridPlaceholder = cell.querySelector(`#grid-placeholder-${index}`);
            if (photo) {
                gridImg.src = photo;
                gridImg.classList.remove('has-placeholder');
                gridPlaceholder.style.display = 'none';
            } else {
                gridImg.classList.add('has-placeholder');
                gridPlaceholder.style.display = 'flex';
                cell.addEventListener('click', () => {
                    activeGridPhotoIndexForUpload = index;
                    hiddenGridInput.click();
                });
            }
            cell.querySelector('.grid-photo-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                profileData.gridPhotos.splice(index, 1);
                profileData.posts = profileData.gridPhotos.filter(p => p !== '').length.toString();
                mockupStatPosts.textContent = profileData.posts;
                if(postsInput) postsInput.value=profileData.posts;
                renderGrid();
                saveState();
            });
        });
        const filledCount = profileData.gridPhotos.filter(p => p !== '').length;
        if (filledCount < MAX_GRID && profileData.gridPhotos.length < MAX_GRID) {
            const addCell = document.createElement('div');
            addCell.className = 'mockup-grid-photo add-grid-photo-btn';
            addCell.innerHTML = `
                <span class="plus-icon">+</span>
                <span class="label-text">Add Photos</span>
            `;
            mockupPhotoGrid.appendChild(addCell);
            addCell.addEventListener('click', () => {
                activeGridPhotoIndexForUpload = null;
                hiddenGridInput.click();
            });
        }
        initDragAndDrop();
    }

    let dragStartIndex;
    function initDragAndDrop() {
        const cells = mockupPhotoGrid.querySelectorAll('.mockup-grid-photo:not(.add-grid-photo-btn)');
        cells.forEach(cell => {
            const idx = parseInt(cell.dataset.index);
            if (profileData.gridPhotos[idx] !== '') {
                cell.addEventListener('dragstart', onDragStart);
                cell.addEventListener('dragover', onDragOver);
                cell.addEventListener('dragenter', onDragEnter);
                cell.addEventListener('dragleave', onDragLeave);
                cell.addEventListener('drop', onDrop);
                cell.addEventListener('dragend', onDragEnd);
            }
        });
    }
    function onDragStart(e) {
        dragStartIndex = parseInt(this.dataset.index);
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    function onDragOver(e) { e.preventDefault(); }
    function onDragEnter() { this.style.opacity = '0.6'; }
    function onDragLeave() { this.style.opacity = ''; }
    function onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        const endIdx = parseInt(this.dataset.index);
        if (dragStartIndex !== endIdx && profileData.gridPhotos[endIdx] !== '') {
            const temp = profileData.gridPhotos[dragStartIndex];
            profileData.gridPhotos.splice(dragStartIndex, 1);
            profileData.gridPhotos.splice(endIdx, 0, temp);
            renderGrid();
            saveState();
        }
    }
    function onDragEnd() {
        this.classList.remove('dragging');
        mockupPhotoGrid.querySelectorAll('.mockup-grid-photo').forEach(cell => { cell.style.opacity = ''; });
    }

    function exportMockup() {
        const area = document.getElementById('instagram-mockup');
        if (!area) return;
        const origText = btnDownloadMockup.textContent;
        btnDownloadMockup.textContent = 'Generating...';
        btnDownloadMockup.disabled = true;
        html2canvas(area, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: -window.scrollY,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `instagram_mockup_${profileData.username || 'profile'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            btnDownloadMockup.textContent = origText;
            btnDownloadMockup.disabled = false;
        }).catch(err => {
            alert('Failed to generate mockup. Please ensure all images are valid.');
            console.error('Export error:', err);
            btnDownloadMockup.textContent = origText;
            btnDownloadMockup.disabled = false;
        });
    }

    function renderAll() {
        mockupUsername.textContent = profileData.username || 'username';
        if(usernameInput) usernameInput.value=profileData.username;
        mockupVerifiedBadge.style.opacity = profileData.verified ? '1' : '0.2';
        if(verifiedInput) verifiedInput.checked=profileData.verified;
        mockupStatPosts.textContent = profileData.posts || '0';
        mockupStatFollowers.textContent = profileData.followers || '0';
        mockupStatFollowing.textContent = profileData.following || '0';
        if(postsInput) postsInput.value=profileData.posts;
        if(followersInput) followersInput.value=profileData.followers;
        if(followingInput) followingInput.value=profileData.following;
        mockupFullname.textContent = profileData.fullname;
        if(fullnameInput) fullnameInput.value=profileData.fullname;
        mockupCategory.textContent = profileData.category;
        if(categoryInput) categoryInput.value=profileData.category;
        mockupCategory.style.display = profileData.category ? 'block' : 'none';
        if(bioInput) bioInput.value=profileData.bio;
        if (profileData.avatar) {
            setAvatarImage(profileData.avatar);
        } else {
            clearAvatar();
        }
        formatBio();
        mockupWebsite.textContent = profileData.website || '';
        if(websiteInput) websiteInput.value=profileData.website;
        mockupWebsite.style.display = profileData.website ? 'inline-block' : 'none';
        setTheme(profileData.theme);
        renderHighlights();
        renderGrid();
    }

    function saveState() {
        try {
            localStorage.setItem('toolcanvas_ig_preview_v3', JSON.stringify(profileData));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('toolcanvas_ig_preview_v3');
            if (saved) {
                profileData = { ...profileData, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Load failed:', e);
        }
    }

    function initFaq(){
        const items=document.querySelectorAll('#faq-accordion .faq-item');
        items.forEach(item=>{
            const btn=item.querySelector('.faq-question');
            const ans=item.querySelector('.faq-answer');
            if(!btn||!ans) return;
            btn.addEventListener('click', ()=>{
                const isOpen=item.classList.contains('open');
                if(isOpen){
                    item.classList.remove('open');
                    btn.setAttribute('aria-expanded','false');
                    ans.style.maxHeight='0';
                }else{
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded','true');
                    ans.style.maxHeight=ans.scrollHeight+'px';
                }
            });
        });
    }
});
