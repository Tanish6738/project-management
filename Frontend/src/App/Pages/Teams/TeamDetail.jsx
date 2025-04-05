import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '../../Context/TeamContext';
import { userService } from '../../../api';
import toast from 'react-hot-toast';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { 
    currentTeam, 
    teamMembers, 
    loading, 
    error, 
    fetchTeamById, 
    fetchTeamMembers,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole
  } = useTeam();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeam, setEditedTeam] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch team details when component mounts or teamId changes
  useEffect(() => {
    if (teamId) {
      fetchTeamById(teamId);
      fetchTeamMembers(teamId);
    }
  }, [teamId, fetchTeamById, fetchTeamMembers]);

  // Update editedTeam when currentTeam changes
  useEffect(() => {
    if (currentTeam) {
      setEditedTeam({
        name: currentTeam.name,
        description: currentTeam.description || '',
        teamType: currentTeam.teamType,
        maxMembers: currentTeam.maxMembers
      });
    }
  }, [currentTeam]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTeam(prev => ({
      ...prev,
      [name]: name === 'maxMembers' ? Number(value) : value
    }));
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      await updateTeam(teamId, editedTeam);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteTeam(teamId);
        navigate('/teams');
        toast.success('Team deleted successfully');
      } catch (err) {
        setIsDeleting(false);
        toast.error('Failed to delete team');
      }
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await userService.searchUsers(searchQuery);
      
      // Filter out users who are already team members
      const filteredResults = response.data.filter(user => 
        !teamMembers.some(member => member._id === user._id)
      );
      
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        toast.info('No new users found with that query');
      }
    } catch (err) {
      toast.error('Error searching for users');
    } finally {
      setIsSearching(false);
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
    } catch (err) {
      toast.error('Failed to add team member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await removeTeamMember(teamId, userId);
      } catch (err) {
        toast.error('Failed to remove team member');
      }
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      await updateMemberRole(teamId, userId, { role: newRole });
    } catch (err) {
      toast.error('Failed to update member role');
    }
  };

  if (loading && !currentTeam) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            className="mt-2 text-indigo-600 underline" 
            onClick={() => navigate('/teams')}
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Team not found</p>
          <button 
            className="mt-2 text-indigo-600 underline" 
            onClick={() => navigate('/teams')}
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/teams')}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </button>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentTeam.name}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Edit Team
                  </button>
                  <button
                    onClick={handleDeleteTeam}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Team'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="capitalize px-2 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {currentTeam.teamType}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{currentTeam.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(currentTeam.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Members:</span>
                      <span>{teamMembers.length} / {currentTeam.maxMembers}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Projects:</span>
                      <span>{currentTeam.projects?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span>{new Date(currentTeam.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateTeam}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Team Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedTeam.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedTeam.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamType">
                    Team Type
                  </label>
                  <select
                    id="teamType"
                    name="teamType"
                    value={editedTeam.teamType}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="department">Department</option>
                    <option value="project">Project</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxMembers">
                    Max Members
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    value={editedTeam.maxMembers}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min={teamMembers.length}
                    max="100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search by name or email"
              />
              <button
                type="button"
                onClick={handleSearchUsers}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
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

      {loading && showAddMemberForm ? (
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
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4">
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
    </div>
  );
};

export default TeamDetail;