import TimeLog from '../models/Timelog.modal.js';
import Task from '../models/Task.modal.js';
import Project from '../models/Project.modal.js';
import User from '../models/User.modal.js';
import AuditLog from '../models/AuditLog.modal.js';

// Create a new time log entry
export const createTimeLog = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { timeSpent, description, startTime, endTime, billable } = req.body;

        // Verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to log time
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Users can log time if they are a member of the project, the task assignee, or the project owner
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        );
        const isAssignee = task.assignedTo && task.assignedTo.equals(req.user._id);
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isAssignee && !isOwner) {
            return res.status(403).json({ error: 'Not authorized to log time on this task' });
        }

        // Validate time spent
        if (typeof timeSpent !== 'number' || timeSpent <= 0) {
            return res.status(400).json({ error: 'Time spent must be a positive number' });
        }

        // Create and save the time log entry
        const timeLog = new TimeLog({
            task: taskId,
            user: req.user._id,
            timeSpent,
            description,
            startTime: startTime || new Date(),
            endTime: endTime,
            billable: billable !== undefined ? billable : true,
            status: endTime ? 'completed' : 'active'
        });

        await timeLog.save();

        // Update task's time tracking
        if (!task.timeTracking) {
            task.timeTracking = { estimated: 0, actual: 0, timeSpent: [] };
        }
        
        task.timeTracking.actual = (task.timeTracking.actual || 0) + timeSpent;
        task.timeTracking.timeSpent.push({
            user: req.user._id,
            duration: timeSpent,
            date: startTime || new Date()
        });
        
        await task.save();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'create_time_log',
            targetModel: 'TimeLog',
            targetId: timeLog._id,
            details: { 
                taskId, 
                timeSpent, 
                description: description ? (description.substring(0, 50) + (description.length > 50 ? '...' : '')) : null 
            }
        });
        await auditLog.save();

        // Populate user data
        const populatedTimeLog = await TimeLog.findById(timeLog._id)
            .populate('user', 'name email avatar');

        res.status(201).json(populatedTimeLog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all time logs for a task
export const getTaskTimeLogs = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        // Verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to view the task
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        );
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isOwner) {
            return res.status(403).json({ error: 'Not authorized to view time logs for this task' });
        }

        // Get time logs with user data
        const timeLogs = await TimeLog.find({ task: taskId })
            .populate('user', 'name email avatar')
            .sort({ startTime: -1 });

        // Calculate total time
        const totalTime = timeLogs.reduce((sum, log) => sum + log.timeSpent, 0);

        res.json({
            logs: timeLogs,
            totalTime,
            count: timeLogs.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get time logs for current user across all tasks
export const getUserTimeLogs = async (req, res) => {
    try {
        const { startDate, endDate, projectId } = req.query;
        const query = { user: req.user._id };
        
        // Filter by date range if provided
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        // If projectId is provided, filter by project
        if (projectId) {
            // Find all tasks in the project
            const tasks = await Task.find({ project: projectId });
            if (tasks.length > 0) {
                query.task = { $in: tasks.map(t => t._id) };
            } else {
                // If no tasks found in project, return empty results
                return res.json({
                    logs: [],
                    totalTime: 0,
                    count: 0
                });
            }
        }

        // Get time logs with task and project data
        const timeLogs = await TimeLog.find(query)
            .populate({
                path: 'task',
                select: 'title project',
                populate: {
                    path: 'project',
                    select: 'title'
                }
            })
            .sort({ startTime: -1 });

        // Calculate total time
        const totalTime = timeLogs.reduce((sum, log) => sum + log.timeSpent, 0);

        // Group by day
        const logsByDay = timeLogs.reduce((groups, log) => {
            const date = new Date(log.startTime).toISOString().split('T')[0];
            if (!groups[date]) {
                groups[date] = {
                    date,
                    logs: [],
                    totalTime: 0
                };
            }
            groups[date].logs.push(log);
            groups[date].totalTime += log.timeSpent;
            return groups;
        }, {});

        res.json({
            logs: timeLogs,
            logsByDay: Object.values(logsByDay),
            totalTime,
            count: timeLogs.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a time log entry
export const updateTimeLog = async (req, res) => {
    try {
        const { timeLogId } = req.params;
        const { timeSpent, description, startTime, endTime, billable, status } = req.body;

        // Find the time log
        const timeLog = await TimeLog.findById(timeLogId);
        if (!timeLog) {
            return res.status(404).json({ error: 'Time log not found' });
        }

        // Check if user is the creator of the time log
        if (!timeLog.user.equals(req.user._id)) {
            // If not the creator, check if user is a project admin or owner
            const task = await Task.findById(timeLog.task);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const project = await Project.findById(task.project);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const isAdmin = project.owner.equals(req.user._id) || 
                project.members.some(member => 
                    member.user.equals(req.user._id) && 
                    member.role === 'admin'
                );

            if (!isAdmin) {
                return res.status(403).json({ error: 'Not authorized to update this time log' });
            }
        }

        // Calculate time difference for task tracking update
        const prevTimeSpent = timeLog.timeSpent;
        const newTimeSpent = timeSpent !== undefined ? timeSpent : prevTimeSpent;
        const timeDifference = newTimeSpent - prevTimeSpent;

        // Update the time log
        if (timeSpent !== undefined) timeLog.timeSpent = timeSpent;
        if (description !== undefined) timeLog.description = description;
        if (startTime !== undefined) timeLog.startTime = startTime;
        if (endTime !== undefined) timeLog.endTime = endTime;
        if (billable !== undefined) timeLog.billable = billable;
        if (status !== undefined) timeLog.status = status;

        await timeLog.save();

        // Update task's total time tracking if time spent changed
        if (timeDifference !== 0) {
            const task = await Task.findById(timeLog.task);
            if (task && task.timeTracking) {
                task.timeTracking.actual = (task.timeTracking.actual || 0) + timeDifference;
                await task.save();
            }
        }

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'update_time_log',
            targetModel: 'TimeLog',
            targetId: timeLog._id,
            details: { 
                taskId: timeLog.task,
                timeSpent: newTimeSpent,
                timeDifference
            }
        });
        await auditLog.save();

        // Populate user data
        const populatedTimeLog = await TimeLog.findById(timeLog._id)
            .populate('user', 'name email avatar');

        res.json(populatedTimeLog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a time log
export const deleteTimeLog = async (req, res) => {
    try {
        const { timeLogId } = req.params;

        // Find the time log
        const timeLog = await TimeLog.findById(timeLogId);
        if (!timeLog) {
            return res.status(404).json({ error: 'Time log not found' });
        }

        // Check if user is the creator of the time log
        if (!timeLog.user.equals(req.user._id)) {
            // If not the creator, check if user is a project admin or owner
            const task = await Task.findById(timeLog.task);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const project = await Project.findById(task.project);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const isAdmin = project.owner.equals(req.user._id) || 
                project.members.some(member => 
                    member.user.equals(req.user._id) && 
                    member.role === 'admin'
                );

            if (!isAdmin) {
                return res.status(403).json({ error: 'Not authorized to delete this time log' });
            }
        }

        // Update task's time tracking before deleting
        const task = await Task.findById(timeLog.task);
        if (task && task.timeTracking) {
            task.timeTracking.actual = Math.max(0, (task.timeTracking.actual || 0) - timeLog.timeSpent);
            
            // Remove entry from timeSpent array (if it exists)
            task.timeTracking.timeSpent = task.timeTracking.timeSpent.filter(entry => 
                !entry.user.equals(timeLog.user) || 
                entry.duration !== timeLog.timeSpent || 
                !entry.date.getTime() === timeLog.startTime.getTime()
            );
            
            await task.save();
        }

        // Delete the time log
        await timeLog.deleteOne();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'delete_time_log',
            targetModel: 'TimeLog',
            targetId: timeLogId,
            details: { 
                taskId: timeLog.task,
                timeSpent: timeLog.timeSpent
            }
        });
        await auditLog.save();

        res.json({ message: 'Time log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get time logs report for a project
export const getProjectTimeReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, endDate, groupBy } = req.query;
        
        // Verify the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user has permission to view the project data
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        );
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isOwner) {
            return res.status(403).json({ error: 'Not authorized to view time logs for this project' });
        }

        // Get all tasks for the project
        const tasks = await Task.find({ project: projectId });
        if (tasks.length === 0) {
            return res.json({
                logs: [],
                summary: {
                    totalTime: 0,
                    billableTime: 0,
                    nonBillableTime: 0
                }
            });
        }

        // Build query for time logs
        const query = {
            task: { $in: tasks.map(t => t._id) }
        };
        
        // Add date range filters if provided
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        // Get time logs
        const timeLogs = await TimeLog.find(query)
            .populate('user', 'name email avatar')
            .populate('task', 'title')
            .sort({ startTime: -1 });

        // Calculate summary statistics
        const summary = {
            totalTime: timeLogs.reduce((sum, log) => sum + log.timeSpent, 0),
            billableTime: timeLogs.filter(log => log.billable).reduce((sum, log) => sum + log.timeSpent, 0),
            nonBillableTime: timeLogs.filter(log => !log.billable).reduce((sum, log) => sum + log.timeSpent, 0)
        };

        // Group data if requested
        let groupedData;
        if (groupBy === 'user') {
            groupedData = timeLogs.reduce((groups, log) => {
                const userId = log.user._id.toString();
                if (!groups[userId]) {
                    groups[userId] = {
                        user: log.user,
                        logs: [],
                        totalTime: 0,
                        billableTime: 0
                    };
                }
                groups[userId].logs.push(log);
                groups[userId].totalTime += log.timeSpent;
                if (log.billable) {
                    groups[userId].billableTime += log.timeSpent;
                }
                return groups;
            }, {});
        } else if (groupBy === 'task') {
            groupedData = timeLogs.reduce((groups, log) => {
                const taskId = log.task._id.toString();
                if (!groups[taskId]) {
                    groups[taskId] = {
                        task: log.task,
                        logs: [],
                        totalTime: 0,
                        billableTime: 0
                    };
                }
                groups[taskId].logs.push(log);
                groups[taskId].totalTime += log.timeSpent;
                if (log.billable) {
                    groups[taskId].billableTime += log.timeSpent;
                }
                return groups;
            }, {});
        } else if (groupBy === 'day') {
            groupedData = timeLogs.reduce((groups, log) => {
                const date = new Date(log.startTime).toISOString().split('T')[0];
                if (!groups[date]) {
                    groups[date] = {
                        date,
                        logs: [],
                        totalTime: 0,
                        billableTime: 0
                    };
                }
                groups[date].logs.push(log);
                groups[date].totalTime += log.timeSpent;
                if (log.billable) {
                    groups[date].billableTime += log.timeSpent;
                }
                return groups;
            }, {});
        }

        res.json({
            logs: timeLogs,
            summary,
            grouped: groupedData ? Object.values(groupedData) : undefined
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};