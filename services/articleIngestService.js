const Article = require('../models/Article');
const { traceArticleFromUrl } = require('./articleTraceService');

async function ingestUrl(url, options = {}) {
    const normalizedUrl = normalizeUrl(url);
    console.log(`NURL: ${normalizedUrl}`);
    const existingArticle = await Article.findOne({
        $or: [
            { url: normalizedUrl },
            { link: normalizedUrl }
        ]
    });

    if (existingArticle && existingArticle.traceStatus === 'fetched') {
        return existingArticle;
    };

    console.log('tracing');
    const traceData = await traceArticleFromUrl(normalizedUrl);

    const articleData = Article.fromManualUrlParse(
        {
            ...traceData,
            url: traceData.finalUrl || normalizedUrl,
        },
        {
            ingestionMethod: options.ingestionMethod || 'manual-url'
        }
    );

    if (existingArticle) {
        const updatedArticle = await Article.findByIdAndUpdate(
            existingArticle._id,
            { $set: articleData },
            { returnDocument: 'after' }
        );
        return updatedArticle;
    }

    const article = await Article.create(articleData);

    return article;
}

function normalizeUrl(url) {
    const parsedUrl = new URL(url);
    parsedUrl.hash = '';
    return parsedUrl.toString();
}

module.exports = {
    ingestUrl,
};