# QuickFAQs Backend

This is the backend service for QuickFAQs, an AI-powered FAQ generation platform. It provides APIs for user authentication, FAQ generation using OpenAI's GPT models, and subscription management with Stripe.

## Features

- User authentication (signup/login) with JWT
- AI-powered FAQ generation using OpenAI GPT
- Subscription management with Stripe
- MongoDB database integration
- Credit-based system for free tier users

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- OpenAI API
- Stripe API
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed locally or a MongoDB Atlas account
- OpenAI API key
- Stripe account and API keys

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Create a new user account
- POST `/api/auth/login` - Login to existing account

### FAQ Generation
- POST `/api/faq/generate` - Generate new FAQ (requires authentication)
- GET `/api/faq/user` - Get user's generated FAQs
- GET `/api/faq/:id` - Get specific FAQ by ID

### Payments
- POST `/api/payment/create-checkout-session` - Create Stripe checkout session
- POST `/api/payment/webhook` - Handle Stripe webhooks

## Environment Variables

- `PORT` - Server port (default: 4000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `FRONTEND_URL` - URL of the frontend application

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## License

MIT
