import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const TeamCard = ({ team, className = '' }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`bg-white shadow-md rounded-md overflow-hidden ${className}`}>
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
        <div className="flex justify-between items-center mt-4">
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
    </div>
  );
};

TeamCard.propTypes = {
  team: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    teamType: PropTypes.string.isRequired,
    members: PropTypes.array,
    maxMembers: PropTypes.number.isRequired,
    projects: PropTypes.array,
    createdAt: PropTypes.string
  }).isRequired,
  className: PropTypes.string
};

export default TeamCard;