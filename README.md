# ✦ Alexis Construction Services Portal

<div align="center">

### ◆ Alexis Construction Portal ◆

**A Modern, Full-Stack Construction Operations & Client Management System**

Built with **Node.js**, **Express**, **SQLite**, and **EJS** — styled with a cohesive dark-themed glassmorphic design system, cursor-reactive canvas aesthetics, and automated billing workflows.

---

</div>

## 📖 Project Overview

**Alexis Construction Services** is an end-to-end web portal designed to streamline operational workflows for Alexis's construction and maintenance business. The system solves key operational bottlenecks by automating:
1. **Master Service Rate Ledgers**: Dynamic configuration of hourly service rates.
2. **Interactive Visit Scheduling**: Real-time date-collision prevention engine for client appointments.
3. **Automated Line-Item Billing**: Instant multi-service billing calculations based on hours rendered.
4. **Service-Mapped Inventory Tracking**: Real-time tool and equipment stock visibility.
5. **Partial & Full Settlement Processing**: Complete receivables lifecycle tracking with audit logs.
6. **Official Client Statements & Dispatch Schedules**: Summary reports with print-ready layouts and weekly dispatch calendars.

---

## 🚀 Key Features & Page Breakdown

### 1. 🌐 Public Landing & Client Booking Page (`/`)
* **Interactive Hero & Rate Directory**: Displays available service categories and standard hourly rates with interactive background lighting that responds to cursor movement.
* **Online Booking Submission**: Allows customers to request visits with preferred dates, estimated work hours, and service categories.
* **Confirmation Modal**: Dynamic confirmation feedback upon successful database booking registration.

### 2. 🔐 Admin Authentication (`/login`)
* **Secure Access**: Restricted credential-based access for Alexis to access the backend administration dashboard.

### 3. 👥 Client Profiles (`/clients`)
* **Directory Management**: Add, update, and review client names and verified contact numbers.
* **Data Association**: Automatically bridges clients to historical bookings and invoices.

### 4. ⚙️ Setup Preferences & Rates (`/services`)
* **Custom Hourly Rates**: Configure and update standard rates per service category (Plumbing, Electrical, Masonry, Carpentry Works, Others).
* **Dynamic Recalculations**: Updated rates cascade directly to future client bookings and rate estimators.

### 5. 🛠️ Equipment & Tool Inventory (`/inventory`)
* **Service Mapping**: Map tools and machinery directly to designated service categories.
* **Stock Management**: Track quantity on hand with live stock badge indicators.

### 6. 📅 Booking Engine & Service Matrix (`/bookings`)
* **Multi-Service Grid**: Select multiple services rendered for a visit and log individual hours rendered per service.
* **Automated Cost Calculation**: Formulates total amount due using the sum of (Hours Rendered × Hourly Rate).
* **Date Collision Guard**: Enforces database validations to reject duplicate bookings on the exact same schedule date.
* **Auto-Generated Billing**: Automatically generates a pending billing record linked to the newly scheduled visit.

### 7. 💳 Process Payments & Receivables (`/process`)
* **Accounts Receivable Ledger**: Real-time visibility into total amounts due, total settled, and outstanding balances.
* **Partial & Full Payment Processing**: Supports multi-step payments (Cash, GCash/Maya, Bank Transfer, Check) with official reference/OR tracking.
* **Status Lifecycle**: Transitions account status dynamically (`Unpaid` ➔ `Partial` ➔ `Paid`).

### 8. 📊 Reports, Statements & Weekly Dispatch (`/reports`)
* **🗓️ Weekly Dispatch Schedule**: Overview table organizing upcoming client appointments chronologically.
* **📄 Client Statement Generator**: Generates itemized client statements showing full service breakdowns, amounts billed, total paid, and outstanding balances.
* **Print Ready Layout**: Built-in print stylesheets for generating clean paper/PDF statements.

---

## 🛠️ Technology Stack

* **Runtime & Backend**: Node.js & Express.js
* **Database**: SQLite3 (persistent file-based relational storage)
* **Template Engine**: EJS (Embedded JavaScript)
* **Styling & UI**: Bootstrap 5, Custom CSS Glassmorphism, CSS Custom Properties, and HTML5 Canvas particle animation
* **Typography**: *Plus Jakarta Sans*

---

## 💻 How to Run Locally

Follow these steps to run the application on your local machine:

### Prerequisites
Make sure you have Node.js installed (version 16 or higher is recommended).

### 1. Clone the Repository
git clone https://github.com/n2nyyy/infosoft-exam.git
cd infosoft-exam

### 2. Install Dependencies
npm install

### 3. Start the Server
node server.js

### 4. Open in Your Browser
* Public Client Portal: http://localhost:3000
* Admin Login Portal: http://localhost:3000/login

---

## 📁 Project Structure

├── views/
│   ├── index.ejs        # Public landing & customer booking form
│   ├── login.ejs        # Admin portal login view
│   ├── clients.ejs      # Client profile directory & management
│   ├── services.ejs     # Service preferences & hourly rate master list
│   ├── inventory.ejs    # Equipment tracking mapped per service
│   ├── bookings.ejs     # Multi-service booking matrix & auto-calculator
│   ├── process.ejs      # Payment settlements & accounts receivable
│   └── reports.ejs      # Weekly dispatch calendar & statement generator
├── db.js                # SQLite database connection & table schemas
├── infosoft.db          # SQLite database storage file
├── server.js            # Express server routes, controllers, and business logic
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation

---

<div align="center">
  <small>© 2026 Alexis Construction Services. Developed for technical assessment evaluation.</small>
</div>