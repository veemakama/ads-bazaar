# AdsBazaar

**Multi-currency influencer marketing, built on Stellar.**

A decentralized marketplace where businesses create ad campaigns funded in their local currency, and influencers anywhere in the world get paid directly in theirs — no USD conversion, no middlemen eating 20% of every transaction.

Nigerian businesses pay in Naira. Kenyan creators earn in Shillings. Europeans transact in Euros. Stellar handles the rest.



---

## The Problem

Influencer marketing is broken in most of the world. The platforms that exist were built for USD-first markets, and everyone else pays the price — literally.

A Nigerian brand running a ₦100,000 campaign has to convert to USD to use most platforms, pay 15–30% in platform fees, then their creator converts USD back to Naira. By the time the money moves, a third of it is gone to fees and exchange spreads.

Beyond the currency problem: 67% of influencers globally report late or missing payments. The current model relies on platform operators acting honestly, with no on-chain enforcement. If a business decides not to pay, the influencer has almost no recourse.

AdsBazaar fixes both of these. Payments are held in smart contract escrow and released automatically when campaign conditions are met. The entire campaign lifecycle — funding, selection, content submission, payment — runs on-chain, in local currencies.

---

## How It Works

### For Businesses

1. **Fund in local currency** — Connect wallet, deposit via bank transfer (Nigeria), M-Pesa (Kenya), or SEPA (Europe). Funds arrive as anchored stablecoins on Stellar.
2. **Create a campaign** — Set your budget, requirements, deadline, and max number of influencers. Funds move into escrow automatically.
3. **Review applications** — Select influencers during the application window. Their wallets, verification status, and social profiles are visible on-chain.
4. **Approve content** — Influencers submit proof links. Approve them to release payment, or let auto-approval kick in after the deadline.

### For Influencers

1. **Connect and verify** — Link your wallet, complete identity verification, connect your Farcaster profile for social proof.
2. **Browse campaigns** — See campaigns in any currency with live Stellar DEX conversion rates.
3. **Apply and create** — Get selected, post content on Farcaster or your platform, submit the proof link.
4. **Get paid** — Claim your payment in the campaign's currency. Cash out via your local anchor (M-Pesa, bank transfer, card).

### Fee Structure

AdsBazaar charges 0.5%. The industry standard is 15–30%. The difference stays with creators.

---

## Why Stellar

Stellar is not the obvious choice for a dApp in 2026 — and that's intentional. Most chains treat multi-currency support as an afterthought, bolted on via token bridges or wrapped assets. Stellar was designed from day one as a multi-asset settlement network. That design decision matters for what we're building.

**Native multi-asset support.** On Stellar, USDC, EURC, and anchored local currency tokens are first-class assets — not ERC-20 tokens with their own contract and trust assumptions. An account holding cNGN and cKES looks the same to the network as one holding XLM. This simplifies the escrow contract significantly.

**Stellar DEX.** On-chain currency conversion without external oracle dependencies. When an influencer wants to see a Nigerian campaign's value in Kenyan Shillings, we query the SDEX for a live rate. When they want to convert, it settles in seconds at ~$0.00001.

**SEP-24 standardized fiat on-ramps.** The Stellar Ecosystem Proposal 24 protocol defines how wallets and anchors handle fiat deposit and withdrawal flows. MoneyGram Access, Flutterwave, and African anchor operators implement the same interface. We write the integration once; users get their local payment method.

**Soroban smart contracts.** Rust-based, auditable, and deterministic. The escrow logic — locking funds, assigning influencers, releasing payment, handling disputes — lives entirely in Soroban contracts. No upgradeable proxies, no admin keys.

**Transaction costs.** At ~$0.00001 per operation, Stellar makes micro-transactions viable. A campaign paying 10 influencers $5 each doesn't lose 20% to gas.

**African ecosystem.** Stellar has more production fiat integrations in Nigeria and Kenya than any other chain. The infrastructure we need — M-Pesa anchors, NGN rails, KES off-ramps — already exists and is used at scale.

---

## Architecture

```
ads-bazaar/
├── apps/
│   ├── frontend/        # Next.js 15 — campaign UI, wallet connection, Stellar SDK
│   └── backend/         # Express — indexing, notifications, SEP-24 relay
└── packages/
    └── contracts/       # Soroban smart contracts (Rust)
```

### Smart Contract Design

The core escrow contract handles:

- Campaign creation and fund lockup
- Influencer application and selection
- Content submission tracking
- Payment release (manual approval or auto-approval after deadline)
- Dispute flagging and community resolution

Each campaign escrows funds in the specific Stellar asset the business chose. Payouts are in the same asset. No swaps happen inside the contract — that's the business's responsibility when funding.

```rust
// Campaign state lifecycle
pub enum CampaignStatus {
    Open,        // accepting applications
    Active,      // influencers selected, content period
    Completed,   // payments claimable
    Disputed,    // flagged for review
}
```

### Supported Assets

| Asset | Region | Anchor / On-Ramp |
|-------|--------|-----------------|
| USDC | Global | Circle |
| EURC | Europe | Circle / SEPA anchors |
| NGNS | Nigeria | Stellar NGN anchor / bank transfer |
| KESH | Kenya | M-Pesa anchor (Kotani Pay) |
| BRLT | Brazil | Brazilian Stellar anchors |
| XOFT | West Africa | BCEAO-region anchors |

### Fiat Flow

```
User (local currency)
    → SEP-24 anchor deposit
    → Stellar-anchored stablecoin in wallet
    → Campaign escrow (Soroban contract)
    → Influencer wallet
    → SEP-24 anchor withdrawal
    → User (local currency)
```

The backend handles SEP-24 session initiation and anchor callbacks. The frontend gives users a clean flow regardless of which anchor they're going through.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Soroban (Rust), Stellar SDK |
| Frontend | Next.js 15, TypeScript, Stellar Wallet Kit |
| Backend | Node.js, Express, TypeScript |
| Currency exchange | Stellar DEX (SDEX) |
| Fiat on-ramps | SEP-24, MoneyGram Access, Kotani Pay |
| Identity | Self Protocol (ZK verification), Farcaster |
| Monorepo | pnpm workspaces |

---

## Getting Started

**Prerequisites**: Node.js 18+, pnpm, Rust toolchain, Stellar CLI

```bash
git clone https://github.com/JamesVictor-O/ads-Bazaar.git
cd ads-Bazaar

# Install all workspace dependencies
pnpm install

# Copy environment files
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env

# Run frontend and backend in parallel
pnpm dev

# Smart contract commands
pnpm contracts:build
pnpm contracts:test
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:4000`.

To interact with contracts locally, start a Stellar localnet or point to Testnet in your `.env`.

---

## Contributing

We welcome contributions. Before opening a pull request, please read this section.

### Branching

- `main` — production-ready code only
- `dev` — integration branch, PRs go here
- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`

### Workflow

1. Fork the repo and create your branch from `dev`.
2. If you're adding a new contract function, write a test in `packages/contracts/test/` first.
3. For frontend or backend changes, make sure `pnpm lint` passes before pushing.
4. Open a PR against `dev` with a clear description of what changed and why.
5. Link any related issues in the PR description.

### Commit Style

Use conventional commits:

```
feat: add multi-asset campaign creation
fix: correct escrow release timing on auto-approval
chore: update Stellar SDK to v12
```

### Running Tests

```bash
# Smart contract tests
pnpm contracts:test

# Type checking
pnpm --filter "@ads-bazaar/frontend" tsc --noEmit
pnpm --filter "@ads-bazaar/backend" tsc --noEmit
```

### What We Need Help With

- Additional SEP-24 anchor integrations (MTN Mobile Money, Orange Money)
- Soroban contract auditing
- Frontend localization (Yoruba, Swahili, Hausa)
- Dispute resolution mechanism design

Open an issue before starting on large features so we can align on direction.

---

## Status

This project is under active development and was submitted to the Stellar Drip Wave hackathon. The current contracts on Celo mainnet are legacy — the Stellar migration is in progress. Testnet deployments will be linked here as they're ready.

---

## Team

- Twitter: [@AdsBazaar5](https://twitter.com/AdsBazaar5)
- GitHub: [JamesVictor-O](https://github.com/JamesVictor-O)
