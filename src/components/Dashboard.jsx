import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { players, teams } = useAppContext();

  if (teams.length === 0) {
    return (
      <div className="card text-center">
        <h3>No Data Available</h3>
        <p className="text-muted">Set up teams and complete some bids to see the results here.</p>
      </div>
    );
  }

  return (
    <div className="grid-3 animate-fade-in">
      {teams.map(team => {
        const teamPlayers = players.filter(p => p.teamId === team.id);
        
        return (
          <div key={team.id} className="card">
            <h3 className="text-xl mb-1 text-primary">{team.name}</h3>
            
            <div className="mb-4 pb-2 border-b flex flex-col gap-2" style={{ borderBottom: '1px solid var(--border)'}}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Remaining:</span>
                <span className={`text-xl font-bold ${team.remainingBalance > 0 ? 'text-success' : 'text-danger'}`}>
                  ₹ {team.remainingBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Budget:</span>
                <span className="font-bold text-muted">
                  ₹ {Number(team.initialBudget).toLocaleString()}
                </span>
              </div>
            </div>

            <h4 className="mb-2 text-sm text-muted uppercase tracking-wider">
              Roster ({teamPlayers.length})
            </h4>
            
            {teamPlayers.length === 0 ? (
              <div className="text-muted text-sm text-center py-2 bg-base rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
                No players acquired yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {teamPlayers.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-base p-2 rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <div>
                      <div className="font-bold">{p.name}</div>
                      {p.characteristics && <div className="text-xs text-muted">{p.characteristics}</div>}
                    </div>
                    <span className="text-sm badge badge-success text-right w-auto whitespace-nowrap">
                      ₹ {p.finalPrice}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
