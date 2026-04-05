import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Setup from './components/Setup';
import LiveBidding from './components/LiveBidding';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('setup');

  const switchTab = (tab) => {
    setActiveTab(tab);
    // slight scroll to top behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppProvider>
      <div className="container animate-fade-in">
        <header className="app-header">
          <h1>Betting Tracker</h1>
          <div className="app-nav">
            <button 
              className={activeTab === 'setup' ? 'active' : ''} 
              onClick={() => switchTab('setup')}
            >
              1. Setup Configuration
            </button>
            <button 
              className={activeTab === 'bidding' ? 'active' : ''} 
              onClick={() => switchTab('bidding')}
            >
              2. Live Bidding Arena
            </button>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => switchTab('dashboard')}
            >
              3. Overview Dashboard
            </button>
            <button 
              className={activeTab === 'admin' ? 'active' : ''} 
              onClick={() => switchTab('admin')}
            >
              4. Admin Panel
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'setup' && (
            <div className="animate-fade-in">
              <h2 className="text-center mb-2">Setup Players & Teams</h2>
              <p className="text-center text-muted mb-4">Add the items for your upcoming event below.</p>
              <Setup />
            </div>
          )}
          
          {activeTab === 'bidding' && (
            <div className="animate-fade-in">
              <h2 className="text-center mb-2">Live Bidding Arena</h2>
              <p className="text-center text-muted mb-4">Select a player and accept bids from teams.</p>
              <LiveBidding onDashboardSwitch={() => switchTab('dashboard')} />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <h2 className="text-center mb-2">Event Dashboard</h2>
              <p className="text-center text-muted mb-4">View real-time team balances and roster.</p>
              <Dashboard />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="animate-fade-in">
              <h2 className="text-center mb-2">Admin Overrides</h2>
              <p className="text-center text-muted mb-4">Make manual adjustments to team budgets and player sold prices.</p>
              <AdminPanel />
            </div>
          )}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
