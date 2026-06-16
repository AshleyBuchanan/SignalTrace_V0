const express = require('express');
const router = express.Router();
const { traceOneArticle, manual_url_post,  } = require('../controllers/articleController');

router.post('/manual', manual_url_post);
router.patch('/:id/trace', traceOneArticle);

module.exports = router;
