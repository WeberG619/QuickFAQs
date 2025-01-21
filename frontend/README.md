# QuickFAQs Frontend

This is the frontend application for QuickFAQs, an AI-powered FAQ generation platform. Built with React and styled with Tailwind CSS, it provides a modern and responsive user interface for generating and managing FAQs.

## Features

- Clean and modern user interface
- Responsive design that works on all devices
- User authentication (signup/login)
- FAQ generation interface
- Dashboard to view and manage generated FAQs
- Subscription management with Stripe integration
- Toast notifications for user feedback
- Protected routes for authenticated users

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Axios for API requests
- React Hot Toast for notifications
- Stripe for payments

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Setup

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
├── package.json
└── tailwind.config.js
```

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Components

### Pages
- `Home`: Landing page with feature showcase
- `Login`: User login page
- `Signup`: New user registration
- `Dashboard`: View and manage generated FAQs
- `GenerateFAQ`: Interface for generating new FAQs
- `Pricing`: Subscription plans and pricing

### Core Components
- `Navbar`: Main navigation
- `Footer`: Site footer
- `PrivateRoute`: Route protection for authenticated users

## Styling

The application uses Tailwind CSS for styling, with custom components defined in `index.css`. Common components like buttons and inputs have consistent styling through Tailwind classes.

## Authentication

Authentication is handled through the `AuthContext`, which provides:
- User state management
- Login/Signup functionality
- Token management
- Protected route handling

## API Integration

API calls are managed through the `api` service using Axios. The service:
- Automatically includes authentication tokens
- Handles token expiration
- Provides consistent error handling

## Error Handling

- Form validation with user feedback
- API error handling with toast notifications
- Protected route redirection
- Loading states for async operations

## Best Practices

1. **State Management**
   - Use React Context for global state
   - Keep component state local when possible
   - Implement proper loading states

2. **Performance**
   - Lazy loading of routes
   - Proper use of React hooks
   - Optimized re-renders

3. **Security**
   - Protected routes for authenticated users
   - Secure handling of tokens
   - Input validation

4. **Code Organization**
   - Consistent file structure
   - Component reusability
   - Clear naming conventions

## Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service (e.g., Vercel, Netlify)

3. Set environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
