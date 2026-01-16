# DrawAlarm ✏️⏰

> 🏆 Entry for the **Worst UI Competition** - CSE Fest

## What is DrawAlarm?

DrawAlarm is an intentionally terrible alarm-setting app where you set the time by **drawing lines**! Instead of simply typing or selecting numbers like a normal person, you must:

1. **Draw a line** on a canvas to set the **hour** (line length in cm = hour value)
2. **Draw another line** to set the **minute**
3. **Draw yet another line** to set the **second**

The length of your drawn line (measured in centimeters) determines the time value. Want to set an alarm for 8 hours? Draw an 8cm line. Need 45 minutes? Better have a steady hand for that 45cm line!

## Features

- 🎨 **Canvas-based time input** - Because clicking numbers is too mainstream
- 📏 **Precision required** - Your drawing skills directly impact your alarm accuracy
- ⚠️ **Validation** - Can't draw more than 24cm for hours or 60cm for minutes/seconds
- 🔄 **Erase & retry** - You'll need this... a lot
- ✅ **Confirmation screen** - Marvel at your approximate alarm time

## How to Use

1. Click and hold the left mouse button on the canvas
2. Draw a line - the length becomes your time value
3. Click "SET" to confirm the value
4. Repeat for hour, minute, and second
5. Confirm your alarm and hope it's close to what you wanted!

## Tech Stack

- React + Vite
- Tailwind CSS
- Lucide React (icons)

## Running the App

```bash
npm install
npm run dev
```

## Why?

Because sometimes the worst UX makes for the best laughs! 😄

---

*Made with questionable design decisions for CSE Fest Worst UI Competition*
