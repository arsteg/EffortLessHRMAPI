const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

exports.create_productivityModel = (req, res) => {
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
        res.status(201).json({
            message: 'Productivity Model created successfully',
            createdProductivityModel: {
                AppWebsite: result.AppWebsite,
                nonProductive: result.Non - productive,
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
      .catch (err => {
    res.status(500).json({
        error: err
    });
});
  };

exports.update_productivityModel = (req, res) => {
    const id = req.params.productivityModelId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    ProductivityModel.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Productivity Model updated',
                request: {
                    type: 'GET',
                    url: 'http://your-domain/productivityModel/' + id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_productivityModel = (req, res) => {
    const id = req.params.productivityModelId;
    ProductivityModel.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Productivity Model deleted',
                request: {
                    type: 'POST',
                    url: 'http://your-domain/productivityModel',
                    body: { AppWebsite: 'String', nonProductive: 'Boolean', Neutral: 'Boolean', Productive: 'Boolean', company: 'ObjectId'
                }
            }
        });
})
      .catch (err => {
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