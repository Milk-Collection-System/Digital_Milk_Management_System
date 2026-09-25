# Digital Milk Management System — Frontend

Phase 2 frontend foundation.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Current frontend modules

- Dashboard
- Milk collection entry
- Farmer management
- Collection history
- Marathi receipt preview
- Print receipt
- WhatsApp/browser share fallback
- Responsive mobile layout
- Local demo data via localStorage

## Backend integration

Set:

```env
VITE_API_URL=http://localhost:5000/api
```

The API service is already prepared in `src/services/api.js`. The current UI uses localStorage demo data so the frontend can be developed and reviewed before the backend is connected.

## Next frontend work

1. Login screen and protected routes
2. API-backed farmer search
3. API-backed collection save
4. Rate chart screen
5. Farmer profile + ledger
6. Receipt PNG export
7. WhatsApp Cloud API flow
8. Reports and export screens
