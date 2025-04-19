import { useState, useEffect } from 'react';
import { useTimelog } from '../../Context/TimelogContext';
import { useUser } from '../../Context/UserContext';
import { Link } from 'react-router-dom';

const TimeTrackingWidget = () => {
  const { getUserTimelogs, getUserWeeklyTimelogs } = useTimelog();
  const { currentUser } = useUser();
  const [timeData, setTimeData] = useState({
    todayTotal: 0,
    weeklyTotal: 0,
    weeklyData: {},
    recentTimelogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setLoading(true);
        
        // Get today's date and start of week date
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Format dates for API calls
        const startDateStr = startOfWeek.toISOString().split('T')[0];
        const endDateStr = endOfWeek.toISOString().split('T')[0];
        
        // Fetch user's timelogs for the week
        const weeklyData = await getUserWeeklyTimelogs(startDateStr, endDateStr);
        
        // Fetch recent timelogs
        const recentLogsData = await getUserTimelogs("", "", 5); // Get latest 5 logs
        
        // Calculate today's hours
        const todayStr = today.toISOString().split('T')[0];
        const todaysLogs = weeklyData?.logsByDay?.find(day => day.date === todayStr);
        const todayTotal = todaysLogs ? todaysLogs.totalTime : 0;
        
        // Prepare data for chart (last 7 days)
        const weeklyChartData = {};
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize with zeros for all days of week
        dayNames.forEach((day, index) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + index);
          const dateStr = date.toISOString().split('T')[0];
          weeklyChartData[day] = 0;
          
          // Find if we have data for this day
          const dayData = weeklyData?.logsByDay?.find(d => d.date === dateStr);
          if (dayData) {
            weeklyChartData[day] = Math.round(dayData.totalTime / 60 * 10) / 10; // Convert to hours with 1 decimal
          }
        });
        
        setTimeData({
          todayTotal,
          weeklyTotal: weeklyData?.totalTime || 0,
          weeklyData: weeklyChartData,
          recentTimelogs: recentLogsData?.logs || []
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching time tracking data:", error);
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchTimeData();
    }
  }, [currentUser, getUserTimelogs, getUserWeeklyTimelogs]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Function to format minutes as hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Find the day with maximum hours for scaling the chart
  const maxHours = Math.max(...Object.values(timeData.weeklyData), 1); // At least 1 hour for scaling
  
  return (
    <div>
      {/* Time summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Today</div>
          <div className="text-xl font-semibold text-indigo-600">
            {formatTime(timeData.todayTotal)}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">This Week</div>
          <div className="text-xl font-semibold text-green-600">
            {formatTime(timeData.weeklyTotal)}
          </div>
        </div>
      </div>
      
      {/* Weekly bar chart */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Weekly Overview</div>
        <div className="flex items-end h-36 space-x-2">
          {Object.entries(timeData.weeklyData).map(([day, hours]) => {
            // Calculate bar height as percentage of max hours
            const heightPercentage = maxHours > 0 ? (hours / maxHours) * 100 : 0;
            
            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">
                  {hours > 0 ? hours : ''}
                </div>
                <div 
                  className="w-full bg-indigo-200 rounded-t"
                  style={{ height: `${heightPercentage}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recent time entries */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Recent Time Entries</div>
        {timeData.recentTimelogs.length > 0 ? (
          <div className="space-y-3">
            {timeData.recentTimelogs.map(log => (
              <div key={log._id} className="border-l-2 border-indigo-300 pl-3">
                <div className="flex justify-between">
                  <Link 
                    to={`/tasks/${log.task?._id}`} 
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {log.task?.title || 'Unknown Task'}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {formatTime(log.timeSpent)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{log.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-gray-500">
            No recent time entries
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link 
            to="/time-tracking"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all time entries
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingWidget;