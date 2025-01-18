import { z } from "zod";


export const schemas = {
    RecordSchema: z.object({
        record: z.array(z.string()),
    }),
};


export const prompts = {
    record: {
        system: "",
        user: () => "",
    },
}

