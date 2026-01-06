# Data Mining Dashboard

A modern, responsive dashboard for visualizing job market data from the Data Mining Project crawler.

## Features

- **Dashboard Overview**: View key statistics, job distribution by source, remote vs on-site ratios, and trends
- **Skills Analytics**: Analyze the most in-demand skills with treemap visualization and bar charts
- **Jobs Browser**: Search, filter, and browse all crawled job postings with pagination
- **Crawler Control**: Start new crawl jobs and monitor their progress in real-time

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS 4** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## Prerequisites

- Node.js 18+ and npm
- The Data Mining API running on port 8000

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Docker

Build and run with Docker:

```bash
docker build -t datamining-dashboard .
docker run -p 3000:80 datamining-dashboard
```

Or use the docker-compose.yml in the main project:

```bash
cd ../Data-mining-project
docker-compose up -d
```

## Environment Variables

| Variable     | Description          | Default |
| ------------ | -------------------- | ------- |
| VITE_API_URL | Base URL for the API | /api/v1 |

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ChartContainer.tsx
│   ├── Layout.tsx
│   ├── LoadingSpinner.tsx
│   └── StatCard.tsx
├── pages/            # Page components
│   ├── Crawler.tsx   # Crawler control panel
│   ├── Dashboard.tsx # Main dashboard
│   ├── Jobs.tsx      # Jobs browser
│   └── Skills.tsx    # Skills analytics
├── services/         # API services
│   └── api.ts
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Root component with routes
├── main.tsx          # Entry point
└── index.css         # Global styles with Tailwind
```

## API Endpoints Used

The dashboard consumes the following API endpoints:

### Dashboard

- `GET /api/v1/dashboard/stats` - Overall statistics
- `GET /api/v1/dashboard/skills` - Skills analytics
- `GET /api/v1/dashboard/locations` - Location distribution
- `GET /api/v1/dashboard/salary` - Salary analytics
- `GET /api/v1/dashboard/trends` - Job posting trends
- `GET /api/v1/dashboard/levels` - Experience level distribution
- `GET /api/v1/dashboard/jobs` - Paginated job list

### Crawler

- `GET /api/v1/sources` - Available crawler sources
- `POST /api/v1/crawl` - Start a new crawl job
- `GET /api/v1/jobs` - List all crawl jobs
- `GET /api/v1/jobs/{job_id}` - Get job status

## Screenshots

The dashboard includes:

- Statistics cards showing key metrics
- Pie charts for job source and work type distribution
- Bar charts for skills, locations, and salary ranges
- Line charts for job posting trends over time
- Interactive data tables with filtering and pagination
- Real-time crawl job monitoring

## License

MIT
