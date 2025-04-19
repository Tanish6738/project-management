import { useState, useEffect } from 'react';
import { useTeam } from '../../Context/TeamContext';
import TeamCard from './components/TeamCard';
import TeamForm from './components/TeamForm';
import { MagicCard } from '../../Elements/MagicCard';

const TeamList = () => {
  const { teams, loading, error, fetchTeams, createTeam } = useTeam();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (formData) => {
    try {
      await createTeam(formData);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create team:', err);
    }
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
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
          <TeamForm 
            onSubmit={handleCreateTeam}
            onCancel={() => setShowCreateForm(false)}
            isLoading={loading}
            submitButtonText="Create Team"
          />
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
              <TeamCard team={team} />
            </MagicCard>
          ))}
          
          {teams.length === 0 && !loading && (
            <div className="col-span-3 py-12 text-center text-gray-500">
              <p className="text-lg mb-4">No teams found</p>
              <p>Click "Create Team" to add your first team.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamList;