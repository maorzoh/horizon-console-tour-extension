# Horizon Console Tour Guide

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![Browsers](https://img.shields.io/badge/browsers-Chrome%20%7C%20Edge-lightgrey)

**Hover any menu item, tab, setting, button or column in the Omnissa Horizon admin console and see what it does.**

Horizon Console Tour Guide is a browser extension for administrators who want to learn the console, or who want to understand a setting before they change it. It adds a switch to the console header. When the switch is on, hovering over an element shows a short explanation: what the item is, where it lives, and, for settings, the default value.

> **Community project.** This extension is not made, endorsed or supported by Omnissa. "Omnissa" and "Horizon" are trademarks of their owners. Always confirm a setting in the documentation for your own version before you change it in production.

---

## Features

- **One switch, always in the same place.** The **Horizon Console Tour** button sits in the console header. It shows a filled dot when on and an empty ring when off. The toolbar icon does the same.
- **Remembers its state.** After a reload, the extension keeps the last on or off state for that console address.
- **Explains what you see.** Explanations cover left-menu items, tabs, page headings, wizard steps, buttons, column headers, dialog titles and settings.
- **Works on greyed-out controls.** Disabled buttons and fields still show their explanation.
- **Hidden on the login page.** The switch appears only after you sign in to the console.
- **Private by design.** No network requests, no analytics, no data sent anywhere.

## Screenshots

---

![Screenshot 1](https://github.com/user-attachments/assets/79a63db8-8532-4c9c-bf06-2922c24361b0)

---

![Screenshot 2](https://github.com/user-attachments/assets/2d772de9-dfa8-44bf-bb97-39ea0a80c53b)

---

![Screenshot 3](https://github.com/user-attachments/assets/f1953132-3593-4083-b5f9-5d57f009beda)

---

![Screenshot 4](https://github.com/user-attachments/assets/54e8b1ec-af55-489d-b6bb-85f52fc7c66e)

---
![Screenshot 5](https://github.com/user-attachments/assets/dc12f10b-f7fa-4926-8d45-e0717c10eaf4)

---



## Install

The extension is not on the Chrome Web Store or Edge Add-ons yet, so install it in developer mode.

1. Download or clone this repository. Keep the `horizon-console-tour-guide` folder somewhere permanent. Do not move it later, because the browser loads the extension from that location.
2. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the `horizon-console-tour-guide` folder.
5. Open the Horizon admin console (`https://<your-connection-server>/admin/`), sign in, and look for the **Horizon Console Tour** button in the header.

To update, replace the folder's contents and click the reload icon on the extension card.

## How to use

1. Sign in to the console.
2. Click **○ Horizon Console Tour** in the header to turn it on. The dot becomes filled.
3. Hover over anything you want to understand. A tooltip shows its name, where it is, and its description.
4. Click the button again to turn it off.

The toolbar icon does the same as the header button.

## What it covers

| Area | Example |
|---|---|
| Left menu | Monitor > Dashboard, Inventory > Desktops, Settings > Global Settings |
| Tabs | Connection Server > Edit > Authentication, Global Settings > Security Settings |
| Wizards | Add Pool, Add Farm, Add Global Entitlement |
| Dialogs | Add Entitlements, Associate Application Icon |
| Settings | Idle session timeout, Blast Secure Gateway, Login Deceleration Level |
| Buttons and columns | Entitlements, Machine Name, Connected User |

The explanations are written as plain-language summaries. They do not replace the official documentation.

## Limitations

- **Labels must match.** An explanation appears only when the text on the page matches an entry exactly. If the console labels change in a new version, those explanations stop showing until they are updated.
- **English console only.** The explanations are written for the English user interface.
- **Descriptions can lag behind a new version.** Check the official documentation for the version you run.
- **Not every label is covered yet.** Anything without an explanation shows no tooltip. Contributions are welcome.
- **Chromium only.** Built for Chrome and Edge (Chromium-based browsers).

## Privacy and permissions

- The extension runs only on pages under `https://*/admin/*`.
- It makes no network requests and sends no data.
- The only thing it stores is the on or off state, in the browser's local storage for the console address.
- It requests no extra browser permissions.

## Contributing

Explanations live in a single file, so contributions are simple.

1. Fork this repository.
2. Edit `tour-data.js`, or the explanation entries it contains. Each entry is keyed by the exact text shown in the console, with a `desc` field.
3. Keep descriptions short, plain and accurate. Describe what the item does for the user, and avoid version numbers, links and copied documentation text.
4. Test the change by loading the folder unpacked and hovering the item in the console.
5. Open a pull request that says which console version and page you tested.

## Disclaimer

This software is provided as is, without warranty of any kind. It is a community tool, not a product of Omnissa. Verify every setting in the official documentation and in a test environment before you change anything in production.
