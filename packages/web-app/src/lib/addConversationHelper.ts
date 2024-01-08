
export default async function addConversationHelper(userId: string, parentId: string) {
    const newConversation = {
        userId: userId,
        parentId: parentId,
        turnState: 0,
    };
    console.log("newConversation_alfa", newConversation);
    return newConversation;
}