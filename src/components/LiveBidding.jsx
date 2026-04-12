import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function LiveBidding({ onDashboardSwitch }) {
  const { players, teams, settings, sellPlayer, getPlayerColorStyle } = useAppContext();

  const availablePlayers = players
    .filter(p => p.status === 'available')
    .sort((a, b) => b.minPrice - a.minPrice || a.name.localeCompare(b.name));

  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  // Create a local state to hold the bid inputs for each team easily
  const [teamBids, setTeamBids] = useState({});

  const handleBidChange = (teamId, amount) => {
    setTeamBids(prev => ({ ...prev, [teamId]: amount }));
  };

  const handleSell = (team) => {
    const amount = Number(teamBids[team.id]);

    if (!amount || amount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    if (!selectedPlayer) return;

    if (amount < Number(selectedPlayer.minPrice)) {
      alert(`Bid amount cannot be less than the base price of ₹ ${Number(selectedPlayer.minPrice).toLocaleString('en-IN')}`);
      return;
    }

    if (amount > team.remainingBalance) {
      alert(`${team.name} does not have enough remaining balance!`);
      return;
    }

    // Sell the player to this team
    sellPlayer(selectedPlayerId, team.id, amount);

    // Clear the selection
    setSelectedPlayerId('');
    setTeamBids({});
  };

  if (availablePlayers.length === 0) {
    if (players.length > 0) {
      return (
        <div className="card text-center">
          <h3>All Players Sold!</h3>
          <p className="text-muted mt-2">The auction is over.</p>
          <button className="btn-primary mt-4" onClick={() => onDashboardSwitch()}>View Final Dashboard</button>
        </div>
      );
    }
    return (
      <div className="card text-center">
        <h3>No Players Available</h3>
        <p className="text-muted">Please add players in the Setup phase first.</p>
      </div>
    );
  }

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className="animate-fade-in">
      <div className="card mb-4 glass">
        <h3>Select Player for Bidding</h3>
        <select
          className="mt-2"
          value={selectedPlayerId}
          onChange={e => setSelectedPlayerId(e.target.value)}
        >
          <option value="">-- Choose a Player --</option>
          {availablePlayers.map(p => (
            <option key={p.id} value={p.id} style={getPlayerColorStyle(p.minPrice)}>
              {p.name} (Base: ₹ {Number(p.minPrice).toLocaleString('en-IN')}){p.characteristics ? ` - ${p.characteristics}` : ''}
            </option>
          ))}
        </select>

        {selectedPlayer && (
          <div className="mt-4 p-4 bg-base rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
            <h2 className="text-xl text-primary" style={getPlayerColorStyle(selectedPlayer.minPrice)}>{selectedPlayer.name}</h2>
            <div className="flex gap-4 mt-2">
              <span className="badge badge-success">Base Price: ₹ {Number(selectedPlayer.minPrice).toLocaleString('en-IN')}</span>
              {selectedPlayer.characteristics && (
                <span className="badge">{selectedPlayer.characteristics}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <>
          <h3 className="mb-2 text-center text-xl text-primary">Live Team Bids</h3>
          {teams.length === 0 ? (
            <div className="text-center text-muted">No teams added yet. Go to Setup to add teams.</div>
          ) : (
            <div className="grid-teams animate-fade-in">
              {(() => {
                const totalRemainingMoney = teams.reduce((acc, t) => acc + t.remainingBalance, 0);
                const totalRemainingMinPrice = availablePlayers.reduce((acc, p) => acc + Number(p.minPrice || 0), 0) || 1;
                const marketInflationRatio = totalRemainingMoney / totalRemainingMinPrice;

                const maxTeamSize = Number(settings?.maxTeamSize) || 0;
                let useSlotLogic = false;
                let totalRemainingSlots = 0;

                if (maxTeamSize > 0) {
                  totalRemainingSlots = teams.reduce((acc, t) => {
                    const rSize = players.filter(p => p.teamId === t.id).length;
                    return acc + Math.max(0, maxTeamSize - rSize);
                  }, 0);
                  
                  if (totalRemainingSlots > 0) {
                    useSlotLogic = true;
                  }
                }

                const marketWealthPerSlot = useSlotLogic ? (totalRemainingMoney / totalRemainingSlots) : 0;

                return teams.map(team => {
                  const currentRosterSize = players.filter(p => p.teamId === team.id).length;
                  const selectedBasePrice = Number(selectedPlayer.minPrice || 0);

                  let smartSuggestion = 0;

                  if (useSlotLogic) {
                    const slotsRemaining = Math.max(0, maxTeamSize - currentRosterSize);
                    
                    if (slotsRemaining === 0) {
                      smartSuggestion = 0; // Team is full
                    } else {
                      const teamWealthPerSlot = team.remainingBalance / slotsRemaining;
                      const slotWealthMultiplier = marketWealthPerSlot > 0 ? (teamWealthPerSlot / marketWealthPerSlot) : 1;
                      
                      const suggestedMaxBidRaw = Math.round(selectedBasePrice * marketInflationRatio * slotWealthMultiplier);
                      
                      const minBasePriceInMarket = availablePlayers.length > 0 ? Math.min(...availablePlayers.map(p => Number(p.minPrice || 0))) : 0;
                      const requiredReserve = (slotsRemaining - 1) * minBasePriceInMarket;
                      const absoluteMaxBid = team.remainingBalance - requiredReserve;
                      
                      smartSuggestion = Math.max(
                        selectedBasePrice, 
                        Math.min(suggestedMaxBidRaw, absoluteMaxBid, team.remainingBalance)
                      );
                    }
                  } else {
                    const teamWealthMultiplier = totalRemainingMoney > 0 ? (team.remainingBalance / totalRemainingMoney) * teams.length : 1;
                    const suggestedMaxBidRaw = Math.round(selectedBasePrice * marketInflationRatio * teamWealthMultiplier);
                    smartSuggestion = Math.max(
                      selectedBasePrice,
                      Math.min(suggestedMaxBidRaw, team.remainingBalance)
                    );
                  }

                  return (
                    <div key={team.id} className="card">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg">{team.name}</h4>
                        <span className="badge">{currentRosterSize} Players</span>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-muted flex justify-between">
                          <span>Remaining Balance</span>
                          <span className="text-xs text-primary" title="Algorithmic suggested max bid based on market inflation and team wealth.">💎 Suggestion: ₹ {smartSuggestion.toLocaleString('en-IN')}</span>
                        </div>
                        <div className={`text-xl font-bold ${team.remainingBalance > 0 ? 'text-success' : 'text-danger'}`}>
                          ₹ {team.remainingBalance.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          placeholder={`Bid Amount (Base: ${Number(selectedPlayer.minPrice).toLocaleString('en-IN')})`}
                          value={teamBids[team.id] || ''}
                          onChange={e => handleBidChange(team.id, e.target.value)}
                          min={selectedPlayer.minPrice}
                          max={team.remainingBalance}
                        />
                        <button
                          className="btn-primary w-full"
                          onClick={() => handleSell(team)}
                          disabled={team.remainingBalance < Number(selectedPlayer.minPrice)}
                        >
                          Sell to {team.name}
                        </button>
                      </div>
                    </div>
                  )
                });
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
