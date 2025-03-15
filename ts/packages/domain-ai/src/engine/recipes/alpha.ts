import { alpha } from "../recipeSpecs.js";
import { ToolMethods } from "../types.js";
import { AIMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';

// Define the AlphaInterface
interface AlphaInterface extends ToolMethods<typeof alpha["recipeSpecs"][string]["tools"]> { }

// Implement the interface in a class
export class AlphaClass<T> extends Runnable implements AlphaInterface {

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: T, options?: Partial<RunnableConfig<Record<string, any>>>) {
        return { messages: [new AIMessage('AlphaClass is invoked')] };
    }

    autodock<T>(t: T): Partial<T> {
        console.log("Running AutoDock with input:", t);
        return {}; // Returning Partial<T>
    }

}