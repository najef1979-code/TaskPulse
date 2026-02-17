import { useState, useEffect, useRef, useCallback } from 'react';
import { tasksApi } from '../services/api';

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentProjectIdRef = useRef(projectId);

  // Memoize fetchTasks to prevent infinite loops
  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Store the current projectId this request is for
    const requestProjectId = projectId;
    currentProjectIdRef.current = projectId;
    let isAuthenticated401 = false;

    try {
      setLoading(true);
      const data = await tasksApi.getAll({ projectId: requestProjectId });
      
      // Check for 401 response (API returns { success: false, error: 'Unauthorized' })
      if (data && data.success === false && data.error === 'Unauthorized') {
        isAuthenticated401 = true;
        setLoading(false);
        return; // API layer will handle logout
      }
      
      // Only update state if this request is still for the current project
      // This prevents race conditions when rapidly switching projects
      if (requestProjectId === currentProjectIdRef.current) {
        setTasks(data);
        setError(null);
      }
      setLoading(false);
    } catch (err) {
      // Only update error state for non-401 errors (401 is handled by API layer)
      // This prevents infinite loops when authentication fails
      if (requestProjectId === currentProjectIdRef.current && !isAuthenticated401) {
        // For 401 errors, let the API layer handle logout and don't update any state
        // This prevents re-render loops
        if (!err.message?.includes('401') && !err.message?.includes('Unauthorized')) {
          setError(err.message);
          setLoading(false);
        }
        // For 401, don't update state - let API layer's logout handler handle it
        // Loading will stay true until logout redirects or component unmounts
      }
    }
  }, [projectId]);

  const createTask = async (taskData) => {
    try {
      const newTask = await tasksApi.create({ ...taskData, projectId });
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      let updatedTask;
      if (newStatus === 'in-progress') {
        updatedTask = await tasksApi.start(id);
      } else if (newStatus === 'done') {
        updatedTask = await tasksApi.complete(id);
      } else if (newStatus === 'pending') {
        updatedTask = await tasksApi.reopen(id);
      } else {
        updatedTask = await tasksApi.update(id, { status: newStatus });
      }
      
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksApi.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignTask = async (id, assignedTo) => {
    try {
      const updatedTask = await tasksApi.assign(id, assignedTo);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
    assignTask,
    refetch: fetchTasks,
  };
}
