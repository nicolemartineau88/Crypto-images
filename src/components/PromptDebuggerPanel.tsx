/**
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { compilePromptProfile, Ticker } from "../utils/promptBuilder";
import { Terminal, Copy, Check, Eye, Sliders, Sparkles, AlertCircle } from "lucide-react";

interface PromptDebuggerPanelProps {
  systemPrompt: string;
  articleTemplate: string;
  imagePrompt: string;
  coinAnalysisPrompt: string;
  conclusionPrompt: string;
  writingRules: string;
  tickers: Ticker[];
}

type DebugTab = "final" | "system" | "body" | "image" | "variables";

export function PromptDebuggerPanel({
  systemPrompt,
  articleTemplate,
  imagePrompt,
  coinAnalysisPrompt,
  conclusionPrompt,
  writingRules,
  tickers
}: PromptDebuggerPanelProps) {
  const [activeTab, setActiveTab] = useState<DebugTab>("final");
  const [copied, setCopied] = useState(false);

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const compiled = compilePromptProfile(
    {
      systemPrompt,
      articleTemplate,
      imagePrompt,
      coinAnalysisPrompt,
      conclusionPrompt,
      writingRules
    },
    tickers,
    dateStr
  );

  const btcTicker = tickers.find(t => t.symbol === "BTC") || { price: 64821, change24h: 3.4 };
  const ethTicker = tickers.find(t => t.symbol === "ETH") || { price: 3420.5, change24h: -1.15 };
  const solTicker = tickers.find(t => t.symbol === "SOL") || { price: 195.8, change24h: 8.4 };
  const dogeTicker = tickers.find(t => t.symbol === "DOGE") || { price: 0.385, change24h: 12.5 };

  const getMarketCap = (symbol: string, price: number) => {
    if (symbol === "BTC") return `$${((price * 19.7e6) / 1e12).toFixed(2)}T`;
    if (symbol === "ETH") return `$${((price * 120e6) / 1e9).toFixed(1)}B`;
    if (symbol === "SOL") return `$${((price * 460e6) / 1e9).toFixed(1)}B`;
    if (symbol === "DOGE") return `$${((price * 144e9) / 1e9).toFixed(1)}B`;
    return `$${((price * 100e6) / 1e9).toFixed(1)}B`;
  };

  const variablesList = [
    { key: "{today}", value: dateStr, desc: "Today's human-friendly date string" },
    { key: "{headline}", value: compiled.headline, desc: "Catchy, trend-driven, data-driven dynamic headline" },
    { key: "{featured_image}", value: `![Crypto Market Featured Image](/api/market/featured-image?date=${encodeURIComponent(dateStr)})`, desc: "Cover image markdown reference" },
    { key: "{btc_price}", value: `$${btcTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, desc: "Bitcoin real-time price snapshot" },
    { key: "{eth_price}", value: `$${ethTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, desc: "Ethereum real-time price snapshot" },
    { key: "{sol_price}", value: `$${solTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, desc: "Solana real-time price snapshot" },
    { key: "{doge_price}", value: `$${dogeTicker.price.toLocaleString("en-US", { minimumFractionDigits: 4 })}`, desc: "Dogecoin real-time price snapshot" },
    { key: "{market_sentiment}", value: compiled.marketSentiment, desc: "Automated overall market index" },
    { key: "{market_summary}", value: "Draft a professional market summary section...", desc: "Placeholder replaced by custom-generated overview instructions" },
    { key: "{btc_chart}", value: "![BTC Candlestick Chart](/api/market/chart/BTC)", desc: "Inline chart image element for BTC" },
    { key: "{eth_chart}", value: "![ETH Candlestick Chart](/api/market/chart/ETH)", desc: "Inline chart image element for ETH" },
    { key: "{sol_chart}", value: "![SOL Candlestick Chart](/api/market/chart/SOL)", desc: "Inline chart image element for SOL" },
    { key: "{doge_chart}", value: "![DOGE Candlestick Chart](/api/market/chart/DOGE)", desc: "Inline chart image element for DOGE" }
  ];

  let displayContent = "";
  switch (activeTab) {
    case "final":
      displayContent = compiled.finalArticlePrompt;
      break;
    case "system":
      displayContent = compiled.systemInstruction;
      break;
    case "body":
      displayContent = compiled.articlePromptBody;
      break;
    case "image":
      displayContent = compiled.compiledImagePrompt;
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131316] border border-white/5 rounded-xl overflow-hidden shadow-xl mt-6">
      {/* Panel Header */}
      <div className="p-4 bg-[#18181D]/80 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25">
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <span>AI Prompt Debugger &amp; Live Compiler</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase font-bold tracking-normal">
                Active Source of Truth
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Verifying exact text strings sent to LLMs</p>
          </div>
        </div>

        {activeTab !== "variables" && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Current View</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#141418] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("final")}
          className={`px-4 py-2 text-[10.5px] font-bold uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "final"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Combined Final Prompt
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 text-[10.5px] font-bold uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "system"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          System Instruction
        </button>
        <button
          onClick={() => setActiveTab("body")}
          className={`px-4 py-2 text-[10.5px] font-bold uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "body"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Article Prompt Body
        </button>
        <button
          onClick={() => setActiveTab("image")}
          className={`px-4 py-2 text-[10.5px] font-bold uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "image"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Cover Image Prompt
        </button>
        <button
          onClick={() => setActiveTab("variables")}
          className={`px-4 py-2 text-[10.5px] font-bold uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "variables"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Active Variables &amp; Live Values
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4 bg-[#0A0A0C]">
        {activeTab === "variables" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 pb-2 pl-2">
              <div className="col-span-3">Placeholder Key</div>
              <div className="col-span-6">Current Compiled Value</div>
              <div className="col-span-3">Description</div>
            </div>
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {variablesList.map(v => (
                <div
                  key={v.key}
                  className="grid grid-cols-12 gap-3 text-[11px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-lg p-2 items-center"
                >
                  <div className="col-span-3 font-mono font-bold text-blue-400">{v.key}</div>
                  <div className="col-span-6 font-mono text-slate-200 break-all select-all">{v.value}</div>
                  <div className="col-span-3 text-slate-400 font-medium">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            {activeTab === "image" && (
              <div className="mb-3 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-start gap-2 text-[10px] text-yellow-400 leading-normal font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Constraint Check:</strong> This cover image prompt is strictly separated from the article content generation prompt and is ONLY routed to the active image render pipelines to guarantee architectural precision.
                </span>
              </div>
            )}
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[350px] overflow-y-auto select-all whitespace-pre-wrap scrollbar-thin">
              {displayContent || (
                <span className="text-slate-500 italic">This field is empty inside the current profile.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
