function deriveSourceFromUrl(url) {
  if (!url || typeof url !== 'string') return '';

  try {
    const { hostname } = new URL(url);

    const ignoredSubdomains = ['www', 'feeds', 'feed', 'rss', 'news'];

    const parts = hostname.split('.');

    while (parts.length > 2 && ignoredSubdomains.includes(parts[0])) {
      parts.shift();
    }

    return parts[0] || '';
  } catch (err) {
    return '';
  }
}

module.exports = {
  deriveSourceFromUrl,
};