
export const title = 'toolproof.com'; // ATTENTION: be consistent with variable naming
export const description = ''; // ATTENTION: be consistent with variable naming

export const chat = 'chat';
export const chats = 'chats';
export const messages = 'messages';
export const userId = 'userId';
export const ChatGPT = 'ChatGPT';
export const timestamp = 'timestamp';
export const asc = 'asc';
export const desc = 'desc';
export const limit = 'limit';

export const test = 'test';

export const openai = 'openai';

export const topics = 'topics';
export const continue_topic = 'continue_topic';
export const change_topic = 'change_topic';

export const Sign_In = 'Sign In';
export const Sign_Out = 'Sign Out';

export const endpoint = {
    opinion: {
        name: 'opinion',
        option: 'Opinions',
    },
    concept: {
        name: 'concept',
        option: 'Concepts',
    },
} as const;

type Endpoint = typeof endpoint;
type Name = Endpoint[keyof Endpoint]['name'];
export type Option = Endpoint[keyof Endpoint]['option'];

export function mapOptionToName(option: Option): Name | undefined {
    for (const key in endpoint) {
        if (endpoint[key as keyof typeof endpoint].option === option) {
            return endpoint[key as keyof typeof endpoint].name;
        }
    }
    return undefined; // Return undefined if the option is not found
}
