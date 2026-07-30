import { useEffect, useRef } from "react";

import { getStompClient } from "@/lib/ws-client";

export function useStompTopic<T>(destination: string, onMessage: (payload: T) => void) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    const client = getStompClient();

    let subscription: ReturnType<typeof client.subscribe> | null = null;

    const subscribe = () => {
      subscription = client.subscribe(destination, (message) => {
        try {
          callbackRef.current(JSON.parse(message.body) as T);
        } catch {
          // payload não era JSON válido; ignora
        }
      });
    };

    if (client.connected) {
      subscribe();
    }
    client.onConnect = () => subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [destination]);
}
