# Auto-Refresh Fix Plan for TaskPulse

## Root Cause Analysis

The auto-refresh issue occurs because the project data is not being refetched after edits. Here's the data flow analysis:

### Current Refresh Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│                     FintechDashboard                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ refreshTrigger (for tasks)                                │  │
│  │ - Incremented on task edit/subtask changes              │  │
│  │ - Triggers ProjectTasks to refetch tasks                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ NO refreshProjectsTrigger (missing!)                    │  │
│  │ - Projects only refetch on auth change                  │  │
│  │ - Project edits don't trigger refresh                    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Task Edit Flow (Works Correctly)
1. [`TaskCard.handleSaveTask()`](client/src/experimental/components/TaskCard.jsx:436) → calls `tasksApi.update()`
2. Calls `onTaskUpdate()` callback
3. [`FintechDashboard.handleTaskUpdate()`](client/src/experimental/FintechDashboard.jsx:349) → increments `refreshTrigger`
4. [`ProjectTasks`](client/src/experimental/FintechDashboard.jsx:105) → `useEffect` detects `refreshTrigger` change
5. Calls `refetch()` from [`useTasks`](client/src/hooks/useTasks.js:4) hook
6. Tasks are refetched and UI updates ✅

### Project Edit Flow (Broken)
1. [`KanbanColumn.handleSaveEdit()`](client/src/experimental/components/KanbanColumn.jsx:310) → calls `projectsApi.update()`
2. Calls `onTaskUpdate()` callback (same as task edit)
3. [`FintechDashboard.handleTaskUpdate()`](client/src/experimental/FintechDashboard.jsx:349) → increments `refreshTrigger`
4. **Problem**: `refreshTrigger` only affects tasks, NOT projects
5. [`useProjects`](client/src/hooks/useProjects.js:5) has no refresh trigger mechanism
6. Projects are NOT refetched ❌

## Solution Design

### Approach 1: Add `refreshProjectsTrigger` to FintechDashboard (Recommended)

This mirrors the existing task refresh pattern and maintains consistency.

#### Changes Required:

**1. [`client/src/hooks/useProjects.js`](client/src/hooks/useProjects.js)**
- Add `refreshTrigger` parameter to the hook
- Add `useEffect` to refetch projects when `refreshTrigger` changes

**2. [`client/src/experimental/FintechDashboard.jsx`](client/src/experimental/FintechDashboard.jsx)**
- Add `refreshProjectsTrigger` state
- Update `useProjects()` call to pass `refreshProjectsTrigger`
- Create `handleProjectUpdate()` function to increment `refreshProjectsTrigger`
- Pass `handleProjectUpdate` to `KanbanColumn` via `ProjectTasks`

**3. [`client/src/experimental/FintechDashboard.jsx`](client/src/experimental/FintechDashboard.jsx) - ProjectTasks component**
- Add `onProjectUpdate` prop
- Pass it down to `KanbanColumn`

**4. [`client/src/experimental/components/KanbanColumn.jsx`](client/src/experimental/components/KanbanColumn.jsx)**
- Add `onProjectUpdate` prop
- Call `onProjectUpdate()` instead of `onTaskUpdate()` in `handleSaveEdit()`

### Alternative Approach: Use `refetch` function directly

Instead of a trigger state, pass the `refetch` function directly from `useProjects` to components that need it.

**Pros**: More explicit, less state
**Cons**: Requires more prop drilling, less consistent with task pattern

## Implementation Plan (Recommended Approach)

### Step 1: Update [`useProjects`](client/src/hooks/useProjects.js) hook

```javascript
// Add refreshTrigger parameter
export function useProjects(refreshTrigger = 0) {
  // ... existing code ...

  // Add useEffect to refetch when refreshTrigger changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, refreshTrigger]); // Add refreshTrigger dependency

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
```

### Step 2: Update [`FintechDashboard`](client/src/experimental/FintechDashboard.jsx)

```javascript
// Add refreshProjectsTrigger state
const [refreshProjectsTrigger, setRefreshProjectsTrigger] = useState(0);

// Update useProjects call
const { projects, loading: projectsLoading } = useProjects(refreshProjectsTrigger);

// Add handleProjectUpdate function
const handleProjectUpdate = () => {
  setRefreshProjectsTrigger(prev => prev + 1);
};

// Update ProjectTasks render
projects.map(project => (
  <ProjectTasks
    key={project.id}
    project={project}
    isDark={isDark}
    filters={filters}
    userId={user?.id}
    onNewTask={handleNewTask}
    onTaskUpdate={handleTaskUpdate}
    onProjectUpdate={handleProjectUpdate}  // Add this
    refreshTrigger={refreshTrigger}
    onSelectTaskForSubtask={handleSelectTaskForSubtask}
  />
))
```

### Step 3: Update [`ProjectTasks`](client/src/experimental/FintechDashboard.jsx) component signature

```javascript
function ProjectTasks({ project, isDark, filters, userId, onNewTask, onTaskUpdate, onProjectUpdate, refreshTrigger, onSelectTaskForSubtask }) {
  // ... existing code ...

  return (
    <KanbanColumn
      project={project}
      tasks={filteredTasks}
      isDark={isDark}
      onNewTask={onNewTask}
      onTaskUpdate={onTaskUpdate}
      onProjectUpdate={onProjectUpdate}  // Add this
      onSelectTaskForSubtask={onSelectTaskForSubtask}
    />
  );
}
```

### Step 4: Update [`KanbanColumn`](client/src/experimental/components/KanbanColumn.jsx)

```javascript
// Add onProjectUpdate prop
export function KanbanColumn({ 
  project, 
  tasks = [], 
  isDark = false, 
  onNewTask,
  onTaskUpdate,
  onProjectUpdate,  // Add this
  onSelectTaskForSubtask
}) {
  // ... existing code ...

  const handleSaveEdit = async () => {
    try {
      await projectsApi.update(editingProject.id, {
        name: editForm.name,
        description: editForm.description,
      });
      setEditingProject(null);
      setEditForm({ name: '', description: '' });
      // Use onProjectUpdate instead of onTaskUpdate
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };
}
```

## Summary

| File | Change |
|------|--------|
| [`client/src/hooks/useProjects.js`](client/src/hooks/useProjects.js) | Add `refreshTrigger` parameter and useEffect |
| [`client/src/experimental/FintechDashboard.jsx`](client/src/experimental/FintechDashboard.jsx) | Add `refreshProjectsTrigger` state and `handleProjectUpdate` function |
| [`client/src/experimental/FintechDashboard.jsx`](client/src/experimental/FintechDashboard.jsx) | Update `ProjectTasks` props to include `onProjectUpdate` |
| [`client/src/experimental/components/KanbanColumn.jsx`](client/src/experimental/components/KanbanColumn.jsx) | Add `onProjectUpdate` prop and use it in `handleSaveEdit` |

This fix ensures that when a project is edited, the projects list is refetched and the UI updates automatically, matching the behavior of task edits.
