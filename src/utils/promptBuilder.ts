/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ticker {
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
  high: number;
  low: number;
  source?: string;
}

export interface PromptProfile {
  id: string;
  name: string;
  systemPrompt: string;
  articleTemplate: string;
  imagePrompt: string;
  coinAnalysisPrompt: string;
  conclusionPrompt: string;
  writingRules: string;
  isDefault: boolean;
}

export function compilePromptProfile(
  profile: Omit<PromptProfile, 'id' | 'name' | 'isDefault'>,
  tickers: Ticker[],
  dateStr: string
) {
  // Extract tickers
  const btcTicker = tickers.find((t) => t.symbol === "BTC") || {
    price: 64821,
    change24h: 3.4,
    volume: 45800000000,
  };
  const ethTicker = tickers.find((t) => t.symbol === "ETH") || {
    price: 3420.5,
    change24h: -1.15,
    volume: 21000000000,
  };
  const solTicker = tickers.find((t) => t.symbol === "SOL") || {
    price: 195.8,
    change24h: 8.4,
    volume: 18500000000,
  };
  const dogeTicker = tickers.find((t) => t.symbol === "DOGE") || {
    price: 0.385,
    change24h: 12.5,
    volume: 9500000000,
  };

  const getMarketCap = (symbol: string, price: number) => {
    if (symbol === "BTC") return `$${((price * 19.7e6) / 1e12).toFixed(2)}T`;
    if (symbol === "ETH") return `$${((price * 120e6) / 1e9).toFixed(1)}B`;
    if (symbol === "SOL") return `$${((price * 460e6) / 1e9).toFixed(1)}B`;
    if (symbol === "DOGE") return `$${((price * 144e9) / 1e9).toFixed(1)}B`;
    return `$${((price * 100e6) / 1e9).toFixed(1)}B`;
  };

  const formatVolume = (volNum: number) => {
    if (volNum >= 1e9) return `$${(volNum / 1e9).toFixed(1)}B`;
    if (volNum >= 1e6) return `$${(volNum / 1e6).toFixed(1)}M`;
    return `$${volNum.toLocaleString()}`;
  };

  // Determine market sentiment
  const avgChange =
    (btcTicker.change24h +
      ethTicker.change24h +
      solTicker.change24h +
      dogeTicker.change24h) /
    4;
  const marketSentiment =
    avgChange > 5
      ? "Strongly Bullish / High Volume Accumulation"
      : avgChange > 0
      ? "Moderately Bullish / Rotational Inflows"
      : avgChange > -5
      ? "Consolidating / Neutral Rangebound"
      : "Bearish / Market De-Risking";

  // Build dynamic article headline
  const topTicker = [...tickers].sort(
    (a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)
  )[0] || { symbol: "BTC", change24h: 3.4 };
  const actionWord = topTicker.change24h >= 0 ? "Leads Rally" : "Under Pressure";
  const btcVal = btcTicker.price;
  const direction = btcTicker.change24h >= 0 ? "Surges" : "Consolidates";
  const directionAdj =
    btcTicker.change24h >= 0 ? "Bullish Momentum" : "Cautionary Wave";
  const headline = `Crypto Market Pulse: BTC ${direction} at $${btcVal.toLocaleString()} as ${
    topTicker.symbol
  } ${actionWord} with ${directionAdj}`;

  const topCoinSymbol = topTicker.symbol || "BTC";

  // Compile individual coin analyses
  const compileCoinAnalysis = (coinSym: string, ticker: any) => {
    if (!profile.coinAnalysisPrompt) return `Analysis for ${coinSym}`;
    const priceStr = `$${ticker.price.toLocaleString("en-US", {
      minimumFractionDigits: ticker.symbol === "DOGE" ? 4 : 2,
    })}`;
    const changeStr = `${ticker.change24h >= 0 ? "+" : ""}${ticker.change24h.toFixed(
      2
    )}%`;
    const volStr = formatVolume(ticker.volume || 10000000);
    const capStr = getMarketCap(coinSym, ticker.price);
    const chartImg = `![${coinSym} Chart](/api/market/chart/${coinSym})`;

    const replaced = profile.coinAnalysisPrompt
      .replace(/{coin}/g, coinSym)
      .replace(/{price}/g, priceStr)
      .replace(/{change24h}/g, changeStr)
      .replace(/{volume}/g, volStr)
      .replace(/{market_cap}/g, capStr)
      .replace(/{chart_image}/g, chartImg);

    return `\n[INSTRUCTION: Generate the detailed market performance, technical analysis, and outlook for ${coinSym} based on current price ${priceStr}, change ${changeStr}, volume ${volStr}, and cap ${capStr} using these guidelines:\n${replaced}]\n`;
  };

  const btcSection = compileCoinAnalysis("BTC", btcTicker);
  const ethSection = compileCoinAnalysis("ETH", ethTicker);
  const solSection = compileCoinAnalysis("SOL", solTicker);
  const dogeSection = compileCoinAnalysis("DOGE", dogeTicker);

  // Compile conclusion section
  const conclusionText = `\n[INSTRUCTION: Generate the concluding paragraphs summarizing digital asset resilience, risk parameters, and macro events based on sentiment: ${marketSentiment} using these guidelines:\n${profile.conclusionPrompt || ""}]\n`
    .replace(/{today}/g, dateStr)
    .replace(/{market_sentiment}/g, marketSentiment);

  // Compile full structure with token replacements
  let compiledStructure = profile.articleTemplate || "";
  compiledStructure = compiledStructure.replace(/{today}/g, dateStr);
  
  // Replace {headline} in the skeleton with an INSTRUCTION block so the AI model knows it MUST dynamically generate a unique, captivating title!
  const headlineInstruction = `[INSTRUCTION: Generate a captivating, highly creative, unique, and professional financial headline. Do NOT use the static text 'Crypto Market Pulse' or 'Crypto Market Update' or repeat previous titles. It must be a completely fresh, engaging title summarizing today's specific market action: BTC is at $${btcVal.toLocaleString()} (${btcTicker.change24h >= 0 ? "+" : ""}${btcTicker.change24h.toFixed(2)}%), top coin is ${topCoinSymbol} (${topTicker.change24h >= 0 ? "+" : ""}${topTicker.change24h.toFixed(2)}%).]`;
  compiledStructure = compiledStructure.replace(/{headline}/g, headlineInstruction);
  compiledStructure = compiledStructure.replace(
    /{featured_image}/g,
    `![Crypto Market Featured Image](/api/market/featured-image?date=${encodeURIComponent(
      dateStr
    )})`
  );

  compiledStructure = compiledStructure.replace(
    /{btc_price}/g,
    `$${btcTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
  compiledStructure = compiledStructure.replace(
    /{eth_price}/g,
    `$${ethTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
  compiledStructure = compiledStructure.replace(
    /{sol_price}/g,
    `$${solTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  );
  compiledStructure = compiledStructure.replace(
    /{doge_price}/g,
    `$${dogeTicker.price.toLocaleString("en-US", { minimumFractionDigits: 4 })}`
  );

  compiledStructure = compiledStructure.replace(
    /{btc_change}/g,
    `${btcTicker.change24h >= 0 ? "+" : ""}${btcTicker.change24h.toFixed(2)}%`
  );
  compiledStructure = compiledStructure.replace(
    /{eth_change}/g,
    `${ethTicker.change24h >= 0 ? "+" : ""}${ethTicker.change24h.toFixed(2)}%`
  );
  compiledStructure = compiledStructure.replace(
    /{sol_change}/g,
    `${solTicker.change24h >= 0 ? "+" : ""}${solTicker.change24h.toFixed(2)}%`
  );
  compiledStructure = compiledStructure.replace(
    /{doge_change}/g,
    `${dogeTicker.change24h >= 0 ? "+" : ""}${dogeTicker.change24h.toFixed(2)}%`
  );

  compiledStructure = compiledStructure.replace(
    /{btc_chart}/g,
    `![BTC Candlestick Chart](/api/market/chart/BTC)`
  );
  compiledStructure = compiledStructure.replace(
    /{eth_chart}/g,
    `![ETH Candlestick Chart](/api/market/chart/ETH)`
  );
  compiledStructure = compiledStructure.replace(
    /{sol_chart}/g,
    `![SOL Candlestick Chart](/api/market/chart/SOL)`
  );
  compiledStructure = compiledStructure.replace(
    /{doge_chart}/g,
    `![DOGE Candlestick Chart](/api/market/chart/DOGE)`
  );

  compiledStructure = compiledStructure.replace(
    /{market_sentiment}/g,
    marketSentiment
  );
  compiledStructure = compiledStructure.replace(
    /{market_summary}/g,
    `\n[INSTRUCTION: Draft a professional market summary section capturing global digital asset flows, institutional ETF volumes, and macro technical closures. Highlight key momentum shifts and macro price action closures based on today's headline and sentiment: ${marketSentiment}.]\n`
  );

  compiledStructure = compiledStructure.replace(/{btc_section}/g, btcSection);
  compiledStructure = compiledStructure.replace(/{eth_section}/g, ethSection);
  compiledStructure = compiledStructure.replace(/{sol_section}/g, solSection);
  compiledStructure = compiledStructure.replace(/{doge_section}/g, dogeSection);
  compiledStructure = compiledStructure.replace(/{conclusion}/g, conclusionText);

  // Compile Image prompt (this must ONLY be sent to the image generation model)
  const compiledImagePrompt = (profile.imagePrompt || "")
    .replace(/{today}/g, dateStr)
    .replace(/{top_coin}/g, topCoinSymbol)
    .replace(/{market_sentiment}/g, marketSentiment);

  // --- DYNAMIC STYLE & TONE RANDOMIZATION ---
  const writingStyles = [
    {
      role: "Day Trader / Technical Chartist (منظور متداول يومي / محلل فني شارتات)",
      vocabulary: "technical chart analysis terms (e.g., liquidity pools, support breakout, resistance retest, order block absorption, volume profile clusters, EMA crossovers, RSI divergence, bullish momentum, local consolidation range)",
      structure: "punchy, direct, active-voice sentences, fast-paced transitions, and clear analytical urgency",
      focus: "immediate order book dynamics, support/resistance key barrier levels, price consolidation structures, and local trading indicators",
      greeting: "An energetic, trading-floor check-in greeting (e.g., 'Welcome back traders, let's dive straight into today's action...' or 'Hello traders, we have a fast-moving session to break down today...')"
    },
    {
      role: "Institutional Research Analyst (منظور باحث ومحلل مؤسساتي مالي)",
      vocabulary: "formal financial and institutional terms (e.g., capital reallocation, asset-class correlation, liquidity depth, macroeconomic catalysts, spot volume distribution, accumulation phase, risk-mitigation, moving averages)",
      structure: "formal, highly structured, analytical prose, objective and authoritative tone with elegant logical flow",
      focus: "ETF net inflows/outflows, institutional capital distribution, macroeconomic policy implications, and long-term moving support/resistance bands",
      greeting: "A highly professional, editorial briefing opener (e.g., 'Presenting today's comprehensive digital asset market synthesis...' or 'Good morning, welcome to today's institutional crypto market briefing...')"
    },
    {
      role: "On-Chain Forensic Expert (منظور خبير تحليل البيانات على السلسلة On-Chain)",
      vocabulary: "blockchain ledger and wallet metrics (e.g., whale wallet net-flows, exchange reserves depletion, active addresses growth, network hashrate, gas dynamics, realized market capitalization, old-coin distribution curves)",
      structure: "factual, investigative, data-driven style that directly connects price action with blockchain ledger movements",
      focus: "whale transaction transfers, exchange deposit/withdrawal trends, on-chain accumulation support clusters, and network security growth",
      greeting: "A data-first led analysis greeting (e.g., 'Analyzing today's public ledger records reveals significant capital movements...' or 'Welcome back to today's on-chain metrics update...')"
    },
    {
      role: "Macro Economic Strategist (منظور خبير استراتيجي اقتصادي كلي)",
      vocabulary: "global finance and macroeconomic factors (e.g., monetary policy decisions, inflation projections, interest rate cuts, yield curves, fiat currency debasement, global liquidity index, risk-on appetite shift)",
      structure: "high-level, big-picture narrative structure, framing cryptocurrency movements relative to traditional global asset flows",
      focus: "the correlation of crypto with the US Dollar Index (DXY), Federal Reserve expectations, traditional market sentiment, and long-term liquidity cycles",
      greeting: "A global market perspective opener (e.g., 'As traditional global markets digest the latest fiscal data, digital assets are charting a unique path...' or 'Greetings, today we analyze the crypto market landscape through a macro lens...')"
    },
    {
      role: "Conversational Crypto Blogger (منظور مدون كريبتو تفاعلي بسيط)",
      vocabulary: "accessible, modern, trend-driven terms (e.g., ecosystem catalysts, social buzz, retail enthusiasm, hype cycles, narrative rotation, community-driven spikes, key levels to watch)",
      structure: "friendly, highly engaging, conversational prose with occasional rhetorical questions and a lively, easy-to-read rhythm",
      focus: "social sentiment, upcoming developer launches, ecosystem growth, retail behavior, and the cultural narrative of crypto",
      greeting: "A warm, personal community greeting (e.g., 'Hey there crypto community, hope your day is going fantastic! Let's check out today's updates...' or 'Hello and welcome! Grab your coffee as we take a friendly tour of today's market...')"
    },
    {
      role: "Editorial Financial Journalist (منظور صحفي مالي مهني)",
      vocabulary: "journalistic, editorial, narrative-rich terms (e.g., market catalyst, main price driver, decisive trading session, pivotal levels, sentiment shift, overarching narrative)",
      structure: "balanced, informative, journalistic tone with engaging transitions and a cohesive narrative flow",
      focus: "the core catalysts behind today's price movements, public sentiment, and a balanced synthesis of bullish/bearish arguments",
      greeting: "A crisp, newsroom style opening (e.g., 'Our top digital asset story today focuses on a major structural shift...' or 'Reporting live on today's crucial cryptocurrency market changes...')"
    }
  ];

  // Select a style randomly to guarantee a completely new pattern on every generation
  const styleIndex = Math.floor(Math.random() * writingStyles.length);
  const chosenStyle = writingStyles[styleIndex];

  // System Instruction order: System Personality + AI Rules (Writing Rules)
  const systemInstruction = `${profile.systemPrompt}

CRITICAL DYNAMIC STYLE & TONE DIRECTIVE (منع تكرار الأسلوب الفني):
To prevent automated detection and ensure every article is completely unique, you MUST adopt the following specific writing profile for THIS article. Do NOT write in your default style:
- **Your Specific Role**: ${chosenStyle.role}
- **Required Vocabulary**: Incorporate a rich selection of ${chosenStyle.vocabulary}.
- **Sentence & Paragraph Structure**: Write using ${chosenStyle.structure}.
- **Primary Commentary Focus**: Focus your commentary and analysis heavily on ${chosenStyle.focus}.
- **Introductory Hook / Greeting**: Your introductory paragraph MUST start with ${chosenStyle.greeting} dynamically customized to today's context.

WRITING RULES & STYLE CONSTRAINTS:
${profile.writingRules}

CRITICAL TITLE GENERATION DIRECTIVE:
- You MUST generate a brand-new, unique, highly creative, and compelling article title/headline (starting with '# ').
- This headline MUST be dynamically tailored to today's specific price action and market events (e.g., '# Bitcoin's Ascent: BTC Eyes $98K as Solana Altseason Ignites').
- NEVER use a static, fixed, repetitive, or formulaic title. Every single article you generate MUST have a completely different and unique title.
- Do NOT use plain placeholders or copy titles from previous sessions.
- Your title should be engaging, professional, and directly reflect the specific coin dynamics of today's market feed.

CRITICAL DATA ACCURACY AND PRICING DIRECTIVE:
- You MUST use the exact real-time prices, 24-hour percentage changes, daily volumes, and market capitalizations provided in the specific section instructions for each coin (BTC, ETH, SOL, DOGE).
- You are STRICTLY FORBIDDEN from altering, modifying, approximating, or hallucinating different price values or market statistics.
- If the instruction says a coin's price is a certain amount, you must write exactly that amount whenever you mention its current price or stats in your generated text. NEVER invent, estimate, or assume different prices or numbers under any circumstance.
- Maintain absolute accuracy of numbers and pricing across all paragraphs.

CRITICAL ARCHITECTURAL DIRECTIVE (NO INSTRUCTION LEAKING):
- The Article Structure template contains blocks enclosed in '[INSTRUCTION: ...]'.
- These are instructions for you on what to write in those specific positions.
- You MUST COMPLETELY REPLACE each '[INSTRUCTION: ...]' block with your own actual high-quality, professional, data-driven financial writing.
- You must NEVER repeat, echo, or display the '[INSTRUCTION: ...]' tag or any of the instruction text inside the final generated article!
- Your output must consist ONLY of the finished article, with all instructions fully executed and replaced with professional content.`;

  // Article Prompt Body order: Article Structure (including coin analysis and conclusion prompts)
  const articlePromptBody = `Draft a cryptocurrency market update article adhering strictly to the structured sections requested below. Substitute any '[INSTRUCTION: ...]' blocks with high-quality, professional, data-driven financial journalism text. Do not output any chat introductory text or wrapping block labels like markdown code blocks. Output ONLY the raw markdown content of the article.

CRITICAL WARNING: Any '[INSTRUCTION: ...]' blocks must NEVER be displayed inside the final article. You must completely replace them with real generated content.

ARTICLE STRUCTURE AND PLACEMENT SECTIONS:
${compiledStructure}`;

  // Combined final article generation prompt
  const finalArticlePrompt = `SYSTEM INSTRUCTION / PERSONALITY:
${systemInstruction}

ARTICLE TEMPLATE AND SECTIONS REQUIRED:
${articlePromptBody}`;

  return {
    systemInstruction,
    articlePromptBody,
    finalArticlePrompt,
    compiledImagePrompt,
    headline,
    marketSentiment,
    btcSection,
    ethSection,
    solSection,
    dogeSection,
    conclusionText,
    compiledStructure,
  };
}
