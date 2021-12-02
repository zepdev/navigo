import { QContext } from "../../index";
import Q from "../Q";
import { undefinedOrTrue } from "../utils";
import executeHook from "./executeHook";

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
