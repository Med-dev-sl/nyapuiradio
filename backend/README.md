# Backend for nyapuiradio

Node + Express + sqlite3 backend.

## Run

npm install
npm run server

## API

- GET / -> health check
- GET /api/spots -> list stations
- POST /api/spots -> create station

Body JSON { "name": "Radio X", "frequency": "101.1" }
