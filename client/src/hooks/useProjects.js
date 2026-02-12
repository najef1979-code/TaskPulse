import { useState, useEffect } from 'react';
import { projectsApi } from '../services/api';
import { useAuth } from './useAuth';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const fetchProjects = async () => {
    // Don't fetch if not authenticated
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const newProject = await projectsApi.create(projectData);
      setProjects([newProject, ...projects]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Wait for auth to complete before fetching projects
    if (!authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
}