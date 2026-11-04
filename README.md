# software-analisi-finanziare

Piattaforma web completa e unificata in **React 19 + TypeScript + Vite + Tailwind CSS + Node/Express**, che integra l'analisi quantitativa dei derivati (Covered Warrant e Turbo) e la dashboard macroeconomica cross-asset.

Il progetto unisce gli strumenti di analisi e trading quantitativo:
1. **Financial Analyzer**: motore quantitativo per Covered Warrant e strategie asimmetriche:
   - **Analisi ISIN**: riconoscimento automatico dell'emittente (BNP Paribas, UniCredit OneMarkets, Vontobel, Société Générale), calcolo delle greche e break-even a scadenza.
   - **Cerca CW**: cataloghi aggregati su indici, materie prime e azioni, con simulatore inverso **TARGET** basato su Black-Scholes.
   - **Turbo Long + CW Put Infraweek** (`feature/turbo-long-cw-put-infraweek`): modulo di arbitraggio asimmetrico e delta-hedging infrasettimanale, con simulatore di payoff combinato (1–5 giorni), calcolo dei Break-Even superiore e inferiore, e matrice degli scenari (−10% / +10%).
2. **Market Analyzer**: dashboard cross-asset in 9 moduli:
   - **01 Oggi**: lettura della seduta, regime di mercato probabile con confidenza, scenari prossima seduta, sentiment multifattore Fear & Greed a 7 componenti, griglia asset con sparkline e z-score.
   - **02 Weekly Macro**: osservazioni macroeconomiche, temi catalizzatori, settori leader e laggard.
   - **03 Index Bias**: bias tecnico (bullish/neutral/bearish), RSI, struttura delle medie e supporti/resistenze sui 6 benchmark azionari globali.
   - **04 Macrosettori S&P 500**: monitoraggio e rotazione degli 11 settori SPDR (XLK, XLC, XLF, XLI, XLY, XLV, XLP, XLE, XLB, XLU, XLRE).
   - **05 Utili societari**: calendario trimestrali con stime EPS, consensus ricavi, market cap e sorprese.
   - **06 Bond & tassi**: rendimenti governativi 2Y, 10Y, 30Y (USA, UK, Germania, Italia, Francia, Giappone) e indici corporate USA (AAA, BBB, High Yield).
   - **07 Fed Rate Monitor**: probabilità e aspettative sui tassi del FOMC con importatore per file CSV ufficiali di CME FedWatch.
   - **08 Yield curve**: curve dei rendimenti Treasury USA interattive (da 1 mese a 30 anni), confronto temporale e tracking della disinversione dello spread 10Y–2Y.
   - **09 RSI componenti**: screener costituenti per S&P 500, Nasdaq 100, Dow 30 ed Euro Stoxx 50 con soglie di ipervenduto/ipercomprato, filtri ed esportazione CSV.

---

## Architettura e Tecnologie

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Motore Quantitativo**:
  - Calcolo del valore intrinseco e temporale:
    $$\text{Payoff Call} = \frac{\max(0, \text{Spot} - \text{Strike})}{\text{Ratio}}$$
    $$\text{Payoff Put} = \frac{\max(0, \text{Strike} - \text{Spot})}{\text{Ratio}}$$
  - Break-even personale a scadenza.
  - Leva effettiva ed elasticità stimata dal delta.
  - Modello Black-Scholes analitico per opzioni plain vanilla con risolutore di volatilità implicita tramite bisezione.
  - Simulatore TARGET inverso con proiezione temporale, vincolo di drawdown massimo e ranking delle coperture Put.
- **Riconoscimento Emittente**:
  - `NLBNP...` $\rightarrow$ BNP Paribas
  - `DE000U...` $\rightarrow$ UniCredit OneMarkets (gestione normalizzata del ratio/divisore inverso $1/\text{factor}$)
  - `DE000V...` / `DE000B...` $\rightarrow$ Vontobel
  - `DE000F...` / `DE000S...` $\rightarrow$ Société Générale

---

## Avvio in Sviluppo

```bash
npm install
npm run dev
```

L'applicazione sarà accessibile su `http://localhost:3000`.

Per compilare la versione di produzione:
```bash
npm run build
```

---

> **Avvertenza**: I dati e le analisi hanno scopo di studio quantitativo. Il software non costituisce consulenza finanziaria o sollecitazione al pubblico risparmio.
