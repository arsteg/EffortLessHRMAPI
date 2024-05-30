const appWebsite = require('./../models/commons/appWebsiteModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
const { findById } = require("../models/item");
const Productivity = require('./../models/productivityModel');
const BrowserHistory = require('./../models/appsWebsites/browserHistory');

exports.addNew = catchAsync(async (req, res, next) => {
    var appWebsiteKey = req.body.appWebsite.split(".");
    const getProductivity = await Productivity.find({}).where('key').equals(appWebsiteKey[0])
    let appWebsiteName="Default";
      if(getProductivity.length>0)
      { 
        appWebsiteName= getProductivity[0].name;
      }
      try {       
            const createDocument = await appWebsite.create({
                appWebsite:appWebsiteName,
                ModuleName:req.body.ModuleName,
                ApplicationTitle :req.body.ApplicationTitle,
                TimeSpent: req.body.TimeSpent,
                date:req.body.date,
                type: req.body.type,
                projectReference:req.body.projectReference,
                userReference :req.body.userReference,
                mouseClicks: req.body.mouseClicks,
                keyboardStrokes:req.body.keyboardStrokes,
                scrollingNumber:req.body.scrollingNumber,
                inactive :req.body.inactive,
                total: req.body.total
              }); 

        res.status(201).json({
            status: 'success',
            body: createDocument
        })


    } catch (err) {
        res.status(400).json({
            status: 'faied',
            body: err
        })

    }

});

exports.delete = catchAsync(async (req, res, next) => {
    try {
        const deleteDocument = await appWebsite
            .findByIdAndDelete(req.params.id);


        res.status(201).json({
            status: 'success',
            body: deleteDocument
        })


    } catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        });
    }
});

exports.getById = catchAsync(async (req, res, next) => {
    try {
        console.log(req.params.id);
        const getDocumentByID = await appWebsite.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            body: getDocumentByID
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        });
    }
});



exports.update = catchAsync(async (req, res, next) => {
    try {
        const updateDocument = await appWebsite.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });


        res.status(201).json({
            status: 'success',
            data: updateDocument
        })

    } catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        })

    }
});




exports.getByIdAndDate = catchAsync(async (req, res, next) => {
    try 
    {
        let date = req.body.date;
        const getDocumentByDateAndId = await appWebsite
            .findById(req.params.id).where('date').equals(date);

        res.status(200).json({
            status: 'success',
            body: getDocumentByDateAndId
        });

    }
    catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        });
    }
})

exports.getAllbyDate = catchAsync(async (req, res, next) => {
    try {
        let date = req.body.date;
        const getAllDocumentsbyDate = await appWebsite.find({}).where('date').equals(date)
        res.status(200).json({
            status: 'success',
            body: getAllDocumentsbyDate
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        });
    }
});

exports.getUserProductivityApps = catchAsync(async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const productivityApps = await Productivity.find({company:req.cookies.companyId,user:userId});        
        res.status(200).json({
            status: 'success',
            data: productivityApps
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'failed',
            data: err
        });
    }
});

exports.getproductivities = catchAsync(async (req, res, next) => {
    const productivityData = await Productivity.find();    
    res.status(200).json({
        status: 'success',
        body: productivityData
    });
});

exports.getproductivityById = catchAsync(async (req, res, next) => {    
    const productivityData = await Productivity.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        body: productivityData
    });
});

exports.addProductivity = catchAsync(async (req, res, next) => {    
    const productivityData = await Productivity.create(
        {
            icon: req.body.icon,            
            key: req.body.key,            
            name: req.body.name,            
            isProductive: req.body.isProductive,
            status: req.body.status,
            company: req.cookies.companyId,            
            user:req.cookies.userId,
            createdOn: new Date(Date.now()),
            updatedOn: new Date(Date.now()),
            createdBy: req.cookies.userId,
            updatedBy: req.cookies.userId,
          }
    );
    res.status(200).json({
        status: 'success',
        data: productivityData
    });
});

exports.updateProductivity = catchAsync(async (req, res, next) => {    
    const { id } = req.params.id;
    const { status } = req.body.status;
    
    console.log(`req.body.id: ${req.body.id}`);
    console.log(`req.body.status: ${req.body.status}`);
    
    const productivityData = await Productivity.findByIdAndUpdate(
        req.body.id,
        { $set: { status: req.body.status } },
        { new: true }
      );
      res.status(200).json({
        status: 'success',
        body: productivityData
    });
});

exports.deleteProductivity = catchAsync(async (req, res, next) => {
    const productivityData = await Productivity.findByIdAndDelete(req.params.id);
    if (productivityData) {
        res.status(200).json({
            status: 'success',
            data: productivityData
        });
    } else {
      res.status(404).json({ error: 'Productivity record not found' });
    }
});

exports.addBrowserHistory = catchAsync(async (req, res, next) => {
    const newHistory = await BrowserHistory.create(
        {
            browser: req.body.browser,            
            uri: req.body.uri,            
            title: req.body.title,            
            lastVisitTime: req.body.lastVisitTime,            
            visitCount: req.body.visitCount,            
            company: req.cookies.companyId,            
            user:req.cookies.userId,            
          }
    );
    res.status(200).json({
        status: 'success',
        data: newHistory
    });
});

exports.deleteBrowserHistory = catchAsync(async (req, res, next) => {    
    const deletedHistory = await BrowserHistory.findByIdAndDelete(req.params.id);
    if (deletedHistory) {
        res.status(200).json({
            status: 'success',
            data: deletedHistory
        });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
});

exports.getBrowserHistory = catchAsync(async (req, res, next) => {
    const filters = {};

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      // Extract the date parts (year, month, day) from the start and end dates
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();
      
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();
      
      // Construct new date objects with the extracted date parts
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

    console.log('Filters:', filters);

    const history = await BrowserHistory.find(filters);

    res.status(200).json({
        status: 'success',
        data: history
    });
});
