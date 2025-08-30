var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { streamUpload } from "../../helpers/cloudinary.helper.js";
export const uploadSingle = (req, res, next) => {
    if (req["file"] && req["file"].fieldname && req["file"].buffer) {
        function upload(req) {
            return __awaiter(this, void 0, void 0, function* () {
                if (req["file"] && req["file"].buffer && req["file"].fieldname) {
                    const result = yield streamUpload(req["file"].buffer);
                    if (result && typeof result === "object" && "url" in result) {
                        req.body[req["file"].fieldname] = result["url"];
                    }
                }
                next();
            });
        }
        upload(req);
    }
    else {
        next();
    }
};
export const uploadFields = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req["files"] && typeof req["files"] === "object") {
        for (const key in req["files"]) {
            req.body[key] = [];
            const filesField = req["files"][key];
            const array = Array.isArray(filesField) ? filesField : [];
            for (const item of array) {
                try {
                    const result = yield streamUpload(item.buffer);
                    if (result && typeof result === "object" && "url" in result) {
                        req.body[key].push(result["url"]);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
    }
    next();
});
