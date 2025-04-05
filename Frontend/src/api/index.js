import apiClient from './axios.config';
import taskService from './taskService';
import commentService from './commentService';
import attachmentService from './attachmentService';
import timelogService from './timelogService';
import teamService from './teamService';
import projectService from './projectService';
import userServiceImport from './userService';

// Use the imported userService instead of redefining it
const userService = userServiceImport;

export {
  userService,
  projectService,
  taskService,
  teamService,
  commentService,
  attachmentService,
  timelogService
};