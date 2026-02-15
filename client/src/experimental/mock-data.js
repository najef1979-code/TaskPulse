/**
 * Mock data for the experimental fintech dashboard
 */

export const mockTasks = {
  pending: [
    {
      id: 1,
      title: 'Design system documentation',
      description: 'Create comprehensive documentation for the design system including components, tokens, and usage guidelines.',
      status: 'pending',
      priority: 'high',
      duration: '2h',
      comments: 3,
    },
    {
      id: 2,
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline for the new project.',
      status: 'pending',
      priority: 'medium',
      duration: '1h',
      comments: 1,
    },
    {
      id: 3,
      title: 'User research interviews',
      description: 'Conduct 5 user interviews to gather feedback on the current prototype.',
      status: 'pending',
      priority: 'low',
      duration: '4h',
      comments: 0,
    },
  ],
  'in-progress': [
    {
      id: 4,
      title: 'Implement authentication flow',
      description: 'Build OAuth2 integration with Google and GitHub providers.',
      status: 'in-progress',
      priority: 'high',
      duration: '6h',
      comments: 8,
    },
    {
      id: 5,
      title: 'Database schema optimization',
      description: 'Refactor database queries and add proper indexes for better performance.',
      status: 'in-progress',
      priority: 'medium',
      duration: '3h',
      comments: 4,
    },
    {
      id: 6,
      title: 'API rate limiting',
      description: 'Implement rate limiting for all public API endpoints to prevent abuse.',
      status: 'in-progress',
      priority: 'medium',
      duration: '2h',
      comments: 2,
    },
  ],
  done: [
    {
      id: 7,
      title: 'Setup project structure',
      description: 'Initialize monorepo with separate frontend and backend packages.',
      status: 'done',
      priority: 'high',
      duration: '1h',
      comments: 0,
    },
    {
      id: 8,
      title: 'Design system tokens',
      description: 'Create color palette, typography scale, and spacing tokens.',
      status: 'done',
      priority: 'high',
      duration: '4h',
      comments: 5,
    },
    {
      id: 9,
      title: 'Environment configuration',
      description: 'Setup development, staging, and production environment variables.',
      status: 'done',
      priority: 'medium',
      duration: '1h',
      comments: 1,
    },
  ],
};

export const mockColumns = [
  { id: 'pending', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];