import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AssistantState, OpenedWebsite, ZoyaNotification } from "./types";
import ZoyaOrb from "./components/ZoyaOrb";
import WebsiteLogs from "./components/WebsiteLogs";
import PersonalitySheet from "./components/PersonalitySheet";
import { 
  Heart, 
  Flame, 
  HelpCircle, 
  ExternalLink,
  MessageCircleOff,
  AlertTriangle,
  Github,
  Moon,
  Sun,
  Zap,
  Sparkles,
  Paperclip,
  Navigation,
  Globe,
  Settings,
  Shield,
  Activity,
  Maximize2,
  X,
  SlidersHorizontal,
  Mic,
  Volume2,
  RefreshCw,
  Trash2,
  Bell,
  History,
  Palette,
  Check,
  Play,
  Star,
  Power,
  User,
  Languages,
  Image,
  Calendar,
  Clock,
  Edit,
  Mail,
  Phone,
  MapPin,
  Camera
} from "lucide-react";

// Convert float32 array to 16-bit PCM little-endian, then encode to Base64
function float32ToPCM16Base64(floats: Float32Array): string {
  const buffer = new ArrayBuffer(floats.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < floats.length; i++) {
    const s = Math.max(-1, Math.min(1, floats[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(i * 2, int16, true); // true for little-endian
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit integer PCM array to float32
function base64ToPCMFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

export const THEME_STYLES = {
  cosmic: {
    bg: "bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-slate-50 text-slate-800 selection:bg-cyan-100 selection:text-cyan-800",
    textAccent: "text-amber-500",
    borderAccent: "border-slate-200/80",
    glowColor: "rgba(168,85,247,0.08)",
    highlight: "from-indigo-500 to-purple-600",
    hoverHighlight: "hover:from-indigo-400 hover:to-purple-500",
    cardBg: "bg-white/90 border border-slate-200/80 shadow-[0_8px_30px_rgba(148,163,184,0.04)]",
    cardInner: "bg-slate-50/80 border border-slate-200/60",
    btnPrimary: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/10",
  },
  cyberpunk: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-black to-black text-slate-200 selection:bg-yellow-400 selection:text-slate-950",
    textAccent: "text-yellow-400",
    borderAccent: "border-cyan-500/25",
    glowColor: "rgba(6,182,212,0.12)",
    highlight: "from-cyan-500 to-blue-600",
    hoverHighlight: "hover:from-cyan-400 hover:to-blue-500",
    cardBg: "bg-neutral-950/95 border border-cyan-500/25 shadow-[0_8px_30px_rgba(6,182,212,0.04)]",
    cardInner: "bg-black border border-cyan-500/15",
    btnPrimary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/15 font-black",
  },
  emerald: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-black to-black text-zinc-100 selection:bg-emerald-400 selection:text-zinc-950",
    textAccent: "text-emerald-400",
    borderAccent: "border-emerald-500/25",
    glowColor: "rgba(16,185,129,0.12)",
    highlight: "from-emerald-500 to-teal-600",
    hoverHighlight: "hover:from-emerald-400 hover:to-teal-500",
    cardBg: "bg-neutral-950/95 border border-emerald-500/25 shadow-[0_8px_30px_rgba(16,185,129,0.04)]",
    cardInner: "bg-black border border-emerald-500/15",
    btnPrimary: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/15 font-black",
  },
  amber: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-black to-black text-stone-100 selection:bg-amber-400 selection:text-stone-950",
    textAccent: "text-amber-400",
    borderAccent: "border-amber-500/25",
    glowColor: "rgba(245,158,11,0.12)",
    highlight: "from-amber-500 to-orange-600",
    hoverHighlight: "hover:from-amber-400 hover:to-orange-500",
    cardBg: "bg-neutral-950/95 border border-amber-500/25 shadow-[0_8px_30px_rgba(245,158,11,0.04)]",
    cardInner: "bg-black border border-amber-500/15",
    btnPrimary: "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/15 font-black",
  },
  "neon-pink": {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/30 via-black to-black text-slate-100 selection:bg-pink-500 selection:text-white",
    textAccent: "text-pink-500",
    borderAccent: "border-pink-500/25",
    glowColor: "rgba(236,72,153,0.12)",
    highlight: "from-pink-500 to-rose-600",
    hoverHighlight: "hover:from-pink-400 hover:to-rose-500",
    cardBg: "bg-neutral-950/95 border border-pink-500/25 shadow-[0_8px_30px_rgba(236,72,153,0.04)]",
    cardInner: "bg-black border border-pink-500/15",
    btnPrimary: "bg-pink-500 hover:bg-pink-400 text-white shadow-pink-500/15 font-black",
  },
  sunset: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/30 via-black to-black text-slate-100 selection:bg-orange-500 selection:text-white",
    textAccent: "text-orange-400",
    borderAccent: "border-orange-500/25",
    glowColor: "rgba(249,115,22,0.12)",
    highlight: "from-orange-500 to-amber-500",
    hoverHighlight: "hover:from-orange-400 hover:to-amber-400",
    cardBg: "bg-neutral-950/95 border border-orange-500/25 shadow-[0_8px_30px_rgba(249,115,22,0.04)]",
    cardInner: "bg-black border border-orange-500/15",
    btnPrimary: "bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/15 font-black",
  },
  "electric-violet": {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/30 via-black to-black text-zinc-100 selection:bg-violet-500 selection:text-white",
    textAccent: "text-violet-400",
    borderAccent: "border-violet-500/25",
    glowColor: "rgba(139,92,246,0.12)",
    highlight: "from-violet-500 to-fuchsia-600",
    hoverHighlight: "hover:from-violet-400 hover:to-fuchsia-500",
    cardBg: "bg-neutral-950/95 border border-violet-500/25 shadow-[0_8px_30px_rgba(139,92,246,0.04)]",
    cardInner: "bg-black border border-violet-500/15",
    btnPrimary: "bg-violet-500 hover:bg-violet-400 text-white shadow-violet-500/15 font-black",
  },
  aurora: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/30 via-black to-black text-emerald-100 selection:bg-emerald-400 selection:text-slate-950",
    textAccent: "text-teal-400",
    borderAccent: "border-teal-500/25",
    glowColor: "rgba(20,184,166,0.12)",
    highlight: "from-teal-400 to-emerald-500",
    hoverHighlight: "hover:from-teal-300 hover:to-emerald-400",
    cardBg: "bg-neutral-950/95 border border-teal-500/25 shadow-[0_8px_30px_rgba(20,184,166,0.04)]",
    cardInner: "bg-black border border-teal-500/15",
    btnPrimary: "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/15 font-black",
  },
  cherry: {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/30 via-black to-black text-rose-100 selection:bg-rose-400 selection:text-white",
    textAccent: "text-rose-400",
    borderAccent: "border-rose-500/25",
    glowColor: "rgba(244,63,94,0.12)",
    highlight: "from-rose-500 to-pink-600",
    hoverHighlight: "hover:from-rose-400 hover:to-pink-500",
    cardBg: "bg-neutral-950/95 border border-rose-500/25 shadow-[0_8px_30px_rgba(244,63,94,0.04)]",
    cardInner: "bg-black border border-rose-500/15",
    btnPrimary: "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/15 font-black",
  },
  "ocean-breeze": {
    bg: "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-black to-black text-sky-100 selection:bg-sky-400 selection:text-slate-950",
    textAccent: "text-sky-400",
    borderAccent: "border-sky-500/25",
    glowColor: "rgba(14,165,233,0.12)",
    highlight: "from-sky-500 to-cyan-500",
    hoverHighlight: "hover:from-sky-400 hover:to-cyan-400",
    cardBg: "bg-neutral-950/95 border border-sky-500/25 shadow-[0_8px_30px_rgba(14,165,233,0.04)]",
    cardInner: "bg-black border border-sky-500/15",
    btnPrimary: "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/15 font-black",
  }
};

export default function App() {
  const [state, setState] = useState<AssistantState>(AssistantState.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState("");
  const [websiteLogs, setWebsiteLogs] = useState<OpenedWebsite[]>([]);
  const [userVolume, setUserVolume] = useState(0);
  const [zoyaVolume, setZoyaVolume] = useState(0);
  
  // Use refs for high-frequency audio volume processing to completely avoid lagging the React tree
  const userVolumeRef = useRef(0);
  const zoyaVolumeRef = useRef(0);
  const errorStateMsgRef = useRef<string | null>(null);

  const [assistantName, setAssistantName] = useState(() => {
    const saved = localStorage.getItem("zoya_assistant_name");
    return saved || "Zoya";
  });
  const [voiceGender, setVoiceGender] = useState<"Male" | "Female">(() => {
    const saved = localStorage.getItem("zoya_voice_gender");
    return (saved as "Male" | "Female") || "Female";
  });
  const [language, setLanguage] = useState<"English" | "Hindi" | "Both">(() => {
    const saved = localStorage.getItem("zoya_language");
    return (saved as "English" | "Hindi" | "Both") || "English";
  });
  const [currentToolCall, setCurrentToolCall] = useState<{ id: string; siteName: string; url: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoInput, setDemoInput] = useState("");
  const [terminalAttachments, setTerminalAttachments] = useState<{ id: string; name: string; mimeType: string; data: string; isImage: boolean; previewUrl?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any, isImageOnly: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
        
        setTerminalAttachments(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            data: base64String,
            isImage,
            previewUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input value so same file can be selected again
    e.target.value = "";
  };

  // Settings Side Drawer Controls
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "themes" | "history" | "notifications">("general");
  const [activePopupTab, setActivePopupTab] = useState<"general" | "themes" | "history" | "notifications" | "bio" | "actions" | null>(null);
  const [isHeaderNotifOpen, setIsHeaderNotifOpen] = useState(false);
  const headerNotifRef = useRef<HTMLDivElement>(null);
  const [automaticStart, setAutomaticStart] = useState<boolean>(() => {
    return localStorage.getItem("zoya_automatic_start") === "true";
  });
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    dob: string;
    mobile: string;
    email: string;
    address: string;
    avatarUrl: string;
    userId: string;
  }>(() => {
    const saved = localStorage.getItem("zoya_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure user id is only numbers and starts with 8077/8078/8079 etc.
        let numericId = String(parsed.userId || "").replace(/\D/g, "");
        if (!/^(8077|8078|8079)/.test(numericId)) {
          numericId = "8077" + (numericId || "68");
        }
        parsed.userId = numericId;
        return parsed;
      } catch (e) {
        // ignore
      }
    }
    return {
      firstName: "Rajat",
      lastName: "Kumar",
      dob: "1998-05-15",
      mobile: "+91 80776 89999",
      email: "Rajat807768@gmail.com",
      address: "New Delhi, India",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rajat",
      userId: "807768"
    };
  });

  const [profileDraft, setProfileDraft] = useState({ ...userProfile });
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  useEffect(() => {
    if (isProfileEditOpen) {
      setProfileDraft({ ...userProfile });
    }
  }, [isProfileEditOpen, userProfile]);

  const handleProfilePhotoUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfileDraft(prev => ({ ...prev, avatarUrl: reader.result as string }));
          addNotification("Photo Loaded", "Your temporary profile photo was loaded successfully.", "info");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle click outside of the header notification panel to close it cleanly
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerNotifRef.current && !headerNotifRef.current.contains(event.target as Node)) {
        setIsHeaderNotifOpen(false);
      }
    };
    if (isHeaderNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHeaderNotifOpen]);
  
  const [appTheme, setAppTheme] = useState<"cosmic" | "cyberpunk" | "emerald" | "amber" | "neon-pink" | "sunset" | "electric-violet" | "aurora" | "cherry" | "ocean-breeze">(() => {
    const saved = localStorage.getItem("zoya_app_theme");
    return (saved as any) || "cosmic";
  });

  const [headerGlowEnabled, setHeaderGlowEnabled] = useState(() => {
    const saved = localStorage.getItem("zoya_header_glow_enabled");
    return saved !== "false";
  });

  const [aiCardGlowEnabled, setAiCardGlowEnabled] = useState(() => {
    const saved = localStorage.getItem("zoya_ai_card_glow_enabled");
    return saved !== "false";
  });

  const [waveDesign, setWaveDesign] = useState(() => {
    const saved = localStorage.getItem("zoya_wave_design");
    return saved || "cosmic";
  });

  const [waveStyle, setWaveStyle] = useState<"curve" | "circular" | "electric" | "radio" | "voice">(() => {
    const saved = localStorage.getItem("zoya_wave_style");
    return (saved as any) || "curve";
  });

  const [interruptionThreshold, setInterruptionThreshold] = useState(() => {
    const saved = localStorage.getItem("zoya_interruption_threshold");
    return saved ? parseFloat(saved) : 0.045;
  });
  const [sassLevel, setSassLevel] = useState(() => {
    const saved = localStorage.getItem("zoya_sass_level");
    return saved ? parseInt(saved, 10) : 80;
  });
  const [voiceTone, setVoiceTone] = useState(() => {
    const saved = localStorage.getItem("zoya_voice_tone");
    return saved || "Sarcastic Cyber-Girl";
  });
  const [echoCancellation, setEchoCancellation] = useState(() => {
    const saved = localStorage.getItem("zoya_echo_cancellation");
    return saved !== "false";
  });
  const [noiseSuppression, setNoiseSuppression] = useState(() => {
    const saved = localStorage.getItem("zoya_noise_suppression");
    return saved !== "false";
  });

  // Notifications Parameter Config
  const [speechAlerts, setSpeechAlerts] = useState(() => {
    const saved = localStorage.getItem("zoya_speech_alerts");
    return saved !== "false";
  });
  const [executionChime, setExecutionChime] = useState(() => {
    const saved = localStorage.getItem("zoya_execution_chime");
    return saved !== "false";
  });
  const [interruptionBeep, setInterruptionBeep] = useState(() => {
    const saved = localStorage.getItem("zoya_interruption_beep");
    return saved !== "false";
  });
  const [alertVolume, setAlertVolume] = useState(() => {
    const saved = localStorage.getItem("zoya_alert_volume");
    return saved ? parseInt(saved, 10) : 75;
  });

  // List of active app notifications
  const [activeToasts, setActiveToasts] = useState<ZoyaNotification[]>([]);
  const [notifications, setNotifications] = useState<ZoyaNotification[]>(() => {
    const saved = localStorage.getItem("zoya_notifications_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
    return [
      {
        id: "notif-1",
        title: `${assistantName} Core Active`,
        message: "Sassy companion engine initialized and listening for voice prompts.",
        timestamp: "10:42 AM",
        type: "success",
        read: false
      },
      {
        id: "notif-2",
        title: "Microphone Connected",
        message: "Dynamic audio capture channel established with noise gate.",
        timestamp: "10:41 AM",
        type: "info",
        read: false
      },
      {
        id: "notif-3",
        title: "Theme Calibrated",
        message: "System visual styling synchronized with current cosmic background ambient glows.",
        timestamp: "10:40 AM",
        type: "info",
        read: true
      }
    ];
  });

  // Switch to toggle notification display on the header bar
  const [showNotificationsInHeader, setShowNotificationsInHeader] = useState(() => {
    const saved = localStorage.getItem("zoya_show_notif_header");
    return saved !== "false"; // default is true
  });

  // Helper function to append dynamic live notifications
  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNotif: ZoyaNotification = {
      id: "notif-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 30); // keep up to 30 elements
      localStorage.setItem("zoya_notifications_list", JSON.stringify(updated));
      return updated;
    });
    // Add to floating dynamic active toasts
    setActiveToasts((prev) => [...prev, newNotif]);
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== newNotif.id));
    }, 4000);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("zoya_notifications_list", JSON.stringify([]));
    playChime(400, "sine");
  };

  const deleteNotification = (id: string) => {
    const filtered = notifications.filter(n => n.id !== id);
    setNotifications(filtered);
    localStorage.setItem("zoya_notifications_list", JSON.stringify(filtered));
    playChime(500, "sine");
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("zoya_notifications_list", JSON.stringify(updated));
  };

  // Check initial mic permission status on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicPermissionGranted(permissionStatus.state === 'granted');
          permissionStatus.onchange = () => {
            setMicPermissionGranted(permissionStatus.state === 'granted');
          };
        })
        .catch((err) => {
          console.warn("Could not query microphone permission status:", err);
        });
    }
  }, []);

  // Automatic session connection if Automatic Start is toggled on
  useEffect(() => {
    if (automaticStart) {
      const timer = setTimeout(() => {
        connectSession();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Automatic reconnection logic when Automatic Start is toggled on and session goes offline
  useEffect(() => {
    if (automaticStart && (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR)) {
      const timer = setTimeout(() => {
        console.log("Auto-reconnecting session due to Automatic Start...");
        connectSession();
      }, 4000); // 4-second delay before retry to ensure stable reconnection pacing
      return () => clearTimeout(timer);
    }
  }, [automaticStart, state]);

  const toggleMicPermission = async () => {
    if (micPermissionGranted) {
      setMicPermissionGranted(false);
      playChime(450, "triangle");
      addNotification("Permissions Revoked", "Microphone access simulation disabled in core controls.", "warning");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionGranted(true);
        playChime(850, "sine");
        addNotification("Permissions Allowed", "Microphone access successfully granted and validated.", "success");
      } catch (err) {
        console.error("Microphone permission prompt failed:", err);
        setMicPermissionGranted(false);
        playChime(400, "triangle");
        addNotification("Permissions Error", "Microphone access was denied or not supported in this browser environment.", "error");
      }
    }
  };

  const toggleLightDarkMode = () => {
    const newTheme = appTheme === "cosmic" ? "cyberpunk" : "cosmic";
    setAppTheme(newTheme);
    localStorage.setItem("zoya_app_theme", newTheme);
    playChime(600, "sine");
    addNotification("Theme Switched", `Visual mode changed to ${newTheme === "cosmic" ? "Light (Cosmic)" : "Dark (Cyberpunk)"}`, "info");
  };

  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem("zoya_selected_country") || "IN";
  });

  const [timeMode, setTimeMode] = useState<"system" | "custom">(() => {
    return (localStorage.getItem("zoya_time_mode") as "system" | "custom") || "system";
  });

  const [customDate, setCustomDate] = useState(() => {
    return localStorage.getItem("zoya_custom_date") || "2026-06-25";
  });

  const [customTime, setCustomTime] = useState(() => {
    return localStorage.getItem("zoya_custom_time") || "12:00";
  });

  const [customTimeOffset, setCustomTimeOffset] = useState<number>(() => {
    const saved = localStorage.getItem("zoya_custom_time_offset");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [uptimeEnabled, setUptimeEnabled] = useState(() => {
    const saved = localStorage.getItem("zoya_uptime_enabled");
    return saved !== "false";
  });

  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setClockTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Throttle state updates for userVolume and zoyaVolume to 20 FPS (every 50ms) to ensure smooth, lag-free UI
  useEffect(() => {
    let lastUserVol = 0;
    let lastZoyaVol = 0;
    const interval = setInterval(() => {
      if (userVolumeRef.current !== lastUserVol) {
        lastUserVol = userVolumeRef.current;
        setUserVolume(lastUserVol);
      }
      if (zoyaVolumeRef.current !== lastZoyaVol) {
        lastZoyaVol = zoyaVolumeRef.current;
        setZoyaVolume(lastZoyaVol);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // History state: elegant pre-populated active history logs
  const [historyLogs, setHistoryLogs] = useState<{ id: string; timestamp: string; action: string; duration: string; rating: number }[]>(() => {
    const saved = localStorage.getItem("zoya_session_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: "S-9482", timestamp: "Today, 02:10 AM", action: "Completed full-duplex banter session", duration: "4m 12s", rating: 5 },
      { id: "S-8105", timestamp: "Yesterday, 11:45 PM", action: "Checked tool integrations & feedback", duration: "12m 5s", rating: 4 },
      { id: "S-7392", timestamp: "24 Jun, 06:15 PM", action: "Calibrated neural mic filters & gateway", duration: "1m 30s", rating: 5 },
      { id: "S-6102", timestamp: "23 Jun, 03:20 PM", action: "Initialized sassy welcome parameters", duration: "8m 42s", rating: 5 }
    ];
  });

  // Helper function to play functional alert/chime sounds
  const playChime = (freq = 880, type: OscillatorType = "sine") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const vol = alertVolume / 100;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Synthesizer failed", e);
    }
  };
  
  // Real-time ticking Uptime counter
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // References for full-duplex session handling
  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTime = useRef<number>(0);

  // Local talking threshold parameters (triggers interruption locally when user speaks)
  const speakingFrameCount = useRef(0);

  // Uptime ticker logic
  const isAssistantOn = state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR;
  useEffect(() => {
    if (!isAssistantOn) {
      setUptimeSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAssistantOn]);

  const formatUptime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Safely stop all active audio output sources
  const clearPlaybackQueue = () => {
    activeSources.current.forEach((src) => {
      try {
        src.stop();
      } catch (err) {
        // Source already completed or stopped
      }
    });
    activeSources.current = [];
    nextStartTime.current = 0;
  };

  // Close connections and reset mic capture
  const disconnectSession = (errorStateMsg?: string) => {
    errorStateMsgRef.current = errorStateMsg || null;
    setState(errorStateMsg ? AssistantState.ERROR : AssistantState.DISCONNECTED);
    if (errorStateMsg) {
      setErrorMessage(errorStateMsg);
      addNotification("Core Error Encountered", errorStateMsg, "error");
    } else {
      addNotification("AI Session Terminated", "Voice capture socket successfully un-registered.", "warning");
    }

    setIsDemoMode(false);

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // Already closed
      }
      wsRef.current = null;
    }

    // Stop microphone stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Disconnect processors
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    // Close AudioContexts
    if (inputCtxRef.current) {
      try {
        inputCtxRef.current.close();
      } catch (e) {}
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      try {
        outputCtxRef.current.close();
      } catch (e) {}
      outputCtxRef.current = null;
    }

    clearPlaybackQueue();
    userVolumeRef.current = 0;
    zoyaVolumeRef.current = 0;
    setUserVolume(0);
    setZoyaVolume(0);
    speakingFrameCount.current = 0;
  };

  const connectSession = async () => {
    errorStateMsgRef.current = null;
    setErrorMessage("");
    setState(AssistantState.CONNECTING);
    console.log("Starting Zoya stream capture...");

    try {
      // 1. Initialize Web Audio Contexts
      // Input capture Context (at exactly 16kHz for Gemini requirements)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputCtxRef.current = inputCtx;

      // Output render Context (at 24kHz for high-fidelity Gemini response rendering)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputCtxRef.current = outputCtx;

      // 2. Request user microphone
      let micStream: MediaStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: echoCancellation,
            noiseSuppression: noiseSuppression,
            autoGainControl: true,
          },
        });
      } catch (micErr: any) {
        console.warn("User microphone denied or unavailable, activating interactive synthetic fallback stream:", micErr);
        setIsDemoMode(true);
        const synthDest = inputCtx.createMediaStreamDestination();
        micStream = synthDest.stream;
      }
      micStreamRef.current = micStream;

      // 3. Connect audio stream processor
      const micSourceNode = inputCtx.createMediaStreamSource(micStream);
      const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      micSourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);

       // Initialize WebSocket connection to backend with query parameters for real-time customization
      let host = window.location.host;
      if (!host || host.trim() === "") {
        host = "localhost:3000";
      }

      // If the host is localhost/127.0.0.1, we must use ws:, not wss:
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = (window.location.protocol === "https:" && !isLocalhost) ? "wss:" : "ws:";

      // Extract the current base path to support reverse proxies and workspace subpath routing
      let basePath = window.location.pathname;
      if (basePath.endsWith("/index.html")) {
        basePath = basePath.substring(0, basePath.lastIndexOf("/index.html"));
      }
      if (basePath.endsWith("/")) {
        basePath = basePath.substring(0, basePath.length - 1);
      }

      // Extract only the essential user profile fields required by the server to keep payload compact and clean
      const minimalProfile = {
        firstName: userProfile?.firstName || "Rajat",
        lastName: userProfile?.lastName || "Kumar",
        dob: userProfile?.dob || "1998-05-15",
        mobile: userProfile?.mobile || "+91 80776 89999",
        email: userProfile?.email || "Rajat807768@gmail.com",
        address: userProfile?.address || "New Delhi, India",
        userId: userProfile?.userId || "807768"
      };

      const queryParams = new URLSearchParams({
        name: assistantName,
        voice: voiceGender,
        language: language,
        profile: JSON.stringify(minimalProfile),
        country: selectedCountry,
        timeMode: timeMode,
        customDate: customDate,
        customTime: customTime,
        sassLevel: String(sassLevel),
        voiceTone: voiceTone,
        theme: appTheme,
        isProfileCompleted: localStorage.getItem("zoya_user_profile") ? "true" : "false"
      }).toString();
      
      const wsUrl = `${protocol}//${host}${basePath}/api/live?${queryParams}`;
      console.log("Connecting to WebSocket gateway:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Live Audio capture and scale calculation
      scriptProcessor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate root mean square (RMS) for visualizer pulse
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);
        userVolumeRef.current = rms;

        // Local Interruption Detection: 
        // If user talks actively (RMS > 0.04) while Zoya is speaking,
        // stop active playback instantly in real time so the user can be heard.
        if (rms > interruptionThreshold) {
          speakingFrameCount.current += 1;
          // Threshold of 3 consecutive frames to avoid clicking triggers
          if (speakingFrameCount.current >= 3 && outputCtx.state === "running") {
            // Check if Zoya is active
            if (activeSources.current.length > 0) {
              console.log("Local Interruption: User spoke over Zoya.");
              clearPlaybackQueue();
            }
          }
        } else {
          speakingFrameCount.current = 0;
        }

        // Send raw little-endian Float PCM16 converted base64
        if (ws.readyState === WebSocket.OPEN) {
          const pcmBase64 = float32ToPCM16Base64(channelData);
          ws.send(
            JSON.stringify({
              type: "audio",
              data: pcmBase64,
            })
          );
        }
      };

      ws.onopen = () => {
        console.log("Client connected to server WebSocket gateway.");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "status") {
            if (msg.status === "connected") {
              // Transition from Connecting to Idle/Listening
              setState(AssistantState.IDLE);
              addNotification("AI Companion Connected", `Active real-time link established with ${assistantName}.`, "success");
              // Unlock audio context inside user click handler
              if (inputCtx.state === "suspended") inputCtx.resume();
              if (outputCtx.state === "suspended") outputCtx.resume();
            }
          }

          else if (msg.type === "audio" && msg.data) {
            setState(AssistantState.SPEAKING);

            // Convert raw Base64 bytes back to 24kHz Float Arrays
            const float32Array = base64ToPCMFloat32(msg.data);

            // Access output audio context & queue gapless playback
            const outCtx = outputCtxRef.current;
            if (outCtx) {
              const audioBuffer = outCtx.createBuffer(1, float32Array.length, 24000);
              audioBuffer.getChannelData(0).set(float32Array);

              const srcNode = outCtx.createBufferSource();
              srcNode.buffer = audioBuffer;
              srcNode.connect(outCtx.destination);

              // Target starting duration
              let startTime = outCtx.currentTime;
              if (nextStartTime.current > startTime) {
                startTime = nextStartTime.current;
              }

              srcNode.start(startTime);
              nextStartTime.current = startTime + audioBuffer.duration;

              // Track active sources for safe cancellation
              activeSources.current.push(srcNode);
              
              // Simple volume metric for Zoya's speaking orb
              let zoyaSum = 0;
              for (let i = 0; i < float32Array.length; i++) {
                zoyaSum += float32Array[i] * float32Array[i];
              }
              const zoyaRms = Math.sqrt(zoyaSum / float32Array.length);
              zoyaVolumeRef.current = zoyaRms;

              srcNode.onended = () => {
                activeSources.current = activeSources.current.filter((s) => s !== srcNode);
                if (activeSources.current.length === 0) {
                  setState(AssistantState.LISTENING);
                  zoyaVolumeRef.current = 0;
                }
              };
            }
          }

          else if (msg.type === "interrupted") {
            console.log("Interruption signal triggered from server.");
            clearPlaybackQueue();
            setState(AssistantState.LISTENING);
            zoyaVolumeRef.current = 0;
          }

          else if (msg.type === "speaking") {
            if (msg.active) {
              setState(AssistantState.SPEAKING);
            } else {
              // Resetting state
              if (activeSources.current.length === 0) {
                setState(AssistantState.LISTENING);
                zoyaVolumeRef.current = 0;
              }
            }
          }

          else if (msg.type === "toolCall") {
            console.log("Tool invocation requested on client:", msg);
            if (msg.name === "openWebsite") {
              const { url, siteName } = msg.args;
              addNotification("Opening Website", `Browser action triggered: Opening ${siteName}.`, "info");
              setWebsiteLogs((prev) => [
                { siteName, url, timestamp: new Date(), action: "open" },
                ...prev,
              ]);
              
              // Set the modal toast so user is alerted and can bypass pop-up blockers
              setCurrentToolCall({ id: msg.id, siteName, url });

              // Proactively try to pop the tab (browser might block popups unless initiated directly, which is why the visual button backup is beautiful)
              try {
                window.open(url, "_blank");
              } catch (e) {
                console.warn("Autoplay / popup blocked, utilizing UI backup trigger");
              }
            } else if (msg.name === "closeWebsite") {
              const { siteName } = msg.args;
              addNotification("Closing Website", `Browser action triggered: Closing ${siteName}.`, "info");
              setWebsiteLogs((prev) => [
                { siteName, url: "", timestamp: new Date(), action: "close" },
                ...prev,
              ]);
            }
          }

          else if (msg.type === "error") {
            disconnectSession(msg.message);
          }

        } catch (e: any) {
          console.error("Error processing WebSocket payload:", e);
        }
      };

      ws.onclose = (ev) => {
        console.log("WebSocket gateway session completed:", ev);
        if (!errorStateMsgRef.current) {
          disconnectSession();
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection failure:", err);
        if (!errorStateMsgRef.current) {
          disconnectSession("Unstable connection or network gateway timeout.");
        }
      };

    } catch (e: any) {
      console.error("Client setup failure:", e);
      disconnectSession(e.message || "Failed to initialize audio peripherals.");
    }
  };

  const handleTogglePower = () => {
    if (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR) {
      connectSession();
    } else {
      disconnectSession();
    }
  };

  // Auto clean up refs on component unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  const getVirtualTime = () => {
    if (timeMode === "system") {
      return new Date();
    } else {
      return new Date(Date.now() + customTimeOffset);
    }
  };

  const formatHeaderTimeAndDate = () => {
    const vTime = getVirtualTime();
    const timezoneMap: Record<string, { locale: string; timeZone: string; flag: string; label: string }> = {
      IN: { locale: "en-IN", timeZone: "Asia/Kolkata", flag: "🇮🇳", label: "India" },
      US: { locale: "en-US", timeZone: "America/New_York", flag: "🇺🇸", label: "USA" },
      GB: { locale: "en-GB", timeZone: "Europe/London", flag: "🇬🇧", label: "UK" },
      JP: { locale: "ja-JP", timeZone: "Asia/Tokyo", flag: "🇯🇵", label: "Japan" },
      DE: { locale: "de-DE", timeZone: "Europe/Berlin", flag: "🇩🇪", label: "Germany" },
    };

    const conf = timezoneMap[selectedCountry] || timezoneMap.IN;
    try {
      const timeStr = vTime.toLocaleTimeString(conf.locale, {
        timeZone: conf.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      const dateStr = vTime.toLocaleDateString(conf.locale, {
        timeZone: conf.timeZone,
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      return { timeStr, dateStr, flag: conf.flag, label: conf.label };
    } catch (e) {
      return {
        timeStr: vTime.toLocaleTimeString(),
        dateStr: vTime.toLocaleDateString(),
        flag: "🌐",
        label: "Global"
      };
    }
  };

  const activeVolume =
    state === AssistantState.SPEAKING
      ? zoyaVolume
      : state === AssistantState.LISTENING
      ? userVolume
      : 0;

  const getHeaderGlowStyle = () => {
    if (!headerGlowEnabled || state === AssistantState.DISCONNECTED) {
      return {};
    }

    const volPx = activeVolume * 15;
    const volAlpha = activeVolume * 0.45;

    return {
      "--vol-px": `${volPx}px`,
      "--vol-alpha": volAlpha,
    } as any;
  };

  const getHeaderGlowClassName = () => {
    if (!headerGlowEnabled || state === AssistantState.DISCONNECTED) return "border border-slate-200/50 shadow-sm";
    if (state === AssistantState.SPEAKING) return "animate-glow-speaking";
    if (state === AssistantState.LISTENING) return "animate-glow-listening";
    if (state === AssistantState.CONNECTING) return "animate-glow-connecting";
    if (state === AssistantState.IDLE) return "animate-glow-idle";
    if (state === AssistantState.ERROR) return "animate-glow-error";
    return "";
  };

  const currentThemeStyles = THEME_STYLES[appTheme] || THEME_STYLES.cosmic;

  return (
    <div className={`min-h-screen ${currentThemeStyles.bg} flex flex-col justify-between relative overflow-hidden transition-all duration-500`}>
      
      {/* Background Ambience Soft Mesh */}
      <div 
        className="absolute inset-0 transition-all duration-1000" 
        style={{ 
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% -10%, ${currentThemeStyles.glowColor}, rgba(0,0,0,0))`,
          pointerEvents: "none" 
        }}
      />
      {appTheme === "cosmic" && (
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(226,232,240,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(226,232,240,0.15)_1px,transparent_1px)] bg-[size:30px_30px]" 
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Modern Top Header Status Bar Card (Matching JARVIS container in your image) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <header 
          style={getHeaderGlowStyle()}
          className={`relative ${isHeaderNotifOpen ? "z-[100]" : "z-10"} ${currentThemeStyles.cardBg} ${getHeaderGlowClassName()} rounded-[1.5rem] p-4 flex items-center justify-between backdrop-blur-md transition-all duration-500`}
        >
          <div className="flex items-center gap-3">
            {/* Elegant Circular Eye Lens Widget (The iconic round core lens from your reference image) */}
            <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-md">
              {/* Inner metallic reflection rings */}
              <div className="absolute inset-1 rounded-full border border-slate-800 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.3)_0%,rgba(3,7,18,0.9)_100%)]" />
              {/* Central glowing camera eye dot */}
              <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  state === AssistantState.DISCONNECTED ? "bg-slate-600" :
                  state === AssistantState.CONNECTING ? "bg-purple-400" :
                  state === AssistantState.LISTENING ? "bg-rose-400" :
                  state === AssistantState.SPEAKING ? "bg-amber-400" :
                  "bg-cyan-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  state === AssistantState.DISCONNECTED ? "bg-slate-500" :
                  state === AssistantState.CONNECTING ? "bg-purple-500" :
                  state === AssistantState.LISTENING ? "bg-rose-500" :
                  state === AssistantState.SPEAKING ? "bg-amber-500" :
                  "bg-cyan-400"
                }`}></span>
              </span>
            </div>

            {/* Title & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className={`text-sm font-extrabold tracking-widest ${currentThemeStyles.textAccent} font-mono uppercase transition-colors duration-500`}>
                  {assistantName}
                </h1>
                <span className={`text-[9px] font-bold font-mono ${appTheme === "cosmic" ? "text-slate-300" : "text-slate-700/30"}`}>|</span>
                <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>
                  STATUS_{state === AssistantState.DISCONNECTED ? "OFF" : state}
                </span>
                <span className={`text-[9px] font-bold font-mono ${appTheme === "cosmic" ? "text-slate-300" : "text-slate-700/30"}`}>|</span>
                <span className={`text-[10px] font-mono tracking-wider font-bold flex items-center gap-1 ${
                  appTheme === "cosmic" ? "text-purple-600" : "text-cyan-400"
                }`}>
                  <span>{formatHeaderTimeAndDate().flag}</span>
                  <span className="hidden xs:inline">{formatHeaderTimeAndDate().label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shadow-inner ${
                    appTheme === "cosmic"
                      ? "bg-purple-50 text-purple-700 border-purple-200/60"
                      : "bg-slate-900/60 text-cyan-300 border-slate-800/80"
                  }`}>
                    {formatHeaderTimeAndDate().timeStr}
                  </span>
                </span>
              </div>
              <div className={`flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold uppercase mt-0.5 ${
                appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"
              }`}>
                <span className={appTheme === "cosmic" ? "text-slate-600" : "text-slate-500"}>{formatHeaderTimeAndDate().dateStr}</span>
                {uptimeEnabled && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-500">UPTIME: {formatUptime(uptimeSeconds)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2">
            {/* Live Header Notification Bell */}
            {showNotificationsInHeader && (
              <div className="relative" ref={headerNotifRef}>
                <button
                  onClick={() => {
                    setIsHeaderNotifOpen(!isHeaderNotifOpen);
                    playChime(650, "sine");
                  }}
                  className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center relative group ${
                    appTheme === "cosmic"
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900"
                      : `bg-slate-900/40 hover:bg-slate-900/60 ${currentThemeStyles.borderAccent} text-slate-300 hover:text-white`
                  }`}
                  aria-label="View Notifications"
                >
                  <Bell className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  {/* Glowing unread count badge */}
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-mono font-black text-white items-center justify-center">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    </span>
                  )}
                </button>

                {/* Header Notification dropdown window -> converted to gorgeous floating window popup style matching the 'go online' card exactly */}
                <AnimatePresence>
                  {isHeaderNotifOpen && (
                    <>
                      {/* Interactive backdrop overlay to close popup upon click-out */}
                      <div 
                        className="fixed inset-0 z-[51] bg-slate-950/20 backdrop-blur-[2px]"
                        onClick={() => {
                          setIsHeaderNotifOpen(false);
                          playChime(500, "sine");
                        }}
                      />
                      
                      <motion.div
                        key="header-notification-floating-popup"
                        initial={{ opacity: 0, scale: 0.9, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: -20, x: "-50%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 240 }}
                        className={`fixed top-28 left-1/2 z-[52] w-[92%] sm:w-[390px] rounded-2xl border backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
                          appTheme === "cosmic"
                            ? "bg-indigo-50/95 border-indigo-200 text-slate-800 shadow-indigo-200/20"
                            : "bg-black/95 border-cyan-500/30 text-slate-100 shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
                        }`}
                      >
                        {/* Header of Floating notification popup */}
                        <div className={`px-4 py-3 border-b flex items-center justify-between ${
                          appTheme === "cosmic" ? "border-indigo-100/80 bg-indigo-100/20" : "border-slate-850 bg-slate-950/60"
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center shrink-0">
                              <span className="flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${appTheme === "cosmic" ? "bg-indigo-400" : "bg-cyan-400"}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${appTheme === "cosmic" ? "bg-indigo-500" : "bg-cyan-500"}`}></span>
                              </span>
                            </div>
                            <span className={`text-[10.5px] font-mono font-black uppercase tracking-widest ${
                              appTheme === "cosmic" ? "text-indigo-900" : "text-cyan-400"
                            }`}>
                              System Alert Streams
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                              <button
                                onClick={() => {
                                  clearAllNotifications();
                                  playChime(450, "sine");
                                }}
                                className={`text-[9px] font-mono font-black px-2 py-1 rounded-lg border uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                  appTheme === "cosmic"
                                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                                    : "bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-950/60"
                                }`}
                              >
                                Clear All
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setIsHeaderNotifOpen(false);
                                playChime(500, "sine");
                              }}
                              className={`p-1 rounded-lg hover:scale-105 transition-all cursor-pointer ${
                                appTheme === "cosmic" ? "hover:bg-slate-200 text-slate-500" : "hover:bg-slate-800 text-slate-400"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Notifications scroll list */}
                        <div className={`max-h-72 overflow-y-auto divide-y ${
                          appTheme === "cosmic" ? "divide-indigo-100/50" : "divide-slate-850"
                        }`}>
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                              <Bell className={`w-6 h-6 stroke-[1.5] ${appTheme === "cosmic" ? "text-indigo-300" : "text-slate-650"}`} />
                              <p className={`text-[10px] font-mono uppercase tracking-widest ${
                                appTheme === "cosmic" ? "text-slate-400" : "text-slate-500"
                              }`}>
                                No active notifications
                              </p>
                            </div>
                          ) : (
                            notifications.map((notif) => {
                              let notifIcon = null;
                              let iconBg = "";
                              let borderCls = "";
                              
                              if (notif.type === "success") {
                                notifIcon = <Check className="w-3 h-3 text-emerald-500" />;
                                iconBg = "bg-emerald-500/10";
                                borderCls = "border-emerald-500/20";
                              } else if (notif.type === "warning") {
                                notifIcon = <AlertTriangle className="w-3 h-3 text-amber-500" />;
                                iconBg = "bg-amber-500/10";
                                borderCls = "border-amber-500/20";
                              } else if (notif.type === "error") {
                                notifIcon = <Flame className="w-3 h-3 text-rose-500" />;
                                iconBg = "bg-rose-500/10";
                                borderCls = "border-rose-500/20";
                              } else {
                                notifIcon = <Sparkles className="w-3 h-3 text-indigo-500" />;
                                iconBg = "bg-indigo-500/10";
                                borderCls = "border-indigo-500/20";
                              }

                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => {
                                    markNotificationAsRead(notif.id);
                                    // Open full notification controls
                                    setIsSettingsOpen(true);
                                    setActivePopupTab("notifications");
                                    setIsHeaderNotifOpen(false);
                                    playChime(650, "sine");
                                  }}
                                  className={`p-3.5 text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group cursor-pointer ${
                                    notif.read 
                                      ? "opacity-55" 
                                      : appTheme === "cosmic"
                                        ? "bg-white/40 hover:bg-white/70"
                                        : "bg-slate-950/20 hover:bg-slate-950/40"
                                  }`}
                                >
                                  {/* Left icon wrapper */}
                                  <div className={`p-1.5 rounded-xl border shrink-0 ${iconBg} ${borderCls}`}>
                                    {notifIcon}
                                  </div>
                                  
                                  <div className="flex-grow min-w-0 pr-6">
                                    <div className="flex items-baseline justify-between gap-1.5">
                                      <p className={`text-[11px] font-bold truncate ${
                                        appTheme === "cosmic" ? "text-slate-850" : "text-slate-200"
                                      }`}>
                                        {notif.title}
                                      </p>
                                      <span className="text-[8px] font-mono text-slate-500 shrink-0">
                                        {notif.timestamp}
                                      </span>
                                    </div>
                                    <p className={`text-[9.5px] font-sans mt-0.5 leading-normal ${
                                      appTheme === "cosmic" ? "text-slate-600" : "text-slate-400"
                                    }`}>
                                      {notif.message}
                                    </p>
                                  </div>

                                  {/* Quick Delete notification item button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notif.id);
                                      playChime(350, "sine");
                                    }}
                                    className="absolute right-3.5 top-3.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-500/10 text-slate-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
                                    title="Delete notification"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer details action link */}
                        <div className={`p-2.5 text-center border-t flex items-center justify-around ${
                          appTheme === "cosmic" ? "border-indigo-100/50 bg-indigo-50/30" : "border-slate-850 bg-slate-950/20"
                        }`}>
                          {notifications.length > 0 && (
                            <button
                              onClick={() => {
                                const readAll = notifications.map(n => ({ ...n, read: true }));
                                setNotifications(readAll);
                                localStorage.setItem("zoya_notifications_list", JSON.stringify(readAll));
                                playChime(600, "sine");
                              }}
                              className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                                appTheme === "cosmic" ? "text-indigo-600 hover:text-indigo-800" : "text-cyan-400 hover:text-cyan-300"
                              }`}
                            >
                              Mark All Read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsSettingsOpen(true);
                              setActivePopupTab("notifications");
                              setIsHeaderNotifOpen(false);
                              playChime(700, "sine");
                            }}
                            className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                              appTheme === "cosmic" ? "text-indigo-600 hover:text-indigo-800" : "text-cyan-400 hover:text-cyan-300"
                            }`}
                          >
                            Configure Panel &rarr;
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Settings Slide-Over Drawer Toggle */}
            <button 
              id="settings-slide-toggle"
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center relative group ${
                appTheme === "cosmic"
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900"
                  : `bg-slate-900/40 hover:bg-slate-900/60 ${currentThemeStyles.borderAccent} text-slate-300 hover:text-white`
              }`}
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </div>
        </header>
      </div>

      {/* Main Beautiful Bento Grid Layout */}
      <main className="relative z-10 flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 items-center justify-center">
          
          {/* Center Column: Character Core Visualizer & Controls */}
          <div className="flex flex-col gap-6 w-full items-center justify-center min-h-[440px]">
            <ZoyaOrb 
              state={state}
              userVolume={userVolume}
              zoyaVolume={zoyaVolume}
              onTogglePower={handleTogglePower}
              errorMessage={errorMessage}
              appTheme={appTheme}
              assistantName={assistantName}
              voiceGender={voiceGender}
              aiCardGlowEnabled={aiCardGlowEnabled}
              waveDesign={waveDesign}
              waveStyle={waveStyle}
            />

            {/* Restrictive Sandbox Fallback panel if mic fails (Shown beautiful and inline) */}
            {isDemoMode && state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full p-5 rounded-[2rem] backdrop-blur-xl z-20 space-y-3 border transition-all duration-500 ${
                  appTheme === "cosmic"
                    ? "bg-white/90 border-purple-200 shadow-[0_10px_25px_rgba(168,85,247,0.04)] text-slate-800"
                    : "bg-neutral-950/95 border-purple-900/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold font-mono text-[10px] uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-purple-500 animate-bounce" />
                    <span>Active Bypass: Synthetic Mic</span>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono transition-colors duration-500 ${
                    appTheme === "cosmic" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-purple-950/40 text-purple-400 border-purple-900/50"
                  }`}>
                    ONLINE
                  </span>
                </div>
                
                <p className={`text-[11px] font-sans leading-relaxed transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>
                  Mic capture is blocked inside secure previews. Type a sassy phrase below to let {assistantName} speak {voiceGender === "Male" ? "his" : "her"} answer in real-time!
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!demoInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                    
                    // Emit virtual text input
                    wsRef.current.send(JSON.stringify({
                      type: "text",
                      text: demoInput
                    }));
                    
                    // Reset and trigger speaking state visualization
                    setDemoInput("");
                    setState(AssistantState.SPEAKING);
                  }}
                  className="flex gap-2"
                >
                  <input
                    id="virtual-text-input"
                    type="text"
                    placeholder="Ask her anything playful..."
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    className={`flex-grow border rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 outline-none transition-all shadow-inner ${
                      appTheme === "cosmic" 
                        ? "bg-slate-50 border-slate-200 focus:border-purple-300 focus:bg-white text-slate-700" 
                        : "bg-black border-slate-800 focus:border-purple-500/85 focus:bg-black text-slate-200"
                    }`}
                  />
                  <button
                    id="virtual-submit-button"
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/10"
                  >
                    Banter
                  </button>
                </form>
              </motion.div>
            )}

            {/* Error instructions card */}
            {state === AssistantState.ERROR && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full border p-6 rounded-[2rem] text-center backdrop-blur-xl z-20 transition-all duration-500 ${
                  appTheme === "cosmic" 
                    ? "bg-white border-red-200/80 shadow-[0_15px_30px_rgba(239,68,68,0.04)] text-slate-800" 
                    : "bg-neutral-950/95 border-red-900/30 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-slate-100"
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div className={`p-2.5 rounded-xl border transition-all duration-500 ${
                    appTheme === "cosmic" ? "bg-red-50 border-red-100 text-red-500" : "bg-red-950/40 border-red-900/50 text-red-400"
                  }`}>
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">
                  {errorMessage.toLowerCase().includes("key") ? "Credentials Required" : "Session Access Halted"}
                </h4>
                
                <p className={`text-xs mt-2 font-sans leading-relaxed transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>
                  {errorMessage.toLowerCase().includes("key") 
                    ? `${assistantName} requires an API Key. Please click Settings -> Secrets and set GEMINI_API_KEY.`
                    : `Mic permissions denied. To talk with ${assistantName}, please allow microphone access in your browser bar.`}
                </p>

                {!errorMessage.toLowerCase().includes("key") && (
                  <div className={`mt-4 text-left p-4 rounded-2xl border space-y-2.5 font-sans text-[11px] transition-all duration-500 ${
                    appTheme === "cosmic" ? "bg-slate-50 border-slate-200/50 text-slate-500" : "bg-black border-slate-850 text-slate-400"
                  }`}>
                    <div className="flex gap-2">
                      <span className="font-bold text-rose-500 font-mono">1.</span>
                      <span>Click the <strong>lock / configuration icon</strong> near the URL bar.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-rose-500 font-mono">2.</span>
                      <span>Change the <strong>Microphone</strong> selection to <strong>Allow</strong>.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-rose-500 font-mono">3.</span>
                      <span>Or bypass restrictor frames by launching this app standalone in a tab!</span>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    id="open-new-tab-resolver"
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-md transition-all duration-200"
                  >
                    Open in a New Tab <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    id="retry-connector-button"
                    onClick={connectSession}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-bold underline mt-1"
                  >
                    Initialize Connection Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      {/* Bottom Diagnostic Executive Terminal Input Block (Perfect match of the terminal panel in your image) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-6 mt-4 relative z-10">
        <div className={`w-full border rounded-[2rem] p-6 backdrop-blur-xl transition-all duration-500 ${
          appTheme === "cosmic" 
            ? "bg-white/95 border-slate-200/80 text-slate-800 shadow-[0_15px_40px_rgba(148,163,184,0.06)]" 
            : "bg-neutral-950/95 border-slate-850 text-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
        }`}>
          {/* Header row with terminal styling */}
          <div className={`flex items-center justify-between mb-3 border-b pb-2.5 transition-colors duration-500 ${appTheme === "cosmic" ? "border-slate-100" : "border-slate-800"}`}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
              <h4 className={`text-xs font-bold tracking-widest font-mono uppercase transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-700" : "text-slate-300"}`}>
                Diagnostic Executive Terminal
              </h4>
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full transition-all duration-500 ${
              appTheme === "cosmic" ? "text-slate-400 bg-slate-50 border border-slate-200/60" : "text-cyan-400 bg-black/80 border border-slate-850"
            }`}>
              ARMED
            </span>
          </div>

          <p className={`text-[11px] font-sans leading-relaxed mb-4 transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>
            Type diagnostic banter below to test {assistantName}'s speech synthesizer logic instantly. {voiceGender === "Male" ? "He" : "She"} will process the message and speak {voiceGender === "Male" ? "his" : "her"} playful response back aloud!
          </p>

          {/* Hidden inputs for functional file and image upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, true)}
            className="hidden"
            multiple
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileChange(e, false)}
            className="hidden"
            multiple
          />

          {/* Selected Attachments Preview Grid */}
          {terminalAttachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-3.5 p-2.5 rounded-2xl border transition-all duration-500 ${
              appTheme === "cosmic" ? "bg-slate-50/50 border-slate-100" : "bg-slate-950/50 border-slate-850"
            }`}>
              {terminalAttachments.map((att) => (
                <div
                  key={att.id}
                  className={`relative group flex items-center gap-2 border rounded-xl p-1.5 pr-2.5 shadow-sm max-w-[200px] transition-all duration-500 ${
                    appTheme === "cosmic" ? "bg-white border-slate-200/70 text-slate-850" : "bg-slate-900 border-slate-800 text-slate-200"
                  }`}
                >
                  {att.isImage ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${
                      appTheme === "cosmic" ? "bg-cyan-50 border-cyan-100 text-cyan-600" : "bg-slate-950 border-slate-800 text-cyan-400"
                    }`}>
                      <Paperclip className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-semibold truncate transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-700" : "text-slate-300"}`} title={att.name}>
                      {att.name}
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                      {(att.mimeType.split("/")[1] || "file").substring(0, 6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTerminalAttachments((prev) => prev.filter((x) => x.id !== att.id));
                      if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
                    }}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      appTheme === "cosmic" ? "hover:bg-rose-50 text-slate-400 hover:text-rose-500" : "hover:bg-rose-950/50 text-slate-500 hover:text-rose-400"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Styled TextInput Wrapper Container with send button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!demoInput.trim() && terminalAttachments.length === 0) return;

              const payload = {
                type: "text",
                text: demoInput.trim() || "Analyze the uploaded attachment(s)",
                attachments: terminalAttachments.map(att => ({
                  name: att.name,
                  mimeType: att.mimeType,
                  data: att.data
                }))
              };

              // If session is disconnected, proactively boot it up first!
              if (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR) {
                connectSession().then(() => {
                  setTimeout(() => {
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify(payload));
                      setDemoInput("");
                      setTerminalAttachments([]);
                    }
                  }, 1200);
                });
                return;
              }

              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(payload));
                setDemoInput("");
                setTerminalAttachments([]);
                setState(AssistantState.SPEAKING);
              }
            }}
            className={`flex items-center gap-1.5 sm:gap-2 border p-1.5 sm:p-2 rounded-2xl transition-all duration-500 ${
              appTheme === "cosmic" 
                ? "bg-slate-50/80 border-slate-200/60 hover:border-slate-300 focus-within:border-cyan-300 focus-within:bg-white" 
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 focus-within:border-cyan-500/80 focus-within:bg-slate-950"
            }`}
          >
            {/* Functional Upload Image Icon Button */}
            <button
              id="terminal-image-upload-button"
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={`p-2 text-slate-400 hover:text-cyan-500 rounded-xl transition-all cursor-pointer shrink-0 ${
                appTheme === "cosmic" ? "hover:bg-slate-100" : "hover:bg-slate-900"
              }`}
              title="Upload Image"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* Functional Upload File Icon Button */}
            <button
              id="terminal-file-upload-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 text-slate-400 hover:text-cyan-500 rounded-xl transition-all cursor-pointer shrink-0 ${
                appTheme === "cosmic" ? "hover:bg-slate-100" : "hover:bg-slate-900"
              }`}
              title="Upload File"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Real Text Input */}
            <input
              id="terminal-message-textbox"
              type="text"
              placeholder={terminalAttachments.length > 0 ? "Add message or press Send..." : "Type diagnostic message..."}
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              className={`flex-grow bg-transparent border-none text-xs placeholder-slate-400 outline-none font-sans font-medium py-1 px-1 min-w-0 transition-colors duration-500 ${
                appTheme === "cosmic" ? "text-slate-700" : "text-slate-200"
              }`}
            />

            {/* Glowing gradient blue Send/Banter button */}
            <button
              id="terminal-send-button"
              type="submit"
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Navigation className="w-3.5 h-3.5 rotate-90 shrink-0" />
            </button>
          </form>
        </div>
      </div>

      {/* Futuristic Floating Tool Action Intercept Drawer */}
      <AnimatePresence>
        {currentToolCall && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full border p-5 rounded-[2rem] backdrop-blur-xl transition-all duration-500 ${
              appTheme === "cosmic" 
                ? "bg-white border-cyan-200 shadow-[0_15px_40px_rgba(6,182,212,0.15)] text-slate-800" 
                : "bg-slate-900/95 border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.4)] text-slate-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-500 ${
                appTheme === "cosmic" ? "bg-cyan-50 border-cyan-100 text-cyan-500" : "bg-cyan-950/40 border-cyan-900/50 text-cyan-400"
              }`}>
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-[11px] font-mono font-bold tracking-widest text-cyan-600 uppercase">
                  {assistantName} opened a site!
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal font-sans font-medium">
                  {assistantName} triggered browser navigation to <strong className="text-slate-800">{currentToolCall.siteName}</strong>. 
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    id="modal-visit-button"
                    href={currentToolCall.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-grow flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md"
                    onClick={() => setCurrentToolCall(null)}
                  >
                    Go There <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    id="modal-dismiss-button"
                    onClick={() => setCurrentToolCall(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Auto-Start Waiting/Reconnecting Notification */}
      <AnimatePresence>
        {automaticStart && (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR || state === AssistantState.CONNECTING) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: -20, x: "-50%" }}
            transition={{ type: "spring", damping: 25, stiffness: 240 }}
            className={`fixed top-28 left-1/2 z-[45] max-w-sm w-[90%] sm:w-auto px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center gap-3.5 transition-all duration-500 ${
              appTheme === "cosmic"
                ? "bg-amber-50/95 border-amber-200 text-slate-800 shadow-amber-200/20"
                : "bg-slate-900/95 border-amber-500/30 text-slate-100 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
            }`}
          >
            <div className="relative flex items-center justify-center shrink-0">
              {/* Spinner/Pulsing core */}
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            
            <div className="flex-grow">
              <p className={`text-[11px] font-mono font-black tracking-widest uppercase ${
                appTheme === "cosmic" ? "text-amber-900" : "text-amber-400"
              }`}>
                {state === AssistantState.CONNECTING ? "Establishing Core Link..." : "Waiting to go online..."}
              </p>
              <p className={`text-[9.5px] mt-0.5 leading-tight font-sans font-medium transition-colors duration-500 ${
                appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"
              }`}>
                {state === AssistantState.CONNECTING 
                  ? "Connecting voice capture socket..." 
                  : "Automatic Start is active. Attempting reconnection..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Toasts Stack */}
      <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-3 items-center pointer-events-none w-[90%] sm:w-[380px]">
        <AnimatePresence>
          {activeToasts.map((toast) => {
            let iconElement = null;
            let themeStyles = "";
            let pulseColor = "";

            if (toast.type === "success") {
              iconElement = <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
              themeStyles = appTheme === "cosmic"
                ? "bg-emerald-50/95 border-emerald-200 text-slate-800 shadow-emerald-200/20"
                : "bg-slate-900/95 border-emerald-500/30 text-slate-100 shadow-[0_10px_30px_rgba(16,185,129,0.2)]";
              pulseColor = "bg-emerald-500";
            } else if (toast.type === "warning") {
              iconElement = <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
              themeStyles = appTheme === "cosmic"
                ? "bg-amber-50/95 border-amber-200 text-slate-800 shadow-amber-200/20"
                : "bg-slate-900/95 border-amber-500/30 text-slate-100 shadow-[0_10px_30px_rgba(245,158,11,0.2)]";
              pulseColor = "bg-amber-500";
            } else if (toast.type === "error") {
              iconElement = <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
              themeStyles = appTheme === "cosmic"
                ? "bg-rose-50/95 border-rose-200 text-slate-800 shadow-rose-200/20"
                : "bg-slate-900/95 border-rose-500/30 text-slate-100 shadow-[0_10px_30px_rgba(244,63,94,0.2)]";
              pulseColor = "bg-rose-500";
            } else {
              iconElement = <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
              themeStyles = appTheme === "cosmic"
                ? "bg-indigo-50/95 border-indigo-200 text-slate-800 shadow-indigo-100/20"
                : "bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-[0_10px_30px_rgba(99,102,241,0.2)]";
              pulseColor = "bg-indigo-500";
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 240 }}
                className={`pointer-events-auto w-full px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center gap-3.5 transition-all duration-500 ${themeStyles}`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="flex h-3 w-3 items-center justify-center">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor}`}></span>
                    <span className="relative z-10">{iconElement}</span>
                  </span>
                </div>

                <div className="flex-grow min-w-0">
                  <p className="text-[11px] font-mono font-black tracking-widest uppercase truncate">
                    {toast.title}
                  </p>
                  <p className={`text-[9.5px] mt-0.5 leading-tight font-sans font-medium transition-colors duration-500 ${
                    appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className={`p-1.5 rounded-xl hover:bg-slate-500/10 transition-colors duration-200 shrink-0 cursor-pointer ${
                    appTheme === "cosmic" ? "text-slate-400 hover:text-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Slide-over Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop Overlay with light-themed shadow context */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSettingsOpen(false);
                setActivePopupTab(null);
              }}
              className="fixed inset-0 bg-slate-900/45 z-50 backdrop-blur-md"
            />
            
            {/* Right-Aligned Slide-Over Settings Drawer Panel (Light-Themed!) */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className={`fixed right-0 top-0 bottom-0 h-full w-full sm:w-[460px] border-l z-50 flex flex-col overflow-hidden backdrop-blur-3xl rounded-none transition-all duration-500 ${
                appTheme === "cosmic" 
                  ? "bg-white border-slate-200/90 text-slate-800 shadow-[-10px_0_50px_rgba(15,23,42,0.12)]" 
                  : "bg-black border-slate-850 text-slate-100 shadow-[-10px_0_50px_rgba(0,0,0,0.5)]"
              }`}
            >
              {/* Header */}
              <div className={`p-6 border-b flex items-center justify-between relative overflow-hidden transition-colors duration-500 ${
                appTheme === "cosmic" ? "border-slate-100 bg-slate-50 text-slate-900" : "border-slate-850 bg-black text-slate-100"
              }`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className={`w-4 h-4 animate-pulse transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-700" : "text-cyan-400"}`} />
                    <h3 className={`text-sm font-black tracking-widest font-mono uppercase transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-900" : "text-slate-100"}`}>
                      SETTINGS CONTROL PANEL
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 font-mono uppercase mt-1 tracking-wider">
                    Tune heuristics & speech parameters
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setActivePopupTab(null);
                  }}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-inner relative z-10 ${
                    appTheme === "cosmic"
                      ? "bg-slate-200 border border-slate-300 hover:bg-slate-300 text-slate-700 hover:text-slate-900"
                      : "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 hover:text-slate-100"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Settings Categories (As beautiful cards) */}
              <div className="flex-grow overflow-y-auto p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* General Settings Card */}
                  <div 
                    onClick={() => {
                      setActivePopupTab("general");
                      playChime(700, "sine");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group select-none ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-indigo-50/75 via-white to-sky-50/75 border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.12)] hover:border-indigo-700 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] text-slate-850"
                        : "bg-gradient-to-br from-indigo-950/45 via-slate-900/90 to-indigo-900/45 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.05)] hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] text-slate-100"
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold transition-colors ${appTheme === "cosmic" ? "text-indigo-700 group-hover:text-indigo-800" : "text-indigo-400 group-hover:text-indigo-350"}`}>
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">General Settings</h4>
                      </div>
                      <p className={`text-[9.5px] font-mono mt-0.5 leading-tight transition-colors ${appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"}`}>
                        Calibrate voice tone presets, sass playfulness index, interruption RMS limit gates, and bypass modes.
                      </p>
                    </div>
                  </div>

                  {/* Themes Layout Card */}
                  <div 
                    onClick={() => {
                      setActivePopupTab("themes");
                      playChime(750, "sine");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group select-none ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-amber-50/75 via-white to-orange-50/75 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:border-amber-700 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] text-slate-850"
                        : "bg-gradient-to-br from-amber-950/45 via-slate-900/90 to-orange-950/45 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.05)] hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] text-slate-100"
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold transition-colors ${appTheme === "cosmic" ? "text-amber-700 group-hover:text-amber-800" : "text-amber-400 group-hover:text-amber-350"}`}>
                        <Palette className="w-3.5 h-3.5 animate-pulse" />
                        <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">Themes Layout</h4>
                      </div>
                      <p className={`text-[9.5px] font-mono mt-0.5 leading-tight transition-colors ${appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"}`}>
                        Hot-reload global canvas visual styling, mesh gradients, neon highlights, and high-contrast ambient glows.
                      </p>
                    </div>
                  </div>

                  {/* Open/Close Logs Card */}
                  <div 
                    onClick={() => {
                      setActivePopupTab("history");
                      playChime(800, "sine");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group select-none ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-cyan-50/75 via-white to-sky-50/75 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.12)] hover:border-cyan-700 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-slate-850"
                        : "bg-gradient-to-br from-cyan-950/45 via-slate-900/90 to-sky-950/45 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.05)] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] text-slate-100"
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold transition-colors ${appTheme === "cosmic" ? "text-cyan-700 group-hover:text-cyan-800" : "text-cyan-400 group-hover:text-cyan-350"}`}>
                        <History className="w-3.5 h-3.5" />
                        <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">Open/Close Logs</h4>
                      </div>
                      <p className={`text-[9.5px] font-mono mt-0.5 leading-tight transition-colors ${appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"}`}>
                        Trace website sessions opened and closed by your AI Assistant, simulate live event triggers, and monitor active connection states.
                      </p>
                    </div>
                  </div>

                  {/* Notification Alerts Card */}
                  <div 
                    onClick={() => {
                      setActivePopupTab("notifications");
                      playChime(850, "sine");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group select-none ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-emerald-50/75 via-white to-teal-50/75 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.12)] hover:border-emerald-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] text-slate-850"
                        : "bg-gradient-to-br from-emerald-950/45 via-slate-900/90 to-teal-950/45 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.05)] hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-slate-100"
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold transition-colors ${appTheme === "cosmic" ? "text-emerald-700 group-hover:text-emerald-800" : "text-emerald-400 group-hover:text-emerald-350"}`}>
                        <Bell className="w-3.5 h-3.5 text-emerald-600" />
                        <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">Notifications</h4>
                      </div>
                      <p className={`text-[9.5px] font-mono mt-0.5 leading-tight transition-colors ${appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"}`}>
                        Configure synthesized acoustic alarms, caution beeps, alert volumes, and responsive chime gates.
                      </p>
                    </div>
                  </div>

                  {/* Zoya Bio Card */}
                  <div 
                    onClick={() => {
                      setActivePopupTab("bio");
                      playChime(600, "sine");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group select-none ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-purple-50/75 via-white to-rose-50/75 border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.12)] hover:border-purple-700 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] text-slate-850"
                        : "bg-gradient-to-br from-purple-950/45 via-slate-900/90 to-rose-950/45 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.05)] hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] text-slate-100"
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold transition-colors ${appTheme === "cosmic" ? "text-purple-700 group-hover:text-purple-800" : "text-purple-400 group-hover:text-purple-350"}`}>
                        <Flame className="w-3.5 h-3.5 text-purple-600" />
                        <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">{assistantName} Bio</h4>
                      </div>
                      <p className={`text-[9.5px] font-mono mt-0.5 leading-tight transition-colors ${appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"}`}>
                        Examine {assistantName}'s character core specifications, voice protocols, and view interactive conversation starter prompts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real-time Toggles Section */}
                <div className={`mt-4 pt-4 border-t space-y-3 transition-colors duration-500 ${appTheme === "cosmic" ? "border-slate-100" : "border-slate-800"}`}>
                  <h4 className="text-[10px] font-black tracking-widest text-slate-500 font-mono uppercase px-1 text-slate-400">
                    REAL-TIME SYSTEM CONTROLS
                  </h4>
                  
                  <div className="space-y-2">
                    {/* 1st Switch: Automatic Start */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all duration-500 ${
                      appTheme === "cosmic"
                        ? "bg-slate-50 border-slate-200/60 hover:bg-slate-50/80"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-950/80"
                    }`}>
                      <div className="flex gap-2 items-center">
                        <div className={`p-2 rounded-lg border transition-all duration-500 ${
                          appTheme === "cosmic"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : "bg-indigo-950/40 text-indigo-450 border-indigo-900/60"
                        }`}>
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className={`font-extrabold text-[10.5px] font-mono uppercase tracking-wider transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-800" : "text-slate-200"}`}>Automatic Start</p>
                          <p className={`text-[8.5px] leading-tight transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>Automatically connect session on app launch</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const val = !automaticStart;
                          setAutomaticStart(val);
                          localStorage.setItem("zoya_automatic_start", val.toString());
                          playChime(val ? 750 : 450, "sine");
                          addNotification("Auto Start Toggled", val ? "Enabled auto start on mount" : "Disabled auto start on mount", "info");
                          if (val && (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR)) {
                            connectSession();
                          }
                        }}
                        className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          automaticStart ? "bg-indigo-600" : appTheme === "cosmic" ? "bg-slate-200" : "bg-slate-800"
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${automaticStart ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>

                    {/* 2nd Switch: Light and Dark Mode */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all duration-500 ${
                      appTheme === "cosmic"
                        ? "bg-slate-50 border-slate-200/60 hover:bg-slate-50/80"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-950/80"
                    }`}>
                      <div className="flex gap-2 items-center">
                        <div className={`p-2 rounded-lg border transition-all duration-500 ${
                          appTheme === "cosmic"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-amber-950/40 text-amber-450 border-amber-900/60"
                        }`}>
                          {appTheme === "cosmic" ? <Sun className="w-3.5 h-3.5 animate-pulse" /> : <Moon className="w-3.5 h-3.5 animate-pulse" />}
                        </div>
                        <div>
                          <p className={`font-extrabold text-[10.5px] font-mono uppercase tracking-wider transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-800" : "text-slate-200"}`}>Light & Dark Mode</p>
                          <p className={`text-[8.5px] leading-tight transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>Switch between light (Cosmic) and dark (Cyberpunk) theme</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleLightDarkMode}
                        className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          appTheme !== "cosmic" ? "bg-amber-600" : appTheme === "cosmic" ? "bg-slate-200" : "bg-slate-800"
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${appTheme !== "cosmic" ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>

                    {/* 3rd Switch: Permissions On */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all duration-500 ${
                      appTheme === "cosmic"
                        ? "bg-slate-50 border-slate-200/60 hover:bg-slate-50/80"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-950/80"
                    }`}>
                      <div className="flex gap-2 items-center">
                        <div className={`p-2 rounded-lg border transition-all duration-500 ${
                          appTheme === "cosmic"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-emerald-950/40 text-emerald-450 border-emerald-900/60"
                        }`}>
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className={`font-extrabold text-[10.5px] font-mono uppercase tracking-wider transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-800" : "text-slate-200"}`}>Permissions On</p>
                          <p className={`text-[8.5px] leading-tight transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-500" : "text-slate-400"}`}>Request browser microphone authorization</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleMicPermission}
                        className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          micPermissionGranted ? "bg-emerald-600" : appTheme === "cosmic" ? "bg-slate-200" : "bg-slate-800"
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${micPermissionGranted ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  {/* User Profile Card */}
                  <div className={`mt-4 pt-4 border-t transition-colors duration-500 ${appTheme === "cosmic" ? "border-slate-100" : "border-slate-800"}`}>
                    <h4 className="text-[10px] font-black tracking-widest text-slate-500 font-mono uppercase px-1 mb-2.5">
                      USER PROFILE IDENTIFIER
                    </h4>
                    <div className={`relative p-4 rounded-2xl border shadow-sm transition-all duration-500 flex items-center justify-between group overflow-hidden ${
                      appTheme === "cosmic"
                        ? "bg-slate-50 border-slate-200/60 hover:border-slate-300"
                        : "bg-black border-slate-850 hover:border-slate-800"
                    }`}>
                      {/* Background subtle decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-3.5 relative z-10">
                        {/* Profile Image/Avatar Container */}
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 rounded-full overflow-hidden border flex items-center justify-center bg-black transition-all duration-500 ${
                            appTheme === "cosmic" ? "border-indigo-100" : "border-indigo-500/25 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                          }`}>
                            {userProfile.avatarUrl ? (
                              <img 
                                src={userProfile.avatarUrl} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow-sm">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          </div>
                        </div>

                        {/* Profile Details */}
                        <div>
                          <p className={`font-black text-sm tracking-wide transition-colors duration-500 ${
                            appTheme === "cosmic" ? "text-slate-850" : "text-white"
                          }`}>
                            {userProfile.firstName} {userProfile.lastName}
                          </p>
                          <p className={`text-[10px] font-mono tracking-wider mt-0.5 transition-colors duration-500 flex items-center gap-1 ${
                            appTheme === "cosmic" ? "text-indigo-600" : "text-indigo-400 font-bold"
                          }`}>
                            <span className="opacity-60 font-sans">ID:</span> {userProfile.userId}
                          </p>
                          <p className={`text-[9px] font-sans mt-0.5 transition-colors duration-500 opacity-60 ${
                            appTheme === "cosmic" ? "text-slate-650" : "text-slate-400"
                          }`}>
                            {userProfile.email}
                          </p>
                        </div>
                      </div>

                      {/* Edit Button Icon (Right side corner) */}
                      <button
                        onClick={() => {
                          setIsProfileEditOpen(true);
                          playChime(650, "sine");
                        }}
                        title="Edit Profile"
                        className={`p-2.5 rounded-xl border transition-all duration-300 relative z-10 cursor-pointer shadow-md shrink-0 ${
                          appTheme === "cosmic"
                            ? "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50"
                            : "bg-neutral-900 border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white hover:bg-black"
                        }`}
                      >
                        <Edit className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
                      </button>
                    </div>
                  </div>
                </div>


              </div>
            </motion.div>

            {/* FLOATING SUB-POPUP WINDOW (Spawns with gorgeous animation when tab is clicked!) */}
            <AnimatePresence>
              {activePopupTab && (
                <>
                  {/* Floating Sub-Popup Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.65 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePopupTab(null)}
                    className="fixed inset-0 bg-slate-950/40 z-[60] backdrop-blur-sm"
                  />

                  {/* Centered Floating Popup Card Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-47%" }}
                    animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                    exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "-48%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className={`fixed left-1/2 top-1/2 w-[90%] sm:w-full max-w-lg max-h-[80vh] border shadow-2xl z-[60] flex flex-col overflow-hidden rounded-[2.25rem] transition-all duration-500 ${
                      appTheme === "cosmic"
                        ? activePopupTab === "general"
                          ? "bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-200 text-slate-800"
                          : activePopupTab === "themes"
                          ? "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200 text-slate-800"
                          : activePopupTab === "history"
                          ? "bg-gradient-to-br from-cyan-50 via-white to-sky-50 border-cyan-200 text-slate-800"
                          : activePopupTab === "bio"
                          ? "bg-gradient-to-br from-purple-50 via-white to-rose-50 border-purple-200 text-slate-800"
                          : activePopupTab === "actions"
                          ? "bg-gradient-to-br from-cyan-50 via-white to-sky-50 border-cyan-200 text-slate-800"
                          : "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200 text-slate-800"
                        : activePopupTab === "general"
                        ? "bg-gradient-to-br from-indigo-950/95 via-black to-black border-indigo-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : activePopupTab === "themes"
                        ? "bg-gradient-to-br from-amber-950/95 via-black to-black border-amber-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : activePopupTab === "history"
                        ? "bg-gradient-to-br from-cyan-950/95 via-black to-black border-cyan-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : activePopupTab === "bio"
                        ? "bg-gradient-to-br from-purple-950/95 via-black to-black border-purple-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : activePopupTab === "actions"
                        ? "bg-gradient-to-br from-cyan-950/95 via-black to-black border-cyan-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : "bg-gradient-to-br from-emerald-950/95 via-black to-black border-emerald-800/60 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {/* Sub-popup Header */}
                    <div className={`p-5 border-b flex items-center justify-between transition-colors duration-500 backdrop-blur-sm ${
                      appTheme === "cosmic" ? "border-slate-100 bg-white/60 text-slate-950" : "border-slate-800 bg-slate-950/40 text-slate-100"
                    }`}>
                      <div className="flex items-center gap-2">
                        {activePopupTab === "general" && <SlidersHorizontal className={`w-4 h-4 ${appTheme === "cosmic" ? "text-indigo-750" : "text-indigo-400"}`} />}
                        {activePopupTab === "themes" && <Palette className={`w-4 h-4 animate-pulse ${appTheme === "cosmic" ? "text-amber-750" : "text-amber-400"}`} />}
                        {activePopupTab === "history" && <History className={`w-4 h-4 ${appTheme === "cosmic" ? "text-cyan-750" : "text-cyan-400"}`} />}
                        {activePopupTab === "notifications" && <Bell className={`w-4 h-4 animate-bounce ${appTheme === "cosmic" ? "text-emerald-750" : "text-emerald-400"}`} />}
                        {activePopupTab === "bio" && <Flame className={`w-4 h-4 ${appTheme === "cosmic" ? "text-purple-750" : "text-purple-400"}`} />}
                        {activePopupTab === "actions" && <Globe className={`w-4 h-4 animate-spin-slow ${appTheme === "cosmic" ? "text-cyan-750" : "text-cyan-400"}`} />}
                        
                        <h4 className={`text-xs font-black tracking-widest font-mono uppercase transition-colors duration-500 ${
                          appTheme === "cosmic"
                            ? activePopupTab === "general" ? "text-indigo-950" :
                              activePopupTab === "themes" ? "text-amber-950" :
                              activePopupTab === "history" ? "text-cyan-950" :
                              activePopupTab === "bio" ? "text-purple-950" :
                              activePopupTab === "actions" ? "text-cyan-950" :
                              "text-emerald-950"
                            : activePopupTab === "general" ? "text-indigo-400" :
                              activePopupTab === "themes" ? "text-amber-400" :
                              activePopupTab === "history" ? "text-cyan-400" :
                              activePopupTab === "bio" ? "text-purple-400" :
                              activePopupTab === "actions" ? "text-cyan-400" :
                              "text-emerald-400"
                        }`}>
                          {activePopupTab === "general" && "General Settings Panel"}
                          {activePopupTab === "themes" && "Themes Config Panel"}
                          {activePopupTab === "history" && "Open & Close Activity Logs"}
                          {activePopupTab === "bio" && `${assistantName} Companion Bio`}
                          {activePopupTab === "actions" && `${assistantName}'s Browser Actions`}
                          {activePopupTab === "notifications" && "Alerts & Chimes Setup"}
                        </h4>
                      </div>
                      <button
                        onClick={() => setActivePopupTab(null)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-inner ${
                          appTheme === "cosmic"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sub-popup Scrollable Content */}
                    <div className={`flex-grow overflow-y-auto p-6 space-y-5 transition-colors duration-500 ${appTheme === "cosmic" ? "text-slate-700" : "text-slate-200"}`}>
                      
                      {/* SUB-POPUP: GENERAL SETTINGS */}
                      {activePopupTab === "general" && (
                        <div className="space-y-4">
                          {/* 1. Assistant Name Setting Card */}
                          <div className="space-y-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                              <span>AI Assistant Name</span>
                            </label>
                            <input
                              type="text"
                              value={assistantName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAssistantName(val);
                                localStorage.setItem("zoya_assistant_name", val);
                              }}
                              placeholder="e.g. Zoya, Jarvis, Maya..."
                              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 rounded-xl p-3 focus:outline-none transition-all shadow-sm"
                            />
                            <p className="text-[9.5px] text-slate-400 font-sans italic">
                              Rename your sassy companion core dynamically.
                            </p>
                          </div>

                          {/* 2. Voice Selector Card (Male / Female) */}
                          <div className="space-y-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                              <Mic className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Voice Gender Profile</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setVoiceGender("Female");
                                  localStorage.setItem("zoya_voice_gender", "Female");
                                  playChime(660, "sine");
                                }}
                                className={`py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  voiceGender === "Female"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${voiceGender === "Female" ? "bg-pink-500 animate-ping" : "bg-slate-300"}`} />
                                Female
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVoiceGender("Male");
                                  localStorage.setItem("zoya_voice_gender", "Male");
                                  playChime(440, "sine");
                                }}
                                className={`py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  voiceGender === "Male"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${voiceGender === "Male" ? "bg-cyan-400 animate-ping" : "bg-slate-300"}`} />
                                Male
                              </button>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-sans italic">
                              Select between the expressive Female voice or the energetic Male voice profile.
                            </p>
                          </div>

                          {/* 3. Language Selector Card (Hindi / English / Both) */}
                          <div className="space-y-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                              <Languages className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Conversation Language</span>
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setLanguage("English");
                                  localStorage.setItem("zoya_language", "English");
                                  playChime(750, "sine");
                                }}
                                className={`py-2 px-1 rounded-xl text-[10.5px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  language === "English"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                English
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLanguage("Hindi");
                                  localStorage.setItem("zoya_language", "Hindi");
                                  playChime(850, "sine");
                                }}
                                className={`py-2 px-1 rounded-xl text-[10.5px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  language === "Hindi"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                Hindi
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLanguage("Both");
                                  localStorage.setItem("zoya_language", "Both");
                                  playChime(950, "sine");
                                }}
                                className={`py-2 px-1 rounded-xl text-[10.5px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  language === "Both"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                Both
                              </button>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-sans italic">
                              Instruct your companion to reply in witty English, playful Hindi, or a bilingual mix of both.
                            </p>
                          </div>

                          {/* 4. Country Timezone Selector Card */}
                          <div className="space-y-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                              <Globe className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Select Country</span>
                            </label>
                            <p className="text-[9.5px] text-slate-400 font-sans italic pb-1">
                              Pick a country to synchronize Zoya's timezone clock and date representation instantly.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { code: "IN", label: "India 🇮🇳", tz: "Asia/Kolkata" },
                                { code: "US", label: "United States 🇺🇸", tz: "America/New_York" },
                                { code: "GB", label: "United Kingdom 🇬🇧", tz: "Europe/London" },
                                { code: "JP", label: "Japan 🇯🇵", tz: "Asia/Tokyo" },
                                { code: "DE", label: "Germany 🇩🇪", tz: "Europe/Berlin" }
                              ].map((item) => (
                                <button
                                  key={item.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(item.code);
                                    localStorage.setItem("zoya_selected_country", item.code);
                                    playChime(600 + (item.code.charCodeAt(0) * 3), "triangle");
                                  }}
                                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                                    selectedCountry === item.code
                                      ? "bg-indigo-950 text-indigo-100 shadow-md border-2 border-indigo-500/40"
                                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {selectedCountry === item.code && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 5. Fully Functional Date & Time Customizer */}
                          <div className="space-y-3 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Date & Time Settings</span>
                              </label>
                              <span className="text-[9px] font-mono bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded font-bold uppercase">
                                {timeMode === "system" ? "SYNCED" : "MANUAL"}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-sans italic">
                              Choose between syncing dynamically with standard actual system clock or overriding to custom values.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setTimeMode("system");
                                  localStorage.setItem("zoya_time_mode", "system");
                                  // Reset custom offset
                                  setCustomTimeOffset(0);
                                  localStorage.setItem("zoya_custom_time_offset", "0");
                                  playChime(500, "sine");
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  timeMode === "system"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border border-indigo-500/30"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                <RefreshCw className={`w-3 h-3 ${timeMode === "system" ? "animate-spin" : ""}`} />
                                Sync Live Time
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setTimeMode("custom");
                                  localStorage.setItem("zoya_time_mode", "custom");
                                  // Calculate initial offset from currently selected customDate and customTime
                                  try {
                                    const customTarget = new Date(`${customDate}T${customTime}`);
                                    const offset = customTarget.getTime() - Date.now();
                                    setCustomTimeOffset(offset);
                                    localStorage.setItem("zoya_custom_time_offset", offset.toString());
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  playChime(620, "sine");
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  timeMode === "custom"
                                    ? "bg-indigo-950 text-indigo-100 shadow-md border border-indigo-500/30"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
                                }`}
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                Custom Override
                              </button>
                            </div>

                            {timeMode === "custom" && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-2.5 pt-2 border-t border-indigo-100/60 overflow-hidden"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" /> Date
                                    </span>
                                    <input
                                      type="date"
                                      value={customDate}
                                      onChange={(e) => {
                                        const newD = e.target.value;
                                        setCustomDate(newD);
                                        localStorage.setItem("zoya_custom_date", newD);
                                        // Re-calculate offset
                                        const customTarget = new Date(`${newD}T${customTime}`);
                                        const offset = customTarget.getTime() - Date.now();
                                        setCustomTimeOffset(offset);
                                        localStorage.setItem("zoya_custom_time_offset", offset.toString());
                                      }}
                                      className="w-full text-xs font-mono bg-white border border-slate-200 hover:border-indigo-400 focus:outline-none rounded-xl p-2 font-bold text-slate-800"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" /> Time
                                    </span>
                                    <input
                                      type="time"
                                      value={customTime}
                                      step="60" // minutes/seconds
                                      onChange={(e) => {
                                        const newT = e.target.value;
                                        setCustomTime(newT);
                                        localStorage.setItem("zoya_custom_time", newT);
                                        // Re-calculate offset
                                        const customTarget = new Date(`${customDate}T${newT}`);
                                        const offset = customTarget.getTime() - Date.now();
                                        setCustomTimeOffset(offset);
                                        localStorage.setItem("zoya_custom_time_offset", offset.toString());
                                      }}
                                      className="w-full text-xs font-mono bg-white border border-slate-200 hover:border-indigo-400 focus:outline-none rounded-xl p-2 font-bold text-slate-800"
                                    />
                                  </div>
                                </div>
                                <div className="p-2 bg-amber-50 rounded-lg text-[9px] text-amber-800 font-sans leading-relaxed border border-amber-100 flex items-start gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                                  <span>
                                    Dynamic override mode: clock will continue ticking relative to your selected custom date/time!
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* 6. Header Bar Uptime Toggle Switch Card */}
                          <div className="space-y-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-indigo-100 p-4.5 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 pr-2">
                                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Uptime HUD Display</span>
                                </label>
                                <p className="text-[9.5px] text-slate-400 font-sans italic leading-tight">
                                  Show or hide the real-time ticking session uptime monitor in the top header bar.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !uptimeEnabled;
                                  setUptimeEnabled(newVal);
                                  localStorage.setItem("zoya_uptime_enabled", newVal ? "true" : "false");
                                  playChime(newVal ? 720 : 540, "sine");
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${uptimeEnabled ? "bg-indigo-950" : "bg-slate-200"}`}
                              >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${uptimeEnabled ? "translate-x-5" : "translate-x-0"}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB-POPUP: THEMES CONFIG PANEL */}
                      {activePopupTab === "themes" && (
                        <div className="space-y-4">
                          <p className="text-[11px] text-amber-900 font-sans leading-relaxed">
                            Select an active color preset. Swapping dynamically triggers an app-wide update of active mesh gradients and accent rings instantly.
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: "cosmic", name: "Cosmic Slate (Default)", desc: "Deep indigo highlights with slate dark curves.", preview: "bg-gradient-to-r from-indigo-500 to-purple-600" }
                            ].map((themeOpt) => {
                              const isSelected = appTheme === themeOpt.id;
                              return (
                                <button
                                  key={themeOpt.id}
                                  onClick={() => {
                                    setAppTheme(themeOpt.id as any);
                                    localStorage.setItem("zoya_app_theme", themeOpt.id);
                                    playChime(isSelected ? 600 : 880, "sine");
                                  }}
                                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                                    isSelected 
                                      ? "bg-amber-100/40 border-amber-500 shadow-md" 
                                      : "bg-white/80 border-slate-200 hover:border-amber-400 hover:bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 relative z-10">
                                    <div className={`w-8 h-8 rounded-full ${themeOpt.preview} shadow-inner border border-white/25 group-hover:scale-105 transition-transform`} />
                                    <div>
                                      <p className="text-xs font-black text-slate-800 font-sans group-hover:text-amber-950 transition-colors">{themeOpt.name}</p>
                                      <p className="text-[9px] text-slate-500 leading-normal font-sans">{themeOpt.desc}</p>
                                    </div>
                                  </div>

                                  {isSelected ? (
                                    <div className="p-1 bg-amber-950 text-white rounded-lg">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  ) : (
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Glowing Effects Switches */}
                          <div className="space-y-3 pt-3 border-t border-amber-100/60 text-xs font-semibold text-slate-700">
                            <h4 className="font-extrabold text-[10px] text-amber-900 uppercase font-mono tracking-widest">
                              Glow Configuration
                            </h4>

                            {/* Header Bar Glowing Switch */}
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-amber-100/50 shadow-sm hover:bg-white transition-colors">
                              <div>
                                <p className="font-bold text-slate-800 text-xs">Header Bar Glowing</p>
                                <p className="text-[9px] text-slate-400 font-normal">Enable ambient glow around status bar</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !headerGlowEnabled;
                                  setHeaderGlowEnabled(newVal);
                                  localStorage.setItem("zoya_header_glow_enabled", newVal.toString());
                                  playChime(newVal ? 850 : 500, "triangle");
                                }}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0 ${
                                  headerGlowEnabled ? "bg-amber-950" : "bg-slate-200"
                                }`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${headerGlowEnabled ? "translate-x-5" : "translate-x-1"}`} />
                              </button>
                            </div>

                            {/* AI Assistant Card Glowing Switch */}
                            <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-amber-100/50 shadow-sm hover:bg-white transition-colors">
                              <div>
                                <p className="font-bold text-slate-800 text-xs">AI Assistant Card Glowing</p>
                                <p className="text-[9px] text-slate-400 font-normal">Enable live breathing visualizer glow</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !aiCardGlowEnabled;
                                  setAiCardGlowEnabled(newVal);
                                  localStorage.setItem("zoya_ai_card_glow_enabled", newVal.toString());
                                  playChime(newVal ? 850 : 500, "triangle");
                                }}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0 ${
                                  aiCardGlowEnabled ? "bg-amber-950" : "bg-slate-200"
                                }`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${aiCardGlowEnabled ? "translate-x-5" : "translate-x-1"}`} />
                              </button>
                            </div>

                            {/* Wave Style Dropdown Option */}
                            <div className="space-y-1.5 pt-3 border-t border-amber-100/60">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-800 text-xs">Wave Visual Style</p>
                                <span className="text-[9px] font-mono bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                  Visualizer Mode
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-normal leading-tight pb-1">
                                Choose the wave visualizer style (circular, electric plasma, smooth curves, radio transmitter, or voice spectrogram).
                              </p>
                              <div className="relative">
                                <select
                                  id="wave-style-select"
                                  value={waveStyle}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setWaveStyle(val);
                                    localStorage.setItem("zoya_wave_style", val);
                                    playChime(800, "sine");
                                  }}
                                  className="w-full bg-white/85 hover:bg-white text-slate-700 font-bold text-xs p-2.5 rounded-2xl border border-amber-100/50 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer appearance-none pr-8"
                                >
                                  <option value="curve">〰️ Curve Wave (Smooth Ribbons)</option>
                                  <option value="circular">⭕ Circular Portal (Expanding Rings)</option>
                                  <option value="electric">⚡ Electric Plasma (Jagged Sparks)</option>
                                  <option value="radio">📻 Radio Transceiver (RF Oscilloscope)</option>
                                  <option value="voice">🎙️ Voice Spectrogram (Vocal Print)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB-POPUP: DETAILED BROWSER ACTIONS LOG */}
                      {activePopupTab === "history" && (
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                          <WebsiteLogs 
                            logs={websiteLogs} 
                            onAddLog={(newLog) => setWebsiteLogs((prev) => [newLog, ...prev])}
                            onClearLogs={() => setWebsiteLogs([])}
                            assistantName={assistantName}
                          />
                        </div>
                      )}

                      {/* SUB-POPUP: ALERTS & CHIMES SETUP */}
                      {activePopupTab === "notifications" && (
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                          <p className="text-[11px] text-emerald-900 font-sans leading-relaxed">
                            Configure synthesized vocal tones, acoustic sound alarms, caution loops, and toggle your header bar live notification stream.
                          </p>

                          {/* 1. MASTER HEADER NOTIFICATION SWITCH */}
                          <div className="bg-emerald-950 text-emerald-50 p-4 rounded-2xl border border-emerald-800 shadow-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-extrabold text-[12px] font-mono uppercase tracking-wider text-emerald-300">
                                  Header Bar Notifications Feed
                                </p>
                                <p className="text-[9.5px] text-emerald-200/80 font-normal leading-normal">
                                  Turn on to view instant alerts in the top bar; turn off to hide completely.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  const newVal = !showNotificationsInHeader;
                                  setShowNotificationsInHeader(newVal);
                                  localStorage.setItem("zoya_show_notif_header", newVal.toString());
                                  playChime(newVal ? 900 : 450, "sine");
                                }}
                                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                                  showNotificationsInHeader ? "bg-emerald-400" : "bg-slate-700"
                                }`}
                              >
                                <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform ${showNotificationsInHeader ? "translate-x-6.5" : "translate-x-1"}`} />
                              </button>
                            </div>
                          </div>

                          {/* 2. PARAMETERS CARDS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Sound Alert Volume Slider */}
                            <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>Alert Volume Decibels</span>
                                  <span className="text-emerald-800 font-mono font-black">{alertVolume}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={alertVolume}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setAlertVolume(val);
                                    localStorage.setItem("zoya_alert_volume", val.toString());
                                  }}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-950 outline-none"
                                />
                              </div>
                              <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                <span>Min (10%)</span>
                                <span>Full Blast (100%)</span>
                              </div>
                            </div>

                            {/* Audio Switches */}
                            <div className="space-y-2.5 text-xs font-semibold text-slate-700 bg-white/60 p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                              {/* Speech alert switch */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-slate-800 text-[11px]">Speech Audio Alerts</p>
                                  <p className="text-[9px] text-slate-400 font-normal">Spoken companion voices</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const newVal = !speechAlerts;
                                    setSpeechAlerts(newVal);
                                    localStorage.setItem("zoya_speech_alerts", newVal.toString());
                                    playChime(newVal ? 700 : 500, "triangle");
                                  }}
                                  className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                                    speechAlerts ? "bg-emerald-950" : "bg-slate-200"
                                  }`}
                                >
                                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${speechAlerts ? "translate-x-5" : "translate-x-1"}`} />
                                </button>
                              </div>

                              {/* Interruption caution switch */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                                <div>
                                  <p className="font-bold text-slate-800 text-[11px]">Interruption Chime</p>
                                  <p className="text-[9px] text-slate-400 font-normal">Sound warning on voice bypass</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const newVal = !interruptionBeep;
                                    setInterruptionBeep(newVal);
                                    localStorage.setItem("zoya_interruption_beep", newVal.toString());
                                    playChime(newVal ? 900 : 400, "triangle");
                                  }}
                                  className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                                    interruptionBeep ? "bg-emerald-950" : "bg-slate-200"
                                  }`}
                                >
                                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${interruptionBeep ? "translate-x-5" : "translate-x-1"}`} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 3. NOTIFICATION FEED MODULE */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[10px] uppercase font-black tracking-wider">
                                <Bell className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                                <span>Live Notification Log ({notifications.length})</span>
                              </div>
                              {notifications.length > 0 && (
                                <button
                                  onClick={clearAllNotifications}
                                  className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 hover:underline transition-colors cursor-pointer"
                                >
                                  Clear Logs
                                </button>
                              )}
                            </div>

                            <div className="space-y-2 max-h-[250px] overflow-y-auto bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                              {notifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 font-mono text-[10px] uppercase tracking-wider space-y-1">
                                  <MessageCircleOff className="w-5 h-5 mx-auto text-slate-350 stroke-[1.5]" />
                                  <p>No logged alerts</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {notifications.map((notif) => (
                                    <div
                                      key={notif.id}
                                      onClick={() => markNotificationAsRead(notif.id)}
                                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-2.5 relative group cursor-pointer ${
                                        notif.read 
                                          ? "bg-white/60 border-slate-100/80 opacity-75 hover:opacity-100" 
                                          : "bg-white border-emerald-100/90 shadow-sm hover:border-emerald-300"
                                      }`}
                                    >
                                      {/* Icon matching Type */}
                                      <div className="flex-shrink-0 mt-0.5">
                                        {notif.type === "success" && (
                                          <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                                          </div>
                                        )}
                                        {notif.type === "info" && (
                                          <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                                          </div>
                                        )}
                                        {notif.type === "warning" && (
                                          <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                                            <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                                          </div>
                                        )}
                                        {notif.type === "error" && (
                                          <div className="w-4 h-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                                            <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Text block */}
                                      <div className="flex-grow min-w-0 pr-6">
                                        <div className="flex items-center gap-1.5">
                                          <h5 className="font-extrabold text-[11px] font-sans text-slate-800 truncate">
                                            {notif.title}
                                          </h5>
                                          {!notif.read && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                                          )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-normal">
                                          {notif.message}
                                        </p>
                                        <span className="text-[8px] text-slate-400 font-mono font-bold block mt-1 tracking-wider uppercase">
                                          {notif.timestamp}
                                        </span>
                                      </div>

                                      {/* Individual Delete Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notif.id);
                                        }}
                                        className="absolute right-2.5 top-2.5 text-slate-350 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                        title="Delete Log"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Test Active Chime Sound Button */}
                          <button
                            onClick={() => {
                              playChime(880, "sine");
                              addNotification("Manual Diagnostics Check", "Acoustic buzzer chime system verified as functioning fully.", "info");
                            }}
                            className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-blue-50 font-black rounded-xl text-[10px] font-mono tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md"
                          >
                            <Bell className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                            Test Auditory Response Beep
                          </button>
                        </div>
                      )}

                      {/* SUB-POPUP: ZOYA COMPANION BIO */}
                      {activePopupTab === "bio" && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          <PersonalitySheet 
                            assistantName={assistantName} 
                            micPermissionGranted={micPermissionGranted}
                            toggleMicPermission={toggleMicPermission}
                            onAddNotification={addNotification}
                          />
                        </div>
                      )}

                      {/* SUB-POPUP: ZOYA'S BROWSER ACTIONS */}
                      {activePopupTab === "actions" && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          <WebsiteLogs 
                            logs={websiteLogs} 
                            onAddLog={(newLog) => setWebsiteLogs((prev) => [newLog, ...prev])}
                            onClearLogs={() => setWebsiteLogs([])}
                            assistantName={assistantName}
                          />
                        </div>
                      )}

                    </div>

                    {/* Sub-popup Footer Close */}
                    <div className="p-4 bg-white/70 border-t border-slate-100 flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setActivePopupTab(null)}
                        className={`py-3.5 px-6 rounded-2xl font-black text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                          activePopupTab === "general" ? "bg-indigo-950 hover:bg-indigo-900 text-indigo-50" :
                          activePopupTab === "themes" ? "bg-amber-950 hover:bg-amber-900 text-amber-50" :
                          activePopupTab === "history" ? "bg-cyan-950 hover:bg-cyan-900 text-cyan-50" :
                          activePopupTab === "bio" ? "bg-purple-950 hover:bg-purple-900 text-purple-50" :
                          activePopupTab === "actions" ? "bg-cyan-950 hover:bg-cyan-900 text-cyan-50" :
                          "bg-emerald-950 hover:bg-emerald-900 text-emerald-50"
                        }`}
                      >
                        Apply & Save Parameters
                      </button>
                    </div>

                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* FLOATING USER PROFILE EDIT POPUP WINDOW (Fully animated with beautiful entry transitions) */}
            <AnimatePresence>
              {isProfileEditOpen && (
                <>
                  {/* Floating Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.65 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsProfileEditOpen(false)}
                    className="fixed inset-0 bg-slate-950/50 z-[60] backdrop-blur-sm"
                  />

                  {/* Centered Floating Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-47%" }}
                    animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                    exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "-48%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className={`fixed left-1/2 top-1/2 w-[92%] sm:w-full max-w-lg max-h-[85vh] border shadow-2xl z-[60] flex flex-col overflow-hidden rounded-[2.25rem] transition-all duration-500 ${
                      appTheme === "cosmic"
                        ? "bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-purple-200 text-slate-800"
                        : "bg-black border-slate-850 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                    }`}
                  >
                    {/* Header */}
                    <div className={`p-5 border-b flex items-center justify-between transition-colors duration-500 backdrop-blur-sm ${
                      appTheme === "cosmic" ? "border-slate-100 bg-white/60 text-slate-950" : "border-slate-850 bg-black/40 text-slate-100"
                    }`}>
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${appTheme === "cosmic" ? "text-purple-600" : "text-indigo-400"}`} />
                        <h4 className={`text-xs font-black tracking-widest font-mono uppercase transition-colors duration-500 ${
                          appTheme === "cosmic" ? "text-purple-950" : "text-indigo-400"
                        }`}>
                          EDIT USER IDENTITY PROFILE
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileEditOpen(false);
                          playChime(450, "sine");
                        }}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          appTheme === "cosmic"
                            ? "bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                            : "bg-neutral-900 border border-slate-800 hover:bg-black text-slate-450 hover:text-white"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-5">
                      {/* Avatar Selection & Upload Section */}
                      <div className={`flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border transition-colors duration-500 ${
                        appTheme === "cosmic" ? "bg-slate-50/50 border-purple-100" : "bg-black/40 border-slate-850"
                      }`}>
                        <div className="relative shrink-0">
                          <div className={`w-20 h-20 rounded-full overflow-hidden border flex items-center justify-center bg-black transition-all duration-500 ${
                            appTheme === "cosmic" ? "border-purple-200" : "border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          }`}>
                            {profileDraft.avatarUrl ? (
                              <img 
                                src={profileDraft.avatarUrl} 
                                alt="Draft Avatar" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-8 h-8 text-indigo-400" />
                            )}
                          </div>
                          <label className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border cursor-pointer shadow-lg transition-transform hover:scale-110 flex items-center justify-center ${
                            appTheme === "cosmic"
                              ? "bg-white border-slate-200 text-slate-700"
                              : "bg-indigo-600 border-slate-900 text-white"
                          }`}>
                            <Camera className="w-3.5 h-3.5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleProfilePhotoUpload} 
                            />
                          </label>
                        </div>

                        <div className="flex-grow space-y-2 text-center sm:text-left">
                          <p className={`text-[11px] font-mono tracking-widest uppercase ${
                            appTheme === "cosmic" ? "text-purple-750" : "text-indigo-400 font-black"
                          }`}>
                            Customize Profile Photo
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            Upload a JPG/PNG, or type a custom text string below to dynamically generate a robo-avatar seed.
                          </p>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Avatar seed (e.g. Rajat)"
                              value={profileDraft.avatarUrl.startsWith("https://api.dicebear.com") ? (decodeURIComponent(profileDraft.avatarUrl.split("seed=")[1] || "")) : ""}
                              onChange={(e) => {
                                const seed = e.target.value.trim() || "Rajat";
                                setProfileDraft(prev => ({
                                  ...prev,
                                  avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`
                                }));
                              }}
                              className={`flex-grow border rounded-xl px-3 py-1.5 text-[10.5px] outline-none transition-all ${
                                appTheme === "cosmic"
                                  ? "bg-slate-50 border-slate-200 text-slate-850 focus:bg-white"
                                  : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Input fields in Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* User ID */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">User ID</label>
                          <input
                            type="text"
                            value={profileDraft.userId}
                            disabled
                            placeholder="e.g. 807768"
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all cursor-not-allowed opacity-60 ${
                              appTheme === "cosmic"
                                ? "bg-slate-100 border-slate-200 text-slate-500"
                                : "bg-zinc-900 border-slate-800 text-slate-400"
                            }`}
                          />
                        </div>

                        {/* First Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">First Name</label>
                          <input
                            type="text"
                            value={profileDraft.firstName}
                            onChange={(e) => setProfileDraft(prev => ({ ...prev, firstName: e.target.value }))}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all ${
                              appTheme === "cosmic"
                                ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                            }`}
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Last Name</label>
                          <input
                            type="text"
                            value={profileDraft.lastName}
                            onChange={(e) => setProfileDraft(prev => ({ ...prev, lastName: e.target.value }))}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all ${
                              appTheme === "cosmic"
                                ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                            }`}
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Date of Birth</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={profileDraft.dob}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, dob: e.target.value }))}
                              className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all ${
                                appTheme === "cosmic"
                                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                  : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                              }`}
                            />
                            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Mobile Number</label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={profileDraft.mobile}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, mobile: e.target.value }))}
                              className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all ${
                                appTheme === "cosmic"
                                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                  : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                              }`}
                            />
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Gmail Address */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Gmail Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={profileDraft.email}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, email: e.target.value }))}
                              className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all ${
                                appTheme === "cosmic"
                                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                  : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                              }`}
                            />
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Physical Address */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={profileDraft.address}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, address: e.target.value }))}
                              className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all ${
                                appTheme === "cosmic"
                                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-300"
                                  : "bg-black border-slate-800 text-slate-200 focus:border-indigo-500/80"
                              }`}
                            />
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Close & Save Actions */}
                    <div className={`p-4 border-t flex items-center justify-end gap-2.5 transition-colors duration-500 backdrop-blur-md ${
                      appTheme === "cosmic" ? "bg-slate-50/80 border-slate-100" : "bg-neutral-950/60 border-slate-850"
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileEditOpen(false);
                          playChime(450, "sine");
                        }}
                        className={`py-3 px-5 rounded-2xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          appTheme === "cosmic"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            : "bg-neutral-900 hover:bg-black text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          let finalId = profileDraft.userId.replace(/\D/g, "");
                          if (!/^(8077|8078|8079)/.test(finalId)) {
                            finalId = "8077" + (finalId || "68");
                          }
                          const updated = { ...profileDraft, userId: finalId };
                          setUserProfile(updated);
                          localStorage.setItem("zoya_user_profile", JSON.stringify(updated));
                          setIsProfileEditOpen(false);
                          playChime(880, "sine");
                          addNotification(
                            "Profile Saved", 
                            `${updated.firstName}'s identity profile was saved with ID ${updated.userId}.`, 
                            "success"
                          );
                        }}
                        className={`py-3.5 px-6 rounded-2xl text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer shadow-lg ${
                          appTheme === "cosmic"
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/15"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                        }`}
                      >
                        Save Profile
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`relative z-10 w-full max-w-7xl mx-auto px-6 py-5 border-t transition-colors duration-500 rounded-b-2xl mt-8 ${
        appTheme === "cosmic" 
          ? "border-slate-200/60 bg-white/40 text-slate-500" 
          : "border-slate-850 bg-black/60 text-slate-400"
      }`}>
        {/* Footer Base Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono gap-3">
          <div className="max-w-2xl text-center sm:text-left leading-relaxed">
            &copy; 2026 {assistantName} Core Labs. Built with precision. All rights reserved. <span className="font-bold text-indigo-500/80">Core Engine Info:</span> Google AI Assistant custom-engineered for smart task execution, featuring full Voice-to-Voice stream capabilities, custom audio synthesis feedback, and automated real-time local cache.
          </div>
          <div className="flex items-center gap-1 text-rose-500 font-bold transition-all hover:scale-105">
            <span>Made by Android Google AI Assistant MR. Rajat Yadav</span>
            <Heart className="w-3 h-3 fill-rose-500 animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
