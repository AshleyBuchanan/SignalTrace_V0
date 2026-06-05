const Parser = require('rss-parser');
const Article = require('../models/Article');

// pre-am
const parser = new Parser();

// rss feeds
const feedArray = [
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best',
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
        }
    };
};

module.exports = { collectFeeds };