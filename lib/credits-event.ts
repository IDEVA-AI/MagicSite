const CREDITS_CHANGED_EVENT = "magicsite:credits-changed"

export function dispatchCreditsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CREDITS_CHANGED_EVENT))
  }
}

export function onCreditsChanged(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CREDITS_CHANGED_EVENT, callback)
  return () => window.removeEventListener(CREDITS_CHANGED_EVENT, callback)
}
