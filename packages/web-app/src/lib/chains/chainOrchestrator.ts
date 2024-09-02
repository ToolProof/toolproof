import invokeChainWrapperFlow from './flowChain';


const chainOrchestrator = async ({ conceptId, promptSeed, userName }: { conceptId: string; promptSeed: string; userName: string }) => {
  const flowChainResponse = await invokeChainWrapperFlow({ conversationId: conceptId, promptSeed, userName });
  return {
    modelResponse: flowChainResponse.modelResponse,
    topicDetected: flowChainResponse.topicDetected,
    action: flowChainResponse.action,
  }
}

export default chainOrchestrator;