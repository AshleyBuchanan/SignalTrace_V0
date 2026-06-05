const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    source: String,
    feedUrl: String,

    title: String,
    link: String,
    author: String,
    publishedAt: Date,

    summary: String,
    content: String,

    guid: String,
    categories: [String],

    raw: mongoose.Schema.Types.Mixed
});

articleSchema.statics.fromRssItem = function (item, feed, feedUrl) {
    return {
        source: feed.title,
        feedUrl,

        title: item.title || '',
        link: item.link || '',
        author: item.creator || item.author || item['dc:creator'] || '',
        publishedAt: item.isoDate || item.pubDate
            ? new Date(item.isoDate || item.pubDate)
            : null,
        
        summary: item.contentSnippet || item.description || '',
        content: item.content || item['content:encoded'] || '',

        guid: item.guid || item.id || item.link || '',
        categories: item.categories || [],

        raw: item
    };
};

const Article = mongoose.model('article', articleSchema);

module.exports = Article;