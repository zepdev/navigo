import { QContext } from "../../index.js";
import { undefinedOrTrue } from "../utils.js";
import executeHook from "./executeHook.js";

export default function checkForAfterHook(context: QContext, done) {
  if (
    context.match.route.hooks &&
    context.match.route.hooks.after &&
    undefinedOrTrue(context.navigateOptions, "callHooks")
  ) {
    executeHook(context, done, context.match.route.hooks.after, context.match);
  }
  else {
    done();
  }
}
