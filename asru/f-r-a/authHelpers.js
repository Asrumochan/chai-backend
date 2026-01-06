require("dotenv").config(); // configures environment variables
const jose = require("jose");
const { logError, logger } = require('./logger'); 

// Parse a user's list of secure groups for OBM secure groups
parseObmSecureGroups = userSecureGroups => {
    const validUserSecureGroups = [];
    const prodNonProd = process.env.SECURE_GROUP_PARSER_ENV;
    const obmSecureGroups = [];

    console.log('env-------------', prodNonProd);
    // List of OBM nonprod secure groups
    if (prodNonProd === 'dev') {
        obmSecureGroups.push('renewal51_app_dev');
        obmSecureGroups.push('renewal51plus_reports_nonprod');
        obmSecureGroups.push('renewal51plus_admin_flyers_nonprod');
        obmSecureGroups.push('renewal51plus_audit_nonprod');
        obmSecureGroups.push('renewal51plus_casestatus_nonprod');
        obmSecureGroups.push('AZU_censusxformatter_Dev');
        obmSecureGroups.push('AZU_censusxformatter_admin_Dev');
    }
    else if(prodNonProd === 'stage') {
        obmSecureGroups.push('renewal51_app_master');
        obmSecureGroups.push('renewal51plus_reports_nonprod');
        obmSecureGroups.push('renewal51plus_admin_flyers_nonprod');
        obmSecureGroups.push('renewal51plus_audit_nonprod');
        obmSecureGroups.push('renewal51plus_casestatus_nonprod');
        obmSecureGroups.push('AZU_censusxformatter_Dev');
        obmSecureGroups.push('AZU_censusxformatter_admin_Dev');
    }
    else if(prodNonProd === 'prod'){
        obmSecureGroups.push('renewal51_app');
        obmSecureGroups.push('renewal51plus_admin_flyers_prod');
        obmSecureGroups.push('renewal51plus_audit_prod');
        obmSecureGroups.push('renewal51plus_casestatus_prod');
        obmSecureGroups.push('renewal51plus_reports_prod');
        obmSecureGroups.push('AZU_censusxformatter_Dev');
        obmSecureGroups.push('AZU_censusxformatter_admin_Dev');
      }
    
    // If a user only has one IMD secure group, SSO will set msad_groups to a string rather than an array
    if (!Array.isArray(userSecureGroups)) {
        // Check if the secure group matches a valid OBM secure group
        if (obmSecureGroups.includes(userSecureGroups)) {
            validUserSecureGroups.push(userSecureGroups);
        }
    }

    // Parse user secure groups for OBM secure groups only
    for (const secureGroup of userSecureGroups) {
        if (obmSecureGroups.includes(secureGroup)) {
            validUserSecureGroups.push(secureGroup);
        }
    }
    return validUserSecureGroups;
};

// Decode JWT
parseJwt = token => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// Validate the ID token to verify that the user is authenticated
validateIdToken = async token => {
    const expectedIssuer = process.env.AUTH_DOMAIN;
    const expectedAud = process.env.CLIENT_ID;
    const splitArr = token.split('.');
    let jwtHeader = {};
    let jwtPayload = {};

    if (splitArr.length !== 3) {
        return new Error.TokenValidationError('Cannot decode a malformed JWT');
    }

    try {
        jwtHeader = JSON.parse(Buffer.from(splitArr[0], 'base64').toString());
        jwtPayload = JSON.parse(Buffer.from(splitArr[1], 'base64').toString());
    } catch (e) {
        return new Error.TokenValidationError('Token header or payload is not valid JSON');
    }

    const jwtEncoded = splitArr[2];
    const alg = jwtHeader.alg;
    const kid = jwtHeader.kid;
    const aud = jwtPayload.aud;
    const sub = jwtPayload.sub;
    const iss = jwtPayload.iss;
    const exp = jwtPayload.exp;
    const iat = jwtPayload.iat;
    const auth_time = jwtPayload.auth_time;

    // Verify the issuer claim (iss) matches the expected issuer
    if (!iss || iss !== expectedIssuer) {
        logger("Issuer (iss) claim in the ID token does not match the expected issuer, iss claim:", iss);
        return false;
    }

    // Verify the audience claim (aud) contains the OAuth2 client_id
    if (!aud || (typeof aud === 'string' && aud !== expectedAud)) {
        logger("Audience (aud) claim in the ID token does not match the expected client ID, aud claim:", aud);
        return false;
    }
    if (Array.isArray(aud) && !aud.includes(expectedAud)) {
        logger("Audience (aud) claim in the ID token does not contain the expected client ID, aud claim:", aud);
        return false;
    }
    // If the token contain multiple audiences, then verify that an Authorized Party claim (azp) is present
    // If the azp claim is present, verify it matches the OAuth2 client_id
    if (Array.isArray(aud) && aud.length > 1) {
        if (!jwtPayload.azp || jwtPayload.azp !== expectedAud) {
            logger("Authorized party (azp) claim in the ID token does not match the expected client ID, azp claim:", jwtPayload.azp);
            return false;
        }
    }

    // Verify the current time is prior to the expiry claim (exp) time value
    const now = Date.now();
    const expDateTime = new Date(0);
    expDateTime.setUTCSeconds(exp);
    if (!exp || now > expDateTime) {
        logger("Expiration time (exp) claim error. Token has expired, exp:", exp);
        return false;
    }

    // Verify ID token signature using the JWKS endpoint
    try {
        const jwksURI = process.env.AUTH_DOMAIN + "/pf/JWKS";
        const JWKS = jose.createRemoteJWKSet(new URL(jwksURI));
        const { payload, protectedHeader } = await jose.jwtVerify(token, JWKS, {
            issuer: iss,
            audience: aud,
        });
        // console.log(protectedHeader);
        // console.log("jwtVerify payload:", payload);
        return true;
    } catch (err) {
        logError(err);
        return false;
    }
};


module.exports = { parseObmSecureGroups, parseJwt, validateIdToken };
