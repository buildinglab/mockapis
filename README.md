# Mock Log Server (Astro + GitHub Pages)

This project provides a mock API served by Astro, using pre-generated JSON files in `public/generated/nginx/logs`.

- Endpoint: `/api/nginx/v1/logs`
- Uses data files: `/public/generated/nginx/logs/logs_page_{n}.json`
- Query params: `?page=1&limit=100&apikey=demo123`
- No headers required; the API key must be passed via the `apikey` query param.

## Quick start

1. Install dependencies
2. Generate data
3. Run dev server

### Scripts
- `npm run generate` — build mock JSON files into `public/generated`
- `npm run dev` — start Astro dev server
- `npm run build` — static build suitable for GitHub Pages
- `npm run preview` — preview production build

## API Response
```
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "total": 20 }
}
```

## Notes
- The API endpoint fetches the appropriate JSON file from `/generated/nginx/logs/logs_page_{page}.json`.
- Errors handled: missing/invalid/expired key, file not found.
