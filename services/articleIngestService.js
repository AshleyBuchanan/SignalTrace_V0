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
            url: normalizedUrl,
        },
        {
            ingestionMethod: options.ingestionMethod || 'manual-url'
        }
    );

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