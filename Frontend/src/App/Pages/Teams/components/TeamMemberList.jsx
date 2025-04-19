import { useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../../../api';

const TeamMemberList = ({ 
  teamId, 
  teamMembers, 
  currentTeam, 
  loading, 
  addTeamMember, 
  removeTeamMember, 
  updateMemberRole 
}) => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [permissions, setPermissions] = useState({
    canAddProjects: false,
    canRemoveProjects: false,
    canViewAllProjects: true
  });

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]);
      
      const response = await userService.searchUsers(searchQuery);
      
      // Filter out users who are already team members
      const filteredResults = response.data.filter(user => 
        !teamMembers.some(member => 
          member.user && member.user._id === user._id || 
          member._id === user._id
        )
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        toast.info('No new users found with that query');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Unable to search for users. Please try again later.');
      toast.error('Error searching for users');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle keyboard enter on the search field
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchUsers();
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user to add');
      return;
    }

    try {
      await addTeamMember(teamId, {
        userId: selectedUserId,
        role: selectedRole
      });
      setShowAddMemberForm(false);
      setSearchResults([]);
      setSearchQuery('');
      setSelectedUserId('');
      setSelectedRole('member');
      toast.success('Team member added successfully');
    } catch (err) {
      toast.error('Failed to add team member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await removeTeamMember(teamId, userId);
        toast.success('Member removed successfully');
      } catch (err) {
        toast.error('Failed to remove team member');
      }
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      await updateMemberRole(teamId, userId, { role: newRole });
      toast.success('Member role updated');
    } catch (err) {
      toast.error('Failed to update member role');
    }
  };

  const openPermissionsModal = (member) => {
    setSelectedMember(member);
    setPermissions({
      canAddProjects: member.permissions?.canAddProjects || false,
      canRemoveProjects: member.permissions?.canRemoveProjects || false,
      canViewAllProjects: member.permissions?.canViewAllProjects || true
    });
    setShowPermissionsModal(true);
  };

  const handleUpdatePermissions = async () => {
    try {
      await updateMemberRole(teamId, selectedMember._id, { 
        permissions: permissions 
      });
      setShowPermissionsModal(false);
      toast.success('Member permissions updated');
    } catch (err) {
      toast.error('Failed to update member permissions');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
        {teamMembers.length < currentTeam.maxMembers && (
          <button
            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {showAddMemberForm ? 'Cancel' : 'Add Member'}
          </button>
        )}
      </div>

      {showAddMemberForm && (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchQuery">
              Search Users
            </label>
            <div className="flex">
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search by name or email"
              />
              <button
                type="button"
                onClick={handleSearchUsers}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchError && (
              <p className="text-red-500 text-xs italic mt-2">{searchError}</p>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="selectedUser">
                Select User
              </label>
              <select
                id="selectedUser"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Select a user --</option>
                {searchResults.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedUserId && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddMember}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={!selectedUserId || loading}
            >
              {loading ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          {teamMembers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No members in this team yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <div key={member._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-800 font-semibold">
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => openPermissionsModal(member)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Permissions
                    </button>
                    <div>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member._id, e.target.value)}
                        className="text-sm rounded border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove member"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Permissions for {selectedMember.name}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Can add projects to team
                </label>
                <input
                  type="checkbox"
                  checked={permissions.canAddProjects}
                  onChange={(e) => setPermissions(prev => ({ ...prev, canAddProjects: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Can remove projects from team
                </label>
                <input
                  type="checkbox"
                  checked={permissions.canRemoveProjects}
                  onChange={(e) => setPermissions(prev => ({ ...prev, canRemoveProjects: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Can view all team projects
                </label>
                <input
                  type="checkbox"
                  checked={permissions.canViewAllProjects}
                  onChange={(e) => setPermissions(prev => ({ ...prev, canViewAllProjects: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberList;