const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { detectSourceClues } = require('./cluePatternsService');
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
    'pubmed.ncbi.nlm.nih.gov':  'Medical research',
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

function extractLinks(document, baseUrl) {
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

function hasUsableArticleText(articleText) {
    return articleText.trim().length >= 200;
};

function isGoogleRedirectHost(url) {
    const hostname = normalizeHostname(url);

    return [
        'google.com',
        'news.google.com'
    ].includes(hostname);
};


function determineArticleType(evidenceLinks, sourceClues, outboundLinks, articleUrl) {
    const hasEvidenceLinks = evidenceLinks.length > 0;
    const hasSourceClues = sourceClues.length > 0;

    const articleHostname = normalizeHostname(articleUrl);

    const hasMostlyInternalLinks = outboundLinks.length > 0 && outboundLinks.every((link) => {
        return normalizeHostname(link) === articleHostname;
    });

    if (hasEvidenceLinks)       return 'source_supported_article';
    if (hasSourceClues)         return 'source_referenced_but_unlinked';
    if (hasMostlyInternalLinks) return 'mostly_internal_links';

    return 'unsupported_or_unclear';
};


async function traceArticleFromUrl(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
            controller.abort()
    }, 5000);

    let response;
    try {
        response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent':
                'SignalTrace/0.1 (+https://example.com; educational project)',
                Accept: 'text/html,application/xhtml+xml',
            },
        });
    } finally {
        clearTimeout(timeout);
    };
    
    if (!response.ok) throw new Error(`Failed to fetch article. Status: ${response.status}`);

    const finalUrl = response.url || url;
    if(isGoogleRedirectHost(finalUrl)) {
        throw new Error('Google redirect did not resolve to publisher article');
    };

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) throw new Error(`Unsupported content type: ${contentType}`);

    const html = await response.text();
    const dom = new JSDOM(html, {url: finalUrl });
    const document = dom.window.document;
    const reader = new Readability(document);
    const readableArticle = reader.parse();

    const title = readableArticle?.title || document.title || null;
    const articleText = readableArticle?.textContent || '';
    const traceStatus = hasUsableArticleText(articleText)
    ? 'fetched'
    : 'metadata-only';

    console.log('Finding authors...');
    const jsonLdAuthors = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap((script) => {
        try {
            const parsed = JSON.parse(script.textContent);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
            return [];
        };
    })
    .flatMap((item) => {
        const author = item?.author;

        if (!author) return [];
        if (Array.isArray(author)) return author;
        return [author];
    })
    .map((author) => {
        if (typeof author === 'string') return author;
        return author?.name || null;
    })                              
    .filter(Boolean);
    
    const metadataAuthor = 
        document.querySelector('meta[name="author"]')?.content ||
        document.querySelector('meta[property="article:author"]')?.content ||
    null;

    const author = 
        readableArticle?.byline ||
        jsonLdAuthors[0] ||
        metadataAuthor ||
    null;
    
    const sourceClues = detectSourceClues(articleText);

    const excerpt = readableArticle?.excerpt || '';
    
    console.log('Article parsed. Extracting links...');
    const outboundLinks = extractLinks(document, finalUrl);
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

    console.log('Determining evidence links, signalScore, and article type...');
    const signalScore = calculateSignalScore(evidenceLinks);
    const articleType = determineArticleType(
        evidenceLinks,
        sourceClues,
        outboundLinks,
        finalUrl
    );

    console.log('Done');

    return {
        title,
        author,
        articleText,
        excerpt,
        outboundLinks,
        evidenceLinks,
        sourceClues,
        signalScore,
        articleType,
        finalUrl,
        fetchedAt: new Date(),
        traceStatus,
        traceError: traceStatus === 'metadata-only'
        ? 'Fetched HTML, but no usable article text was extracted'
        : null,
    };
};

module.exports = { traceArticleFromUrl, };