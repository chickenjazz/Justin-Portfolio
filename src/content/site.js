export const profile = {
  name: "Justin Manuzon",
  tagline: "Computer Science Student | Aspiring AI & Cloud Engineer",
  introduction:
    "I’ve always needed to know why things work. That question brought me to Computer Science at FEU Tech, turned my thesis into Promptee, and keeps pulling me deeper into AI and the cloud.",
  experience:
    "My experience spans web development, AI/ML experimentation, prompt optimization, and automation. I enjoy connecting APIs, developing software systems, and exploring how AI can solve real-world problems.",
  approach:
    "I’m particularly interested in the intersection of software engineering, AI infrastructure, and cloud computing. I aim to build scalable, useful, and well-engineered applications while continuously expanding my technical skills.",
  interests: [
    "Artificial Intelligence and Machine Learning",
    "Cloud Engineering and Cloud Infrastructure",
    "Software Engineering and Full-Stack Development",
    "DevOps and Automation",
    "MLOps and AI Infrastructure",
  ],
  roles: [
    "AI Engineer",
    "Cloud Engineer",
    "Software Engineer",
    "DevOps / Cloud Infrastructure Intern",
  ],
  links: [
    { label: "GitHub", href: "https://github.com/chickenjazz" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jrmanuzon/" },
    { label: "Email", href: "mailto:justinmanuzon413@gmail.com" },
  ],
  email: "justinmanuzon413@gmail.com",
  // Public GitHub username (not rendered on the page at the moment).
  github: "chickenjazz",
  phone: { label: "+63 915 312 9975", href: "tel:+639153129975" },
  mascot: "Holographic Cube Chick",
};
export const education = {
  institution: "FEU Institute of Technology",
  degree: "Bachelor of Science in Computer Science",
  specialization: "Software Engineering",
  graduation: "September 2027",
  distinctions: [
    "Top Performing Student (2024–2026)",
    "Dean’s Lister (5 Terms)",
  ],
};
export const projects = [
  {
    id: "promptee",
    shortTitle: "Promptee",
    oneLiner: "Turning rough ideas into clearer AI prompts.",
    keyTechnologies: ["React", "FastAPI", "PyTorch", "QLoRA"],
    title: "Promptee",
    category: "Featured project · Thesis / AI Engineering",
    description:
      "Promptee is a web-based AI prompt optimization system that transforms vague, unstructured, or poorly written prompts into clearer and more effective instructions using multi-criteria heuristic evaluation and transformer fine-tuning.",
    contributions: [
      "Led the development of the thesis system.",
      "Designed the prompt optimization pipeline.",
      "Implemented multi-criteria heuristic scoring.",
      "Worked on QLoRA, supervised fine-tuning, and Direct Preference Optimization (DPO).",
      "Developed the React frontend and FastAPI backend.",
      "Integrated prompt evaluation and rewriting workflows.",
    ],
    technologies: [
      "Python",
      "React",
      "FastAPI",
      "PyTorch",
      "Hugging Face Transformers",
      "QLoRA",
      "LoRA",
      "DPO",
      "PEFT",
      "TRL",
      "spaCy",
      "SentenceTransformers",
      "CUDA",
      "RunPod",
    ],
    results: [
      { label: "Overall Quality", value: "26.23 → 67.08" },
      { label: "Human expert preference win rate", value: "85.33%" },
    ],
    resultNote:
      "These are study-specific evaluation results, not general guarantees of model performance. Thesis documentation will be added when available.",
    missingAssets:
      "Screenshots, GitHub repository, live demo, and thesis documentation to be provided.",
  },
  {
    id: "vertex-7",
    shortTitle: "Vertex 7",
    oneLiner: "A digital home for heavy equipment and construction services.",
    keyTechnologies: ["React", "JavaScript", "CSS", "Vercel"],
    title: "Vertex 7 Heavy Equipment Rentals and Construction Supplies",
    category: "Featured project · Client project",
    description:
      "A responsive brochure website developed for Vertex 7 Heavy Equipment Rentals and Construction Supplies to establish an online presence, showcase available equipment and services, and provide customers with a way to inquire about rentals.",
    contributions: [
      "UI/UX design and frontend development.",
      "Created responsive website layouts.",
      "Implemented reusable components.",
      "Developed Home, About, Machines, Services, Projects, and Contact sections.",
      "Configured SEO metadata and search engine indexing resources.",
      "Deployed the website using Vercel.",
      "Connected the custom domain and configured Google Search Console.",
    ],
    technologies: [
      "React",
      "HTML",
      "CSS",
      "JavaScript",
      "Vercel",
      "DNS and domain configuration",
      "SEO",
      "sitemap.xml",
      "robots.txt",
      "Google Search Console",
    ],
    missingAssets:
      "Live website, screenshots, and GitHub repository (if publicly shareable) to be provided.",
  },
];
export const honors = [
  {
    title: "Top Performing Student",
    issuer: "FEU Institute of Technology",
    year: "2024–2026",
    kind: "Honor",
  },
  {
    title: "Dean’s Lister (5 Terms)",
    issuer: "FEU Institute of Technology",
    year: "2024–2026",
    kind: "Honor",
  },
  {
    title: "PMI Project Management Ready®",
    issuer: "Project Management Institute",
    year: "2026",
    kind: "Certification",
  },
  {
    title: "Information Technology Specialist: Python",
    issuer: "Certiport",
    year: "2025",
    kind: "Certification",
  },
];
export const description = {
  tagline: "Curious by nature. Builder by habit.",
  copy: "I chase the why behind how things work, then turn what I find into software that solves real problems for real people.",
};
export const stats = [
  { value: 5, title: "Dean’s List" },
  { value: 3, title: "Top-Performer Years" },
  {
    value: honors.filter((h) => h.kind === "Certification").length,
    title: "Certifications",
  },
  { value: projects.length, title: "Projects Shipped" },
];
export const aboutStory =
  "I’m fascinated by the little problems people learn to live with. The repetitive tasks, the unnecessary complexity, the things that could simply work better. I enjoy finding ways to make those things easier through thoughtful solutions.";
export const skills = [
  {
    category: "Programming Languages",
    items: ["Python", "JavaScript", "HTML", "CSS"],
  },
  {
    category: "Frontend Development",
    items: [
      "Responsive Layouts",
      "UI/UX Design",
      "Reusable Components",
      "SEO Metadata",
    ],
  },
  {
    category: "Backend Development",
    items: ["REST APIs", "API Integration", "Prompt Evaluation Pipelines"],
  },
  {
    category: "AI & Machine Learning",
    items: [
      "QLoRA / LoRA",
      "Supervised Fine-Tuning",
      "DPO",
      "Prompt Optimization",
      "Heuristic Evaluation",
    ],
  },
  {
    category: "Frameworks & Libraries",
    items: [
      "React",
      "FastAPI",
      "PyTorch",
      "Hugging Face Transformers",
      "PEFT",
      "TRL",
      "spaCy",
      "SentenceTransformers",
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      "Vercel",
      "RunPod",
      "CUDA",
      "Google Search Console",
      "DNS & Domains",
      "GitHub",
    ],
  },
];
export const skillIcons = [
  { name: "Python", icon: "python" },
  { name: "JavaScript", icon: "javascript" },
  { name: "React", icon: "react" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "PyTorch", icon: "pytorch" },
  { name: "Hugging Face", icon: "huggingface" },
  { name: "spaCy", icon: "spacy" },
  { name: "HTML", icon: "html5" },
  { name: "Vercel", icon: "vercel" },
  { name: "CUDA", icon: "nvidia" },
  { name: "GitHub", icon: "github" },
];
export const cta = {
  quote:
    "The best problems hide in plain sight. I like finding them — and building what fixes them.",
  resumeLabel: "View my résumé",
};
export const gallery = [];
export const navSections = [
  { id: "top", label: "Home", inHeader: false },
  { id: "description", label: "Intro", inHeader: false },
  { id: "stats", label: "Highlights", inHeader: false },
  { id: "about", label: "About", inHeader: true },
  { id: "work", label: "Work", inHeader: true },
  { id: "skills", label: "Skills", inHeader: true },
  { id: "honors", label: "Honors", inHeader: true },
  { id: "milestones", label: "Milestones", inHeader: false },
  { id: "contact", label: "Contact", inHeader: true },
];
