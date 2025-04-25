const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');
const KJUR = require('jsrsasign');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

exports.createZoomMeeting = async (req, res, next) => {
    try {
        websocketHandler.sendLog(req, 'Starting Zoom meeting creation process', constants.LOG_TYPES.INFO);
        websocketHandler.sendLog(req, `Request body: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.DEBUG);

        var access_token = "";
        const accountId = process.env.ACCOUNTID;
        const clientId = process.env.OAUTH_CLIENTID;
        const clientSecret = process.env.OAUTH_CLIENTSECRET;

        websocketHandler.sendLog(req, 'Preparing OAuth credentials', constants.LOG_TYPES.TRACE);
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

        websocketHandler.sendLog(req, 'Attempting to fetch access token', constants.LOG_TYPES.INFO);
        try {
            const response = await axios.post(process.env.AUTH_TOKEN_URL, oAuthData, config);
            websocketHandler.sendLog(req, `Access token request status: ${response.status}`, constants.LOG_TYPES.DEBUG);
            
            if (response.status === 200) {
                access_token = response.data.access_token;
                websocketHandler.sendLog(req, 'Successfully obtained access token', constants.LOG_TYPES.INFO);
            } else {
                throw new Error(req.t('zoom.accessTokenFailed'));
            }
        } catch (error) {
            websocketHandler.sendLog(req, `Error fetching access token: ${error.message}`, constants.LOG_TYPES.ERROR);
            throw error;
        }

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        };

        websocketHandler.sendLog(req, 'Preparing meeting creation data', constants.LOG_TYPES.TRACE);
        const start_time = new Date();
        let data = JSON.stringify({
            "topic": req.body.topic,
            "type": req.body.type,
            "start_time": req.body.start_time,
            "duration": req.body.duration,
            "password": req.body.password,
            "settings": {
                "allow_multiple_devices": req.body.allow_multiple_devices,
                "join_before_host": req.body.join_before_host,
                "waiting_room": req.body.join_before_host
            }
        });

        websocketHandler.sendLog(req, 'Sending meeting creation request to Zoom API', constants.LOG_TYPES.INFO);
        const meetingResponse = await axios.post(`${process.env.API_BASE_URL}/users/me/meetings`, data, { headers });

        if (meetingResponse.status !== 201) {
            websocketHandler.sendLog(req, `Meeting creation failed with status: ${meetingResponse.status}`, constants.LOG_TYPES.WARN);
            return res.status(400).json({
                status: constants.APIResponseStatus.Error,
                message: req.t('zoom.meetingCreationFailed')


            });
        }

        const response_data = meetingResponse.data;
        websocketHandler.sendLog(req, 'Successfully created Zoom meeting', constants.LOG_TYPES.INFO);
        websocketHandler.sendLog(req, `Meeting details: ${JSON.stringify(response_data)}`, constants.LOG_TYPES.DEBUG);

        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: {
                meetingDeatils: response_data
            }
        });

    } catch (e) {
        websocketHandler.sendLog(req, `Fatal error in createZoomMeeting: ${e.message}`, constants.LOG_TYPES.FATAL);
        res.status(500).json({
            status: constants.APIResponseStatus.Error,
            message: req.t('zoom.internalServerError')


        });
    }
};

exports.createMeetingSingture = async (req, res, next) => {
    try {
        websocketHandler.sendLog(req, 'Starting meeting signature creation process', constants.LOG_TYPES.INFO);
        websocketHandler.sendLog(req, `Request body: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.DEBUG);

        const APPKEY = process.env.CLIENTID;
        const APPSECREAT = process.env.CLIENTSECRET;
        
        websocketHandler.sendLog(req, 'Generating JWT timestamp values', constants.LOG_TYPES.TRACE);
        const currentTimeUTC = new Date();
        const iat = Math.round(currentTimeUTC.getTime() / 1000) - 30;
        const exp = iat + 60 * 60 * 2;

        const oHeader = { alg: 'HS256', typ: 'JWT' };
        const oPayload = {
            sdkKey: APPKEY,
            mn: req.body.meetingNumber,
            role: req.body.role,
            iat: iat,
            exp: exp,
            appKey: APPKEY,
            tokenExp: iat + 60 * 60 * 2
        };

        websocketHandler.sendLog(req, 'Creating JWT signature', constants.LOG_TYPES.INFO);
        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);
        const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, APPSECREAT);

        websocketHandler.sendLog(req, 'Successfully generated meeting signature', constants.LOG_TYPES.INFO);
        websocketHandler.sendLog(req, `Generated signature length: ${signature.length}`, constants.LOG_TYPES.DEBUG);

        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: {
                signature: signature
            }
        });

    } catch (e) {
        websocketHandler.sendLog(req, `Fatal error in createMeetingSingture: ${e.message}`, constants.LOG_TYPES.FATAL);
        return next(new AppError(req.t('zoom.internalServerError'), 500));
    }
};