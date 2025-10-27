/**
 * Ranking - Sistema de Classificação e Rankings
 * Módulo exportável para carregamento dinâmico
 */

export function render(container, onFinish) {
  if (!container) {
    console.error('Container element not provided to ranking game');
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Create game UI
  const gameDiv = document.createElement('div');
  gameDiv.style.cssText = 'padding: 20px; text-align: center; background: #1a1a1a; border-radius: 10px;';
  
  const title = document.createElement('h3');
  title.textContent = '🏆 Desafio do Ranking';
  title.style.cssText = 'color: #f1c40f; margin-bottom: 15px;';
  
  const description = document.createElement('p');
  description.textContent = 'Compete para subir no ranking!';
  description.style.cssText = 'color: #ecf0f1; margin-bottom: 20px;';
  
  const rankDisplay = document.createElement('div');
  rankDisplay.innerHTML = '<div style="color: #9b59b6; font-weight: bold; font-size: 1.3em;">Posição Atual: #100</div>';
  rankDisplay.style.cssText = 'margin-bottom: 20px;';
  
  const startButton = document.createElement('button');
  startButton.textContent = 'Começar Desafio';
  startButton.style.cssText = 'background: #9b59b6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; font-weight: bold;';
  
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startButton.textContent = 'Competindo...';
    
    // Simulate gameplay
    let position = 100;
    const gameInterval = setInterval(() => {
      position = Math.max(1, position - Math.floor(Math.random() * 10) - 5);
      rankDisplay.innerHTML = `<div style="color: #9b59b6; font-weight: bold; font-size: 1.3em;">Posição Atual: #${position}</div>`;
    }, 500);
    
    // End game after 3 seconds
    setTimeout(() => {
      clearInterval(gameInterval);
      startButton.textContent = 'Desafio Concluído!';
      const score = Math.max(0, 100 - position) * 10;
      description.textContent = `Você alcançou a posição #${position}! Pontuação: ${score}`;
      
      // Call onFinish callback with final score
      if (typeof onFinish === 'function') {
        setTimeout(() => onFinish(score), 1500);
      }
    }, 3000);
  });
  
  gameDiv.appendChild(title);
  gameDiv.appendChild(description);
  gameDiv.appendChild(rankDisplay);
  gameDiv.appendChild(startButton);
  
  container.appendChild(gameDiv);
}

// Optional: export a second function for leaderboard display
export function showLeaderboard(container) {
  if (!container) return;
  
  const leaderboardDiv = document.createElement('div');
  leaderboardDiv.style.cssText = 'padding: 15px; background: #2c3e50; border-radius: 8px; margin-top: 20px;';
  
  const title = document.createElement('h4');
  title.textContent = '🏅 Top 5 Jogadores';
  title.style.cssText = 'color: #f1c40f; margin-bottom: 10px;';
  
  const list = document.createElement('ol');
  list.style.cssText = 'color: #ecf0f1; text-align: left; padding-left: 20px;';
  
  const topPlayers = [
    'Jogador Pro - 950 pts',
    'Mestre Tático - 890 pts',
    'Artilheiro - 850 pts',
    'Defensor - 820 pts',
    'Estrategista - 800 pts'
  ];
  
  topPlayers.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    li.style.cssText = 'margin-bottom: 5px;';
    list.appendChild(li);
  });
  
  leaderboardDiv.appendChild(title);
  leaderboardDiv.appendChild(list);
  container.appendChild(leaderboardDiv);
}
