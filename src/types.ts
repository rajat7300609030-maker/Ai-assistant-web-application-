export enum AssistantState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  IDLE = "idle",
  LISTENING = "listening",
  SPEAKING = "speaking",
  ERROR = "error"
}

export interface OpenedWebsite {
  siteName: string;
  url: string;
  timestamp: Date;
  action: "open" | "close";
}

export interface ZoyaNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

