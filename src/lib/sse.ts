// In-memory pub/sub for Server-Sent Events real-time messaging.
// Note: In production with multiple instances, replace with Redis pub/sub.

const subscribers = new Map<string, Set<ReadableStreamDefaultController>>();

export function addSubscriber(
  conversationId: string,
  controller: ReadableStreamDefaultController
) {
  if (!subscribers.has(conversationId)) {
    subscribers.set(conversationId, new Set());
  }
  subscribers.get(conversationId)!.add(controller);
}

export function removeSubscriber(
  conversationId: string,
  controller: ReadableStreamDefaultController
) {
  subscribers.get(conversationId)?.delete(controller);
  if (subscribers.get(conversationId)?.size === 0) {
    subscribers.delete(conversationId);
  }
}

export function broadcastMessage(conversationId: string, data: object) {
  const subs = subscribers.get(conversationId);
  if (!subs || subs.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const encoded = new TextEncoder().encode(payload);
  for (const ctrl of subs) {
    try {
      ctrl.enqueue(encoded);
    } catch {
      // Controller closed — will be cleaned up on stream cancel
    }
  }
}
