const express = require('express');
const session = require('express-session');
const db = require('./db');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Configure Express Sessions
app.use(session({
  secret: 'alexis-construction-secret-key-2026',
  resave: false,
  saveUninitialized: false
}));

// Middleware: Protect Admin Routes (Only logged in Alexis can enter)
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/login');
}

// --- PUBLIC CLIENT ROUTES ---

// 1. Show the Public Landing Page
app.get('/', (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  res.render('index', { 
    services, 
    success: req.query.success === 'true', 
    error: req.query.error || null 
  });
});

// 2. Handle Client-Facing Booking Submission
app.post('/client-book', (req, res) => {
  const { name, contact, address, service_id, estimated_hours, schedule_date } = req.body;

  const existingBooking = db.prepare('SELECT * FROM bookings WHERE schedule_date = ?').get(schedule_date);
  if (existingBooking) {
    return res.redirect('/?error=' + encodeURIComponent(`The date ${schedule_date} is already fully booked. Please select another date.`));
  }

  let client = db.prepare('SELECT * FROM clients WHERE name = ? OR contact = ?').get(name, contact);
  let clientId;
  if (client) {
    clientId = client.id;
  } else {
    const newClient = db.prepare('INSERT INTO clients (name, contact, address) VALUES (?, ?, ?)').run(name, contact, address);
    clientId = newClient.lastInsertRowid;
  }

  const bookingResult = db.prepare('INSERT INTO bookings (client_id, schedule_date, status) VALUES (?, ?, ?)').run(clientId, schedule_date, 'Scheduled');
  const bookingId = bookingResult.lastInsertRowid;

  const hours = parseFloat(estimated_hours) || 1;
  db.prepare('INSERT INTO booking_services (booking_id, service_id, hours_rendered) VALUES (?, ?, ?)').run(bookingId, service_id, hours);

  const service = db.prepare('SELECT hourly_rate FROM services WHERE id = ?').get(service_id);
  const totalAmount = hours * (service ? service.hourly_rate : 0);

  db.prepare('INSERT INTO billings (booking_id, total_amount, paid_amount, status) VALUES (?, ?, 0, ?)').run(bookingId, totalAmount, 'Unpaid');

  res.redirect('/?success=true');
});

// --- ADMIN AUTHENTICATION ROUTES ---

app.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Admin Credentials for Alexis
  if ((username === 'alexis' || username === 'alexis@construction.com') && password === 'admin123') {
    req.session.isAdmin = true;
    return res.redirect('/bookings');
  }

  res.redirect('/login?error=' + encodeURIComponent('Invalid email/username or password. Access restricted.'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// --- 🔒 PROTECTED ADMIN ROUTES (REQUIRE LOGIN) ---

// 1. CLIENTS
app.get('/clients', requireAdmin, (req, res) => {
  const clients = db.prepare('SELECT * FROM clients').all();
  let editClient = req.query.edit ? db.prepare('SELECT * FROM clients WHERE id = ?').get(req.query.edit) : null;
  res.render('clients', { clients, editClient });
});

app.post('/add-client', requireAdmin, (req, res) => {
  const { name, contact } = req.body;
  db.prepare('INSERT INTO clients (name, contact) VALUES (?, ?)').run(name, contact);
  res.redirect('/clients');
});

app.post('/edit-client/:id', requireAdmin, (req, res) => {
  const { name, contact } = req.body;
  db.prepare('UPDATE clients SET name = ?, contact = ? WHERE id = ?').run(name, contact, req.params.id);
  res.redirect('/clients');
});

app.get('/delete-client/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  res.redirect('/clients');
});

// 2. SETUP PREFERENCES (SERVICES)
app.get('/services', requireAdmin, (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  let editService = req.query.edit ? db.prepare('SELECT * FROM services WHERE id = ?').get(req.query.edit) : null;
  res.render('services', { services, editService });
});

app.post('/add-service', requireAdmin, (req, res) => {
  const { service_name, hourly_rate } = req.body;
  db.prepare('INSERT INTO services (service_name, hourly_rate) VALUES (?, ?)').run(service_name, hourly_rate);
  res.redirect('/services');
});

app.post('/edit-service/:id', requireAdmin, (req, res) => {
  const { service_name, hourly_rate } = req.body;
  db.prepare('UPDATE services SET service_name = ?, hourly_rate = ? WHERE id = ?').run(service_name, hourly_rate, req.params.id);
  res.redirect('/services');
});

app.get('/delete-service/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.redirect('/services');
});

// 3. INVENTORY
app.get('/inventory', requireAdmin, (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  const inventory = db.prepare(`
    SELECT inventory.*, services.service_name 
    FROM inventory 
    JOIN services ON inventory.service_id = services.id
  `).all();
  let editTool = req.query.edit ? db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.query.edit) : null;
  res.render('inventory', { inventory, services, editTool });
});

app.post('/add-inventory', requireAdmin, (req, res) => {
  const { service_id, tool_name, stock } = req.body;
  db.prepare('INSERT INTO inventory (service_id, tool_name, stock) VALUES (?, ?, ?)').run(service_id, tool_name, stock);
  res.redirect('/inventory');
});

app.post('/edit-inventory/:id', requireAdmin, (req, res) => {
  const { service_id, tool_name, stock } = req.body;
  db.prepare('UPDATE inventory SET service_id = ?, tool_name = ?, stock = ? WHERE id = ?').run(service_id, tool_name, stock, req.params.id);
  res.redirect('/inventory');
});

app.get('/delete-inventory/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
  res.redirect('/inventory');
});

// 4. BOOKINGS & SERVICES GRID
app.get('/bookings', requireAdmin, (req, res) => {
  const clients = db.prepare('SELECT * FROM clients').all();
  const services = db.prepare('SELECT * FROM services').all();
  const bookings = db.prepare(`
    SELECT bookings.*, clients.name as client_name, billings.total_amount 
    FROM bookings 
    JOIN clients ON bookings.client_id = clients.id
    LEFT JOIN billings ON bookings.id = billings.booking_id
  `).all();

  let editBooking = null;
  let editBookingServices = {};
  if (req.query.edit) {
    editBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.query.edit);
    if (editBooking) {
      const rows = db.prepare('SELECT service_id, hours_rendered FROM booking_services WHERE booking_id = ?').all(editBooking.id);
      rows.forEach(r => { editBookingServices[r.service_id] = r.hours_rendered; });
    }
  }

  res.render('bookings', { clients, services, bookings, editBooking, editBookingServices, error: null });
});

app.post('/add-booking', requireAdmin, (req, res) => {
  const { client_id, schedule_date, service_ids, hours_rendered } = req.body;
  const existing = db.prepare('SELECT * FROM bookings WHERE schedule_date = ?').get(schedule_date);
  
  if (existing) {
    const clients = db.prepare('SELECT * FROM clients').all();
    const services = db.prepare('SELECT * FROM services').all();
    const bookings = db.prepare(`
      SELECT bookings.*, clients.name as client_name, billings.total_amount 
      FROM bookings JOIN clients ON bookings.client_id = clients.id
      LEFT JOIN billings ON bookings.id = billings.booking_id
    `).all();
    return res.render('bookings', { clients, services, bookings, editBooking: null, editBookingServices: {}, error: `Validation Alert: Date ${schedule_date} is already booked!` });
  }

  const result = db.prepare('INSERT INTO bookings (client_id, schedule_date, status) VALUES (?, ?, ?)').run(client_id, schedule_date, 'Scheduled');
  const bookingId = result.lastInsertRowid;

  let totalAmount = 0;
  for (let i = 0; i < service_ids.length; i++) {
    const hours = parseFloat(hours_rendered[i]);
    if (hours > 0) {
      const serviceId = service_ids[i];
      db.prepare('INSERT INTO booking_services (booking_id, service_id, hours_rendered) VALUES (?, ?, ?)').run(bookingId, serviceId, hours);
      const s = db.prepare('SELECT hourly_rate FROM services WHERE id = ?').get(serviceId);
      totalAmount += hours * s.hourly_rate;
    }
  }

  db.prepare('INSERT INTO billings (booking_id, total_amount, paid_amount, status) VALUES (?, ?, 0, ?)').run(bookingId, totalAmount, 'Unpaid');
  res.redirect('/bookings');
});

app.post('/edit-booking/:id', requireAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { client_id, schedule_date, service_ids, hours_rendered } = req.body;

  db.prepare('UPDATE bookings SET client_id = ?, schedule_date = ? WHERE id = ?').run(client_id, schedule_date, bookingId);
  db.prepare('DELETE FROM booking_services WHERE booking_id = ?').run(bookingId);

  let totalAmount = 0;
  for (let i = 0; i < service_ids.length; i++) {
    const hours = parseFloat(hours_rendered[i]);
    if (hours > 0) {
      const serviceId = service_ids[i];
      db.prepare('INSERT INTO booking_services (booking_id, service_id, hours_rendered) VALUES (?, ?, ?)').run(bookingId, serviceId, hours);
      const s = db.prepare('SELECT hourly_rate FROM services WHERE id = ?').get(serviceId);
      totalAmount += hours * s.hourly_rate;
    }
  }

  db.prepare('UPDATE billings SET total_amount = ? WHERE booking_id = ?').run(totalAmount, bookingId);
  res.redirect('/bookings');
});

app.get('/delete-booking/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM billings WHERE booking_id = ?').run(req.params.id);
  db.prepare('DELETE FROM booking_services WHERE booking_id = ?').run(req.params.id);
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.redirect('/bookings');
});

// 5. PROCESS PAYMENTS
app.get('/process', requireAdmin, (req, res) => {
  const billings = db.prepare(`
    SELECT billings.*, bookings.schedule_date, clients.name as client_name 
    FROM billings 
    JOIN bookings ON billings.booking_id = bookings.id
    JOIN clients ON bookings.client_id = clients.id
  `).all();

  const payments = db.prepare('SELECT * FROM payments ORDER BY id DESC').all();
  res.render('process', { billings, payments });
});

app.post('/record-payment', requireAdmin, (req, res) => {
  const { billing_id, amount_paid, payment_method, reference_no } = req.body;
  const payAmount = parseFloat(amount_paid);
  const today = new Date().toISOString().split('T')[0];

  db.prepare('INSERT INTO payments (billing_id, amount_paid, payment_method, reference_no, payment_date) VALUES (?, ?, ?, ?, ?)')
    .run(billing_id, payAmount, payment_method, reference_no, today);

  const bill = db.prepare('SELECT * FROM billings WHERE id = ?').get(billing_id);
  const newPaidAmount = (bill.paid_amount || 0) + payAmount;
  let newStatus = newPaidAmount >= bill.total_amount ? 'Paid' : 'Partial';

  db.prepare('UPDATE billings SET paid_amount = ?, status = ? WHERE id = ?').run(newPaidAmount, newStatus, billing_id);
  res.redirect('/process');
});

// 6. REPORTS & BONUS VIEW
app.get('/reports', requireAdmin, (req, res) => {
  const clients = db.prepare('SELECT * FROM clients').all();
  
  const weeklyBookings = db.prepare(`
    SELECT bookings.*, clients.name as client_name, clients.contact
    FROM bookings 
    JOIN clients ON bookings.client_id = clients.id
    ORDER BY bookings.schedule_date ASC
  `).all();

  let selectedClient = null;
  let clientStatements = [];

  if (req.query.client_id) {
    selectedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.query.client_id);
    clientStatements = db.prepare(`
      SELECT bookings.schedule_date, billings.total_amount, billings.paid_amount, billings.status,
             GROUP_CONCAT(services.service_name || ' (' || booking_services.hours_rendered || ' hrs)', ', ') as service_breakdown
      FROM bookings
      JOIN billings ON bookings.id = billings.booking_id
      LEFT JOIN booking_services ON bookings.id = booking_services.booking_id
      LEFT JOIN services ON booking_services.service_id = services.id
      WHERE bookings.client_id = ?
      GROUP BY bookings.id
    `).all(req.query.client_id);
  }

  res.render('reports', { clients, weeklyBookings, selectedClient, clientStatements });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});