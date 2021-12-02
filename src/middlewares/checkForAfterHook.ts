import { QContext } from "../../index";
import { undefinedOrTrue } from "../utils";
import executeHook from "./executeHook";

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
