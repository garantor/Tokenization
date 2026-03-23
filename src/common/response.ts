import { Response } from 'express';

export const successResponse = (res: Response, data: any, status = 200) => {
  res.status(status).json({
    status: 'success',
    ...data
  });
};
