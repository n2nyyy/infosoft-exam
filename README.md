<div align="center">

# Alexis Construction Services Portal

**A Full-Stack Construction Operations and Client Management System**

Built with Node.js, Express, SQLite, and EJS — featuring a dark, glassmorphic design, cursor-reactive visuals, and automated billing workflows.

</div>

---

## Overview

Alexis Construction Services Portal is a web-based system built to manage the daily operations of a construction and maintenance business. It automates:

- Service rate management
- Visit scheduling with conflict prevention
- Automated billing based on hours worked
- Equipment and inventory tracking
- Payment and receivables processing
- Client statements and dispatch reports

---

## Features

### 1. Public Booking Page (`/`)
- Displays available services and standard hourly rates
- Lets customers request visits by selecting a date, service type, and estimated hours
- Shows a confirmation message once a booking is submitted

### 2. Admin Login (`/login`)
- Secure, credential-based access to the admin dashboard

### 3. Client Profiles (`/clients`)
- Add, edit, and view client details and contact numbers
- Automatically links clients to their booking and billing history

### 4. Service Rates (`/services`)
- Set and update hourly rates for each service category (Plumbing, Electrical, Masonry, Carpentry, and Others)
- Rate changes automatically apply to future bookings

### 5. Equipment Inventory (`/inventory`)
- Assign tools and equipment to specific service categories
- Track stock levels with live availability indicators

### 6. Bookings and Billing (`/bookings`)
- Select multiple services and log hours worked for each visit
- Automatically calculates total cost (hours × rate)
- Prevents duplicate bookings on the same date
- Generates a billing record for every new booking

### 7. Payments and Receivables (`/process`)
- View total amounts billed, paid, and outstanding
- Record full or partial payments (Cash, GCash, Maya, Bank Transfer, or Check)
- Track payment status: Unpaid → Partial → Paid

### 8. Reports and Statements (`/reports`)
- View a weekly schedule of upcoming appointments
- Generate itemized client statements with billing and payment details
- Print-ready formatting for physical or PDF copies

---

## Technology Stack

| Category | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | SQLite3 |
| Templating | EJS |
| Styling | Bootstrap 5, Custom CSS (Glassmorphism), HTML5 Canvas |
| Typography | Plus Jakarta Sans |

---

## Getting Started

### Prerequisites
Node.js version 16 or higher.

### 1. Clone the repository
```bash
git clone https://github.com/n2nyyy/infosoft-exam.git
cd infosoft-exam
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
node server.js
```

### 4. Open the app
- Client portal: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/login](http://localhost:3000/login)

---

## Project Structure

```
├── views/
│   ├── index.ejs        # Public booking page
│   ├── login.ejs        # Admin login page
│   ├── clients.ejs      # Client management
│   ├── services.ejs     # Service rate settings
│   ├── inventory.ejs    # Equipment tracking
│   ├── bookings.ejs     # Booking and billing management
│   ├── process.ejs      # Payments and receivables
│   └── reports.ejs      # Reports and statements
├── db.js                # Database connection and schema
├── infosoft.db           # SQLite database file
├── server.js            # Express server and business logic
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

---

<div align="center">
<small>© 2026 Alexis Construction Services. Built for technical assessment purposes.</small>
</div>
