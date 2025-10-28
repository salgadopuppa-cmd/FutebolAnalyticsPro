/**
 * Goleiro - Mini-game module
 * Players test their reflexes by defending shots
 */

export function renderGoleiroGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let saves = 0;
    let goals = 0;
    let round = 0;
    const maxRounds = 10;
    let gameActive = false;
    
    const html = `
        <div class="game-container" style="text-align: center; padding: 20px;">
            <h3 style="color: #2ecc71;">🥅 Reflexos de Goleiro</h3>
            <p style="color: #ecf0f1;">Clique na bola para defender!</p>
            
            <div class="game-stats" style="margin: 20px 0;">
                <div style="display: inline-block; margin: 0 15px;">
                    <strong>Defesas:</strong> <span id="goleiro-saves">0</span>
                </div>
                <div style="display: inline-block; margin: 0 15px;">
                    <strong>Gols:</strong> <span id="goleiro-goals">0</span>
                </div>
                <div style="display: inline-block; margin: 0 15px;">
                    <strong>Rodada:</strong> <span id="goleiro-round">0</span>/${maxRounds}
                </div>
            </div>
            
            <div id="goleiro-goal-area" style="
                position: relative;
                width: 500px;
                height: 300px;
                background: linear-gradient(to bottom, #3498db 0%, #1a5c1a 100%);
                margin: 20px auto;
                border: 5px solid #fff;
                border-radius: 10px;
                overflow: hidden;
            ">
                <div id="goleiro-ball" style="
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background: radial-gradient(circle at 30% 30%, #fff 0%, #bdc3c7 100%);
                    border-radius: 50%;
                    border: 2px solid #34495e;
                    cursor: pointer;
                    display: none;
                    transition: all 0.05s linear;
                "></div>
                
                <div id="goleiro-net" style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 120px;
                    background: linear-gradient(0deg, rgba(255,255,255,0.1) 0%, transparent 100%);
                    border-top: 3px solid rgba(255,255,255,0.3);
                "></div>
            </div>
            
            <div id="goleiro-message" style="
                min-height: 30px;
                color: #f1c40f;
                font-weight: bold;
                font-size: 1.2em;
                margin: 20px 0;
            "></div>
            
            <button id="goleiro-start" style="
                background-color: #2ecc71;
                color: #1f1f1f;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
            ">Iniciar Jogo</button>
            
            <button id="goleiro-restart" style="
                display: none;
                background-color: #2ecc71;
                color: #1f1f1f;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
            ">Jogar Novamente</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    const goalArea = document.getElementById('goleiro-goal-area');
    const ball = document.getElementById('goleiro-ball');
    const savesDisplay = document.getElementById('goleiro-saves');
    const goalsDisplay = document.getElementById('goleiro-goals');
    const roundDisplay = document.getElementById('goleiro-round');
    const message = document.getElementById('goleiro-message');
    const startBtn = document.getElementById('goleiro-start');
    const restartBtn = document.getElementById('goleiro-restart');
    
    let animationId = null;
    let ballSpeed = 3;
    let ballDirection = { x: 0, y: 0 };
    
    function shootBall() {
        if (!gameActive || round >= maxRounds) return;
        
        round++;
        roundDisplay.textContent = round;
        
        // Random starting position at top
        const startX = Math.random() * (goalArea.offsetWidth - ball.offsetWidth);
        ball.style.left = startX + 'px';
        ball.style.top = '0px';
        ball.style.display = 'block';
        
        // Random target position at bottom
        const targetX = Math.random() * (goalArea.offsetWidth - ball.offsetWidth);
        const targetY = goalArea.offsetHeight - ball.offsetHeight;
        
        // Calculate direction
        const dx = targetX - startX;
        const dy = targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        ballDirection.x = (dx / distance) * ballSpeed;
        ballDirection.y = (dy / distance) * ballSpeed;
        
        message.textContent = '⚡ Bola vindo! Clique para defender!';
        message.style.color = '#f39c12';
        
        animateBall();
    }
    
    function animateBall() {
        if (!gameActive) return;
        
        const currentX = parseFloat(ball.style.left);
        const currentY = parseFloat(ball.style.top);
        
        const newX = currentX + ballDirection.x;
        const newY = currentY + ballDirection.y;
        
        // Check if ball reached the goal
        if (newY >= goalArea.offsetHeight - ball.offsetHeight) {
            ball.style.display = 'none';
            goals++;
            goalsDisplay.textContent = goals;
            message.textContent = '⚽ Gol! A bola passou!';
            message.style.color = '#e74c3c';
            
            if (round < maxRounds) {
                setTimeout(shootBall, 1500);
            } else {
                endGame();
            }
            return;
        }
        
        ball.style.left = newX + 'px';
        ball.style.top = newY + 'px';
        
        animationId = requestAnimationFrame(animateBall);
    }
    
    function handleBallClick(e) {
        e.stopPropagation();
        
        if (!gameActive) return;
        
        cancelAnimationFrame(animationId);
        ball.style.display = 'none';
        
        saves++;
        savesDisplay.textContent = saves;
        message.textContent = '🧤 Defesa! Ótimo reflexo!';
        message.style.color = '#2ecc71';
        
        if (round < maxRounds) {
            setTimeout(shootBall, 1500);
        } else {
            endGame();
        }
    }
    
    function startGame() {
        saves = 0;
        goals = 0;
        round = 0;
        gameActive = true;
        
        savesDisplay.textContent = saves;
        goalsDisplay.textContent = goals;
        roundDisplay.textContent = round;
        
        startBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        message.textContent = 'Prepare-se...';
        message.style.color = '#f1c40f';
        
        setTimeout(shootBall, 1000);
    }
    
    function endGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        ball.style.display = 'none';
        
        const defenseRate = ((saves / maxRounds) * 100).toFixed(1);
        message.textContent = `🏆 Jogo finalizado! Taxa de defesa: ${defenseRate}%`;
        message.style.color = '#f1c40f';
        
        restartBtn.style.display = 'inline-block';
    }
    
    ball.addEventListener('click', handleBallClick);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
}
