# ESGFast

ESGFast is a lightweight ESG reporting platform for export-focused SMEs. It helps teams collect environmental, social, and governance data, attach supporting evidence, and generate buyer-friendly exports in minutes.

## Why ESGFast

Many SMEs still manage ESG requests through spreadsheets, invoices, and email threads. ESGFast centralizes this workflow by providing:

- Structured ESG data intake
- Evidence file uploads
- Live dashboard KPIs
- One-click PDF and CSV exports for buyers and suppliers

## Core Features

- Authentication with Supabase email/password sign in
- Company onboarding flow
- ESG data capture across three areas:
	- Environmental: electricity, diesel, petrol, water, waste
	- Social: workforce composition and safety incidents
	- Governance: policy checklist score
- Dashboard with derived metrics:
	- Total emissions (tCO2e)
	- Accident rate
	- Governance score
	- Female workforce share
	- Data completeness progress
- Evidence upload to Supabase Storage (`bills` bucket)
- Report exports:
	- Buyer ESG Report (PDF)
	- Supplier ESG Questionnaire (CSV)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage)
- jsPDF + jspdf-autotable
- Radix UI + custom UI components

## Project Structure

```text
app/
	page.tsx               # Landing page
	auth/page.tsx          # Sign in/sign up
	onboarding/page.tsx    # Company profile setup
	dashboard/page.tsx     # KPI dashboard + recent activity
	dashboard/add/page.tsx # ESG data entry + evidence uploads
	dashboard/report/page.tsx # PDF/CSV report exports

lib/
	supabaseClient.ts      # Supabase client setup
	env.ts                 # Required environment variable checks
	esg-utils.ts           # Emission factors + calculation helpers
```

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd esg-platform-main
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app will fail fast on startup if these are missing.

### 3. Prepare Supabase

Create the following tables in Supabase Postgres.

#### `companies`

- `id` (uuid, primary key, default `gen_random_uuid()`)
- `user_id` (uuid, not null)
- `company_name` (text, not null)
- `country` (text)
- `industry` (text)
- `employee_count` (int)
- `reporting_year` (int)
- `created_at` (timestamp with time zone, default `now()`)

#### `metrics`

- `id` (uuid, primary key, default `gen_random_uuid()`)
- `user_id` (uuid, not null)
- `category` (text, not null)
- `amount` (numeric, not null)
- `unit` (text, not null)
- `description` (text)
- `date_logged` (date, nullable)
- `image_url` (text, nullable)
- `created_at` (timestamp with time zone, default `now()`)

Create a storage bucket named `bills` for evidence uploads.

Recommended: add Row Level Security policies so users can only access their own rows/files.

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## NPM Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Emissions Calculation Notes

Current built-in emission factors used by `lib/esg-utils.ts`:

- Electricity: 0.8 kg CO2 per kWh
- Fuel: 2.68 kg CO2 per liter
- Waste: 1.2 kg CO2 per kg
- Water: 0.001 kg CO2 per liter

Total emissions are displayed in tons CO2e using:

$$
	ext{Total tCO2e} = \frac{\sum(\text{activity amount} \times \text{factor})}{1000}
$$

You can adjust factors in `lib/esg-utils.ts` to match your reporting standard or geography.

## Deployment

This project can be deployed on Vercel.

1. Import repository into Vercel.
2. Set the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
3. Deploy.

## Roadmap Ideas

- Multi-tenant organization roles
- Data validation and anomaly detection
- Audit trails and approvals
- Framework mapping (GRI / CSRD / ISSB)
- Benchmarks and target tracking

## License

Choose a license before publishing (for example MIT).

