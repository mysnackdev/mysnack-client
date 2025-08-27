declare global {
  interface WindowEventMap {
    "open-cart": Event; // ou CustomEvent<void>
  }
}
export {};
