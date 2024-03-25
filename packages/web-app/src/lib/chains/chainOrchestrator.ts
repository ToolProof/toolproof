import invokeChainWrapperFlow from "./flowChain";


const chainOrchestrator = async ({ chatId, promptSeed, userName }: { chatId: string; promptSeed: string; userName: string }) => {
  const flowChainResponse = await invokeChainWrapperFlow({ chatId, promptSeed, userName });
  return {
    modelResponse: flowChainResponse.modelResponse,
    topicDetected: flowChainResponse.topicDetected,
    action: flowChainResponse.action,
  }
}

export default chainOrchestrator;