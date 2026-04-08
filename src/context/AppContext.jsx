import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Load from local storage or use defaults
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('bt_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('bt_teams');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('bt_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('bt_teams', JSON.stringify(teams));
  }, [teams]);

  // Actions
  const addPlayer = (player) => {
    setPlayers(prev => [...prev, { ...player, id: Date.now().toString(), status: 'available', teamId: null, finalPrice: null }]);
  };

  const addTeam = (team) => {
    setTeams(prev => [...prev, { ...team, id: Date.now().toString(), remainingBalance: Number(team.initialBudget) }]);
  };

  const sellPlayer = (playerId, teamId, amount) => {
    const bidAmount = Number(amount);
    
    // Update the team's remaining balance
    setTeams(prevTeams => prevTeams.map(t => {
      if (t.id === teamId) {
        return { ...t, remainingBalance: t.remainingBalance - bidAmount };
      }
      return t;
    }));

    // Update the player's status
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        return { ...p, status: 'sold', teamId: teamId, finalPrice: bidAmount };
      }
      return p;
    }));
  };

  const resetAuction = () => {
    if (window.confirm("Are you sure you want to reset the entire auction? All bids will be reversed, and teams' budgets restored.")) {
      setPlayers(prev => prev.map(p => ({ ...p, status: 'available', teamId: null, finalPrice: null })));
      setTeams(prev => prev.map(t => ({ ...t, remainingBalance: Number(t.initialBudget) })));
    }
  };

  const addPlayersBatch = (newPlayers) => {
    const formatted = newPlayers.map((p, index) => ({
      ...p,
      minPrice: Number(p.minPrice),
      id: Date.now().toString() + index,
      status: 'available',
      teamId: null,
      finalPrice: null
    }));
    setPlayers(prev => [...prev, ...formatted]);
  };

  const addTeamsBatch = (newTeams) => {
    const formatted = newTeams.map((t, index) => ({
      ...t,
      initialBudget: Number(t.initialBudget),
      remainingBalance: Number(t.initialBudget),
      id: Date.now().toString() + index
    }));
    setTeams(prev => [...prev, ...formatted]);
  };

  const updatePlayerPrice = (playerId, newPriceStr) => {
    const newPrice = Number(newPriceStr);
    const player = players.find(p => p.id === playerId);
    if (!player || player.status !== 'sold') return;
    
    const priceDiff = newPrice - player.finalPrice;
    
    // Update team remaining budget with the difference FIRST
    setTeams(prevTeams => prevTeams.map(t => {
      if (t.id === player.teamId) {
        return { ...t, remainingBalance: t.remainingBalance - priceDiff };
      }
      return t;
    }));
    
    // Then update the player
    setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? { ...p, finalPrice: newPrice } : p));
  };

  const updateTeamBudget = (teamId, newTotalBudgetStr) => {
    const newTotal = Number(newTotalBudgetStr);
    setTeams(prevTeams => prevTeams.map(t => {
      if (t.id === teamId) {
        const budgetDiff = newTotal - t.initialBudget;
        return { 
          ...t, 
          initialBudget: newTotal, 
          remainingBalance: t.remainingBalance + budgetDiff 
        };
      }
      return t;
    }));
  };

  const deletePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to permanently delete this player? If they were sold, the team will be refunded.")) {
      const player = players.find(p => p.id === playerId);
      
      if (player && player.status === 'sold') {
        // Refund the team
        setTeams(prevTeams => prevTeams.map(t => {
          if (t.id === player.teamId) {
            return { ...t, remainingBalance: t.remainingBalance + player.finalPrice };
          }
          return t;
        }));
      }
      
      // Remove player
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
    }
  };

  const clearAllData = () => {
    if (window.confirm("WARNING: This will permanently delete all players and teams. Are you sure?")) {
      setPlayers([]);
      setTeams([]);
      localStorage.removeItem('bt_players');
      localStorage.removeItem('bt_teams');
    }
  };

  // Get unique base prices and sort them ascending
  const uniquePrices = [...new Set(players.map(p => Number(p.minPrice) || 0))].sort((a, b) => a - b);

  const getPlayerColorStyle = (price) => {
    const p = Number(price) || 0;
    
    // If there's 1 or fewer variants, default to dull grey
    if (uniquePrices.length <= 1) return { color: '#48484a' };
    
    const index = uniquePrices.indexOf(p);
    const validIndex = index === -1 ? 0 : index;
    
    // Ratio ranges strictly from 0.0 (lowest variant) to 1.0 (highest variant)
    // based ON the number of unique price variants!
    const ratio = validIndex / (uniquePrices.length - 1);
    
    // Dynamic color from Dull Grey to Bright Red
    // Lowest (ratio 0.0): hsl(50, 0%, 40%) -> Dull Grey
    // Highest (ratio 1.0): hsl(0, 100%, 65%) -> Bright Red
    const hue = 50 - (ratio * 50);
    const saturation = ratio * 100;
    const lightness = 40 + (ratio * 25);
    
    return { 
      color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      textShadow: ratio === 1 ? `0 0 8px hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)` : 'none'
    };
  };

  return (
    <AppContext.Provider value={{ 
      players, teams, addPlayer, addTeam, sellPlayer, 
      resetAuction, clearAllData, addPlayersBatch, addTeamsBatch,
      updatePlayerPrice, updateTeamBudget, deletePlayer,
      getPlayerColorStyle
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
