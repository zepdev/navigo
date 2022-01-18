import { QContext } from "../../index.js";
import { undefinedOrTrue } from "../utils.js";
import executeHook from "./executeHook.js";

export default function checkForAlreadyHook(context: QContext, done) {
  const current = context.instance.lastResolved();
  if (
    current &&
    current[0] &&
    current[0].route === context.match.route &&
    current[0].url === context.match.url &&
    current[0].queryString === context.match.queryString
  ) {
    const hooks = current.reduce((acc, c) => {
        if (c.route.hooks && c.route.hooks.already && undefinedOrTrue(context.navigateOptions, "callHooks")) {
            acc = acc.concat(c.route.hooks.already);
        }
        return acc;
    }, []);

    //c.route.hooks.already.forEach((f) => f(context.match));
    executeHook(context, done, hooks, context.match, [false]);
    return;
  }
  else {
    done();
  }
}
