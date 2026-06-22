// ==========================================
// ToolCanvas — Fresher Resume Templates Loader Script
// ==========================================

let currentZoomMode = 'fit'; // 'fit' or 'fixed'
let currentZoomScale = 1.0;
const ZOOM_PRESETS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

const MOCK_DATA = {
    name: "Jane Vance",
    title: "Computer Science Graduate",
    email: "jane.vance@studentdev.com",
    phone: "+1 (617) 555-0143",
    location: "Boston, MA",
    linkedin: "linkedin.com/in/janevance",
    website: "github.com/janevance",
    summary: "Motivated and detail-oriented Computer Science Graduate with hands-on experience in full-stack web development, software engineering principles, and agile methodologies. Proven ability to design, build, and deploy robust web applications and microservices. Skilled in modern frontend frameworks, backend API construction, and cloud deployment, seeking an entry-level software engineer role.",
    skills: "Python, Java, JavaScript, TypeScript, C++, HTML5, CSS3, React, Node.js, Express, Next.js, PostgreSQL, MongoDB, Git, Docker, AWS (S3, Lambda), Jest, CI/CD, Agile/Scrum, RESTful APIs",
    education: [
        {
            school: "Boston University",
            degree: "B.S. in Computer Science (GPA: 3.82/4.00)",
            dates: "Sep 2022 - May 2026",
            location: "Boston, MA"
        }
    ],
    projects: [
        {
            name: "Cloud-Based Kanban Task Manager",
            tech: "React, Node.js, Express, MongoDB, AWS",
            dates: "Sep 2025 - Dec 2025",
            description: "- Designed and implemented a responsive, multi-tenant task management tool utilizing React for dynamic UI transitions.\n- Engineered secure RESTful APIs with Node.js/Express, incorporating JWT authentication and role-based access control.\n- Deployed backend services on AWS EC2 and database schemas on MongoDB Atlas, ensuring 99.9% uptime during university demo days."
        },
        {
            name: "Automated Algorithmic Trading Bot",
            tech: "Python, Pandas, NumPy, Alpaca API",
            dates: "May 2025 - Aug 2025",
            description: "- Built a backtesting simulator using Python and Pandas to test moving average crossover strategies with 5 years of historical stock data.\n- Optimized execution latency by 15% using multi-threaded request workers to interact with the Alpaca trade execution API.\n- Implemented automated slack notifications to alert users on key market trends and daily portfolio performance changes."
        },
        {
            name: "Distributed Chat Application",
            tech: "Java, WebSockets, Redis, Docker",
            dates: "Jan 2025 - May 2025",
            description: "- Developed a real-time messaging system in Java utilizing WebSockets for low-latency peer-to-peer communication.\n- Integrated Redis Pub/Sub architecture to enable message synchronization across multiple scaling chat server instances.\n- Containerized the entire stack using Docker and Docker Compose, simplifying development onboarding to a single command."
        }
    ],
    experience: [
        {
            company: "Tech Startups Inc.",
            title: "Software Engineering Intern",
            dates: "Jun 2025 - Aug 2025",
            location: "Boston, MA",
            description: "- Collaborated with a team of 4 engineers to design, build, and test features for a cloud-hosted customer dashboard.\n- Wrote automated unit and integration tests using Jest, boosting codebase coverage from 68% to 84%.\n- Refactored legacy UI components using React hooks, reducing client-side load time by 12%."
        }
    ],
    activities: [
        {
            role: "President",
            organization: "BU Computer Science Society",
            dates: "Sep 2024 - Present",
            location: "Boston, MA",
            description: "- Organized weekly technical workshops, hackathons, and guest speaker panels for 300+ active student members.\n- Established partnerships with local tech companies, securing $5,000 in sponsorships for the annual campus hackathon."
        },
        {
            role: "Peer Tutor",
            organization: "BU CS Department",
            dates: "Sep 2023 - May 2025",
            location: "Boston, MA",
            description: "- Provided weekly academic tutoring and homework code-review sessions to 30+ introductory Java and Data Structures students.\n- Helped students debug logic errors, verify algorithm complexities, and grasp fundamental object-oriented design patterns."
        }
    ]
};

window.addEventListener("DOMContentLoaded", () => {
    // 1. Build the floating control bar
    createControlBar();

    // 2. Load and render data
    renderResumeData();

    // 3. Bind Zoom controls
    bindZoomEvents();

    // 4. Scale calculation
    adjustResumeScale();
});

window.addEventListener("resize", adjustResumeScale);

function downloadDirectPDF() {
    const btn = document.getElementById("print-pdf-btn");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Downloading...";

    const element = document.querySelector(".resume-sheet");
    const opt = {
        margin: 0,
        filename: (document.getElementById("doc-name")?.textContent || "resume").trim().replace(/\s+/g, "_") + "_resume.pdf",
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Temporarily reset scale transforms so html2pdf renders the sheet at its full 100% native size
    const originalTransform = element.style.transform;
    const originalTransformOrigin = element.style.transformOrigin;
    element.style.transform = "none";
    element.style.transformOrigin = "";

    function executeSave() {
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.transform = originalTransform;
            element.style.transformOrigin = originalTransformOrigin;
            btn.disabled = false;
            btn.textContent = originalText;
        }).catch(err => {
            console.error("html2pdf failed:", err);
            element.style.transform = originalTransform;
            element.style.transformOrigin = originalTransformOrigin;
            window.print();
            btn.disabled = false;
            btn.textContent = originalText;
        });
    }

    if (typeof html2pdf === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = executeSave;
        script.onerror = () => {
            element.style.transform = originalTransform;
            element.style.transformOrigin = originalTransformOrigin;
            window.print();
            btn.disabled = false;
            btn.textContent = originalText;
        };
        document.head.appendChild(script);
    } else {
        executeSave();
    }
}

// Create top floating bar
function createControlBar() {
    const bar = document.createElement("div");
    bar.className = "floating-control-bar";
    bar.innerHTML = `
        <div class="control-logo">Tool<span>Canvas</span><span class="hide-mobile"> — Viewer</span></div>
        <div class="control-zoom">
            <button type="button" class="btn-zoom" id="zoom-out-btn" title="Zoom Out">−</button>
            <span class="zoom-level" id="zoom-level-val">Fit</span>
            <button type="button" class="btn-zoom" id="zoom-in-btn" title="Zoom In">+</button>
            <button type="button" class="btn-zoom-text" id="zoom-fit-btn">Fit</button>
            <button type="button" class="btn-zoom-text" id="zoom-reset-btn">100%</button>
        </div>
        <div class="control-actions">
            <a href="../index.html" class="btn-control-back">← Templates</a>
            <button type="button" class="btn-control-download" id="print-pdf-btn">Download PDF</button>
        </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);
    
    // Bind direct download command
    document.getElementById("print-pdf-btn").addEventListener("click", downloadDirectPDF);
}

function bindZoomEvents() {
    document.getElementById("zoom-out-btn").addEventListener("click", () => {
        currentZoomMode = 'fixed';
        // Find the closest preset smaller than currentZoomScale
        let nextZoom = ZOOM_PRESETS[0];
        for (let i = ZOOM_PRESETS.length - 1; i >= 0; i--) {
            if (ZOOM_PRESETS[i] < currentZoomScale - 0.02) {
                nextZoom = ZOOM_PRESETS[i];
                break;
            }
        }
        currentZoomScale = nextZoom;
        adjustResumeScale();
    });

    document.getElementById("zoom-in-btn").addEventListener("click", () => {
        currentZoomMode = 'fixed';
        // Find the closest preset larger than currentZoomScale
        let nextZoom = ZOOM_PRESETS[ZOOM_PRESETS.length - 1];
        for (let i = 0; i < ZOOM_PRESETS.length; i++) {
            if (ZOOM_PRESETS[i] > currentZoomScale + 0.02) {
                nextZoom = ZOOM_PRESETS[i];
                break;
            }
        }
        currentZoomScale = nextZoom;
        adjustResumeScale();
    });

    document.getElementById("zoom-fit-btn").addEventListener("click", () => {
        currentZoomMode = 'fit';
        adjustResumeScale();
    });

    document.getElementById("zoom-reset-btn").addEventListener("click", () => {
        currentZoomMode = 'fixed';
        currentZoomScale = 1.0;
        adjustResumeScale();
    });
}

// Populate page DOM with resume content
function renderResumeData() {
    let data = MOCK_DATA;

    // Name & Title
    if (document.getElementById("doc-name")) {
        document.getElementById("doc-name").textContent = data.name || "Full Name";
    }
    if (document.getElementById("doc-title")) {
        document.getElementById("doc-title").textContent = data.title || "Professional Title";
    }

    // Contact info row
    if (document.getElementById("doc-contact-row")) {
        const contactItems = [];
        if (data.email) contactItems.push(data.email);
        if (data.phone) contactItems.push(data.phone);
        if (data.location) contactItems.push(data.location);
        if (data.linkedin) contactItems.push(data.linkedin);
        if (data.website) contactItems.push(data.website);
        
        // Joined by bullet separators
        document.getElementById("doc-contact-row").innerHTML = contactItems.join(" &nbsp;|&nbsp; ");
    }

    // Professional Summary
    const summaryVal = document.getElementById("doc-summary-val");
    const summarySection = document.getElementById("doc-summary-section");
    if (summaryVal) {
        if (data.summary) {
            summaryVal.textContent = data.summary;
            if (summarySection) summarySection.style.display = "block";
        } else {
            if (summarySection) summarySection.style.display = "none";
        }
    }

    // Education History
    const eduList = document.getElementById("doc-education-list");
    const eduSection = document.getElementById("doc-education-section");
    if (eduList) {
        eduList.innerHTML = "";
        if (data.education && data.education.length > 0) {
            if (eduSection) eduSection.style.display = "block";
            
            data.education.forEach(edu => {
                const article = document.createElement("article");
                article.className = "edu-item";
                article.innerHTML = `
                    <div class="item-header-row">
                        <span class="item-school">${edu.school}</span>
                        <span class="item-dates">${edu.dates}</span>
                    </div>
                    <div class="item-subheader-row">
                        <span class="item-degree">${edu.degree}</span>
                        <span class="item-location">${edu.location}</span>
                    </div>
                `;
                eduList.appendChild(article);
            });
        } else {
            if (eduSection) eduSection.style.display = "none";
        }
    }

    // Academic Projects
    const projectList = document.getElementById("doc-project-list");
    const projectSection = document.getElementById("doc-projects-section");
    if (projectList) {
        projectList.innerHTML = "";
        if (data.projects && data.projects.length > 0) {
            if (projectSection) projectSection.style.display = "block";
            
            data.projects.forEach(proj => {
                const article = document.createElement("article");
                article.className = "project-item";
                
                // Bullet parser
                let bulletsHtml = "";
                if (proj.description) {
                    const lines = proj.description.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                    lines.forEach(line => {
                        let cleaned = line;
                        if (cleaned.startsWith("-")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("*")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("•")) cleaned = cleaned.substring(1).trim();
                        
                        bulletsHtml += `<li>${cleaned}</li>`;
                    });
                }

                article.innerHTML = `
                    <div class="item-header-row">
                        <span class="item-project-name">${proj.name}</span>
                        <span class="item-dates">${proj.dates}</span>
                    </div>
                    <div class="item-subheader-row">
                        <span class="item-tech">${proj.tech}</span>
                    </div>
                    <ul class="item-bullets">
                        ${bulletsHtml}
                    </ul>
                `;
                projectList.appendChild(article);
            });
        } else {
            if (projectSection) projectSection.style.display = "none";
        }
    }

    // Work Experience
    const expList = document.getElementById("doc-experience-list");
    const expSection = document.getElementById("doc-experience-section");
    if (expList) {
        expList.innerHTML = "";
        if (data.experience && data.experience.length > 0) {
            if (expSection) expSection.style.display = "block";
            
            data.experience.forEach(job => {
                const article = document.createElement("article");
                article.className = "job-item";
                
                // Bullet parser
                let bulletsHtml = "";
                if (job.description) {
                    const lines = job.description.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                    lines.forEach(line => {
                        let cleaned = line;
                        if (cleaned.startsWith("-")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("*")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("•")) cleaned = cleaned.substring(1).trim();
                        
                        bulletsHtml += `<li>${cleaned}</li>`;
                    });
                }

                article.innerHTML = `
                    <div class="item-header-row">
                        <span class="item-company">${job.company}</span>
                        <span class="item-dates">${job.dates}</span>
                    </div>
                    <div class="item-subheader-row">
                        <span class="item-title">${job.title}</span>
                        <span class="item-location">${job.location}</span>
                    </div>
                    <ul class="item-bullets">
                        ${bulletsHtml}
                    </ul>
                `;
                expList.appendChild(article);
            });
        } else {
            if (expSection) expSection.style.display = "none";
        }
    }

    // Extracurricular Activities / Leadership
    const actList = document.getElementById("doc-activities-list");
    const actSection = document.getElementById("doc-activities-section");
    if (actList) {
        actList.innerHTML = "";
        if (data.activities && data.activities.length > 0) {
            if (actSection) actSection.style.display = "block";
            
            data.activities.forEach(act => {
                const article = document.createElement("article");
                article.className = "activity-item";
                
                // Bullet parser
                let bulletsHtml = "";
                if (act.description) {
                    const lines = act.description.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                    lines.forEach(line => {
                        let cleaned = line;
                        if (cleaned.startsWith("-")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("*")) cleaned = cleaned.substring(1).trim();
                        else if (cleaned.startsWith("•")) cleaned = cleaned.substring(1).trim();
                        
                        bulletsHtml += `<li>${cleaned}</li>`;
                    });
                }

                article.innerHTML = `
                    <div class="item-header-row">
                        <span class="item-org">${act.organization}</span>
                        <span class="item-dates">${act.dates}</span>
                    </div>
                    <div class="item-subheader-row">
                        <span class="item-role">${act.role}</span>
                        <span class="item-location">${act.location || ''}</span>
                    </div>
                    <ul class="item-bullets">
                        ${bulletsHtml}
                    </ul>
                `;
                actList.appendChild(article);
            });
        } else {
            if (actSection) actSection.style.display = "none";
        }
    }

    // Skills
    const skillsVal = document.getElementById("doc-skills-val");
    const skillsSection = document.getElementById("doc-skills-section");
    if (skillsVal) {
        if (data.skills) {
            const skillsArr = data.skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
            
            if (skillsVal.tagName.toLowerCase() === "p") {
                skillsVal.textContent = skillsArr.join(" • ");
            } else {
                skillsVal.innerHTML = skillsArr.map(s => `<span>${s}</span>`).join("");
            }
            if (skillsSection) skillsSection.style.display = "block";
        } else {
            if (skillsSection) skillsSection.style.display = "none";
        }
    }
}

function adjustResumeScale() {
    const sheet = document.querySelector(".resume-sheet");
    const wrapper = document.querySelector(".resume-paper-wrapper");
    if (!sheet || !wrapper) return;

    // Calculate scale factor based on screen width (leaving 24px total padding)
    const scaleX = (window.innerWidth - 24) / 816;
    
    // Calculate scale factor based on screen height (leaving space for 60px header + padding)
    const availableHeight = window.innerHeight - 60 - 24;
    const scaleY = availableHeight / 1056;

    if (currentZoomMode === 'fit') {
        // Fit viewport width but do not scale excessively
        currentZoomScale = Math.max(0.3, Math.min(scaleX, 1.5));
        document.getElementById("zoom-level-val").textContent = "Fit (" + Math.round(currentZoomScale * 100) + "%)";
    } else {
        document.getElementById("zoom-level-val").textContent = Math.round(currentZoomScale * 100) + "%";
    }

    sheet.style.transform = `scale(${currentZoomScale})`;
    sheet.style.transformOrigin = "top center";

    // Set wrapper height to contain the visually scaled sheet exactly
    wrapper.style.height = (1056 * currentZoomScale + 40) + "px";
    
    // Center alignment or horizontal panning scrollbars depending on width
    if (816 * currentZoomScale > window.innerWidth - 24) {
        wrapper.style.justifyContent = "flex-start";
        wrapper.style.padding = "24px 12px";
    } else {
        wrapper.style.justifyContent = "center";
        wrapper.style.padding = "24px 0";
    }
}
