# Christmas Theme Toggle - Documentation

## Overview
The Christmas theme can be easily enabled or disabled via a configuration file.

## How to Toggle

### Location
`src/config/theme.js`

### Usage
```javascript
export const themeConfig = {
  enableChristmasTheme: true,  // Set to false to disable
};
```

## What the Toggle Controls

When `enableChristmasTheme: true`:
- ❄️ Snowfall animation (10 falling snowflakes)
- 🎅 Santa hat emoji after "Night" in title
- ❄️ Snowflake icon on "Suggest a Movie" button
- 🎄🎁 "Happy Holidays!" message in footer
- 🎨 Christmas hover glows (red/green) on movie cards

When `enableChristmasTheme: false`:
- No snowfall
- No Santa hat in title
- "+" icon on suggest button (default)
- No holiday message in footer
- Default hover effects only

## Quick Toggle Steps
1. Open `src/config/theme.js`
2. Change `enableChristmasTheme` to `true` or `false`
3. Save the file
4. The dev server will hot-reload automatically

## Seasonal Workflow
- **December**: Set to `true`
- **After Holidays**: Set to `false`
- No code changes needed, just flip the config!
