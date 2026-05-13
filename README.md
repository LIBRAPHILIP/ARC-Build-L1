# ARC-Build-L1

A static web app prototype for a UAE → global cross-border payments and remittances experience.

## What this app includes

- A modern, polished landing page experience with card-based UI for payment flows and use cases.
- Conceptual UX for remittance, marketplace settlement, global payroll, and merchant settlement.
- A focus on Circle tools and ARC rails: USDC, CCTP with Bridge Kit, Circle Wallets, Circle Gateway, and StableFX concepts.
- Onchain ARC Testnet wallet interaction: connect a Web3 wallet, display Arc Testnet account info, and send a public testnet transaction.
- Uses Arc Testnet network settings and auto-prompts wallet network addition/switch.
- Default fee recipient is the public collector address `0xa84e8ac49f6eea4fec824c8da492875242e1eb09`.
- Clear fee transparency, settlement confirmation, and receipt-ready payment flows.

## Run it locally

Open `index.html` in a browser, or serve it with a simple local server:

```bash
cd /workspaces/ARC-Build-L1
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000`.

## Files

- `index.html` — app shell and prototype content
- `styles.css` — presentation and layout
- `app.js` — interactive case selection and flow details

## Notes

This prototype is built around the ARC MCP concept docs and recommended Circle settlement rails. The app is designed as a UX concept rather than a production integration.
