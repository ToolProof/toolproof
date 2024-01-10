import { Timestamp, FieldValue } from "firebase/firestore";

export interface Message<TimestampType = Timestamp | FieldValue> {
    id?: string;
    userId: string;
    timestamp: TimestampType;
    content: string;
}

export interface Conversation<TimestampType = Timestamp | FieldValue> {
    id?: string;
    parentId: string;
    userId: string;
    timestamp: TimestampType;
    turnState: number;
    messages: Message<TimestampType>[];
}
