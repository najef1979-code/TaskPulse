# Experimental Fintech Dashboard

A modern, calm fintech-style task management dashboard with a clean, premium aesthetic.

## Overview

This experimental dashboard showcases a new design direction for TaskPulse, featuring:

- **Two-color palette system**: Primary (indigo) and secondary (cyan) families
- **Consistent design tokens**: Radius, shadows, spacing, and typography
- **Light and dark modes**: Seamless switching with identical structure
- **Responsive layout**: Adapts from mobile to desktop (xs to 2xl breakpoints)
- **Modular components**: Reusable, isolated UI components
- **Horizontal kanban board**: Smooth scrolling with drag-and-drop support

## Accessing the Dashboard

### Desktop
1. Click on the user menu (top right)
2. Select "Experimental Dashboard" from the menu

### Mobile
1. Tap the bottom navigation bar
2. Select the "Experimental" tab (🎨 icon)

## Features

### Design System

#### Color Palettes
- **Primary (Indigo)**: `#EEF2FF` to `#312E81`
- **Secondary (Cyan)**: `#ECFEFF` to `#164E63`
- **Grayscale (Light)**: `#F9FAFB` to `#111827`
- **Grayscale (Dark)**: `#18181B` to `#FAFAFA`

#### Design Tokens
- **Radius**: 6px (sm), 10px (md), 14px (lg), 20px (xl)
- **Shadows**: Soft in light mode, deeper in dark mode
- **Typography**: 12px to 24px scale with 400-700 weights
- **Transitions**: 150-250ms ease

### Components

#### Sidebar
- Collapsible left navigation
- 72px (collapsed) / 240px (expanded)
- Project sections with expandable items
- Smooth width transitions

#### Header
- Project branding with gradient icon
- Section label (TODAY)
- Task metadata (count, updated time)
- Action buttons (notifications, filters, new task)

#### Kanban Column
- 280-320px width
- Task count badge
- Drop zone for drag-and-drop
- Vertical task cards with consistent spacing

#### Task Card
- Optional gradient media block
- Status badges (To Do, In Progress, Done)
- Priority indicators with colored dots
- Meta information (duration, comments)
- Hover elevation effect

### Responsive Behavior

| Breakpoint | Width | Sidebar | Board | Header |
|------------|-------|---------|-------|--------|
| xs/sm | <768px | Hidden (drawer) | Single column, swipe | Wraps to 2 rows |
| md | 768-1023px | Collapsed icons | 2 columns | Standard |
| lg | 1024-1279px | Expanded with labels | 3-4 columns | Standard |
| xl/2xl | ≥1280px | Fully expanded | All columns | Standard |

## Dark Mode

Toggle between light and dark modes using the floating action button (bottom right):

- **Light mode**: Soft shadows, white surfaces, gray text
- **Dark mode**: Deeper shadows, dark surfaces, bright text

The mode persists only during the current session (for experimental purposes).

## Technical Details

### File Structure
```
client/src/experimental/
├── fintech-tokens.js          # Design tokens and theme system
├── FintechDashboard.jsx        # Main layout component
├── mock-data.js                # Sample tasks for testing
├── components/
│   ├── Badge.jsx               # Status/label badges
│   ├── Button.jsx              # Primary/secondary/ghost buttons
│   ├── Header.jsx              # Top header component
│   ├── Icon.jsx                # SVG icon library
│   ├── KanbanColumn.jsx        # Task column container
│   ├── Sidebar.jsx             # Left navigation sidebar
│   └── TaskCard.jsx           # Individual task card
└── README.md                   # This file
```

### Integration with App.jsx

The experimental dashboard is integrated as a separate view (`currentView === 'experimental'`) accessible from both desktop and mobile navigation menus. It uses its own mock data for demonstration purposes.

## Future Enhancements

Potential improvements for production use:

1. **Real data integration**: Connect to existing task/project APIs
2. **Drag-and-drop functionality**: Full task reordering
3. **State persistence**: Save view preferences (sidebar, dark mode)
4. **Additional views**: Timeline, Gantt, table views
5. **Advanced filtering**: By assignee, priority, due date
6. **Keyboard shortcuts**: Power user productivity features
7. **Animations**: Smooth transitions for all interactions
8. **Accessibility**: Enhanced ARIA labels and keyboard navigation
9. **Performance**: Virtual scrolling for large task lists
10. **Customization**: User-configurable themes and layouts

## Design Philosophy

This dashboard follows these principles:

- **Minimalism**: Clean, uncluttered interface
- **Consistency**: Uniform spacing, colors, and components
- **Premium feel**: Soft shadows, smooth transitions
- **Productivity-focused**: Information density without overwhelm
- **Calm aesthetic**: Not harsh, suitable for extended use

## Testing

To test the dashboard:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3051/`
3. Login or register
4. Access the experimental dashboard via the user menu or mobile navigation
5. Test:
   - Sidebar collapse/expand
   - Dark/light mode toggle
   - Responsive behavior (resize browser)
   - Task card hover effects
   - Column scrolling

## Exit the Dashboard

Click the "Exit" button (bottom left) or navigate back to the main dashboard through the mobile navigation or user menu.

## Notes

- This is an **experimental** feature and uses mock data
- No changes are persisted to the database
- The dashboard is completely independent of the existing TaskPulse codebase
- Feel free to experiment with the design tokens in `fintech-tokens.js`