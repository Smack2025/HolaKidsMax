import type { Request, Response, NextFunction } from "express";

export function asyncHandler<
  T extends (req: Request, res: Response, next: NextFunction) => Promise<any>
>(fn: T) {
  return function (req: Request, res: Response, next: NextFunction): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
