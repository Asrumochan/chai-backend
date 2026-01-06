const axios = require("axios");
const helpers = require("./authHelpers");
const { logError } = require('./logger'); 

class SSOAuth {
    constructor(options) {
        this.config = {
            ...options,
        };
    }

    getSilentAuthorizationUrl = (req) => {
        const {
            authorization_server_url,
            client_id,
            scope_values,
            acr_values,
        } = this.config;
        const referer = req.get('referer'),
              comInx = referer.indexOf('.com');
        let   redirect_uri = referer.substring(0, comInx) + '.com';
              if(comInx === -1){
                //   condition for localhost
                   redirect_uri = referer.split('/').slice(0,3).join('/');
                }
        const scope = scope_values.toLowerCase().split(",").join("%20");
        return `${authorization_server_url}?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}/&response_type=code&acr_values=${acr_values}`;
    };

    token = async (req, res) => {
        const params = new URLSearchParams();
        const { client_id, client_secret, token_server_url } = this.config;
        params.append("grant_type", "authorization_code");
        params.append("client_id", client_id);
        params.append("client_secret", client_secret);
        params.append("redirect_uri", req.body.redirect_uri);
        params.append("code", req.body.code);
        
        console.log("req.body:", req.body);
        console.log("token_server_url:", token_server_url);
        console.log("params:", params);

        axios
            .post(token_server_url, params)
            .then(async (token) => {
                // console.log("token data:", token.data);
                // Validate ID token
                const authenticated = await helpers.validateIdToken(token.data.id_token);
                if (!authenticated) {
                    res.status(403).json(`Unable to authenticate`);
                } else {
                    // Parse access token for the token expiration
                    const tokenExp = helpers.parseJwt(token.data.access_token).exp;
                    // Parse user info from ID token
                    const idToken = token.data.id_token;
                    const idTokenPayload = helpers.parseJwt(idToken);
                    const userGroups = idTokenPayload.msad_groups;
                    const obmSecureGroups = helpers.parseObmSecureGroups(userGroups);
                    console.log('idTokenPayload:::::::', idTokenPayload);
                    const userInfo = {
                        msId: idTokenPayload.sub,
                        preferredName: idTokenPayload.given_name,
                        fullName: idTokenPayload.given_name + ' ' + idTokenPayload.family_name,
                        email: idTokenPayload.email,
                        globalGroups: obmSecureGroups,
                    }
                    // Create token payload 
                    res.send({
                        accessToken: token.data.access_token,
                        refreshToken: token.data.refresh_token,
                        tokenExp,
                        userInfo
                    });
                }
            })
            .catch((err) => {
                logError(err);
                res.status(403).json({
                    reason: err.message,
                    error: err.response.data || null
                })
            });
    };

    refresh = async (req, res) => {
        const params = new URLSearchParams();
        const { client_id, client_secret, token_server_url } = this.config;
        params.append('grant_type', 'refresh_token');
        params.append('client_id', client_id);
        params.append('client_secret', client_secret);
        params.append('refresh_token', req.body.refresh_token);

        // console.log("req.body:", req.body);

        axios
            .post(token_server_url, params)
            .then(token => {
                // console.log('refresh token result:', token.data);
                const newAccessToken = token.data.access_token;
                // Parse access token for the token expiration
                const tokenExp = helpers.parseJwt(newAccessToken).exp;
                // console.log('new access token:', newAccessToken);
                res.send({
                    accessToken: newAccessToken,
                    tokenExp
                });
            })
            .catch(err => {
                logError(err);
                res.status(403).json({
                    reason: err.message,
                    error: err && err.response && err.response.data ?  err.response.data : null
                })
            });
    }

    revokeToken = async (req, res) => {
        const params = new URLSearchParams();
        const { client_id, client_secret, revoke_token_url } = this.config;
        params.append('token', req.body.refreshToken);
        params.append('token_type_hint', 'refresh_token');
        params.append('client_id', client_id);
        params.append('client_secret', client_secret);
        console.log("req.body:", req.body);
        axios
            .post(revoke_token_url, params)
            .then( dataRes => {
            console.log("response:");
                res.send({
                    status: dataRes.status,
                    statusText: dataRes.statusText,
                    data: dataRes.data
                });
            })
            .catch( err => {
                res.status(403).json({
                    reason: err.message,
                    error: err.response
                })
            });
    }
}

module.exports = SSOAuth;
