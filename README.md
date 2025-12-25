# QueryAI - AI-Powered Database Chat

A comprehensive AI-powered database chat application that allows users to query databases using natural language.

## Features

- **AI Chat Interface**: Ask questions in plain English and get SQL queries with results
- **Multi-Database Support**: Connect to PostgreSQL, MySQL, MongoDB, and SQLite
- **Query History**: Track all queries with execution metrics and filtering
- **Database Connections**: Manage multiple database connections
- **Theme System**: Switch between Vercel, Blue, Purple, and Green themes
- **Billing & Settings**: Comprehensive user management and subscription tiers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Demo Credentials

Use these credentials to log in and explore the app:

- **Email**: demo@queryai.com
- **Password**: demo123

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

1. Clone the repository or download the code

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Currently, the app runs in demo mode without external services. To add real AI functionality, you'll need:

```env
# Optional: For real AI chat (uses Vercel AI SDK)
# The app works in demo mode without this
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For database connections
# Demo mode shows mock data without these
DATABASE_URL=your_database_connection_string
```

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com)

3. Click "New Project"

4. Import your GitHub repository

5. Vercel will auto-detect Next.js and configure build settings

6. Click "Deploy"

### Using Vercel CLI

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Environment Variables on Vercel

1. Go to your project on Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add any required environment variables:
   - `OPENAI_API_KEY` (optional, for real AI functionality)
   - `DATABASE_URL` (optional, for real database connections)

### Build Configuration

Vercel automatically detects these settings:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (or `npm install`)

## Project Structure

```
├── app/
│   ├── page.tsx                 # Login page (home)
│   ├── signup/                  # Signup page
│   ├── dashboard/               # Main dashboard
│   │   ├── page.tsx            # AI Chat interface
│   │   ├── connections/        # Database connections
│   │   ├── history/            # Query history
│   │   ├── settings/           # User settings
│   │   └── billing/            # Billing & pricing
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles & themes
├── components/
│   ├── dashboard-layout.tsx    # Sidebar navigation
│   ├── theme-provider.tsx      # Theme context
│   └── ui/                     # shadcn components
└── lib/
    └── utils.ts                # Utility functions
```

## Features Overview

### 1. AI Chat Interface
- Natural language to SQL conversion
- Real-time query execution
- Results visualization in tables
- Query feedback and rating
- Copy SQL queries and export results

### 2. Database Management
- Add multiple database connections
- Support for PostgreSQL, MySQL, MongoDB, SQLite
- Connection status monitoring
- Schema exploration

### 3. Query History
- Searchable query history
- Filter by status and database
- Re-run previous queries
- Export query results

### 4. Settings
- Profile management
- Notification preferences
- API key management
- Security settings (2FA, password)
- Theme selection (Vercel, Blue, Purple, Green)

### 5. Billing
- Three pricing tiers: Starter, Professional, Enterprise
- Usage tracking
- Payment method management
- Billing history with invoices

## Adding Real AI Functionality

To enable real AI-powered database queries:

1. Add Vercel AI SDK integration or OpenAI API key

2. Update the chat interface to call AI API:
```typescript
// In app/api/chat/route.ts
import { generateText } from 'ai'

export async function POST(req: Request) {
  const { message } = await req.json()
  
  const { text } = await generateText({
    model: 'openai/gpt-4.1',
    prompt: `Convert this to SQL: ${message}`
  })
  
  return Response.json({ sql: text })
}
```

3. Connect to your actual database and execute queries

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub or contact support.
