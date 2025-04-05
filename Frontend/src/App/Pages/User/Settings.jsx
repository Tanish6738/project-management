import { useState, useEffect } from 'react';
import { useUser } from '../../Context/UserContext';
import { userService } from '../../../api';

const Settings = () => {
  const { user, updatePreferences } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('preferences');
  
  // General user preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    desktopNotifications: true,
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    taskAssigned: true,
    taskUpdated: true,
    taskCompleted: true,
    commentAdded: true,
    projectCreated: true,
    teamUpdates: true,
    dailyDigest: true,
    weeklyDigest: true
  });
  
  // Work hours settings
  const [workHours, setWorkHours] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' }
  });
  
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.preferences
      }));
    }
    
    // Fetch notification settings
    fetchNotificationSettings();
    
    // Fetch work hours
    fetchWorkHours();
  }, [user]);
  
  const fetchNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getNotificationSettings();
      setNotificationSettings(response.data);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWorkHours = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getWorkHours();
      setWorkHours(response.data);
    } catch (err) {
      console.error('Error fetching work hours:', err);
      // Use default work hours if fetching fails
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleWorkHourChange = (day, field, value) => {
    setWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  const savePreferences = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      await updatePreferences(preferences);
      setSuccessMessage('Preferences updated successfully');
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      await userService.updateNotificationSettings(notificationSettings);
      setSuccessMessage('Notification settings updated successfully');
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveWorkHours = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      await userService.setWorkHours(workHours);
      setSuccessMessage('Work hours updated successfully');
    } catch (err) {
      setError('Failed to update work hours');
      console.error('Error updating work hours:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-indigo-600">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        <div className="p-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('workHours')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'workHours'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Work Hours
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
          
          <div className="mt-6">
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      name="timeZone"
                      value={preferences.timeZone}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      name="dateFormat"
                      value={preferences.dateFormat}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      name="timeFormat"
                      value={preferences.timeFormat}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">Receive email notifications for important updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="desktopNotifications"
                        name="desktopNotifications"
                        type="checkbox"
                        checked={preferences.desktopNotifications}
                        onChange={handlePreferenceChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="desktopNotifications" className="font-medium text-gray-700">
                        Desktop Notifications
                      </label>
                      <p className="text-gray-500">Show desktop notifications when in the app</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={savePreferences}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-gray-700">Task Updates</h3>
                  <div className="ml-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="taskAssigned"
                          name="taskAssigned"
                          type="checkbox"
                          checked={notificationSettings.taskAssigned}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="taskAssigned" className="font-medium text-gray-700">
                          Task Assigned
                        </label>
                        <p className="text-gray-500">Notify when a task is assigned to you</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="taskUpdated"
                          name="taskUpdated"
                          type="checkbox"
                          checked={notificationSettings.taskUpdated}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="taskUpdated" className="font-medium text-gray-700">
                          Task Updated
                        </label>
                        <p className="text-gray-500">Notify when a task you're involved with is updated</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="taskCompleted"
                          name="taskCompleted"
                          type="checkbox"
                          checked={notificationSettings.taskCompleted}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="taskCompleted" className="font-medium text-gray-700">
                          Task Completed
                        </label>
                        <p className="text-gray-500">Notify when a task you're involved with is completed</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-700">Comments</h3>
                  <div className="ml-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="commentAdded"
                          name="commentAdded"
                          type="checkbox"
                          checked={notificationSettings.commentAdded}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="commentAdded" className="font-medium text-gray-700">
                          Comment Added
                        </label>
                        <p className="text-gray-500">Notify when someone comments on your tasks or mentions you</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-700">Projects and Teams</h3>
                  <div className="ml-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="projectCreated"
                          name="projectCreated"
                          type="checkbox"
                          checked={notificationSettings.projectCreated}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="projectCreated" className="font-medium text-gray-700">
                          Project Created
                        </label>
                        <p className="text-gray-500">Notify when a new project is created in your team</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="teamUpdates"
                          name="teamUpdates"
                          type="checkbox"
                          checked={notificationSettings.teamUpdates}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="teamUpdates" className="font-medium text-gray-700">
                          Team Updates
                        </label>
                        <p className="text-gray-500">Notify about team membership changes or announcements</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-700">Summary Emails</h3>
                  <div className="ml-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="dailyDigest"
                          name="dailyDigest"
                          type="checkbox"
                          checked={notificationSettings.dailyDigest}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="dailyDigest" className="font-medium text-gray-700">
                          Daily Digest
                        </label>
                        <p className="text-gray-500">Receive a daily summary of activities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="weeklyDigest"
                          name="weeklyDigest"
                          type="checkbox"
                          checked={notificationSettings.weeklyDigest}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="weeklyDigest" className="font-medium text-gray-700">
                          Weekly Digest
                        </label>
                        <p className="text-gray-500">Receive a weekly summary of activities and upcoming deadlines</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveNotificationSettings}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'workHours' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Work Hours</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Set your working hours to help your team coordinate better with you
                </p>
                
                <div className="space-y-6">
                  {Object.entries(workHours).map(([day, settings]) => (
                    <div key={day} className="flex items-center">
                      <div className="w-1/4">
                        <div className="flex items-center">
                          <input
                            id={`${day}Enabled`}
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => handleWorkHourChange(day, 'enabled', e.target.checked)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day}Enabled`} className="ml-2 text-sm font-medium text-gray-700 capitalize">
                            {day}
                          </label>
                        </div>
                      </div>
                      
                      <div className="w-3/4 flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700">Start Time</label>
                          <input
                            type="time"
                            value={settings.start}
                            onChange={(e) => handleWorkHourChange(day, 'start', e.target.value)}
                            disabled={!settings.enabled}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700">End Time</label>
                          <input
                            type="time"
                            value={settings.end}
                            onChange={(e) => handleWorkHourChange(day, 'end', e.target.value)}
                            disabled={!settings.enabled}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveWorkHours}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Work Hours'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Sessions</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      If you suspect unauthorized access to your account, you can sign out of all other sessions.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Sign Out All Other Sessions
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;