"use client";

import { useEffect } from "react";

interface MetaPixelProps {
  pixelId?: string;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    // Si no hay pixelId se usa uno de prueba/demostración
    const activePixelId = pixelId || "999999999999999"; 

    console.log(`%c[Meta Pixel Initialized] ID: ${activePixelId}`, "color: #00F2FE; font-weight: bold; background: #0B132B; padding: 4px 8px; border-radius: 4px;");
    console.log(`%c[Meta Pixel] Evento Trackeado: PageView`, "color: #4FACFE; font-weight: bold;");

    // Inyección real del script oficial de Facebook Pixel
    if (typeof window !== "undefined") {
      /* eslint-disable */
      // @ts-ignore
      if (!window.fbq) {
        // @ts-ignore
        window.fbq = function() {
          // @ts-ignore
          window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
        };
        // @ts-ignore
        if (!window._fbq) window._fbq = window.fbq;
        // @ts-ignore
        window.fbq.push = window.fbq;
        // @ts-ignore
        window.fbq.loaded = true;
        // @ts-ignore
        window.fbq.version = '2.0';
        // @ts-ignore
        window.fbq.queue = [];
        
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        }
      }

      // @ts-ignore
      window.fbq('init', activePixelId);
      // @ts-ignore
      window.fbq('track', 'PageView');
      /* eslint-enable */
    }
  }, [pixelId]);

  return null;
}

// Función auxiliar exportada para llamar eventos personalizados (ej. Lead) desde componentes cliente
export function trackMetaEvent(eventName: string, params?: object) {
  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', eventName, params);
    }
    console.log(`%c[Meta Pixel] Evento Trackeado: ${eventName}`, "color: #10B981; font-weight: bold; background: #E6F4EA; padding: 2px 6px; border-radius: 4px;", params || "");
  }
}
