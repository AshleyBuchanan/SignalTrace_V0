# SignalTrace

SignalTrace is a news clarity app designed to help readers trace a story back to its original evidence.

Instead of ranking news by popularity, engagement, political framing, or outrage, SignalTrace focuses on **evidence density**: how much of a story is supported by verifiable sources, original documents, direct reporting, and clear attribution.

The goal is simple:

> Help readers find the signal through the noise.

---

## What Problem Does SignalTrace Solve?

Modern news moves fast. A single event can produce dozens or hundreds of articles, reactions, summaries, opinion pieces, and reposts. By the time most readers encounter a story, it can be difficult to tell:

- Where the claim originally came from
- Whether the article links to primary evidence
- Which stories are original reporting versus repeated summaries
- Which sources are adding useful information
- Which coverage is mostly reaction, framing, or noise

SignalTrace helps organize news coverage around the evidence behind it.

---

## Core Idea

SignalTrace ranks and organizes coverage by how directly it connects to verifiable sources.

Examples of high-signal sources include:

- Court filings
- Government reports
- Scientific papers
- Original interviews
- Official statements
- Primary documents
- First-hand reporting
- Directly cited data

Lower-signal coverage may include:

- Aggregated summaries
- Reaction pieces
- Opinion articles
- Articles that repeat claims without linking to evidence
- Coverage that depends heavily on unnamed or unclear sources

SignalTrace is not intended to tell readers what to believe.  
It is intended to show readers **where the information came from**.

---

## Planned Features

### Article Ingestion

SignalTrace will support adding articles from:

- RSS feeds
- News APIs
- Manual URLs
- Public source lists

Each article can store:

- Title
- URL
- Source
- Author
- Published date
- Article body
- Outbound links
- Topic or story cluster
- Article type
- Evidence score

---

### Evidence Classification

SignalTrace will inspect outbound links and references to identify evidence types such as:

- Primary source
- Official document
- Court record
- Research paper
- Data source
- Wire report
- Original reporting
- Analysis
- Opinion
- Reaction/noise

This classification helps determine how closely an article connects to the original facts of a story.

---

### Story Clustering

Related articles can be grouped into story clusters.

A story cluster may show:

- The earliest known source
- Primary evidence
- First factual reports
- Major coverage
- Follow-up reporting
- Opinion and reaction pieces

This allows readers to see how a story developed over time.

---

### Source Trail

One of the main goals of SignalTrace is to create a visible source trail:

```txt
Primary document/report
        ↓
Original reporting
        ↓
Wire or factual summary
        ↓
Major outlet coverage
        ↓
Analysis, opinion, and reaction