# Insight Cart — Retail Intelligence & Demand Forecasting System

Live Demo: https://insight-cart-two.vercel.app

Insight Cart is a full-stack retail intelligence platform designed for inventory management, demand forecasting, and automated stockout prevention. The system processes transactional sales data from spreadsheets and live POS webhooks, fits time-series forecasting models, and generates automated restock reports delivered via email.

---

## System Architecture

The application is structured into a modular client-server architecture:

- **Frontend Application (`/frontend`):** Built with React 18, Tailwind CSS, and Recharts. Provides dashboard analytics, interactive demand projections, inventory matrices, data intake managers, and authentication interfaces.
- **Backend API (`/backend`):** Built with FastAPI (Python 3.11+). Exposes REST endpoints for data ingestion, analytical computations, forecasting, email dispatching, and authentication.
- **Data Layer:** PostgreSQL (production) with SQLAlchemy async ORM and SQLite support for local development. Includes automated table indexing, deduplication logic, and session token management.
- **Analytics & Forecasting Engine:** Uses Meta Prophet and Pandas for trend decomposition, seasonality analysis, ABC Pareto classification, and inventory exhaustion projections.
- **Notification Service:** SMTP client supporting TLS/SSL encryption and in-memory ReportLab PDF binary generation for restock and store digests.

---

## Core Capabilities

### 1. Data Ingestion & Normalization
- **Spreadsheet Ingestion:** Supports CSV and Excel (`.xlsx`, `.xls`) file formats with automatic column aliasing, header detection, date formatting, and numerical sanitization.
- **Live POS Streaming:** Dedicated REST and webhook endpoints for real-time transaction streaming from point-of-sale systems (Tally, Shopify, Square, Vyapar).
- **Idempotency & Deduplication:** Ensures duplicate invoice entries are ignored while maintaining accurate running shelf inventory counts.

### 2. Time-Series Demand Forecasting
- **7-Day SKU Predictions:** Fits time-series models across individual SKUs and aggregate store revenue to capture day-of-week seasonality and demand variance.
- **Restock Decision Logic:** Combines current stock, historical sales velocity, and supplier lead times to compute exact recommended reorder quantities and safety stock buffers.

### 3. Automated Report Generation & Email Dispatch
- **PDF Report Rendering:** Generates formatted Restock Reports and full Store Dossiers in memory using ReportLab.
- **Scheduled Dispatch:** Configurable for daily morning delivery or weekly Monday digests to specified management email addresses.
- **SMTP Protocol:** Connects to standard mail servers (Google SMTP, Amazon SES, SendGrid, Brevo) with secure TLS authentication.

### 4. Authentication & Security
- **Store Accounts:** Multi-tenant architecture with bcrypt password salting and hashing.
- **Password Recovery:** 6-digit numeric one-time password (OTP) verification workflow with 10-minute expirations and single-use database token invalidation.

---

## Technology Stack

- **Frontend:** React 18, Tailwind CSS, Framer Motion, Recharts, Lucide React, Sonner
- **Backend:** FastAPI, Uvicorn, Pydantic v2, ReportLab, SQLAlchemy, AnyIO
- **Data Science:** Pandas, NumPy, Prophet
- **Database:** PostgreSQL, SQLite
- **Deployment:** Vercel (Frontend), Render / Docker (Backend)

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### 1. Repository Setup
```bash
git clone https://github.com/YOUR_USERNAME/insight-cart.git
cd insight-cart
```

### 2. Backend Installation
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Installation
```bash
cd ../frontend
npm install
npm start
```
The application will be accessible at `http://localhost:3000`.

---

## Configuration

Set the following environment variables in `backend/.env`:

```env
# Network
CORS_ORIGINS=http://localhost:3000

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@domain.com
SMTP_TLS=true
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Register new store owner account |
| `POST` | `/api/login` | Authenticate and obtain session token |
| `POST` | `/api/auth/forgot-password` | Dispatch 6-digit OTP code to registered email |
| `POST` | `/api/auth/verify-otp` | Validate OTP code and receive password reset token |
| `POST` | `/api/auth/reset-password` | Update password with verified reset token |
| `POST` | `/api/upload` | Upload sales or inventory spreadsheet (CSV / Excel) |
| `POST` | `/api/pos/stream-sales` | Ingest live transaction items from POS |
| `GET` | `/api/insights` | Retrieve executive KPIs, Pareto distribution, and metrics |
| `GET` | `/api/forecast` | Retrieve 7-day demand predictions (SKU or store-wide) |
| `GET` | `/api/inventory` | Retrieve inventory status, stockout risk, and reorder levels |
| `POST` | `/api/reports/send-email` | Trigger immediate PDF report dispatch via SMTP |

---

## Automated Testing

Execute the test suite using pytest:

```bash
cd backend
pytest -o addopts="" tests/test_auth_and_sql.py tests/test_production_processing.py
```

---

## Deployment

- **Backend (Render):** Deploy using the included `render.yaml` blueprint. Set environment variables in the Render dashboard.
- **Frontend (Vercel):** Connect the repository to Vercel, set root directory to `frontend`, and configure `REACT_APP_BACKEND_URL` to point to the deployed backend URL.

---

## License

This project is licensed under the MIT License.
