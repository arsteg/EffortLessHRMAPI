const genericSetting = require('../models/Settings/genericSettingModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('../utils/catchAsync');
const { findById } = require("../models/item");

exports.addNew = catchAsync(async (req, res, next) => {
    
     try {       
            const createDocument = await genericSetting.create({
                CategoryName:req.body.CategoryName,
                ControlType:req.body.ControlType,
                ControlLabel :req.body.ControlLabel,
                ToolTip: req.body.ToolTip,
                FieldName: req.body.FieldName,
                company: req.cookies.companyId,
                user: req.cookies.userId,
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
        const deleteDocument = await genericSetting
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
        const getDocumentByID = await genericSetting.findById(req.params.id);
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
        const updateDocument = await genericSetting.findByIdAndUpdate(req.params.id, req.body, {
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
        // console.log(req.params.id);
        // console.log(req.body.date);
        const getDocumentByDateAndId = await genericSetting
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

exports.getGenericSettingByUser = catchAsync(async (req, res, next) => {
    try {
        console.log(req.params.id);
        const documents = await genericSetting.find({}).where('user').equals(req.cookies.userId).where('company').equals(req.cookies.companyId);
        res.status(200).json({
            status: 'success',
            body: documents
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'failed',
            body: err
        });
    }
});

