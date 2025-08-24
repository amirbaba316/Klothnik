import { HttpError } from '@hyperflake/http-errors';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError)
        return res.status(err.status).send({
            timestamp: Date.now(),
            status: err.status,
            message: err.message,
        });

    console.error(err);

    res.status(500).send({
        timestamp: Date.now(),
        status: 500,
        message: 'Some error occured. Please try again.',
    });
};
