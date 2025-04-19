import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '../../Context/TeamContext';
import toast from 'react-hot-toast';
import TeamForm from './components/TeamForm';
import TeamMemberList from './components/TeamMemberList';
import TeamPermissions from './components/TeamPermissions';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { 
    currentTeam, 
    teamMembers, 
    teamPermissions,
    loading, 
    error, 
    fetchTeamById, 
    fetchTeamMembers,
    fetchTeamPermissions,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    updateTeamPermissions
  } = useTeam();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionsError, setPermissionsError] = useState(null);

  // Fetch team details when component mounts or teamId changes
  useEffect(() => {
    if (teamId) {
      fetchTeamById(teamId);
      fetchTeamMembers(teamId);
    }
  }, [teamId, fetchTeamById, fetchTeamMembers]);

  // Fetch permissions only when the permissions tab is selected
  useEffect(() => {
    if (activeTab === 'permissions' && teamId) {
      const getPermissions = async () => {
        try {
          setPermissionsError(null);
          await fetchTeamPermissions(teamId);
        } catch (err) {
          console.error('Failed to fetch permissions:', err);
          setPermissionsError('Unable to load permissions');
        }
      };
      
      getPermissions();
    }
  }, [activeTab, teamId, fetchTeamPermissions]);

  const handleUpdateTeam = async (formData) => {
    try {
      await updateTeam(teamId, formData);
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

  if (loading && !currentTeam) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !currentTeam) {
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
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Team</h2>
              <TeamForm 
                initialData={currentTeam}
                onSubmit={handleUpdateTeam}
                onCancel={() => setIsEditing(false)}
                isLoading={loading}
                submitButtonText="Save Changes"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Projects
          </button>
        </nav>
      </div>

      {/* Tabs Content */}
      {activeTab === 'details' && (
        <TeamMemberList 
          teamId={teamId}
          teamMembers={teamMembers}
          currentTeam={currentTeam}
          loading={loading}
          addTeamMember={addTeamMember}
          removeTeamMember={removeTeamMember}
          updateMemberRole={updateMemberRole}
        />
      )}

      {activeTab === 'permissions' && (
        permissionsError ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Warning</p>
            <p>{permissionsError}</p>
          </div>
        ) : (
          <TeamPermissions 
            teamId={teamId}
            permissions={teamPermissions}
            updateTeamPermissions={updateTeamPermissions}
            isLoading={loading}
          />
        )
      )}

      {activeTab === 'projects' && (
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Team Projects</h2>
          <p className="text-gray-500">Project management will be implemented in a future update.</p>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;