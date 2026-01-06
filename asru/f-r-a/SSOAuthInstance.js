require("dotenv").config(); // configures environment variables

const SSOAuth = require("./SSOAuth");

var sso = new SSOAuth({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
  authorization_server_url: process.env.AUTHORIZATION_SERVER_URL,
  token_server_url: process.env.TOKEN_SERVER_URL,
  acr_values: process.env.ACR_VALUES,
  scope_values: process.env.SCOPE_VALUES,
  // revoke_token_url: process.env.REVOKE_SERVER_URL
  // user_info_endpoint: process.env.USER_INFO_ENDPOINT,
});

/*var sso = new SSOAuth({
  client_id: "Reg1Dev_qrt",
  client_secret: "Zcpyi@vz24VJ<h2QQfxA@GPYQYq3QmjdkuDwoVuxKh5p",
  redirect_uri: "https://renewal-ui-dev.elr.optum.com/",
  authorization_server_url: "https://authgateway1-dev.entiam.uhg.com/as/authorization.oauth2",
  token_server_url: "https://authgateway1-dev.entiam.uhg.com/as/token.oauth2",
  acr_values: "R1_AAL1_MS-AD-Kerberos",
  scope_values: "openid,profile,email",
  // user_info_endpoint: process.env.USER_INFO_ENDPOINT,
 });
 */

module.exports = sso;
