const appWebsite = require('./../models/commons/appWebsiteModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
const { findById } = require("../models/item");
const Productivity = require('./../models/productivityModel');
const BrowserHistory = require('./../models/appsWebsites/browserHistory');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

exports.addNew = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated adding a new app/website record. User ID: ${req.body.userReference}, Company ID: ${req.cookies.companyId}`);
    var appWebsiteKey = req.body.appWebsite.split(".");
    const getProductivity = await Productivity.find({}).where('key').equals(appWebsiteKey[0]);
    let appWebsiteName = "Default";
    if (getProductivity.length > 0) {
        appWebsiteName = getProductivity[0].name;
    }
    try {
        const createDocument = await appWebsite.create({
            appWebsite: appWebsiteName,
            ModuleName: req.body.ModuleName,
            ApplicationTitle: req.body.ApplicationTitle,
            TimeSpent: req.body.TimeSpent,
            date: req.body.date,
            type: req.body.type,
            projectReference: req.body.projectReference,
            userReference: req.body.userReference,
            mouseClicks: req.body.mouseClicks,
            keyboardStrokes: req.body.keyboardStrokes,
            scrollingNumber: req.body.scrollingNumber,
            inactive: req.body.inactive,
            total: req.body.total
        });

        websocketHandler.logEvent(req, `User successfully added a new app/website record. Record ID: ${createDocument._id}, User ID: ${req.body.userReference}`);
        res.status(201).json({
            status: constants.APIResponseStatus.Success,
            body: createDocument
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to add a new app/website record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.delete = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated deleting an app/website record. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const deleteDocument = await appWebsite.findByIdAndDelete(req.params.id);

        if (!deleteDocument) {
            websocketHandler.logEvent(req, `User failed to delete an app/website record. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully deleted an app/website record. Record ID: ${deleteDocument._id}, User ID: ${req.cookies.userId}`);
        res.status(201).json({
            status: constants.APIResponseStatus.Success,
            body: deleteDocument
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to delete an app/website record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.getById = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching an app/website record by ID. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const getDocumentByID = await appWebsite.findById(req.params.id);

        if (!getDocumentByID) {
            websocketHandler.logEvent(req, `User failed to fetch an app/website record by ID. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched an app/website record by ID. Record ID: ${getDocumentByID._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            body: getDocumentByID
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch an app/website record by ID. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.update = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated updating an app/website record. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const updateDocument = await appWebsite.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updateDocument) {
            websocketHandler.logEvent(req, `User failed to update an app/website record. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully updated an app/website record. Record ID: ${updateDocument._id}, User ID: ${req.cookies.userId}`);
        res.status(201).json({
            status: constants.APIResponseStatus.Success,
            data: updateDocument
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to update an app/website record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.getByIdAndDate = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching an app/website record by ID and date. Record ID: ${req.params.id}, Date: ${req.body.date}, User ID: ${req.cookies.userId}`);
    try {
        let date = req.body.date;
        const getDocumentByDateAndId = await appWebsite.findById(req.params.id).where('date').equals(date);

        if (!getDocumentByDateAndId) {
            websocketHandler.logEvent(req, `User failed to fetch an app/website record by ID and date. Record ID: ${req.params.id}, Date: ${req.body.date} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched an app/website record by ID and date. Record ID: ${getDocumentByDateAndId._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            body: getDocumentByDateAndId
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch an app/website record by ID and date. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.getAllbyDate = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching all app/website records by date. Date: ${req.body.date}, User ID: ${req.cookies.userId}`);
    try {
        let date = req.body.date;
        const getAllDocumentsbyDate = await appWebsite.find({}).where('date').equals(date);

        if (!getAllDocumentsbyDate || getAllDocumentsbyDate.length === 0) {
            websocketHandler.logEvent(req, `User failed to fetch app/website records by date. No records found for Date: ${req.body.date}`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'No records found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched all app/website records by date. Date: ${req.body.date}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            body: getAllDocumentsbyDate
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch app/website records by date. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.getUserProductivityApps = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching productivity apps. User ID: ${req.params.userId}, Company ID: ${req.cookies.companyId}`);
    try {
        const userId = req.params.userId;
        const companyId = req.cookies.companyId;

        if (!userId || !companyId) {
            websocketHandler.logEvent(req, `User failed to fetch productivity apps. Missing userId or companyId`);
            return res.status(400).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Missing userId or companyId'
            });
        }

        const productivityApps = await Productivity.find({ company: companyId, user: userId });

        if (!productivityApps || productivityApps.length === 0) {
            websocketHandler.logEvent(req, `User failed to fetch productivity apps. No apps found for User ID: ${userId}, Company ID: ${companyId}`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'No productivity apps found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched productivity apps. User ID: ${userId}, Company ID: ${companyId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: productivityApps
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch productivity apps. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err.message || err
        });
    }
});

exports.getproductivities = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching all productivity records. User ID: ${req.cookies.userId}`);
    try {
        const productivityData = await Productivity.find();

        if (!productivityData || productivityData.length === 0) {
            websocketHandler.logEvent(req, `User failed to fetch productivity records. No records found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'No productivity records found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched all productivity records. User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            body: productivityData
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch productivity records. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.getproductivityById = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching a productivity record by ID. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const productivityData = await Productivity.findById(req.params.id);

        if (!productivityData) {
            websocketHandler.logEvent(req, `User failed to fetch a productivity record by ID. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Productivity record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched a productivity record by ID. Record ID: ${productivityData._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            body: productivityData
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch a productivity record by ID. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

exports.addProductivity = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated adding a new productivity record. User ID: ${req.cookies.userId}, Company ID: ${req.cookies.companyId}`);
    try {
        const productivityData = await Productivity.create({
            icon: req.body.icon,
            key: req.body.key,
            name: req.body.name,
            isProductive: req.body.isProductive,
            status: req.body.status,
            company: req.cookies.companyId,
            user: req.cookies.userId,
            createdOn: new Date(Date.now()),
            updatedOn: new Date(Date.now()),
            createdBy: req.cookies.userId,
            updatedBy: req.cookies.userId,
        });

        websocketHandler.logEvent(req, `User successfully added a new productivity record. Record ID: ${productivityData._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: productivityData
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to add a new productivity record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err
        });
    }
});

exports.updateProductivity = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated updating a productivity record. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const { id } = req.params;
        const { status } = req.body;

        const productivityData = await Productivity.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );

        if (!productivityData) {
            websocketHandler.logEvent(req, `User failed to update a productivity record. Record ID: ${id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Productivity record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully updated a productivity record. Record ID: ${productivityData._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: productivityData
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to update a productivity record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(500).json({
            status: constants.APIResponseStatus.Error,
            message: 'Internal Server Error',
            error: err.message
        });
    }
});

exports.deleteProductivity = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated deleting a productivity record. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const productivityData = await Productivity.findByIdAndDelete(req.params.id);

        if (!productivityData) {
            websocketHandler.logEvent(req, `User failed to delete a productivity record. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Productivity record not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully deleted a productivity record. Record ID: ${productivityData._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: productivityData
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to delete a productivity record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err
        });
    }
});

exports.addBrowserHistory = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated adding a new browser history record. User ID: ${req.cookies.userId}, Company ID: ${req.cookies.companyId}`);
    try {
        const newHistory = await BrowserHistory.create({
            browser: req.body.browser,
            uri: req.body.uri,
            title: req.body.title,
            lastVisitTime: req.body.lastVisitTime,
            visitCount: req.body.visitCount,
            company: req.cookies.companyId,
            user: req.cookies.userId,
        });

        websocketHandler.logEvent(req, `User successfully added a new browser history record. Record ID: ${newHistory._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: newHistory
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to add a new browser history record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err
        });
    }
});

exports.deleteBrowserHistory = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated deleting a browser history record. Record ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
    try {
        const deletedHistory = await BrowserHistory.findByIdAndDelete(req.params.id);

        if (!deletedHistory) {
            websocketHandler.logEvent(req, `User failed to delete a browser history record. Record ID: ${req.params.id} not found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'Document not found'
            });
        }

        websocketHandler.logEvent(req, `User successfully deleted a browser history record. Record ID: ${deletedHistory._id}, User ID: ${req.cookies.userId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: deletedHistory
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to delete a browser history record. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err
        });
    }
});

exports.getBrowserHistory = catchAsync(async (req, res, next) => {
    websocketHandler.logEvent(req, `User initiated fetching browser history records. User ID: ${req.cookies.userId}, Company ID: ${req.cookies.companyId}`);
    try {
        const filters = {};

        if (req.query.startDate && req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);

            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const startDay = startDate.getDate();

            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            const endDay = endDate.getDate();

            const newStartDate = new Date(startYear, startMonth, startDay);
            const newEndDate = new Date(endYear, endMonth, endDay);
            filters.lastVisitTime = {
                $gte: newStartDate.setHours(0, 0, 0, 0),
                $lte: newEndDate.setHours(23, 59, 59, 999)
            };
        }

        if (req.query.userId) {
            filters.user = req.query.userId;
        }

        filters.company = req.cookies.companyId;

        const history = await BrowserHistory.find(filters);

        if (!history || history.length === 0) {
            websocketHandler.logEvent(req, `User failed to fetch browser history records. No records found`);
            return res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'No records found'
            });
        }

        websocketHandler.logEvent(req, `User successfully fetched browser history records. User ID: ${req.cookies.userId}, Company ID: ${req.cookies.companyId}`);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: history
        });
    } catch (err) {
        websocketHandler.logEvent(req, `User failed to fetch browser history records. Error: ${err.message}, Stack: ${err.stack}`);
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            data: err
        });
    }
});