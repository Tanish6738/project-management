import { createContext, useState, useContext } from 'react';
import timelogService from '../../api/timelogService';

const TimelogContext = createContext();

export const useTimelog = () => useContext(TimelogContext);

export const TimelogProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all time logs for a specific task
  const getTaskTimelogs = async (taskId) => {
    try {
      setLoading(true);
      const response = await timelogService.getTaskTimeLogs(taskId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch task time logs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add time to a task
  const addTimeToTask = async (taskId, timeLogData) => {
    try {
      setLoading(true);
      const response = await timelogService.createTimeEntry(taskId, timeLogData);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to add time log');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a time log entry
  const updateTimelog = async (timelogId, data) => {
    try {
      setLoading(true);
      const response = await timelogService.updateTimeEntry(timelogId, data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update time log');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a time log entry
  const deleteTimelog = async (timelogId) => {
    try {
      setLoading(true);
      const response = await timelogService.deleteTimeEntry(timelogId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to delete time log');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get time logs for a specific user with optional date filters and limit
  const getUserTimelogs = async (startDate, endDate, limit) => {
    try {
      setLoading(true);
      const params = {};
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (limit) params.limit = limit;
      
      // Use the current user's data - we don't need to pass userId
      const response = await timelogService.getUserTimeLogs();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch user time logs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get weekly time logs for a specific user
  const getUserWeeklyTimelogs = async (startDate, endDate) => {
    try {
      setLoading(true);
      const response = await timelogService.getWeeklyReport(null, startDate);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch weekly time logs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get time tracking statistics for a user
  const getUserTimeStats = async () => {
    try {
      setLoading(true);
      const response = await timelogService.getTimeTrackingStats();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch time tracking stats');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get project time report
  const getProjectTimeReport = async (projectId, startDate, endDate, groupBy) => {
    try {
      setLoading(true);
      const params = { groupBy };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await timelogService.getProjectTimeReport(projectId, startDate, endDate);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch project time report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Timer operations
  const startTimer = async (taskId) => {
    try {
      setLoading(true);
      const response = await timelogService.startTimer(taskId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to start timer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async (taskId) => {
    try {
      setLoading(true);
      const response = await timelogService.stopTimer(taskId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to stop timer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pauseTimer = async (taskId) => {
    try {
      setLoading(true);
      const response = await timelogService.pauseTimer(taskId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to pause timer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeTimer = async (taskId) => {
    try {
      setLoading(true);
      const response = await timelogService.resumeTimer(taskId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to resume timer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimelogContext.Provider
      value={{
        loading,
        error,
        getTaskTimelogs,
        addTimeToTask,
        updateTimelog,
        deleteTimelog,
        getUserTimelogs,
        getUserWeeklyTimelogs,
        getUserTimeStats,
        getProjectTimeReport,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer
      }}
    >
      {children}
    </TimelogContext.Provider>
  );
};

export default TimelogContext;