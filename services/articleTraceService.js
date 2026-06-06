const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const primarySourceDomains = {
    'sec.gov':                  'SEC filing',
    'justice.gov':              'DOJ source',
    'fda.gov':                  'FDA source',
    'cdc.gov':                  'CDC source',
    'congress.gov':             'Congressional record',
    'federalregister.gov':      'Federal Register',
    'supreme.justia.com':       'Court opinion',
    'courtlistener.com':        'Court record',
    'arxiv.org':                'Research paper',
    'pubmed.ncbi.nim.nih.gov':  'Medical research',
}

function normalizeHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch (err) {
        return null;
    };
};

function classifyLink(url) {
    const hostname = normalizeHostname(url);

    if (!hostname) return null;

    if (primarySourceDomains[hostname]) {
        return {
            url,
            hostname,
            type: 'primary_source',
            label: primarySourceDomains[hostname],
            confidence: 0.95,
        };
    };

    if (hostname.endsWith('.gov')) {
        return {
            url,
            hostname,
            type: 'government_source',
            label: 'Government source',
            confidence: 0.85,
        };
    };

    if (hostname.endsWith('.edu')) {
        return {
            url,
            hostname,
            type: 'academic_source',
            label: 'Academic source',
            confidence: 0.75,
        };
    };

    return {
        url,
        hostname,
        type: 'secondary_source',
        label: 'Secondary source',
        confidence: 0.5,
    }
};

function extractLinks(document, baseURL) {
    const anchors = [...document.querySelectorAll('a[href]')];

    const links = anchors
    .map((a) => a.getAttribute('href'))
    .filter(Boolean)
    .map((href) => {
        try {
            return new URL(href, baseUrl).href;
        } catch(err) {
            return null;
        }
    })
    .filter(Boolean);

    return [...new Set(links)];
};

function calculateSignalScore(evidenceLinks) {
    if (!evidenceLinks.length) return 10;

    let score = 20;

    for (const link of evidenceLinks) {
        if (link.type === 'primary_source')         score += 25;
        else if (link.type === 'government_source') score += 20;
        else if (link.type === 'academic_source')   score += 15;
        else if (link.type === 'secondary_source')  score += 5;
    };

    return Math.min(score, 100);
}

function determineArticleType(evidenceLinks) {
    const hasPrimary    = evidenceLinks.some((link) => link.type === 'primary_source');
    const hasGovernment = evidenceLinks.some((link) => link.type === 'government_source');
    const hasAcademic   = evidenceLinks.some((link) => link.type === 'academic_source');

    if (hasPrimary || hasGovernment || hasAcademic) return 'source_supported_article';
    if (evidenceLinks.length > 0) return 'secondary_source_article';

    return 'unsupported_or_unlinked_article';
};

async function traceArticleFromUrl(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent':
            'SignalTraceBot/0.1 (+https://example.com; educational project',
            Accept: 'text/html,application/xhtml+xml',
        },
    });

    if (!response.ok) throw new Error(`Failed to fetch article. Status: ${response.status}`);

    const html = await response.text();
    const dom = new JSDOM(html, {url, });
    const document = dom.window.document;
    const reader = new Readability(document);
    const readableArticle = reader.parse();
    const outboundLinks = extractLinks(document, url);
    const classifiedLinks = outboundLinks
    .map(classifyLink)
    .filter(Boolean);

    const evidenceLinks = classifiedLinks.filter((link) => {
        return [
            'primary_source',
            'government_source',
            'academic_source',
        ].includes(link.type);
    });

    const signalScore = calculateSignalScore(evidenceLinks);
    const articleType = determineArticleType(evidenceLinks);

    return {
        title: readableArticle?.title || document.title || null,
        articleText: readableArticle?.textContent || '',
        excerpt: readableArticle?.excerpt || '',
        outboundLinks,
        evidenceLinks,
        signalScore,
        articleType,
        fetchedAt: new Date(),
        traceStatus: 'fetched',
    };
};

module.exports = { traceArticleFromUrl, };