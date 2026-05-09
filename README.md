# Major Project: AI Data Analytics Platform

This project consists of a Python backend (FastAPI/Flask) and a React frontend. Follow the instructions below to run the application locally.

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **npm**

---

## 1. Running the Backend

The backend is built with Python and requires its own virtual environment to install dependencies.

### Step 1.1: Open a terminal and navigate to the backend directory
```bash
cd backend
```

### Step 1.2: Create and activate a virtual environment
**On Windows:**
```bash
python -m venv myenv
myenv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv myenv
source myenv/bin/activate
```

### Step 1.3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 1.4: Run the Backend Server
You can launch both the FastAPI and Legacy Flask services simultaneously using the provided run script:
```bash
python run.py
```
*(Alternatively, to run just the FastAPI app, use: `python -m uvicorn main:app --reload --port 8000`)*

The backend APIs will now be available (usually FastAPI on `http://127.0.0.1:8000` and Flask on `http://127.0.0.1:5000`).

---

## 2. Running the Frontend

The frontend is a React application. 

### Step 2.1: Open a NEW terminal window and navigate to the frontend directory
Make sure you are in the project root first, then:
```bash
cd frontend
```

### Step 2.2: Install dependencies
*(You only need to do this the first time or if dependencies change)*
```bash
npm install
```

### Step 2.3: Start the React Development Server
```bash
npm start
```

The frontend application should automatically open in your default browser at `http://localhost:3000`.

---

## Summary of Commands to Start the App (After Initial Setup)

**Terminal 1 (Backend):**
```bash
cd backend
myenv\Scripts\activate
python run.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
