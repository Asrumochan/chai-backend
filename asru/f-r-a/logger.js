

const logger = (log, severity = 'INFO') => {
    const date = new Date();
    const dateString = date.toISOString();
    const fullLog = `[${severity}][${dateString}] ${log}`;
    if (severity === 'INFO' || severity === 'WARN') {
        console.log(fullLog);
    } else {
        console.error(fullLog);
    }
}

const logError = (error, severity = 'ERR') => {
    const date = new Date();
    const dateString = date.toISOString();
    const fullLog = `[${severity}][${dateString}] ${error.name} ${error.message}`;
    if (severity === 'INFO' || severity === 'WARN') {
        console.log(fullLog);
        console.log(error.stack);
    } else {
        console.error(fullLog);
        // console.log(error.response.data);
    }
}

const routeLogger = (req, res, next) => {
    console.log("route logger");
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const log = `${method}: ${url} ${status}`;
    logger(log);
    next();
}

module.exports = { logger, routeLogger, logError };