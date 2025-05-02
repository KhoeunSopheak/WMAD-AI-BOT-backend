import { TokenPayload } from "../../src/common/types/user";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
