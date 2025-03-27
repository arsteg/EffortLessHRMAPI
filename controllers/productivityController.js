const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

exports.create_productivityModel = (req, res) => {
    websocketHandler.sendLog(req, 'Starting create_productivityModel process', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Creating new productivity model with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
    
    const productivityModel = new ProductivityModel({
        _id: new mongoose.Types.ObjectId(),
        AppWebsite: req.body.AppWebsite,
        nonProductive: req.body.nonProductive,
        Neutral: req.body.Neutral,
        Productive: req.body.Productive,
        company: req.body.company
    });
    
    productivityModel
        .save()
        .then(result => {
            websocketHandler.sendLog(req, `Successfully created productivity model with ID: ${result._id}`, constants.LOG_TYPES.INFO);
            res.status(201).json({
                message: 'Productivity Model created successfully',
                createdProductivityModel: {
                    AppWebsite: result.AppWebsite,
                    nonProductive: result.nonProductive, // Fixed typo from original 'Non - productive'
                    Neutral: result.Neutral,
                    Productive: result.Productive,
                    company: result.company,
                    request: {
                        type: 'GET',
                        url: 'http://your-domain/productivityModel/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            websocketHandler.sendLog(req, `Error creating productivity model: ${err.message}`, constants.LOG_TYPES.ERROR);
            res.status(500).json({
                error: err
            });
        });
};

exports.update_productivityModel = (req, res) => {
    websocketHandler.sendLog(req, 'Starting update_productivityModel process', constants.LOG_TYPES.INFO);
    const id = req.params.productivityModelId;
    const updateOps = {};
    
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    
    websocketHandler.sendLog(req, `Updating productivity model ID: ${id} with data: ${JSON.stringify(updateOps)}`, constants.LOG_TYPES.TRACE);
    
    ProductivityModel.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            websocketHandler.sendLog(req, `Successfully updated productivity model ID: ${id}`, constants.LOG_TYPES.INFO);
            res.status(200).json({
                message: 'Productivity Model updated',
                request: {
                    type: 'GET',
                    url: 'http://your-domain/productivityModel/' + id
                }
            });
        })
        .catch(err => {
            websocketHandler.sendLog(req, `Error updating productivity model ID: ${id}: ${err.message}`, constants.LOG_TYPES.ERROR);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_productivityModel = (req, res) => {
    websocketHandler.sendLog(req, 'Starting delete_productivityModel process', constants.LOG_TYPES.INFO);
    const id = req.params.productivityModelId;
    websocketHandler.sendLog(req, `Attempting to delete productivity model with ID: ${id}`, constants.LOG_TYPES.TRACE);
    
    ProductivityModel.remove({ _id: id })
        .exec()
        .then(result => {
            websocketHandler.sendLog(req, `Successfully deleted productivity model ID: ${id}`, constants.LOG_TYPES.INFO);
            res.status(200).json({
                message: 'Productivity Model deleted',
                request: {
                    type: 'POST',
                    url: 'http://your-domain/productivityModel',
                    body: { 
                        AppWebsite: 'String', 
                        nonProductive: 'Boolean', 
                        Neutral: 'Boolean', 
                        Productive: 'Boolean', 
                        company: 'ObjectId'
                    }
                }
            });
        })
        .catch(err => {
            websocketHandler.sendLog(req, `Error deleting productivity model ID: ${id}: ${err.message}`, constants.LOG_TYPES.ERROR);
            res.status(500).json({
                error: err
            });
        });
};
// exports.get_productivityModel = (req, res) => {
//     const id = req.params.productivityModelId;
//     ProductivityModel.findById(id)
//         .exec()
//         .then(doc => {
//             if (doc) {
//                 res(200).json({

//                 })
//             }
// }    