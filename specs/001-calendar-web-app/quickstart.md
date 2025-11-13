# Quick Start: Calendar Web Application

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/calendar_db
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

4. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

   Server will run on http://localhost:3000

## Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on http://localhost:5173

## First Use

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Create your first calendar
4. Add events to your calendar
5. Try sharing a calendar with another user

## API Documentation

API documentation is available at `/docs` when the server is running, or view the OpenAPI spec in `specs/001-calendar-web-app/contracts/api.yaml`.

## Development

- Backend tests: `npm test` in server directory
- Frontend tests: `npm test` in client directory
- Build for production: `npm run build` in respective directories