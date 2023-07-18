const Task = require('../models/taskModel');
const TaskUser = require('../models/taskUserModel');
const User = require('../models/permissions/userModel');
const TaskAttachments = require('../models/taskAttachmentModel');
const catchAsync = require('../utils/catchAsync');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
const AppError = require('../utils/appError');
const Tag = require('../models/task/tagModel');
const TaskTag = require('../models/Task/taskTagModel');
const Comment  = require('../models/Task/taskCommentModel');
const CommonController  = require('../controllers/commonController');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const sendEmail = require('../utils/email');
// AZURE STORAGE CONNECTION DETAILS
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
throw Error("Azure Storage Connection string not found");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);

exports.deleteTask = catchAsync(async (req, res, next) => {
 // const newTaskUserList = await TaskUser.findOneAndDelete({}).where('task').equals(req.params.id);  
 const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Test").where('company').equals(req.cookies.companyId); 
 const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);  
  if(newTaskUserList)
  {
    for(var j = 0; j < newTaskUserList.length; j++) 
    { 
     
      const user = await User.findOne({ _id: newTaskUserList[j].user });        
      const document = await TaskUser.findByIdAndDelete(newTaskUserList[j]._id);
      if (!document) {
        return next(new AppError('No document found with that ID', 404));
      }
      else
      {
        if(user){   
          console.log(user.email);
          await sendEmail({
            email: user.email,
            subject:emailTemplate.Name,
            message:emailTemplate.contentData
          });  
      }
      }
    }
  }
  //const newTaskAttachmentList = await TaskAttachments.findOneAndDelete({}).where('task').equals(req.params.id);
  const document = await Task.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateTask =  catchAsync(async (req, res, next) => {

  const document = await Task.findOneAndUpdate(req.params.id, req.body, {
    new: false, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: document
    }
  });
});

exports.updateFlex =  catchAsync(async (req, res, next) => {    
  const updates = {};  
  Object.keys(req.body).forEach((key) => {
    updates[key] = req.body[key];
  })
    
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: false, runValidators: true }
  );
  if(!task) return res.status(404).send({ error: 'Task not found'});     
  res.status(201).json({
    status: 'success',
    data: {
      data: task
    }
  });
});

exports.getTask  = catchAsync(async (req, res, next) => {    
const task = await Task.findById(req.params.id); 
const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);  
const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.params.id);  
 
  
res.status(200).json({
  status: 'success',
  data: {
    task: task,
    newTaskUserList:newTaskUserList,
    newTaskAttachmentList:newTaskAttachmentList
  }
});  
});

exports.getTaskUsers  = catchAsync(async (req, res, next) => {    
  
  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);  
  
  res.status(200).json({
    status: 'success',
    data: {
    taskUserList:newTaskUserList
    }
  });  
});

exports.getTaskAttachments  = catchAsync(async (req, res, next) => {    
    const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.params.id);  
    res.status(200).json({
      status: 'success',
      data: {
      newTaskAttachmentList:newTaskAttachmentList
      }
    });  
});
exports.getTaskListByUser  = catchAsync(async (req, res, next) => {    
  var taskList=[];

    const newTaskUserList = await TaskUser.find({}).where('user').equals(req.body.userId);  
    if(newTaskUserList)
      {
      
       for(var i = 0; i < newTaskUserList.length; i++) {
        if(newTaskUserList[i].task)
        {
           
           const task = await Task.findById(newTaskUserList[i].task._id);  const taskUser = await TaskUser.find({}).where('task').equals(task._id);  
          if(taskUser) 
          {
            task.TaskUsers=taskUser;
          }
          else{
            task.TaskUsers=null;
          }
           taskList.push(task);
         }  
        }
      }
      
      res.status(200).json({
      status: 'success',
      data: {
        taskList:taskList
      }
    });   
});
exports.getTaskUser  = catchAsync(async (req, res, next) => {    
    const newTaskUser = await TaskUser.find({}).where('_id').equals(req.params.id);      
    res.status(200).json({
      status: 'success',
      data: {
      taskUser:newTaskUser
      }
    });  
});
exports.updateTaskUser =  catchAsync(async (req, res, next) => {
  const taskUsersexists = await TaskUser.find({}).where('_id').equals(req.params.id).where('user').equals(req.body.user);  
  
  if (taskUsersexists.length>0) {
    return next(new AppError('Task User already exists.', 403));
  }
  else{ 
   
    const document = await TaskUser.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  else
  { 
    const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Test").where('company').equals(req.cookies.companyId); 
  
    if(document){   
      const user = await User.findOne({ _id: document.user });
      await sendEmail({
        email: user.email,
        subject:emailTemplate.Name,
        message:emailTemplate.contentData
      });  
}
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: document
    }
  });
}
});
exports.getTaskAttachment  = catchAsync(async (req, res, next) => {    
      const newTaskAttachment = await TaskAttachments.find({}).where('_id').equals(req.params.id);  
      res.status(200).json({
        status: 'success',
        data: {
        newTaskAttachment:newTaskAttachment
        }
      });  
});
exports.updateTaskAttachments =  catchAsync(async (req, res, next) => {
  const document = await TaskAttachments.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: document
    }
  });
});
exports.addTask = catchAsync(async (req, res, next) => { 

  // Upload Capture image on block blob client 
var taskNumber=0;
const taskList = await Task.find({}).where('company').equals(req.cookies.companyId).where('project').equals(req.body.project);  
if(taskList)
{ 
  taskNumber=taskList.length+1;
}
const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Test").where('company').equals(req.cookies.companyId); 
 
  const newTask = await Task.create({
    taskName: req.body.taskName,
    startDate:req.body.startDate,
    endDate :req.body.endDate,
    startTime: req.body.startTime,
    description:req.body.description,
    comment :req.body.comment,
    isSubTask: false,
    priority:req.body.priority,
    company:req.cookies.companyId,
    project:req.body.project,
    status:req.body.status,
    title:req.body.title,
    description:req.body.description,
    parentTask:req.body.parentTask,
    estimate:req.body.estimate,
    timeTaken:req.body.timeTaken,
    isDeleted:req.body.isDeleted,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
    taskNumber:taskNumber

  });  
  
  if(req.body.user!=null)
  {
    const newTaskUserItem = await TaskUser.create({
      task:newTask._id,
      user:req.body.user,
      company:req.cookies.companyId,
      status:"Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
    });  
    if(newTaskUserItem){   
      const user = await User.findOne({ _id: newTaskUserItem.user });     
      await sendEmail({
        email: user.email,
        subject:emailTemplate.Name,
        message:emailTemplate.contentData
      });  
    }
  }
  if(req.body.taskAttachments!=null)
  {
  for(var i = 0; i < req.body.taskAttachments.length; i++) {
    const blobName = "Capture" + uuidv1() + ".png";
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log("\nUploading to Azure storage as blob:\n\t", );
    // Upload data to the blob
    var FileString =  req.body.taskAttachments[i].file;
    const buffer = new Buffer.from(FileString, 'base64');
    const uploadBlobResponse = await blockBlobClient.upload(buffer,buffer.length);
    const url=process.env.CONTAINER_URL_BASE_URL+ process.env.CONTAINER_NAME+"/"+blobName; 
    console.log(
      "Blob was uploaded successfully. requestId: ",
      uploadBlobResponse.requestId
    );

      const newTaskUserItem = await TaskAttachments.create({
      task:newTask._id,
      attachmentType:req.body.taskAttachments[i].attachmentType,
      attachmentName:req.body.taskAttachments[i].attachmentName,
      attachmentSize:req.body.taskAttachments[i].attachmentSize,
      extention:req.body.taskAttachments[i].extention,
      filePath:blobName,
      status:"Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      company: req.cookies.companyId,
      url:url
    });  
  }
}

  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(newTask._id); 
  const newTaskUserList = await TaskUser.find({}).where('task').equals(newTask._id);  
  res.status(200).json({
    status: 'success',
    data: {
      newTask: newTask,
      newTaskUserList:newTaskUserList,
      newTaskAttachmentList:newTaskAttachmentList
    }
  });
});

exports.addTaskUser = catchAsync(async (req, res, next) => { 
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Test").where('company').equals(req.cookies.companyId);   
  // Upload Capture image on block blob client 
  const taskUsersExists = await TaskUser.find({}).where('task').equals(req.body.task);    
  var newTaskUserItem=null;
  if (taskUsersExists.length>0) {
    console.log(taskUsersExists);
    newTaskUserItem = await TaskUser.findByIdAndUpdate(taskUsersExists.id, req.body, {
        new: true, // If not found - add new
        runValidators: true // Validate data
    });
  console.log(newTaskUserItem);
  }
  else {
    newTaskUserItem = await TaskUser.create({
      task:req.body.task,
      user:req.body.user,
      company:req.cookies.companyId,
      status:"Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
    });    

   if(newTaskUserItem){   
        const user = await User.findOne({ _id: newTaskUserItem.user });      
        await sendEmail({
          email: user.email,
          subject:emailTemplate.Name,
          message:emailTemplate.contentData
        });  
    }
  
  }
  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.body.task);  
  res.status(200).json({
    status: 'success',
    data: {      
      TaskUserList:newTaskUserList
    }
  });
});

exports.deleteTaskUser = catchAsync(async (req, res, next) => {
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Delete Task").where('company').equals(req.cookies.companyId); 
  const taskUser = await TaskUser.findOne({ _id: req.params.id });
  const user = await User.findOne({ _id: taskUser.user });
    
  const document = await TaskUser.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  else
  {
    if(taskUser){   
       console.log(user.email);
      await sendEmail({
        email: user.email,
        subject:emailTemplate.Name,
        message:emailTemplate.contentData
      });  
  }
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.addTaskAttachment = catchAsync(async (req, res, next) => { 

  // Upload Capture image on block blob client 
for(var i = 0; i < req.body.taskAttachments.length; i++) {
    
    const blobName = "Capture" + uuidv1() + req.body.taskAttachments[i].extention;
  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  console.log("\nUploading to Azure storage as blob:\n\t", );
  // Upload data to the blob
  var FileString =  req.body.taskAttachments[i].file;
  const buffer = new Buffer.from(FileString, 'base64');
  const uploadBlobResponse = await blockBlobClient.upload(buffer,buffer.length);
  const url=process.env.CONTAINER_URL_BASE_URL+ process.env.CONTAINER_NAME+"/"+blobName; 
 
  console.log(
    "Blob was uploaded successfully. requestId: ",
    uploadBlobResponse.requestId
  );
    const newTaskAttachment = await TaskAttachments.create({
      task:req.body.taskId,
      attachmentType:req.body.taskAttachments[i].attachmentType,
      attachmentName:req.body.taskAttachments[i].attachmentName,
      attachmentSize:req.body.taskAttachments[i].attachmentSize,
      extention:req.body.taskAttachments[i].extention,
      filePath:blobName,
      status:"Active",
      comment:req.body.comment,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      company: req.cookies.companyId,
      url: url
    });    
  

  if(req.body.comment!="")
  {  
    const newTaskAttachmentList = await TaskAttachments.find({}).where('comment').equals(req.body.comment);  
    res.status(200).json({
      status: 'success',
      data: {
        taskAttachmentList:newTaskAttachmentList
      }
    });
 
  }
  else
  {
  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.body.taskId);  
   res.status(200).json({
    status: 'success',
    data: {
      taskAttachmentList:newTaskAttachmentList
    }
  });
  }

}
});
exports.deleteTaskAttachment = catchAsync(async (req, res, next) => {
  const document = await TaskAttachments.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
 // Get Country List
exports.getTaskList = catchAsync(async (req, res, next) => {    
    const taskList = await Task.find({}).where('company').equals(req.cookies.companyId).skip(req.body.skip).limit(req.body.next);  
    const taskCount = await Task.countDocuments({ "company": req.cookies.companyId });
     if(taskList)
    {
     for(var i = 0; i < taskList.length; i++) {
     const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id);  
     if(taskUser) 
        {
          taskList[i].TaskUsers=taskUser;
        }
        else{
          taskList[i].TaskUsers=null;
        }
     }
    } res.status(200).json({
      status: 'success',
      data: {
        taskList: taskList,
        taskCount:taskCount
      }
    });  
});
exports.getTaskListByProject = catchAsync(async (req, res, next) => {    
  const taskList = await Task.find({}).where('company').equals(req.cookies.companyId).where('project').equals(req.params.projectId);  
  if(taskList)
  {
   for(var i = 0; i < taskList.length; i++) {
   const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id);  
   if(taskUser) 
      {
        taskList[i].TaskUsers=taskUser;
      }
      else{
        taskList[i].TaskUsers=null;
      }
   }
  }
   res.status(200).json({
    status: 'success',
    data: {
      taskList: taskList
    }
  });  
});


exports.getTaskListByParentTask = catchAsync(async (req, res, next) => {    
  const taskList = await Task.find({}).where('parentTask').equals(req.params.taskId); 
  if(taskList)
  {
   for(var i = 0; i < taskList.length; i++) {
   const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id);  
   if(taskUser) 
      {
        taskList[i].TaskUsers=taskUser;
      }
      else{
        taskList[i].TaskUsers=null;
      }
   }
  } res.status(200).json({
    status: 'success',
    data: {
      taskList: taskList
    }
  });  
});

exports.getUserTaskListByProject = catchAsync(async (req, res, next) => {
  var results=[];

let taskUsers =  await TaskUser.find({"user":req.body.userId});// .where('user':);//.equals().select('task').where('project').equals(req.body.projectId);// ({project:{id:{$eq:req.body.projectId}}});
for(var i = 0; i < taskUsers.length; i++) {
  if(taskUsers[i].task?.project?.id==req.body.projectId)  {  
    const taskUser = await TaskUser.find({}).where('task').equals( taskUsers[i].task._id);  
    if(taskUser) 
    {
      taskUsers[i].task.TaskUsers=taskUser;
    }
    else{
      taskUsers[i].task.TaskUsers=null;
    }     
    results.push(taskUsers[i].task);
  }
}
 res.status(200).json({
  status: 'success',
  data: results
});  
});
//Tag management
exports.addTag = catchAsync(async (req, res, next) => {  
  const tagExists = await Tag.find( {"title":
    { $regex: new RegExp("^" + req.body.title.toLowerCase(), "i") } }).where('company').equals(req.cookies.companyId);

  if(tagExists.length>0){
    res.status(403).send({ error: 'Tag already exists.' });    
  }
  else{
  const newTag = await Tag.create({
    title:req.body.title,
    company:req.cookies.companyId,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId
  });
   res.status(200).json({
    status: 'success',
    data: newTag
  }); 
} 
  });

  exports.updateTag = catchAsync(async (req, res, next) => { 
    
    let tagExists = await Tag.find( {"_id": req.body.id}).where('company').equals(req.cookies.companyId);  
    if(tagExists.length==0){
      res.status(403).send({ error: `Tag doesn't exist.`});    
    }
    else{          
      tagExists.title=req.body.title;
      const newTag = await Tag.updateOne( { _id: req.body._id }, { $set: { _id: req.body._id, title: req.body.title }} ).exec();            
     res.status(200).json({
      status: 'success',
      data: newTag
    }); 
  } 
    });
  
  exports.deleteTagById = async (req, res) => {
      try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if (!tag) {
          return res.status(404).send();
        }
        res.send(tag);
      } catch (err) {
        res.status(500).send({ error: 'Server error' });
      }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).send();
    }
    res.send(tag);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};


exports.getTagsByTaskId = catchAsync(async (req, res, next) => {    
    // Find all TaskTag documents that match the taskId    
     const taskId = req.params.taskId;
     if(taskId.length<=1){      
       const allTags = await Tag.find({ company: req.cookies.companyId }).sort({ title: 1 });      
       res.status(200).json({
        status: 'success',
        data: allTags
      });       
    }
    else{
      const taskTags = await TaskTag.find({ task: req.params.taskId });
      // Extract the tag ids from the TaskTag documents
      const tagIds = taskTags.map((taskTag) => taskTag.tag);    
      // Find all Tag documents that match the tag ids
      const tags = await Tag.find({ _id: { $in: tagIds}}).sort({ title: 1 });
      res.status(200).json({
        status: 'success',
        data: tags
      });
    }   
}); 

exports.getTags = async (req, res) => {
  try {       
    console.log(`started getTags`);
    console.log(`req.cookies.companyId: ${req.cookies.companyId}`);
    // Find all Tag documents that match the tag ids
    const tags = await Tag.find({ company: req.cookies.companyId });

    res.send(tags);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

//end tag management



//Start Task Tags

exports.createTaskTag = async (req, res) => {
  console.log(req.body);
  try {
    const taskTag = new TaskTag(req.body);
    await taskTag.save();
    res.status(201).send(taskTag);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

exports.getAllTaskTags = async (req, res) => {
  try {
    const taskTags = await TaskTag.find();
    console.log(taskTags);
    res.send(taskTags);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

exports.getCommentsByTaskId = async (req, res) => {
  Comment.find({ task: givenTaskId })
  .sort('commentedAt') // sort by commentedAt ascending
  .populate('author', 'username') // populate author username
  .populate({
    path: 'parent',
    populate: { path: 'author', select: 'username' }
  }) // recursively populate parent comments' authors' usernames
  .exec((err, comments) => {
    if (err) {
      console.log(err);
      return;
    }
    const nestedComments = comments.reduce((acc, comment) => {
      if (!comment.parent) {
        acc.push(comment);
      } else {
        const parent = acc.find(c => c._id.equals(comment.parent._id));
        parent.replies.push(comment);
      }
      return acc;
    }, []);
    console.log(nestedComments);
  });
};

exports.getTaskTagById = async (req, res) => {
  try {
    const taskTag = await TaskTag.findById(req.params.id).populate('task').populate('tag');
    if (!taskTag) {
      return res.status(404).send();
    }
    res.send(taskTag);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

exports.updateTaskTagById = async (req, res) => {
  try {
    const taskTag = await TaskTag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('task').populate('tag');
    if (!taskTag) {
      return res.status(404).send();
    }
    res.send(taskTag);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

exports.deleteTaskTagById = async (req, res) => {
  try {
    const taskTag = await TaskTag.findByIdAndDelete(req.params.id).populate('task').populate('tag');
    if (!taskTag) {
      return res.status(404).send();
    }
    res.send(taskTag);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

//END Task Tags


//Start Comment

exports.createComment = catchAsync(async (req, res, next) => {    
  const { content, author, task, commentedAt, parent, status, commentType } = req.body;
  // create a new Comment document
  const comment = new Comment({
    content,
    author,
    task,
    commentedAt,
    parent,
    status,
    commentType
  });
  const newComment = await comment.save();
  if(req.body.taskAttachments!=null)
  {
  for(var i = 0; i < req.body.taskAttachments.length; i++) {
    const blobName = "Capture" + uuidv1() + ".png";
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log("\nUploading to Azure storage as blob:\n\t", );
    // Upload data to the blob
    var FileString =  req.body.taskAttachments[i].file;
    const buffer = new Buffer.from(FileString, 'base64');
    const uploadBlobResponse = await blockBlobClient.upload(buffer,buffer.length);
    const url=process.env.CONTAINER_URL_BASE_URL+ process.env.CONTAINER_NAME+"/"+blobName; 
   
    console.log(
      "Blob was uploaded successfully. requestId: ",
      uploadBlobResponse.requestId
    );
    const newTaskUserItem = await TaskAttachments.create({
      task:newComment.taskId,
      attachmentType:req.body.taskAttachments[i].attachmentType,
      attachmentName:req.body.taskAttachments[i].attachmentName,
      attachmentSize:req.body.taskAttachments[i].attachmentSize,
      extention:req.body.taskAttachments[i].extention,
      comment:newComment._id,
      filePath:blobName,
      status:"Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      company: req.cookies.companyId,
      url:url
    });  
  }
}
  res.status(200).json({
    status: 'success',
    data: newComment
  });     
}); 

exports.getAllTaskTags = async (req, res) => {
  try {
    const taskTags = await TaskTag.find();
    console.log(taskTags);
    res.send(taskTags);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send();
    }
    res.send(comment);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
};

exports.updateComment = async (req, res) => {
  const document = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: document
    }
  });

};

exports.deleteComment = async (req, res) => {
  try {
    console.log(`delete comment with id ${req.params.id}`);
    const result = await Comment.findByIdAndDelete(req.params.id);
    if(result){
    res.status(200).json({ message: 'Comment deleted successfully' });
  }
  else{
    res.status(404).json({ message: 'Comment not found'});
  }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllComments = catchAsync(async (req, res, next) => {
  
  console.log(`Task id ${req.params.id}`);

  let comments = await Comment.find({task: req.params.id}); 
  res.status(200).json({
    status: 'success',
    data: comments
  });
  });
  
//END Task Tags
