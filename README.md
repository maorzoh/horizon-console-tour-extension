# Omnissa Admin Console Tour

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![Browsers](https://img.shields.io/badge/browsers-Chrome%20%7C%20Edge-lightgrey)

**Hover any menu item, tab, setting, button or column in the Omnissa admin consoles and see what it does.**

Omnissa Admin Console Tour is a browser extension for administrators who want to learn an Omnissa console, or who want to understand a setting before they change it. It works on two consoles:

- **Omnissa Horizon** admin console
- **Omnissa Unified Access Gateway (UAG)** admin console, version 26.09 and later

It adds a switch to the console header. When the switch is on, hovering over an element shows a short explanation: what the item is, where it lives and, for settings, the default value.

> **Community project.** This extension is not made, endorsed or supported by Omnissa. "Omnissa", "Horizon" and "Unified Access Gateway" are trademarks of their owners. Always confirm a setting in the documentation for your own version before you change it in production.

---

## Features

- **One switch, always in the same place.** The **Omnissa Admin Console Tour** button sits in the console header. It shows a filled dot when on and an empty ring when off. The toolbar icon does the same.
- **Remembers its state.** After a reload, the extension keeps the last on or off state for that console address.
- **Explains what you see.** On Horizon, explanations cover left-menu items, tabs, page headings, wizard steps, buttons, column headers, dialog titles and settings. On UAG, they cover the dashboard, the counters and quick actions, every left-menu section and their settings, and the windows that open from them.
- **Works on greyed-out controls.** Disabled buttons and fields still show their explanation.
- **Shown only inside the console.** On Horizon the switch appears after you sign in. On UAG it appears on the admin pages after you sign in, and it stays hidden on the login page.
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

1. Download or clone this repository. Keep the `omnissa-admin-console-tour` folder somewhere permanent. Do not move it later, because the browser loads the extension from that location.
2. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the `omnissa-admin-console-tour` folder.
5. Open your console and sign in:
   - Horizon: `https://<your-connection-server>/admin/`
   - UAG: `https://<your-uag-address>:9443/admin/`

   Then look for the **Omnissa Admin Console Tour** button in the header.

To update, replace the folder's contents and click the reload icon on the extension card.

## How to use

1. Sign in to the console.
2. Click **○ Omnissa Admin Console Tour** in the header to turn it on. The dot becomes filled.
3. Hover over anything you want to understand. A tooltip shows its name, where it is, and its description.
4. Click the button again to turn it off.

The toolbar icon does the same as the header button.

## What it covers

| Console | Area | Example |
|---|---|---|
| Horizon | Left menu | Monitor > Dashboard, Inventory > Desktops, Settings > Global Settings |
| Horizon | Tabs | Connection Server > Edit > Authentication, Global Settings > Security Settings |
| Horizon | Wizards | Add Pool, Add Farm, Add Global Entitlement |
| Horizon | Dialogs | Add Entitlements, Associate Application Icon |
| Horizon | Settings | Idle session timeout, Blast Secure Gateway, Login Deceleration Level |
| Horizon | Buttons and columns | Entitlements, Machine Name, Connected User |
| UAG 26.09+ | Home | Health, sessions, CPU, memory, disk and uptime counters, quick actions, Edge Services card |
| UAG 26.09+ | Left menu | Edge Services, Appliance Configuration, Identity & Access, Security, Monitoring, Integrations |
| UAG 26.09+ | Settings | Horizon Settings, Tunnel, Content Gateway, Secure Email Gateway, account, network, high availability, system, TLS, RADIUS, RSA SecurID, SAML, JWT, syslog and SNMP settings |

The explanations are written as plain-language summaries. They do not replace the official documentation.

## Limitations

- **Labels must match.** An explanation appears only when the text on the page matches an entry exactly. If the console labels change in a new version, those explanations stop showing until they are updated.
- **English console only.** The explanations are written for the English user interface.
- **UAG 26.09 and later only.** Older UAG interfaces look different, so the button does not appear on them.
- **Descriptions can lag behind a new version.** UAG descriptions are based on the 26.09 documentation. Check the official documentation for the version you run.
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
5. Open a pull request that says which console and version you tested.

## Disclaimer

This software is provided as is, without warranty of any kind. It is a community tool, not a product of Omnissa. Verify every setting in the official documentation and in a test environment before you change anything in production.
