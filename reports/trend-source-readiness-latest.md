# Trend Source Readiness

Generated: 2026-05-22T06:40:58.835Z
Status: live-public
Active source: public-rss-live

## BGG Hotness

- Configured: false
- Authorized fetch ok: false
- Reason: BGG_XML_API_TOKEN is not set; trying public trend feeds before fixtures.
- Policy: https://boardgamegeek.com/using_the_xml_api

## Public RSS/Atom Feeds

- Configured: true
- Public fetch ok: true
- Reason: Fetched 36 public trend item(s) from 3/3 RSS/Atom feed(s).
- Authorization required: false
- https://www.boardgamequest.com/feed/: ok; 10 item(s); Fetched 10 public RSS/Atom item(s).
- https://www.meeplemountain.com/feed/: ok; 13 item(s); Fetched 13 public RSS/Atom item(s).
- https://www.reddit.com/r/boardgames/hot/.rss?limit=25: ok; 25 item(s); Fetched 25 public RSS/Atom item(s).

## Cache

- Status: fresh
- Usable: true
- Age days: 0
- Max age days: 30

## Signal Quality

- Qualified items: 22/36
- Evidence-bearing ratio: 0.611
- Generic categories ignored: 81
- Ranking policy: rank only boosts items with explicit keyword or category evidence

## Fallback

- Fixture rows: 5
- Stance: Do not scrape private BGG endpoints. Use registered XML API access, public RSS/Atom feeds, cached results, or local fixtures.
