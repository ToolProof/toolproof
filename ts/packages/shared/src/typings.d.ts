import { Timestamp } from "firebase/firestore";
import { BaseMessage } from '@langchain/core/messages';


export interface BaseData {
    id: string;
    name: string;
    description: string;
}


export interface Problem extends BaseData {}


export interface Resource extends BaseData{
    problemIds: string[];
    path: string;
}


export interface Tool extends BaseData {
    problemIds: string[];
}


export interface Human extends BaseData {
    problemIds: string[];
}


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