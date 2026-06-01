-- ============================================================
--  Evalify – Seed Jobs Data
--  Menyediakan katalog pekerjaan standar berkualitas tinggi
--  Jalankan SETELAH migration 003_create_jobs_table.sql
-- ============================================================

INSERT INTO jobs (
  id,
  job_role,
  job_description,
  role_group,
  role_family,
  required_skills,
  required_tools,
  domains,
  education,
  years_experience,
  responsibilities,
  seniority_level
)
VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Frontend Developer',
  'We are looking for a Frontend Developer to build clean, responsive, and interactive user interfaces. You will collaborate with design and product teams to translate Figma mockups into highly functional code, ensuring optimal web performance and accessibity.',
  'frontend developer',
  'software engineering',
  '["javascript", "typescript", "html", "css", "web development", "responsive design", "performance optimization"]'::JSONB,
  '["react", "next.js", "tailwind css", "figma", "git", "webpack", "npm"]'::JSONB,
  '["e-commerce", "saas", "web systems"]'::JSONB,
  'bachelor degree',
  '2+ years',
  'Develop modern user interfaces, integrate backend APIs, optimize web assets for maximum speed, maintain design system consistency, write unit tests.',
  'mid level'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Backend Developer',
  'Join our team as a Backend Developer to engineer robust, high-performance APIs and microservices. You will design scalable database schemas, manage server integrations, and implement security measures to protect candidate data.',
  'backend developer',
  'software engineering',
  '["python", "java", "sql", "api design", "database management", "microservices", "security"]'::JSONB,
  '["fastapi", "spring boot", "postgresql", "docker", "kubernetes", "git", "redis"]'::JSONB,
  '["cloud computing", "fintech", "enterprise software"]'::JSONB,
  'bachelor degree',
  '3+ years',
  'Design and implement REST APIs, manage relational and NoSQL databases, build background task queues, ensure data security and encryption, collaborate with frontend team.',
  'mid level'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Data Scientist',
  'We are seeking a Data Scientist to extract actionable insights from complex recruitment and audio datasets. You will develop predictive models, perform statistical analyses, and design algorithms to enhance our AI match scores.',
  'data scientist',
  'data and analytics',
  '["python", "machine learning", "data analysis", "statistics", "data visualization", "deep learning"]'::JSONB,
  '["pandas", "numpy", "scikit-learn", "tensorflow", "jupyter", "tableau", "sql server"]'::JSONB,
  '["analytics", "predictive modeling", "recruitment analytics"]'::JSONB,
  'master degree',
  '2+ years',
  'Analyze large datasets to find patterns, build machine learning pipeline prototypes, deploy predictive models, write clear research reports, visualize data insights for business stakeholders.',
  'mid level'
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Mobile Developer',
  'Create amazing mobile applications for iOS and Android. As a Mobile Developer, you will write clean multiplatform code, build interactive layouts, and integrate speech recognition services for live interview sessions.',
  'mobile developer',
  'software engineering',
  '["kotlin", "swift", "mobile development", "api integration", "ui design", "speech recognition"]'::JSONB,
  '["flutter", "android studio", "xcode", "git", "firebase", "react native"]'::JSONB,
  '["mobile applications", "consumer products"]'::JSONB,
  'bachelor degree',
  '2+ years',
  'Build and publish cross-platform mobile apps, optimize application rendering, manage local storage and API synchronization, integrate device audio recorders.',
  'mid level'
),
(
  'c0000000-0000-0000-0000-000000000005',
  'UI/UX Designer',
  'We are hiring a UI/UX Designer to craft premium, modern, and engaging user experiences for Evalify. You will create user flows, wireframes, high-fidelity mockups, and interactive prototypes with a focus on dark mode and micro-animations.',
  'ui/ux designer',
  'design',
  '["ui design", "ux research", "wireframing", "prototyping", "design systems", "user research"]'::JSONB,
  '["figma", "sketch", "miro", "adobe illustrator", "adobe photoshop"]'::JSONB,
  '["product design", "user experience"]'::JSONB,
  'bachelor degree or equivalent',
  '1+ years',
  'Conduct user research and usability testing, design intuitive user flows, build high-fidelity interactive screens, maintain the core design system and components.',
  'junior to mid level'
),
(
  'c0000000-0000-0000-0000-000000000006',
  'Full Stack Developer',
  'Looking for a Full Stack Developer capable of handling both backend API development and modern frontend components. You will maintain full feature lifecycles, configure cloud deployments, and optimize database queries.',
  'full stack developer',
  'software engineering',
  '["javascript", "typescript", "python", "sql", "api design", "web development", "devops"]'::JSONB,
  '["react", "node.js", "fastapi", "postgresql", "docker", "aws", "git"]'::JSONB,
  '["full stack architecture", "saas apps"]'::JSONB,
  'bachelor degree',
  '3+ years',
  'Develop frontend views and integrated backend controllers, optimize full-stack performance, configure docker containers, write unit and end-to-end integration tests.',
  'mid level'
),
(
  'c0000000-0000-0000-0000-000000000007',
  'Machine Learning Engineer',
  'Join us to develop state-of-the-art NLP, speech-to-text, and classification models. You will train custom sequence models (BiLSTM, Transformers), build audio preprocessing pipelines, and deploy models in production environments.',
  'machine learning engineer',
  'artificial intelligence',
  '["python", "machine learning", "deep learning", "natural language processing", "audio preprocessing", "model deployment"]'::JSONB,
  '["tensorflow", "keras", "pytorch", "whisper", "hugging face", "docker", "mlflow"]'::JSONB,
  '["nlp", "speech technologies", "ai models"]'::JSONB,
  'master degree or equivalent experience',
  '3+ years',
  'Develop and fine-tune NLP and speech models, build audio feature extraction pipelines (MFCC, Mel spectrograms), deploy and monitor model API endpoints, optimize inference speed.',
  'senior level'
),
(
  'c0000000-0000-0000-0000-000000000008',
  'DevOps Engineer',
  'We are seeking a DevOps Engineer to automate our cloud infrastructure and CI/CD pipelines. You will manage AWS environments, optimize container orchestration, and ensure high system availability, security, and logging.',
  'devops engineer',
  'infrastructure',
  '["ci/cd", "automation", "infrastructure as code", "cloud architecture", "kubernetes", "network security"]'::JSONB,
  '["docker", "kubernetes", "aws", "terraform", "github actions", "prometheus", "grafana"]'::JSONB,
  '["cloud infrastructure", "mlops", "system reliability"]'::JSONB,
  'bachelor degree',
  '3+ years',
  'Automate application deployments, manage container clusters, write infrastructure-as-code scripts, monitor system performance and health, manage secret keys and user permissions securely.',
  'mid to senior level'
)
ON CONFLICT (job_role) DO UPDATE SET
  job_description = EXCLUDED.job_description,
  role_group = EXCLUDED.role_group,
  role_family = EXCLUDED.role_family,
  required_skills = EXCLUDED.required_skills,
  required_tools = EXCLUDED.required_tools,
  domains = EXCLUDED.domains,
  education = EXCLUDED.education,
  years_experience = EXCLUDED.years_experience,
  responsibilities = EXCLUDED.responsibilities,
  seniority_level = EXCLUDED.seniority_level;
