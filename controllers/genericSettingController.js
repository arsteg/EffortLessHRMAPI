const genericSetting = require('../models/Settings/genericSettingModel');
const genericSettingValue = require('../models/Settings/genericSettingValueModel');
const genericSettingListData = require('../models/Settings/genericSettingListDataModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('../utils/catchAsync');
const { findById } = require("../models/item"); 
const constants = require('../constants');

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
             if(req.body.values!=null)
              {
                for(var i = 0; i < req.body.values.length; i++) {                   
                    const newvaluesItem = await genericSettingValue.create({
                    genericSetting:createDocument._id,
                    value:req.body.values[i].value
                    });                  
                }
              }
              if(req.body.listData!=null)
              {
                for(var i = 0; i < req.body.listData.length; i++) {
                    const newvaluesItem = await genericSettingListData.create({
                    genericSetting:createDocument._id,
                    key:req.body.listData[i].key,
                    value:req.body.listData[i].value
                    });                  
                }
              }
        const documents = await genericSetting.findById(createDocument._id);
                
        const genericSettingValues = await genericSettingValue.find({}).where('genericSetting').equals(documents._id);  
        if(genericSettingValues) 
           {
               documents.genericSettingValue=genericSettingValues;
           }
           else{
               documents.genericSettingValue=null;
           }

           const genericSettingListDatas = await genericSettingListData.find({}).where('genericSetting').equals(documents._id);  
           if(genericSettingListDatas) 
              {
                  documents.genericSettingListData=genericSettingListDatas;
              }
              else{
                  documents.genericSettingListData=null;
              }
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: documents
        })


    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        })

    }

});
exports.delete = catchAsync(async (req, res, next) => {
    try {
        const deleteDocument = await genericSetting
            .findByIdAndDelete(req.params.id);
            const deleteGenericSettingValue = await genericSettingValue
            .deleteMany({genericSetting: req.params.id});
            const deletegenericSettingListData = await genericSettingListData
            .deleteMany({genericSetting: req.params.id});

        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: null
        })


    } catch (err) {
        res.status(400).json({
            status:constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.deleteGenericSettingValue = catchAsync(async (req, res, next) => {
    try {       
            const deleteGenericSettingValue = await genericSettingValue
            .findOneAndDelete(req.params.valuesId);
           
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: null
        })
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.deleteGenericSettingListData = catchAsync(async (req, res, next) => {
    try {          
            const deletegenericSettingListData = await genericSettingListData
            .findOneAndDelete(req.params.listDataId);

        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: null
        })
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.addGenericSettingValue = catchAsync(async (req, res, next) => {
    try {          
        if(req.body.values!=null)
        {
          for(var i = 0; i < req.body.values.length; i++) {            
              const newvaluesItem = await genericSettingValue.create({
              genericSetting:req.params.genericSettingId,
              value:req.body.values[i].value
              });                  
          }
        }
        const genericSettingValues = await genericSettingValue.find({}).where('genericSetting').equals(req.params.genericSettingId);  
        
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: genericSettingValues
        })
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.addGenericSettingListData = catchAsync(async (req, res, next) => {
    try {          
        if(req.body.listData!=null)
        {
          for(var i = 0; i < req.body.listData.length; i++) {            
              const newvaluesItem = await genericSettingListData.create({
              genericSetting:req.params.genericSettingId,
              key:req.body.listData[i].key,
              value:req.body.listData[i].value
              });                  
          }
        }
        const genericSettingListDatas = await genericSettingListData.find({}).where('genericSetting').equals(req.params.genericSettingId);  
       
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: genericSettingListDatas
        })
    } catch (err) {
        res.status(400).json({
            status:constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.getGenericSettingListData = catchAsync(async (req, res, next) => {
    try {          
       
        const genericSettingListDatas = await genericSettingListData.find({}).where('genericSetting').equals(req.params.genericSettingId);  
        
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: genericSettingListDatas
        })
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.getGenericSettingValue = catchAsync(async (req, res, next) => {
    try { 
        const genericSettingValues = await genericSettingValue.find({}).where('genericSetting').equals(req.params.genericSettingId);  
        res.status(201).json({
            status: constants.apiresponsestatus.success,
            body: genericSettingValues
        })
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});
exports.getById = catchAsync(async (req, res, next) => {
    try {
         const documents = await genericSetting.findById(req.params.id);
       
         const genericSettingValues = await genericSettingValue.find({}).where('genericSetting').equals(documents._id);  
         if(genericSettingValues) 
            {
                documents.genericSettingValue=genericSettingValues;
            }
            else{
                documents.genericSettingValue=null;
            }

            const genericSettingListDatas = await genericSettingListData.find({}).where('genericSetting').equals(documents._id);  
            if(genericSettingListDatas) 
               {
                   documents.genericSettingListData=genericSettingListDatas;
               }
               else{
                   documents.genericSettingListData=null;
               }
        res.status(200).json({
            status: constants.apiresponsestatus.success,
            body: documents
        });
    }
    catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
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
            status: constants.apiresponsestatus.success,
            data: updateDocument
        })

    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        })

    }
});
exports.getByIdAndDate = catchAsync(async (req, res, next) => {
    try 
    {
        let date = req.body.date;
        const getDocumentByDateAndId = await genericSetting
            .findById(req.params.id).where('date').equals(date);

        res.status(200).json({
            status: constants.apiresponsestatus.success,
            body: getDocumentByDateAndId
        });

    }
    catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
})
exports.getGenericSettingByUser = catchAsync(async (req, res, next) => {
    try {
       
        const documents = (await genericSetting.find({}).where('user').equals(req.cookies.userId).where('company').equals(req.cookies.companyId));
        if(documents)
        {
         for(var i = 0; i < documents.length; i++) {
         const genericSettingValues = await genericSettingValue.find({}).where('genericSetting').equals(documents[i]._id);  
         if(genericSettingValues) 
            {
                documents[i].genericSettingValue=genericSettingValues;
            }
            else{
                documents[i].genericSettingValue=null;
            }

            const genericSettingListDatas = await genericSettingListData.find({}).where('genericSetting').equals(documents[i]._id);  
            if(genericSettingListDatas) 
               {
                   documents[i].genericSettingListData=genericSettingListDatas;
               }
               else{
                   documents[i].genericSettingListData=null;
               }
         }  
        }
         res.status(200).json({
            status: constants.apiresponsestatus.success,
            body: documents
        });
    }
    catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            body: err
        });
    }
});

