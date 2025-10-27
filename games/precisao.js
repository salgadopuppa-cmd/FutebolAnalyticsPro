/**
 * Precisão Tática - Jogo de Precisão de Chutes
 * Módulo exportável para carregamento dinâmico
 */

export function render(container, onFinish) {
  if (!container) {
    console.error('Container element not provided to precisao game');
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Create game UI
  const gameDiv = document.createElement('div');
  gameDiv.style.cssText = 'padding: 20px; text-align: center; background: #1a1a1a; border-radius: 10px;';
  
  const title = document.createElement('h3');
  title.textContent = '⚽ Precisão Tática';
  title.style.cssText = 'color: #f1c40f; margin-bottom: 15px;';
  
  const description = document.createElement('p');
  description.textContent = 'Teste sua precisão em chutes ao gol!';
  description.style.cssText = 'color: #ecf0f1; margin-bottom: 20px;';
  
  const scoreDisplay = document.createElement('div');
  scoreDisplay.textContent = 'Pontuação: 0';
  scoreDisplay.style.cssText = 'color: #2ecc71; font-size: 1.2em; font-weight: bold; margin-bottom: 20px;';
  
  const startButton = document.createElement('button');
  startButton.textContent = 'Iniciar Jogo';
  startButton.style.cssText = 'background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; font-weight: bold;';
  
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startButton.textContent = 'Jogando...';
    
    // Simulate gameplay
    let score = 0;
    const gameInterval = setInterval(() => {
      score += Math.floor(Math.random() * 20) + 10;
      scoreDisplay.textContent = `Pontuação: ${score}`;
    }, 500);
    
    // End game after 3 seconds
    setTimeout(() => {
      clearInterval(gameInterval);
      startButton.textContent = 'Jogo Finalizado!';
      description.textContent = `Você marcou ${score} pontos! Ótima precisão!`;
      
      // Call onFinish callback with final score
      if (typeof onFinish === 'function') {
        setTimeout(() => onFinish(score), 1500);
      }
    }, 3000);
  });
  
  gameDiv.appendChild(title);
  gameDiv.appendChild(description);
  gameDiv.appendChild(scoreDisplay);
  gameDiv.appendChild(startButton);
  
  container.appendChild(gameDiv);
}
