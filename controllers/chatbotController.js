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
          model: 'text-embedding-ada-002',
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

    const text = req.body.userMessage.toLowerCase();
    console.log('User question:', text);
    if (!text) {
      return next(new AppError('Text is required in request body', 400));
    }

    // Generate embedding for the input text
    let searchEmbedding;
    try {
      const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
      });
      searchEmbedding = embeddingRes.data[0].embedding;
    } catch (err) {
      websocketHandler.sendLog(req, `Embedding failed: ${err.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError('Failed to generate embedding', 500));
    }

    // Find all chatbot entries and calculate similarity
    const chatbotEntries = await ChatbotData.find();
    const results = chatbotEntries.map(entry => {
      const similarity = cosineSimilarity(searchEmbedding, entry.embedding);
      return {
      answer: entry.answer,
      similarity
      };
    });

    // Sort by similarity and get top match
    const topMatch = results.sort((a, b) => b.similarity - a.similarity)[0];
    //console.log('Top match:', topMatch);
    // Only return if similarity is above threshold
    if (topMatch && topMatch.similarity > 0.8) {
      res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: topMatch.answer
      });
    } else {
      res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: [
          {
            type: "text",
            content: "I'm sorry, I couldn't find a good match for your question."
          }
        ]
      });
    }
  });

  // Helper function to calculate cosine similarity
  function cosineSimilarity(vector1, vector2) {
    const dotProduct = vector1.reduce((acc, val, i) => acc + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }