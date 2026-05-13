package services

// DiscoveryService handles fetching social media posts
// Uses worker pool and rotates user-agents
//
// TODO (Phase 1 completion):
// - Implement Colly-based scraper with User-Agent rotation
// - Add Chromedp fallback for JavaScript-rendered content
// - Wire up text caption parsing
// - Implement worker pool with bounded concurrency
// - Add deduplication by PostID before database insert

type DiscoveryService struct {
	// Will hold: DB, ParserService, worker count, etc.
}
