import type { Request, Response, NextFunction } from 'express';

export function publicCatalogCache(
  browserSeconds = 60,
  cdnSeconds = 300,
  staleSeconds = 3600
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.headers.authorization) {
      res.vary('Origin');
      res.setHeader(
        'Cache-Control',
        `public, max-age=${browserSeconds}, s-maxage=${cdnSeconds}, stale-while-revalidate=${staleSeconds}`
      );
    }
    next();
  };
}