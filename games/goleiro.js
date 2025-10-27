/**
 * Reflexos de Goleiro - Jogo de Defesas
 * Módulo exportável para carregamento dinâmico
 */

export function render(container, onFinish) {
  if (!container) {
    console.error('Container element not provided to goleiro game');
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Create game UI
  const gameDiv = document.createElement('div');
  gameDiv.style.cssText = 'padding: 20px; text-align: center; background: #1a1a1a; border-radius: 10px;';
  
  const title = document.createElement('h3');
  title.textContent = '🥅 Reflexos de Goleiro';
  title.style.cssText = 'color: #f1c40f; margin-bottom: 15px;';
  
  const description = document.createElement('p');
  description.textContent = 'Defenda chutes e teste seus reflexos!';
  description.style.cssText = 'color: #ecf0f1; margin-bottom: 20px;';
  
  const statsDisplay = document.createElement('div');
  statsDisplay.innerHTML = '<div style="color: #2ecc71; font-weight: bold;">Defesas: 0</div><div style="color: #e74c3c; font-weight: bold; margin-top: 5px;">Gols Sofridos: 0</div>';
  statsDisplay.style.cssText = 'font-size: 1.1em; margin-bottom: 20px;';
  
  const startButton = document.createElement('button');
  startButton.textContent = 'Iniciar Defesas';
  startButton.style.cssText = 'background: #2ecc71; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; font-weight: bold;';
  
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startButton.textContent = 'Defendendo...';
    
    // Simulate gameplay
    let saves = 0;
    let goals = 0;
    const gameInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        saves++;
      } else {
        goals++;
      }
      statsDisplay.innerHTML = `<div style="color: #2ecc71; font-weight: bold;">Defesas: ${saves}</div><div style="color: #e74c3c; font-weight: bold; margin-top: 5px;">Gols Sofridos: ${goals}</div>`;
    }, 600);
    
    // End game after 3 seconds
    setTimeout(() => {
      clearInterval(gameInterval);
      startButton.textContent = 'Jogo Finalizado!';
      const score = saves * 10 - goals * 5;
      description.textContent = `Você fez ${saves} defesas! Pontuação: ${score}`;
      
      // Call onFinish callback with final score
      if (typeof onFinish === 'function') {
        setTimeout(() => onFinish(score), 1500);
      }
    }, 3000);
  });
  
  gameDiv.appendChild(title);
  gameDiv.appendChild(description);
  gameDiv.appendChild(statsDisplay);
  gameDiv.appendChild(startButton);
  
  container.appendChild(gameDiv);
}
