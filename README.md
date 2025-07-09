# 🚦 TrafficLK - Digital Traffic Fine Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

> **🌟 Revolutionizing Sri Lanka's Traffic Management Through Digital Innovation**

TrafficLK is a modern web-based platform designed to digitize Sri Lanka's traffic fine management system. It provides citizens, police officers, and government authorities with an efficient and transparent way to handle fines, disputes, payments, and driving points.

## 🌟 Key Features

### 🏠 Citizens

* Pay traffic fines online
* Register and manage vehicles
* Contest fines and upload evidence
* View driving points and fine history
* Receive notifications for fines, payments, and document expiries

### 👮 Traffic Police

* Issue fines with location and evidence
* Lookup vehicle and owner details
* Manage and review disputes
* Generate reports on issued fines

### 🏦 Government Admins

* Access platform-wide analytics
* Manage users, roles, and settings
* Monitor revenue and system health

## 📊 Tech Stack

### Frontend

* React 18
* TypeScript
* Tailwind CSS
* Vite

### Backend

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication
* Nodemailer for email notifications
* Stripe for payment handling

## ✨ Quick Start

### Prerequisites

* Node.js 18+
* MongoDB Atlas (or local MongoDB instance)

```bash
# 1. Clone the project
$ git clone https://github.com/yourusername/TrafficLK.git
$ cd TrafficLK

# 2. Install dependencies
$ npm install

# 3. Configure environment variables
$ cp .env.example .env
# Edit .env with your MongoDB URI, email credentials, and Stripe keys

# 4. Start development server
$ npm run dev
```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`. Example variables:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/trafficlk
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=********
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
CLIENT_URL=http://localhost:5173
PORT=5000
```

## 📁 Folder Structure (Simplified)

```
TrafficLK/
├── server/           # Backend API (Node.js)
│   ├── routes/       # REST API endpoints
│   ├── models/       # Mongoose schemas
│   ├── services/     # Business logic (notifications, Stripe)
│   └── middleware/   # Auth and validation
├── src/              # Frontend app (React + Vite)
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page routes
│   └── styles/       # Tailwind and custom CSS
└── .env.example      # Environment variable template
```

## 👤 Roles

* **Citizen**: Register, pay fines, dispute violations, track points
* **Police**: Issue fines, upload evidence, view vehicle records
* **Admin**: Manage users, monitor analytics, configure rules

## ⛑️ Security Highlights

* JWT-based role authentication
* Passwords hashed with bcrypt
* Secure email handling (App password / OAuth ready)
* Stripe PCI-compliant payments
* Helmet.js and rate limiting enabled

## 🚀 Deployment

The app can be deployed to platforms like:

* **Render**, **Vercel**, or **Netlify** (frontend)
* **Heroku**, **Railway**, **EC2**, or **DigitalOcean** (backend)

Ensure production `.env` values are securely configured.

## 🚨 Disclaimer

> This project is a **demo** for academic or portfolio purposes.
> All references to government or official entities are placeholders.

## 🎉 License

This project is licensed under the [MIT License](LICENSE).

---

🌟 Built with passion by the TrafficLK team.

---
