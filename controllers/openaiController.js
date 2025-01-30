const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');
const KJUR = require('jsrsasign');
const OpenAI = require("openai");
const Project =  require('../models/projectModel');
const ProjectUser = require('../models/projectUserModel');
const Task = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


exports.testResponse = async (req, res, next) => {
  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add user message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: req.body.prompt
    });

    // Create a run with the assistant ID
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_85TsqvIuBCmF3x8nz573FRq5"
    });

    // Add timeout and status handling
    const startTime = Date.now();
    let runStatus;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      // Handle timeout after 30 seconds
      if (Date.now() - startTime > 30000) {
        throw new Error("Timeout waiting for assistant response");
      }

      // Handle failed status
      if (runStatus.status === 'failed') {
        throw new Error(`Run failed: ${runStatus.last_error?.message}`);
      }
      
      // Handle other non-completable statuses
      if (['cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run terminated with status: ${runStatus.status}`);
      }

    } while (runStatus.status !== "completed");

    // Get the assistant's response with proper sorting
    const messages = await openai.beta.threads.messages.list(thread.id, {
      order: 'asc' // Get messages in chronological order
    });

    // Find the first assistant message after the user message
    const assistantMessage = messages.data
      .reverse() // Reverse to get descending order
      .find(m => m.role === "assistant" && m.content[0]?.type === 'text');

    if (!assistantMessage) {
      throw new Error("No assistant response found");
    }

    // Send the response
    res.status(200).json({
      status: "success",
      data: assistantMessage.content[0].text.value,
    });
    
  } catch (error) {
    console.error('Error in testResponse:', error);
    res.status(500).json({
      status: "error",
      message: error.message,
      ...(error.response?.data ? { details: error.response.data } : {})
    });
  }
};



const allowedModels = {
  project: Project,
  projectUser: ProjectUser,
  task: Task  
};

exports.runDynamicQuery = catchAsync(async (req, res, next) => {
  // 1. Validate input parameters
  const { model, query, options } = req.body;
  
  if (!model || !query) {
    return next(new AppError('Model and query parameters are required', 400));
  }

  // 2. Validate model selection
  const Model = allowedModels[model.toLowerCase()];
  if (!Model) {
    return next(new AppError('Invalid model specified', 400));
  }

  // 3. Safely parse query and options
  let parsedQuery;
  let parsedOptions = {};
  
  try {
    parsedQuery = JSON.parse(query);
    if (options) {
      parsedOptions = JSON.parse(options);
    }
  } catch (err) {
    return next(new AppError('Invalid JSON format in query/options', 400));
  }

  // 4. Security sanitization
  const sanitizedQuery = {};
  for (const [key, value] of Object.entries(parsedQuery)) {
    // Add additional security checks here based on your schema
    if (typeof value === 'object' && value !== null) {
      sanitizedQuery[key] = value;
    } else {
      sanitizedQuery[key] = { $eq: value };
    }
  }

  // 5. Build base query
  let dbQuery = Model.find(sanitizedQuery);

  // 6. Apply query options
  if (parsedOptions.select) {
    dbQuery = dbQuery.select(parsedOptions.select);
  }
  
  if (parsedOptions.sort) {
    dbQuery = dbQuery.sort(parsedOptions.sort);
  }
  
  if (parsedOptions.skip) {
    dbQuery = dbQuery.skip(Number(parsedOptions.skip));
  }
  
  if (parsedOptions.limit) {
    dbQuery = dbQuery.limit(Number(parsedOptions.limit));
  }
  
  if (parsedOptions.populate) {
    dbQuery = dbQuery.populate(parsedOptions.populate);
  }

  // 7. Execute query
  const results = await dbQuery;

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      data: results
    }
  });
});