
# Education Dashboard Frontend

This is the frontend for the Education Dashboard application built with React, TypeScript, and Vite.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Connecting to the Backend

The frontend is configured to connect to a backend API. By default, it will connect to:

- In development: `http://localhost:5000/api`
- In production: The URL specified in `src/config/api.ts`

Make sure the backend server is running before using the application.

## Deployment

This project is configured for deployment on Render. The `render.yaml` file includes the necessary configuration for deploying the frontend as a static site.

To deploy:

1. Push code to GitHub
2. Create a new Static Site in Render
3. Connect to your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set publish directory: `dist`

## Backend Repository

The backend code is available in the separate `backend` folder. See the backend README for setup instructions.
