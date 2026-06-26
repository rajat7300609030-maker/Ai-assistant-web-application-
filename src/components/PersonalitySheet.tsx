import { useState, useEffect } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  Flame, 
  AlertCircle, 
  Mic, 
  MapPin, 
  Bell, 
  ExternalLink, 
  Volume2, 
  ShieldCheck 
} from "lucide-react";

interface PersonalitySheetProps {
  assistantName?: string;
  micPermissionGranted?: boolean;
  toggleMicPermission?: () => void;
  onAddNotification?: (title: string, message: string, type: "info" | "success" | "warning" | "error") => void;
}

export default function PersonalitySheet({ 
  assistantName = "Zoya",
  micPermissionGranted = false,
  toggleMicPermission,
  onAddNotification
}: PersonalitySheetProps) {
  const suggestions = [
    "Tell me I look handsome today",
    "How would you react if I fell in love with you?",
    "Could you open Google for me?",
    "Do you want to go out on a virtual coffee date?",
    "Tease me with a sassy one-liner",
    "Open YouTube, I need some distraction",
  ];

  // System permissions state saved to localStorage
  const [locationPerm, setLocationPerm] = useState<boolean>(() => {
    return localStorage.getItem("perm_location") === "granted";
  });
  const [notifPerm, setNotifPerm] = useState<boolean>(() => {
    return localStorage.getItem("perm_notification") === "granted";
  });
  const [popupPerm, setPopupPerm] = useState<boolean>(() => {
    return localStorage.getItem("perm_popup") !== "denied"; // Default true
  });
  const [audioPerm, setAudioPerm] = useState<boolean>(() => {
    return localStorage.getItem("perm_audio") !== "denied"; // Default true
  });

  // Keep location and notifications in sync with browser if already granted
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((res) => {
        setLocationPerm(res.state === "granted");
      }).catch(() => {});

      navigator.permissions.query({ name: "notifications" as PermissionName }).then((res) => {
        setNotifPerm(res.state === "granted");
      }).catch(() => {});
    }
  }, []);

  // Request actual Location Permission
  const toggleLocationPermission = () => {
    if (locationPerm) {
      setLocationPerm(false);
      localStorage.setItem("perm_location", "denied");
      if (onAddNotification) {
        onAddNotification("Location Revoked", "Location queries and timezone checks will now use fallback values.", "warning");
      }
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPerm(true);
            localStorage.setItem("perm_location", "granted");
            if (onAddNotification) {
              onAddNotification("Location Allowed", `Location services successfully synchronized for ${assistantName}.`, "success");
            }
          },
          (err) => {
            console.error(err);
            // Even if browser request fails or is blocked, simulate grant for testing
            setLocationPerm(true);
            localStorage.setItem("perm_location", "granted");
            if (onAddNotification) {
              onAddNotification("Location Mock Authorized", "Location sandbox activated successfully.", "info");
            }
          }
        );
      } else {
        setLocationPerm(true);
        localStorage.setItem("perm_location", "granted");
      }
    }
  };

  // Request actual Notifications Permission
  const toggleNotificationsPermission = () => {
    if (notifPerm) {
      setNotifPerm(false);
      localStorage.setItem("perm_notification", "denied");
      if (onAddNotification) {
        onAddNotification("Alerts Muted", "Live system floating notifications will stay silent in browser toast channel.", "warning");
      }
    } else {
      if ("Notification" in window) {
        Notification.requestPermission().then((perm) => {
          const granted = perm === "granted";
          setNotifPerm(granted);
          localStorage.setItem("perm_notification", granted ? "granted" : "denied");
          if (onAddNotification) {
            onAddNotification(
              granted ? "Alerts Authorized" : "Alerts Sim Enabled",
              granted ? "Push notifications allowed successfully." : "Simulated popups successfully enabled.",
              granted ? "success" : "info"
            );
          }
        }).catch(() => {
          setNotifPerm(true);
          localStorage.setItem("perm_notification", "granted");
        });
      } else {
        setNotifPerm(true);
        localStorage.setItem("perm_notification", "granted");
      }
    }
  };

  const togglePopupPermission = () => {
    const nextVal = !popupPerm;
    setPopupPerm(nextVal);
    localStorage.setItem("perm_popup", nextVal ? "granted" : "denied");
    if (onAddNotification) {
      onAddNotification(
        nextVal ? "Popups Allowed" : "Popups Blocked",
        nextVal ? `${assistantName} can trigger custom tab links seamlessly.` : "Auto-browser popups are restricted.",
        nextVal ? "success" : "warning"
      );
    }
  };

  const toggleAudioPermission = () => {
    const nextVal = !audioPerm;
    setAudioPerm(nextVal);
    localStorage.setItem("perm_audio", nextVal ? "granted" : "denied");
    if (onAddNotification) {
      onAddNotification(
        nextVal ? "Acoustics Active" : "Acoustics Silenced",
        nextVal ? "Buzzer beeps and chime transitions enabled." : "Audio feedback and buzzer beeps are deactivated.",
        nextVal ? "success" : "warning"
      );
    }
  };

  return (
    <div className="w-full bg-white/80 border border-slate-200/60 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(148,163,184,0.06)] backdrop-blur-xl space-y-5">
      {/* Bio Header */}
      <div className="space-y-1 bg-gradient-to-r from-purple-500/5 via-rose-500/5 to-amber-500/5 p-4 rounded-2xl border border-rose-500/10">
        <div className="flex items-center gap-1.5 text-rose-500 font-bold font-sans text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>{assistantName} Character Core</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          A young, confident, witty, and sassy voice assistant. She plays along, banters, teases you playfully like a close girlfriend, and is always quick with a sarcasm-laced reply. Talk to her naturally!
        </p>
      </div>

      {/* Required System Permissions Section */}
      <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase font-mono tracking-wider">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>System Permissions Control</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal font-sans">
          Manage system authorizations to guarantee {assistantName}'s real-time capabilities work perfectly.
        </p>

        <div className="space-y-2 mt-2">
          {/* Permission 1: Microphone */}
          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 leading-none">Microphone Access</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Voice-to-voice stream</p>
              </div>
            </div>
            <button
              onClick={toggleMicPermission}
              className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                micPermissionGranted ? "bg-emerald-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${micPermissionGranted ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Permission 2: Geolocation */}
          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 leading-none">Location Access</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Weather & time synchronization</p>
              </div>
            </div>
            <button
              onClick={toggleLocationPermission}
              className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                locationPerm ? "bg-sky-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${locationPerm ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Permission 3: Notifications */}
          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 leading-none">System Notifications</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Interactive floating alerts</p>
              </div>
            </div>
            <button
              onClick={toggleNotificationsPermission}
              className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                notifPerm ? "bg-rose-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${notifPerm ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Permission 4: Popups / Navigation */}
          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 leading-none">Auto-Navigation Links</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Bypass popup blocker</p>
              </div>
            </div>
            <button
              onClick={togglePopupPermission}
              className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                popupPerm ? "bg-amber-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${popupPerm ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Permission 5: Sound / Chimes */}
          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 leading-none">Auditory Chimes</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Synthesizer beeps & rings</p>
              </div>
            </div>
            <button
              onClick={toggleAudioPermission}
              className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                audioPerm ? "bg-indigo-500" : "bg-slate-200"
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${audioPerm ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Prompts suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-xs uppercase font-mono tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interactive Starters</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              className="text-xs text-slate-600 bg-slate-50/60 hover:bg-slate-100/90 border border-slate-200/50 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group shadow-[0_2px_5px_rgba(0,0,0,0.01)]"
            >
              <span className="font-sans font-medium text-slate-600 group-hover:text-slate-800">"{sug}"</span>
              <Sparkles className="w-3 h-3 text-indigo-400/60 group-hover:text-indigo-500 flex-shrink-0 ml-1 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Constraints Warning */}
      <div className="flex gap-2.5 p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] leading-relaxed text-slate-500 font-medium">
        <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <span className="font-sans">
          <strong>Voice Protocol:</strong> {assistantName} runs strictly via full-duplex live stream connection. Click the central node to toggle voice interaction.
        </span>
      </div>
    </div>
  );
}

