import React from 'react';

const ProjectSummary = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No projects available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project._id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-900">{project.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : project.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{project.description?.substring(0, 100) || 'No description'}{project.description?.length > 100 ? '...' : ''}</p>
          
          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <div>
              <span className="font-medium">Start:</span> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
            </div>
            <div>
              <span className="font-medium">Deadline:</span> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectSummary;