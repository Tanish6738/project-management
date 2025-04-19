import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const TeamPermissions = ({ 
  teamId, 
  permissions, 
  updateTeamPermissions, 
  isLoading 
}) => {
  const [permissionSettings, setPermissionSettings] = useState({
    memberInvites: {
      adminOnly: true,
      allowMembers: false
    },
    projectManagement: {
      adminOnly: true,
      allowMembers: false
    },
    memberRemoval: {
      adminOnly: true,
      allowMembers: false
    },
    viewStats: {
      adminOnly: false,
      allowMembers: true,
      allowViewers: true
    }
  });

  useEffect(() => {
    if (permissions) {
      setPermissionSettings(permissions);
    }
  }, [permissions]);

  const handleToggle = (category, field) => {
    setPermissionSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      await updateTeamPermissions(teamId, permissionSettings);
      toast.success('Team permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update team permissions');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Team Permissions</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Member Invitations</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Admin-only invites</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="memberInvites-adminOnly" 
                  checked={permissionSettings.memberInvites.adminOnly} 
                  onChange={() => handleToggle('memberInvites', 'adminOnly')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="memberInvites-adminOnly" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.memberInvites.adminOnly ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Allow members to invite</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="memberInvites-allowMembers" 
                  checked={permissionSettings.memberInvites.allowMembers} 
                  onChange={() => handleToggle('memberInvites', 'allowMembers')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="memberInvites-allowMembers" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.memberInvites.allowMembers ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Project Management</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Admin-only projects</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="projectManagement-adminOnly" 
                  checked={permissionSettings.projectManagement.adminOnly} 
                  onChange={() => handleToggle('projectManagement', 'adminOnly')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="projectManagement-adminOnly" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.projectManagement.adminOnly ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Allow members to manage projects</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="projectManagement-allowMembers" 
                  checked={permissionSettings.projectManagement.allowMembers} 
                  onChange={() => handleToggle('projectManagement', 'allowMembers')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="projectManagement-allowMembers" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.projectManagement.allowMembers ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Member Removal</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Admin-only member removal</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="memberRemoval-adminOnly" 
                  checked={permissionSettings.memberRemoval.adminOnly} 
                  onChange={() => handleToggle('memberRemoval', 'adminOnly')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="memberRemoval-adminOnly" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.memberRemoval.adminOnly ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Allow members to remove others</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="memberRemoval-allowMembers" 
                  checked={permissionSettings.memberRemoval.allowMembers} 
                  onChange={() => handleToggle('memberRemoval', 'allowMembers')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="memberRemoval-allowMembers" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.memberRemoval.allowMembers ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">View Team Statistics</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Admin-only statistics</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="viewStats-adminOnly" 
                  checked={permissionSettings.viewStats.adminOnly} 
                  onChange={() => handleToggle('viewStats', 'adminOnly')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="viewStats-adminOnly" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.viewStats.adminOnly ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Allow members to view statistics</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="viewStats-allowMembers" 
                  checked={permissionSettings.viewStats.allowMembers} 
                  onChange={() => handleToggle('viewStats', 'allowMembers')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="viewStats-allowMembers" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.viewStats.allowMembers ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Allow viewers to see statistics</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="viewStats-allowViewers" 
                  checked={permissionSettings.viewStats.allowViewers} 
                  onChange={() => handleToggle('viewStats', 'allowViewers')}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="viewStats-allowViewers" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    permissionSettings.viewStats.allowViewers ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleSavePermissions}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #4F46E5;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #4F46E5;
        }
        .toggle-label {
          transition: background-color 0.15s ease-in-out;
        }
      `}</style>
    </div>
  );
};

TeamPermissions.propTypes = {
  teamId: PropTypes.string.isRequired,
  permissions: PropTypes.object,
  updateTeamPermissions: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default TeamPermissions;