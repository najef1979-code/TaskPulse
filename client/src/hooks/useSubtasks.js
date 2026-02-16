import { useState, useEffect, useRef } from 'react';
import { subtasksApi } from '../services/api';

export function useSubtasks(taskId) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentTaskIdRef = useRef(taskId);

  const fetchSubtasks = async () => {
    if (!taskId) {
      setSubtasks([]);
      setLoading(false);
      return;
    }

    // Store the current taskId this request is for
    const requestTaskId = taskId;
    currentTaskIdRef.current = taskId;

    try {
      setLoading(true);
      const data = await subtasksApi.getForTask(requestTaskId);
      
      // Only update state if this request is still for the current task
      // This prevents race conditions when rapidly switching tasks
      if (requestTaskId === currentTaskIdRef.current) {
        setSubtasks(data);
        setError(null);
      }
    } catch (err) {
      // Only update error state if this request is still for the current task
      if (requestTaskId === currentTaskIdRef.current) {
        setError(err.message);
      }
    } finally {
      // Only update loading state if this request is still for the current task
      if (requestTaskId === currentTaskIdRef.current) {
        setLoading(false);
      }
    }
  };

  const createSubtask = async (subtaskData) => {
    try {
      const newSubtask = await subtasksApi.create({ ...subtaskData, taskId });
      setSubtasks([...subtasks, newSubtask]);
      return newSubtask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSubtask = async (id, data) => {
    try {
      const updatedSubtask = await subtasksApi.update(id, data);
      setSubtasks(subtasks.map(s => s.id === id ? updatedSubtask : s));
      return updatedSubtask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSubtask = async (id) => {
    try {
      await subtasksApi.delete(id);
      setSubtasks(subtasks.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const answerSubtask = async (id, selectedOption) => {
    try {
      const updatedSubtask = await subtasksApi.answer(id, selectedOption);
      setSubtasks(subtasks.map(s => s.id === id ? updatedSubtask : s));
      return updatedSubtask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  return {
    subtasks,
    loading,
    error,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    answerSubtask,
    refetch: fetchSubtasks,
  };
}