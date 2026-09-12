// Configuration
const BACKEND_URL = 'http://TON_IP_RASPBERRY:3003';
let currentGame = null;
let userId = null;

// Initialisation Discord SDK
discord.embeddedApp.ready();

discord.embeddedApp.on('ready', () => {
  console.log('Activity ready!');
  
  discord.embeddedApp.getUser().then(user => {
    userId = user.id;
    loadBalance();
  });
});

// Charger le solde
async function loadBalance() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/balance/${userId}`);
    const data = await res.json();
    document.getElementById('balance').textContent = data.balance;
  } catch (err) {
    console.error('Erreur chargement solde:', err);
  }
}

// S�lectionner un jeu
function selectGame(game) {
  currentGame = game;
  document.querySelector('.games').classList.add('hidden');
  document.getElementById('game-area').classList.remove('hidden');
  document.getElementById('game-title').textContent = game === 'blackjack' ? '🃏 Blackjack' : '🎡 Roulette';
  
  const content = document.getElementById('game-content');
  
  if (game === 'blackjack') {
    content.innerHTML = `
      <div class="cards" id="dealer-cards">
        <div class="card">🂠</div>
        <div class="card">🂠</div>
      </div>
      <p style="text-align:center;margin:10px 0;">Croupier</p>
      
      <div class="cards" id="player-cards">
        <div class="card">🂡</div>
        <div class="card">🂢</div>
      </div>
      <p style="text-align:center;margin:10px 0;">Vous</p>
      
      <div class="actions" style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
        <button onclick="hit()" style="padding:10px 20px;background:#43eb7b;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">Carte</button>
        <button onclick="stand()" style="padding:10px 20px;background:#f5576c;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">Rester</button>
      </div>
    `;
  } else if (game === 'roulette') {
    content.innerHTML = `
      <div class="roulette-wheel"></div>
      <div class="bet-controls" style="justify-content:center;flex-wrap:wrap;">
        <button onclick="betRoulette('red')" style="padding:10px 20px;background:#ff0000;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;margin:5px;">Rouge</button>
        <button onclick="betRoulette('black')" style="padding:10px 20px;background:#000000;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;margin:5px;">Noir</button>
        <button onclick="betRoulette('green')" style="padding:10px 20px;background:#00ff00;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;margin:5px;">Vert (0)</button>
      </div>
    `;
  }
}

// Retour au menu
function backToMenu() {
  currentGame = null;
  document.querySelector('.games').classList.remove('hidden');
  document.getElementById('game-area').classList.add('hidden');
  loadBalance();
}

// Placer un pari
async function placeBet() {
  const amount = document.getElementById('bet-amount').value;
  if (!amount || amount < 1) return alert('Montant invalide');
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/game/${currentGame}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, action: 'bet' })
    });
    
    const data = await res.json();
    
    if (data.error) {
      alert(data.error);
    } else {
      // Afficher le jeu
      const content = document.getElementById('game-content');
      if (currentGame === 'blackjack') {
        content.innerHTML += `
          <div class="result ${data.result === 'win' ? 'win' : 'lose'}">
            ${data.result === 'win' ? '🎉 Gagn�!' : '❌ Perdu...'}
          </div>
        `;
      }
      loadBalance();
    }
  } catch (err) {
    console.error('Erreur pari:', err);
    alert('Erreur de connexion au serveur');
  }
}

// Blackjack - tirer une carte
async function hit() {
  // Logique � impl�menter avec le backend
}

// Blackjack - rester
async function stand() {
  // Logique � impl�menter avec le backend
}

// Roulette - parier
async function betRoulette(color) {
  const amount = document.getElementById('bet-amount').value;
  if (!amount || amount < 1) return alert('Montant invalide');
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/game/roulette`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, color })
    });
    
    const data = await res.json();
    
    const content = document.getElementById('game-content');
    content.innerHTML += `
      <div class="result ${data.result === 'win' ? 'win' : 'lose'}">
        R�sultat: ${data.number} (${data.color}) - ${data.result === 'win' ? '🎉 Gagn�!' : '❌ Perdu...'}
      </div>
    `;
    
    loadBalance();
  } catch (err) {
    console.error('Erreur roulette:', err);
  }
}

// Export pour les boutons globaux
window.selectGame = selectGame;
window.backToMenu = backToMenu;
window.placeBet = placeBet;
window.hit = hit;
window.stand = stand;
window.betRoulette = betRoulette;
