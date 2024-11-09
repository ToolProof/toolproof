import invokeChainWrapperFlow from './flowChain';


const chainOrchestrator = async ({ chatId, promptSeed, userName }: { chatId: string; promptSeed: string; userName: string }) => {
  const responseContent = await invokeChainWrapperFlow({ chatId, promptSeed, userName });
  return { modelResponse: responseContent };
}

export default chainOrchestrator;