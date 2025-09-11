import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window { __CHATBASE_EMBED_LOADED__?: boolean; embeddedChatbotConfig?: any }
}

export function useChatbase(enableOnPaths = ["*"]) {
  const { pathname } = useLocation();
  const shouldEnable = enableOnPaths.includes("*") || enableOnPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!shouldEnable) return;
    if (window.__CHATBASE_EMBED_LOADED__) return;

    const existing = document.getElementById("chatbase-embed");
    if (existing) {
      window.__CHATBASE_EMBED_LOADED__ = true;
      return;
    }

    if (!window.embeddedChatbotConfig) {
      window.embeddedChatbotConfig = {
        chatbotId: "mnxB5kB3I-JSpdYAEJB2W",
        domain: "www.chatbase.co",
        position: "right",
        openOnLoad: false,
      };
    }

    const s = document.createElement("script");
    s.id = "chatbase-embed";
    s.src = "https://www.chatbase.co/embed.min.js";
    s.defer = true;
    document.body.appendChild(s);
    window.__CHATBASE_EMBED_LOADED__ = true;
  }, [shouldEnable]);
}
