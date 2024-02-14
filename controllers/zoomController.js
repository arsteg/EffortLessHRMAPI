const axios = require('axios');
const qs = require('qs');

exports.createZoomMeeting = async (req, res, next) => {
    try
    {      
        var access_token ="";     
        const accountId = process.env.ACCOUNTID; // Assuming ZOOM_ACCOUNT_ID is stored in environment variables
        const clientId = process.env.OAUTH_CLIENTID; // Assuming ZOOM_CLIENT_ID is stored in environment variables
        const clientSecret = process.env.OAUTH_CLIENTSECRET; // Assuming ZOOM_CLIENT_SECRET is stored in environment variables   
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const oAuthData = qs.stringify({
          grant_type: 'account_credentials',
          account_id: accountId
        });
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
          }
        };
      
        try {
          const response = await axios.post('https://zoom.us/oauth/token', oAuthData, config);
          if (response.status === 200) {
             access_token= response.data.access_token;
          } else {
            throw new Error('Failed to get access token');
          }
        } catch (error) {
          console.error('Error fetching access token:', error.message);
          throw error;
        }
      //  console.log(access_token);
        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }

        const start_time = new Date(); 
        let data = JSON.stringify({
            "topic":  req.body.topic,
            "type":  req.body.type,
            "start_time":  req.body.start_time,
            "duration":  req.body.duration,
            "password":  req.body.password,
            "settings": {
                "allow_multiple_devices":  req.body.allow_multiple_devices,
                "join_before_host":  req.body.join_before_host,
                "waiting_room":  req.body.join_before_host
            }
        });

        const meetingResponse = await axios.post(`${process.env.API_BASE_URL}/users/me/meetings`, data, { headers });

        if (meetingResponse.status !== 201) {
            return 'Unable to generate meeting link'
        }

        const response_data = meetingResponse.data;
        res.status(200).json({
            status: 'success',
            data: {
              meetingDeatils:response_data
            }
        });

    }catch (e) {
        console.log(e)
    }
}