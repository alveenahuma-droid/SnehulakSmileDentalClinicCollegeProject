const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3001;

// Credentials and secrets come from environment variables.
// The fallbacks are for local demos only; always set real values in production.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-me';

app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' }
}));

function requireAuth(req, res, next) {
    if (req.session.username) return next();
    if (req.accepts('html') && !req.path.startsWith('/appointments')) {
        return res.redirect('/login.html');
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Never serve server code, the database, or package files
app.use((req, res, next) => {
    if (/\.(db|sqlite)$|^\/(server\.js|package(-lock)?\.json|render\.yaml)$|^\/node_modules/i.test(req.path)) {
        return res.status(404).end();
    }
    next();
});

// Dashboard page is staff-only
app.get('/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use(express.static(__dirname));

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to appointments.db');
});

db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        firstName TEXT,
        lastName TEXT,
        phone TEXT,
        appointmentTime TEXT,
        dob TEXT,
        treatment TEXT,
        doctor TEXT
    )
`);

// Public: booking form
app.post('/submit-appointment', (req, res) => {
    const d = req.body || {};
    const required = ['email', 'firstName', 'lastName', 'phone', 'appointmentTime', 'dob', 'treatment', 'doctor'];
    if (required.some(k => !d[k] || typeof d[k] !== 'string' || d[k].length > 200)) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    const query = `
        INSERT INTO appointments (email, firstName, lastName, phone, appointmentTime, dob, treatment, doctor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [d.email, d.firstName, d.lastName, d.phone, d.appointmentTime, d.dob, d.treatment, d.doctor];

    db.run(query, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Failed to save appointment.' });
        }
        res.json({ success: true, message: 'Appointment saved successfully!' });
    });
});

// Staff login
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

app.get('/check-auth', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Staff only: contains patient personal data
app.get('/appointments', requireAuth, (req, res) => {
    db.all('SELECT * FROM appointments ORDER BY appointmentTime', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
