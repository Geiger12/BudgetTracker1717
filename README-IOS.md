# Budget Tracker: iOS wrapper (Capacitor) — DRAFT

Status: the reminder date logic, the Face ID lock logic (with a simulated plugin) and the sync script are tested here. Nothing has been run in Xcode or on an iPhone.

## What this adds on top of the web app
- **Bill reminders** (local notifications at 9:00 the day before and on the due day). Menu > "Turn on bill reminders". Skips the example budget, paid bills, income and everyday spending. Dollar amounts stay off the lock screen (SHOW_AMOUNT in www/native.js).
- **Face ID lock** (menu > "Turn on Face ID lock"). The app asks for Face ID on opening and when you return after 15 seconds away, hides your budgets in the app switcher, and falls back to the phone passcode if Face ID fails. Turning it on or off needs a successful Face ID first.
- **Second copy of your budgets** in native storage, restored if iOS ever clears the web storage.
- **Light haptic tap** when a bill switch is flipped.
- **Share links** point at the web address, because inside the app the page address is not shareable.

## Steps (on a Mac with Xcode)
1. Put the web app files in `app/`: index.html, manifest.webmanifest, the icons. (sw.js is not needed.)
2. In this folder run:
   `npm install`
   `npm install @capacitor/core @capacitor/ios @capacitor/local-notifications @capacitor/preferences @capacitor/haptics @capacitor/app @aparajita/capacitor-biometric-auth`
   `npm install -D @capacitor/cli`
3. Edit `appId` in capacitor.config.json to a reverse-domain you own (it is a placeholder now).
4. `npm test` (should pass), then `npx cap add ios` (first time only), then `npm run ios`. That last command also adds the Face ID permission text to the iPhone project.
5. In Xcode: pick your Team under Signing, set the bundle id, add the 1024 icon in Assets, set the minimum iOS version.

## Check on a real iPhone before TestFlight
- Menu shows "Turn on bill reminders"; tapping asks for permission; a bill due tomorrow gets a note at 9:00.
- Marking a bill paid removes its reminder. Turning reminders off cancels them.
- Add a budget, delete the app's web data (or reinstall over it), reopen: budgets come back.
- Switch tap gives a small tap; notches and the home bar do not cover the tab bar.
- Turn on the Face ID lock, press the side button, reopen after 20 seconds: it asks for Face ID. Fail it on purpose: the Unlock button and passcode fallback appear. The app switcher shows a plain cyan screen, not your budgets.
- Share a budget: the link opens the web version in Safari, which keeps its own data. Import from a copied link works inside the app.
- If the menu item or taps do nothing, `window.Capacitor.Plugins` may not expose the plugins on your version; tell me and I will switch to a small bundled import.

## Still to do for review (suggested next)
- A Home Screen widget ("what's left"). It needs a Swift extension in Xcode and strengthens the case against rule 4.2.
- App Store Connect: privacy answers (the app collects nothing; recheck if sync is added), privacy policy URL, support URL, screenshots, age rating.
- Review notes, draft: "Budget Tracker is an offline budgeting app. It includes local bill reminders, haptics and on-device backup. To test: open Menu, tap Turn on bill reminders, then add a bill due tomorrow."
