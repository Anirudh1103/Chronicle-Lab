export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'history' | 'technology' | 'cybersecurity';
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  Mughal: {
    term: 'Mughal',
    definition: 'An early-modern empire in South Asia that ruled most of Hindustan (modern India/Pakistan) from the early 16th to the mid-19th century, famous for its military power, administrative systems, and architectural monuments.',
    category: 'history'
  },
  Deccan: {
    term: 'Deccan',
    definition: 'A large plateau in western and southern India. Historically, a vital geostrategic region contested heavily between the northern empires and the southern sultanates.',
    category: 'history'
  },
  Shivaji: {
    term: 'Shivaji',
    definition: 'Chhatrapati Shivaji Maharaj (1630–1680), the legendary founder of the Maratha Empire, pioneer of Hindavi Swarajya, master of naval doctrine, and guerrilla warfare strategist.',
    category: 'history'
  },
  Swarajya: {
    term: 'Swarajya',
    definition: 'Self-rule or complete independence. A concept championed by Shivaji Maharaj to define establishing a sovereign, self-governing homeland free from external imperial domination.',
    category: 'history'
  },
  AOSP: {
    term: 'AOSP',
    definition: 'Android Open Source Project. The open-source software stack maintained by Google, allowing hardware manufacturers and developers to customize and build custom operating system variants.',
    category: 'technology'
  },
  Prisma: {
    term: 'Prisma',
    definition: 'A modern, developer-friendly Node.js and TypeScript ORM (Object-Relational Mapper) that makes querying databases safe and easy via auto-generated types.',
    category: 'technology'
  },
  Supabase: {
    term: 'Supabase',
    definition: 'An open-source Firebase alternative providing a real-time Postgres database, user authentication, RLS policy management, and instant secure APIs.',
    category: 'technology'
  },
  Vite: {
    term: 'Vite',
    definition: 'A next-generation frontend build tool that offers extremely fast hot module replacement (HMR) and optimized production bundles.',
    category: 'technology'
  },
  TypeScript: {
    term: 'TypeScript',
    definition: 'A strongly typed programming language developed by Microsoft that builds on JavaScript by adding static type definitions.',
    category: 'technology'
  },
  Resend: {
    term: 'Resend',
    definition: 'A modern, developer-first email sending service with REST APIs, designed for high deliverability, analytics, and responsive rendering.',
    category: 'technology'
  },
  API: {
    term: 'API',
    definition: 'Application Programming Interface. A secure protocol enabling different software applications to communicate and transfer data between client and server.',
    category: 'technology'
  },
  'Double Opt-in': {
    term: 'Double Opt-in',
    definition: 'A secure two-step subscription verification mechanism where users receive a unique token email link to confirm their subscription status before being added as active.',
    category: 'cybersecurity'
  },
  RLS: {
    term: 'RLS',
    definition: 'Row-Level Security. A database security mechanism in PostgreSQL that restricts which database rows are returned or modified based on the executing user\'s credentials.',
    category: 'cybersecurity'
  },
  SQL: {
    term: 'SQL',
    definition: 'Structured Query Language. The standard domain-specific language used for managing, querying, and updating relational databases.',
    category: 'technology'
  },
  'SHA-256': {
    term: 'SHA-256',
    definition: 'Secure Hash Algorithm 256-bit. A cryptographically secure hashing algorithm that converts inputs into a fixed 256-bit signature, widely used for hashing tokens and passwords.',
    category: 'cybersecurity'
  },
  'Rate Limiting': {
    term: 'Rate Limiting',
    definition: 'A defense mechanism that controls the rate of incoming requests to a server, preventing resource abuse, spam submissions, or brute-force attacks.',
    category: 'cybersecurity'
  }
};
