const express = require('express');
const router = express.Router();
const { traceOneArticle } = require('../controllers/articleController');

router.patch('/:id/trace', traceOneArticle);

module.exports = router;
