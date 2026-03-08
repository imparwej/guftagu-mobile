/**
 * Global callback store to avoid passing functions via navigation params.
 * React Navigation warns about non-serializable values in params,
 * so we register callbacks here and pass only the callbackId.
 */

const callbacks: Record<string, Function> = {};
let counter = 0;

/**
 * Register a callback and get a unique ID to pass via navigation params.
 */
export function registerShareCallback(callback: Function): string {
    const id = `cb_${++counter}_${Date.now()}`;
    callbacks[id] = callback;
    return id;
}

/**
 * Trigger a previously registered callback by ID and clean it up.
 */
export function triggerShareCallback(id: string, data: any): void {
    if (callbacks[id]) {
        callbacks[id](data);
        delete callbacks[id];
    }
}

/**
 * Remove a callback without triggering it (for cleanup on unmount).
 */
export function removeShareCallback(id: string): void {
    delete callbacks[id];
}
