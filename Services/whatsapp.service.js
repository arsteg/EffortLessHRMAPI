const axios = require('axios');

exports.sendTemplateMessage = async ({
  recipientNumber,
  templateName,
  languageCode = 'en_US',
  headerParams = [],
  bodyParams = []
}) => {
  try {

    const components = [];

    // ✅ HEADER COMPONENT
    if (headerParams.length) {
      components.push({
        type: 'header',
        parameters: headerParams.map(text => ({
          type: 'text',
          text
        }))
      });
    }

    // ✅ BODY COMPONENT
    if (bodyParams.length) {
      components.push({
        type: 'body',
        parameters: bodyParams.map(text => ({
          type: 'text',
          text
        }))
      });
    }
    const templatePayload = {
      name: templateName,
      language: { code: languageCode }
    };

    if (components.length > 0) {
      templatePayload.components = components;
    }
    console.log('WhatsApp API request components:', {
      components: JSON.stringify(templatePayload)
    });
    const response = await axios({
      url: `https://graph.facebook.com/${process.env.WHATSAPPAPIVERSION}/${process.env.WHATSAPPPHONE_NUMBER_ID}/messages`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPPTOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'template',
        template: templatePayload
      }
    });

    console.log('✅ WhatsApp API success:', {
      to: recipientNumber,
      template: templateName,
      messageId: response.data?.messages?.[0]?.id
    });

    return response.data;

  } catch (error) {
    console.error('❌ WhatsApp API error:', {
      to: recipientNumber,
      template: templateName,
      status: error.response?.status,
      error: error.response?.data || error.message
    });
    throw error;
  }
};


// const axios = require('axios');

// exports.sendTemplateMessage = async ({
//   recipientNumber,
//   templateName,
//   languageCode = 'en_US',
//   headerParams = [],
//   bodyParams = []
// }) => {
//   try {
//     const response = await axios({
//       url: `https://graph.facebook.com/${process.env.WHATSAPPAPIVERSION}/${process.env.WHATSAPPPHONE_NUMBER_ID}/messages`,
//       method: 'post',
//       headers: {
//         Authorization: `Bearer ${process.env.WHATSAPPTOKEN}`,
//         'Content-Type': 'application/json'
//       },
//       data: {
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: recipientNumber,
//         type: 'template',
//         template: {
//           name: templateName,
//           language: { code: languageCode },
//           components: bodyParams.length
//             ? [{
//                 type: 'body',
//                 parameters: bodyParams.map(text => ({
//                   type: 'text',
//                   text
//                 }))
//               }]
//             : []
//         }
//       }
//     });

//     // ✅ LOG SUCCESS RESPONSE
//     console.log('WhatsApp API success:', {
//       to: recipientNumber,
//       template: templateName,
//       messageId: response.data?.messages?.[0]?.id,
//       response: response.data
//     });

//     return response.data;

//   } catch (error) {
//     // ✅ LOG ERROR RESPONSE
//     console.error('WhatsApp API error:', {
//       to: recipientNumber,
//       template: templateName,
//       status: error.response?.status,
//       error: error.response?.data || error.message
//     });

//     throw error; // rethrow so caller knows it failed
//   }
// };
