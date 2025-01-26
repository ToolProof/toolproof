import { z } from "zod";


export const schemas = {
    RecordSchema: z.object({
        record: z.string(),
    }),
};


export const prompts = {
    record: {
        system: "",
        user: () => "",
    },
}

