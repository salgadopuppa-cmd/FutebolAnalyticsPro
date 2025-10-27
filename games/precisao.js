/**
 * Precisão Tática - Mini-game module
 * Players test their accuracy by shooting at targets
 */

export function renderPrecisaoGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let score = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    const html = `
        <div class="game-container" style="text-align: center; padding: 20px;">
            <h3 style="color: #2ecc71;">⚽ Precisão Tática</h3>
            <p style="color: #ecf0f1;">Clique nos alvos para pontuar!</p>
            
            <div class="game-stats" style="margin: 20px 0;">
                <div style="display: inline-block; margin: 0 15px;">
                    <strong>Pontuação:</strong> <span id="precisao-score">0</span>
                </div>
                <div style="display: inline-block; margin: 0 15px;">
                    <strong>Tentativas:</strong> <span id="precisao-attempts">0</span>/${maxAttempts}
                </div>
            </div>
            
            <div id="precisao-target-area" style="
                position: relative;
                width: 400px;
                height: 300px;
                background: linear-gradient(to bottom, #2c3e50 0%, #1a5c1a 100%);
                margin: 20px auto;
                border: 3px solid #27ae60;
                border-radius: 10px;
                cursor: crosshair;
            ">
                <div id="precisao-target" style="
                    position: absolute;
                    width: 50px;
                    height: 50px;
                    background: radial-gradient(circle, #e74c3c 0%, #c0392b 100%);
                    border-radius: 50%;
                    border: 3px solid #fff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                "></div>
            </div>
            
            <div id="precisao-message" style="
                min-height: 30px;
                color: #f1c40f;
                font-weight: bold;
                font-size: 1.2em;
            "></div>
            
            <button id="precisao-restart" style="
                display: none;
                background-color: #2ecc71;
                color: #1f1f1f;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
            ">Jogar Novamente</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    const targetArea = document.getElementById('precisao-target-area');
    const target = document.getElementById('precisao-target');
    const scoreDisplay = document.getElementById('precisao-score');
    const attemptsDisplay = document.getElementById('precisao-attempts');
    const message = document.getElementById('precisao-message');
    const restartBtn = document.getElementById('precisao-restart');
    
    function moveTarget() {
        const maxX = targetArea.offsetWidth - target.offsetWidth;
        const maxY = targetArea.offsetHeight - target.offsetHeight;
        
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
    }
    
    function handleTargetClick(e) {
        if (attempts >= maxAttempts) return;
        
        e.stopPropagation();
        score += 10;
        attempts++;
        
        scoreDisplay.textContent = score;
        attemptsDisplay.textContent = attempts;
        
        message.textContent = '🎯 Acertou! +10 pontos';
        message.style.color = '#2ecc71';
        
        if (attempts < maxAttempts) {
            moveTarget();
        } else {
            endGame();
        }
    }
    
    function handleMiss() {
        if (attempts >= maxAttempts) return;
        
        attempts++;
        attemptsDisplay.textContent = attempts;
        
        message.textContent = '❌ Errou! Tente novamente';
        message.style.color = '#e74c3c';
        
        if (attempts >= maxAttempts) {
            endGame();
        }
    }
    
    function endGame() {
        target.style.display = 'none';
        targetArea.style.cursor = 'default';
        
        const accuracy = ((score / 10) / maxAttempts * 100).toFixed(1);
        message.textContent = `🏆 Jogo finalizado! Precisão: ${accuracy}%`;
        message.style.color = '#f1c40f';
        
        restartBtn.style.display = 'inline-block';
    }
    
    function restart() {
        score = 0;
        attempts = 0;
        scoreDisplay.textContent = score;
        attemptsDisplay.textContent = attempts;
        message.textContent = '';
        target.style.display = 'block';
        targetArea.style.cursor = 'crosshair';
        restartBtn.style.display = 'none';
        moveTarget();
    }
    
    target.addEventListener('click', handleTargetClick);
    targetArea.addEventListener('click', handleMiss);
    restartBtn.addEventListener('click', restart);
    
    moveTarget();
}
