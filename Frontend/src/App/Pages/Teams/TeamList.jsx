import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTeam } from '../../Context/TeamContext';
import { MagicCard } from '../../Elements/MagicCard';

const TeamList = () => {
  const { teams, loading, error, fetchTeams, createTeam } = useTeam();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    teamType: 'department',
    maxMembers: 10
  });

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({
      ...prev,
      [name]: name === 'maxMembers' ? Number(value) : value
    }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await createTeam(newTeam);
      setNewTeam({
        name: '',
        description: '',
        teamType: 'department',
        maxMembers: 10
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create team:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {showCreateForm ? 'Cancel' : 'Create Team'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
          <form onSubmit={handleCreateTeam}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Team Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newTeam.name}
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
                value={newTeam.description}
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
                  value={newTeam.teamType}
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
                  value={newTeam.maxMembers}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showCreateForm ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <MagicCard 
              key={team._id} 
              className="bg-white shadow-md rounded-md overflow-hidden"
              gradientFrom="rgba(79, 70, 229, 0.2)" 
              gradientTo="rgba(129, 140, 248, 0.2)"
              gradientOpacity={0.1}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-indigo-600 mb-2">{team.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {team.description || 'No description provided'}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Type:</span>
                    <span className="capitalize">{team.teamType}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Members:</span>
                    <span>{team.members?.length || 0} / {team.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(team.createdAt)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {team.projects?.length || 0} projects
                  </span>
                  <Link
                    to={`/teams/${team._id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamList;