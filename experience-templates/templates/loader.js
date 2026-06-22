// ==========================================
// ToolCanvas — Resume Templates Loader Script
// ==========================================

const MOCK_DATA = {
    name: "David Vance",
    title: "Senior Full Stack Engineer",
    email: "david.vance@techdev.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/david-vance",
    website: "github.com/davidvance",
    summary: "Innovative, result-driven Senior Full Stack Engineer with 8+ years of expertise in software development lifecycles, database design, and cloud migrations. Proven track record of architecture design, cloud integrations, and leading cross-functional teams to launch high-performance web applications. Specializes in building scalable microservices in Node.js, modern frontend experiences in React/TypeScript, and orchestrating robust containerized services on AWS.",
    skills: "JavaScript, TypeScript, Node.js, React, Redux, Express, Python, PostgreSQL, MongoDB, Redis, AWS (ECS, Lambda, RDS), Docker, GraphQL, Next.js, Kubernetes, Terraform, Git, CI/CD, Jest, Cypress",
    experience: [
        {
            company: "OmniCorp Software",
            title: "Lead Engineer",
            dates: "Oct 2021 - Present",
            location: "San Francisco, CA",
            description: "- Led team of 6 developers to design and deploy a microservices-based SaaS portal, improving application speed by 40%.\n- Integrated AWS ECS, API Gateway, and PostgreSQL to handle 5M+ daily API requests.\n- Mentored junior engineers and instituted clean code standards using TypeScript.\n- Designed and automated continuous deployment (CI/CD) pipelines using GitHub Actions and AWS CodePipeline, reducing release cycles by 50%."
        },
        {
            company: "Apex Dev Studio",
            title: "Software Engineer III",
            dates: "Jun 2018 - Sep 2021",
            location: "San Jose, CA",
            description: "- Spearheaded the frontend migration from Legacy Angular to React.js, reducing client bundle size by 35%.\n- Developed robust REST APIs in Node.js and structured clean serverless Lambda functions.\n- Designed continuous integration workflows using GitHub Actions and Docker containers.\n- Implemented web security best practices (OWASP Top 10), securing database layers and API gateway authorizers against vulnerabilities."
        },
        {
            company: "Vertex Systems",
            title: "Software Engineer II",
            dates: "Jul 2015 - May 2018",
            location: "San Francisco, CA",
            description: "- Built and optimized RESTful APIs using Express and Node.js, reducing server response times by 20%.\n- Collaborated with QA team to implement automated unit testing (Jest) and integration testing workflows.\n- Maintained SQL queries and schema design, optimizing index structures for postgres databases.\n- Collaborated with UI/UX designers to implement pixel-perfect, responsive components using Tailwind CSS and Styled Components."
        }
    ],
    education: [
        {
            school: "University of California, Berkeley",
            degree: "B.S. in Computer Science",
            dates: "Graduated May 2018",
            location: "Berkeley, CA"
        },
        {
            school: "Stanford University",
            degree: "Professional Certificate in Advanced Software Systems",
            dates: "Awarded Dec 2019",
            location: "Stanford, CA"
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
                        // Strip leading bullet markers
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

    // Skills
    const skillsVal = document.getElementById("doc-skills-val");
    const skillsSection = document.getElementById("doc-skills-section");
    if (skillsVal) {
        if (data.skills) {
            // Split skills and render as formatted clean list
            const skillsArr = data.skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
            
            // Format check - some templates might render skills as inline bullet block or tags
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
