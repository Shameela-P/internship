# Nexora – Student Internship Portal

Nexora is a web-based internship management platform built with SvelteKit and Firebase. It helps students discover internships, enables companies to manage recruitment, and provides administrators with tools to oversee the entire internship process.

## About the Project

Nexora was developed to simplify the internship process by bringing students, companies, and administrators onto a single platform. Instead of relying on emails, spreadsheets, or manual tracking, the system manages the complete internship workflow—from company registration and internship posting to student applications, hiring, and certificate issuance.

Students can explore opportunities, apply for internships, and monitor their application status. Companies can publish internships, review applicants, communicate with students, and issue completion certificates. Administrators manage company approvals, monitor platform activity, and ensure the system operates smoothly.

## Features

### Student

- Registration
- Login
- Google Sign-In
- Internship Search
- Internship Applications
- Application Tracking
- Messaging
- Notifications
- Certificates
- Profile Management

### Company

- Registration
- Company Approval
- Internship Posting
- Candidate Management
- Application Review
- Hiring
- Certificate Issuing
- Dashboard

### Administrator

- Dashboard
- Student Management
- Company Approval
- Internship Management
- Analytics
- Notifications
- Platform Monitoring

## Technology Stack

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Frontend       | SvelteKit                  |
| Backend        | SvelteKit API              |
| Database       | Firebase Realtime Database |
| Authentication | Firebase Authentication    |
| Styling        | Tailwind CSS               |
| Hosting        | Vercel                     |

## Prerequisites

- Node.js
- npm
- Firebase Project

## Installation

```bash
git clone <repository-url>
cd nexora
npm install
```

## Environment Variables

Create a `.env` file in the root of the project with the following keys.

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_DATABASE_URL=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

## Running the Project

To start the development server, run:

```bash
npm run dev
```

To start the development server and automatically open the application in your default browser:

```bash
npm run dev -- --open
```

## Production Build

To build the application for production:

```bash
npm run build
```

To preview the built production application locally:

```bash
npm run preview
```

## Project Structure

```text
src/
 ├── lib/
 ├── routes/
 ├── app.html
 └── hooks.server.js

static/

scripts/

uploads/

tests/
```

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the SvelteKit application for production.
- `npm run preview`: Previews the production build locally.
- `npm run prepare`: Synchronizes SvelteKit generated types.
- `npm run seed`: Executes the database seeding script.

## Application Workflow

1. Student registers.
2. Company registers.
3. Admin approves company.
4. Company posts internships.
5. Student applies.
6. Company reviews applications.
7. Company hires students.
8. Certificate is issued.
9. Student downloads the certificate.

## Deployment

This project is configured for deployment on Vercel using the `@sveltejs/adapter-vercel` adapter.

1. Push your code to a remote repository (e.g., GitHub).
2. Import the project in your Vercel dashboard.
3. Add the required environment variables in the Vercel project settings.
4. Deploy. Vercel will automatically detect the SvelteKit framework and run the appropriate build commands.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request detailing your modifications.

## License

This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
