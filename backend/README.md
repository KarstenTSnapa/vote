# Vote API (ASP.NET Core Minimal API)

This is a minimal ASP.NET Core backend that stores messages in an SQLite database.
It's intended to run locally and be exposed via ngrok so the frontend (GitHub Pages) can call it.

Quick start (Windows PowerShell):

1. Install .NET 7 SDK if you don't have it: https://dotnet.microsoft.com/download

2. From this folder (backend), run:

   dotnet restore; dotnet run --urls "http://localhost:5000"

   The API will listen on http://localhost:5000 by default.

3. Start ngrok to expose the port to the internet (in another terminal):

   ngrok http 5000

   Copy the https://... ngrok URL and set it in the frontend `script.js` as the API base URL (replace the placeholder).

API endpoints:
- GET /messages -> returns all messages ordered by votes and creation time
- POST /messages -> { "text": "..." } creates a new message (returns created message with id)
- POST /messages/{id}/upvote -> increments votes and returns the updated message

Database file: `messages.db` (created in the `backend` folder automatically).

CORS: configured to allow any origin to make it easy to test from GitHub Pages. For production, lock this down.
