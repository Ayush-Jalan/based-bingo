# Based Bingo

A Farcaster Mini App featuring the IBWxBasedIndia Bingo game!

## Game Overview

Based Bingo is an interactive game where players complete the word "BASE" by taking photos with BasedIndia team members and posting them on X (Twitter).

### How to Play

1. Take a photo with one of the 8 BasedIndia team members
2. Post the photo on X and tag @INDIA.BASE.ETH
3. Copy the tweet URL
4. Submit the URL in the mini app
5. Select which team member you photographed
6. Watch as a letter in "BASE" gets struck out!
7. Repeat with 3 more different team members to complete the word

### Game Mechanics

- **Any 4 members** can complete BASE (players choose any 4 out of 8)
- Letters are struck in order: B → A → S → E
- Each team member can only be used once
- Each tweet can only be submitted once
- This is a **one-time game** - no resets allowed
- All submissions are stored for admin review

## Setup

### Prerequisites

- Node.js 22.11.0 or higher
- npm, pnpm, or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Add team poster image:
   - Place your team poster image in the `assets/` directory
   - Name it: `team-poster.jpg`
   - Should show all 8 team members
   - See `assets/README.md` for image requirements

3. Update the manifest:
   - Edit `manifest.json` with your actual deployment URL
   - Add your app icon and splash images

### Development

Run the development server:

```bash
npm run dev
```

The app will open at http://localhost:3000

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
based-bingo/
├── assets/          # Team member images
├── index.html       # Main HTML file
├── styles.css       # Styles
├── main.js          # Game logic and Farcaster SDK integration
├── manifest.json    # Farcaster mini app manifest
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies and scripts
```

## Admin Panel

### Accessing the Admin Panel

To view all submissions for review, open the browser console and run:

```javascript
viewSubmissions()
```

The admin panel will show:
- Submission number
- Which letter was struck
- Which team member was photographed
- Tweet URL (clickable link)
- Timestamp of submission

### Setting Up Admin Access

1. Get your Farcaster FID
2. Open [main.js](based-bingo/main.js:13)
3. Update the `ADMIN_FID` constant with your FID:

```javascript
const ADMIN_FID = 12345; // Replace with your FID
```

Once set, only you will be able to access the admin panel.

### Reviewing Submissions

1. After the game is complete, run `viewSubmissions()` in console
2. Review each tweet to verify:
   - Photo contains the correct team member
   - Tweet includes the required tag @INDIA.BASE.ETH
   - Photo is genuine
3. All submission data is stored in localStorage

## Customization

### Styling

All styles are in `styles.css`. Key CSS variables:

```css
--primary-blue: #0052FF;
--secondary-blue: #0046E0;
--success-green: #00D395;
--strike-color: #FF3B30;
```


## Deployment

1. Build the app: `npm run build`
2. Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)
3. Update `manifest.json` with your production URL
4. Submit your mini app to Farcaster

## Technologies

- HTML5, CSS3, JavaScript (ES6+)
- Farcaster MiniApp SDK
- Vite (build tool)
- LocalStorage (game state persistence)

## License

MIT
