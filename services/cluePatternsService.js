function detectSourceClues(articleText) {
    const text = articleText.toLowerCase();

    const cluePatterns = [
        {
            phrase: "according to police",
            type: "official_statement_reference",
            label: "References police as source",
            confidence: 0.65,
        },
        {
            phrase: "police said",
            type: "official_statement_reference",
            label: "References police statement",
            confidence: 0.65,
        },
        {
            phrase: "officials said",
            type: "official_statement_reference",
            label: "References officials",
            confidence: 0.55,
        },
        {
            phrase: "court documents",
            type: "legal_document_reference",
            label: "References court documents",
            confidence: 0.8,
        },
        {
            phrase: "court records",
            type: "legal_document_reference",
            label: "References court records",
            confidence: 0.8,
        },
        {
            phrase: "according to the department of justice",
            type: "government_source_reference",
            label: "References DOJ",
            confidence: 0.8,
        },
        {
            phrase: "according to the fbi",
            type: "government_source_reference",
            label: "References FBI",
            confidence: 0.8,
        },
        {
            phrase: "said in a statement",
            type: "statement_reference",
            label: "References a statement",
            confidence: 0.6,
        },
        {
            phrase: "according to a report",
            type: "report_reference",
            label: "References a report",
            confidence: 0.6,
        },
        {
            phrase: "the associated press contributed",
            type: "wire_service_reference",
            label: "References Associated Press contribution",
            confidence: 0.7,
        },
        {
            phrase: "reuters contributed",
            type: "wire_service_reference",
            label: "References Reuters contribution",
            confidence: 0.7,
        },
    ];

    return cluePatterns.filter((clue) => text.includes(clue.phrase));
}

module.exports = { detectSourceClues };