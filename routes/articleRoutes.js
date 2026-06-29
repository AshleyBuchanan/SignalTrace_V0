const express = require('express');
const router = express.Router();
const { traceOneArticle, manual_url_post,  } = require('../controllers/articleController');
const Article = require('../models/Article');

router.post('/retrieve', async (req, res) => {
    try {
        console.log('hit', req.body);

        const article = await Article.findById(req.body.rssItemId);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.status(200).json(article);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Could not retrieve article' });
    }
});

router.post('/manual', manual_url_post);
router.patch('/:id/trace', traceOneArticle);

module.exports = router;
