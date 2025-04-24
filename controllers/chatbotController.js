const OpenAI = require("openai");
const ChatbotData = require('../models/chatbotModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError.js");
const cookieParser = require('cookie-parser');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

exports.createChatbot = catchAsync(async (req, res, next) => {
    console.log('Request body:', req.body);
    websocketHandler.sendLog(req, 'Creating chatbot data', constants.LOG_TYPES.TRACE);
    // const companyId = req.cookies.companyId;
  
    // if (!companyId) {
    //   websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    //   return next(new AppError(req.t('user.companyIdRequired'), 400));
    // }
  
    const inputData = req.body;
  
    if (!Array.isArray(inputData)) {
      return next(new AppError('Invalid input format. Expected an array of questions.', 400));
    }
  
    const results = [];
    console.log('Input data:', inputData);
    for (const item of inputData) {
      const questionText = item.Question;
      const answerJson = item.Answer;
      console.log('questionText:', questionText);
      console.log('answerJson:', answerJson);
      let embedding = null;
      try {
        const embeddingRes = await openai.embeddings.create({
          model: 'text-embedding-3-small', //'text-embedding-ada-002',
          input: questionText,
        });
        embedding = embeddingRes.data[0].embedding;
      } catch (err) {
        websocketHandler.sendLog(req, `Embedding failed: ${err.message}`, constants.LOG_TYPES.ERROR);
        return next(new AppError('Failed to generate embedding', 500));
      }
  
      const chatbotEntry = await ChatbotData.create({
        //company: companyId,
        question: questionText,
        answer: answerJson,
        embedding: embedding,
      });
  
      console.log('chatbotEntry._id:', chatbotEntry._id);
      results.push({ id: chatbotEntry._id });
      websocketHandler.sendLog(req, `Chatbot entry created for question: "${questionText}"`, constants.LOG_TYPES.INFO);
    }
  
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: `${results.length} chatbot entries created.`,
      data: results,
    });
  });

  exports.getChatbot = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Retrieving chatbot data', constants.LOG_TYPES.TRACE);

    const chatbotEntries = await ChatbotData.find();

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: chatbotEntries
    });
  });


  exports.searchChatbot = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Searching chatbot data', constants.LOG_TYPES.TRACE);

    const text = req.body.userMessage?.toLowerCase();
    if (!text) {
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: [{
        type: "text",
        content: "Enter correct message."
        }]
      });
    }

    try {
      // Generate embedding for input text
      const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small', //'text-embedding-ada-002'
      input: text,
      });
      const searchEmbedding = embeddingRes.data[0].embedding;

      // Find best matching entry from chatbot data
      const chatbotEntries = await ChatbotData.find();
      let bestMatch = null;
      let highestSimilarity = 0;

      for (const entry of chatbotEntries) {
        const similarity = cosineSimilarity(searchEmbedding, entry.embedding);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = entry;
        }
      }
      console.log('Best match:', bestMatch.question);
      console.log('Highest similarity:', highestSimilarity);
      // Return best match if similarity > 0.8
      if (bestMatch && highestSimilarity > 0.8) {
        return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: bestMatch.answer
        });
      }

      console.log('No good match found, falling back to OpenAI Assistant.');
      // Fallback to OpenAI Assistant
      const thread = await openai.beta.threads.create();
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: text
      });
      console.log('thread and message created');
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: process.env.CHATBOTASSISTANT_ID
      });

      // Poll for completion
      let runStatus;
      do {
        await new Promise(r => setTimeout(r, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      } while (runStatus.status !== "completed");

      const messages = await openai.beta.threads.messages.list(thread.id);
      if (!messages.data || messages.data.length === 0) {
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: [{
        type: "text",
        content: "I'm sorry, I couldn't find a good match for your question."
        }]
      });
      }

      const assistantResponse = messages.data[0].content[0].text.value;
      return res.status(200).json({
      status: constants.APIResponseStatus.Success,
        data: [{
          type: "text",
          content: assistantResponse
        }]
      });

    } catch (error) {
        websocketHandler.sendLog(req, `Error: ${error.message}`, constants.LOG_TYPES.ERROR);
        return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: [{
          type: "text",
          content: "I'm sorry, I couldn't find a good match for your question."
          }]
        });
      }
    });

    function cosineSimilarity(vector1, vector2) {
    const dotProduct = vector1.reduce((acc, val, i) => acc + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
    }
