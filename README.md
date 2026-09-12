# Discord Casino Activity 🎰

Activity Discord pour jouer au Blackjack et à la Roulette en vocal avec économie partag�e.

## Architecture

- **Frontend** : Activity Discord héberg�e sur Vercel
- **Backend** : API sur Raspberry Pi
- **É¬conomie** : Base de données partag�e avec ton bot casino

## Installation

### Frontend (Vercel)

```bash
cd frontend
npm install
npm run dev
```

### Backend (Raspberry Pi)

```bash
cd backend
npm install
npm start
```

## Configuration Discord

1. Cr�e une app sur https://discord.com/developers/applications
2. Active "Activities" dans le menu
3. Ajoute l'URL de ton frontend Vercel dans les Activity URLs
4. Invite le bot sur ton serveur

## Utilisation

1. Rejoins un salon vocal
2. Clique sur "Commencer une activit�"
3. S�lectionne "Casino Activity"
4. Joue au Blackjack ou à la Roulette avec tes amis !

## API Endpoints

- `GET /api/balance/:userId` - R�cup�rer le solde
- `POST /api/bet` - Placer un pari
- `POST /api/game/blackjack` - Jouer au Blackjack
- `POST /api/game/roulette` - Jouer à la Roulette

---

Dé¬§velopp� pour Discord Activities avec économie unifi�e.
