export function getConversationId(message: any): string | null {
    if (!message) return null;
    return (
        message.conversationId ||
        message.chatId ||
        message.roomId ||
        message.threadId ||
        null
    );
}
