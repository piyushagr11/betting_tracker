import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';

export default function Setup() {
  const { addPlayer, addTeam, players, teams, resetAuction, clearAllData, addPlayersBatch, addTeamsBatch, getPlayerColorStyle, settings, updateSettings } = useAppContext();
  
  const [playerInput, setPlayerInput] = useState({ name: '', minPrice: '', characteristics: '' });
  const [teamInput, setTeamInput] = useState({ name: '', initialBudget: '' });

  const handlePlayerSubmit = (e) => {
    e.preventDefault();
    if (!playerInput.name || !playerInput.minPrice) return;
    addPlayer(playerInput);
    setPlayerInput({ name: '', minPrice: '', characteristics: '' });
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (!teamInput.name || !teamInput.initialBudget) return;
    addTeam(teamInput);
    setTeamInput({ name: '', initialBudget: '' });
  };

  const downloadTemplate = (type) => {
    let headers, filename;
    if (type === 'players') {
      headers = [['Name', 'Min Price', 'Characteristics']];
      filename = 'players_template.xlsx';
    } else {
      headers = [['Name', 'Total Budget']];
      filename = 'teams_template.xlsx';
    }
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  };

  const handleFileUploadPlayers = (e) => {
    const target = e.target;
    const file = target.files[0];
    console.log("Players file selected:", file?.name);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = new Uint8Array(evt.target.result);
        const wb = XLSX.read(dataBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        console.log("Raw Players Data:", data);
        
        const mapped = data.map(row => ({
          name: row.Name || row.name,
          minPrice: row['Min Price'] || row.minPrice || row.price || 0,
          characteristics: row.Characteristics || row.characteristics || ''
        })).filter(p => p.name);
        
        console.log("Mapped Players Data:", mapped);
        if (mapped.length > 0) {
          addPlayersBatch(mapped);
        } else {
          alert('No valid players found in file. Ensure the "Name" column is present.');
        }
      } catch (err) {
        console.error("Error parsing players file:", err);
        alert("There was an error parsing the file.");
      } finally {
        target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUploadTeams = (e) => {
    const target = e.target;
    const file = target.files[0];
    console.log("Teams file selected:", file?.name);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = new Uint8Array(evt.target.result);
        const wb = XLSX.read(dataBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        console.log("Raw Teams Data:", data);
        
        const mapped = data.map(row => ({
          name: row.Name || row.name,
          initialBudget: row['Total Budget'] || row.budget || row.initialBudget || 0
        })).filter(t => t.name);
        
        console.log("Mapped Teams Data:", mapped);
        if (mapped.length > 0) {
          addTeamsBatch(mapped);
        } else {
           alert('No valid teams found in file. Ensure the "Name" column is present.');
        }
      } catch (err) {
        console.error("Error parsing teams file:", err);
        alert("There was an error parsing the file.");
      } finally {
        target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="grid-2">
      {/* Player Setup Card */}
      <div className="card">
        <h3>Add Player</h3>
        <form onSubmit={handlePlayerSubmit}>
          <div className="form-group">
            <label>Player Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={playerInput.name}
              onChange={e => setPlayerInput({...playerInput, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Minimum Price (Base Bid)</label>
            <input 
              type="number" 
              placeholder="e.g. 500"
              value={playerInput.minPrice}
              onChange={e => setPlayerInput({...playerInput, minPrice: e.target.value})}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Characteristics / Traits</label>
            <input 
              type="text" 
              placeholder="e.g. Fast, Agile, Goalkeeper"
              value={playerInput.characteristics}
              onChange={e => setPlayerInput({...playerInput, characteristics: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary w-full">Add Player</button>
        </form>
        <div className="mt-4" style={{borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem'}}>
          <div className="flex justify-between items-center mb-2">
            <h4>Bulk Upload</h4>
            <button className="btn-primary text-sm" style={{padding: '0.25rem 0.5rem'}} onClick={() => downloadTemplate('players')}>Download Template</button>
          </div>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUploadPlayers} />
        </div>
        <div className="mt-4">
          <h4>Added Players ({players.length})</h4>
          <div className="text-muted text-sm mt-1 flex flex-col gap-2">
            {players.slice(-3).reverse().map(p => (
              <div key={p.id} className="flex justify-between items-center bg-elevated p-2 rounded">
                <span style={getPlayerColorStyle(p.minPrice)}>{p.name}</span>
                <span className="badge">Base: ₹ {Number(p.minPrice).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {players.length > 3 && <div className="text-center text-sm">...and {players.length - 3} more</div>}
            {players.length === 0 && <span>No players added yet.</span>}
          </div>
        </div>
      </div>

      {/* Team Setup Card */}
      <div className="card">
        <h3>Add Team</h3>
        <form onSubmit={handleTeamSubmit}>
          <div className="form-group">
            <label>Team Name</label>
            <input 
              type="text" 
              placeholder="e.g. Red Dragons"
              value={teamInput.name}
              onChange={e => setTeamInput({...teamInput, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Budget</label>
            <input 
              type="number" 
              placeholder="e.g. 10000"
              value={teamInput.initialBudget}
              onChange={e => setTeamInput({...teamInput, initialBudget: e.target.value})}
              required
              min="1"
            />
          </div>
          <button type="submit" className="btn-success w-full mt-1">Add Team</button>
        </form>
        <div className="mt-4" style={{borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem'}}>
          <div className="flex justify-between items-center mb-2">
            <h4>Bulk Upload</h4>
            <button className="btn-primary text-sm" style={{padding: '0.25rem 0.5rem'}} onClick={() => downloadTemplate('teams')}>Download Template</button>
          </div>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUploadTeams} />
        </div>
        <div className="mt-4">
          <h4>Added Teams ({teams.length})</h4>
          <div className="text-muted text-sm mt-1 flex flex-col gap-2">
            {teams.slice(-3).reverse().map(t => (
              <div key={t.id} className="flex justify-between items-center bg-elevated p-2 rounded">
                <span>{t.name}</span>
                <span className="badge badge-success">Budget: ₹ {Number(t.initialBudget).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {teams.length > 3 && <div className="text-center text-sm">...and {teams.length - 3} more</div>}
            {teams.length === 0 && <span>No teams added yet.</span>}
          </div>
        </div>
      </div>

      {/* Auction Settings Card */}
      <div className="card mb-4" style={{ gridColumn: '1 / -1' }}>
        <h3>Auction Settings</h3>
        <div className="form-group mt-2" style={{ maxWidth: '400px' }}>
          <label>Max Team Size (Optional)</label>
          <input 
            type="number" 
            placeholder="e.g. 15"
            value={settings?.maxTeamSize || ''}
            onChange={e => updateSettings({ maxTeamSize: e.target.value })}
            min="1"
          />
          <p className="text-xs text-muted mt-1">Setting this will improve the smart suggestion algorithm based on how many slots a team needs to fill.</p>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="card text-center mb-4" style={{ gridColumn: '1 / -1' }}>
        <h3 className="mb-2 text-danger">Admin Controls</h3>
        <p className="text-muted text-sm mb-4">Use these actions cautiously. Data deletion cannot be undone.</p>
        <div className="flex justify-center gap-4">
          <button className="btn-success" onClick={resetAuction} style={{ backgroundColor: 'var(--accent)' }}>
             Reset Auction Bids
          </button>
          <button className="btn-danger" onClick={clearAllData}>
             Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
}
