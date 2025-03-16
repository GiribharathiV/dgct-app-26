
# Education Dashboard Backend

This is the backend API for the Education Dashboard application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```
   cp .env.example .env
   ```
4. Set up the database:
   ```
   mysql -u root -p < db-schema.sql
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login with email and password
- POST `/api/auth/logout` - Logout

### Students
- GET `/api/students` - Get all students
- POST `/api/students` - Create a new student
- DELETE `/api/students/:id` - Delete a student

### Assessments
- GET `/api/assessments` - Get all assessments
- POST `/api/assessments` - Create a new assessment
- DELETE `/api/assessments/:id` - Delete an assessment

## Deployment

To deploy this backend to Render:

1. Push code to GitHub
2. Create a new Web Service in Render
3. Connect to your GitHub repository
4. Select Node.js as the runtime
5. Set build command: `npm install`
6. Set start command: `node server.js`
7. Add environment variables from your `.env` file
8. Click "Create Web Service"
