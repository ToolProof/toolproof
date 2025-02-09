import { ligamentHelper } from "./helper.js";
import { Request, Response } from 'express';

// ATTENTION: must ensure idempotency

export default async function ligamentHandler(req: Request, res: Response) {

    try {

        await ligamentHelper();

        // Send a success response to Pub/Sub
        res.status(200).send('Task completed successfully');
    } catch (error) {
        console.error('Error invoking graph:', error);
        // Send a failure response to Pub/Sub
        res.status(500).send('Task failed');
    }

}