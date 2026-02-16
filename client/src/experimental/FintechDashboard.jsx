import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanColumn } from './components/KanbanColumn';
import { getTheme, colors, spacing, layout, radius, transition, breakpoints } from './fintech-tokens';
import { TaskModal } from '../components/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { MobileFilterBar } from './components/MobileFilterBar';
import { FiltersBottomSheet } from './components/FiltersBottomSheet';

/**
 * Custom hook for simple mobile detection based on screen width
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}

/**
 * Custom hook for horizontal drag-to-scroll
 */
function useDragToScroll(scrollRef) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, [scrollRef]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft, scrollRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, [scrollRef]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft, scrollRef]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Filter tasks based on filters object
 */
function filterTasks(tasks, filters, userId) {
  if (!tasks || !filters) return tasks;

  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.status?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Assignment filter
    if (filters.assignment === 'assigned') {
      if (!task.assigned_to || task.assigned_to !== userId) return false;
    } else if (filters.assignment === 'unassigned') {
      if (task.assigned_to) return false;
    }

    // Status filter (always apply if selected)
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status?.toLowerCase())) return false;
    }

    // Priority filter (always apply if selected)
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority?.toLowerCase())) return false;
    }

    // Due date filter (only when assignment is not 'all')
    if (filters.assignment !== 'all') {
      if (filters.dueDate?.start || filters.dueDate?.end) {
        if (!task.due_date) return false;
        
        const taskDate = new Date(task.due_date);
        if (filters.dueDate.start) {
          const startDate = new Date(filters.dueDate.start);
          if (taskDate < startDate) return false;
        }
        if (filters.dueDate.end) {
          const endDate = new Date(filters.dueDate.end);
          if (taskDate > endDate) return false;
        }
      }

      // Show overdue only
      if (filters.showOverdue) {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (taskDate >= today) return false;
      }

      // Has subtasks only
      if (filters.hasSubtasks) {
        if (!task.subtasks || task.subtasks.length === 0) return false;
      }
    }

    return true;
  });
}

/**
 * ProjectTasks Component
 * Fetches and filters tasks for a single project
 * Returns null if no tasks match filters (to hide empty columns)
 */
function ProjectTasks({ project, isDark, filters, userId, onNewTask, onTaskUpdate }) {
  const { tasks, loading } = useTasks(project.id);
  
  const filteredTasks = filterTasks(tasks, filters, userId);

  // Hide project column if no tasks match filters
  if (!loading && (!filteredTasks || filteredTasks.length === 0)) {
    return null;
  }

  return (
    <KanbanColumn
      project={project}
      tasks={filteredTasks}
      isDark={isDark}
      onNewTask={onNewTask}
      onTaskUpdate={onTaskUpdate}
    />
  );
}

/**
 * Experimental Fintech Dashboard
 * Project-based kanban layout with comprehensive filters
 */
export function FintechDashboard({ onExit }) {
  const { user } = useAuth();
  // Initialize dark mode from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('fintech-dashboard-darkmode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Simple mobile detection based on screen width
  const isMobileDevice = useIsMobile();
  
  // Drag-to-scroll for board
  const boardRef = useRef(null);
  const { isDragging, handlers: dragHandlers } = useDragToScroll(boardRef);
  
  // Filter state
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('fintech-dashboard-filters');
    return saved ? JSON.parse(saved) : {
      search: '',
      assignment: 'all',
      status: [],
      priority: [],
      dueDate: { start: '', end: '' },
      showOverdue: false,
      hasSubtasks: false,
      // Future: team support
      // team: 'all',
    };
  });

  // Mobile filter sheet state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);

  const { projects, loading: projectsLoading } = useProjects();

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('fintech-dashboard-filters', JSON.stringify(filters));
  }, [filters]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('fintech-dashboard-darkmode', isDark.toString());
  }, [isDark]);

  // Calculate active filter count for badge
  const activeFilterCount = (() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.assignment !== 'all') count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.dueDate.start || filters.dueDate.end) count++;
    if (filters.showOverdue) count++;
    if (filters.hasSubtasks) count++;
    return count;
  })();

  // Determine sidebar state based on device type and viewport
  // Use robust mobile detection to hide sidebar on mobile devices
  const getSidebarState = () => {
    // Hide sidebar completely on mobile devices (detected via UA + touch + screen)
    if (isMobileDevice) return { isCollapsed: true, isHidden: true };
    if (viewportWidth < breakpoints.md) return { isCollapsed: true, isHidden: true };
    if (viewportWidth < breakpoints.lg) return { isCollapsed: true, isHidden: false };
    return { isCollapsed: false, isHidden: false };
  };

  const sidebarState = getSidebarState();
  const theme = getTheme(isDark);

  const mainContentStyles = {
    backgroundColor: theme.background,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: `background-color ${transition.normal}`,
  };

  const headerContainerStyles = {
    paddingLeft: 0,
    transition: `padding-left ${transition.normal}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const boardContainerStyles = {
    flex: 1,
    minHeight: 0,
    overflowX: 'scroll',
    overflowY: 'auto',
    paddingLeft: sidebarState.isHidden ? 0 : isCollapsed ? layout.sidebar.collapsed : layout.sidebar.expanded,
    transition: `padding-left ${transition.normal}`,
    // Add bottom padding on mobile devices for the filter bar
    paddingBottom: isMobileDevice ? '80px' : spacing.xl,
    // Always show horizontal scrollbar
    scrollbarWidth: 'auto',
  };

  const boardStyles = {
    display: 'flex',
    gap: spacing.lg,
    padding: `${spacing.xl} ${spacing.xl} ${spacing.xl} ${spacing.xl}`,
    minHeight: '100%',
    height: 'fit-content',
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewTask = (projectId) => {
    setSelectedProjectForTask(projectId);
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedProjectForTask(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPendingFilters(newFilters);
  };

  const handleFilterSheetOpen = () => {
    setPendingFilters(filters);
    setIsFilterSheetOpen(true);
  };

  const handleFilterSheetClose = () => {
    setIsFilterSheetOpen(false);
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setIsFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      assignment: 'all',
      status: [],
      priority: [],
      dueDate: { start: '', end: '' },
      showOverdue: false,
      hasSubtasks: false,
    };
    setFilters(resetFilters);
    setPendingFilters(resetFilters);
  };

  return (
    <div style={mainContentStyles}>
      {/* Sidebar */}
      {!sidebarState.isHidden && (
        <Sidebar
          isDark={isDark}
          isCollapsed={isCollapsed || sidebarState.isCollapsed}
          onToggle={toggleSidebar}
          viewportWidth={viewportWidth}
          filters={filters}
          onFilterChange={handleFilterChange}
          user={user}
        />
      )}

      {/* Header */}
      <div style={headerContainerStyles}>
        <Header
          projectName="All Projects"
          isDark={isDark}
          isMobile={viewportWidth < breakpoints.md}
          onFilterClick={handleFilterSheetOpen}
        />
      </div>

      {/* Board with drag-to-scroll */}
      <div 
        ref={boardRef}
        style={{ 
          ...boardContainerStyles, 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
        }}
        {...dragHandlers}
      >
        <div style={boardStyles}>
          {projectsLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xl,
              color: isDark ? theme.text.secondary : colors.grayLight[500],
              width: '100%',
            }}>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xl,
              color: isDark ? theme.text.secondary : colors.grayLight[500],
              width: '100%',
            }}>
              No projects found
            </div>
          ) : (
            projects.map(project => (
              <ProjectTasks
                key={project.id}
                project={project}
                isDark={isDark}
                filters={filters}
                userId={user?.id}
                onNewTask={handleNewTask}
                onTaskUpdate={handleTaskUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Mobile Filter Bar */}
      <MobileFilterBar
        onFilterClick={handleFilterSheetOpen}
        activeFilterCount={activeFilterCount}
        isDark={isDark}
        isMobileDevice={isMobileDevice}
      />

      {/* Mobile Filters Bottom Sheet */}
      <FiltersBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={handleFilterSheetClose}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        filters={pendingFilters}
        onFilterChange={setPendingFilters}
        isDark={isDark}
      />

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          position: 'fixed',
          bottom: spacing.lg,
          right: spacing.lg,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[200],
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: `all ${transition.fast}`,
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '24px' }}>
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>

      {/* Exit Button */}
      <button
        onClick={onExit}
        style={{
          position: 'fixed',
          bottom: spacing.lg,
          left: spacing.lg,
          padding: `${spacing.sm} ${spacing.lg}`,
          backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[200],
          border: 'none',
          borderRadius: radius.md,
          color: isDark ? theme.text.primary : colors.grayLight[700],
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: `all ${transition.fast}`,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[300];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[200];
        }}
      >
        ← Exit
      </button>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          projectId={selectedProjectForTask}
        />
      )}
    </div>
  );
}