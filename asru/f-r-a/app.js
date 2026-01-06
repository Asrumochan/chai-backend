const express = require('express');
const cors = require('cors'); // Express middleware to enable CORS with various options

const ssoRouter = require('./ssoRouter');
const { routeLogger, logger } = require('./logger'); 
const { errorHandler, notFoundHandler } = require('./errorHandlers');

const app = express();
const port = 8080;

/**
 *  App Configuration
 */

app.use(express.json());
app.use(cors());

app.get('/healthCheck', (req, res) => {
	return res.status(200).send('Healthy.');
});

app.use('/auth', ssoRouter);

app.use(errorHandler);
app.use(notFoundHandler);
app.use(routeLogger);

/**
 * Server Activation
 */

app.listen(port, () => {
	logger(`Listening on port ${port}`);
});