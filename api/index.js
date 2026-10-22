// Vercel Serverless Function entry point
// This file simply exports the Express app defined in the backend.
const app = require('./../backend/src/app');
module.exports = app;
