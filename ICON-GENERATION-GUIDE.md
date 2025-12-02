# Icon & Splash Image Generation Guide

## Quick Start: Use the HTML Generator

1. Open `icon-generator.html` in your browser
2. Right-click each canvas and "Save Image As..."
3. Save as `icon.png` (512x512) and `splash.png` (1200x630)
4. Place in project root
5. Run `npm run build` and push to GitHub

## Professional Option: Gemini Image Generation

If you want more polished, professional icons with the BasedIndia branding, use these prompts with Google Gemini (or other AI image generators):

### App Icon Prompt (512x512)

```
Create a modern, minimalist app icon for "BASED BINGO" - a fun bingo game for BasedIndia.

Design requirements:
- Square format, 512x512 pixels
- Background: Deep blue gradient (#0052FF to #0046E0)
- Main element: Large white text "BASE" in bold, futuristic font
- Secondary element: Smaller text "BINGO" below
- Style: Clean, modern, professional tech startup aesthetic
- Add subtle geometric patterns or a grid pattern in the background
- Ensure text is highly legible and stands out
- Include a subtle drop shadow on text for depth
- Overall feel: Energetic, playful, Web3/crypto-friendly

The icon should be eye-catching, recognizable at small sizes, and represent a fun social game while maintaining a professional appearance suitable for the Base blockchain ecosystem.
```

### Splash Screen Prompt (1200x630)

```
Create a splash screen image for "BASED BINGO" mobile app launch screen.

Design requirements:
- Dimensions: 1200x630 pixels (landscape orientation)
- Background: Vibrant blue gradient (#0052FF to #0046E0)
- Main text: "BASE" in very large, bold white letters, centered
- Subtitle: "BINGO" in smaller white text below
- Style: Modern, energetic, tech-forward design
- Add dynamic elements like subtle geometric shapes, light beams, or abstract patterns
- Could include small bingo-related elements (cards, numbers) subtly integrated
- Text should have soft glow or shadow effects for depth
- Overall aesthetic: Exciting, welcoming, crypto-native

This is the first thing users see when opening the app, so it should be visually striking, professional, and convey the fun nature of the bingo game while fitting the Base blockchain brand identity.
```

### Alternative Simplified Prompts

If the above are too detailed, use these shorter versions:

**Icon:**
```
Create a 512x512 app icon with blue gradient background (#0052FF to #0046E0), large white "BASE" text and "BINGO" subtitle. Modern, minimalist style.
```

**Splash:**
```
Create a 1200x630 splash screen with blue gradient background (#0052FF to #0046E0), large centered "BASE" text with "BINGO" subtitle. Modern, energetic design.
```

## Using Generated Images

1. Download the generated images from Gemini
2. Ensure they're PNG format
3. Resize if needed to exact dimensions:
   - Icon: 512x512px
   - Splash: 1200x630px
4. Name them `icon.png` and `splash.png`
5. Place in project root directory
6. Commit and push to GitHub
7. Vercel will auto-deploy

## Image Optimization Tools

If you need to resize or optimize:
- [Squoosh](https://squoosh.app/) - Google's image optimizer
- [TinyPNG](https://tinypng.com/) - PNG compression
- macOS Preview - Built-in resize tool

## Verification

After deploying, verify the images work:
- Icon: https://based-bingo-lyart.vercel.app/icon.png
- Splash: https://based-bingo-lyart.vercel.app/splash.png

Both should return your images without 404 errors.
