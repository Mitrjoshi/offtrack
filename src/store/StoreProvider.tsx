// src/store/StoreProvider.tsx
import { useEffect, type ReactNode } from "react";
import { Provider } from "tinybase/ui-react";
import { store, initializeStore } from "./schema";

export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeStore();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
