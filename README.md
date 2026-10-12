# Habit Buddy

Track daily habits, build streaks, and watch your consistency add up on a full-year activity calendar.

Habit Buddy is a simple, focused habit tracker. You create the habits you want to build (or break the excuse for not doing), check them off each day, and the app keeps score for you — current streak, best streak, total days completed, and a heatmap-style calendar showing exactly which days you showed up. It's built for quick daily check-ins, not complicated planning.

## Features

- **Unlimited habits** — add as many habits as you want to track.
- **Custom icon and color per habit** — pick from 16 icons (target, lightning bolt, heart, book, cutlery, house, sun, moon, music note, briefcase, compass, and more) and 6 accent colors (indigo, blue, green, rose, amber, purple) so each habit is instantly recognizable at a glance.
- **One-click daily check-in** — mark a habit done for today directly from the sidebar list or from the big toggle button on the habit's detail page.
- **Automatic streak tracking** — the app calculates your current streak (consecutive days up to today or yesterday) and your all-time best streak for every habit.
- **Lifetime stats** — each habit's detail page shows four stat cards: Current Streak, Best Streak, Total Days (all-time completions), and Last 30 Days (your completion rate as a percentage).
- **Full-year activity calendar** — a 12-month heatmap-style calendar shows every day of the current year, with completed days highlighted in your habit's color. Today's cell is outlined, and future dates are dimmed so you can't accidentally mark ahead.
- **Search your habits** — a search box at the top of the sidebar instantly filters your habit list by name.
- **Celebratory confetti** — marking a habit done triggers a burst of colorful confetti as a small reward.
- **Export and import your data** — back up all your habits (including full history) to a JSON file, or load one back in.
- **Sample data** — new users can load a set of example habits to see the app in action before entering their own.
- **Light and dark themes plus accent colors** — switch the whole app's look via the Settings panel.
- **Fully responsive layout** — the sidebar and detail view stack vertically on narrow/mobile screens.

## How to Use

### Adding a habit

1. Click **Add Habit** at the top of the sidebar (or the **Add Habit** button in the empty state if you have no habits yet).
2. Type a name for the habit (e.g. "Drink water", "Read 10 pages").
3. Pick an icon from the icon grid to represent it.
4. Pick an accent color.
5. Click **Add Habit** to save it. The new habit becomes the selected habit and appears in your sidebar list.

### Checking in each day

There are two ways to mark a habit as done for today:

- Click the checkbox next to the habit's name in the sidebar list.
- Open the habit and click the large **Mark today done** button below its title. Once done, it switches to a green **Done today** state — click it again to undo if you checked in by mistake.

Marking a habit done triggers a confetti celebration across the screen.

### Viewing a habit's progress

Select any habit in the sidebar to open its detail view, which shows:

- The habit's icon, name, and the date you started tracking it ("Tracking since ...").
- The today toggle button described above.
- Four stat cards: **Current Streak**, **Best Streak**, **Total Days**, and **Last 30 Days** completion rate.
- An **Activity** section with a full calendar for the current year, broken into 12 month grids. Each day you completed the habit is filled in with your chosen color; today is outlined; future days are dimmed. Hover over any day to see its full date (and whether it was completed).

### Editing or deleting a habit

- Click the pencil (edit) icon in the habit's detail header to rename it or change its icon/color.
- Click the trash icon in the detail header, or the trash icon that appears when you hover over a habit in the sidebar, to delete it. You'll be asked to confirm — deleting a habit removes all of its tracked history permanently, so make sure you really want to before confirming.

### Searching

Type into the **Search habits** box at the top of the sidebar to instantly filter the list down to habits matching what you typed. Clear the box to see everything again.

## Customization

Click the gear icon in the top-right corner to open **Settings**, where you can:

- Switch between **Light** and **Dark** theme.
- Choose an **accent color** for the app's interface (separate from each habit's individual icon color).

Settings are remembered automatically, so your chosen theme and accent stay applied the next time you open the app.

## Data & Backups

Everything you enter — habits, icons, colors, and your entire completion history — is saved automatically in your browser on your own device. Nothing is uploaded anywhere or sent to a server, and there's no account or sign-in required.

Because your data lives only in that browser, it's a good idea to export a backup occasionally, especially before clearing your browser data or switching devices:

- **Export**: click the download icon next to Add Habit to save all your habits and their full history as a `habitbuddy-export.json` file.
- **Import**: click the upload icon and choose a previously exported JSON file to load it back in. If you already have habits saved, you'll be asked whether to **Append** the imported habits to your existing list or **Cleanup & Replace** everything with the imported file.

## Tips & Shortcuts

- If you have no habits yet, the empty state offers a link to load a small set of **sample habits** — a quick way to explore streaks, stats, and the calendar before committing your own data. (This sample-loading link only works when the app is served from a web server rather than opened directly as a local file; if it doesn't work for you, use the Import button instead with the sample file.)
- Streaks count backwards from today: if you haven't checked in yet today, your streak is still shown based on yesterday, so you don't lose your streak just for not having checked in yet this morning.
- The color you pick for a habit shows up everywhere related to it — its icon background in the sidebar, its stat cards, and the filled squares in its activity calendar — making it easy to visually tell habits apart at a glance.
- Hovering over any day in the activity calendar shows the exact date, which is handy for checking your progress on a specific day without counting cells.
- Deleting a habit is permanent and cannot be undone, so export a backup first if you might want that history later.
