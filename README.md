# GolfTourMobile

A mobile-friendly React + Vite application for managing golf tour information.

## Getting Started

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Create an environment file**
   Copy `.env.example` to `.env` and fill in your Supabase credentials.

3. **Run the development server**
   ```bash
   npm run dev
   ```

## Available Commands

- `npm run dev` - start Vite in development mode
- `npm run build` - create a production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint
- `npm test` - run unit tests with Vitest

## Environment Variables

The app expects the following variables which are used to connect to Supabase:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Create a `.env` file with these variables based on `.env.example`.

## Testing

Vitest is used for unit tests. Run all tests with:

```bash
npm test -- --run
```
