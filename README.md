# Snehulak Smile Dental Clinic

A full-stack website for a dental clinic. Patients can browse services and book appointments online. Staff can log in to a private dashboard to view all, upcoming and past appointments.

## Features

- Responsive clinic website (services, doctors, contact, cookie and privacy notices)
- Appointment booking form with treatment-based doctor selection
- Appointments saved to a SQLite database
- Staff login with session-based authentication
- Protected dashboard with All / Future / Past appointment views
- Patient data endpoints locked behind login

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express 5, express-session
- **Database:** SQLite (`sqlite3`)

## Getting Started

```bash
git clone https://github.com/<your-username>/snehulak-smile-dental-clinic.git
cd snehulak-smile-dental-clinic
npm install
npm start
```

Open http://localhost:3001

## Configuration

Copy `.env.example` and set these environment variables before deploying:

| Variable | Purpose | Local default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `ADMIN_USER` | Staff username | `admin` |
| `ADMIN_PASS` | Staff password | `password123` |
| `SESSION_SECRET` | Signs session cookies | `dev-only-change-me` |

The defaults are for local demos only. Always set real values in production.

## Project Structure

```
server.js              Express server, API routes, SQLite setup
index.html             Public clinic website + booking form
javascript_webdev.js   Frontend logic for the public site
login.html             Staff login page
dashboard.html         Staff dashboard (login required)
dashboard_java.js      Dashboard logic (loads and filters appointments)
*.css                  Styles
```

## API

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/submit-appointment` | Public | Save a new appointment |
| POST | `/login` | Public | Staff login |
| POST | `/logout` | Staff | End session |
| GET | `/check-auth` | Public | Check login status |
| GET | `/appointments` | Staff | List all appointments |

## Deployment Note

On free hosts such as Render the filesystem is temporary, so a SQLite file is reset on every redeploy. For real use, switch to a hosted database (e.g. PostgreSQL) or attach persistent storage.

## Possible Improvements

- Hashed passwords and multiple staff accounts
- Edit and cancel appointments from the dashboard
- Email confirmation to patients
- Prevent double-booking the same doctor and time slot

## License

MIT
