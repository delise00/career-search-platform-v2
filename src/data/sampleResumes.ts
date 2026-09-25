/**
 * Sample resumes for quick testing and onboarding
 */

export interface SampleResumePreset {
  id: string;
  name: string;
  role: string;
  description: string;
  rawText: string;
}

export const SAMPLE_RESUMES: SampleResumePreset[] = [
  {
    id: 'sample-frontend-dev',
    name: 'Sarah Chen (Mid/Senior Frontend Dev)',
    role: 'Frontend Engineer',
    description: '4 years experience with React, TypeScript, and web performance in Singapore tech startups.',
    rawText: `Sarah Chen
Email: sarah.chen.tech@example.sg | Phone: +65 9123 4567 | Location: Singapore
LinkedIn: linkedin.com/in/sarahchen-frontend | GitHub: github.com/sarahchen-dev

PROFESSIONAL SUMMARY
Results-driven Frontend Software Engineer with 4 years of experience building resilient, responsive web applications in Singapore's fast-paced tech ecosystem. Specialized in React, TypeScript, and modern component systems. Proven track record of improving web performance by 35% and mentoring junior engineers.

TECHNICAL SKILLS
- Frontend: React, TypeScript, JavaScript (ES2022), Tailwind CSS, Next.js, Redux Toolkit, HTML5, CSS3
- Testing & Quality: Jest, Vitest, React Testing Library, ESLint, Prettier
- Backend & APIs: RESTful APIs, Node.js (Express), GraphQL (basic), WebSockets
- Tooling & DevOps: Git, GitHub, Docker (basics), Webpack, Vite, CI/CD with GitHub Actions
- Methodologies: Agile / Scrum, Code Reviews, Performance Profiling (Lighthouse, Core Web Vitals)

WORK EXPERIENCE
Senior Frontend Developer | FinNovate Singapore Pte Ltd (Aug 2022 - Present)
- Architected and shipped merchant analytics dashboard using React 18 and TypeScript, handling over 250,000 monthly transactions.
- Refactored legacy monolithic CSS to utility-first Tailwind CSS, reducing CSS bundle size by 42% and accelerating page load times.
- Implemented automated testing suite with Vitest and React Testing Library, increasing test coverage from 45% to 82%.
- Mentored 3 junior software engineers through weekly pairing sessions and code review feedback.

Frontend Engineer | SeaBreeze E-commerce Pte Ltd (Jul 2020 - Jul 2022)
- Built interactive product catalog and checkout flows in React, optimizing for mobile web and low-latency mobile connections.
- Integrated third-party payment gateways and RESTful APIs, maintaining 99.9% uptime during peak holiday shopping campaigns.
- Collaborated with UI/UX designers in Figma to build an accessible, reusable component library according to WCAG 2.1 AA standards.

EDUCATION
Bachelor of Science (Honours) in Computer Science
National University of Singapore (NUS) | Graduated: 2020

CERTIFICATIONS
- AWS Certified Cloud Practitioner (2023)
- Meta Front-End Developer Professional Certificate (2021)`,
  },
  {
    id: 'sample-data-analyst',
    name: 'Marcus Tan (Data Analyst)',
    role: 'Data & BI Analyst',
    description: '3 years experience in SQL data extraction, Tableau visualization, and Python predictive modeling.',
    rawText: `Marcus Tan
Email: marcus.tan.analytics@example.sg | Phone: +65 8234 5678 | Location: Singapore

PROFESSIONAL SUMMARY
Insightful Data Analyst with 3 years of hands-on experience translating complex datasets into actionable business intelligence. Advanced proficiency in SQL queries, Tableau dashboard design, and Python statistical analysis. Experienced in supply chain and retail metrics.

TECHNICAL SKILLS
- Core Analytics: SQL (PostgreSQL, BigQuery, Snowflake), Python (Pandas, NumPy, Matplotlib), Excel / Google Sheets
- Visualization & BI: Tableau, PowerBI, Metabase, Data Storytelling
- Data Modeling: Dimensional modeling, ETL pipelines, Data Cleaning
- Soft Skills: Stakeholder Presentations, Cross-functional Collaboration, Problem Solving

WORK EXPERIENCE
Data Analyst | SingaLogistics Hub Pte Ltd (Jan 2022 - Present)
- Developed regional logistics delivery performance dashboards in Tableau connected to PostgreSQL, serving 60+ regional operations managers.
- Authored complex SQL queries and window functions to identify delivery route bottlenecks, reducing average order transit time by 14%.
- Conducted cohort retention analysis and automated weekly KPI reporting scripts in Python, saving 8 hours of manual data entry weekly.

Junior Business Analyst | Apex Retail SG (Aug 2020 - Dec 2021)
- Gathered business requirements and built sales performance reports across 15 retail outlets in Singapore.
- Cleaned and harmonized point-of-sale data across disparate Excel spreadsheets and SQL databases.

EDUCATION
Bachelor of Science in Information Systems
Singapore Management University (SMU) | Graduated: 2020

CERTIFICATIONS
- Tableau Desktop Certified Associate (2022)
- Google Data Analytics Professional Certificate (2021)`,
  },
  {
    id: 'sample-career-switcher',
    name: 'Ahmad bin Ibrahim (Career Switcher to Tech)',
    role: 'Junior Full-Stack / Cloud Associate',
    description: 'Transitioned from Operations Engineering to Full Stack Development via Singapore TechSkills Accelerator (TeSA).',
    rawText: `Ahmad bin Ibrahim
Email: ahmad.ibrahim.dev@example.sg | Phone: +65 9876 5432 | Location: Singapore

PROFESSIONAL SUMMARY
Motivated software engineer with foundational expertise in JavaScript, React, Node.js, and cloud essentials. Completed rigorous 6-month full-time Software Engineering Immersive with Singapore TeSA. Strong background in mechanical systems and process optimization, bringing rigorous analytical problem-solving and reliability discipline to software engineering.

TECHNICAL SKILLS
- Languages & Frameworks: JavaScript (ES6+), TypeScript, React, Node.js, Express, HTML5, CSS3, Tailwind CSS
- Databases & Cloud: PostgreSQL, MongoDB, Docker (fundamentals), AWS (EC2, S3, IAM)
- Developer Tools: Git, GitHub, Postman, Linux Command Line, VS Code
- Transferable Competencies: Process Optimization, Root Cause Analysis, Team Leadership, Technical Documentation

TECHNICAL PROJECTS
Career Navigator Portal (Full-Stack Capstone Project) (2024)
- Developed a full-stack job application tracker with React, Express, and PostgreSQL.
- Implemented user application status pipelines and responsive styling with Tailwind CSS.

E-Commerce Inventory Microservice (2023)
- Built RESTful API endpoints in Node.js/Express with JWT authentication and PostgreSQL queries.
- Deployed containerized service using Docker and AWS Elastic Beanstalk.

WORK EXPERIENCE
Senior Operations Supervisor | Precision Engineering Pte Ltd (2018 - 2023)
- Supervised team of 12 technicians maintaining high-precision industrial robotics, achieving 98.5% equipment reliability.
- Spearheaded standard operating procedure digital transformation, documenting inspection workflows.

EDUCATION & ACCREDITATION
Diploma in Software Engineering (TeSA Accelerated Programme) | General Assembly Singapore (2023)
Diploma in Mechanical Engineering | Singapore Polytechnic (2018)`,
  },
];
