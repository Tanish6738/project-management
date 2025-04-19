import React, { useState, useEffect } from 'react';
import { useTask } from '../../Context/TaskContext';

const TeamWorkload = ({ teams = [] }) => {
  const { getTeamTaskStats } = useTask();
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!teams || teams.length === 0) return;
      
      setLoading(true);
      try {
        const statsPromises = teams.map(team => getTeamTaskStats(team._id));
        const stats = await Promise.all(statsPromises);
        
        // Create a map of team ID to stats
        const teamStatsMap = {};
        stats.forEach((stat, index) => {
          if (stat) {
            teamStatsMap[teams[index]._id] = stat;
          }
        });
        
        setTeamStats(teamStatsMap);
      } catch (error) {
        console.error("Error fetching team stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamStats();
  }, [teams, getTeamTaskStats]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No teams found
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {teams.map(team => {
        const stats = teamStats[team._id] || {
          totalTasks: 0,
          completedTasks: 0,
          inProgress: 0,
          overdue: 0
        };
        
        // Calculate completion percentage
        const completionPercentage = stats.totalTasks > 0 
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0;
        
        return (
          <div key={team._id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {team.members?.length || 0} members
              </span>
            </div>
            
            {/* Task stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-blue-50 rounded p-2">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-medium text-blue-600">
                  {stats.totalTasks}
                </div>
              </div>
              
              <div className="bg-green-50 rounded p-2">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-lg font-medium text-green-600">
                  {stats.completedTasks}
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded p-2">
                <div className="text-xs text-gray-500">In Progress</div>
                <div className="text-lg font-medium text-yellow-600">
                  {stats.inProgress}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <div>Progress</div>
              <div>{completionPercentage}%</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            {/* Warning for overdue tasks */}
            {stats.overdue > 0 && (
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamWorkload;