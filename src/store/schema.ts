import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";

export const store = createStore();

// Define schema
export const schema = {
  habits: {
    id: { type: "string" },
    name: { type: "string" },
    color: { type: "string" },
    createdAt: { type: "number" }, // timestamp
  },
  logs: {
    id: { type: "string" },
    habitId: { type: "string" }, // references habits.id
    timestamp: { type: "number" },
    note: { type: "string", default: "" },
  },
} as const;

// Optional: Set up relationships
store.setTablesSchema({
  habits: {
    id: { type: "string" },
    name: { type: "string" },
    color: { type: "string" },
    createdAt: { type: "number" },
  },
  logs: {
    id: { type: "string" },
    habitId: { type: "string" },
    timestamp: { type: "number" },
    note: { type: "string", default: "" },
  },
});

// Persist to localStorage
export const persister = createLocalPersister(store, "habit-tracker");

// Auto-save and auto-load
export const initializeStore = async () => {
  await persister.load();
  await persister.startAutoSave();
};
