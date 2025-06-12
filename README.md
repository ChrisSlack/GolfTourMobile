# GolfTourMobile

A mobile-friendly React + Vite application for managing golf tour information.

## Getting Started

Ensure you have **Node.js 18** or later installed. The CI pipeline uses Node 20.

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
- `npm audit` - check for dependency vulnerabilities

## Architecture

The app is built with **React** and **TypeScript** using **Vite** for bundling.  
Tailwind CSS provides styling with a custom colour palette defined via CSS
variables. Application state is managed through React contexts and custom hooks.
Data is stored in **Supabase** tables and accessed via the Supabase JS client.

## Supabase Schema

This project expects two main tables:

`users`
| Column     | Type    | Notes                                 |
| ---------- | ------- | ------------------------------------- |
| `id`       | uuid    | Primary key references `auth.users`   |
| `email`    | text    | Unique email address                  |
| `first_name` | text  | First name                            |
| `last_name` | text   | Last name                             |
| `handicap` | integer | Player handicap                       |
| `role`     | text    | `player` or `admin`                   |

`tours`
| Column       | Type       | Notes                   |
| ------------ | ---------- | ----------------------- |
| `id`         | uuid       | Primary key             |
| `name`       | text       | Name of the tour        |
| `year`       | integer    | Year of the tour        |
| `start_date` | timestamptz| Tour start date         |
| `end_date`   | timestamptz| (optional) Tour end     |
| `is_active`  | boolean    | Whether tour is active  |

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
