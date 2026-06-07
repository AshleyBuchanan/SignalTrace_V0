const Article = require('../models/Article');
const { traceArticleFromUrl } = require('../services/articleTraceService');

async function traceOneArticle(req, res) {
    console.log('TRACE ROUTE HIT');
    console.log('PARAMS:', req.params);
    try {
        const { id } = req.params;
        console.log('Looking up article...')
        const article = await Article.findById(id);
        console.log('Article lookup complete')
        if (!article) return res.status(404).json({ error: 'Article not found', });
        
        const articleUrl = article.link || article.url;
        console.log('Article URL:', articleUrl);
        if (!articleUrl) return res.status(400).json({ error: 'Article has no link to trace', });
    
        console.log('Starting trace...')
        const traceData = await traceArticleFromUrl(articleUrl);

        console.log('Trace complete. Updating MongoDB...')
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            {
                $set: traceData,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        console.log('MongoDB update complete')
        res.json({
            message: 'Article traced successfully',
            article: updatedArticle,
        });

    } catch (err) {
        if (err.name === 'AbortError') err.message = 'Article fetch timed out';

        console.log('TRACE ERROR:', err.message);

        if (req.params?.id) {
            await Article.findByIdAndUpdate(req.params.id, {
                $set: {
                    traceStatus: 'failed',
                    traceError: err.message,
                    fetchedAt: new Date(),
                },
            });
        }
        res.status(500).json({
            error: 'Failed to trace article',
            details: err.message,
        });
    }
}

module.exports = { traceOneArticle, };

