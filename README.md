# GreenTrack

GreenTrack is a web-based application designed for farms and suppliers to manage **microgreen orders** from restaurants and customers. It provides an easy way to record, organize, and track orders, while also keeping a clear overview of clients, products, and deliveries.  

This project was **developed and tested on macOS**

## Features
- Manage customer and restaurant profiles  
- Track microgreen product offerings  
- Record and monitor orders in real time  
- Gain a clear overview of daily operations (seeding and germination)

# Local Installation

The project is divided into two main directories:
- **`/api`**: Contains the FastAPI backend that powers the business logic and serves data to the frontend.  
- **`/ui`**: Contains the React frontend where users can interact with the system via a clean web interface.  

### Prerequisites
- **Python 3.12+**  
- **Node.js 22+**
- **MySQL Server 8+**

## Database Migration
The database is provided as a MySQL dump file located in
```bash
/db/microgreen_db_dump.sql
```
You can load the database using either MySQL Workbench or the MySQL command line.

### Using MySQL Workbench
1. Open MySQL Workbench
2. Open and run the file:
```bash
db/microgreen_db_dump.sql
```
3. This will create the database:
```bash
microgreens_db
```

### Using MySQL Command Line
From the root of the project:
```bash
mysql -u YOUR_USERNAME -p < db/microgreen_db_dump.sql
```
The enter your MySQL password when prompted.

## Environment Configuration
In the **root directory**, locate the **`.env`** file and update it with your MySQL credentials:
```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=YOUR_SQL_USERNAME
DB_PASSWORD=YOUR_SQL_USERNAME
DB_NAME=microgreens_db
```

## Backend Setup

The backend is built with **FastAPI** and runs on **Python**. It provides the REST API used by the React frontend to manage orders, customers, products, and deliveries. To get started, you’ll set up a Python environment, install the required dependencies, and run the server using **uv** (a fast Python package runner).  
 
```bash
# change directory into 'api'
cd api

# create a new virtual environment named '.venv'
python -m venv .venv

# activate the environment (Linux/Mac)
. ./.venv/bin/activate

# install backend dependencies
pip install -r requirements.txt

# start the development server
uvicorn src.main:app --reload --port 8000
```
The backend will now be running at: **`http://127.0.0.1:8000`**

## Frontend Setup

The frontend is built with **React** and bundled with **Vite** for fast development. It provides the user interface where employees can view and manage microgreen orders, customer profiles, and deliveries. To get started, you’ll install the Node.js dependencies and run the development server, which will issue requests to the FastAPI backend.  

```bash
# change directory into 'ui'
cd ui

# install all Node.js/React dependencies
npm install

# run the React development server (via Vite)
npm run dev
```

## Login Credentials (DEMO Admin)

The project currently includes only the Admin view, which has full system access:
```bash
Username: mishell@mb.com
Password: password
```
