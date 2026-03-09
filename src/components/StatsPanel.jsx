import React from 'react';
import '../styles/StatsPanel.css';

function StatsPanel({ stats, parser }) {
  const playTimeFormatted = parser.formatPlaytime(stats.playtime);
  const winRate = parser.getWinRate(stats.totalRuns, stats.totalVictories);
  const deathRate = stats.totalRuns > 0 
    ? ((stats.totalDeaths / stats.totalRuns) * 100).toFixed(1) 
    : '0';

  const statCards = [
    {
      icon: '🎮',
      label: 'Runs totaux',
      value: stats.totalRuns.toLocaleString('fr-FR'),
      color: 'blue'
    },
    {
      icon: '👑',
      label: 'Victoires',
      value: stats.totalVictories.toLocaleString('fr-FR'),
      color: 'gold'
    },
    {
      icon: '💀',
      label: 'Morts',
      value: stats.totalDeaths.toLocaleString('fr-FR'),
      color: 'red'
    },
    {
      icon: '⏱️',
      label: 'Temps total',
      value: playTimeFormatted,
      color: 'purple'
    },
    {
      icon: '📈',
      label: 'Taux de victoire',
      value: winRate,
      color: 'green'
    },
    {
      icon: '📉',
      label: 'Taux de mort',
      value: `${deathRate}%`,
      color: 'orange'
    }
  ];

  return (
    <section className="stats-panel">
      <h3>📊 Statistiques générales</h3>
      
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card stat-${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-bar">
        <div className="bar-item">
          <span>Taux de victoire</span>
          <div className="progress-bar">
            <div 
              className="progress-fill victory" 
              style={{ width: `${Math.min(parseFloat(winRate), 100)}%` }}
            />
          </div>
        </div>
        <div className="bar-item">
          <span>Taux de mort</span>
          <div className="progress-bar">
            <div 
              className="progress-fill death" 
              style={{ width: `${Math.min(parseFloat(deathRate), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsPanel;
