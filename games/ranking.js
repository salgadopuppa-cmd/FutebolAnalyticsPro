/**
 * Global Ranking - Module to display global player rankings
 */

export function renderGlobalRanking(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Mock data for global ranking
    const rankings = [
        { rank: 1, player: 'ProGamer_BR', coins: 15420, games: 245, accuracy: 89.5 },
        { rank: 2, player: 'FutebolMaster', coins: 14850, games: 230, accuracy: 87.2 },
        { rank: 3, player: 'TáticoReal', coins: 13990, games: 220, accuracy: 85.8 },
        { rank: 4, player: 'ChampionsLeague', coins: 12750, games: 198, accuracy: 84.1 },
        { rank: 5, player: 'ArtilheiroTop', coins: 11890, games: 185, accuracy: 82.5 },
        { rank: 6, player: 'GoleiroGênio', coins: 10950, games: 170, accuracy: 81.0 },
        { rank: 7, player: 'EstratégiaBR', coins: 9840, games: 155, accuracy: 78.9 },
        { rank: 8, player: 'DribladorPro', coins: 8920, games: 142, accuracy: 76.5 },
        { rank: 9, player: 'CampeãoMundial', coins: 8100, games: 130, accuracy: 75.2 },
        { rank: 10, player: 'TáticoAvançado', coins: 7450, games: 118, accuracy: 73.8 }
    ];
    
    const html = `
        <div class="ranking-container" style="text-align: center; padding: 20px;">
            <h3 style="color: #2ecc71;">🏆 Ranking Global de Jogadores</h3>
            <p style="color: #ecf0f1; margin-bottom: 20px;">
                Top 10 jogadores com mais moedas acumuladas
            </p>
            
            <div class="ranking-table" style="max-width: 800px; margin: 0 auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background-color: #34495e;">
                            <th style="padding: 12px; border: 1px solid #4a4a4a;">Rank</th>
                            <th style="padding: 12px; border: 1px solid #4a4a4a;">Jogador</th>
                            <th style="padding: 12px; border: 1px solid #4a4a4a;">💰 Moedas</th>
                            <th style="padding: 12px; border: 1px solid #4a4a4a;">🎮 Jogos</th>
                            <th style="padding: 12px; border: 1px solid #4a4a4a;">🎯 Precisão</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankings.map(player => {
                            let rankIcon = '';
                            let rankColor = '#ecf0f1';
                            
                            if (player.rank === 1) {
                                rankIcon = '🥇';
                                rankColor = '#f1c40f';
                            } else if (player.rank === 2) {
                                rankIcon = '🥈';
                                rankColor = '#bdc3c7';
                            } else if (player.rank === 3) {
                                rankIcon = '🥉';
                                rankColor = '#cd7f32';
                            } else {
                                rankIcon = player.rank;
                            }
                            
                            return `
                                <tr style="border-bottom: 1px solid #4a4a4a;">
                                    <td style="padding: 10px; border: 1px solid #4a4a4a; color: ${rankColor}; font-weight: bold; text-align: center;">
                                        ${rankIcon}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4a4a4a; font-weight: bold;">
                                        ${player.player}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4a4a4a; color: #f1c40f;">
                                        ${player.coins.toLocaleString()}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4a4a4a; text-align: center;">
                                        ${player.games}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4a4a4a; color: #2ecc71; text-align: center;">
                                        ${player.accuracy}%
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background-color: rgba(52, 73, 94, 0.5); border-radius: 8px;">
                <h4 style="color: #3498db; margin-bottom: 10px;">📊 Como subir no ranking?</h4>
                <ul style="text-align: left; max-width: 600px; margin: 0 auto; color: #ecf0f1;">
                    <li style="margin: 8px 0;">🎮 Jogue mais minijogos para ganhar moedas</li>
                    <li style="margin: 8px 0;">🎯 Melhore sua precisão nos jogos de tiro</li>
                    <li style="margin: 8px 0;">🥅 Pratique suas defesas no jogo de goleiro</li>
                    <li style="margin: 8px 0;">📈 Use as consultas de IA para ganhar moedas extras</li>
                    <li style="margin: 8px 0;">⭐ Conecte-se diariamente para bônus especiais</li>
                </ul>
            </div>
            
            <button id="refresh-ranking" style="
                background-color: #3498db;
                color: #fff;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
            ">🔄 Atualizar Ranking</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    const refreshBtn = document.getElementById('refresh-ranking');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Simulate refresh with a small animation
            refreshBtn.textContent = '⏳ Atualizando...';
            refreshBtn.disabled = true;
            
            setTimeout(() => {
                refreshBtn.textContent = '✅ Atualizado!';
                setTimeout(() => {
                    refreshBtn.textContent = '🔄 Atualizar Ranking';
                    refreshBtn.disabled = false;
                }, 1000);
            }, 1500);
        });
    }
}
