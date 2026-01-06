const express = require("express");
const ssoAuth = require("./SSOAuthInstance");

const ssoRouter = express.Router();

ssoRouter.get('/authUrl', (req, res) => {
    console.log('host: ', req.get('host'));
    console.log('origin:', req.get('origin'));
    console.log('referer:', req.get('referer'));
    console.log('req.headers:host:::::', req.headers.host, 'req.headers:::::', req.headers );
    return res.send({
        url: ssoAuth.getSilentAuthorizationUrl(req)
    });
});

ssoRouter.post('/token', ssoAuth.token);

ssoRouter.post('/refresh', ssoAuth.refresh);
ssoRouter.post('/revokeToken', ssoAuth.revokeToken);

module.exports = ssoRouter;
