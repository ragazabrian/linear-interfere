/* ==========================================================================
   Linear x Interfere - State & Data Store
   ========================================================================== */

const INITIAL_DATA = {
  activeView: 'board',
  selectedIssueId: 'DRV-8852',
  soundEnabled: true,
  theme: 'dark',

  issues: [
    {
      id: 'DRV-8852',
      title: 'Faster app launch on iOS startup',
      description: 'Render UI before vehicle_state sync when minimum required state is present, instead of blocking on full refresh during iOS startup.',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Karri',
      assigneeAvatar: 'K',
      team: 'Mobile',
      cycle: 'Cycle 144',
      labels: ['iOS', 'Performance'],
      pr: {
        number: '#4092',
        title: 'Render UI before vehicle_state sync',
        status: 'Draft PR awaiting review',
        filesChanged: 2,
        timeAgo: '2 min ago'
      },
      agentActivity: [
        { author: 'Linear Agent', text: 'Analyzed startup traces: cold launch 1.8s blocked on vehicle_state.', time: '10 min ago' },
        { author: 'Linear Agent', text: 'Generated patch branch karri/drv-8852-faster-app-launch.', time: '2 min ago' }
      ]
    },
    {
      id: 'ENG-2085',
      title: 'Reduce UI flicker during autonomy stream updates',
      description: 'Autonomy status updates trigger rapid re-renders of the top bar widget. Debounce stream updates to 60fps.',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Didier',
      assigneeAvatar: 'D',
      team: 'Core Engine',
      cycle: 'Cycle 144',
      labels: ['Autonomy', 'UI'],
      pr: {
        number: '#4088',
        title: 'Buffer autonomy telemetry frames',
        status: 'Merged to main',
        filesChanged: 4,
        timeAgo: '1 hour ago'
      },
      agentActivity: [
        { author: 'Linear Agent', text: 'Identified 120Hz frame drops on M3 Max. Created reproduction trace.', time: '1 hour ago' }
      ]
    },
    {
      id: 'ENG-924',
      title: 'Upgrade customer triage agent to Claude 3.8 Opus',
      description: 'Switch triage pipelines to Claude 3.8 Opus with reasoning effort=medium for multi-turn customer issue classification.',
      status: 'in-progress',
      priority: 'urgent',
      assignee: 'Tuomas',
      assigneeAvatar: 'T',
      team: 'AI Systems',
      cycle: 'Cycle 144',
      labels: ['AI', 'Infrastructure'],
      pr: {
        number: '#4102',
        title: 'Adopt Claude 3.8 Opus model router',
        status: 'Open PR in review',
        filesChanged: 6,
        timeAgo: '15 min ago'
      },
      agentActivity: [
        { author: 'Claude 3.8 Opus', text: 'Benchmarked 99.4% classification accuracy across 50,000 historical issues.', time: '15 min ago' }
      ]
    },
    {
      id: 'ENG-2092',
      title: 'Reduce startup delay caused by vehicle sync',
      description: 'Decouple network handshake from initial viewport layout paint.',
      status: 'todo',
      priority: 'high',
      assignee: 'Lena',
      assigneeAvatar: 'L',
      team: 'Mobile',
      cycle: 'Cycle 144',
      labels: ['Mobile', 'Perf'],
      pr: null,
      agentActivity: []
    },
    {
      id: 'ENG-926',
      title: 'Remove UI inconsistencies in dark mode drawer',
      description: 'Ensure subtle border token --border-default applies uniformly across modal sheets.',
      status: 'todo',
      priority: 'low',
      assignee: 'Andreas',
      assigneeAvatar: 'A',
      team: 'Design System',
      cycle: 'Cycle 144',
      labels: ['Design', 'Polish'],
      pr: null,
      agentActivity: []
    },
    {
      id: 'ENG-2200',
      title: 'Fix delayed route updates during rerouting',
      description: 'Route recalculation should prioritize current vehicle bearing over previous waypoint cache.',
      status: 'todo',
      priority: 'urgent',
      assignee: 'Karri',
      assigneeAvatar: 'K',
      team: 'Navigation',
      cycle: 'Cycle 144',
      labels: ['Bug', 'Navigation'],
      pr: null,
      agentActivity: []
    },
    {
      id: 'ENG-2074',
      title: 'Clean up deprecated v1 GraphQL endpoints',
      description: 'Decommission legacy REST proxy and redirect client queries to v2 federated schema.',
      status: 'done',
      priority: 'medium',
      assignee: 'Didier',
      assigneeAvatar: 'D',
      team: 'Backend',
      cycle: 'Cycle 143',
      labels: ['API', 'Cleanup'],
      pr: {
        number: '#3984',
        title: 'Remove legacy v1 schemas',
        status: 'Shipped to production',
        filesChanged: 14,
        timeAgo: 'Yesterday'
      },
      agentActivity: [
        { author: 'CI Bot', text: 'Zero deprecation errors detected in production telemetry.', time: 'Yesterday' }
      ]
    },
    {
      id: 'MKT-1028',
      title: 'Export high-res vector assets for Linear 2026 launch',
      description: 'Finalize brand icons, keynote slides, and interactive web showcases.',
      status: 'done',
      priority: 'high',
      assignee: 'Tuomas',
      assigneeAvatar: 'T',
      team: 'Marketing',
      cycle: 'Cycle 143',
      labels: ['Design', 'Launch'],
      pr: null,
      agentActivity: []
    }
  ],

  customers: [
    { name: 'OpenAI', icon: '⚡' },
    { name: 'Vercel', icon: '▲' },
    { name: 'Ramp', icon: '💳' },
    { name: 'Cash App', icon: '🟢' },
    { name: 'Scale AI', icon: '📊' },
    { name: 'Cursor', icon: '✨' },
    { name: 'Retool', icon: '🛠️' },
    { name: 'Substack', icon: '📑' },
    { name: 'Raycast', icon: '🔴' },
    { name: 'Brex', icon: '💼' }
  ],

  commands: [
    { id: 'new-issue', title: 'Create new issue', shortcut: 'C', category: 'Actions', icon: 'plus' },
    { id: 'jump-board', title: 'Go to Active Board', shortcut: 'G B', category: 'Navigation', icon: 'board' },
    { id: 'jump-roadmap', title: 'Go to Roadmaps & Initiatives', shortcut: 'G R', category: 'Navigation', icon: 'roadmap' },
    { id: 'jump-agents', title: 'Open Linear Agents Console', shortcut: 'G A', category: 'Navigation', icon: 'bot' },
    { id: 'jump-changelog', title: 'View The Latest Changelog', shortcut: 'G L', category: 'Navigation', icon: 'sparkles' },
    { id: 'toggle-theme', title: 'Toggle Light / Dark Mode', shortcut: 'T', category: 'Preferences', icon: 'sun-moon' },
    { id: 'toggle-sound', title: 'Toggle Haptic Sound Effects', shortcut: 'S', category: 'Preferences', icon: 'volume' },
    { id: 'copy-link', title: 'Copy Shareable Link to Clipboard', shortcut: '⌘ C', category: 'General', icon: 'link' },
    { id: 'open-github', title: 'View on GitHub Repository', shortcut: 'G H', category: 'External', icon: 'github' }
  ]
};
