export function resolveConversationId(message: any): string | null {
    if (!message) return null;
    return message.conversationId || null;
}
