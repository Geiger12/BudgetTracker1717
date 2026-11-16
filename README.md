# Budget Tracker

A simple budget tracker. Switch a bill on when you pay it and the date is filled in for you.
Everything is saved on your own device. Nothing is sent anywhere.

The first time someone opens it, they see an **example budget** with made-up names and amounts, with some bills already ticked off.
They can play with it, open the menu and choose **Edit items** to make it their own, or tap **start with a blank budget**.
If someone already has budgets saved, the example is added to their list once. **Menu → Add an example budget** brings it back if it has been deleted.

## Finding your way around

- **Tab bar (bottom):** four tabs you can reach with your thumb.
  - **Overview:** one fixed screen with no scrolling. The three gauges (Bills, Money in, Spending) sit at the top so they are never cut off, with a short month summary underneath. On a small screen it trims the summary rather than pushing anything off the bottom.
  - **Bills:** your income and bills, with filters: **All, Unpaid, Paid, Overdue**. A **List / Schedule** switch flips between the list and the weekly due-date cards. A red badge on the tab counts overdue bills. This tab scrolls.
  - **Spending:** what you have spent against each everyday budget, with filters: **All, Over budget, Within budget**.
  - **Insights:** expected income, planned spending and net for the month, where the money goes, and a six-month chart.
  - The app remembers the tab, view and filters you were using.
- **Top bar:** the menu button (three lines), the open budget's name, and a yellow **Add** button.
- **Menu (slide-out):**
  - **Budgets:** switch budgets, manage them, or open the example.
  - **Tools:** Add item, Edit items, Share this budget, Import a budget.
  - **Backup:** save a budget to a file, or restore one from a file.
  - **Appearance:** Auto (follows the phone), Light or Dark, and **Colors…**.
- **Sheets:** Add item, Share, Import and Manage budgets open as a panel that slides up from the bottom. Close it with the X, by tapping outside it, or with Escape.
- **Messages:** short confirmations such as "Link copied" appear above the tab bar and fade away.
- **Status strip:** budget picker, month, today's date, and a health light. On Overview it is a slim two-row strip. On the other tabs it shrinks to one row. Green means all clear. Amber means a bill is due within 3 days or everyday spending is over budget. Red means a bill is overdue.

## Colors you can change

Open **Menu → Colors…** to restyle the whole app. It works in light and dark mode and is saved on that device.

- **Ready-made sets:** Cyan & Yellow (the default), Ocean, Forest, Sunset, Berry and Graphite.
- **Your own colors:** three pickers.
  - **Header color:** the status strip and light touches.
  - **Button and bar color:** buttons, section bars and progress bars.
  - **Highlight color:** the Add button, the open tab and the chosen filter.
- **Readable by default:** the text color on each of your colors is chosen automatically (white or dark). If a color can't hold readable text, a note says so. In dark mode, very dark colors are lightened automatically so they still show.
- **Reset** returns to Cyan & Yellow.

Green, orange and red keep their meaning (paid, due soon, overdue) whichever colors you pick.

## Put it online with GitHub Pages (free)

1. On github.com, create a new repository (for example `budget-tracker`). Make it **Public**.
2. Upload everything in this package: the six files (`index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) and the `about` folder. Drag the folder in too, so it keeps its pictures.
3. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose branch **main** and folder **/ (root)**, then **Save**.
4. After a minute or two the page shows your address, `https://YOUR-USERNAME.github.io/budget-tracker/`.

## The About page

`about/` is a one-page site that explains the app and points people to it. It lives at `https://YOUR-USERNAME.github.io/YOUR-REPO/about/`. Share that link when you want to explain the app. Its buttons open the app itself.

It is plain HTML with no scripts, trackers or outside fonts. `about/preview.png` is the card that shows when the link is pasted into a message or post.

**Set your web address (needed once).** The page tells social sites where it lives, using the address `https://geiger12.github.io/BudgetTracker17/about/`. Replace it with your own in four lines near the top of `about/index.html`:

1. On GitHub, open `about/index.html` and click the pencil (Edit).
2. Press Ctrl+H (Cmd+Option+F on a Mac) to find and replace.
3. Find `geiger12.github.io/BudgetTracker17` and replace it with `YOUR-USERNAME.github.io/YOUR-REPO`, then replace all.
4. Commit the change.

Social sites keep the first preview they see, so test before you post: Facebook's Sharing Debugger, LinkedIn's Post Inspector, or paste the link into a draft.

## Install it on an iPhone

1. Open the address in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open it from the new icon.

## Sharing a budget

- **To share:** Menu → **Share this budget**, then **Share setup** (items and amounts only) or **Share with paid history**. Send the link by message, Notes or AirDrop.
- **To receive:** copy the link, open Budget Tracker from the home screen, then Menu → **Import a budget**. It reads the copied link and asks you to confirm.
  If the link isn't picked up automatically, paste it into the box and tap **Import**.

On iPhone, tapping a link opens Safari, which keeps its own storage separate from the home-screen app. So copy the link rather than tapping it.
The data is inside the link and is never sent to GitHub. Anyone who has the link can read the budget, so delete the message afterwards.

## Several budgets

Use the picker in the status strip, or the menu. **Menu → Manage budgets** creates, renames and deletes budgets. Each is separate.

## Notes

- Data lives in the browser on that device and is not encrypted. A different phone or browser starts with the example until you Import.
- Updating the app: re-upload `index.html`. If a change doesn't appear, close and reopen the app.
