import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "yup";

export const validate = (schema: ObjectSchema<Record<string, unknown>>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({ errors: (error as { errors: string[] }).errors });
      } else {
        res.status(400).json({ errors: ['Validation failed'] });
      }
    }
  };
