# GreenTrack

GreenTrack is a web-based application designed for farms and suppliers to manage **microgreen orders** from restaurants and customers.  
It provides an easy way to record, organize, and track orders, while also keeping a clear overview of clients, products, and deliveries.  

## Features
- Manage customer and restaurant profiles  
- Track microgreen product offerings  
- Record and monitor orders in real time  
- Generate delivery records for clients  
- Gain a clear overview of daily operations (seeding and germination)

## Why GreenTrack?
Microgreen businesses often work on a **grow-to-order model**, where crop cycles depend directly on incoming orders. GreenTrack streamlines this process by giving employees the tools they need to understand operations at both a **macro and micro level**—from individual order details to overall business trends.  

# Local Installation

The project is divided into two main directories:
- **`/api`**: Contains the FastAPI backend that powers the business logic and serves data to the frontend.  
- **`/ui`**: Contains the React frontend where users can interact with the system via a clean web interface.  

### Prerequisites
- **Python 3.12+**  
- **Node.js 22+**  

### Database Migration

...

### Backend Setup

The backend is built with **FastAPI** and runs on **Python**. It provides the REST API used by the React frontend to manage orders, customers, products, and deliveries. To get started, you’ll set up a Python environment, install the required dependencies, and run the server using **uv** (a fast Python package runner).  
 
```bash
# change directory into 'api'
cd api

# create a new virtual environment named '.venv'
python -m venv .venv

# activate the environment (Linux/Mac)
. ./.venv/bin/activate

# install UV Python package
pip install uv

# install project dependencies
uv sync

# start the development server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

The frontend is built with **React** and bundled with **Vite** for fast development. It provides the user interface where employees can view and manage microgreen orders, customer profiles, and deliveries. To get started, you’ll install the Node.js dependencies and run the development server, which will issue requests to the FastAPI backend.  

```bash
# change directory into 'ui'
cd ui

# install all Node.js/React dependencies
npm install

# run the React development server (via Vite)
npm run dev
```