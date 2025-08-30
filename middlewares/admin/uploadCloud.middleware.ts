import { NextFunction, Request, Response } from "express";

import { streamUpload } from "../../helpers/cloudinary.helper.js";

export const uploadSingle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req["file"] && req["file"].fieldname && req["file"].buffer) {
    async function upload(req: Request) {
      if (req["file"] && req["file"].buffer && req["file"].fieldname) {
        const result: any = await streamUpload(req["file"].buffer);
        if (result && typeof result === "object" && "url" in result) {
          req.body[req["file"].fieldname] = result["url"];
        }
      }
      next();
    }
    upload(req);
  } else {
    next();
  }
};

export const uploadFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req["files"] && typeof req["files"] === "object") {
    for (const key in req["files"]) {
      req.body[key] = [];
      const filesField: any = (req["files"] as any)[key];
      const array: any[] = Array.isArray(filesField) ? filesField : [];
      for (const item of array) {
        try {
          const result: any = await streamUpload(item.buffer);
          if (result && typeof result === "object" && "url" in result) {
            req.body[key].push(result["url"]);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  next();
};
