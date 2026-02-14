import { useState, useEffect, useRef } from 'react';
import { tasksApi } from '../services/api';

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentProjectIdRef = useRef(projectId);

  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Store the current projectId this request is for
    const requestProjectId = projectId;
    currentProjectIdRef.current = projectId;

    try {
      setLoading(true);
      const data = await tasksApi.getAll({ projectId: requestProjectId });
      
      // Only update state if this request is still for the current project
      // This prevents race conditions when rapidly switching projects
      if (requestProjectId === currentProjectIdRef.current) {
        setTasks(data);
        setError(null);
      }
    } catch (err) {
      // Only update error state if this request is still for the current project
      if (requestProjectId === currentProjectIdRef.current) {
        setError(err.message);
      }
    } finally {
      // Only update loading state if this request is still for the current project
      if (requestProjectId === currentProjectIdRef.current) {
        setLoading(false);
      }
    }
  };

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
  }, [projectId]);

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
