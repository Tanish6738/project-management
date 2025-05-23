import Task from '../models/Task.modal.js';
import Project from '../models/Project.modal.js';
import User from '../models/User.modal.js';
import mongoose from 'mongoose';

export const createTask = async (req, res) => {
    try {
        const project = await Project.findById(req.body.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user has permission to create tasks
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canEditTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to create tasks' });
        }

        const taskData = {
            ...req.body,
            createdBy: req.user._id,
            lastUpdatedBy: req.user._id
        };

        const task = new Task(taskData);
        await task.save();

        // Update project metrics
        await Project.updateTaskMetrics(project._id);

        // Add task to user's assigned tasks if it's assigned
        if (req.body.assignedTo) {
            await User.findByIdAndUpdate(
                req.body.assignedTo,
                { $addToSet: { assignedTasks: task._id } }
            );
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const { project, status, priority, assignedTo } = req.query;
        const query = {};

        if (project) query.project = project;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo === 'me') {
            query.assignedTo = req.user._id;
        } else if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name')
            .populate('parentTask', 'title')
            .populate('project', 'title')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTaskDetails = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name')
            .populate('parentTask', 'title')
            .populate('subtasks')
            .populate('comments')
            .populate('attachments')
            .populate('watchers', 'name email');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const project = await Project.findById(task.project);
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canEditTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to update task' });
        }

        const previousAssignee = task.assignedTo;
        const updates = Object.keys(req.body);
        updates.forEach(update => task[update] = req.body[update]);
        task.lastUpdatedBy = req.user._id;

        await task.save();
        await Project.updateTaskMetrics(task.project);

        // If assignee has changed, update user assignedTasks arrays
        if (req.body.assignedTo && !previousAssignee?.equals(req.body.assignedTo)) {
            // Remove from previous assignee if there was one
            if (previousAssignee) {
                await User.findByIdAndUpdate(
                    previousAssignee,
                    { $pull: { assignedTasks: task._id } }
                );
            }

            // Add to new assignee
            await User.findByIdAndUpdate(
                req.body.assignedTo,
                { $addToSet: { assignedTasks: task._id } }
            );
        }

        // If status changed to completed, update user's task stats
        if (req.body.status === 'completed' && task.status !== 'completed') {
            if (task.assignedTo) {
                const user = await User.findById(task.assignedTo);
                if (user) {
                    await user.updateTaskStats();
                }
            }
        }

        // Notify watchers of changes
        await task.notifyWatchers('update');

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const project = await Project.findById(task.project);
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canDeleteTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to delete task' });
        }

        // Remove from assignee's tasks list
        if (task.assignedTo) {
            await User.findByIdAndUpdate(
                task.assignedTo,
                { $pull: { assignedTasks: task._id } }
            );
        }

        // Remove from watchers' lists
        if (task.watchers && task.watchers.length > 0) {
            await User.updateMany(
                { _id: { $in: task.watchers } },
                { $pull: { watchingTasks: task._id } }
            );
        }

        // If has subtasks, delete them too
        if (task.subtasks && task.subtasks.length > 0) {
            await Task.deleteMany({ _id: { $in: task.subtasks } });
        }

        await task.deleteOne();
        await Project.updateTaskMetrics(task.project);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Verify project exists and user has access
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const tasks = await Task.find({ 
            project: projectId,
            isSubtask: false 
        })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSubtasks = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Parent task not found' });
        }

        const subtasks = await Task.find({ parentTask: req.params.taskId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        res.json(subtasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubtask = async (req, res) => {
    try {
        const parentTask = await Task.findById(req.params.taskId);
        if (!parentTask) {
            return res.status(404).json({ error: 'Parent task not found' });
        }

        // Check permissions via parent task's project
        const project = await Project.findById(parentTask.project);
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canEditTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to create subtasks' });
        }

        const subtaskData = {
            ...req.body,
            project: parentTask.project,
            parentTask: parentTask._id,
            isSubtask: true,
            createdBy: req.user._id,
            lastUpdatedBy: req.user._id
        };

        const subtask = new Task(subtaskData);
        await subtask.save();

        parentTask.subtasks.push(subtask._id);
        await parentTask.save();

        // If assigned, add to user's assigned tasks
        if (req.body.assignedTo) {
            await User.findByIdAndUpdate(
                req.body.assignedTo,
                { $addToSet: { assignedTasks: subtask._id } }
            );
        }

        // Update project metrics
        await Project.updateTaskMetrics(parentTask.project);

        res.status(201).json(subtask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSubtask = async (req, res) => {
    try {
        const subtask = await Task.findOne({
            _id: req.params.subtaskId,
            parentTask: req.params.taskId
        });

        if (!subtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const project = await Project.findById(subtask.project);
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canEditTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to update subtask' });
        }

        const previousAssignee = subtask.assignedTo;
        const updates = Object.keys(req.body);
        updates.forEach(update => subtask[update] = req.body[update]);
        subtask.lastUpdatedBy = req.user._id;

        await subtask.save();
        await Project.updateTaskMetrics(subtask.project);

        // Handle assignee change
        if (req.body.assignedTo && !previousAssignee?.equals(req.body.assignedTo)) {
            if (previousAssignee) {
                await User.findByIdAndUpdate(
                    previousAssignee,
                    { $pull: { assignedTasks: subtask._id } }
                );
            }

            await User.findByIdAndUpdate(
                req.body.assignedTo,
                { $addToSet: { assignedTasks: subtask._id } }
            );
        }

        res.json(subtask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSubtask = async (req, res) => {
    try {
        const subtask = await Task.findOne({
            _id: req.params.subtaskId,
            parentTask: req.params.taskId
        });

        if (!subtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const project = await Project.findById(subtask.project);
        const member = project.members.find(m => 
            m.user.equals(req.user._id)
        );

        if (!member?.permissions.canDeleteTasks && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to delete subtask' });
        }

        // Remove from parent task's subtasks array
        const parentTask = await Task.findById(req.params.taskId);
        if (parentTask) {
            parentTask.subtasks = parentTask.subtasks.filter(
                id => !id.equals(subtask._id)
            );
            await parentTask.save();
        }

        // Remove from assignee's tasks list
        if (subtask.assignedTo) {
            await User.findByIdAndUpdate(
                subtask.assignedTo,
                { $pull: { assignedTasks: subtask._id } }
            );
        }

        await subtask.deleteOne();
        await Project.updateTaskMetrics(subtask.project);

        res.json({ message: 'Subtask deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reorderSubtasks = async (req, res) => {
    try {
        const { order } = req.body;
        const parentTask = await Task.findById(req.params.taskId);
        
        if (!parentTask) {
            return res.status(404).json({ error: 'Parent task not found' });
        }

        // Validate that order contains all subtask IDs
        const currentSubtasks = parentTask.subtasks.map(id => id.toString());
        const orderedSubtasks = order.map(id => id.toString());

        if (!areArraysEqual(currentSubtasks.sort(), orderedSubtasks.sort())) {
            return res.status(400).json({ error: 'Invalid subtask order - must contain all current subtasks' });
        }

        parentTask.subtasks = order;
        await parentTask.save();

        res.json({
            message: 'Subtask order updated successfully',
            order: parentTask.subtasks
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addTimeToTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const { duration } = req.body;
        if (typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ error: 'Invalid duration' });
        }

        // Add time entry
        const timeEntry = {
            user: req.user._id,
            duration,
            date: new Date()
        };
        
        if (!task.timeTracking) {
            task.timeTracking = { timeSpent: [] };
        }
        
        task.timeTracking.timeSpent.push(timeEntry);

        // Update total time spent
        task.timeTracking.actual = (task.timeTracking.actual || 0) + duration;
        await task.save();

        res.json({
            timeTracking: task.timeTracking,
            message: 'Time tracking updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addTaskWatcher = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user is already watching
        if (task.watchers.some(id => id.equals(req.user._id))) {
            return res.status(400).json({ error: 'Already watching this task' });
        }

        // Add user to task watchers
        task.watchers.push(req.user._id);
        await task.save();

        // Add task to user's watching tasks
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchingTasks: task._id } }
        );

        res.json({
            message: 'Added to task watchers',
            watchers: task.watchers
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeTaskWatcher = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Remove user from task watchers
        task.watchers = task.watchers.filter(id => !id.equals(req.user._id));
        await task.save();

        // Remove task from user's watching tasks
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { watchingTasks: task._id } }
        );

        res.json({
            message: 'Removed from task watchers',
            watchers: task.watchers
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTaskTreeView = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // First, get all root-level tasks (tasks without parent)
        const rootTasks = await Task.find({
            project: projectId,
            isSubtask: false
        })
        .populate('assignedTo', 'name email avatar')
        .sort({ createdAt: 1 });

        // Function to recursively fetch subtasks
        const getSubtasks = async (taskId) => {
            const subtasks = await Task.find({
                parentTask: taskId
            })
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name')
            .sort({ createdAt: 1 });

            // Recursively get subtasks for each subtask
            const subtasksWithChildren = await Promise.all(
                subtasks.map(async (subtask) => {
                    const children = await getSubtasks(subtask._id);
                    return {
                        _id: subtask._id,
                        title: subtask.title,
                        status: subtask.status,
                        priority: subtask.priority,
                        assignedTo: subtask.assignedTo,
                        deadline: subtask.deadline,
                        progress: subtask.progress,
                        children: children.length > 0 ? children : undefined
                    };
                })
            );

            return subtasksWithChildren;
        };

        // Build the complete task tree
        const taskTree = await Promise.all(
            rootTasks.map(async (task) => {
                const children = await getSubtasks(task._id);
                return {
                    _id: task._id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo,
                    deadline: task.deadline,
                    progress: task.progress,
                    children: children.length > 0 ? children : undefined
                };
            })
        );

        res.json(taskTree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTasksByStatus = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const tasks = await Task.find({ 
            project: projectId,
            isSubtask: false 
        })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name')
        .populate({
            path: 'subtasks',
            select: 'title status priority'
        })
        .sort({ createdAt: -1 });

        // Group tasks by status using project workflow
        const tasksByStatus = {};
        project.workflow.forEach(status => {
            tasksByStatus[status] = tasks.filter(task => task.status === status);
        });

        res.json({
            workflow: project.workflow,
            tasksByStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectTasksDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Verify project exists and user has access
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is member of the project
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);

        if (!isMember) {
            return res.status(403).json({ error: 'Not authorized to view project tasks' });
        }

        // Get all tasks for the project with detailed information
        const tasks = await Task.find({ 
            project: projectId,
            isSubtask: false 
        })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email')
        .populate('lastUpdatedBy', 'name')
        .populate('watchers', 'name email')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'name email avatar'
            }
        })
        .populate('attachments')
        .lean();

        // For each task, get its subtasks with details
        const tasksWithSubtasks = await Promise.all(tasks.map(async (task) => {
            const subtasks = await Task.find({ 
                parentTask: task._id 
            })
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name')
            .populate('watchers', 'name email')
            .lean();

            return {
                ...task,
                subtasks,
                totalSubtasks: subtasks.length,
                completedSubtasks: subtasks.filter(st => st.status === 'completed').length,
                progress: calculateTaskProgress(task, subtasks)
            };
        }));

        // Add project level statistics
        const statistics = {
            totalTasks: tasksWithSubtasks.length,
            totalSubtasks: tasksWithSubtasks.reduce((acc, task) => acc + task.subtasks.length, 0),
            completedTasks: tasksWithSubtasks.filter(t => t.status === 'completed').length,
            completedSubtasks: tasksWithSubtasks.reduce((acc, task) => 
                acc + task.subtasks.filter(st => st.status === 'completed').length, 0
            ),
            tasksByPriority: countTasksByPriority(tasksWithSubtasks),
            tasksByStatus: countTasksByStatus(tasksWithSubtasks, project.workflow)
        };

        res.json({
            projectId,
            statistics,
            tasks: tasksWithSubtasks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions for the above controller
const calculateTaskProgress = (task, subtasks) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'pending') return 0;
    if (subtasks.length === 0) return task.progress || 50;

    const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
};

const countTasksByPriority = (tasks) => {
    return tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
    }, {});
};

const countTasksByStatus = (tasks, workflow) => {
    return workflow.reduce((acc, status) => {
        acc[status] = tasks.filter(task => task.status === status).length;
        return acc;
    }, {});
};

const areArraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export const getUserTasks = async (req, res) => {
    try {
        // Find all tasks assigned to the current user
        const tasks = await Task.find({ 
            assignedTo: req.user._id 
        })
        .populate('project', 'title')
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTeamTaskStats = async (req, res) => {
    try {
        const { teamId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ error: 'Invalid team ID format' });
        }

        // Get all tasks associated with the team members
        const teamTasks = await Task.aggregate([
            {
                $lookup: {
                    from: 'teams',
                    localField: 'assignedTo',
                    foreignField: 'members.user',
                    as: 'teamMatch'
                }
            },
            {
                $match: {
                    'teamMatch._id': new mongoose.Types.ObjectId(teamId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignee'
                }
            },
            {
                $unwind: {
                    path: '$assignee',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$assignedTo',
                    assigneeName: { $first: '$assignee.name' },
                    assigneeEmail: { $first: '$assignee.email' },
                    assigneeAvatar: { $first: '$assignee.avatar' },
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    },
                    inProgressTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
                        }
                    },
                    pendingTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    },
                    lateTasks: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $lt: ['$deadline', new Date()] },
                                    { $ne: ['$status', 'completed'] }
                                ]}, 
                                1, 
                                0
                            ]
                        }
                    },
                    highPriorityTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$priority', 'high'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Calculate team-wide stats
        const teamStats = {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            pendingTasks: 0,
            lateTasks: 0,
            highPriorityTasks: 0,
            memberStats: teamTasks
        };

        teamTasks.forEach(memberStat => {
            teamStats.totalTasks += memberStat.totalTasks;
            teamStats.completedTasks += memberStat.completedTasks;
            teamStats.inProgressTasks += memberStat.inProgressTasks;
            teamStats.pendingTasks += memberStat.pendingTasks;
            teamStats.lateTasks += memberStat.lateTasks;
            teamStats.highPriorityTasks += memberStat.highPriorityTasks;
        });

        // Calculate completion rate
        teamStats.completionRate = teamStats.totalTasks > 0 
            ? (teamStats.completedTasks / teamStats.totalTasks) * 100 
            : 0;

        res.json(teamStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTaskAuditLog = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID format' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has access to this task
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Associated project not found' });
        }

        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        );

        if (!isMember && !project.owner.equals(req.user._id) && !task.assignedTo?.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to view task audit log' });
        }

        // Get audit logs for this task
        const AuditLog = mongoose.model('AuditLog');
        const logs = await AuditLog.find({ 
            targetModel: 'Task',
            targetId: taskId 
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name email avatar');

        res.json({
            activities: logs,
            task: {
                _id: task._id,
                title: task.title
            }
        });
    } catch (error) {
        console.error('Error fetching task audit log:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllTaskActivities = async (req, res) => {
    try {
        // Find all tasks accessible to this user
        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        }).select('_id');
        
        const projectIds = projects.map(p => p._id);
        
        // Get audit logs for tasks in these projects
        const AuditLog = mongoose.model('AuditLog');
        const logs = await AuditLog.find({ 
            targetModel: 'Task',
            // Only include logs for tasks in projects the user has access to
            $or: [
                { 'details.projectId': { $in: projectIds } },
                { 'user': req.user._id } // Include all logs created by the user
            ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name email avatar');
        
        // Get task information for each log entry
        const taskIds = [...new Set(logs.map(log => log.targetId))];
        const tasks = await Task.find({ 
            _id: { $in: taskIds }
        }).select('title');
        
        const taskMap = {};
        tasks.forEach(task => {
            taskMap[task._id.toString()] = {
                _id: task._id,
                title: task.title
            };
        });
        
        // Format the response
        const activities = logs.map(log => ({
            _id: log._id,
            action: log.action,
            timestamp: log.createdAt,
            user: log.user ? {
                _id: log.user._id,
                name: log.user.name,
                email: log.user.email,
                avatar: log.user.avatar || null
            } : null,
            task: taskMap[log.targetId.toString()] || { _id: log.targetId, title: 'Unknown Task' },
            details: log.details || {}
        }));

        res.json({
            activities,
            count: activities.length
        });
    } catch (error) {
        console.error('Error fetching all task activities:', error);
        res.status(500).json({ error: error.message });
    }
};