// ==========================================
// ToolCanvas — Fresher Resume Templates Loader Script
// ==========================================

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

    // 3. Scale calculation
    adjustResumeScale();
});

window.addEventListener("resize", adjustResumeScale);

// Create top floating bar
function createControlBar() {
    const bar = document.createElement("div");
    bar.className = "floating-control-bar";
    bar.innerHTML = `
        <div class="control-logo">Tool<span>Canvas</span><span class="hide-mobile"> — Print Preview</span></div>
        <div class="control-actions">
            <a href="../index.html" class="btn-control-back">← Back to Templates</a>
            <button type="button" class="btn-control-download" id="print-pdf-btn">Download PDF</button>
        </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);
    
    // Bind print command
    document.getElementById("print-pdf-btn").addEventListener("click", () => {
        window.print();
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

// Scale the resume sheet dynamically to fit the viewport width on mobile/tablet devices
function adjustResumeScale() {
    const sheet = document.querySelector(".resume-sheet");
    const wrapper = document.querySelector(".resume-paper-wrapper");
    if (!sheet || !wrapper) return;

    if (window.innerWidth <= 820) {
        // Calculate exact scale factor based on screen width (leaving 30px total padding)
        const scale = (window.innerWidth - 30) / 816;
        sheet.style.transform = `scale(${scale})`;
        sheet.style.transformOrigin = "top center";
        
        // 11 inches = 1056px original height. Set wrapper height to contain the visually scaled sheet.
        wrapper.style.height = `calc(${1056 * scale}px + 40px)`;
    } else {
        // Reset scale and height for desktop viewports
        sheet.style.transform = "";
        sheet.style.transformOrigin = "";
        wrapper.style.height = "";
    }
}
