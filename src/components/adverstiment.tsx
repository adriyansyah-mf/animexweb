// src/components/advertisement.tsx
"use client";

import { useEffect, useRef } from "react";

interface AdvertisementProps {
  containerId?: string;
}

export function Advertisement({ containerId }: AdvertisementProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "//pl26466628.profitableratecpm.com/714e78d4b3b17786d5fca92c3e416b2f/invoke.js";
      
      if (adContainerRef.current && adContainerRef.current.parentNode) {
        adContainerRef.current.parentNode.insertBefore(script, adContainerRef.current);
      }
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);
  
  return <div id={containerId || "container-714e78d4b3b17786d5fca92c3e416b2f"} ref={adContainerRef} className="my-6"></div>;
}