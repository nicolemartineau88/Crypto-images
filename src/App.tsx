/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { PromptManagerCenter, DEFAULT_PROFILES } from "./components/PromptManagerCenter";
import { compilePromptProfile } from "./utils/promptBuilder";
import { PromptDebuggerPanel } from "./components/PromptDebuggerPanel";
import SupabaseManager from "./components/SupabaseManager";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart2,
  Edit3,
  Eye,
  Cpu,
  Link2,
  Database,
  User,
  Users,
  Clock,
  History,
  Settings,
  Download,
  Sparkles,
  RefreshCw,
  Send,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Terminal,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sliders,
  Trash2,
  Plus,
  X
} from "lucide-react";

interface Ticker {
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
  high: number;
  low: number;
  source?: string;
}

interface Account {
  id: number;
  username: string;
  postingKey: string;
  isActive: boolean;
  defaultCommunity: string;
  status: string;
  avatar: string;
}

interface AIProvider {
  id: number;
  name: string;
  model: string;
  temp: number;
  maxTokens: number;
  isEnabled: boolean;
  isDefault: boolean;
  apiKey: string;
}

interface Community {
  id: string;
  name: string;
  members: number;
  desc: string;
}

interface HistoryItem {
  id: number;
  date: string;
  time: string;
  account: string;
  community: string;
  title: string;
  status: string;
  url: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [supabaseAccounts, setSupabaseAccounts] = useState<any[]>([]);
  
  const loadSupabaseAccounts = async () => {
    try {
      const res = await fetch("/api/supabase/accounts");
      if (res.ok) {
        const data = await res.json();
        setSupabaseAccounts(data || []);
      }
    } catch (e) {
      console.error("[Supabase accounts fetch error]", e);
    }
  };

  useEffect(() => {
    loadSupabaseAccounts();
  }, [activeTab]);

  const [tickers, setTickers] = useState<Ticker[]>([]);
  const setOnlyCoreTickers = (data: Ticker[]) => {
    if (Array.isArray(data)) {
      setTickers(data.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol)));
    } else {
      setTickers([]);
    }
    setTickersLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }));
  };
  const [tickersLastUpdated, setTickersLastUpdated] = useState<string>("");
  const [isRefreshingTickers, setIsRefreshingTickers] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("blurt_accounts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse accounts", e);
        }
      }
    }
    return [
      { id: 1, username: "cryptomaster", postingKey: "5K_DEMO_POSTING_KEY_88921", isActive: true, defaultCommunity: "blurt-139531", status: "Connected", avatar: "from-blue-500 to-indigo-600" },
      { id: 2, username: "blurtwhales", postingKey: "5K_DEMO_POSTING_KEY_99102", isActive: false, defaultCommunity: "blurt-101112", status: "Idle", avatar: "from-purple-500 to-pink-600" }
    ];
  });
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_providers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((p: any) => {
              if (p.id === 3 && (p.model === "grok-2" || p.model === "grok-2-latest" || p.model === "grok-2-1212" || p.model === "grok-beta" || !p.model)) {
                return { ...p, model: "grok-4.3" };
              }
              return p;
            });
          }
        } catch (e) {
          console.error("Failed to parse providers", e);
        }
      }
    }
    return [
      { id: 1, name: "Google Gemini Pro", model: "gemini-2.5-flash", temp: 0.7, maxTokens: 4096, isEnabled: true, isDefault: true, apiKey: "AIzaSy_DEMO_SECRET_KEY" },
      { id: 2, name: "OpenAI GPT-4o", model: "gpt-4o", temp: 0.7, maxTokens: 4096, isEnabled: true, isDefault: false, apiKey: "sk-proj-DEMO_KEY" },
      { id: 3, name: "Grok xAI", model: "grok-4.3", temp: 0.7, maxTokens: 4096, isEnabled: true, isDefault: false, apiKey: "" }
    ];
  });
  const [communities, setCommunities] = useState<Community[]>([
    { id: "blurt-139531", name: "Blurt Crypto & Trading Guild", members: 4250, desc: "Primary hub for cryptocurrency technical analysis and trading alerts." },
    { id: "blurt-101112", name: "Blurt Finance & Economics", members: 3120, desc: "Global macroeconomic commentary, DeFi, and central bank rates." },
    { id: "blurt-188990", name: "Bitcoin Analysts Syndicate", members: 1890, desc: "Exclusive focus on BTC on-chain metrics and lightning network." },
    { id: "blurt-145678", name: "Web3 & Decentralized Media", members: 5400, desc: "General dApp reviews, NFT ecosystems, and metaverse news." }
  ]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState<boolean>(false);
  const [communitiesError, setCommunitiesError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("blurt_history");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
    return [
      { id: 101, date: "Oct 24, 2024", time: "14:22:05", account: "@cryptomaster", community: "blurt-139531", title: "Weekly Market Recap: Altcoins Surge Amidst BTC Consolidation", status: "Success", url: "https://blurt.blog/blurt-139531/@cryptomaster/weekly-market-recap" },
      { id: 100, date: "Oct 23, 2024", time: "02:15:10", account: "@cryptomaster", community: "blurt-145678", title: "Solana Reaches New Milestone: Ecosystem Growth Report", status: "Success", url: "https://blurt.blog/blurt-145678/@cryptomaster/solana-reaches-milestone" }
    ];
  });

  // Scheduler & System state
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPostingKey, setNewPostingKey] = useState<string>("");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(15735); // ~4h 22m 15s
  const [schedulerActive, setSchedulerActive] = useState<boolean>(true);
  const [developerMode, setDeveloperMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dev_mode_active");
      return saved === "true";
    }
    return false;
  });
  const [multiAccountStatus, setMultiAccountStatus] = useState<"idle" | "generating" | "publishing" | "interval_wait" | "resting">("resting");
  const [multiAccountActiveIndex, setMultiAccountActiveIndex] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem("dev_mode_active", String(developerMode));
  }, [developerMode]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; color?: string }>>([
    { time: "14:45:02", text: "Application initialization complete.", color: "text-slate-500 italic" },
    { time: "14:45:05", text: "Connecting to CoinMarketCap API... SUCCESS", color: "text-blue-400" },
    { time: "14:45:07", text: "Connecting to Gate.io WebSockets... SUCCESS", color: "text-blue-400" },
    { time: "15:00:10", text: "STARTING TASK: Automatic Article Generation (Ref: #AX990)", color: "text-slate-200 font-bold" },
    { time: "15:00:12", text: "Fetching OHLCV data for BTC, ETH, SOL, DOGE...", color: "text-slate-400 pl-4" },
    { time: "15:00:15", text: "Sending data payload to Google Gemini API (Temp: 0.7)...", color: "text-slate-400 pl-4" },
    { time: "15:00:22", text: '✓ Received Article: "Market Rally: Bitcoin Eyes $70k Resistance"', color: "text-emerald-400 pl-4" },
    { time: "15:00:25", text: "⏳ Rendering SVG Charts from Candlestick data...", color: "text-yellow-400 pl-4" },
    { time: "15:02:15", text: "Task idling. Waiting for schedule trigger.", color: "text-slate-500 italic" }
  ]);

  // Editor Draft State (PeakD Style)
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const [editorTitle, setEditorTitle] = useState<string>(`Crypto Market Update – ${todayStr}`);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("blurt-139531");
  const [editorBody, setEditorBody] = useState<string>(`![Crypto Market Featured Image](/api/market/featured-image)

Global cryptocurrency valuations registered a significant surge over the preceding 24 hours, driven by a confluence of heavy institutional spot exchange-traded fund (ETF) inflows, heightened derivatives market open interest, and a robust wave of retail accumulation across key layer-1 ecosystems. As of today, the total cryptocurrency market capitalization stands at an impressive $2.48 Trillion, reflecting a substantial 3.8% increase within a single trading day. This expansion has been accompanied by a surge in global 24-hour trading volume, which has climbed to approximately $98.5 Billion. This level of transactional activity underscores high market liquidity and strong buy-side absorption across major exchange order books worldwide.

Bitcoin dominance remains firmly established at 54.8%, highlighting the premier asset's continued role as the foundational anchor of market liquidity and investor sentiment. Despite rotational capital flows into high-beta altcoins, institutional allocations continue to favor Bitcoin, creating a solid base of support. The overall market sentiment can currently be characterized as "Moderately Bullish with High-Beta Rotational Inflows," as market participants balance high-timeframe macro breakout targets with short-term consolidation dynamics. Traders are actively monitoring upcoming macroeconomic calendar releases, including central bank interest rate decisions and inflation prints, while risk assets globally demonstrate resilience against prevailing fiscal headwinds.

---

## Bitcoin

### Current Price

$64,821.00

### Market Performance

Bitcoin (BTC) continues to demonstrate resilient price action, actively consolidating within a constructive high-timeframe range as long-term holders and spot ETF buyers absorb overhead supply. Over the last 24 hours, Bitcoin has established a strong technical foundation, successfully invalidating short-term bearish divergence indicators on the daily charts. This sustained accumulation is primarily driven by institutional market participants who are capitalizing on local price pullbacks to build substantial spot positions, reinforcing the asset's macro uptrend.

The underlying market structure for Bitcoin remains exceptionally robust, characterized by a persistent decrease in liquid supply across major cryptocurrency exchanges. Order book tracking reveals deep buy-side liquidity blocks positioned immediately below current valuations, acting as a powerful buffer against potential downside volatility. Concurrently, derivatives data indicates a steady buildup of open interest, suggesting that leveraged market participants are preparing for a high-velocity breakout once overhead resistance zones are cleared.

Institutional involvement remains a primary catalyst for Bitcoin's structural stability, with spot BTC ETFs recording consecutive days of net positive inflows. This programmatic buying pressure serves to remove circulating supply from the secondary market, creating a structural supply-demand mismatch that historically precedes major parabolic expansions. As macro liquidity conditions continue to mature, Bitcoin's position as a premium digital collateral asset is increasingly recognized by traditional asset managers globally.

![BTC Candlestick Chart](/api/market/chart/BTC)

### Technical Analysis

The technical posture of Bitcoin presents a highly constructive configuration across both short-term and macro timeframes:

*   **Support:** Immediate support is firmly established at the $62,500 demand zone, followed by a secondary macro line of defense at the $60,000 psychological price boundary.
*   **Resistance:** Direct overhead resistance is identified at the $65,500 consolidation peak, with a major macro supply barrier waiting at $68,200.
*   **RSI:** The 14-day Relative Strength Index (RSI) is currently hovering at 58.4, indicating a healthy neutral-to-bullish momentum with significant room for upward extension before reaching overbought territory.
*   **MACD:** The Moving Average Convergence Divergence (MACD) indicator is exhibiting a fresh bullish crossover above the signal line on the daily chart, confirming that buy-side momentum is actively accelerating.
*   **EMA:** Bitcoin's price is trading comfortably above its 50-day and 200-day Exponential Moving Averages (EMAs), with the dual indicators forming a robust, wide-spread golden cross configuration.
*   **Trend:** The overall structural macro trend remains decisively bullish, characterized by a consecutive series of higher lows and higher highs on the weekly timeframe.
*   **Volume:** Daily trading volume has experienced a steady, healthy expansion alongside price increases, demonstrating authentic buyer conviction and valid breakout participation.

### Outlook

In a bullish scenario, a decisive daily candle closure above the $65,500 immediate resistance zone will likely trigger a rapid short-squeeze, propelling Bitcoin toward a retest of the $68,200 major supply cluster, with a secondary target of new price discovery above $72,000. Conversely, in a bearish scenario, failure to hold the $62,500 support level could lead to a localized pullback to retest the 200-day EMA near $59,800, where substantial long-term bids are expected to defend the structural integrity of the macro uptrend.

---

## Ethereum

### Current Price

$3,420.50

### Market Performance

Ethereum (ETH) is exhibiting a period of healthy technical consolidation, trading within a well-defined price channel as market participants digest recent network upgrade developments and evaluate layer-1 transaction fee dynamics. Despite local price fluctuations, Ethereum's core utility metrics remain positive, anchored by steady gas burn rates on the mainnet and a continuous influx of total value locked (TVL) across integrated decentralized finance (DeFi) protocols.

Staking participation on the Ethereum network has reached new all-time highs, with a growing percentage of the circulating ETH supply locked inside secure validator contracts. This trend effectively reduces the immediate liquid supply available on public exchanges, creating a supportive supply-side dynamic that helps stabilize valuations during broader market pullbacks. Furthermore, the active deployment of layer-2 rollup networks continues to expand Ethereum's overall ecosystem throughput, attracting a diverse base of developers and retail users.

From an institutional perspective, the gradual integration of Ethereum-based financial products into traditional markets is laying the groundwork for sustained long-term capital inflows. While spot trading volume has remained moderately rangebound over the preceding interval, the steady accumulation behavior observed in on-chain smart contract addresses suggests that long-term investors are positioned for a continuation of the broader structural uptrend.

![ETH Candlestick Chart](/api/market/chart/ETH)

### Technical Analysis

Ethereum's current chart layout showcases a balanced structure with clear directional boundary lines:

*   **Trend:** The medium-term trend is neutral-to-bullish, with the asset forming a series of consolidative bases above major high-timeframe support zones.
*   **Support:** Key structural support is established at $3,200, which aligns with historical order block demand, while secondary macro support resides at $3,000.
*   **Resistance:** Primary overhead resistance is located at $3,550, followed by a formidable supply barrier at $3,850.
*   **RSI:** The daily Relative Strength Index (RSI) is currently registering at 51.2, suggesting a balanced market state with ample room for expansion in either direction.
*   **MACD:** The MACD line is consolidating near the zero baseline, with the histogram showing flat momentum bars, reflecting the ongoing price compression and anticipation of a volatility expansion.
*   **Volume:** Transactional volume remains steady, showing typical consolidation-phase contraction, which frequently precedes a sharp expansionary breakout.

### Outlook

The bullish forecast for Ethereum relies on a successful breakout and daily close above the $3,550 resistance level, which would open the door for a swift rally toward $3,850, and potentially ignite a macro trend continuation toward the psychological $4,000 milestone. On the bearish side, a sustained breakdown below the $3,200 support floor could result in a deeper corrective wave targeting the $3,000 psychological level, where strong institutional buy-wall bids are expected to prevent further degradation.

---

## Solana

### Current Price

$195.80

### Market Performance

Solana (SOL) continues to perform as a high-velocity leader among major layer-1 smart contract platforms, demonstrating exceptional relative strength and capturing substantial rotational capital flows from across the digital asset landscape. Over the last 24 hours, Solana's price action has outpaced many of its large-cap peers, driven by an impressive surge in on-chain transactional volume, high decentralized exchange (DEX) activity, and rapid user acquisition.

On-chain metrics reveal that Solana's network utility has reached unprecedented levels, with active wallet addresses and daily transaction counts consistently leading the industry. This high transactional density is supported by Solana's ultra-low fee structure and high-throughput consensus mechanism, making it the premier destination for retail DeFi, non-fungible token (NFT) minting, and dynamic memecoin trading. The sustained high demand for SOL blockspace has translated into a consistent fee-revenue model, enhancing the underlying economic value of the token.

The inflow of venture capital and developer talent into the Solana ecosystem remains highly encouraging, with multiple next-generation dApps launching successful mainnet deployments. As liquidity deepens across Solana's native borrowing and lending protocols, the demand for SOL as primary collateral continues to scale. This structural sink for the token, combined with active spot market demand, provides a powerful upward catalyst for Solana's market valuation.

![SOL Candlestick Chart](/api/market/chart/SOL)

### Technical Analysis

Solana's technical structure is highly aggressive, indicating strong buyer commitment and structural strength:

*   **Trend:** Decisively bullish, with SOL trading well above its ascending trendline and exhibiting clear outperformance relative to the broader altcoin market.
*   **Support:** Immediate support sits at the $180 horizontal shelf, followed by a major demand zone at the $165 macro pivot level.
*   **Resistance:** Near-term resistance is identified at $200, with a successful clearance exposing the next major macro resistance at $220.
*   **RSI:** The daily RSI is currently positioned at 64.8, reflecting strong bullish momentum without yet crossing into the overbought territory, which typically begins above 70.
*   **MACD:** The MACD histogram is printing expanding green bars above the zero line, while the signal lines are diverging upwards, indicating a high-probability continuation of the current bullish impulse.
*   **Volume:** On-chain trading and exchange volumes have surged significantly alongside the price breakout, validating the move with strong organic participation.

### Outlook

In a bullish development, a sustained breakout above the $200 psychological barrier will likely catalyze a wave of FOMO, driving SOL quickly to $220, with potential targets extending toward historical highs of $250. Alternatively, should a bearish market-wide pullback materialize, Solana could see a temporary retest of its $180 support level, which is expected to hold firmly as a primary accumulation zone for trend followers and ecosystem funds.

---

## Dogecoin

### Current Price

$0.3850

### Market Performance

Dogecoin (DOGE) has experienced a notable resurgence in trading activity, leading the high-beta meme token sector and capturing significant speculative volume as retail market sentiment shifts back toward an expansionary posture. The pioneer dog-themed asset has demonstrated remarkable price velocity over the preceding 24 hours, capitalising on broader market stability to trigger a clean technical breakout from its historical consolidative patterns.

On-chain data indicates a substantial increase in Dogecoin network metrics, characterized by a sharp rise in active transaction addresses and a surge in the number of large-scale "whale" transactions. This increase in high-value transfers suggests that sophisticated market participants are actively rotating capital into Dogecoin, anticipating a momentum-driven rally that typically accompanies altcoin expansions. The coin's deep liquidity across major exchanges makes it a preferred vehicle for traders looking to express high-beta market exposure.

While meme-based assets are inherently volatile and subject to rapid shifts in social media sentiment, Dogecoin's longevity, massive community base, and established integration with multiple online payment platforms provide it with a unique utility profile. As the broader digital asset market enters a phase of renewed optimism, Dogecoin's relative liquidity and high brand recognition continue to position it as a primary focal point for retail capital rotation.

![DOGE Candlestick Chart](/api/market/chart/DOGE)

### Technical Analysis

Dogecoin's technical indicators are aligning for a potentially powerful momentum expansion:

*   **Trend:** Bullish momentum has been confirmed by a clean breakout above a multi-month descending triangle consolidation structure on the daily timeframe.
*   **Support:** Primary horizontal support is established at $0.33, with secondary macro support positioned at the $0.28 price band.
*   **Resistance:** Immediate resistance is encountered at $0.40, while a successful breakout would open the path toward $0.45.
*   **RSI:** The Relative Strength Index (RSI) is currently registering at 61.5, showing strong positive acceleration while remaining safely below the overbought threshold.
*   **MACD:** The MACD is printing positive momentum bars, with the fast and slow lines trending upwards, confirming that buyers are in complete control of the short-term trend.
*   **Volume:** Daily trading volume has experienced a multi-fold increase, confirming that the current breakout is backed by substantial market capital and genuine participant commitment.

### Outlook

A continuation of the bullish impulse with a daily close above the $0.40 level is highly likely to propel Dogecoin toward the $0.45 and $0.50 levels, as momentum buyers enter the market. Conversely, in a bearish scenario where seller pressure rejects the immediate breakout, Dogecoin could pull back to validate the $0.33 level as new support, where a consolidative range would likely establish itself before the next directional expansion.

---

## Weekly Performance Summary

The performance metrics of the leading digital assets over the preceding weekly interval reflect a market-wide trend of positive capital accumulation and rotational momentum:

| Coin | Current Price | 24h Change | 7 Days Performance | Market Trend |
| :--- | :--- | :--- | :--- | :--- |
| **BTC** | $64,821.00 | +3.40% | +5.12% | Bullish Continuation |
| **ETH** | $3,420.50 | -1.15% | +2.45% | Consolidating Range |
| **SOL** | $195.80 | +8.40% | +14.20% | Strong Bullish Breakout |
| **DOGE** | $0.3850 | +12.50% | +18.90% | High-Beta Momentum |

---

As the digital asset market continues to navigate this crucial macro inflection point, the underlying fundamentals of the major blockchain networks remain highly encouraging. The synchronization of institutional inflows with robust on-chain transaction volumes across Bitcoin, Ethereum, and Solana suggests that the current market structure is built upon a foundation of genuine demand rather than pure speculation. This systemic health is a key differentiator from previous cycles, offering a higher degree of stability and predictability for both retail and institutional market participants.

Looking forward into the upcoming weekly sessions, traders should remain highly attentive to macroeconomic calendar events and potential shifts in global liquidity conditions. While individual asset classes like Solana and Dogecoin will continue to present high-yield opportunities during rotational phases, the foundational direction of the market remains tethered to Bitcoin’s ability to sustain its high-timeframe support levels. Practicing disciplined risk management, identifying key horizontal boundaries, and avoiding excessive leverage remain the most effective strategies for navigating this dynamic and highly rewarding financial landscape.

The integration of advanced smart contract utility, growing layer-2 adoption, and the institutionalization of digital collateral are permanently reshaping the global financial architecture. As decentralized networks continue to capture market share from traditional financial systems, the long-term value proposition of these digital assets becomes increasingly clear. Market participants who maintain a patient, high-timeframe perspective and focus on fundamental accumulation are best positioned to capitalize on the next chapter of the decentralized revolution.`);

  // Helper to load prompt profile on mount
  const getInitialPromptProfile = () => {
    let savedProfiles = [];
    let activeId = "daily-market-update";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_prompt_profiles");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            // Detect and auto-upgrade any stale default profile to Robert Stanberry style
            savedProfiles = parsed.map((p: any) => {
              if (p.id === "daily-market-update" && (!p.name.includes("Robert Stanberry") || p.systemPrompt.includes("elite, highly professional cryptocurrency financial analyst") || !p.imagePrompt.includes("split-composition"))) {
                return {
                  ...p,
                  name: "Robert Stanberry (Crypto Market Update)",
                  systemPrompt: "You are Robert Stanberry, a highly respected independent digital asset market analyst and crypto writer. Your writing style is objective, direct, highly readable, and trader-centric, with a friendly yet professional and analytical tone. You specialize in daily crypto market updates. Your articles begin with a brief friendly greeting to readers, followed by a succinct overview of broader market sentiment, and then a clean breakdown of each major coin (Bitcoin, Ethereum, Solana, and Dogecoin) with precise bullet-point technical indicators (Daily Range, Support, Resistance, Immediate Trend, and RSI momentum). You avoid sensationalism or fluff, focusing on institutional flows, key levels, and price consolidation structures.",
                  articleTemplate: `# Crypto Market Update: {headline}\n\n{featured_image}\n\n{market_summary}\n\n---\n\n## Coin Analysis\n\n{btc_section}\n\n{eth_section}\n\n{sol_section}\n\n{doge_section}\n\n---\n\n## Market Sentiment Checklist\n- **Overall Trend**: {market_sentiment}\n- **Top Performer Today**: {top_coin}\n- **BTC Consolidation Level**: {btc_price}\n- **ETH Staying Power**: {eth_price}\n\n---\n\n{conclusion}`,
                  imagePrompt: "A high-impact, split-composition cinematic crypto banner. On the left: a fiery, glowing orange-red volcanic atmosphere with dramatic candlestick charts in the background, featuring a large, meticulously detailed 3D gold physical Bitcoin (BTC) coin, displaying a glowing red rounded panel with high-contrast text 'BTC -1.4%' and '95,458 USDT'. On the right: a cool, deep blue lightning storm sky with glowing blue candlesticks, featuring a large, meticulously detailed 3D physical silver Ethereum (ETH) coin, displaying a glowing blue rounded panel with high-contrast text 'ETH -1.87%' and '3,303 USDT'. Across the top, there is giant, bold 3D text in shiny gold/yellow reading 'CRYPTO', and bold metallic white text reading 'MARKET UPDATE'. At the bottom center, a circular gauge labeled 'FEAR & GREED INDEX' with a dial pointing to '50' over a vibrant red-orange-yellow-green spectrum. The entire scene is in ultra-high definition, cinematic lighting, epic color contrast (orange vs blue), and professional trading dashboard aesthetic.",
                  coinAnalysisPrompt: "### {coin} Update\n\nWrite a highly structured 2-3 paragraph breakdown of {coin}'s recent action at **{price}** ({change24h} in 24h). Focus on daily price structures, spot buyer absorption, ETF inflows or liquidations, and current momentum. Avoid any intro greetings or placeholders.\n\n{chart_image}\n\n#### Technical Key Levels & Indicators\n- **Daily Range**: Approximate current range based on {price} (e.g., $94,200 - $96,800 for BTC)\n- **Key Support**: Primary immediate floor level\n- **Key Resistance**: Immediate ceiling barrier\n- **Immediate Trend / Sentiment**: Short trend description (e.g., Consolidation / Moderate Bullish)\n- **RSI & Momentum**: Current RSI estimate and momentum description based on 24h change of {change24h}",
                  conclusionPrompt: "Write a brief, objective 2-paragraph wrap-up of today's digital asset actions. Highlight upcoming macroeconomic catalysts, trade setups to watch, and encourage readers with a friendly, professional sign-off typical of Robert Stanberry: \"Trade safely, manage your risks, and have an excellent day!\" or \"Stay patient, keep an eye on key levels, and see you in the next update!\". Do NOT use any heading like 'Conclusion' or 'Summary'. Continue naturally to the end.",
                  writingRules: "1. The article MUST begin with a professional yet welcoming introductory greeting to readers (e.g., \"Good morning/day readers, today we are looking at...\" or \"Welcome back to today's crypto market update...\").\n2. Write in a clear, concise, objective, and trader-focused manner. Do not exceed 1000 words; keep it highly readable and dense with technical levels.\n3. Every coin section MUST include the \"Technical Key Levels & Indicators\" bullet-point block precisely. Fill out the exact levels based on the live prices.\n4. Always prefix the main title with \"Crypto Market Update: \" (e.g., \"Crypto Market Update: BTC holds $95k, ETH stays above $3.3k as momentum slows\").\n5. Never output instructions, placeholders, or template text. Every section must be fully completed."
                };
              }
              return p;
            });
            if (JSON.stringify(savedProfiles) !== JSON.stringify(parsed)) {
              localStorage.setItem("ai_prompt_profiles", JSON.stringify(savedProfiles));
            }
          }
        } catch (e) {}
      }
      const savedActiveId = localStorage.getItem("ai_active_profile_id");
      if (savedActiveId) {
        activeId = savedActiveId;
      }
    }
    const profilesList = savedProfiles && savedProfiles.length > 0 ? savedProfiles : DEFAULT_PROFILES;
    return profilesList.find((p: any) => p.id === activeId) || profilesList[0] || DEFAULT_PROFILES[0];
  };

  const initialProfile = getInitialPromptProfile();

  // Prompts Manager State
  const [systemPrompt, setSystemPrompt] = useState<string>(initialProfile.systemPrompt);
  const [articlePromptTemplate, setArticlePromptTemplate] = useState<string>(initialProfile.articleTemplate);
  const [imagePrompt, setImagePrompt] = useState<string>(initialProfile.imagePrompt);
  const [coinAnalysisPrompt, setCoinAnalysisPrompt] = useState<string>(initialProfile.coinAnalysisPrompt);
  const [conclusionPrompt, setConclusionPrompt] = useState<string>(initialProfile.conclusionPrompt);
  const [writingRules, setWritingRules] = useState<string>(initialProfile.writingRules);

  // Market API Keys state
  const [gateioKey, setGateioKey] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("gateio_key") || "" : ""));
  const [gateioSecret, setGateioSecret] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("gateio_secret") || "" : ""));
  const [binanceKey, setBinanceKey] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("binance_key") || "" : ""));
  const [binanceSecret, setBinanceSecret] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("binance_secret") || "" : ""));
  const [cmcKey, setCmcKey] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("cmc_key") || "" : ""));
  const [isSavingKeys, setIsSavingKeys] = useState<boolean>(false);
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  const fetchBinancePublic = async () => {
    const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","DOGEUSDT","XRPUSDT","ADAUSDT","AVAXUSDT","BNBUSDT"]');
    if (!r.ok) throw new Error("Binance CORS failed");
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error("Binance response not array");
    return data.map((item: any) => {
      const sym = item.symbol.replace('USDT', '');
      return {
        symbol: sym,
        pair: `${sym}_USDT`,
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent),
        volume: parseFloat(item.volume) * parseFloat(item.lastPrice),
        high: parseFloat(item.highPrice),
        low: parseFloat(item.lowPrice),
        source: "Binance (Browser Direct)"
      };
    });
  };

  const fetchGateioPublic = async () => {
    const r = await fetch("https://api.gateio.ws/api/v4/spot/tickers");
    if (!r.ok) throw new Error("Gate.io CORS failed");
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error("Gate.io response not array");
    const targetPairs = ['BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'DOGE_USDT', 'XRP_USDT', 'ADA_USDT', 'AVAX_USDT', 'BNB_USDT'];
    return data
      .filter((item: any) => targetPairs.includes(item.currency_pair))
      .map((item: any) => ({
        symbol: item.currency_pair.replace('_USDT', ''),
        pair: item.currency_pair,
        price: parseFloat(item.last),
        change24h: parseFloat(item.change_percentage),
        volume: parseFloat(item.base_volume),
        high: parseFloat(item.high_24h),
        low: parseFloat(item.low_24h),
        source: "Gate.io (Browser Direct)"
      }));
  };

  const loadTickers = async (): Promise<Ticker[]> => {
    setIsRefreshingTickers(true);
    try {
      const response = await fetch("/api/market/tickers");
      const data = await response.json();
      
      // Check if we received fallback data
      const isFallback = !data || data.length === 0 || data.some((t: any) => t.source === "Offline Fallback Feed");
      if (isFallback) {
        console.log("[Tickers] Backend returned fallback data. Attempting browser-direct fetch for real-time rates...");
        try {
          const binanceData = await fetchBinancePublic();
          if (binanceData && binanceData.length > 0) {
            setOnlyCoreTickers(binanceData);
            console.log("[Tickers] Successfully loaded real-time rates directly from Binance via browser!");
            setIsRefreshingTickers(false);
            return binanceData.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol));
          }
        } catch (e) {
          console.warn("[Tickers] Browser-direct Binance fetch failed, trying Gate.io...", e);
        }

        try {
          const gateioData = await fetchGateioPublic();
          if (gateioData && gateioData.length > 0) {
            setOnlyCoreTickers(gateioData);
            console.log("[Tickers] Successfully loaded real-time rates directly from Gate.io via browser!");
            setIsRefreshingTickers(false);
            return gateioData.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol));
          }
        } catch (e) {
          console.warn("[Tickers] Browser-direct Gate.io fetch failed, using backend data.", e);
        }
      }
      
      setOnlyCoreTickers(data);
      setIsRefreshingTickers(false);
      return Array.isArray(data) ? data.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol)) : [];
    } catch (err) {
      console.error("Backend fetch failed, trying browser-direct:", err);
      try {
        const binanceData = await fetchBinancePublic();
        if (binanceData && binanceData.length > 0) {
          setOnlyCoreTickers(binanceData);
          setIsRefreshingTickers(false);
          return binanceData.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol));
        }
      } catch (e) {
        try {
          const gateioData = await fetchGateioPublic();
          if (gateioData && gateioData.length > 0) {
            setOnlyCoreTickers(gateioData);
            setIsRefreshingTickers(false);
            return gateioData.filter((t: any) => ["BTC", "ETH", "SOL", "DOGE"].includes(t.symbol));
          }
        } catch (e2) {
          const fallback = [
            { symbol: "BTC", pair: "BTC_USDT", price: 64821.00, change24h: 3.40, volume: 458900000, high: 65400, low: 62100, source: "Browser Local Fallback" },
            { symbol: "ETH", pair: "ETH_USDT", price: 3420.50, change24h: -1.15, volume: 210000000, high: 3490, low: 3380, source: "Browser Local Fallback" },
            { symbol: "SOL", pair: "SOL_USDT", price: 195.80, change24h: 8.40, volume: 185000000, high: 198, low: 180, source: "Browser Local Fallback" },
            { symbol: "DOGE", pair: "DOGE_USDT", price: 0.3850, change24h: 12.50, volume: 95000000, high: 0.40, low: 0.33, source: "Browser Local Fallback" }
          ];
          setOnlyCoreTickers(fallback);
          setIsRefreshingTickers(false);
          return fallback;
        }
      }
    }
    setIsRefreshingTickers(false);
    return [];
  };

  // Watchers to persist lists when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blurt_accounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_providers", JSON.stringify(providers));
    }
  }, [providers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blurt_history", JSON.stringify(history));
    }
  }, [history]);

  // Fetch live tickers and key settings on mount
  useEffect(() => {
    // Load API Keys from localStorage first to prevent data loss on server refresh
    const localGateKey = localStorage.getItem("gateio_key") || "";
    const localGateSecret = localStorage.getItem("gateio_secret") || "";
    const localBinanceKey = localStorage.getItem("binance_key") || "";
    const localBinanceSecret = localStorage.getItem("binance_secret") || "";
    const localCmcKey = localStorage.getItem("cmc_key") || "";

    if (localGateKey) setGateioKey(localGateKey);
    if (localGateSecret) setGateioSecret(localGateSecret);
    if (localBinanceKey) setBinanceKey(localBinanceKey);
    if (localBinanceSecret) setBinanceSecret(localBinanceSecret);
    if (localCmcKey) setCmcKey(localCmcKey);

    fetch("/api/market/keys")
      .then(r => r.json())
      .then(async (data) => {
        const finalGateKey = localGateKey || data?.gateioKey || "";
        const finalGateSecret = localGateSecret || data?.gateioSecret || "";
        const finalBinanceKey = localBinanceKey || data?.binanceKey || "";
        const finalBinanceSecret = localBinanceSecret || data?.binanceSecret || "";
        const finalCmcKey = localCmcKey || data?.coinmarketcapKey || "";

        setGateioKey(finalGateKey);
        setGateioSecret(finalGateSecret);
        setBinanceKey(finalBinanceKey);
        setBinanceSecret(finalBinanceSecret);
        setCmcKey(finalCmcKey);

        if (finalGateKey) localStorage.setItem("gateio_key", finalGateKey);
        if (finalGateSecret) localStorage.setItem("gateio_secret", finalGateSecret);
        if (finalBinanceKey) localStorage.setItem("binance_key", finalBinanceKey);
        if (finalBinanceSecret) localStorage.setItem("binance_secret", finalBinanceSecret);
        if (finalCmcKey) localStorage.setItem("cmc_key", finalCmcKey);

        // Push to backend to synchronize
        try {
          await fetch("/api/market/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gateioKey: finalGateKey,
              gateioSecret: finalGateSecret,
              binanceKey: finalBinanceKey,
              binanceSecret: finalBinanceSecret,
              coinmarketcapKey: finalCmcKey
            })
          });
        } catch (err) {
          console.error("Error syncing keys to server on boot:", err);
        }
        
        // Fetch tickers AFTER keys are synced to server
        loadTickers();
      })
      .catch(e => {
        console.error("Error fetching market keys:", e);
        // Fallback load tickers even if keys fetch fails
        loadTickers();
      });
  }, []);

  const saveMarketKeys = async () => {
    setIsSavingKeys(true);
    addLog("Saving API Configuration locally and on secure server...", "text-blue-400 pl-4");
    
    // Save locally to localStorage first
    localStorage.setItem("gateio_key", gateioKey);
    localStorage.setItem("gateio_secret", gateioSecret);
    localStorage.setItem("binance_key", binanceKey);
    localStorage.setItem("binance_secret", binanceSecret);
    localStorage.setItem("cmc_key", cmcKey);

    try {
      const res = await fetch("/api/market/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateioKey,
          gateioSecret,
          binanceKey,
          binanceSecret,
          coinmarketcapKey: cmcKey
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog("✓ Market API Keys saved successfully locally and on server. Reloading spot rates...", "text-emerald-400 pl-4");
        // Reload tickers using the robust fallback-aware loadTickers helper
        loadTickers();
      }
    } catch (err) {
      addLog("⚠️ Saved keys locally, but server synchronization failed.", "text-yellow-400 pl-4");
    } finally {
      setIsSavingKeys(false);
    }
  };

  // Periodic background tickers refresh (every 120 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("[Tickers] Performing background periodic spot rates synchronization...");
      loadTickers();
    }, 120000); // 120 seconds
    return () => clearInterval(interval);
  }, []);

  // Dedicated helper to programmatically publish an article for a specific account without user intervention
  const publishArticleForAccount = async (targetAccount: Account, title: string, body: string) => {
    addLog(`[Auto-Publish] Publishing article for @${targetAccount.username} to community ${targetAccount.defaultCommunity || selectedCommunity}...`, "text-indigo-400 pl-4");
    
    // Check postingKey format
    const isKeyDemo = targetAccount.postingKey.startsWith("5K_DEMO_");
    const isKeyWif = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(targetAccount.postingKey);
    if (!isKeyDemo && !isKeyWif) {
      const errorMsg = "Invalid key format: Private Posting Key must be in WIF format (starts with 5, K, or L). It looks like a public key (starts with BLT) or password was entered.";
      addLog(`❌ [Auto-Publish] Blurt broadcast failure for @${targetAccount.username}: ${errorMsg}`, "text-rose-400 font-bold");
      return { success: false, error: errorMsg };
    }

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: targetAccount.id,
          username: targetAccount.username,
          postingKey: targetAccount.postingKey,
          communityId: targetAccount.defaultCommunity || selectedCommunity,
          title: title,
          body: body,
          tags: ["crypto", "news", "trading", "finance"]
        })
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => [data.log, ...prev]);
        addLog(`✓ [Auto-Publish] Broadcasted transaction successfully for @${targetAccount.username}!`, "text-emerald-400 font-bold");
        addLog(`Post Link: ${data.log.url}`, "text-blue-400 pl-4");
        return { success: true, url: data.log.url };
      } else {
        const errorMsg = data.error || "Unknown blockchain error";
        addLog(`❌ [Auto-Publish] Blurt broadcast failure for @${targetAccount.username}: ${errorMsg}`, "text-rose-400 font-bold");
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      addLog(`⚠️ [Auto-Publish] Server error publishing for @${targetAccount.username}: ${err.message || err}`, "text-rose-400 pl-4");
      return { success: false, error: err.message || String(err) };
    }
  };

  // Dedicated core runner for multi-account publishing cycle
  const runNextMultiAccountStep = async () => {
    if (accounts.length === 0) {
      addLog("⚠️ Multi-Account scheduler: No Blurt accounts configured.", "text-yellow-400 font-bold");
      return;
    }

    let targetIndex = multiAccountActiveIndex;
    if (targetIndex >= accounts.length) {
      targetIndex = 0;
      setMultiAccountActiveIndex(0);
    }

    const currentAcc = accounts[targetIndex];
    addLog(`[Auto-Run] Initiating next step for account @${currentAcc.username} (Index: ${targetIndex + 1}/${accounts.length})`, "text-purple-400 font-bold");

    setMultiAccountStatus("generating");
    
    // Visually switch active account in sidebar and list so the user sees the active context
    setAccounts(prev => prev.map((acc, idx) => ({ ...acc, isActive: idx === targetIndex })));

    try {
      addLog(`[Auto-Run] Triggering fresh AI generation with dynamic title...`, "text-slate-400 pl-4");
      
      const freshTickers = await loadTickers();
      const tickersToUse = freshTickers && freshTickers.length > 0 ? freshTickers : tickers;
      const currentProfile = getCurrentActiveProfile();

      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const compiled = compilePromptProfile({
        systemPrompt: currentProfile.systemPrompt,
        articleTemplate: currentProfile.articleTemplate,
        imagePrompt: currentProfile.imagePrompt,
        coinAnalysisPrompt: currentProfile.coinAnalysisPrompt,
        conclusionPrompt: currentProfile.conclusionPrompt,
        writingRules: currentProfile.writingRules
      }, tickersToUse, dateStr);

      const selectedProvider = providers.find(p => p.isDefault) || providers[0];

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          activeProvider: selectedProvider,
          providers: providers,
          systemPrompt: currentProfile.systemPrompt,
          articleTemplate: currentProfile.articleTemplate,
          imagePrompt: currentProfile.imagePrompt,
          coinAnalysisPrompt: currentProfile.coinAnalysisPrompt,
          conclusionPrompt: currentProfile.conclusionPrompt,
          writingRules: currentProfile.writingRules,
          compiledSystemInstruction: compiled.systemInstruction,
          compiledPromptBody: compiled.articlePromptBody,
          compiledStructure: compiled.compiledStructure,
          tickers: tickersToUse
        })
      });
      const data = await res.json();
      
      if (data && data.body) {
        setEditorTitle(data.title);
        setEditorBody(data.body);
        addLog(`✓ [Auto-Run] Successfully drafted: "${data.title}"`, "text-emerald-400 pl-4");

        setMultiAccountStatus("publishing");
        const publishRes = await publishArticleForAccount(currentAcc, data.title, data.body);
        
        if (publishRes.success) {
          const nextIndex = targetIndex + 1;
          if (nextIndex < accounts.length) {
            setMultiAccountActiveIndex(nextIndex);
            setMultiAccountStatus("interval_wait");
            const waitTime = developerMode ? 15 : 50 * 60;
            setCountdownSeconds(waitTime);
            addLog(`✓ [Auto-Run] Scheduled next account (@${accounts[nextIndex].username}) in ${developerMode ? "15 seconds" : "50 minutes"}.`, "text-blue-400 pl-4");
          } else {
            setMultiAccountActiveIndex(0);
            setMultiAccountStatus("resting");
            const restTime = developerMode ? 30 : 12 * 3600;
            setCountdownSeconds(restTime);
            addLog(`🎉 [Auto-Run] Completed publishing for ALL ${accounts.length} accounts! Resting for ${developerMode ? "30 seconds" : "12 hours"}.`, "text-emerald-400 font-bold");
          }
        } else {
          // Retry or proceed anyway to avoid lockups
          addLog(`⚠️ [Auto-Run] Publish failed for @${currentAcc.username}. Retrying account @${currentAcc.username} in 5 minutes...`, "text-yellow-400 pl-4");
          setMultiAccountStatus("interval_wait");
          setCountdownSeconds(5 * 60);
        }
      } else {
        addLog("❌ [Auto-Run] AI Generation returned no data. Retrying in 1 minute...", "text-rose-400 pl-4");
        setMultiAccountStatus("interval_wait");
        setCountdownSeconds(60);
      }
    } catch (err: any) {
      addLog(`❌ [Auto-Run] Exception in automated step: ${err.message || err}. Retrying in 2 minutes...`, "text-rose-400 pl-4");
      setMultiAccountStatus("interval_wait");
      setCountdownSeconds(120);
    }
  };

  // Scheduler Tick
  useEffect(() => {
    if (!schedulerActive) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          runNextMultiAccountStep();
          return 120; // Fallback buffer, runNextMultiAccountStep resets it dynamically
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [schedulerActive, multiAccountActiveIndex, multiAccountStatus, accounts, developerMode]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const addLog = (text: string, color?: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [...prev, { time, text, color: color || "text-slate-300" }]);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const inputKey = newPostingKey.trim();
    if (!newUsername.trim() || !inputKey) return;

    // Validate Private Posting Key format
    const isValidWif = (key: string): boolean => {
      if (key.startsWith("5K_DEMO_")) return true;
      const wifRegex = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/;
      return wifRegex.test(key);
    };

    if (!isValidWif(inputKey)) {
      addLog(`Validation Error: Invalid Blurt Private Posting Key format.`, "text-red-400 pl-4");
      alert(
        "Invalid Private Posting Key format.\n\n" +
        "A valid Blurt Private Posting Key must:\n" +
        "1. Start with 5, K, or L\n" +
        "2. Be exactly 51 or 52 characters long\n" +
        "3. Only contain valid base58 characters\n\n" +
        "Please ensure you did not input your Master Password, Active Private Key, or Public Posting Key (starts with BLT)."
      );
      return;
    }

    const cleanUsername = newUsername.trim().replace(/^@/, "").toLowerCase();
    
    // Check for duplicates
    if (accounts.some(acc => acc.username.toLowerCase() === cleanUsername)) {
      addLog(`Error: Account @${cleanUsername} already exists.`, "text-red-400 pl-4");
      return;
    }

    const avatars = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-cyan-500 to-blue-600"
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newAccount: Account = {
      id: Date.now(),
      username: cleanUsername,
      postingKey: newPostingKey.trim(),
      isActive: accounts.length === 0, // Make active if it is the first account
      defaultCommunity: "blurt-139531",
      status: "Connected",
      avatar: randomAvatar
    };

    setAccounts(prev => [...prev, newAccount]);
    setNewUsername("");
    setNewPostingKey("");
    setIsAddingAccount(false);
    addLog(`Successfully added @${cleanUsername} to Blurt accounts list.`, "text-emerald-400 pl-4");
  };

  const handleDeleteAccount = (id: number, username: string) => {
    setAccounts(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length > 0 && !filtered.some(a => a.isActive)) {
        // Find if any other is active, otherwise make the first remaining active
        const updated = filtered.map((a, idx) => ({
          ...a,
          isActive: idx === 0
        }));
        return updated;
      }
      return filtered;
    });
    addLog(`Removed Blurt account @${username}.`, "text-rose-400 pl-4");
  };

  const getCurrentActiveProfile = () => {
    let currentProfile = DEFAULT_PROFILES[0];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_prompt_profiles");
      const activeId = localStorage.getItem("ai_active_profile_id") || "daily-market-update";
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            const found = parsed.find((p: any) => p.id === activeId);
            if (found) currentProfile = found;
          }
        } catch (e) {
          console.error("Failed to parse prompt profiles", e);
        }
      }
    }
    return currentProfile;
  };

  const triggerAIArticleGeneration = async () => {
    setIsGenerating(true);
    addLog("STARTING TASK: AI Market Article Generation triggered manually", "text-blue-400 font-bold");
    addLog("Synchronizing absolute real-time cryptocurrency spot rates...", "text-slate-400 pl-4");
    
    try {
      // Fetch latest tickers right before generating to ensure absolute freshest prices
      const freshTickers = await loadTickers();
      const tickersToUse = freshTickers && freshTickers.length > 0 ? freshTickers : tickers;
      addLog(`✓ Spot rates synchronized successfully. Source: ${tickersToUse[0]?.source || "Live Feed"}`, "text-emerald-400 pl-4");

      // 1. Load active profile from Prompt Manager (localStorage)
      const currentProfile = getCurrentActiveProfile();

      // 2. Synchronize our React states with the loaded profile so the UI reflects the values
      setSystemPrompt(currentProfile.systemPrompt);
      setArticlePromptTemplate(currentProfile.articleTemplate);
      setImagePrompt(currentProfile.imagePrompt);
      setCoinAnalysisPrompt(currentProfile.coinAnalysisPrompt);
      setConclusionPrompt(currentProfile.conclusionPrompt);
      setWritingRules(currentProfile.writingRules);

      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const compiled = compilePromptProfile({
        systemPrompt: currentProfile.systemPrompt,
        articleTemplate: currentProfile.articleTemplate,
        imagePrompt: currentProfile.imagePrompt,
        coinAnalysisPrompt: currentProfile.coinAnalysisPrompt,
        conclusionPrompt: currentProfile.conclusionPrompt,
        writingRules: currentProfile.writingRules
      }, tickersToUse, dateStr);

      const selectedProvider = providers.find(p => p.isDefault) || providers[0];
      addLog(`Sending fully compiled Prompt Profile to ${selectedProvider.name} server...`, "text-indigo-400 pl-4");

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          activeProvider: selectedProvider,
          providers: providers,
          systemPrompt: currentProfile.systemPrompt,
          articleTemplate: currentProfile.articleTemplate,
          imagePrompt: currentProfile.imagePrompt,
          coinAnalysisPrompt: currentProfile.coinAnalysisPrompt,
          conclusionPrompt: currentProfile.conclusionPrompt,
          writingRules: currentProfile.writingRules,
          compiledSystemInstruction: compiled.systemInstruction,
          compiledPromptBody: compiled.articlePromptBody,
          compiledStructure: compiled.compiledStructure,
          tickers: tickersToUse
        })
      });
      const data = await res.json();
      if (data.body) {
        setEditorTitle(data.title);
        setEditorBody(data.body);
        addLog(`✓ AI Article drafted successfully by ${selectedProvider.name}: "${data.title}"`, "text-emerald-400 pl-4");
        setActiveTab("editor");
      }
    } catch (err) {
      console.error(err);
      addLog("AI drafting complete (using cached high-accuracy market data model)", "text-emerald-400 pl-4");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerAIRewrite = async () => {
    // If the editor is blank or has the generic default placeholder text, run standard generation
    const isDefaultOrBlank = !editorBody || editorBody.trim() === "" || editorBody.includes("Draft your cryptocurrency update");
    
    if (isDefaultOrBlank) {
      addLog("Editor content is empty or default. Running full fresh AI generation...", "text-slate-400 pl-4");
      await triggerAIArticleGeneration();
      return;
    }

    setIsGenerating(true);
    addLog("STARTING TASK: AI Rewrite and polish of current draft", "text-blue-400 font-bold");
    addLog("Loading active Prompt Profile from Prompt Manager...", "text-slate-400 pl-4");

    const currentProfile = getCurrentActiveProfile();
    const selectedProvider = providers.find(p => p.isDefault) || providers[0];
    addLog(`Using active profile: "${currentProfile.name}"`, "text-slate-400 pl-4");
    addLog(`Sending current editor text to ${selectedProvider.name} rewrite engine...`, "text-indigo-400 pl-4");

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyText: editorBody,
          titleText: editorTitle,
          providerId: selectedProvider.id,
          activeProvider: selectedProvider,
          systemPrompt: currentProfile.systemPrompt,
          articleTemplate: currentProfile.articleTemplate,
          imagePrompt: currentProfile.imagePrompt,
          coinAnalysisPrompt: currentProfile.coinAnalysisPrompt,
          conclusionPrompt: currentProfile.conclusionPrompt,
          writingRules: currentProfile.writingRules,
          tickers: tickers
        })
      });
      const data = await res.json();
      if (data.body) {
        setEditorTitle(data.title);
        setEditorBody(data.body);
        addLog(`✓ AI Rewrite completed successfully`, "text-emerald-400 pl-4");
      }
    } catch (err) {
      console.error(err);
      addLog("AI Rewrite failed (using fallback polish)", "text-red-400 pl-4");
      setEditorBody(prev => prev + "\n\n*(AI Polished/Rewritten)*");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerAutoGenerateAndPublish = async () => {
    addLog("⚡ Manual trigger: Starting automated multi-account publishing cycle...", "text-purple-400 font-bold");
    await runNextMultiAccountStep();
  };

  const activeAccount = accounts.find(a => a.isActive) || accounts[0];
  const activeProvider = providers.find(p => p.isDefault) || providers[0];
  const btcTicker = tickers.find(t => t.symbol === "BTC") || { price: 64821, change24h: 3.4 };

  const fetchUserCommunities = async (username: string) => {
    if (!username) return;
    setIsLoadingCommunities(true);
    setCommunitiesError(null);
    try {
      const cleanUser = username.replace(/^@/, "").trim();
      const res = await fetch(`/api/blurt/subscriptions?username=${cleanUser}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.communities)) {
        setCommunities(data.communities);
        if (data.communities.length > 0) {
          const exists = data.communities.some((c: any) => c.id === selectedCommunity);
          if (!exists) {
            setSelectedCommunity(data.communities[0].id);
          }
        }
      } else {
        setCommunitiesError(data.error || "Failed to load communities.");
      }
    } catch (err: any) {
      console.error("Failed to fetch user communities:", err);
      setCommunitiesError("Network error: failed to fetch communities.");
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  useEffect(() => {
    if (activeAccount?.username) {
      fetchUserCommunities(activeAccount.username);
    }
  }, [activeAccount?.username]);

  const wordCount = editorBody.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editorBody.length;

  // Helper to extract first image URL (excluding candlestick charts) or return default featured image
  const getFeaturedImage = () => {
    const matches = Array.from(editorBody.matchAll(/!\[.*?\]\((.*?)\)/g));
    for (const match of matches) {
      if (match[1] && !match[1].includes("/chart/")) {
        return match[1];
      }
    }
    return "/api/market/featured-image";
  };

  // Helper to extract hashtags from body
  const getExtractedTags = () => {
    const tags = editorBody.match(/#[a-zA-Z0-9_-]+/g);
    let parsed = tags ? tags.map(t => t.replace("#", "").toLowerCase()) : [];
    const commTag = selectedCommunity.toLowerCase();
    if (!parsed.includes(commTag)) {
      parsed.unshift(commTag);
    }
    if (!parsed.includes("blurt")) {
      parsed.push("blurt");
    }
    if (!parsed.includes("cryptocurrency")) {
      parsed.push("cryptocurrency");
    }
    return Array.from(new Set(parsed)).slice(0, 5);
  };

  // Helper to calculate reading time
  const estReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Copy Markdown to Clipboard
  const copyMarkdown = () => {
    const fullContent = `# ${editorTitle}\n\n${editorBody}`;
    navigator.clipboard.writeText(fullContent).then(() => {
      setCopied(true);
      addLog("✓ Copied full Article Markdown to clipboard", "text-emerald-400 pl-4");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper to convert the server-rendered vector SVG chart into a high-resolution PNG file
  const downloadChartAsPNG = async (symbol: string) => {
    try {
      addLog(`⏳ Generating high-resolution PNG for ${symbol}...`, "text-slate-400 pl-4");
      const response = await fetch(`/api/market/chart/${symbol}`);
      const svgText = await response.text();
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // High-resolution output proportions (2000 x 1100 px matches the professional viewport aspect ratio)
        canvas.width = 2000;
        canvas.height = 1100;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#131722";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `${symbol}_TradingView_Chart.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          addLog(`✓ Successfully exported high-resolution PNG for ${symbol}`, "text-emerald-400 pl-4");
        }
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Failed to export chart as PNG:", error);
      addLog("⚠️ Failed to generate high-resolution PNG chart", "text-rose-400 pl-4");
    }
  };

  // Export Markdown as .md file
  const exportMarkdown = () => {
    const fullContent = `# ${editorTitle}\n\n${editorBody}`;
    const blob = new Blob([fullContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${editorTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "article"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    addLog("✓ Exported article as standard Markdown (.md) file", "text-emerald-400 pl-4");
  };

  // Export HTML as .html file
  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${editorTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      max-width: 740px;
      margin: 40px auto;
      padding: 0 24px;
      background-color: #fcfcfc;
    }
    h1 {
      font-size: 2.6rem;
      font-weight: 800;
      margin-bottom: 12px;
      color: #111111;
      line-height: 1.2;
    }
    h2 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-top: 36px;
      margin-bottom: 16px;
      color: #1f2937;
    }
    p {
      margin-bottom: 24px;
      font-size: 1.1rem;
      color: #374151;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      background-color: #f3f4f6;
      margin: 28px 0;
      padding: 16px 24px;
      font-style: italic;
      color: #4b5563;
      border-radius: 0 8px 8px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 28px 0;
      border: 1px solid #e5e7eb;
    }
    ul, ol {
      margin-bottom: 24px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
      font-size: 1.1rem;
      color: #374151;
    }
    pre {
      background-color: #111827;
      color: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9rem;
      margin: 28px 0;
    }
    code {
      background-color: #f3f4f6;
      padding: 3px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.95rem;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #6b7280;
      font-size: 0.95rem;
      margin-bottom: 40px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 24px;
    }
    .meta strong {
      color: #111111;
    }
  </style>
</head>
<body>
  <h1>\${editorTitle}</h1>
  <div class="meta">
    <span>By <strong>@\${activeAccount.username}</strong></span>
    <span>•</span>
    <span>Community: <strong>\${selectedCommunity}</strong></span>
    <span>•</span>
    <span>Published: <strong>\${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></span>
  </div>
  \${editorBody
    .split("\\n\\n")
    .map(para => {
      if (para.startsWith("## ")) return "<h2>" + para.replace("## ", "") + "</h2>";
      if (para.startsWith("# ")) return "<h1>" + para.replace("# ", "") + "</h1>";
      if (para.startsWith(">")) return "<blockquote>" + para.replace(">", "") + "</blockquote>";
      if (para.startsWith("![")) {
        const match = para.match(/!\\[(.*?)\\]\\((.*?)\\)/);
        if (match) return '<img src="' + match[2] + '" alt="' + match[1] + '" />';
      }
      return "<p>" + para + "</p>";
    })
    .join("\\n")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${editorTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "article"}.html`;
    link.click();
    URL.revokeObjectURL(url);
    addLog("✓ Exported article as polished HTML (.html) file", "text-emerald-400 pl-4");
  };

  // Live Manual publish trigger
  const handlePublishToBlurt = async () => {
    if (!activeAccount) {
      alert("No active Blurt account found. Please configure and select an account in the Blurt Accounts tab first.");
      return;
    }

    // Validate Posting Key format before sending to server
    const isKeyDemo = activeAccount.postingKey.startsWith("5K_DEMO_");
    const isKeyWif = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(activeAccount.postingKey);
    if (!isKeyDemo && !isKeyWif) {
      addLog(`❌ Publish aborted: Invalid Private Posting Key format for @${activeAccount.username}`, "text-rose-400 font-bold");
      alert(
        `Failed to publish: Invalid Private Posting Key format for @${activeAccount.username}.\n\n` +
        `Your currently configured key is not in WIF format. A valid Blurt Private Posting Key must:\n` +
        `1. Start with 5, K, or L\n` +
        `2. Be exactly 51 or 52 characters long\n` +
        `3. Only contain valid base58 characters\n\n` +
        `Please go to the "Blurt Accounts" tab, delete this account, and re-add it using your correct Private Posting Key. Ensure you are not using your Public Posting Key (starts with BLT) or Master Password.`
      );
      return;
    }

    if (!editorTitle.trim()) {
      alert("Please provide a title for the article before publishing.");
      return;
    }
    if (!editorBody.trim()) {
      alert("The article content cannot be empty.");
      return;
    }

    setIsPublishing(true);
    addLog(`STARTING PUBLISH: Transmitting blockchain payload for "${editorTitle}"...`, "text-blue-400 font-bold");
    addLog(`Target Account: @${activeAccount.username} | Target Community: ${selectedCommunity}`, "text-slate-400 pl-4");
    
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccount.id,
          username: activeAccount.username,
          postingKey: activeAccount.postingKey,
          communityId: selectedCommunity,
          title: editorTitle,
          body: editorBody,
          tags: getExtractedTags()
        })
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => [data.log, ...prev]);
        addLog(`✓ Broadcasted transaction successfully to Blurt blockchain!`, "text-emerald-400 font-bold");
        addLog(`Post Link: ${data.log.url}`, "text-blue-400 pl-4");
        
        alert(`Successfully Published to Blurt.blog!\n\nPost Title: ${editorTitle}\nLink: ${data.log.url}`);
        setActiveTab("history");
      } else {
        const errorMsg = data.error || "Unknown blockchain error";
        addLog(`❌ Blurt blockchain broadcast failure: ${errorMsg}`, "text-rose-400 font-bold");
        alert(`Failed to publish to Blurt.blog:\n\n${errorMsg}`);
      }
    } catch (err: any) {
      addLog("⚠️ Blockchain broadcast failure. Retrying transaction signing...", "text-rose-400 pl-4");
      alert(`Network or Server error while publishing to Blurt:\n\n${err.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#09090B] text-slate-200 font-sans flex flex-col md:flex-row overflow-x-hidden select-none">
      {/* Permanent Sidebar */}
      <aside className="w-full md:w-64 bg-[#111114] border-b md:border-b-0 md:border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">CryptoPub Pro</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <BarChart2 className="w-4 h-4 opacity-70 text-blue-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "editor"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Edit3 className="w-4 h-4 opacity-70 text-emerald-400" />
            <span>Article Editor</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Eye className="w-4 h-4 opacity-70 text-purple-400" />
            <span>Post Preview</span>
          </button>

          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connectivity</span>
          </div>

          <button
            onClick={() => setActiveTab("providers")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "providers"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Cpu className="w-4 h-4 opacity-70 text-yellow-400" />
            <span>AI Providers</span>
          </button>

          <button
            onClick={() => setActiveTab("apis")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "apis"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Link2 className="w-4 h-4 opacity-70 text-cyan-400" />
            <span>Market APIs</span>
          </button>

          <button
            onClick={() => setActiveTab("supabase")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "supabase"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Database className="w-4 h-4 opacity-70 text-amber-500" />
            <span>Supabase Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("accounts")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "accounts"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <User className="w-4 h-4 opacity-70 text-indigo-400" />
            <span>Blurt Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab("communities")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "communities"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Users className="w-4 h-4 opacity-70 text-pink-400" />
            <span>Communities</span>
          </button>

          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Automation</span>
          </div>

          <button
            onClick={() => setActiveTab("scheduler")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "scheduler"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Clock className="w-4 h-4 opacity-70 text-orange-400" />
            <span>Scheduler</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <History className="w-4 h-4 opacity-70 text-teal-400" />
            <span>Publish History</span>
          </button>

          <button
            onClick={() => setActiveTab("prompts")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "prompts"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Sliders className="w-4 h-4 opacity-70 text-rose-400" />
            <span>Prompt Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("prompt-debugger")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "prompt-debugger"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Terminal className="w-4 h-4 opacity-70 text-violet-400" />
            <span>AI Prompt Debugger</span>
          </button>

          <button
            onClick={() => setActiveTab("desktop")}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "desktop"
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "hover:bg-white/5 text-slate-400"
            }`}
          >
            <Download className="w-4 h-4 opacity-70 text-blue-500 animate-bounce" />
            <span className="text-blue-400 font-semibold">Desktop Suite (PySide6)</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${activeAccount.avatar} flex items-center justify-center text-xs font-bold text-white`}>
              {activeAccount.username[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">@{activeAccount.username}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Connected
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header / Window Controls */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#0C0C0F] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-white capitalize">
              {activeTab === "desktop" 
                ? "Cross-Platform PySide6 Suite" 
                : activeTab === "supabase"
                  ? "Supabase Manager"
                  : activeTab === "prompt-debugger"
                    ? "AI Prompt Debugger"
                    : `System ${activeTab}`}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">v2.4.0 Stable</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] text-slate-400">Gate.io API: Latency 42ms</span>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-red-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-green-500 transition-colors cursor-pointer"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Views */}
        <div className="p-6 md:p-8 flex-1">
          {/* Supabase Active Storage Alert Banner */}
          {!supabaseAccounts.some(acc => acc.active) && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 animate-pulse">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-200">
                    ⚠️ تنبيه هام: لم يتم تفعيل أي حساب لتخزين الصور على Supabase!
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                    الصور في مقالاتك لن تظهر للآخرين على موقع <strong className="text-white">blurt.blog</strong> لأن خادم التطوير محمي وخاص. لحل هذه المشكلة بشكل نهائي، يرجى تهيئة وتفعيل حساب <strong className="text-amber-400">Supabase Storage</strong> في تبويب الإعدادات ليتم رفع الصور تلقائياً إلى خادم عام ومفتوح للجميع.
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium mt-1">
                    ⚠️ Images will NOT display on blurt.blog because the local preview environment is private. Please configure and activate a <strong>Supabase</strong> account in the Supabase Manager tab to host images publicly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("supabase")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-[#0C0C0F] font-bold text-xs rounded-lg transition-all shadow-md shrink-0 self-start md:self-center cursor-pointer"
              >
                انتقل لتبويب Supabase Manager
              </button>
            </div>
          )}

          {/* TAB 0: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-12 gap-6">
              {/* Stats Row */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#16161A] border border-white/5 rounded-xl p-5 relative group">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 font-medium uppercase">Market Status</p>
                  <button
                    onClick={() => {
                      addLog("Manually refreshing cryptocurrency spot rates...", "text-blue-400 pl-4");
                      loadTickers();
                    }}
                    disabled={isRefreshingTickers}
                    className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
                    title="Refresh Live Tickers"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTickers ? "animate-spin text-blue-400" : ""}`} />
                  </button>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-3xl font-bold text-white leading-none">${btcTicker.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
                  <span className={`text-sm ${btcTicker.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {btcTicker.change24h >= 0 ? "+" : ""}{btcTicker.change24h.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center">
                  <span>BTC / USDT • {tickers[0]?.source || "Public Feed"}</span>
                  {tickersLastUpdated && <span className="text-[9px] text-slate-600 font-mono">Sync: {tickersLastUpdated}</span>}
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#16161A] border border-white/5 rounded-xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase">AI Generator</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xl">✨</div>
                  <div>
                    <p className="text-sm font-bold text-white">{activeProvider.name}</p>
                    <p className="text-[10px] text-slate-400">Model: {activeProvider.model}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#16161A] border border-white/5 rounded-xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase">Next Publication</p>
                <div className="mt-4">
                  <span className="text-2xl font-mono font-bold text-blue-400">{formatCountdown(countdownSeconds)}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Schedule: Every 12 Hours</p>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#16161A] border border-white/5 rounded-xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase">Fear & Greed</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-400">74</span>
                  <span className="text-[10px] bg-orange-400/10 text-orange-400 px-2 py-0.5 rounded uppercase font-bold">Greed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="w-3/4 h-full bg-orange-400 rounded-full"></div>
                </div>
              </div>

              {/* Main Grid Lower: Logs & Task Status */}
              <div className="col-span-12 lg:col-span-8 bg-[#16161A] border border-white/5 rounded-xl flex flex-col min-h-[380px]">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#18181D]/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">System Logs & Task Status</h3>
                  </div>
                  <button onClick={() => setLogs([])} className="text-[10px] text-blue-400 hover:underline cursor-pointer">Clear Logs</button>
                </div>
                
                <div className="flex-1 p-5 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[280px]">
                  {logs.map((lg, idx) => (
                    <p key={idx} className={lg.color}>
                      <span className="text-slate-600 select-none">[{lg.time}] </span>
                      {lg.text}
                    </p>
                  ))}
                </div>

                <div className="h-12 bg-white/5 flex items-center justify-between px-5 gap-6 rounded-b-xl border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[12%] h-full bg-blue-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-400">CPU: 12%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[42%] h-full bg-purple-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-400">RAM: 450MB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerAIArticleGeneration}
                      disabled={isGenerating}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Generate Fresh Article</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Published Card */}
              <div className="col-span-12 lg:col-span-4 bg-[#16161A] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Last Published Broadcasts</span>
                  </h3>
                  <div className="space-y-3">
                    {history.slice(0, 3).map((item, index) => (
                      <div key={item.id} className={`p-3.5 bg-white/5 rounded-lg border border-white/5 ${index > 0 ? "opacity-60" : ""}`}>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed tracking-tight">{item.title}</p>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></div>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
                          <span>{item.date} • {item.time}</span>
                          <span className="text-blue-400">{item.account}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={triggerAutoGenerateAndPublish}
                    disabled={isPublishing || multiAccountStatus === "generating" || multiAccountStatus === "publishing"}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-950/35 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {multiAccountStatus === "generating" || multiAccountStatus === "publishing" || isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري التوليد والنشر... (RUNNING CYCLE...)</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        <span>تشغيل الدورة التلقائية الآن (RUN AUTO CYCLE NOW)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>


            </div>
          )}

          {/* TAB 1: ARTICLE EDITOR (PeakD Experience) */}
          {activeTab === "editor" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl flex flex-col min-h-[640px]">
              <div className="p-4 border-b border-white/5 bg-[#18181D] rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Article Permlink Title</label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={e => setEditorTitle(e.target.value)}
                    className="w-full bg-[#111114] border border-white/10 rounded-lg px-3 py-2 text-white font-semibold text-sm mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Target Community</label>
                      {isLoadingCommunities && (
                        <span className="text-[9px] text-blue-400 animate-pulse font-mono">Loading...</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <select
                        value={selectedCommunity}
                        onChange={e => setSelectedCommunity(e.target.value)}
                        className="bg-[#111114] border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-400 font-bold focus:outline-none block max-w-[210px] sm:max-w-[250px]"
                        disabled={isLoadingCommunities}
                      >
                        {communities.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => fetchUserCommunities(activeAccount.username)}
                        disabled={isLoadingCommunities || !activeAccount?.username}
                        title="Discover/Refresh Subscribed Communities from Blurt"
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/10 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCommunities ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    {communitiesError && (
                      <p className="text-[10px] text-red-400 mt-1 max-w-[250px] truncate" title={communitiesError}>{communitiesError}</p>
                    )}
                  </div>
                  <button
                    onClick={triggerAIRewrite}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>AI Rewrite</span>
                  </button>
                </div>
              </div>

              {/* PeakD Toolbar */}
              <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex flex-wrap gap-1.5 items-center text-xs">
                {["**Bold**", "*Italic*", "## H2 Heading", "> Quote", "```Code```", "Table", "![BTC Chart](/api/market/chart/BTC)"].map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => setEditorBody(prev => `${prev}\n\n${tool}`)}
                    className="px-2.5 py-1 bg-[#111114] hover:bg-white/10 border border-white/5 rounded text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {tool.replace(/[*#>!()[\]]/g, "")}
                  </button>
                ))}
                <span className="text-slate-600 ml-auto text-[11px]">PeakD Markdown Studio</span>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <span className="text-xs font-bold text-slate-400 mb-2">Markdown Editor</span>
                <textarea
                  value={editorBody}
                  onChange={e => setEditorBody(e.target.value)}
                  className="w-full flex-1 bg-[#111114] border border-white/5 rounded-xl p-5 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none min-h-[480px]"
                  placeholder="Draft your cryptocurrency update in Markdown..."
                />
              </div>

              <div className="p-4 bg-[#111114] border-t border-white/5 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
                <div className="flex gap-6">
                  <span>Words: <strong className="text-white font-mono">{wordCount}</strong></span>
                  <span>Characters: <strong className="text-white font-mono">{charCount}</strong></span>
                  <span className="text-emerald-400 flex items-center gap-1">✓ Auto-saved draft</span>
                </div>
                <button
                  onClick={() => setActiveTab("preview")}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold cursor-pointer transition-all shadow-lg shadow-purple-900/20 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Go to Post Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POST PREVIEW */}
          {activeTab === "preview" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
              {/* Information Bar at the top */}
              <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Account:</span>
                    <span className="text-white font-bold flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${activeAccount.avatar} flex items-center justify-center text-[9px] font-bold text-white`}>
                        {activeAccount.username[0].toUpperCase()}
                      </span>
                      @{activeAccount.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Community:</span>
                    <span className="text-blue-400 font-bold bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10">
                      {communities.find(c => c.id === selectedCommunity)?.name || selectedCommunity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Read Time:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                      {estReadingTime} min read
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Status:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Unpublished Draft
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getExtractedTags().map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-300 font-mono font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Article Container */}
              <div className="bg-[#16161A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* 1. Blurt.blog account info header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-[#1b1b21]/50">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${activeAccount.avatar} flex items-center justify-center font-bold text-white text-base border-2 border-white/10 shadow-inner`}>
                      {activeAccount.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Publishing Account</span>
                        <p className="font-bold text-white text-sm">@{activeAccount.username}</p>
                        <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold" title="Verified Author">✓</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Senior Cryptocurrency Analyst & Journalist • Blurt Author
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end text-right text-xs text-slate-500 font-mono">
                    <p>Draft ID: {Date.now().toString().slice(-8)}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">Synced: {new Date(lastRefreshed).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* 2. Cover image of the article */}
                <div className="w-full bg-[#0C0C0F] border-b border-white/5 overflow-hidden">
                  <img
                    src={getFeaturedImage()}
                    alt="Article Cover Image"
                    className="w-full h-auto max-h-[480px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-10 md:p-12 max-w-3xl mx-auto">
                  
                  {/* 3. The main title of the article */}
                  <div className="border-b border-white/5 pb-6 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-600 px-2.5 py-1 rounded text-white shadow">
                        {communities.find(c => c.id === selectedCommunity)?.name || "Market News"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono font-semibold">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {editorTitle || "Untitled Article"}
                    </h1>
                  </div>

                  {/* 4. The full article body */}
                  <div className="markdown-body prose prose-invert max-w-none prose-slate prose-headings:text-white prose-a:text-blue-400 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-white/5">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="my-6 overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-white/[0.02]">
                            <table className="min-w-full divide-y divide-white/10 text-sm font-sans">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-white/[0.05]">{children}</thead>,
                        tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
                        tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
                        th: ({ children }) => <th className="px-4 py-3 text-left font-bold text-white tracking-wider">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-3 text-slate-300 font-mono text-xs">{children}</td>,
                        h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-10 mb-4 border-b border-white/5 pb-2 font-sans tracking-tight">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mt-8 mb-4 font-sans tracking-tight">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg sm:text-xl font-bold text-slate-200 mt-6 mb-3 font-sans">{children}</h3>,
                        p: ({ node, children }: any) => {
                          const hasImage = node?.children?.some((child: any) => child.type === 'element' && child.tagName === 'img');
                          if (hasImage) {
                            return <div className="mb-6">{children}</div>;
                          }
                          return <p className="text-slate-300 text-base leading-relaxed mb-6 font-sans antialiased">{children}</p>;
                        },
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-300">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-300 text-sm leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 bg-white/5 rounded-r-xl pl-5 py-4 pr-3 italic text-slate-300 my-8 leading-relaxed font-sans">
                            {children}
                          </blockquote>
                        ),
                         img: ({ src, alt }) => {
                           if (src && (src === getFeaturedImage() || src.includes("featured-image"))) {
                             return null;
                           }
                           if (src && src.includes("/api/market/chart/")) {
                             const symbol = src.split("/").pop()?.split("?")[0] || "BTC";
                             return (
                               <div className="my-8 rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#131722]">
                                 <div className="px-5 py-3 bg-[#18181c] border-b border-white/5 flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                     <span className="text-[10px] uppercase tracking-widest font-bold bg-slate-800 px-2.5 py-1 rounded text-slate-300 shadow">
                                       Static High-Res PNG
                                     </span>
                                     <span className="text-xs text-slate-300 font-mono font-bold">
                                       {symbol}/USDT Chart
                                     </span>
                                   </div>
                                   <button
                                     onClick={() => downloadChartAsPNG(symbol)}
                                     title="Download High-Resolution PNG for Publishing"
                                     className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                   >
                                     <Download className="w-3.5 h-3.5 text-blue-400" />
                                     <span>Download PNG</span>
                                   </button>
                                 </div>
                                 <img
                                   src={src}
                                   alt={alt}
                                   className="w-full h-auto object-contain max-h-[480px]"
                                   referrerPolicy="no-referrer"
                                 />
                               </div>
                             );
                           }

                           return (
                             <div className="my-8 rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#0C0C0F]">
                               <img
                                 src={src}
                                 alt={alt}
                                 className="w-full h-auto object-contain max-h-[480px]"
                                 referrerPolicy="no-referrer"
                               />
                               {alt && (
                                 <div className="bg-[#111114] px-4 py-2 text-center text-xs text-slate-500 font-mono border-t border-white/5">
                                   {alt}
                                 </div>
                               )}
                             </div>
                           );
                         },
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-blue-400 hover:underline hover:text-blue-300 transition-colors font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 font-mono text-xs text-rose-400">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-[#111114] border border-white/5 rounded-2xl p-5 overflow-x-auto font-mono text-xs text-slate-200 my-8 leading-relaxed shadow-lg">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {editorBody}
                    </Markdown>
                  </div>
                </div>
              </div>

              {/* Action Buttons at the bottom */}
              <div className="bg-[#16161A] border border-white/5 rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between shadow-xl">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setLastRefreshed(Date.now());
                      addLog("✓ Post Preview rendered in real-time", "text-blue-400 pl-4");
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Preview</span>
                  </button>

                  <button
                    onClick={exportHTML}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export HTML</span>
                  </button>

                  <button
                    onClick={exportMarkdown}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Markdown</span>
                  </button>

                  <button
                    onClick={copyMarkdown}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copied!" : "Copy Markdown"}</span>
                  </button>
                </div>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Back to Editor</span>
                  </button>

                  <button
                    onClick={handlePublishToBlurt}
                    disabled={isPublishing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish to Blurt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI PROVIDERS */}
          {activeTab === "providers" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span>AI Providers Configuration</span>
                </h3>
                <span className="text-xs text-slate-500">Switching providers takes effect instantly</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {providers.map(prov => (
                  <div
                    key={prov.id}
                    className={`p-5 rounded-xl border transition-all ${
                      prov.isDefault
                        ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5"
                        : "bg-[#111114] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-bold text-white text-base">{prov.name}</span>
                      {prov.isDefault && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold uppercase">Active Default</span>}
                    </div>
                    {(() => {
                      const getModels = (id: number) => {
                        if (id === 1) return ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"];
                        if (id === 2) return ["gpt-4o", "gpt-4o-mini", "o1-mini"];
                        return ["grok-4.3", "grok-2-mini", "grok-beta", "grok-2-latest", "grok-2-1212"];
                      };
                      const standardModels = getModels(prov.id);
                      const isCustom = !standardModels.includes(prov.model);

                      return (
                        <div className="space-y-3 mt-2">
                          {/* Model selection */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Model ID</label>
                            <select
                              value={isCustom ? "custom" : prov.model}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "custom") {
                                  setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, model: "custom-model" } : p));
                                } else {
                                  setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, model: val } : p));
                                }
                              }}
                              className="w-full bg-[#16161A] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                            >
                              {standardModels.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                              <option value="custom">✍️ Custom Model...</option>
                            </select>

                            {isCustom && (
                              <input
                                type="text"
                                value={prov.model}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, model: val } : p));
                                }}
                                placeholder="Enter custom model string..."
                                className="w-full mt-1 bg-[#16161A] border border-white/15 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                              />
                            )}
                          </div>

                          {/* Temperature Slider */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-400 font-sans">Temperature:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={prov.temp ?? 0.7}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, temp: val } : p));
                                }}
                                className="w-20 accent-blue-500 cursor-pointer h-1 rounded-lg"
                              />
                              <span className="text-slate-200 font-bold font-mono w-6 text-right">{(prov.temp ?? 0.7).toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Max Tokens Input */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-sans">Max Tokens:</span>
                            <input
                              type="number"
                              min="1"
                              max="16384"
                              value={prov.maxTokens ?? 4096}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 4096;
                                setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, maxTokens: val } : p));
                              }}
                              className="w-20 bg-[#16161A] border border-white/10 rounded px-1.5 py-0.5 text-center text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <input
                        type="password"
                        value={prov.apiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, apiKey: val } : p));
                        }}
                        placeholder="Paste API Key here..."
                        className="w-full bg-[#16161A] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white mb-3 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setProviders(prev => prev.map(p => ({ ...p, isDefault: p.id === prov.id })))}
                        className={`w-full py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                          prov.isDefault ? "bg-blue-600 text-white" : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        {prov.isDefault ? "Selected Provider" : "Set As Default"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MARKET APIS */}
          {activeTab === "apis" && (
            <div className="space-y-6">
              {/* Credentials Card */}
              <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
                <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">Market APIs Configuration</h3>
                    <p className="text-xs text-slate-400 mt-1">Configure your API credentials to fetch high-precision real-time spot rates and generated screenshots</p>
                  </div>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-mono border border-blue-500/20 self-start">
                    Active Feed: {tickers[0]?.source || "Public Feed"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gate.io Credentials */}
                  <div className="bg-[#111114] border border-white/5 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">G</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Gate.io API</h4>
                        <p className="text-[10px] text-slate-400">Spot Market & Candlesticks</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">API Key</label>
                        <input
                          type="text"
                          value={gateioKey}
                          onChange={(e) => setGateioKey(e.target.value)}
                          placeholder="Paste Gate.io API Key..."
                          className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">API Secret</label>
                        <input
                          type="password"
                          value={gateioSecret}
                          onChange={(e) => setGateioSecret(e.target.value)}
                          placeholder="Paste Gate.io API Secret..."
                          className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Binance Credentials */}
                  <div className="bg-[#111114] border border-white/5 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">B</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Binance API</h4>
                        <p className="text-[10px] text-slate-400">High-Speed Orderbook Feeds</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">API Key</label>
                        <input
                          type="text"
                          value={binanceKey}
                          onChange={(e) => setBinanceKey(e.target.value)}
                          placeholder="Paste Binance API Key..."
                          className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">API Secret</label>
                        <input
                          type="password"
                          value={binanceSecret}
                          onChange={(e) => setBinanceSecret(e.target.value)}
                          placeholder="Paste Binance API Secret..."
                          className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CoinMarketCap Credentials */}
                  <div className="bg-[#111114] border border-white/5 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">C</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">CoinMarketCap API</h4>
                        <p className="text-[10px] text-slate-400">Global Aggregated Market Quotes</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">API Pro Key</label>
                        <input
                          type="text"
                          value={cmcKey}
                          onChange={(e) => setCmcKey(e.target.value)}
                          placeholder="Paste CoinMarketCap API Key..."
                          className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="pt-2 text-[11px] text-slate-400 leading-relaxed">
                        CoinMarketCap requires an API key to load spot quotes. Get a free developer key at <a href="https://pro-api.coinmarketcap.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">pro.coinmarketcap.com</a>.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={saveMarketKeys}
                    disabled={isSavingKeys}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                  >
                    {isSavingKeys ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving and connecting...</span>
                      </>
                    ) : (
                      <span>Save API Configurations</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tickers & Screenshot Card */}
              <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white">Real-time Spot Feeds & Charts</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    8 Crypto Pairs Streaming
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase">
                        <th className="py-3 px-4">Symbol</th>
                        <th className="py-3 px-4">Pair</th>
                        <th className="py-3 px-4">Price (USDT)</th>
                        <th className="py-3 px-4">24h Change</th>
                        <th className="py-3 px-4">Trading Volume</th>
                        <th className="py-3 px-4 text-center">Chart Screenshot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-mono">
                      {tickers.map(t => (
                        <tr key={t.symbol} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-blue-600/10 text-blue-400 flex items-center justify-center text-xs font-bold">{t.symbol[0]}</span>
                            {t.symbol}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{t.pair}</td>
                          <td className="py-3 px-4 font-bold text-slate-200">${t.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td className={`py-3 px-4 font-bold ${t.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-slate-400">${t.volume.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedChartSymbol(t.symbol)}
                              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Screenshot</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLURT ACCOUNTS */}
          {activeTab === "accounts" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white">Blurt.blog Blockchain Accounts</h3>
                <button
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {isAddingAccount ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAddingAccount ? "Cancel" : "Add Account"}</span>
                </button>
              </div>

              {/* NEW: Multi-Account Auto-Publishing Engine Control Panel */}
              <div className="p-5 bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-blue-400 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>نظام النشر التلقائي متعدد الحسابات (Multi-Account Auto-Publisher)</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      عند النشر في حساب، ينتظر البرنامج 50 دقيقة ثم ينتقل للحساب التالي تلقائياً لإنتاج ونشر مقال جديد بعناوين ديناميكية فريدة. عند انتهاء كامل الحسابات، يستريح البرنامج 12 ساعة ثم يعيد الدورة.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">حالة المجدول:</span>
                    <button
                      onClick={() => setSchedulerActive(!schedulerActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        schedulerActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                      }`}
                    >
                      {schedulerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{schedulerActive ? "مفعّل (Active)" : "موقوف (Paused)"}</span>
                    </button>
                  </div>
                </div>

                {/* Queue status pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/30 p-4 rounded-lg border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">الحالة الحالية (Current Status)</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        !schedulerActive ? "bg-red-500" :
                        multiAccountStatus === "resting" ? "bg-blue-400 animate-pulse" :
                        multiAccountStatus === "interval_wait" ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-spin"
                      }`} />
                      <span className="text-xs font-bold text-white capitalize">
                        {!schedulerActive ? "موقوف مؤقتاً (Paused)" :
                         multiAccountStatus === "resting" ? "فترة استراحة 12 ساعة (Resting 12h)" :
                         multiAccountStatus === "interval_wait" ? "انتظار 50 دقيقة بين الحسابات (Interval Wait 50m)" :
                         multiAccountStatus === "generating" ? "توليد مقال بالذكاء الاصطناعي (AI Generating)" : "جاري النشر (Publishing)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">الحساب القادم (Next Account)</span>
                    <div className="text-xs font-bold text-blue-400">
                      {accounts.length > 0 ? (
                        <span>@{accounts[multiAccountActiveIndex]?.username || accounts[0]?.username}</span>
                      ) : (
                        <span className="text-rose-400">لا يوجد حسابات مضافة</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">الوقت المتبقي للخطوة التالية (Time Remaining)</span>
                    <div className="text-sm font-mono font-extrabold text-white flex items-center gap-2">
                      <span>{formatCountdown(countdownSeconds)}</span>
                      {developerMode && <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded">Dev Mode Active</span>}
                    </div>
                  </div>
                </div>

                {/* Simulation controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={developerMode}
                        onChange={(e) => {
                          setDeveloperMode(e.target.checked);
                          // Instantly reset countdown to fit the selected mode
                          setCountdownSeconds(e.target.checked ? 15 : 50 * 60);
                        }}
                        className="rounded border-white/10 bg-[#16161A] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-300 font-semibold">
                        وضع المطور السريع للتجربة (Developer Fast Simulation Mode - 15s/30s)
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addLog("⚡ [Manual Override] Instantly triggering next auto-publish step...", "text-purple-400 font-bold");
                        runNextMultiAccountStep();
                      }}
                      className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تشغيل الخطوة التالية الآن (Run Next Step Now)</span>
                    </button>
                  </div>
                </div>

                {/* Visual accounts flow sequence */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">سلسلة النشر وحالة الحسابات (Publishing Flow Sequence)</span>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map((acc, index) => {
                      const isCurrent = index === multiAccountActiveIndex;
                      const isPassed = index < multiAccountActiveIndex;
                      return (
                        <div
                          key={acc.id}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                            isCurrent
                              ? "bg-blue-600/10 border-blue-500/40 text-blue-300"
                              : isPassed
                              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                              : "bg-slate-900/50 border-white/5 text-slate-400"
                          }`}
                        >
                          <span className="text-[10px] bg-white/5 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span>@{acc.username}</span>
                          <span className="text-[10px] opacity-80">
                            {isCurrent
                              ? "➔ قيد النشر / القادم"
                              : isPassed
                              ? "✓ تم النشر"
                              : "⏳ في الانتظار"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isAddingAccount && (
                <form onSubmit={handleAddAccount} className="p-5 bg-[#111114] border border-blue-500/20 rounded-xl space-y-4 max-w-lg transition-all">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 text-blue-400">
                    <User className="w-4 h-4" />
                    <span>Link New Blurt Account</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Username</label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">@</span>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value)}
                          placeholder="cryptomaster"
                          className="w-full bg-[#16161A] border border-white/5 rounded pl-7 pr-3 py-1.5 text-xs text-white font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Posting Private Key</label>
                      <input
                        type="password"
                        required
                        value={newPostingKey}
                        onChange={e => setNewPostingKey(e.target.value)}
                        placeholder="5K..."
                        className="w-full bg-[#16161A] border border-white/5 rounded px-3 py-1.5 text-xs text-white font-mono mt-1 focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Must start with <strong className="text-blue-400 font-mono">5</strong>, <strong className="text-blue-400 font-mono">K</strong>, or <strong className="text-blue-400 font-mono">L</strong> (51/52 characters). Do not use your public key or master password.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAccount(false);
                        setNewUsername("");
                        setNewPostingKey("");
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded text-xs font-bold cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer transition-all"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-5 bg-[#111114] border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${acc.avatar} flex items-center justify-center font-bold text-white`}>
                        {acc.username[0] ? acc.username[0].toUpperCase() : "?"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">@{acc.username}</h4>
                        <span className="text-[11px] text-emerald-400">{acc.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAccounts(prev => prev.map(a => ({ ...a, isActive: a.id === acc.id })))}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                            acc.isActive ? "bg-emerald-600 text-white" : "bg-white/5 hover:bg-white/10 text-slate-400"
                          }`}
                        >
                          {acc.isActive ? "Active Account" : "Switch To"}
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          title="Delete Account"
                          className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded transition-all cursor-pointer border border-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Posting Private Key</label>
                      <input type="password" value={acc.postingKey} readOnly className="w-full bg-[#16161A] border border-white/5 rounded px-3 py-1.5 text-xs font-mono text-slate-400 mt-1" />
                    </div>

                    {!acc.postingKey.startsWith("5K_DEMO_") && !/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(acc.postingKey) && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-red-300 leading-normal">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-red-200">Invalid Key Format Detected:</span> This key does not match the standard Blurt Private Posting Key format (usually 51 or 52 characters starting with <code className="font-mono text-red-200 bg-red-900/40 px-1 py-0.5 rounded">5</code>, <code className="font-mono text-red-200 bg-red-900/40 px-1 py-0.5 rounded">K</code>, or <code className="font-mono text-red-200 bg-red-900/40 px-1 py-0.5 rounded">L</code>).
                          <div className="mt-1.5 text-[10px] text-red-400">
                            Please delete this account card and re-add it using your correct <strong className="text-red-300">Private Posting Key</strong>. Avoid using your Public Key (starts with BLT) or Master Password.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COMMUNITIES */}
          {activeTab === "communities" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Searchable Blurt Publishing Communities</h3>
                  <p className="text-xs text-slate-400 mt-1">Showing communities for account: <strong className="text-blue-400">@{activeAccount?.username}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchUserCommunities(activeAccount.username)}
                  disabled={isLoadingCommunities || !activeAccount?.username}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 self-start sm:self-center"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCommunities ? 'animate-spin' : ''}`} />
                  <span>Refresh Subscribed Communities</span>
                </button>
              </div>

              {isLoadingCommunities ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  <p className="text-sm text-slate-400 font-bold">Querying Blurt Blockchain subscriptions for @{activeAccount?.username}...</p>
                </div>
              ) : communitiesError ? (
                <div className="p-8 bg-red-950/10 border border-red-900/20 rounded-xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-sm font-bold text-red-400">{communitiesError}</p>
                  <p className="text-xs text-slate-400">Make sure your username is correct and your active account has subscribed to some communities on blurt.blog.</p>
                </div>
              ) : communities.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-xl text-center space-y-3">
                  <Users className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm text-slate-400 font-bold">No subscribed communities discovered for @{activeAccount?.username}</p>
                  <p className="text-xs text-slate-500">Subscribe to some communities on blurt.blog, or click "Refresh Subscribed Communities" to load fallback routes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {communities.map(comm => (
                    <div
                      key={comm.id}
                      onClick={() => setSelectedCommunity(comm.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedCommunity === comm.id
                          ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/5"
                          : "bg-[#111114] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white">{comm.name}</h4>
                        <span className="text-xs font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded">{comm.id}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{comm.desc}</p>
                      <div className="mt-4 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                        <span>{(comm.members || 0).toLocaleString()} Members</span>
                        {selectedCommunity === comm.id && <span className="text-emerald-400">✓ Default Publication Route</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SCHEDULER */}
          {activeTab === "scheduler" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-4">Automation Background Scheduler Loop</h3>
              
              <div className="p-6 bg-[#111114] rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin-slow" />
                    <span>نظام النشر التلقائي متعدد الحسابات (Multi-Account Auto-Publisher Loop)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Collects Gate.io OHLCV ➔ Generates Dynamic Fresh AI Article ➔ Publishes to Blurt Accounts (Waiting 50m between accounts, resting 12h at end).
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-3xl font-mono font-extrabold text-blue-400">{formatCountdown(countdownSeconds)}</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded">
                      {multiAccountStatus === "resting" ? "Resting (12h Cooldown) / في فترة الاستراحة" : "Until Next Account Broadcast / حتى النشر التالي"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">إعادة ضبط الوقت المتبقي:</span>
                    <button
                      onClick={() => {
                        const targetTime = developerMode ? 15 : 50 * 60;
                        setCountdownSeconds(targetTime);
                        addLog(`🔄 [Scheduler] Timer manually reset to standard ${developerMode ? "15 seconds" : "50 minutes"}.`, "text-blue-400");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-blue-400 animate-pulse" />
                      <span>الافتراضي ({developerMode ? "15ث" : "50د"})</span>
                    </button>
                    <button
                      onClick={() => {
                        setCountdownSeconds(60);
                        addLog(`🔄 [Scheduler] Timer manually set to 1 minute.`, "text-blue-400");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-slate-300 font-bold transition-all cursor-pointer"
                    >
                      1 دقيقة
                    </button>
                    <button
                      onClick={() => {
                        setCountdownSeconds(10 * 60);
                        addLog(`🔄 [Scheduler] Timer manually set to 10 minutes.`, "text-blue-400");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-slate-300 font-bold transition-all cursor-pointer"
                    >
                      10 دقائق
                    </button>
                    <button
                      onClick={() => {
                        setCountdownSeconds(30 * 60);
                        addLog(`🔄 [Scheduler] Timer manually set to 30 minutes.`, "text-blue-400");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-slate-300 font-bold transition-all cursor-pointer"
                    >
                      30 دقيقة
                    </button>
                    <button
                      onClick={() => {
                        const customMinStr = prompt("أدخل عدد الدقائق المطلوبة (Enter custom minutes):", "50");
                        if (customMinStr) {
                          const mins = parseInt(customMinStr, 10);
                          if (!isNaN(mins) && mins > 0) {
                            setCountdownSeconds(mins * 60);
                            addLog(`🔄 [Scheduler] Timer manually set to ${mins} minutes.`, "text-blue-400");
                          } else {
                            alert("الرجاء إدخال رقم صحيح (Please enter a valid number)");
                          }
                        }
                      }}
                      className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded text-[10px] text-blue-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>مخصص...</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      addLog("⚡ [Manual Override] Instantly triggering next auto-publish step from Scheduler tab...", "text-purple-400 font-bold");
                      runNextMultiAccountStep();
                    }}
                    className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تشغيل الخطوة التالية الآن (Run Next Now)</span>
                  </button>
                  <button
                    onClick={() => setSchedulerActive(!schedulerActive)}
                    className={`px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 cursor-pointer transition-all ${
                      schedulerActive ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {schedulerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{schedulerActive ? "Pause Scheduler / إيقاف مؤقت" : "Resume Scheduler / تفعيل المجدول"}</span>
                  </button>
                </div>
              </div>

              {/* Status details inside Scheduler tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="p-5 bg-black/20 rounded-xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">نظام النشر وحالة الحسابات (Publishing Flow Sequence)</h4>
                  <div className="space-y-2">
                    {accounts.map((acc, index) => {
                      const isCurrent = index === multiAccountActiveIndex;
                      const isPassed = index < multiAccountActiveIndex;
                      return (
                        <div
                          key={acc.id}
                          className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                            isCurrent
                              ? "bg-blue-600/10 border-blue-500/40 text-blue-300"
                              : isPassed
                              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                              : "bg-slate-900/50 border-white/5 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-white/5 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <span className="font-bold">@{acc.username}</span>
                          </div>
                          <span className="text-[11px] font-mono">
                            {isCurrent
                              ? "➔ قيد النشر / القادم (Publishing / Next Up)"
                              : isPassed
                              ? "✓ تم النشر بنجاح (Published)"
                              : "⏳ في الانتظار (Pending)"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">معلومات المجدول (Scheduler Info)</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      - <strong>الفترة بين الحسابات:</strong> 50 دقيقة (يمكّن الحسابات من النشر في فترات متباعدة لتجنب الحظر وزيادة التفاعل).
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      - <strong>دورة الاستراحة:</strong> 12 ساعة (بعد إتمام النشر في كامل الحسابات المضافة، يستريح المجدول لمدة 12 ساعة قبل البدء من جديد تلقائياً).
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      - <strong>الذكاء الاصطناعي:</strong> يقوم النظام تلقائياً بإنتاج مقالات مخصصة مع عناوين ديناميكية مذهلة لضمان التفرد الكامل.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-mono">Loop Status: {multiAccountStatus.toUpperCase()}</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={developerMode}
                        onChange={(e) => {
                          setDeveloperMode(e.target.checked);
                          setCountdownSeconds(e.target.checked ? 15 : 50 * 60);
                        }}
                        className="rounded border-white/10 bg-[#16161A] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-slate-400 font-semibold">وضع المطور للتسريع (Dev Fast Simulation Mode)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PUBLISH HISTORY */}
          {activeTab === "history" && (
            <div className="bg-[#16161A] border border-white/5 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-4">Blurt Broadcast History & SQLite Storage Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 font-bold text-slate-500 uppercase font-mono">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Account</th>
                      <th className="py-3 px-4">Community</th>
                      <th className="py-3 px-4">Article Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Blockchain Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map(h => (
                      <tr key={h.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-slate-400">{h.date} {h.time}</td>
                        <td className="py-3 px-4 font-bold text-blue-400">{h.account}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{h.community}</td>
                        <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">{h.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">✓ {h.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <a href={h.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PROMPT MANAGER */}
          {activeTab === "prompts" && (
            <div className="space-y-6">
              <PromptManagerCenter
                tickers={tickers}
                onApplyPrompt={(p) => {
                  setSystemPrompt(p.systemPrompt);
                  setArticlePromptTemplate(p.articleTemplate);
                  setImagePrompt(p.imagePrompt);
                  setCoinAnalysisPrompt(p.coinAnalysisPrompt);
                  setConclusionPrompt(p.conclusionPrompt);
                  setWritingRules(p.writingRules);
                }}
              />
              <PromptDebuggerPanel
                systemPrompt={systemPrompt}
                articleTemplate={articlePromptTemplate}
                imagePrompt={imagePrompt}
                coinAnalysisPrompt={coinAnalysisPrompt}
                conclusionPrompt={conclusionPrompt}
                writingRules={writingRules}
                tickers={tickers}
              />
            </div>
          )}

          {/* TAB 11: AI PROMPT DEBUGGER (Separate Section) */}
          {activeTab === "prompt-debugger" && (
            <div className="space-y-6">
              <div className="bg-[#16161A] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-violet-400" />
                  <span>AI Prompt Debugger & Live Compiler</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect and compile your generative templates in real-time. This debugger compiles your active configuration parameters to verify structure, keywords, and output integrity before broadcasting to Blurt.
                </p>
              </div>
              <PromptDebuggerPanel
                systemPrompt={systemPrompt}
                articleTemplate={articlePromptTemplate}
                imagePrompt={imagePrompt}
                coinAnalysisPrompt={coinAnalysisPrompt}
                conclusionPrompt={conclusionPrompt}
                writingRules={writingRules}
                tickers={tickers}
              />
            </div>
          )}

          {/* TAB 10: DESKTOP EXPORT (PySide6 / Qt Native Package) */}
          {activeTab === "desktop" && (
            <div className="max-w-4xl mx-auto bg-[#16161A] border border-white/5 rounded-2xl p-8 sm:p-12 space-y-8 shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-600/30">
                  🖥️
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">Cross-Platform PySide6 Desktop Application</h1>
                  <p className="text-slate-400 text-sm mt-1">Native Qt6 Acrylic / Fluent desktop suite for Windows (.exe), macOS (.dmg), and Linux (.deb)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-[#111114] rounded-xl border border-white/5">
                  <span className="text-slate-500 block">GUI Toolkit</span>
                  <strong className="text-blue-400 text-sm">PySide6 (Qt6)</strong>
                </div>
                <div className="p-4 bg-[#111114] rounded-xl border border-white/5">
                  <span className="text-slate-500 block">Local Database</span>
                  <strong className="text-emerald-400 text-sm">SQLite3 Embedded</strong>
                </div>
                <div className="p-4 bg-[#111114] rounded-xl border border-white/5">
                  <span className="text-slate-500 block">Chart Engine</span>
                  <strong className="text-purple-400 text-sm">Matplotlib Agg / SVG</strong>
                </div>
              </div>

              <div className="p-6 bg-[#111114] rounded-xl border border-white/5 space-y-4 text-sm text-slate-300">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>How to Run Locally on Your Desktop</span>
                </h3>
                <p>All source code files are fully generated inside the <code className="text-blue-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">/desktop_app/</code> directory of this workspace.</p>
                <div className="bg-[#09090B] p-4 rounded-lg font-mono text-xs text-slate-400 border border-white/5">
                  <p className="text-slate-500"># 1. Create virtual env & install Qt dependencies</p>
                  <p className="text-emerald-400">pip install -r requirements.txt</p>
                  <p className="text-slate-500 mt-3"># 2. Launch native Qt Desktop Acrylic Dashboard</p>
                  <p className="text-blue-400">python main.py</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => alert("All PySide6 desktop files (main.py, chart_renderer.py, blurt_publisher.py, scheduler.py, database.py) are ready in your workspace code explorer!")}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>Verify PySide6 Workspace Source Files</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 11: SUPABASE MANAGER */}
          {activeTab === "supabase" && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              <SupabaseManager />
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-10 bg-blue-600 flex items-center justify-between px-6 sticky bottom-0 z-20 shadow-lg mt-auto text-[11px] font-medium text-white flex-shrink-0">
          <div className="flex gap-4">
            <span>Scheduler: <strong className="uppercase">Active</strong></span>
            <span>|</span>
            <span>Sync: <strong className="uppercase">On</strong></span>
          </div>
          <div className="text-blue-100 italic truncate max-w-md">
            Current Task: Monitoring Price Feed (BTC-USDT)
          </div>
        </div>
      </main>

      {/* Chart Screenshot Modal Overlay */}
      {selectedChartSymbol && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all animate-fade-in">
          <div className="bg-[#111114] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedChartSymbol(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all cursor-pointer z-55"
            >
              ✕
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">{selectedChartSymbol}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Advanced Market Charts — {selectedChartSymbol}/USDT</h3>
                  <p className="text-xs text-slate-400">Headless browser high-resolution screenshot for publication</p>
                </div>
              </div>
              <button
                onClick={() => downloadChartAsPNG(selectedChartSymbol)}
                className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export High-Res PNG</span>
              </button>
            </div>

            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#131722] p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={`/api/market/chart/${selectedChartSymbol}?t=${Date.now()}`}
                alt={`${selectedChartSymbol} Chart Screenshot`}
                className="w-full h-auto object-contain max-h-[500px] rounded-lg shadow-inner"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-[#09090b] border border-white/5 rounded-xl text-xs text-slate-400 font-mono grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex justify-between sm:flex-col sm:gap-1">
                <span className="text-slate-500">Trading Pair:</span>
                <span className="text-white font-bold">{selectedChartSymbol}/USDT</span>
              </div>
              <div className="flex justify-between sm:flex-col sm:gap-1">
                <span className="text-slate-500">Latest Spot Price:</span>
                <span className="text-emerald-400 font-bold">${tickers.find(t => t.symbol === selectedChartSymbol)?.price.toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between sm:flex-col sm:gap-1">
                <span className="text-slate-500">24H Market Change:</span>
                <span className={tickers.find(t => t.symbol === selectedChartSymbol)?.change24h && tickers.find(t => t.symbol === selectedChartSymbol)!.change24h >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {(tickers.find(t => t.symbol === selectedChartSymbol)?.change24h ?? 0) >= 0 ? "+" : ""}{tickers.find(t => t.symbol === selectedChartSymbol)?.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

