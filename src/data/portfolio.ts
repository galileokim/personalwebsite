export const profile = {
  name: 'Galileo Kim',
  email: 'galileokim451@gmail.com',
  github: 'https://github.com/galileokim',
  linkedin: 'https://www.linkedin.com/in/galileo-kim-09a76b288/',
};

export const projects = [
  {
    id: 'liked-semantic-search',
    name: 'YouTube Likes Semantic Search',
    category: 'Search engine',
    date: 'Oct. 2026',
    url: 'https://github.com/galileokim/Liked-Semantic-Search',
    description:
      'A semantic search engine over liked YouTube videos that deep links to the exact timestamp of the matching transcript.',
    technologies: ['Python', 'FastAPI', 'ChromaDB', 'BGE embeddings'],
    notes: [
      'Designed an idempotent ingestion pipeline with local BGE embeddings and a persistent ChromaDB index.',
      'Exposed a FastAPI backend, CLI, and web UI over the same search core.',
      'Added a recall@k and MRR evaluation harness to measure retrieval quality.',
    ],
  },
  {
    id: 'social-time-tracker',
    name: 'Social Time Tracker',
    category: 'iOS + backend',
    date: 'Jul. 2026 – present',
    url: 'https://github.com/galileokim/time-tracker',
    description:
      'An offline-first time tracker for iOS, with Live Activities and Dynamic Island integration.',
    technologies: [
      'SwiftUI',
      'SwiftData',
      'TypeScript',
      'Fastify',
      'PostgreSQL',
      'Redis',
    ],
    notes: [
      'Built persistent app state with SwiftData and surfaced activity through ActivityKit.',
      'Engineered a Fastify REST API with Zod schema validation and JWT authentication.',
      'Paired PostgreSQL relational storage with Redis for low-latency caching.',
    ],
  },
  {
    id: 'exerciselogger',
    name: 'ExerciseLogger',
    category: 'Java application',
    date: 'Mar. 2026',
    url: 'https://github.com/galileokim/Exercise-Logger',
    description:
      'A Java application for tracking exercise, visualizing progress, and saving workout history.',
    technologies: ['Java', 'JUnit', 'JSON'],
    notes: [
      'Designed an object-oriented application for fitness data and progress visualization.',
      'Used test-driven development with JUnit to reach 100% code coverage for model classes.',
      'Added persistent storage to save, load, and modify session history across restarts.',
    ],
  },
  {
    id: 'mailsweep',
    name: 'Mailsweep',
    category: 'Web application',
    date: 'Oct. 2025',
    url: 'https://github.com/AustinBao/MailSweep',
    description:
      'A web application that parses email subscriptions and automates unsubscribe processing.',
    technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Gmail API'],
    notes: [
      'Built automatic ingestion, parsing, and classification of raw HTML email layouts.',
      'Designed a background scanner processing 200+ emails per minute.',
      'Reduced redundant database writes, cutting unsubscribe processing time by 40%.',
    ],
  },
  {
    id: 'suadeai',
    name: 'SuadeAI',
    category: 'Web + mobile',
    date: 'May 2024',
    description:
      'A cross-platform research discovery MVP connecting students with research opportunities.',
    technologies: ['React', 'Java', 'Swift', 'OpenAI API'],
    notes: [
      'Developed a retrieval-augmented generation application MVP that reached 100+ users.',
      'Designed the web interface and contributed to Android UI logic.',
      'Used multi-threading for asynchronous OpenAI API calls to improve response times.',
    ],
  },
] as const;

export const experience = [
  {
    organization: 'University of British Columbia',
    role: 'Undergraduate Teaching Assistant',
    dates: 'Sep. 2026 – present',
    location: 'Vancouver, BC',
    description:
      'Helping 30+ CPSC 110 students through lab sessions, assignment feedback, functional programming, and systematic program design.',
  },
  {
    organization: 'Apple',
    role: 'Business Expert & Product Zone Specialist',
    dates: 'Aug. 2024 – Aug. 2025',
    location: 'Edmonton, AB',
    description:
      'Managed 30+ daily sales calls and customer requirements in Apple’s CRM. Identified business opportunities in retail, generating 130+ business leads in nine months.',
  },
] as const;

export const skills = [
  {
    label: 'Languages',
    items:
      'Java, JavaScript, TypeScript, Python, Swift, Go, PHP, HTML/CSS, SQL',
  },
  {
    label: 'Frameworks',
    items:
      'React, Node.js, Express, Fastify, FastAPI, Next.js, SwiftUI, Laravel, Tailwind CSS',
  },
  {
    label: 'Tools & APIs',
    items:
      'Git, Docker, MongoDB, PostgreSQL, Redis, ChromaDB, OpenAI API, Gmail API',
  },
] as const;
