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
const  websocketHandler  = require('../utils/websocketHandler');

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
      return next(new AppError(req.t('openAI.ParametersAreRequired'), 400));
    }

    // 2. Validate model selection
    const Model = allowedModels[model];
    if (!Model) {
      return next(new AppError(req.t('openAI.invalidModel'), 400));
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


exports.chatbot = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting chatbot', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Processing question: ${req.body.userMessage}`, constants.LOG_TYPES.TRACE);

  try {
    // Get the user question
    const userQuestion = req.body.userMessage.toLowerCase();

    const qaDataString = `
    Q: How to create user?
    A: Open effortlesshrm.com. Click signup button. Enter valid details and create.
    Q: How to forgot password?
    A: Open effortlesshrm.com. Click forgot password link. Enter your registered email and follow the instructions.
    Q: How to update profile details?
    A: Navigate to My Profile, click Edit, update the details, and click Save.
    Q: How to change email address?
    A: Go to Account Settings > Email. Enter your new email and confirm with password.
    Q: How to apply leave?
    A: Go to Leave section. Click Apply Leave, select leave type, date, and submit.
    Q: How to check leave balance?
    A: Visit Leave Dashboard to view available leave balances for each type.
    Q: How to cancel approved leave?
    A: Go to Leave History, select the leave entry, and click Cancel Request.
    Q: Who approves the leave request?
    A: Leave requests are approved by the reporting manager assigned to the employee.
    Q: How to mark attendance?
    A: Log in to the system. Go to Attendance > Mark Attendance. Click Check-in.
    Q: How to view attendance report?
    A: Navigate to Attendance > Reports. Select the date range and click Generate.
    Q: Can I edit my attendance entry?
    A: No, only the HR/Admin has permission to modify attendance entries.
    Q: What is considered a half-day?
    A: Working less than 4 hours in a day is considered a half-day.
    Q: How to generate payslip?
    A: Go to Payroll > Payslips. Select employee and month, then click Generate.
    Q: How to download my payslip?
    A: Go to Payroll > My Payslips, select the month, and click Download PDF.
    Q: When is salary processed?
    A: Salary is processed on the last working day of every month.
    Q: How are deductions calculated?
    A: Deductions are based on leave balance, tax policy, and statutory compliance rules.
    Q: How to post a new job opening?
    A: Go to Recruitment > Job Openings. Click New Job, fill in the details, and publish.
    Q: How to track candidate applications?
    A: Go to Recruitment > Applications to view and filter candidate status.
    Q: How to generate performance report?
    A: Navigate to Reports > Performance. Select employee and date range, then click Generate.
    Q: Can I export reports to Excel?
    A: Yes, reports can be exported to Excel or PDF using the Export button.
    `.trim();
    //const qaDataString = JSON.stringify(qaData);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: userQuestion
        },
        {
          role: "system",
          content: `Provide the answer of: "${userQuestion}" user query from: \n${qaDataString} data\n. Only give a direct answer`
        }
      ]
    });

    const foundAnswer = response.choices[0].message.content;
    const answer = foundAnswer && foundAnswer.trim() !== ''
      ? foundAnswer
      : "Sorry, I couldn't find an answer to that question.";

    websocketHandler.sendLog(req, `Found answer: ${answer}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        answer: answer
      }
    });

  } catch (error) {
    websocketHandler.sendLog(req, `Error in chatbot: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "Sorry, I'm having trouble processing your question right now."
    });
  }
});

// exports.chatbot = catchAsync(
//   async (req, res, next) => {
//     websocketHandler.sendLog(req, 'Starting chatbot', constants.LOG_TYPES.INFO);
//     websocketHandler.sendLog(req, `Processing question: ${req.body.userMessage}`, constants.LOG_TYPES.TRACE);
//     try {
//       // Read the JSON file
//       const jsonPath = path.join(__dirname, '..', 'chatbotquestionanswer.docx');
//       const qaData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
//       // Get the question from request
//       const userQuestion = req.body.userMessage.toLowerCase();
//       // Find best matching question/answer
//       let bestMatch = {
//         answer: "Sorry, I couldn't find an answer to that question.",
//         similarity: 0
//       };
      
//       // const response = await openai.chat.completions.create({
//       //   model: "gpt-4o",
//       //   messages: [
//       //     {
//       //       role: "user",
//       //       content: userQuestion
//       //     },
//       //     {
//       //       role: "system",
//       //       content: `Show the answer from this JSON data based on the question: "${userQuestion}". Only give a direct answer. JSON: \n${qaDataString}`
//       //     }
//       //   ]
//       // });
  
//       // console.log("Response:", response.choices[0].message.content);
//       //response.choices[0].message.content //will pass this in response. 


//       qaData.forEach(qa => {
//         // Calculate similarity between user question and stored question
//         const storedQuestion = qa.question.toLowerCase();
//         const similarity = calculateSimilarity(userQuestion, storedQuestion);

//         if (similarity > bestMatch.similarity && similarity > 0.1) { // 0.1 threshold for minimum match
//           bestMatch = {
//             answer: qa.answer,
//             similarity: similarity
//           };
//         }
//       });
//       websocketHandler.sendLog(req, `Found answer with similarity: ${bestMatch.similarity}`, constants.LOG_TYPES.INFO);
      
//       res.status(200).json({
//         status: constants.APIResponseStatus.Success,
//         data: {
//           answer: bestMatch.answer
//         }
//       });    

//     } catch (error) {
//       websocketHandler.sendLog(req, `Error in chatbot: ${error.message}`, constants.LOG_TYPES.ERROR);
//       res.status(200).json({
//         status: constants.APIResponseStatus.Failure,
//         data: "Sorry, I'm having trouble processing your question right now."
//       });
//     }
//   }
// );

// // Helper function to calculate similarity between two strings
// function calculateSimilarity(str1, str2) {
//   const words1 = str1.split(' ');
//   const words2 = str2.split(' ');
  
//   const commonWords = words1.filter(word => words2.includes(word));
//   const similarity = (2.0 * commonWords.length) / (words1.length + words2.length);
  
//   return similarity;
// }
