package services

// ParserService extracts structured event data from text
//
// Expected output format:
//   {
//     "title": "Hackathon 2026",
//     "date": "2026-05-20T10:00:00+05:30",
//     "location": "AB-1 Auditorium, NSUT"
//   }
//
// TODO (Phase 1 completion):
// - Implement text extraction logic
// - Design parsing rules for captions
// - Handle edge cases (no date found, ambiguous text)
// - Add retry logic with exponential backoff

type ParserService struct {
	// Will hold: service key, HTTP client, extraction rules
}
