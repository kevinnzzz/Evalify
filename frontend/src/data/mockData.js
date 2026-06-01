// Mock data for Evalify frontend demo

export const mockUser = {
  id: 1,
  fullName: 'Alex Johnson',
  username: 'alexjohnson',
  email: 'alex@example.com',
  role: 'Job Seeker',
  avatar: null,
}

export const mockStats = [
  { label: 'CV Reviews', value: 12, change: '+3', trend: 'up', color: 'blue' },
  { label: 'Interviews Done', value: 7, change: '+2', trend: 'up', color: 'green' },
  { label: 'Avg CV Score', value: '82%', change: '+5%', trend: 'up', color: 'purple' },
  { label: 'Avg Interview Score', value: '74%', change: '+8%', trend: 'up', color: 'orange' },
]

export const mockActivities = [
  { id: 1, type: 'cv', title: 'CV Review Completed', desc: 'Frontend Developer CV scored 85/100', time: '2 hours ago', score: 85 },
  { id: 2, type: 'interview', title: 'Mock Interview Done', desc: 'UI/UX Designer – 78/100', time: '1 day ago', score: 78 },
  { id: 3, type: 'cv', title: 'CV Review Completed', desc: 'Product Manager CV scored 79/100', time: '2 days ago', score: 79 },
  { id: 4, type: 'interview', title: 'Mock Interview Done', desc: 'Backend Developer – 69/100', time: '4 days ago', score: 69 },
  { id: 5, type: 'cv', title: 'CV Review Completed', desc: 'Data Analyst CV scored 91/100', time: '1 week ago', score: 91 },
]

export const mockChartData = [
  { name: 'Mon', cv: 65, interview: 70 },
  { name: 'Tue', cv: 72, interview: 68 },
  { name: 'Wed', cv: 78, interview: 75 },
  { name: 'Thu', cv: 74, interview: 80 },
  { name: 'Fri', cv: 85, interview: 78 },
  { name: 'Sat', cv: 82, interview: 85 },
  { name: 'Sun', cv: 89, interview: 82 },
]

export const mockCVResult = {
  overallScore: 85,
  overallAnalysis:
    'Your CV is well-structured and highlights relevant experience. The use of action verbs and quantifiable achievements stands out. Some sections could benefit from more specificity regarding technical skills and project outcomes.',
  cvJobMatch: {
    score: 78,
    matched: ['React.js', 'TypeScript', 'REST APIs', 'Agile', 'Team Collaboration'],
    missing: ['Docker', 'AWS', 'GraphQL'],
    summary:
      'Your CV matches 78% of typical job requirements for this role. Focus on adding cloud and containerization skills to boost your match rate.',
  },
  recommendation: [
    'Add quantifiable achievements to each work experience entry (e.g., "Reduced load time by 40%").',
    'Include a concise professional summary at the top of your CV.',
    'Highlight any open-source contributions or personal projects.',
    'Consider adding certifications relevant to your target role.',
    'Ensure consistent formatting and font usage throughout the document.',
  ],
  strengths: ['Clear structure', 'Good use of keywords', 'Relevant experience highlighted'],
  weaknesses: ['Missing measurable outcomes', 'No certifications listed', 'Skills section too brief'],
}

export const mockInterviewResult = {
  role: 'Frontend Developer',
  overallScore: 74,
  overallAnalysis:
    'You demonstrated solid technical knowledge with clear communication. Your answers were structured but could benefit from more specific examples using the STAR method. You showed good problem-solving ability and enthusiasm for the role.',
  strengths: [
    'Strong technical vocabulary and knowledge',
    'Clear communication style',
    'Good understanding of frontend fundamentals',
    'Enthusiasm and motivation clearly visible',
  ],
  improvements: [
    'Use the STAR method more consistently when answering behavioral questions',
    'Provide more quantifiable examples from past experience',
    'Work on reducing filler words ("um", "like") under pressure',
    'Prepare stronger answers for "weakness" and "conflict" questions',
  ],
  recommendation:
    'You are on the right track. Practice 2–3 mock interviews focusing on behavioral questions. Research the company culture before your real interview and prepare 5 thoughtful questions to ask the interviewer. With targeted practice, you should be well-prepared within 2 weeks.',
}

export const mockInterviewQuestions = [
  'Tell me about yourself and why you are interested in this role.',
  'What is your experience with React.js and modern frontend development?',
  'Describe a challenging project you worked on and how you handled it.',
  'How do you ensure your code is maintainable and scalable?',
  'Where do you see yourself in 5 years?',
]

// ─── Mock Roles (akan diganti dari database nanti) ────────────────────────────
export const mockRoles = [
  // Engineering & Development
  { id: 1, name: 'Frontend Developer', category: 'Engineering' },
  { id: 2, name: 'Backend Developer', category: 'Engineering' },
  { id: 3, name: 'Full Stack Developer', category: 'Engineering' },
  { id: 4, name: 'Mobile Developer', category: 'Engineering' },
  { id: 5, name: 'DevOps Engineer', category: 'Engineering' },
  { id: 6, name: 'Data Engineer', category: 'Engineering' },
  { id: 7, name: 'Machine Learning Engineer', category: 'Engineering' },
  { id: 8, name: 'QA Engineer', category: 'Engineering' },
  { id: 9, name: 'Embedded Systems Engineer', category: 'Engineering' },
  { id: 10, name: 'Cloud Engineer', category: 'Engineering' },
  { id: 11, name: 'Cyber Security Engineer', category: 'Engineering' },
  { id: 12, name: 'Game Developer', category: 'Engineering' },

  // Design
  { id: 13, name: 'UI/UX Designer', category: 'Design' },
  { id: 14, name: 'Graphic Designer', category: 'Design' },
  { id: 15, name: 'Product Designer', category: 'Design' },
  { id: 16, name: 'Motion Designer', category: 'Design' },

  // Data & Analytics
  { id: 17, name: 'Data Analyst', category: 'Data & Analytics' },
  { id: 18, name: 'Data Scientist', category: 'Data & Analytics' },
  { id: 19, name: 'Business Intelligence Analyst', category: 'Data & Analytics' },

  // Product & Management
  { id: 20, name: 'Product Manager', category: 'Product & Management' },
  { id: 21, name: 'Project Manager', category: 'Product & Management' },
  { id: 22, name: 'Scrum Master', category: 'Product & Management' },
  { id: 23, name: 'Engineering Manager', category: 'Product & Management' },

  // Marketing & Business
  { id: 24, name: 'Digital Marketing Specialist', category: 'Marketing & Business' },
  { id: 25, name: 'Content Writer', category: 'Marketing & Business' },
  { id: 26, name: 'SEO Specialist', category: 'Marketing & Business' },
  { id: 27, name: 'Business Development', category: 'Marketing & Business' },
  { id: 28, name: 'Sales Executive', category: 'Marketing & Business' },
  { id: 29, name: 'Social Media Manager', category: 'Marketing & Business' },

  // Human Resources
  { id: 30, name: 'HR Generalist', category: 'Human Resources' },
  { id: 31, name: 'Recruiter', category: 'Human Resources' },
  { id: 32, name: 'HR Manager', category: 'Human Resources' },

  // Finance & Accounting
  { id: 33, name: 'Accountant', category: 'Finance & Accounting' },
  { id: 34, name: 'Financial Analyst', category: 'Finance & Accounting' },
  { id: 35, name: 'Auditor', category: 'Finance & Accounting' },

  // Operations & Others
  { id: 36, name: 'Customer Support', category: 'Operations' },
  { id: 37, name: 'Technical Writer', category: 'Operations' },
  { id: 38, name: 'System Administrator', category: 'Operations' },
  { id: 39, name: 'Network Engineer', category: 'Operations' },
  { id: 40, name: 'IT Support', category: 'Operations' },
]
