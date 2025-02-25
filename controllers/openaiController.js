const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');
const KJUR = require('jsrsasign');
const OpenAI = require("openai");
const Project =  require('../models/projectModel');
const ProjectUser = require('../models/projectUserModel');
const Task = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError.js");
const cookieParser = require('cookie-parser');
const constants = require('../constants');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
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
      status: constants.APIResponseStatus.Success,
      data: assistantMessage.content[0].text.value,
    });
    
  } catch (error) {
    console.error('Error in testResponse:', error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
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

exports.generateQueryFromText = catchAsync(async (req, res, next) => {
  try {
    // 1. Validate input
    const { model, prompt } = req.body;
    if (!model || !prompt) {
      return next(new AppError('Model and prompt parameters are required', 400));
    }

    // 2. Validate model selection
    const Model = allowedModels[model];
    if (!Model) {
      return next(new AppError('Invalid model specified', 400));
    }

    // 3. Create a thread for the assistant
    const thread = await openai.beta.threads.create();

    // 4. Send user prompt to the assistant with strict JSON instructions
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Convert the following text into a MongoDB query for the '${model}' collection.
      Return ONLY the JSON query object without any explanation, markdown, or code blocks.
      Ensure it's a valid MongoDB query object:\n\n. The text is "${prompt}" for company id "${req.cookies.companyId}"`,
    });

    // 5. Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_85TsqvIuBCmF3x8nz573FRq5",
    });

    // 6. Wait for the response with timeout handling
    const startTime = Date.now();
    let runStatus;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      if (Date.now() - startTime > 30000) {
        throw new Error("Timeout waiting for assistant response");
      }

      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run terminated with status: ${runStatus.status}`);
      }

    } while (runStatus.status !== "completed");

    // 7. Retrieve assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id, { order: 'asc' });
    const assistantMessage = messages.data
      .reverse()
      .find(m => m.role === "assistant" && m.content[0]?.type === 'text');

    if (!assistantMessage) {
      throw new Error("No assistant response found");
    }

    // 8. Clean and parse the JSON output
    const responseText = assistantMessage.content[0].text.value;
    const cleanJson = responseText.replace(/```json\n|\n```/g, "").trim();

    let parsedQuery;
    try {
      parsedQuery = JSON.parse(cleanJson);
    } catch (error) {
      throw new Error(`Invalid JSON received: ${responseText}`);
    }

    // 9. Return the generated query
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: cleanJson,
    });

  } catch (error) {
    console.error('Error in generateQueryFromText:', error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: error.message,
    });
  }
});