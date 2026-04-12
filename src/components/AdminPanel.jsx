import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AdminPanel() {
  const { players, teams, updatePlayerPrice, updateTeamBudget, deletePlayer, getPlayerColorStyle } = useAppContext();
  
  const [playerEdits, setPlayerEdits] = useState({});
  const [teamEdits, setTeamEdits] = useState({});

  const handlePlayerEditChange = (id, val) => {
    setPlayerEdits(prev => ({ ...prev, [id]: val }));
  };

  const handlePlayerSave = (id) => {
    if (playerEdits[id]) {
      updatePlayerPrice(id, playerEdits[id]);
      setPlayerEdits(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      alert('Player price updated successfully! Team budget was automatically adjusted.');
    }
  };

  const handleTeamEditChange = (id, val) => {
    setTeamEdits(prev => ({ ...prev, [id]: val }));
  };

  const handleTeamSave = (id) => {
    if (teamEdits[id]) {
      updateTeamBudget(id, teamEdits[id]);
      setTeamEdits(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      alert('Team budget updated successfully! Remaining balance was automatically adjusted.');
    }
  };

  const soldPlayers = players.filter(p => p.status === 'sold');

  return (
    <div className="grid-2 animate-fade-in">
      <div className="card glass">
        <h3 className="mb-4">Edit Team Budgets</h3>
        {teams.length === 0 && <p className="text-muted">No teams available.</p>}
        <div className="flex flex-col gap-4">
          {teams.map(t => (
            <div key={t.id} className="p-4 bg-base rounded border border-border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg">{t.name}</h4>
                <div className="text-sm text-muted text-right">
                  Current Budget: ₹ {Number(t.initialBudget).toLocaleString('en-IN')}<br/>
                  <span className={t.remainingBalance > 0 ? 'text-success' : 'text-danger'}>Remaining: ₹ {Number(t.remainingBalance).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="New Total Budget" 
                  value={teamEdits[t.id] !== undefined ? teamEdits[t.id] : t.initialBudget}
                  onChange={e => handleTeamEditChange(t.id, e.target.value)} 
                />
                <button 
                  className="btn-primary" 
                  onClick={() => handleTeamSave(t.id)}
                  disabled={teamEdits[t.id] === undefined || String(teamEdits[t.id]) === String(t.initialBudget)}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card glass">
        <h3 className="mb-4">Edit Sold Players Rate</h3>
        {soldPlayers.length === 0 && <p className="text-muted">No players have been sold yet.</p>}
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
          {soldPlayers.map(p => (
            <div key={p.id} className="p-4 bg-base rounded border border-border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg" style={getPlayerColorStyle(p.minPrice)}>{p.name}</h4>
                <div className="text-sm text-muted text-right">
                  Sold to: {teams.find(t => t.id === p.teamId)?.name || 'Unknown'} <br/>
                  Current Rate: ₹ {Number(p.finalPrice).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="New Sold Rate" 
                  value={playerEdits[p.id] !== undefined ? playerEdits[p.id] : p.finalPrice}
                  onChange={e => handlePlayerEditChange(p.id, e.target.value)} 
                />
                <button 
                  className="btn-success" 
                  onClick={() => handlePlayerSave(p.id)}
                  disabled={playerEdits[p.id] === undefined || String(playerEdits[p.id]) === String(p.finalPrice)}
                >
                  Save
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => deletePlayer(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
