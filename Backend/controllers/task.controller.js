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
        if (assignedTo) query.assignedTo = assignedTo;

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name')
            .populate('parentTask', 'title');

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