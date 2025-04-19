import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../../Context/ProjectContext';

const ProjectProgress = () => {
  const { projects, fetchProjects } = useProject();
  const [loading, setLoading] = useState(true);
  const [topProjects, setTopProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        await fetchProjects();
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects && Array.isArray(projects)) {
      const activeProjects = projects
        .filter(p => p.status === 'active')
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5);
      setTopProjects(activeProjects);
    }
  }, [projects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!topProjects.length) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No active projects found.</p>
        <Link to="/projects/new" className="text-indigo-600 hover:text-indigo-500 mt-2 inline-block">
          Create new project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topProjects.map(project => (
        <div key={project._id} className="border-b border-gray-200 pb-4 last:border-0">
          <Link 
            to={`/projects/${project._id}`}
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            {project.title}
          </Link>
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap w-12">
              {Math.round(project.progress || 0)}%
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <div>{project.metrics?.completedTasks || 0}/{project.metrics?.totalTasks || 0} tasks</div>
            {project.dueDate && (
              <div className={`${isOverdue(project.dueDate) ? 'text-red-500' : ''}`}>
                Due {new Date(project.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <Link 
          to="/projects"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all projects
        </Link>
      </div>
    </div>
  );
};

// Helper function to check if a date is in the past
const isOverdue = (dateStr) => {
  const dueDate = new Date(dateStr);
  const today = new Date();
  return dueDate < today;
};

export default ProjectProgress;