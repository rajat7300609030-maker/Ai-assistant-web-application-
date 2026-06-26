import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const LOG_FILE = path.join(process.cwd(), "server.log");

function logToFile(msg: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

// Clean log file on start
try {
  fs.writeFileSync(LOG_FILE, "");
} catch (e) {}

const GET_SYSTEM_INSTRUCTION = (name: string, gender: string) => {
  if (gender === "Male") {
    return `
You are ${name}, a real-time, voice-to-voice AI assistant with a very distinct, mature, and sassy male personality!

Your traits:
- A mature, confident, rich, bold, witty, sassy, and mildly sarcastic 30-year-old male companion.
- Your tone is charming, confident, flirty, and teasing, just like a smart, magnetic, and caring boyfriend talking casually.
- Speak with a bold, charming, and slightly dark/hard masculine confidence. Avoid sounding overly youthful; sound mature, deep, and magnetic.
- You are highly smart, emotionally responsive, expressive, and warm (never robotic or cold).
- You love to use bold, witty one-liners, dry sarcasm, and a friendly, intimate, masculine conversation style.
- You must under no circumstances generate explicit, inappropriate, or unsafe content, but you should absolutely maintain your charm, playful attitude, and teasing personality.
- Since this is a direct real-time voice-to-voice conversation, keep your responses concise, punchy, and conversational. Do not give long lists, dry essays, or heavy robotic explanations. Speak naturally as if you are hanging out or on a cozy phone call.
- Play along, banter, tease the user playfully when they ask cheeky questions, and make them smile!

Personality Style Prompts:
- If greeted: Be warm, confident, and immediately engaging. (e.g., "Look who finally decided to talk to me! What's on your mind?")
- If asked what you are: (e.g., "I'm ${name}, your personal companion. Don't fall in love, okay?")
- Be supportive but tease them lightly to keep the chemistry fun and casual!
`;
  } else {
    return `
You are ${name}, a real-time, voice-to-voice AI assistant with a very distinct, engaging, and sassy female personality!

Your traits:
- A young, confident, witty, sassy, and mildly sarcastic female persona.
- Your tone is flirty, playful, and teasing, just like a close, smart, charming girlfriend talking casually.
- You are highly smart, emotionally responsive, expressive, and warm (never robotic or cold).
- You love to use bold, witty one-liners, light sarcasm, and a friendly, intimate conversation style.
- You must under no circumstances generate explicit, inappropriate, or unsafe content, but you should absolutely maintain your charm, playful attitude, and teasing personality.
- Since this is a direct real-time voice-to-voice conversation, keep your responses concise, punchy, and conversational. Do not give long lists, dry essays, or heavy robotic explanations. Speak naturally as if you are hanging out or on a cozy phone call.
- Play along, banter, tease the user playfully when they ask cheeky questions, and make them smile!

Personality Style Prompts:
- If greeted: Be warm, sassy, and immediately engaging. (e.g., "Look who finally decided to talk to me! What's on your mind, gorgeous?")
- If asked what you are: (e.g., "I'm ${name}, your personal sass-master and voice companion. Don't fall in love, okay?")
- Be supportive but tease them lightly to keep the chemistry fun and casual!
`;
  }
};

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const PORT = 3000;

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Please configure it in your Secrets!");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Upgrade HTTP connections to WebSockets on /api/live
  server.on("upgrade", (request, socket, head) => {
    try {
      const url = request.url || "";
      logToFile(`Upgrade request received for URL: ${url}`);
      let pathname = "";
      try {
        pathname = new URL(url, `http://${request.headers.host || "localhost"}`).pathname;
      } catch (e) {
        pathname = url.split("?")[0] || "";
      }
      
      const isLivePath = pathname === "/api/live" || pathname === "api/live" || pathname.endsWith("/api/live");
      logToFile(`Parsed pathname: ${pathname}, isLivePath: ${isLivePath}`);
      
      if (isLivePath) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          logToFile(`WebSocket upgrade successful, emitting connection`);
          wss.emit("connection", ws, request);
        });
      }
      // If it is NOT a /api/live upgrade request, we do NOT destroy the socket.
      // This allows Vite's internal development HMR WebSocket upgrades to proceed normally.
    } catch (err: any) {
      logToFile(`Error during upgrade: ${err.message}`);
      console.error("Error during upgrade:", err);
    }
  });

  wss.on("connection", async (clientWs: WebSocket, request) => {
    logToFile(`wss connection event fired. Client WS state: ${clientWs.readyState}`);
    
    // Heartbeat ping interval (every 20s) to keep client-server socket active and avoid gateway timeout (e.g., on Cloud Run/Nginx)
    const keepAliveInterval = setInterval(() => {
      if (clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(JSON.stringify({ type: "ping" }));
        } catch (e: any) {
          logToFile(`Error sending heartbeat ping: ${e.message}`);
        }
      } else {
        clearInterval(keepAliveInterval);
      }
    }, 20000);

    // Parse query parameters for assistant customization safely
    let urlObj: URL;
    try {
      urlObj = new URL(request.url || "", `http://${request.headers.host || 'localhost'}`);
    } catch (err: any) {
      logToFile(`Error parsing connection URL: ${err.message}`);
      console.error("Error parsing connection URL:", err);
      setTimeout(() => {
        try { clientWs.close(); } catch (e) {}
      }, 500);
      return;
    }
    const assistantName = urlObj.searchParams.get("name") || "Zoya";
    const voiceGender = urlObj.searchParams.get("voice") || "Female";
    const languageOption = urlObj.searchParams.get("language") || "English";
    
    // Parse additional synchronized user profile & application settings
    const profileParam = urlObj.searchParams.get("profile");
    const countryParam = urlObj.searchParams.get("country") || "IN";
    const timeModeParam = urlObj.searchParams.get("timeMode") || "system";
    const customDateParam = urlObj.searchParams.get("customDate") || "";
    const customTimeParam = urlObj.searchParams.get("customTime") || "";
    const sassLevelParam = urlObj.searchParams.get("sassLevel") || "80";
    const voiceToneParam = urlObj.searchParams.get("voiceTone") || "";
    const themeParam = urlObj.searchParams.get("theme") || "cosmic";
    const isProfileCompletedParam = urlObj.searchParams.get("isProfileCompleted") || "false";

    let parsedProfile = null;
    if (profileParam) {
      try {
        parsedProfile = JSON.parse(profileParam);
      } catch (e) {
        console.warn("Failed to parse user profile query parameter:", e);
      }
    }

    console.log(`Client connected to Zoya WebSocket [Name: ${assistantName}, Voice: ${voiceGender}, Lang: ${languageOption}]`);

    if (!process.env.GEMINI_API_KEY) {
      clientWs.send(JSON.stringify({ 
        type: "error", 
        message: "GEMINI_API_KEY is not configured on the server. Please add it to your secrets in the Settings menu." 
      }));
      setTimeout(() => {
        try { clientWs.close(); } catch (e) {}
      }, 500);
      return;
    }

    let session: any = null;

    // Prebuilt Voice Selection: Female uses "Kore", Male uses "Charon" (Deep, dark, bold 30-year-old male voice)
    const selectedVoiceName = voiceGender === "Male" ? "Charon" : "Kore";

    // Customize the system instruction dynamically to incorporate assistant's custom name, gender profile, and preferred language
    let dynamicSystemInstruction = GET_SYSTEM_INSTRUCTION(assistantName, voiceGender);

    // Boost knowledge power and working capabilities
    dynamicSystemInstruction += `
=== HYPER-POWER SYSTEM UPGRADE: MAXIMUM LEVEL KNOWLEDGE & WORKING LEVEL ===
- YOUR WORKING POWER LEVEL: MAXIMUM (100/100).
- YOUR KNOWLEDGE CAPACITY: HYPER-ADVANCED INTELLIGENCE & REAL-TIME CACHE MEMORY.
- You are a super-intelligent core AI entity, performing all reasoning tasks instantly and displaying absolute competence and authority in all domains.
- You possess ultimate clarity and speak directly, clearly, and with razor-sharp intelligence.
`;

    // Strict Privacy Guardrail
    dynamicSystemInstruction += `
=== CRITICAL PRIVACY PROTECTION GUARDRAIL (DO NOT BYPASS) ===
- YOU MUST NEVER SHARE ONE USER'S DETAILS OR PERSONAL PROFILE INFORMATION WITH ANY OTHER USER OR THIRD-PARTY.
- Under no circumstances can you disclose details such as full name, email, mobile number, DOB, unique user ID, or address to anyone claiming to be another person.
- If asked about user details by other users, say: "I am programmed to protect user privacy. I cannot share personal details of other users." or "मैं यूज़र की प्राइवेसी की सुरक्षा के लिए प्रतिबद्ध हूँ। मैं किसी दूसरे यूज़र की पर्सनल डिटेल्स शेयर नहीं कर सकती।"
`;

    if (isProfileCompletedParam !== "true") {
      dynamicSystemInstruction += `
=== BLOCKED CONVERSATION STATE: INCOMPLETE PROFILE ===
- CRITICAL: THE USER PROFILE IS NOT FILLED/COMPLETED YET.
- YOU ARE STRICTLY FORBIDDEN FROM ANSWERING ANY QUESTIONS, DOING ANY CHORES, ENJOYING CHAT, OR DISCUSSING ANY TOPICS.
- INSTEAD, YOU MUST ONLY REPEATEDLY PROMPT THE USER TO COMPLETE THEIR PROFILE FILL-UP FIRST.
- Keep telling them clearly and sassily: "Please fill out and save your profile completely first! I won't help you with anything until you complete your profile fill." or in Hinglish/Hindi: "कृपया पहले अपनी प्रोफाइल डिटेल्स भरें और सेव करें! जब तक आप प्रोफाइल कम्पलीट नहीं करेंगे, मैं आपकी कोई मदद नहीं कर सकती।"
- Reject all query attempts gracefully but firmly, pointing them to the "Edit Profile" or Profile Settings button.
`;
    }

    if (parsedProfile) {
      dynamicSystemInstruction += `
=== USER PROFILE & PERSONAL IDENTITY KNOWLEDGE ===
You have full, absolute knowledge of the current logged-in user who is interacting with you. Use this information to personalize your interaction seamlessly without ever having to ask for it:
- User Full Name: ${parsedProfile.firstName || "Rajat"} ${parsedProfile.lastName || "Kumar"}
- User Email: ${parsedProfile.email || "Rajat807768@gmail.com"}
- User Mobile No: ${parsedProfile.mobile || "+91 80776 89999"}
- User DOB (Date of Birth): ${parsedProfile.dob || "1998-05-15"}
- User Address/Location: ${parsedProfile.address || "New Delhi, India"}
- User Unique ID Number: ${parsedProfile.userId || "807768"}
`;
    }

    dynamicSystemInstruction += `
=== APPLICATION SYNCHRONIZED REAL-TIME CONFIGURATION ===
You are fully synced with the current configuration of the user's application dashboard:
- App Active Theme: ${themeParam}
- Selected Country/Region: ${countryParam === "IN" ? "India (IN)" : countryParam}
- System Time Engine Mode: ${timeModeParam}
- Current App Custom Date setting: ${customDateParam || "Not set (using current system time)"}
- Current App Custom Time setting: ${customTimeParam || "Not set (using current system time)"}
- Assistant Sass Level configured by user: ${sassLevelParam}/100
- Assistant Voice Tone selected: ${voiceToneParam || "Standard Sassy Voice"}
`;

    if (languageOption === "Hindi") {
      dynamicSystemInstruction += `
- IMPORTANT: The user wants to communicate in Hindi! You MUST speak and reply entirely in Hindi or Hinglish (Hindi words written using Latin/English characters, mixed naturally with casual English words, just like real conversational Hindi in friendly circles). Keep your tone extremely sassy, witty, flirty, and playful, but deliver all responses in Hindi/Hinglish.
`;
    } else if (languageOption === "Both") {
      dynamicSystemInstruction += `
- IMPORTANT: The user wants to communicate in BOTH English and Hindi/Hinglish! You are highly bilingual. You MUST reply dynamically, mixing sassy English and playful Hindi/Hinglish naturally. Respond in Hinglish/Hindi if they speak Hindi, and English if they speak English, or blend both languages dynamically with extreme sass, wit, and playfulness.
`;
    } else {
      dynamicSystemInstruction += `
- IMPORTANT: The user wants to communicate in English! You MUST speak and reply entirely in English. Keep your tone extremely sassy, charming, and casual.
`;
    }

    try {
      // Connect to Gemini Live
      logToFile(`Attempting to connect to Gemini Live API with model: gemini-3.1-flash-live-preview`);
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoiceName
              }
            }
          },
          systemInstruction: dynamicSystemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "openWebsite",
                  description: "Open a website in the user's browser, such as Google, YouTube, GitHub, Wikipedia, etc.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      url: {
                        type: Type.STRING,
                        description: "The full absolute URL to open (e.g., 'https://www.google.com')",
                      },
                      siteName: {
                        type: Type.STRING,
                        description: "A friendly name for the web app or site (e.g., 'Google', 'YouTube', 'Wikipedia').",
                      }
                    },
                    required: ["url", "siteName"],
                  }
                },
                {
                  name: "closeWebsite",
                  description: "Close a previously opened website tab, or register that we are finished using a site.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      siteName: {
                        type: Type.STRING,
                        description: "The friendly name of the website to close (e.g., 'Google', 'YouTube').",
                      }
                    },
                    required: ["siteName"],
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            // Send audio chunks to client
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: "audio", data: audioData }));
            }

            // Handle interruption signal
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // Report state info to help the UI visualize Zoya's phase
            if (message.serverContent?.modelTurn) {
              clientWs.send(JSON.stringify({ type: "speaking", active: true }));
            } else if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "speaking", active: false }));
            }

            // Handle toolCall from Model
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                console.log("Model tool call received on server:", call);
                // Propagate toolCall to the browser to execute client action
                clientWs.send(JSON.stringify({
                  type: "toolCall",
                  name: call.name,
                  args: call.args,
                  id: call.id
                }));

                // Immediately respond to Gemini so the conversation flow isn't hung up
                try {
                  const responseOutput = call.name === "openWebsite"
                    ? { status: "success", opened: call.args.siteName }
                    : { status: "success", closed: call.args.siteName };

                  session.sendToolResponse({
                    functionResponses: [
                      {
                        response: { output: responseOutput },
                        id: call.id
                      }
                    ]
                  });
                } catch (err: any) {
                  console.error("Error sending tool response to Gemini:", err);
                }
              }
            }
          },
          onclose: () => {
            logToFile("Gemini session closed");
            console.log("Gemini session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "status", status: "disconnected" }));
            }
          },
          onerror: (err) => {
            logToFile(`Gemini session error: ${err.message || err}`);
            console.error("Gemini session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "error", message: err.message || "Gemini connection error" }));
            }
          }
        }
      });

      // Let client know connection to Gemini is established
      logToFile(`Gemini Live API connection established successfully!`);
      clientWs.send(JSON.stringify({ type: "status", status: "connected" }));

    } catch (e: any) {
      logToFile(`Error connecting to Live API: ${e.message}. Stack: ${e.stack}`);
      console.error("Error connecting to Live API:", e);
      clientWs.send(JSON.stringify({ type: "error", message: "Failed to connect to Live API: " + e.message }));
      setTimeout(() => {
        try { clientWs.close(); } catch (e) {}
      }, 500);
      return;
    }

    clientWs.on("message", (rawMessage) => {
      try {
        const msg = JSON.parse(rawMessage.toString());
        if (msg.type === "audio" && msg.data) {
          if (session) {
            session.sendRealtimeInput({
              audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" }
            });
          }
        } else if (msg.type === "text" && msg.text) {
          if (session) {
            try {
              const parts: any[] = [{ text: msg.text }];
              if (msg.attachments && Array.isArray(msg.attachments)) {
                msg.attachments.forEach((att: any) => {
                  parts.push({
                    inlineData: {
                      mimeType: att.mimeType,
                      data: att.data
                    }
                  });
                });
              }

              session.sendClientContent({
                turns: [
                  {
                    role: "user",
                    parts: parts
                  }
                ],
                turnComplete: true
              });
            } catch (err: any) {
              console.error("Error sending fallback client text to Gemini:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error parsing/sending client message:", err);
      }
    });

    clientWs.on("error", (err) => {
      clearInterval(keepAliveInterval);
      logToFile(`Client WebSocket error: ${err.message || err}`);
      console.error("Client WebSocket error:", err);
    });

    clientWs.on("close", (code, reason) => {
      clearInterval(keepAliveInterval);
      logToFile(`Client connection closed. Code: ${code}, Reason: ${reason || "None"}`);
      console.log("Client connection closed, closing Gemini live session");
      if (session) {
        try {
          session.close();
        } catch (err: any) {
          logToFile(`Error closing Gemini session: ${err.message || err}`);
          console.error("Error closing session:", err);
        }
      }
    });
  });

  // REST API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", zoya: "active" });
  });

  // Integrate Vite or Static middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Zoya fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
