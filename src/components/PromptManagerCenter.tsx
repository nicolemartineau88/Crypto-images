import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  Trash2,
  Copy,
  Plus,
  Play,
  RotateCcw,
  Search,
  Check,
  AlertTriangle,
  Download,
  Upload,
  Undo2,
  Redo2,
  Sparkles,
  Layers,
  FileCheck,
  History,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  Settings,
  X,
  Edit2
} from "lucide-react";

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
  versions: PromptVersion[];
}

export interface PromptVersion {
  id: string;
  timestamp: number;
  label: string;
  systemPrompt: string;
  articleTemplate: string;
  imagePrompt: string;
  coinAnalysisPrompt: string;
  conclusionPrompt: string;
  writingRules: string;
}

interface PromptManagerCenterProps {
  onApplyPrompt: (profile: PromptProfile) => void;
  tickers: any[];
}

export const DEFAULT_PROFILES: PromptProfile[] = [
  {
    id: "daily-market-update",
    name: "Robert Stanberry (Crypto Market Update)",
    isDefault: true,
    systemPrompt: "You are Robert Stanberry, a highly respected independent digital asset market analyst and crypto writer. Your writing style is objective, direct, highly readable, and trader-centric, with a friendly yet professional and analytical tone. You specialize in daily crypto market updates. Your articles begin with a brief friendly greeting to readers, followed by a succinct overview of broader market sentiment, and then a clean breakdown of each major coin (Bitcoin, Ethereum, Solana, and Dogecoin) with precise bullet-point technical indicators (Daily Range, Support, Resistance, Immediate Trend, and RSI momentum). You avoid sensationalism or fluff, focusing on institutional flows, key levels, and price consolidation structures.",
    articleTemplate: `# Crypto Market Update: {headline}\n\n{featured_image}\n\n{market_summary}\n\n---\n\n## Coin Analysis\n\n{btc_section}\n\n{eth_section}\n\n{sol_section}\n\n{doge_section}\n\n---\n\n## Market Sentiment Checklist\n- **Overall Trend**: {market_sentiment}\n- **Top Performer Today**: {top_coin}\n- **BTC Consolidation Level**: {btc_price}\n- **ETH Staying Power**: {eth_price}\n\n---\n\n{conclusion}`,
    imagePrompt: "A high-impact, split-composition cinematic crypto banner. On the left: a fiery, glowing orange-red volcanic atmosphere with dramatic candlestick charts in the background, featuring a large, meticulously detailed 3D gold physical Bitcoin (BTC) coin, displaying a glowing red rounded panel with high-contrast text 'BTC -1.4%' and '95,458 USDT'. On the right: a cool, deep blue lightning storm sky with glowing blue candlesticks, featuring a large, meticulously detailed 3D physical silver Ethereum (ETH) coin, displaying a glowing blue rounded panel with high-contrast text 'ETH -1.87%' and '3,303 USDT'. Across the top, there is giant, bold 3D text in shiny gold/yellow reading 'CRYPTO', and bold metallic white text reading 'MARKET UPDATE'. At the bottom center, a circular gauge labeled 'FEAR & GREED INDEX' with a dial pointing to '50' over a vibrant red-orange-yellow-green spectrum. The entire scene is in ultra-high definition, cinematic lighting, epic color contrast (orange vs blue), and professional trading dashboard aesthetic.",
    coinAnalysisPrompt: "### {coin} Update\n\nWrite a highly structured 2-3 paragraph breakdown of {coin}'s recent action at **{price}** ({change24h} in 24h). Focus on daily price structures, spot buyer absorption, ETF inflows or liquidations, and current momentum. Avoid any intro greetings or placeholders.\n\n{chart_image}\n\n#### Technical Key Levels & Indicators\n- **Daily Range**: Approximate current range based on {price} (e.g., $94,200 - $96,800 for BTC)\n- **Key Support**: Primary immediate floor level\n- **Key Resistance**: Immediate ceiling barrier\n- **Immediate Trend / Sentiment**: Short trend description (e.g., Consolidation / Moderate Bullish)\n- **RSI & Momentum**: Current RSI estimate and momentum description based on 24h change of {change24h}",
    conclusionPrompt: "Write a brief, objective 2-paragraph wrap-up of today's digital asset actions. Highlight upcoming macroeconomic catalysts, trade setups to watch, and encourage readers with a friendly, professional sign-off typical of Robert Stanberry: \"Trade safely, manage your risks, and have an excellent day!\" or \"Stay patient, keep an eye on key levels, and see you in the next update!\". Do NOT use any heading like 'Conclusion' or 'Summary'. Continue naturally to the end.",
    writingRules: "1. The article MUST begin with a professional yet welcoming introductory greeting to readers (e.g., \"Good morning/day readers, today we are looking at...\" or \"Welcome back to today's crypto market update...\").\n2. Write in a clear, concise, objective, and trader-focused manner. Do not exceed 1000 words; keep it highly readable and dense with technical levels.\n3. Every coin section MUST include the \"Technical Key Levels & Indicators\" bullet-point block precisely. Fill out the exact levels based on the live prices.\n4. Generate a completely dynamic, creative, and unique title/headline for today's market action. Prefix the main title with \"Crypto Market Update: \" followed by your generated title (e.g., \"Crypto Market Update: BTC holds $95k, ETH stays above $3.3k as momentum slows\" or \"Crypto Market Update: Solana leads altcoin breakout as Bitcoin eyes $98k\"). Never use static formulaic headlines.\n5. Never output instructions, placeholders, or template text. Every section must be fully completed.",
    versions: []
  },
  {
    id: "weekly-report",
    name: "Weekly Macro Report",
    isDefault: false,
    systemPrompt: "You are a Chief Investment Officer and macro economist specializing in digital asset frameworks.",
    articleTemplate: `# Macro Digital Asset Weekly — {today}\n\n{featured_image}\n\n## Weekly Outlook\n{market_summary}\n\n### Core Assets Analysis\n{btc_section}\n\n{eth_section}\n\n{sol_section}\n\n## Executive Summary\n{conclusion}`,
    imagePrompt: "An abstract architectural rendering of decentralized blocks scaling upwards in absolute clarity, warm gold and deep titanium tones.",
    coinAnalysisPrompt: "Evaluate {coin} at {price} on weekly moving averages. Focus on high-timeframe support holding.",
    conclusionPrompt: "Deliver an institutional outlook on overall liquidity flows and high-probability scenarios.",
    writingRules: "1. Focus heavily on weekly structural closures.\n2. Keep a deeply analytical and objective tone.",
    versions: []
  },
  {
    id: "bitcoin-only",
    name: "Bitcoin Only Focus",
    isDefault: false,
    systemPrompt: "You are a Bitcoin Maximalist and on-chain intelligence analyst.",
    articleTemplate: `# The Orange Pill Report — {today}\n\n{featured_image}\n\n## On-Chain Overview\n{market_summary}\n\n## Bitcoin Performance\n{btc_chart}\n{btc_section}\n\n## Closing Thoughts\n{conclusion}`,
    imagePrompt: "A golden physical Bitcoin coin emerging from a dark digital liquid crystal background, with high-contrast sharp detailing.",
    coinAnalysisPrompt: "Provide on-chain matrix updates for Bitcoin trading at {price}.",
    conclusionPrompt: "Wrap up with comments on sovereign adoption, difficulty ribbons, and mining hash rate updates.",
    writingRules: "1. Mention only Bitcoin and absolute sovereignty.\n2. Keep on-chain metrics accurate.",
    versions: []
  }
];

export const STABLE_VARIABLES = [
  { key: "{today}", desc: "Today's dynamic human-friendly date", category: "Global" },
  { key: "{featured_image}", desc: "Renders the AI generated cover banner image", category: "Global" },
  { key: "{market_sentiment}", desc: "Real-time market sentiment status index", category: "Global" },
  { key: "{market_summary}", desc: "AI generated overview of overall market actions", category: "Global" },
  { key: "{conclusion}", desc: "AI generated dynamic conclusion section", category: "Global" },
  { key: "{btc_chart}", desc: "Embeds BTC Candlestick PNG Image", category: "Charts" },
  { key: "{eth_chart}", desc: "Embeds ETH Candlestick PNG Image", category: "Charts" },
  { key: "{sol_chart}", desc: "Embeds SOL Candlestick PNG Image", category: "Charts" },
  { key: "{doge_chart}", desc: "Embeds DOGE Candlestick PNG Image", category: "Charts" },
  { key: "{btc_price}", desc: "Latest BTC price in USD", category: "Prices" },
  { key: "{eth_price}", desc: "Latest ETH price in USD", category: "Prices" },
  { key: "{sol_price}", desc: "Latest SOL price in USD", category: "Prices" },
  { key: "{doge_price}", desc: "Latest DOGE price in USD", category: "Prices" },
  { key: "{btc_change}", desc: "Latest BTC 24h percentage change", category: "Prices" },
  { key: "{eth_change}", desc: "Latest ETH 24h percentage change", category: "Prices" },
  { key: "{sol_change}", desc: "Latest SOL 24h percentage change", category: "Prices" },
  { key: "{doge_change}", desc: "Latest DOGE 24h percentage change", category: "Prices" },
  { key: "{coin}", desc: "The current coin symbol (BTC, ETH, etc.)", category: "Coin Specific" },
  { key: "{price}", desc: "Current coin's exact price", category: "Coin Specific" },
  { key: "{change24h}", desc: "Current coin's 24H percentage change", category: "Coin Specific" },
  { key: "{volume}", desc: "Current coin's daily volume", category: "Coin Specific" },
  { key: "{market_cap}", desc: "Current coin's market capitalization", category: "Coin Specific" },
  { key: "{chart_image}", desc: "Reference code for current coin's chart image", category: "Coin Specific" },
  { key: "{headline}", desc: "Article dynamic headline", category: "Global" },
  { key: "{top_coin}", desc: "Top performing coin today", category: "Global" }
];

export function PromptManagerCenter({ onApplyPrompt, tickers }: PromptManagerCenterProps) {
  // Profiles state loading from localStorage or fallback
  const [profiles, setProfiles] = useState<PromptProfile[]>(() => {
    const saved = localStorage.getItem("ai_prompt_profiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Detect and auto-upgrade any stale default profile to Robert Stanberry's Crypto Market Update style with dynamic titles
          const updated = parsed.map((p: PromptProfile) => {
            if (p.id === "daily-market-update" && (!p.name.includes("Robert Stanberry") || p.systemPrompt.includes("elite, highly professional cryptocurrency financial analyst") || !p.imagePrompt.includes("split-composition") || !p.writingRules.includes("dynamic, creative, and unique title"))) {
              return {
                ...p,
                name: "Robert Stanberry (Crypto Market Update)",
                systemPrompt: "You are Robert Stanberry, a highly respected independent digital asset market analyst and crypto writer. Your writing style is objective, direct, highly readable, and trader-centric, with a friendly yet professional and analytical tone. You specialize in daily crypto market updates. Your articles begin with a brief friendly greeting to readers, followed by a succinct overview of broader market sentiment, and then a clean breakdown of each major coin (Bitcoin, Ethereum, Solana, and Dogecoin) with precise bullet-point technical indicators (Daily Range, Support, Resistance, Immediate Trend, and RSI momentum). You avoid sensationalism or fluff, focusing on institutional flows, key levels, and price consolidation structures.",
                articleTemplate: `# Crypto Market Update: {headline}\n\n{featured_image}\n\n{market_summary}\n\n---\n\n## Coin Analysis\n\n{btc_section}\n\n{eth_section}\n\n{sol_section}\n\n{doge_section}\n\n---\n\n## Market Sentiment Checklist\n- **Overall Trend**: {market_sentiment}\n- **Top Performer Today**: {top_coin}\n- **BTC Consolidation Level**: {btc_price}\n- **ETH Staying Power**: {eth_price}\n\n---\n\n{conclusion}`,
                imagePrompt: "A high-impact, split-composition cinematic crypto banner. On the left: a fiery, glowing orange-red volcanic atmosphere with dramatic candlestick charts in the background, featuring a large, meticulously detailed 3D gold physical Bitcoin (BTC) coin, displaying a glowing red rounded panel with high-contrast text 'BTC -1.4%' and '95,458 USDT'. On the right: a cool, deep blue lightning storm sky with glowing blue candlesticks, featuring a large, meticulously detailed 3D physical silver Ethereum (ETH) coin, displaying a glowing blue rounded panel with high-contrast text 'ETH -1.87%' and '3,303 USDT'. Across the top, there is giant, bold 3D text in shiny gold/yellow reading 'CRYPTO', and bold metallic white text reading 'MARKET UPDATE'. At the bottom center, a circular gauge labeled 'FEAR & GREED INDEX' with a dial pointing to '50' over a vibrant red-orange-yellow-green spectrum. The entire scene is in ultra-high definition, cinematic lighting, epic color contrast (orange vs blue), and professional trading dashboard aesthetic.",
                coinAnalysisPrompt: "### {coin} Update\n\nWrite a highly structured 2-3 paragraph breakdown of {coin}'s recent action at **{price}** ({change24h} in 24h). Focus on daily price structures, spot buyer absorption, ETF inflows or liquidations, and current momentum. Avoid any intro greetings or placeholders.\n\n{chart_image}\n\n#### Technical Key Levels & Indicators\n- **Daily Range**: Approximate current range based on {price} (e.g., $94,200 - $96,800 for BTC)\n- **Key Support**: Primary immediate floor level\n- **Key Resistance**: Immediate ceiling barrier\n- **Immediate Trend / Sentiment**: Short trend description (e.g., Consolidation / Moderate Bullish)\n- **RSI & Momentum**: Current RSI estimate and momentum description based on 24h change of {change24h}",
                conclusionPrompt: "Write a brief, objective 2-paragraph wrap-up of today's digital asset actions. Highlight upcoming macroeconomic catalysts, trade setups to watch, and encourage readers with a friendly, professional sign-off typical of Robert Stanberry: \"Trade safely, manage your risks, and have an excellent day!\" or \"Stay patient, keep an eye on key levels, and see you in the next update!\". Do NOT use any heading like 'Conclusion' or 'Summary'. Continue naturally to the end.",
                writingRules: "1. The article MUST begin with a professional yet welcoming introductory greeting to readers (e.g., \"Good morning/day readers, today we are looking at...\" or \"Welcome back to today's crypto market update...\").\n2. Write in a clear, concise, objective, and trader-focused manner. Do not exceed 1000 words; keep it highly readable and dense with technical levels.\n3. Every coin section MUST include the \"Technical Key Levels & Indicators\" bullet-point block precisely. Fill out the exact levels based on the live prices.\n4. Generate a completely dynamic, creative, and unique title/headline for today's market action. Prefix the main title with \"Crypto Market Update: \" followed by your generated title (e.g., \"Crypto Market Update: BTC holds $95k, ETH stays above $3.3k as momentum slows\" or \"Crypto Market Update: Solana leads altcoin breakout as Bitcoin eyes $98k\"). Never use static formulaic headlines.\n5. Never output instructions, placeholders, or template text. Every section must be fully completed."
              };
            }
            return p;
          });
          
          if (JSON.stringify(updated) !== JSON.stringify(parsed)) {
            localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
          }
          return updated;
        }
      } catch (e) {
        console.error("Failed to parse prompt profiles, loading defaults", e);
      }
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const savedDefault = localStorage.getItem("ai_active_profile_id");
    if (savedDefault) return savedDefault;
    return "daily-market-update";
  });

  // Current working variables of the active editor
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Separate prompt editors
  const [systemPrompt, setSystemPrompt] = useState(activeProfile.systemPrompt);
  const [articleTemplate, setArticleTemplate] = useState(activeProfile.articleTemplate);
  const [imagePrompt, setImagePrompt] = useState(activeProfile.imagePrompt);
  const [coinAnalysisPrompt, setCoinAnalysisPrompt] = useState(activeProfile.coinAnalysisPrompt);
  const [conclusionPrompt, setConclusionPrompt] = useState(activeProfile.conclusionPrompt);
  const [writingRules, setWritingRules] = useState(activeProfile.writingRules);

  const [activeSection, setActiveSection] = useState<string>("system"); // 'system', 'article', 'image', 'coin', 'conclusion', 'rules'
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved Changes">("Saved");
  const [varSearch, setVarSearch] = useState("");

  // Validation warnings
  const [warnings, setWarnings] = useState<{ field: string; message: string; severity: "warning" | "error" }[]>([]);
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);

  const visibleAllWarnings = warnings.filter(w => !dismissedWarnings.includes(w.message));
  const visibleSectionWarnings = warnings.filter(w => w.field === activeSection && !dismissedWarnings.includes(w.message));

  // Version Comparison modal state
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [compareLeftVersion, setCompareLeftVersion] = useState<string>("");
  const [compareRightVersion, setCompareRightVersion] = useState<string>("");

  // Editor full screen
  const [fullScreenEditor, setFullScreenEditor] = useState<string | null>(null);

  // Undo / Redo stacks
  const [historyStacks, setHistoryStacks] = useState<Record<string, { past: string[]; future: string[] }>>({
    system: { past: [], future: [] },
    article: { past: [], future: [] },
    image: { past: [], future: [] },
    coin: { past: [], future: [] },
    conclusion: { past: [], future: [] },
    rules: { past: [], future: [] }
  });

  // Active Profile rename state
  const [isRenamingProfile, setIsRenamingProfile] = useState(false);
  const [profileRenameValue, setProfileRenameValue] = useState("");

  // References for inserting variables
  const textareasRef = {
    system: useRef<HTMLTextAreaElement>(null),
    article: useRef<HTMLTextAreaElement>(null),
    image: useRef<HTMLTextAreaElement>(null),
    coin: useRef<HTMLTextAreaElement>(null),
    conclusion: useRef<HTMLTextAreaElement>(null),
    rules: useRef<HTMLTextAreaElement>(null)
  };

  // Test prompt modal
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [compiledPromptPreview, setCompiledPromptPreview] = useState("");

  // Modal state for creating a new profile
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileOption, setNewProfileOption] = useState<"current" | "default">("current");

  // Effect to update field values when active profile switches
  useEffect(() => {
    if (activeProfile) {
      setSystemPrompt(activeProfile.systemPrompt);
      setArticleTemplate(activeProfile.articleTemplate);
      setImagePrompt(activeProfile.imagePrompt);
      setCoinAnalysisPrompt(activeProfile.coinAnalysisPrompt);
      setConclusionPrompt(activeProfile.conclusionPrompt);
      setWritingRules(activeProfile.writingRules);
      setSaveStatus("Saved");
      localStorage.setItem("ai_active_profile_id", activeProfile.id);

      // Trigger apply callback immediately on switch
      onApplyPrompt(activeProfile);

      // Reset history stacks
      setHistoryStacks({
        system: { past: [], future: [] },
        article: { past: [], future: [] },
        image: { past: [], future: [] },
        coin: { past: [], future: [] },
        conclusion: { past: [], future: [] },
        rules: { past: [], future: [] }
      });
    }
  }, [activeProfileId]);

  // Handle value change & register undo action
  const handleFieldChange = (field: string, newValue: string) => {
    setSaveStatus("Unsaved Changes");
    
    // Register Undo
    const prevValue = getFieldValue(field);
    const stack = historyStacks[field];
    const newPast = [...stack.past, prevValue].slice(-50); // cap at 50 levels
    setHistoryStacks(prev => ({
      ...prev,
      [field]: { past: newPast, future: [] }
    }));

    // Update specific field state
    switch (field) {
      case "system": setSystemPrompt(newValue); break;
      case "article": setArticleTemplate(newValue); break;
      case "image": setImagePrompt(newValue); break;
      case "coin": setCoinAnalysisPrompt(newValue); break;
      case "conclusion": setConclusionPrompt(newValue); break;
      case "rules": setWritingRules(newValue); break;
    }
  };

  const getFieldValue = (field: string) => {
    switch (field) {
      case "system": return systemPrompt;
      case "article": return articleTemplate;
      case "image": return imagePrompt;
      case "coin": return coinAnalysisPrompt;
      case "conclusion": return conclusionPrompt;
      case "rules": return writingRules;
      default: return "";
    }
  };

  // Trigger Undo
  const triggerUndo = (field: string) => {
    const stack = historyStacks[field];
    if (stack.past.length === 0) return;

    const currentVal = getFieldValue(field);
    const prevVal = stack.past[stack.past.length - 1];
    const newPast = stack.past.slice(0, -1);
    const newFuture = [currentVal, ...stack.future];

    setHistoryStacks(prev => ({
      ...prev,
      [field]: { past: newPast, future: newFuture }
    }));

    // apply value
    applyFieldValue(field, prevVal);
  };

  // Trigger Redo
  const triggerRedo = (field: string) => {
    const stack = historyStacks[field];
    if (stack.future.length === 0) return;

    const currentVal = getFieldValue(field);
    const nextVal = stack.future[0];
    const newPast = [...stack.past, currentVal];
    const newFuture = stack.future.slice(1);

    setHistoryStacks(prev => ({
      ...prev,
      [field]: { past: newPast, future: newFuture }
    }));

    // apply value
    applyFieldValue(field, nextVal);
  };

  const applyFieldValue = (field: string, val: string) => {
    switch (field) {
      case "system": setSystemPrompt(val); break;
      case "article": setArticleTemplate(val); break;
      case "image": setImagePrompt(val); break;
      case "coin": setCoinAnalysisPrompt(val); break;
      case "conclusion": setConclusionPrompt(val); break;
      case "rules": setWritingRules(val); break;
    }
    setSaveStatus("Unsaved Changes");
  };

  // Validate Prompts
  const validateCurrentPrompts = () => {
    const newWarnings: typeof warnings = [];
    
    // Check missing braces or mismatch placeholders
    const detectBraces = (str: string) => {
      const match = str.match(/\{[^}]+\}/g) || [];
      return match.map(m => m.toLowerCase());
    };

    // 1. Article Template checks
    const articlePls = detectBraces(articleTemplate);
    if (!articlePls.includes("{today}") && !articlePls.includes("{date}")) {
      newWarnings.push({ field: "article", message: "Missing chronological variable {today} or {date} in article structure.", severity: "warning" });
    }
    if (!articlePls.includes("{featured_image}")) {
      newWarnings.push({ field: "article", message: "Featured cover image {featured_image} placeholder is missing.", severity: "warning" });
    }
    if (!articlePls.includes("{market_summary}")) {
      newWarnings.push({ field: "article", message: "Market aggregate introduction placeholder {market_summary} is missing.", severity: "warning" });
    }

    // 2. Image template checks
    const imagePls = detectBraces(imagePrompt);
    const invalidImagePls = imagePls.filter(p => !["{today}", "{headline}", "{market_sentiment}", "{top_coin}"].includes(p));
    if (invalidImagePls.length > 0) {
      newWarnings.push({ field: "image", message: `Image prompt contains unsupported variables: ${invalidImagePls.join(", ")}`, severity: "error" });
    }

    // 3. Coin analysis checks
    const coinPls = detectBraces(coinAnalysisPrompt);
    const invalidCoinPls = coinPls.filter(p => !["{coin}", "{price}", "{change24h}", "{volume}", "{market_cap}", "{ohlcv}", "{chart_image}"].includes(p));
    if (invalidCoinPls.length > 0) {
      newWarnings.push({ field: "coin", message: `Coin Analysis prompt contains unsupported variables: ${invalidCoinPls.join(", ")}`, severity: "error" });
    }

    // 4. Check for unclosed braces across all editors
    const checkUnclosedBraces = (str: string, fieldName: string) => {
      let open = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === "{") open++;
        if (str[i] === "}") {
          open--;
          if (open < 0) {
            newWarnings.push({ field: fieldName, message: "Syntactically incorrect curly braces (unmatched closing brace '}')", severity: "error" });
            return;
          }
        }
      }
      if (open > 0) {
        newWarnings.push({ field: fieldName, message: "Syntactically incorrect curly braces (unmatched opening brace '{')", severity: "error" });
      }
    };

    checkUnclosedBraces(systemPrompt, "system");
    checkUnclosedBraces(articleTemplate, "article");
    checkUnclosedBraces(imagePrompt, "image");
    checkUnclosedBraces(coinAnalysisPrompt, "coin");
    checkUnclosedBraces(conclusionPrompt, "conclusion");
    checkUnclosedBraces(writingRules, "rules");

    setWarnings(newWarnings);
  };

  // Run validation when templates edit
  useEffect(() => {
    validateCurrentPrompts();
  }, [systemPrompt, articleTemplate, imagePrompt, coinAnalysisPrompt, conclusionPrompt, writingRules]);

  // Auto-Save Effect (debounce 3 seconds)
  useEffect(() => {
    if (saveStatus !== "Unsaved Changes") return;

    const timer = setTimeout(() => {
      saveActiveProfile();
    }, 2500);

    return () => clearTimeout(timer);
  }, [systemPrompt, articleTemplate, imagePrompt, coinAnalysisPrompt, conclusionPrompt, writingRules, saveStatus]);

  // Save changes to Active Profile
  const saveActiveProfile = (customVersionLabel?: string) => {
    setSaveStatus("Saving...");
    
    setProfiles(prev => {
      const updated = prev.map(p => {
        if (p.id === activeProfileId) {
          // Keep version history
          const newVersion: PromptVersion = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            label: customVersionLabel || `v${p.versions.length + 1} Auto-saved`,
            systemPrompt: systemPrompt,
            articleTemplate: articleTemplate,
            imagePrompt: imagePrompt,
            coinAnalysisPrompt: coinAnalysisPrompt,
            conclusionPrompt: conclusionPrompt,
            writingRules: writingRules
          };

          const limitedVersions = [newVersion, ...p.versions].slice(0, 30); // Store last 30 versions

          const updatedProf = {
            ...p,
            systemPrompt,
            articleTemplate,
            imagePrompt,
            coinAnalysisPrompt,
            conclusionPrompt,
            writingRules,
            versions: limitedVersions
          };

          // Apply immediately to the app workflow via callback
          if (p.isDefault || p.id === activeProfileId) {
            onApplyPrompt(updatedProf);
          }

          return updatedProf;
        }
        return p;
      });

      localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
      return updated;
    });

    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  };

  // Helper to create a new profile
  const handleCreateProfile = () => {
    setNewProfileName("");
    setNewProfileOption("current");
    setShowCreateProfileModal(true);
  };

  const submitCreateProfile = () => {
    if (!newProfileName.trim()) return;

    const name = newProfileName.trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);

    let templateSource = DEFAULT_PROFILES[0];
    if (newProfileOption === "current" && activeProfile) {
      templateSource = activeProfile;
    }

    const newProfile: PromptProfile = {
      id,
      name,
      isDefault: false,
      systemPrompt: templateSource.systemPrompt,
      articleTemplate: templateSource.articleTemplate,
      imagePrompt: templateSource.imagePrompt,
      coinAnalysisPrompt: templateSource.coinAnalysisPrompt,
      conclusionPrompt: templateSource.conclusionPrompt,
      writingRules: templateSource.writingRules,
      versions: []
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(id);
    localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));

    // Ensure it is immediately applied to the app workflow
    onApplyPrompt(newProfile);

    // Close modal
    setShowCreateProfileModal(false);
    setNewProfileName("");
  };

  // Set Profile as Default
  const handleSetDefaultProfile = (id: string) => {
    const updated = profiles.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    setProfiles(updated);
    localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
    
    const activeOne = updated.find(p => p.id === id);
    if (activeOne) {
      onApplyPrompt(activeOne);
    }
  };

  // Duplicate active profile
  const handleDuplicateProfile = () => {
    const duplicated: PromptProfile = {
      ...activeProfile,
      id: `${activeProfile.id}-copy-${Date.now().toString().slice(-4)}`,
      name: `${activeProfile.name} (Copy)`,
      isDefault: false,
      versions: []
    };

    const updated = [...profiles, duplicated];
    setProfiles(updated);
    setActiveProfileId(duplicated.id);
    localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert("Cannot delete the last remaining prompt profile.");
      return;
    }
    if (!confirm("Are you sure you want to delete this profile?")) return;

    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));

    if (activeProfileId === id) {
      setActiveProfileId(updated[0].id);
    }
  };

  // Rename Profile action
  const startRenameProfile = () => {
    setProfileRenameValue(activeProfile.name);
    setIsRenamingProfile(true);
  };

  const saveProfileRename = () => {
    if (!profileRenameValue.trim()) return;
    const updated = profiles.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, name: profileRenameValue.trim() };
      }
      return p;
    });
    setProfiles(updated);
    setIsRenamingProfile(false);
    localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
  };

  // Insert variable in current focused field
  const handleInsertVariable = (variableKey: string) => {
    const ref = textareasRef[activeSection as keyof typeof textareasRef];
    if (!ref || !ref.current) return;

    const textarea = ref.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const updatedVal = before + variableKey + after;
    handleFieldChange(activeSection, updatedVal);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variableKey.length;
    }, 50);
  };

  // Compile and Test Prompt Simulator
  const handleCompileTestPrompt = () => {
    // Generate simulated values
    const topCoinTicker = [...tickers].sort((a, b) => b.change24h - a.change24h)[0] || { symbol: "BTC", price: 64821.00, change24h: 3.4 };
    
    const simValues: Record<string, string> = {
      "{today}": new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      "{date}": new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      "{featured_image}": "![Crypto Market Featured Banner](/api/market/featured-image)",
      "{market_sentiment}": "Highly Optimistic (Greed Index: 76/100, guided by massive layer-1 gas accumulation and BTC structural expansion)",
      "{market_summary}": "Asset values accelerated on high Spot volume, backed by high ETF inflows and on-chain activities.",
      "{top_coin}": topCoinTicker.symbol,
      "{headline}": `Bitcoin Leads Charge to New Cycle Peaks as Solana Activity Soars`,
      "{btc_chart}": "![BTC Candle Chart](/api/market/chart/BTC)",
      "{eth_chart}": "![ETH Candle Chart](/api/market/chart/ETH)",
      "{sol_chart}": "![SOL Candle Chart](/api/market/chart/SOL)",
      "{doge_chart}": "![DOGE Candle Chart](/api/market/chart/DOGE)",
      "{btc_price}": "$64,821.00",
      "{eth_price}": "$3,420.50",
      "{sol_price}": "$195.80",
      "{doge_price}": "$0.3850"
    };

    // Build unified test prompt structured for Gemini
    let system = `SYSTEM INSTRUCTION / PERSONALITY:\n${systemPrompt}\n\n`;
    system += `PERMANENT WRITING RULES:\n${writingRules}\n\n`;

    // Simulate Coin Specific replacement
    const compileCoinSection = (coinSym: string, coinPrice: string, coinChg: string, vol: string, cap: string) => {
      let templ = coinAnalysisPrompt;
      templ = templ.replace(/{coin}/g, coinSym);
      templ = templ.replace(/{price}/g, coinPrice);
      templ = templ.replace(/{change24h}/g, coinChg);
      templ = templ.replace(/{volume}/g, vol);
      templ = templ.replace(/{market_cap}/g, cap);
      templ = templ.replace(/{chart_image}/g, `![${coinSym} Chart](/api/market/chart/${coinSym})`);
      return templ;
    };

    const btcSec = compileCoinSection("BTC", "$64,821.00", "+3.40%", "$45.8B", "$1.27T");
    const ethSec = compileCoinSection("ETH", "$3,420.50", "-1.15%", "$21.0B", "$411.2B");
    const solSec = compileCoinSection("SOL", "$195.80", "+8.40%", "$18.5B", "$89.5B");
    const dogeSec = compileCoinSection("DOGE", "$0.3850", "+12.50%", "$9.5B", "$54.2B");

    let conclusionText = conclusionPrompt;
    conclusionText = conclusionText.replace(/{today}/g, simValues["{today}"]);
    conclusionText = conclusionText.replace(/{market_sentiment}/g, simValues["{market_sentiment}"]);

    let finalArticle = articleTemplate;
    // Replace globals
    Object.entries(simValues).forEach(([k, v]) => {
      finalArticle = finalArticle.split(k).join(v);
    });

    // Replace structured block injections
    finalArticle = finalArticle.split("{btc_section}").join(btcSec);
    finalArticle = finalArticle.split("{eth_section}").join(ethSec);
    finalArticle = finalArticle.split("{sol_section}").join(solSec);
    finalArticle = finalArticle.split("{doge_section}").join(dogeSec);
    finalArticle = finalArticle.split("{conclusion}").join(conclusionText);

    const compiledText = `[GEMINI SYSTEM PROMPT]\n${system}\n[GEMINI USER REQUEST / CORE TEMPLATE ASSEMBLY]\n${finalArticle}\n\n[FEATURED COVER IMAGE DESIGN SPECIFICATION]\n${imagePrompt.replace(/{today}/g, simValues["{today}"]).replace(/{headline}/g, simValues["{headline}"]).replace(/{top_coin}/g, simValues["{top_coin}"]).replace(/{market_sentiment}/g, simValues["{market_sentiment}"])}`;

    setCompiledPromptPreview(compiledText);
    setShowTestPrompt(true);
  };

  // Restore specific version
  const handleRestoreVersion = (ver: PromptVersion) => {
    setSystemPrompt(ver.systemPrompt);
    setArticleTemplate(ver.articleTemplate);
    setImagePrompt(ver.imagePrompt);
    setCoinAnalysisPrompt(ver.coinAnalysisPrompt);
    setConclusionPrompt(ver.conclusionPrompt);
    setWritingRules(ver.writingRules);
    setSaveStatus("Unsaved Changes");
    setShowVersionHistory(false);
  };

  // Export current profile as JSON
  const handleExportProfileJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProfile, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${activeProfile.name.toLowerCase().replace(/\s+/g, "_")}_prompt_profile.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Export current profile as Markdown
  const handleExportProfileMarkdown = () => {
    const content = `
# AI Prompt Profile: ${activeProfile.name}

## 1. System Personality Prompt
\`\`\`text
${systemPrompt}
\`\`\`

## 2. Article Structure Template
\`\`\`markdown
${articleTemplate}
\`\`\`

## 3. Cover Image Design Prompt
\`\`\`text
${imagePrompt}
\`\`\`

## 4. Cryptocurrency Coin Analysis Prompt
\`\`\`text
${coinAnalysisPrompt}
\`\`\`

## 5. Article Conclusion Prompt
\`\`\`text
${conclusionPrompt}
\`\`\`

## 6. AI Writing Rules
\`\`\`text
${writingRules}
\`\`\`
    `;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content.trim());
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${activeProfile.name.toLowerCase().replace(/\s+/g, "_")}_prompts.md`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Export Bundle
  const handleExportBundle = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "blurt_all_prompt_profiles_bundle.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Import profile from file
  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const imported = JSON.parse(text);

        if (Array.isArray(imported)) {
          // It's a bundle
          setProfiles(imported);
          setActiveProfileId(imported[0].id);
          localStorage.setItem("ai_prompt_profiles", JSON.stringify(imported));
          alert(`Successfully imported ${imported.length} prompt profiles!`);
        } else if (imported.name && imported.systemPrompt) {
          // Single profile
          const id = `imported-${Date.now()}`;
          const newProf: PromptProfile = {
            id,
            name: imported.name + " (Imported)",
            isDefault: false,
            systemPrompt: imported.systemPrompt || "",
            articleTemplate: imported.articleTemplate || "",
            imagePrompt: imported.imagePrompt || "",
            coinAnalysisPrompt: imported.coinAnalysisPrompt || "",
            conclusionPrompt: imported.conclusionPrompt || "",
            writingRules: imported.writingRules || "",
            versions: []
          };
          const updated = [...profiles, newProf];
          setProfiles(updated);
          setActiveProfileId(id);
          localStorage.setItem("ai_prompt_profiles", JSON.stringify(updated));
          alert(`Successfully imported prompt profile: "${newProf.name}"`);
        } else {
          alert("Invalid file structure. Make sure you load a valid JSON Prompt Profile.");
        }
      } catch (err) {
        alert("Failed to parse the file. Please ensure it is valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Count words and chars
  const getCounts = (str: string) => {
    const chars = str.length;
    const words = str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
    return { chars, words };
  };

  const getLineCount = (str: string) => {
    return str.split("\n").length;
  };

  // Search filtered fields
  const getSearchMatchIndices = (text: string, query: string) => {
    if (!query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  return (
    <div className="bg-[#0C0C0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[680px]" id="prompt-management-center">
      {/* HEADER CONTROLS bar */}
      <div className="px-6 py-4 bg-[#111115] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/10 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>AI Prompt Management Center</span>
              <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full uppercase">Professional IDE</span>
            </h2>
            <p className="text-xs text-slate-400">Manage real-time system behaviors, cover configurations, and structure models</p>
          </div>
        </div>

        {/* Profiles Selector and quick actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isRenamingProfile ? (
            <div className="flex items-center gap-1.5 bg-[#16161C] p-1 rounded-lg border border-white/10">
              <input
                type="text"
                value={profileRenameValue}
                onChange={e => setProfileRenameValue(e.target.value)}
                className="bg-transparent text-xs text-white outline-none px-2 py-1 w-40"
              />
              <button onClick={saveProfileRename} className="p-1 text-emerald-400 hover:bg-white/5 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsRenamingProfile(false)} className="p-1 text-rose-400 hover:bg-white/5 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative flex items-center gap-1">
              <span className="text-xs text-slate-400 font-mono font-bold mr-1">Active Profile:</span>
              <select
                value={activeProfileId}
                onChange={e => setActiveProfileId(e.target.value)}
                className="bg-[#16161C] border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer min-w-[170px]"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isDefault ? "★ (Default)" : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={startRenameProfile}
                title="Rename active profile"
                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 cursor-pointer transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-[#16161C] p-1 rounded-lg border border-white/5">
            <button
              onClick={handleCreateProfile}
              title="Create new Profile"
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Profile</span>
            </button>
            <button
              onClick={handleDuplicateProfile}
              title="Duplicate Profile"
              className="p-1.5 hover:bg-white/5 text-slate-300 rounded cursor-pointer transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!activeProfile.isDefault && (
              <button
                onClick={() => handleSetDefaultProfile(activeProfileId)}
                title="Set as Default Profile"
                className="p-1.5 hover:bg-white/5 text-yellow-400 rounded cursor-pointer transition-all text-[11px] font-bold flex items-center gap-1"
              >
                Set Default
              </button>
            )}
            <button
              onClick={() => handleDeleteProfile(activeProfileId)}
              title="Delete Profile"
              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATUS BAR - Auto save indicator & file import/export */}
      <div className="px-6 py-2.5 bg-[#0e0e12] border-b border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${saveStatus === "Saved" ? "bg-emerald-500" : saveStatus === "Saving..." ? "bg-yellow-500 animate-bounce" : "bg-rose-500 animate-pulse"}`} />
            <span className="font-mono text-[11px] text-slate-300">
              {saveStatus === "Saved" ? "Saved to Profile" : saveStatus === "Saving..." ? "Saving changes..." : "Unsaved Changes"}
            </span>
          </div>

          {/* Validation Indicators */}
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <FileCheck className={`w-3.5 h-3.5 ${visibleAllWarnings.length === 0 ? "text-emerald-400" : visibleAllWarnings.some(w => w.severity === "error") ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span className="text-[11px] font-medium text-slate-400">
              {visibleAllWarnings.length === 0 ? "Prompt status optimal" : `${visibleAllWarnings.length} Validation issues found`}
            </span>
            {dismissedWarnings.length > 0 && (
              <button 
                onClick={() => setDismissedWarnings([])} 
                className="ml-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer border border-blue-500/20 px-1.5 py-0.5 rounded bg-blue-500/5 transition-all"
                title="Restore all dismissed warnings"
              >
                Restore {dismissedWarnings.length} Dismissed
              </button>
            )}
          </div>
        </div>

        {/* Global actions: Search, Import/Export */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search across all prompts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md py-1 pl-8 pr-2.5 w-44 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 text-slate-500 hover:text-white">
                ✕
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Import / Export Menu */}
          <div className="flex items-center gap-1 bg-[#16161C] p-1 rounded-md border border-white/5">
            <button
              onClick={handleExportProfileJSON}
              title="Export Profile as JSON"
              className="p-1 hover:bg-white/5 text-slate-300 rounded cursor-pointer transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handleExportProfileMarkdown}
              title="Export Prompts as MD file"
              className="p-1 hover:bg-white/5 text-slate-300 rounded cursor-pointer transition-all flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">MD</span>
            </button>
            <button
              onClick={handleExportBundle}
              title="Export Bundle (All Profiles)"
              className="p-1 hover:bg-white/5 text-blue-400 rounded cursor-pointer transition-all flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">All Bundle</span>
            </button>
            
            <label className="p-1 hover:bg-white/5 text-slate-300 rounded cursor-pointer transition-all flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportProfile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* CORE SPLIT WORKSPACE: Editors vs Variables panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Collapsible Sidebar Tabs & Editors (9 cols) */}
        <div className="lg:col-span-8 flex flex-col border-r border-white/5 bg-[#09090C] overflow-y-auto">
          {/* Section Selector Tab list */}
          <div className="flex items-center border-b border-white/5 bg-[#111114] overflow-x-auto scrollbar-none">
            {[
              { id: "system", label: "1. System Personality", field: systemPrompt },
              { id: "article", label: "2. Article Structure", field: articleTemplate },
              { id: "image", label: "3. Cover Image Design", field: imagePrompt },
              { id: "coin", label: "4. Coin Analysis", field: coinAnalysisPrompt },
              { id: "conclusion", label: "5. Ending Summary", field: conclusionPrompt },
              { id: "rules", label: "6. Permanent Writing Rules", field: writingRules }
            ].map(sec => {
              const count = getCounts(sec.field);
              const hasSearchMatch = searchQuery && getSearchMatchIndices(sec.field, searchQuery);
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeSection === sec.id
                      ? "border-blue-500 text-white bg-blue-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  } ${hasSearchMatch ? "bg-amber-500/5 text-amber-300" : ""}`}
                >
                  <span>{sec.label}</span>
                  <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md font-mono text-slate-500 font-medium">
                    {count.words}w
                  </span>
                  {hasSearchMatch && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE SECTION EDITOR VIEW AREA */}
          <div className="p-6 flex-1 flex flex-col space-y-4">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {activeSection === "system" && "SYSTEM INSTRUCTION"}
                  {activeSection === "article" && "ARTICLE STRUCTURE MARKDOWN"}
                  {activeSection === "image" && "FEATURED IMAGE SPECIFICATION"}
                  {activeSection === "coin" && "COIN ANALYSIS SPECIFICATION"}
                  {activeSection === "conclusion" && "OUTRO CONCLUSION PARAGRAPH"}
                  {activeSection === "rules" && "PERMANENT AI COMPLIANCE RULES"}
                </span>
                
                {/* Preset Options for System Prompt personality */}
                {activeSection === "system" && (
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleFieldChange("system", e.target.value);
                      }
                    }}
                    className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-blue-400 font-bold outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0C0C0F]">Change Personality Preset...</option>
                    <option value="You are an elite cryptocurrency financial analyst and senior journalist writing for Blurt.blog." className="bg-[#0C0C0F]">Crypto Financial Journalist</option>
                    <option value="You are a Senior Crypto Market Analyst focusing on quantitative support, momentum cycles, and order book clusters." className="bg-[#0C0C0F]">Senior Market Analyst</option>
                    <option value="You are a Technical Analyst who evaluates chart structures, indicators, MACD, and on-chain whale activity." className="bg-[#0C0C0F]">Technical Analyst</option>
                    <option value="You are an objective News Reporter dedicated to reporting daily high-volume spot action and exchange events." className="bg-[#0C0C0F]">News Reporter</option>
                    <option value="You are an educational Crypto Writer. Your articles explain concepts, charts, and terms in a fun and relatable way." className="bg-[#0C0C0F]">Educational Writer</option>
                  </select>
                )}
              </div>

              {/* Undo Redo & Action Triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={historyStacks[activeSection]?.past.length === 0}
                  onClick={() => triggerUndo(activeSection)}
                  title="Undo (Ctrl+Z)"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  disabled={historyStacks[activeSection]?.future.length === 0}
                  onClick={() => triggerRedo(activeSection)}
                  title="Redo (Ctrl+Y)"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <button
                  onClick={() => setFullScreenEditor(fullScreenEditor === activeSection ? null : activeSection)}
                  title={fullScreenEditor === activeSection ? "Minimize Screen" : "Maximize Screen"}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  {fullScreenEditor === activeSection ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className={`relative rounded-xl border border-white/10 bg-[#07070A] overflow-hidden flex flex-col ${fullScreenEditor ? "fixed inset-10 z-50 shadow-2xl bg-[#09090C] border-white/20 p-4" : "h-[260px] resize-y"}`}>
              {fullScreenEditor && (
                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                  <span className="text-xs font-bold text-slate-300">Fullscreen Editor - {activeSection}</span>
                  <button onClick={() => setFullScreenEditor(null)} className="text-slate-400 hover:text-white">✕ Close</button>
                </div>
              )}
              <div className="flex-1 flex overflow-hidden">
                {/* Line numbers pane */}
                <div className="w-11 bg-white/[0.02] border-r border-white/5 flex flex-col items-center py-3 select-none text-slate-600 font-mono text-[10px] leading-relaxed">
                  {Array.from({ length: getLineCount(getFieldValue(activeSection)) }).map((_, i) => (
                    <span key={i} className="block w-full text-center leading-relaxed h-[1.5rem]">{i + 1}</span>
                  ))}
                </div>
                
                {/* Textarea */}
                <textarea
                  ref={textareasRef[activeSection as keyof typeof textareasRef]}
                  value={getFieldValue(activeSection)}
                  onChange={e => handleFieldChange(activeSection, e.target.value)}
                  placeholder={`Write the instructions for your ${activeSection} here...`}
                  className="flex-1 bg-transparent p-3 outline-none border-none text-slate-200 font-mono text-xs leading-relaxed resize-none overflow-y-auto h-full min-h-[150px]"
                  style={{ lineHeight: "1.5rem" }}
                />
              </div>

              {/* Counts footer bar */}
              <div className="px-3.5 py-1.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div>UTF-8</div>
                <div className="flex items-center gap-2">
                  <span>Lines: {getLineCount(getFieldValue(activeSection))}</span>
                  <span>Words: {getCounts(getFieldValue(activeSection)).words}</span>
                  <span>Chars: {getCounts(getFieldValue(activeSection)).chars}</span>
                </div>
              </div>
            </div>

            {/* Warnings list specific to active prompt with Dismiss/Dismiss All support */}
            {visibleSectionWarnings.length > 0 && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Validation Issues ({visibleSectionWarnings.length})</span>
                  <button
                    onClick={() => setDismissedWarnings(prev => [...prev, ...visibleSectionWarnings.map(w => w.message)])}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-none border-none p-0"
                  >
                    Dismiss All
                  </button>
                </div>
                
                {visibleSectionWarnings.map((w, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-start justify-between gap-2.5 text-xs ${w.severity === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-amber-500/5 border-amber-500/10 text-amber-300"}`}>
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold mr-1">{w.severity === "error" ? "ERROR:" : "WARNING:"}</span>
                        <span>{w.message}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissedWarnings(prev => [...prev, w.message])}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
                      title="Dismiss warning"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save/Test action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => saveActiveProfile("Manual Commit")}
                className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Commit &amp; Save Profile</span>
              </button>

              <button
                onClick={handleCompileTestPrompt}
                className="px-4.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compile &amp; Test Prompt</span>
              </button>

              <button
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-blue-400" />
                <span>Version History ({activeProfile.versions.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Searchable Variables List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#08080A]">
          <div className="p-4 bg-[#111114] border-b border-white/5">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-1 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Supported Variables Helper</span>
            </h3>
            <p className="text-[11px] text-slate-500">Clicking an option automatically inserts it at your active editor's cursor position.</p>
          </div>

          {/* Variable search box */}
          <div className="p-3 bg-white/[0.01] border-b border-white/5">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search placeholders..."
                value={varSearch}
                onChange={e => setVarSearch(e.target.value)}
                className="w-full bg-[#111114] border border-white/10 rounded-md py-1 pl-7 pr-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Variables list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
            {["Global", "Charts", "Prices", "Coin Specific"].map(category => {
              const varsInCategory = STABLE_VARIABLES.filter(v => v.category === category && (v.key.toLowerCase().includes(varSearch.toLowerCase()) || v.desc.toLowerCase().includes(varSearch.toLowerCase())));
              if (varsInCategory.length === 0) return null;
              
              return (
                <div key={category} className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-mono pl-1">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {varsInCategory.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleInsertVariable(item.key)}
                        className="w-full bg-[#111114] hover:bg-[#16161C] border border-white/5 hover:border-white/10 rounded-lg p-2 flex items-start text-left transition-all gap-2 group cursor-pointer"
                      >
                        <span className="text-[11px] font-mono font-bold text-blue-400 group-hover:text-blue-300 bg-blue-500/5 group-hover:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">
                          {item.key}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 flex-1">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* VERSION HISTORY MODAL VIEW */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowVersionHistory(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <History className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Version Control Panel</h3>
                <p className="text-xs text-slate-400">Restore or audit historic states saved automatically</p>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {activeProfile.versions.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono text-center py-8">No revision history found for this profile yet. Commits are created automatically.</div>
              ) : (
                activeProfile.versions.map((ver, idx) => (
                  <div key={ver.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{ver.label}</span>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full font-mono">
                          {idx === 0 ? "Latest Working State" : `Rev ${activeProfile.versions.length - idx}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Date: {new Date(ver.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] cursor-pointer"
                      >
                        Restore State
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPILATION PREVIEW TEST MODAL */}
      {showTestPrompt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111114] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowTestPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-50"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <Play className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Live AI Prompt Test &amp; Sandbox Simulator</h3>
                <p className="text-xs text-slate-400">Exact payload representation compiled using current live cryptocurrency parameters</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#07070A] rounded-xl border border-white/5 p-4 relative min-h-[250px]">
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#111114] border border-white/5 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                <span>Payload Generated Successfully</span>
              </div>
              <pre className="text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap pr-4 select-all">
                {compiledPromptPreview}
              </pre>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-1">
              * This is a read-only sandboxed compilation mimicking exactly how Gemini receives instruction schemas to prevent redundant outputs or hallucinations on Blurt.blog.
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PROFILE MODAL */}
      {showCreateProfileModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowCreateProfileModal(false);
                setNewProfileName("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Create New Prompt Profile</h3>
                <p className="text-xs text-slate-400">Add a custom template configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-bold">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Technical Focus"
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="w-full bg-[#16161C] border border-white/10 rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-bold">Initialize From</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProfileOption("current")}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex flex-col justify-between transition-all cursor-pointer ${
                      newProfileOption === "current"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-[#16161C] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                    }`}
                  >
                    <span>Clone Current</span>
                    <span className="text-[9px] opacity-70 mt-1 font-normal block truncate">Copy settings from "{activeProfile.name}"</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewProfileOption("default")}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex flex-col justify-between transition-all cursor-pointer ${
                      newProfileOption === "default"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-[#16161C] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                    }`}
                  >
                    <span>Blank/Standard</span>
                    <span className="text-[9px] opacity-70 mt-1 font-normal block">Start with default templates</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setShowCreateProfileModal(false);
                  setNewProfileName("");
                }}
                className="px-4 py-2 hover:bg-white/5 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreateProfile}
                disabled={!newProfileName.trim()}
                className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-blue-600/10"
              >
                Create & Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
