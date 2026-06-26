import React, { useState } from "react";
import { OpenedWebsite } from "../types";
import { ExternalLink, Terminal, Globe, Cpu, Sparkles, Server, ArrowUpRight, Zap, Play, Trash2, CheckCircle2, XCircle, Plus, X, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WebsiteLogsProps {
  logs: OpenedWebsite[];
  onAddLog: (log: OpenedWebsite) => void;
  onClearLogs: () => void;
  assistantName?: string;
}

export default function WebsiteLogs({ logs, onAddLog, onClearLogs, assistantName = "Zoya" }: WebsiteLogsProps) {
  const [filter, setFilter] = useState<"all" | "open" | "close">("all");
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Presets for easy simulation testing
  const presets = [
    { siteName: "Google", url: "https://www.google.com" },
    { siteName: "YouTube", url: "https://www.youtube.com" },
    { siteName: "GitHub", url: "https://github.com" },
    { siteName: "Wikipedia", url: "https://wikipedia.org" },
  ];

  // Derive stats
  const openedLogs = logs.filter((l) => l.action === "open");
  const closedLogs = logs.filter((l) => l.action === "close");

  // Keep track of which sites are currently active (opened and not yet closed)
  // We can compute this dynamically by iterating through the logs in chronological order (or reverse)
  const getActiveSites = () => {
    const active = new Set<string>();
    // Iterate from oldest (end of array) to newest (start of array)
    const reversedLogs = [...logs].reverse();
    reversedLogs.forEach((log) => {
      if (log.action === "open") {
        active.add(log.siteName.toLowerCase());
      } else if (log.action === "close") {
        active.delete(log.siteName.toLowerCase());
      }
    });
    return active;
  };

  const activeSites = getActiveSites();

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.action === filter;
  });

  const handleSimulateOpen = (name: string, url: string) => {
    onAddLog({
      siteName: name || "Custom Site",
      url: url || "https://example.com",
      timestamp: new Date(),
      action: "open",
    });
    // Try to open it in a new window/tab in the browser as well
    try {
      window.open(url || "https://example.com", "_blank");
    } catch (e) {
      console.warn("Popup blocked by browser during simulation");
    }
  };

  const handleSimulateClose = (name: string) => {
    onAddLog({
      siteName: name || "Custom Site",
      url: "",
      timestamp: new Date(),
      action: "close",
    });
  };

  return (
    <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative select-none">
      {/* Grid Overlay Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-45" />
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* macOS-style Terminal Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)] block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.5)] block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)] block" />
          </div>
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="text-[11px] font-black tracking-[0.2em] uppercase font-mono text-cyan-400">
            BROWSER ACTIONS TRACKER
          </h4>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">ACTIVE_MONITOR</span>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2 mb-4 p-2.5 bg-slate-900/60 border border-slate-800/60 rounded-xl font-mono text-[10px]">
        <div className="flex flex-col gap-0.5 px-1">
          <span className="text-slate-500 text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full block" /> TOTAL OPENED
          </span>
          <span className="text-cyan-400 font-black text-xs">{openedLogs.length}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-x border-slate-800/80 px-2.5 justify-center">
          <span className="text-slate-500 text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full block" /> TOTAL CLOSED
          </span>
          <span className="text-pink-400 font-black text-xs">{closedLogs.length}</span>
        </div>
        <div className="flex flex-col gap-0.5 px-1 items-end justify-center">
          <span className="text-slate-500 text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full block animate-pulse" /> CURRENT ACTIVE
          </span>
          <span className="text-amber-400 font-black text-xs">{activeSites.size}</span>
        </div>
      </div>

      {/* Simulator / Test Controls */}
      <div className="relative z-10 mb-4 p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
        <div className="flex items-center gap-1.5 mb-2.5 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/50 pb-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Actions Simulator</span>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => {
              const isActive = activeSites.has(p.siteName.toLowerCase());
              return (
                <div key={p.siteName} className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1.5 gap-2 text-[10px] font-mono">
                  <span className="font-bold text-slate-300">{p.siteName}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSimulateOpen(p.siteName, p.url)}
                      className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/40 hover:border-cyan-500 text-cyan-400 rounded-md font-extrabold text-[8px] uppercase transition-all"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleSimulateClose(p.siteName)}
                      className="px-2 py-0.5 bg-pink-950/70 hover:bg-pink-950 border border-pink-900/40 hover:border-pink-500 text-pink-400 rounded-md font-extrabold text-[8px] uppercase transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 pt-1.5 items-center">
            <input
              type="text"
              placeholder="Site Name (e.g. ChatGPT)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="sm:col-span-4 bg-slate-950/85 border border-slate-800 text-slate-200 text-[10px] font-mono p-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="https://chatgpt.com"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="sm:col-span-5 bg-slate-950/85 border border-slate-800 text-slate-200 text-[10px] font-mono p-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
            <div className="sm:col-span-3 flex gap-1">
              <button
                onClick={() => {
                  if (!customName) return;
                  handleSimulateOpen(customName, customUrl || "https://example.com");
                  setCustomName("");
                  setCustomUrl("");
                }}
                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-0.5 shadow-md shadow-cyan-500/10"
              >
                <Plus className="w-2.5 h-2.5 stroke-[3]" /> Open
              </button>
              <button
                onClick={() => {
                  if (!customName) return;
                  handleSimulateClose(customName);
                  setCustomName("");
                  setCustomUrl("");
                }}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-0.5 shadow-md"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" /> Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Filters and Clear actions */}
      <div className="relative z-10 flex items-center justify-between mb-3 bg-slate-900/20 p-1.5 border border-slate-800/40 rounded-xl">
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all ${
              filter === "all"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all ${
              filter === "open"
                ? "bg-cyan-950/80 text-cyan-400 border border-cyan-800/50"
                : "text-slate-500 hover:text-cyan-400/80"
            }`}
          >
            Opened
          </button>
          <button
            onClick={() => setFilter("close")}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all ${
              filter === "close"
                ? "bg-pink-950/80 text-pink-400 border border-pink-900/50"
                : "text-slate-500 hover:text-pink-400/80"
            }`}
          >
            Closed
          </button>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[8.5px] font-mono text-pink-500/80 hover:text-pink-400 font-extrabold uppercase transition-all bg-pink-950/10 px-2 py-1 rounded-lg hover:bg-pink-950/20"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        )}
      </div>

      {/* Main logs display queue */}
      <div className="relative z-10">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-800/40 rounded-2xl bg-slate-950/40 flex flex-col items-center justify-center gap-2">
            <Server className="w-6 h-6 text-slate-700 animate-pulse" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider font-extrabold">
                No logs recorded
              </span>
              <p className="text-[9.5px] text-slate-650 mt-1 font-mono max-w-[270px] mx-auto leading-relaxed">
                Use the simulation panel above or ask your AI companion: <br />
                <span className="text-cyan-400/80 font-bold">"Hey {assistantName}, open YouTube for me!"</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log, index) => {
                const isOpen = log.action === "open";
                const absoluteIndex = logs.indexOf(log);
                const isCurrentlyActive = isOpen && activeSites.has(log.siteName.toLowerCase());

                return (
                  <motion.div
                    key={log.timestamp.toString() + index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col gap-2 p-3.5 bg-slate-900/30 border rounded-2xl hover:bg-slate-900/50 transition-all duration-200 ${
                      isOpen
                        ? "border-cyan-950 hover:border-cyan-500/40"
                        : "border-pink-950 hover:border-pink-500/40"
                    }`}
                  >
                    {/* Micro-Header */}
                    <div className="flex items-center justify-between text-[8px] font-mono border-b border-slate-800/40 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`${isOpen ? "text-cyan-500" : "text-pink-500"} font-bold`}>
                          ENTRY_ID: #{1000 + absoluteIndex}
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className={`font-black flex items-center gap-1 uppercase ${
                          isOpen ? "text-cyan-400" : "text-pink-400"
                        }`}>
                          {isOpen ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" /> Action: Open
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2.5 h-2.5 text-pink-400" /> Action: Close
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-slate-500 font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Content Row */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex-shrink-0 p-2 rounded-xl border ${
                          isOpen 
                            ? "bg-cyan-950/60 border-cyan-800/30 text-cyan-400" 
                            : "bg-pink-950/60 border-pink-900/30 text-pink-400"
                        }`}>
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-500">zoya@client:~$</span>
                            <h5 className="font-extrabold text-xs text-slate-150 truncate tracking-wide">
                              {log.siteName}
                            </h5>
                          </div>
                          {isOpen ? (
                            <p className="text-[10px] text-cyan-400 font-mono truncate max-w-[200px] mt-0.5 font-bold">
                              {log.url}
                            </p>
                          ) : (
                            <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                              Session connection terminated
                            </p>
                          )}
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Visit Link */}
                          <a
                            id={`action-url-${index}`}
                            href={log.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 hover:border-cyan-500 px-2.5 py-1.5 rounded-xl text-[8.5px] uppercase font-mono font-black tracking-wider transition-all"
                          >
                            VISIT <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>

                          {/* Close control directly inline */}
                          {isCurrentlyActive && (
                            <button
                              onClick={() => handleSimulateClose(log.siteName)}
                              title="Register Close Event"
                              className="p-1.5 bg-pink-500/10 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/30 hover:border-pink-500 rounded-xl transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[8.5px] font-mono text-slate-600 bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-lg uppercase tracking-wider font-extrabold">
                          Inactive
                        </div>
                      )}
                    </div>

                    {/* Diagnostic details */}
                    <div className="flex items-center gap-2 mt-0.5 text-[8.5px] font-mono text-slate-500">
                      <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">HTTP/2_SECURE</span>
                      {isOpen ? (
                        <>
                          <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-purple-400 font-semibold">METHOD: GET</span>
                          {isCurrentlyActive ? (
                            <span className="bg-emerald-950 border border-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                              <span className="w-1 h-1 bg-emerald-400 rounded-full" /> ACTIVE_TAB
                            </span>
                          ) : (
                            <span className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-slate-600 font-normal">
                              HISTORIC_LOG
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-pink-400 font-semibold">METHOD: TERM</span>
                          <span className="bg-pink-950/30 border border-pink-950 px-1.5 py-0.5 rounded text-pink-400 font-bold">
                            CLOSED
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
