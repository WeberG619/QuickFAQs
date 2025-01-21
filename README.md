# QuickFAQs - AI-Powered FAQ Generator

QuickFAQs is a full-stack application that leverages OpenAI's GPT models to automatically generate comprehensive FAQ sections for businesses. The platform offers both free and premium tiers, with features like unlimited generations, custom branding, and API access.

## Project Overview

### Features
- AI-powered FAQ generation using OpenAI's GPT
- User authentication and authorization
- Subscription management with Stripe
- Credit-based system for free tier users
- Modern, responsive UI built with React and Tailwind CSS
- RESTful API built with Node.js and Express
- MongoDB database for data persistence

### Tech Stack
- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **AI**: OpenAI GPT API
- **Payments**: Stripe
- **Deployment**: Vercel/Netlify (frontend), Heroku/AWS (backend)

## Project Structure

```
QuickFAQs/
├── frontend/           # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/            # Node.js backend application
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
│
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- OpenAI API key
- Stripe account and API keys

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

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

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure the API URL:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/signup` - Create new user account
- POST `/api/auth/login` - Login to existing account

### FAQ Endpoints
- POST `/api/faq/generate` - Generate new FAQ
- GET `/api/faq/user` - Get user's generated FAQs
- GET `/api/faq/:id` - Get specific FAQ by ID

### Payment Endpoints
- POST `/api/payment/create-checkout-session` - Create Stripe checkout session
- POST `/api/payment/webhook` - Handle Stripe webhooks

## Deployment

### Backend Deployment
1. Choose a hosting platform (Heroku, AWS, etc.)
2. Set up environment variables
3. Configure MongoDB connection
4. Deploy the application

### Frontend Deployment
1. Build the production version:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy to Vercel, Netlify, or similar platform
3. Configure environment variables

## Development Guidelines

### Code Style
- Use ESLint and Prettier for consistent formatting
- Follow React best practices and hooks guidelines
- Implement proper error handling and loading states
- Write clear, self-documenting code

### Git Workflow
1. Create feature branches from `main`
2. Use meaningful commit messages
3. Submit pull requests for review
4. Merge after approval

### Testing
- Write unit tests for critical functionality
- Perform manual testing before deployment
- Test all subscription flows thoroughly
- Verify OpenAI integration works as expected

## Monitoring and Maintenance

### Error Tracking
- Implement error logging
- Monitor API usage and response times
- Track failed payments and subscription issues

### Performance
- Monitor frontend load times
- Track API endpoint performance
- Optimize database queries
- Cache frequently accessed data

### Security
- Regular dependency updates
- Security audit of authentication flow
- Protect sensitive API endpoints
- Secure handling of API keys and tokens

## Future Enhancements

1. **Features**
   - Custom FAQ templates
   - Bulk FAQ generation
   - Export options (PDF, Word, HTML)
   - API access for premium users

2. **Technical**
   - Add TypeScript support
   - Implement real-time updates
   - Add comprehensive test coverage
   - Implement rate limiting

3. **Business**
   - Analytics dashboard
   - Team collaboration features
   - Custom branding options
   - Integration with popular platforms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For support, email support@quickfaqs.com or create an issue in the repository.
