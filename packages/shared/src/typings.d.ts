import { Timestamp } from "firebase/firestore";
import { BaseMessage } from '@langchain/core/messages';


export interface ChatWrite {
    userId: string;
    turnState: number;
    tags: string[];
}


export interface ChatRead extends ChatWrite {
    id: string;
    timestamp: Timestamp;
}


export interface BaseMessageWithType extends BaseMessage {
    type: 'ai' | 'human';
}