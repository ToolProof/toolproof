
export default async function addConversationWrapper(userId: string, parentId: string) {
    const newConversation = {
        userId: userId,
        parentId: parentId,
        turnState: 0,
    };
    return newConversation;
}