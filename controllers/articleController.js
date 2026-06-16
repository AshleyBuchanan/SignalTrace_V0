const Article = require('../models/Article');
const { traceArticleFromUrl } = require('../services/articleTraceService');
const articleIngestService = require('../services/articleIngestService');

async function traceOneArticle(req, res) {
    console.log('TRACE ROUTE HIT');
    console.log('PARAMS:', req.params);
    try {
        const { id } = req.params;
        console.log('Looking up article...');

        const article = await Article.findById(id);
        console.log('Article lookup complete');

        if (!article) return res.status(404).json({ error: 'Article not found', });
        
        const articleUrl = article.link || article.url;
        console.log('Article URL:', articleUrl);

        if (!articleUrl) return res.status(400).json({ error: 'Article has no link to trace', });
    
        console.log('Starting trace...');
        const traceData = await traceArticleFromUrl(articleUrl);
        console.log('Trace complete. Updating MongoDB...');

        article.set(traceData);
        const updatedArticle = await article.save();
        console.log('MongoDB update complete');

        res.json({
            message: 'Article traced successfully',
            article: updatedArticle,
        });

    } catch (err) {
        if (err.name === 'AbortError') err.message = 'Article fetch timed out';

        console.log('TRACE ERROR:', err.message);

        if (req.params?.id) {
            const failedArticle = await Article.findById(req.params.id);

            if (failedArticle) {
                failedArticle.set({
                    traceStatus: 'failed',
                    traceError: err.message,
                    fetchedAt: new Date(),
                });

                await failedArticle.save();
            };
        };

        res.status(500).json({
            error: 'Failed to trace article',
            details: err.message,
        });
    };
};

async function manual_url_post(req, res) {
    console.log('MANUAL URL BODY:', req.body);
    console.log('MANUAL URL CONTENT-TYPE:', req.headers['content-type']);

    const { url } = req.body || {};
    if (!url) {
        return res.status(400).json({ error: 'No URL received by the server'});
    };

    try {
        const article = await articleIngestService.ingestUrl(url, {
            ingestionMethod: 'manual-url'
        });

        res.status(201).json({ article });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: 'Could not ingest that URL'
        });
    }
};

module.exports = { traceOneArticle, manual_url_post, };

