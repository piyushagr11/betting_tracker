# Auction Tracker

A comprehensive React + Vite application for tracking custom sports/auction live bidding. It offers advanced state persistence, an intuitive dark-mode interface, real-time live bidding arenas, and admin overrides.

## Features
- **Setup & Bulk Uploads**: Add Players and Teams manually or bulk load them through `.xlsx` templates.
- **Live Bidding Arena**: Instant feedback grid of all team budgets while actively bidding on a player.
- **Real-Time Dashboard**: See overall spending, rosters, and potential remaining budget instantly.
- **Admin Control**: Correct any mistakes made during live bidding with smart math calculations to reimburse or charge teams automatically.
- **Offline Persistence**: Uses browser local storage, meaning you can refresh or close the tab without losing any state.

## How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone or Download the Repository** to your local machine.
2. **Open a terminal** and navigate to the project directory:
   ```bash
   cd "Betting Tracker"
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Starting the Development Server
Once all the dependencies are installed, you can start the local application using:
```bash
npm run dev
```

A local web server will spin up and the terminal will output a localhost URL (usually `http://localhost:5173/`).

4. **Navigate to `http://localhost:5173/`** in your favorite browser to begin using the tracker!
