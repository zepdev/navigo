import { QContext } from "../../index.js";
import Q from "../Q.js";
import { undefinedOrTrue } from "../utils.js";
import executeHook from "./executeHook.js";

export default function checkForBeforeHook(context: QContext, done) {
  if (
    context.match.route.hooks &&
    context.match.route.hooks.before &&
    undefinedOrTrue(context.navigateOptions, "callHooks")
  ) {
    executeHook(context, done, context.match.route.hooks.before, context.match);
  } else {
    done();
  }
}
