# Smart Pharmacy Platform 💊

A premium health-tech platform for medicine ordering, prescription management, and AI-powered medication reminders.

## Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS 4, Framer Motion, Lucide React
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Payments**: Razorpay (Integration ready)

## Project Structure
```text
/MedsRemind
  /client     - Next.js frontend
  /server     - Express backend & DB schema
```

## Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally

### 2. Database Setup
1. Create a database named `medsremind`:
   ```bash
   psql -U postgres -c "CREATE DATABASE medsremind;"
   ```
2. Import the schema:
   ```bash
   psql -U postgres -d medsremind -f server/src/db/schema.sql
   ```

### 3. Backend Setup
1. Navigate to server: `cd server`
2. Install dependencies: `npm install`
3. Configure `.env`:
   Update `DATABASE_URL` in `server/.env` with your PostgreSQL credentials.
4. Start server: `npm run dev`

### 4. Frontend Setup
1. Navigate to client: `cd client`
2. Install dependencies: `npm install`
3. Start frontend: `npm run dev`

## Core Features
- **Smart Shop**: Search medicines with generic substitute suggestions.
- **AI Prescription Parser**: Upload image/PDF to extract medicine details.
- **Health Dashboard**: Track dose adherence and upcoming refills.
- **Refill Automation**: Predicts when you'll run out of medicine and suggests reorders.
- **Premium UI**: Mobile-first glassmorphism design with smooth animations.

## API Documentation
- `GET /api/medicines` - List all medicines
- `POST /api/auth/signup` - Register a new user
- `POST /api/orders` - Place a new order
- `GET /api/prescriptions` - List user prescriptions
