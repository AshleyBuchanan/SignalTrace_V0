const mongoose = require('mongoose');

const evidenceLinkSchema = new mongoose.Schema(
    {
        url: String,
        hostname: String,
        type: String,
        label: String,
        confidence: Number,
    },
    { _id:false }
);

const sourceClueSchema = new mongoose.Schema(
    {
        phrase: String,
        type: String,
        label: String,
        confidence: Number,
    },
    { _id: false }
);

const articleSchema = new mongoose.Schema(
    {
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

        raw: mongoose.Schema.Types.Mixed,

        fetchedAt: Date,
        articleText: String,
        excerpt: String,
        outboundLinks: [String],
        evidenceLinks: [evidenceLinkSchema],
        sourceClues: [sourceClueSchema],

        articleType: String,
        signalScore: Number,
        traceStatus: {
            type: String,
            enum: ['rss_only', 'fetched', 'failed'],
            default: 'rss_only',
        },
        traceError: String,
    },
    { timestamps: true }
);

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