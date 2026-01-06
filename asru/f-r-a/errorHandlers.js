const errorHandler = (error, req, res, next) => {
	const status = error.statusCode || error.status || 500;
	res.status(status).send(error);
}

const notFoundHandler = (req, res, next) => {
	const message = 'Resource not found';
	res.status(404).send(message);
}

module.exports = { errorHandler, notFoundHandler };