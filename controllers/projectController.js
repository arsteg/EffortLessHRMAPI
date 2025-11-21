const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const ProjectUser = require('../models/projectUserModel');
const Task = require('../models/taskModel');
const AppError = require('../utils/appError');
const AppWebsite = require('./../models/commons/appWebsiteModel');
const ManualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

exports.deleteProject = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting deleteProject process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Checking dependencies for project ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

    const appWebsite = await AppWebsite.find({}).where('projectReference').equals(req.params.id);
    const manualTimeRequest = await ManualTimeRequest.find({}).where('project').equals(req.params.id);
    const task = await Task.find({}).where('project').equals(req.params.id).where('company').equals(req.cookies.companyId);

    websocketHandler.sendLog(req, `Found ${appWebsite.length} app/websites, ${manualTimeRequest.length} manual time requests, ${task.length} tasks`, constants.LOG_TYPES.DEBUG);

    if (task.length > 0 || appWebsite.length > 0 || manualTimeRequest.length > 0) {
        websocketHandler.sendLog(req, `Cannot delete project ${req.params.id} - has existing dependencies`, constants.LOG_TYPES.WARN);
        return res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: null,
            message: req.t('projectController.projectInUse')

        });
    }

    websocketHandler.sendLog(req, `Attempting to delete project ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const document = await Project.findById(req.params.id);
    await document.remove();

    if (!document) {
        websocketHandler.sendLog(req, `No project found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
        return next(new AppError(req.t('projectController.projectNotFound'), 404)
        );
    }

    websocketHandler.sendLog(req, `Successfully deleted project ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
    });
});

exports.updateProject = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting updateProject process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating project ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

    const document = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!document) {
        websocketHandler.sendLog(req, `No project found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
        return next(new AppError(req.t('projectController.projectNotFound'), 404)
        );
    }

    websocketHandler.sendLog(req, `Successfully updated project ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: {
            data: document
        }
    });
});

exports.getProject = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getProject process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching project with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

    const project = await Project.findById(req.params.id);
    if (project) {
        websocketHandler.sendLog(req, `Project ${req.params.id} found`, constants.LOG_TYPES.DEBUG);
        const projectUsers = await ProjectUser.find({}).where('project').equals(project._id);
        if (projectUsers) {
            project.ProjectUser = projectUsers;
            websocketHandler.sendLog(req, `Found ${projectUsers.length} project users`, constants.LOG_TYPES.DEBUG);
        } else {
            project.ProjectUser = null;
            websocketHandler.sendLog(req, `No project users found for project ${req.params.id}`, constants.LOG_TYPES.DEBUG);
        }
    } else {
        websocketHandler.sendLog(req, `Project ${req.params.id} not found`, constants.LOG_TYPES.WARN);
    }

    websocketHandler.sendLog(req, 'Completed getProject process', constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
            project: project
        }
    });
});

exports.getProjectList = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getProjectList process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching projects for company ${req.cookies.companyId} with skip: ${req.body.skip}, limit: ${req.body.next}`, constants.LOG_TYPES.TRACE);

    const projectList = await Project.find({}).where('company').equals(req.cookies.companyId).skip(req.body.skip).limit(req.body.next);
    const projectCount = await Project.countDocuments({ "company": req.cookies.companyId });
    websocketHandler.sendLog(req, `Retrieved ${projectList.length} projects, total count: ${projectCount}`, constants.LOG_TYPES.DEBUG);

    if (projectList) {
        for (var i = 0; i < projectList.length; i++) {
            const projectUsers = await ProjectUser.find({}).where('project').equals(projectList[i]._id);
            if (projectUsers) {
                projectList[i].ProjectUser = projectUsers;
                websocketHandler.sendLog(req, `Found ${projectUsers.length} users for project ${projectList[i]._id}`, constants.LOG_TYPES.TRACE);
            } else {
                projectList[i].ProjectUser = null;
                websocketHandler.sendLog(req, `No users found for project ${projectList[i]._id}`, constants.LOG_TYPES.TRACE);
            }
        }
    }

    websocketHandler.sendLog(req, 'Completed getProjectList process', constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
            projectList: projectList,
            projectCount: projectCount
        }
    });
});

exports.getProjectListByUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getProjectListByUser process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching projects for user ${req.body.userId}`, constants.LOG_TYPES.TRACE);
    var projectList = [];

    const newProjectUserList = await ProjectUser.find({}).where('user').equals(req.body.userId);
    websocketHandler.sendLog(req, `Found ${newProjectUserList.length} project-user associations`, constants.LOG_TYPES.DEBUG);

    if (newProjectUserList) {
        for (var i = 0; i < newProjectUserList.length; i++) {
            projectList.push(newProjectUserList[i].project);
        }
        websocketHandler.sendLog(req, `Compiled list of ${projectList.length} projects`, constants.LOG_TYPES.DEBUG);
    }

    websocketHandler.sendLog(req, 'Completed getProjectListByUser process', constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
            projectList: projectList
        }
    });
});

// exports.addProject = catchAsync(async (req, res, next) => {  
//   websocketHandler.sendLog(req, 'Starting addProject process', constants.LOG_TYPES.INFO);
//   websocketHandler.sendLog(req, `Creating new project with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

//   const newProject = await Project.create({
//       projectName: req.body.projectName,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       notes: req.body.notes,
//       estimatedTime: req.body.estimatedTime,
//       createdOn: new Date(Date.now()),
//       updatedOn: new Date(Date.now()),
//       company: req.cookies.companyId,
//       createdBy: req.cookies.userId,
//       updatedBy: req.cookies.userId,
//       status: "Active"
//   });  

//   websocketHandler.sendLog(req, `Successfully created project with ID: ${newProject._id}`, constants.LOG_TYPES.INFO);
//   res.status(200).json({
//       status: constants.APIResponseStatus.Success,
//       data: {
//           newProject: newProject
//       }
//   });  
// });

exports.addProject = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting addProject process', constants.LOG_TYPES.INFO);

    const companyId = req.cookies.companyId;
    const projectName = req.body.projectName;

    websocketHandler.sendLog(req, `Attempting to create project '${projectName}' for company: ${companyId}`, constants.LOG_TYPES.TRACE);

    // --- ✨ NEW: Uniqueness Check ---
    const existingProject = await Project.findOne({
        projectName: projectName,
        company: companyId,
    });

    if (existingProject) {
        websocketHandler.sendLog(req, `Duplicate project found: Project '${projectName}' already exists for company ${companyId}`, constants.LOG_TYPES.ERROR);

        // Return a 409 Conflict error if a duplicate is found
        return next(new AppError(req.t('project.duplicateProjectName'), 409));
    }
    // ---------------------------------

    // Original creation logic continues if no duplicate is found
    const newProject = await Project.create({
        projectName: projectName, // Use the destructured variable
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        notes: req.body.notes,
        estimatedTime: req.body.estimatedTime,
        createdOn: new Date(Date.now()),
        updatedOn: new Date(Date.now()),
        company: companyId, // Use the destructured variable
        createdBy: req.cookies.userId,
        updatedBy: req.cookies.userId,
        status: "Active"
    });

    websocketHandler.sendLog(req, `Successfully created project with ID: ${newProject._id}`, constants.LOG_TYPES.INFO);
    res.status(201).json({ // Changed status from 200 to 201 for resource creation
        status: constants.APIResponseStatus.Success,
        data: {
            newProject: newProject
        }
    });
});

exports.addProjectUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting addProjectUser process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Adding users to project ${req.body.projectId}`, constants.LOG_TYPES.TRACE);

    for (var i = 0; i < req.body.projectUsers.length; i++) {
        const projectUsersexists = await ProjectUser.find({}).where('project').equals(req.body.projectId).where('user').equals(req.body.projectUsers[i].user);

        if (projectUsersexists.length > 0) {
            websocketHandler.sendLog(req, `User ${req.body.projectUsers[i].user} already exists in project ${req.body.projectId}`, constants.LOG_TYPES.WARN);
            return next(new AppError(req.t('projectController.projectUserExists'), 403)
            );
        } else {
            const newProjectUsersrItem = await ProjectUser.create({
                project: req.body.projectId,
                user: req.body.projectUsers[i].user,
                company: req.cookies.companyId,
                status: "Active",
                createdOn: new Date(),
                updatedOn: new Date(),
                createdBy: req.cookies.userId,
                updatedBy: req.cookies.userId
            });
            websocketHandler.sendLog(req, `Added user ${req.body.projectUsers[i].user} to project ${req.body.projectId}`, constants.LOG_TYPES.TRACE);
        }
    }

    const newProjectUserList = await ProjectUser.find({}).where('project').equals(req.body.projectId);
    websocketHandler.sendLog(req, `Retrieved ${newProjectUserList.length} users for project ${req.body.projectId}`, constants.LOG_TYPES.DEBUG);
    websocketHandler.sendLog(req, 'Completed addProjectUser process', constants.LOG_TYPES.INFO);

    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
            ProjectUserList: newProjectUserList
        }
    });
});

exports.updateProjectUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting updateProjectUser process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Checking existing project user with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

    const projectUser = await ProjectUser.findById(req.params.id);
    if (projectUser) {
        const projectUsersexists = await ProjectUser.find({}).where('project').equals(projectUser.project).where('user').equals(req.body.user);
        if (projectUsersexists.length > 0) {
            websocketHandler.sendLog(req, `User ${req.body.user} already exists in project ${projectUser.project}`, constants.LOG_TYPES.WARN);
            return next(new AppError(req.t('projectController.projectUserExists'), 403)
            );
        } else {
            websocketHandler.sendLog(req, `Updating project user ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
            const document = await ProjectUser.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!document) {
                websocketHandler.sendLog(req, `No project user found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
                return next(new AppError(req.t('projectController.noDocumentFound'), 404));
            }
            websocketHandler.sendLog(req, `Successfully updated project user ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
            res.status(201).json({
                status: constants.APIResponseStatus.Success,
                data: {
                    data: document
                }
            });
        }
    } else {
        websocketHandler.sendLog(req, `No project user found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
        return next(new AppError(req.t('projectController.projectUserNotFound'), 404)

        );
    }
});

exports.deleteProjectUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting deleteProjectUser process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Attempting to delete project user with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

    const document = await ProjectUser.findByIdAndDelete(req.params.id);
    if (!document) {
        websocketHandler.sendLog(req, `No project user found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
        return next(new AppError(req.t('projectController.projectUserNotFound'), 404)

        );
    }

    websocketHandler.sendLog(req, `Successfully deleted project user ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
    });
});

exports.getProjectUsers = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getProjectUsers process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching users for project ${req.params.id}`, constants.LOG_TYPES.TRACE);

    const newProjectUserList = await ProjectUser.find({}).where('project').equals(req.params.id);
    websocketHandler.sendLog(req, `Retrieved ${newProjectUserList.length} users for project ${req.params.id}`, constants.LOG_TYPES.DEBUG);
    websocketHandler.sendLog(req, 'Completed getProjectUsers process', constants.LOG_TYPES.INFO);

    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
            projectUserList: newProjectUserList
        }
    });
});