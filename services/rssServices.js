const Parser = require('rss-parser');
const Article = require('../models/Article');
const articleIngestService = require('./articleIngestService');

// pre-am
const parser = new Parser();

// rss feeds
const feedArray = [
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best',
  'https://feeds.nbcnews.com/msnbc',
  'https://www.lemonde.fr/en/international/rss_full.xml',
  'https://news.google.com/rss/search?q=site%3Areuters.com&hl=en-US&gl=US&ceid=US%3Aen'
];

// rss collecting and storing
async function collectFeeds() {
    for( let feedUrl of feedArray) {

        try {
            const feed = await parser.parseURL(feedUrl);

            // cycle through each item in the current feed and store them
            for (const item of feed.items) {
                const articleData = Article.fromRssItem(item, feed, feedUrl);

                // if the article doesn't exist, it will create one
                await Article.updateOne(
                    articleData,
                    { $set: articleData },
                    { upsert: true }
                );
            };

            console.log(feedUrl, ': success');
        } catch (err) {
            console.log(feedUrl, ': bad :', err.message)
        };
    };

    //cycle through all db items and fetch(trace) if needed
    const items = await Article.find({traceStatus: { $ne: 'fetched' } });
    console.log(items.length)
    for (const item of items) {
               const articleUrl = item?.url || item?.link || null;

        if (!articleUrl) {
            console.log(`Article ${item._id} has no URL to trace`);
            continue;
        };

        try {
            const article = await articleIngestService.ingestUrl(articleUrl);

            if (!article) {
                console.log(`Article failed to trace: ${articleUrl}`);
            } else {
                console.log(`Article: ${article.title}: successfully traced`);
            }
        } catch (err) {
            const message = err.name === 'AbortError'
                ? 'Request timed out or was aborted'
                : err.message;

            console.log(`Article failed to trace: ${articleUrl}: ${message}`);

            await Article.findByIdAndUpdate(item._id, {
                traceStatus: 'failed',
                traceError: message,
            });
        };
    };
};


module.exports = { collectFeeds };