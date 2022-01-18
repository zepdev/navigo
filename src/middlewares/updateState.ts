import { QContext } from "../../index.js";
import { undefinedOrTrue } from "../utils.js";

export default function updateState(context: QContext, done) {
  if (undefinedOrTrue(context.navigateOptions, "updateState")) {
    context.instance._setCurrent(context.matches);
  }
  done();
}
