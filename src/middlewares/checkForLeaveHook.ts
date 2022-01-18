import { QContext } from "../../index.js";
import Q from "../Q.js";
import { undefinedOrTrue } from "../utils.js";
import executeHook from "./executeHook.js";

export default function checkForLeaveHook(context: QContext, done) {
  const instance = context.instance;
  if (!instance.lastResolved()) {
    done();
    return;
  }
  Q(
    instance.lastResolved().map((oldMatch) => {
      return (_, leaveLoopDone) => {
        // no leave hook
        if (!oldMatch.route.hooks || !oldMatch.route.hooks.leave) {
          leaveLoopDone();
          return;
        }
        let runHook = false;
        const newLocationVSOldMatch = context.instance.matchLocation(
          oldMatch.route.path,
          context.currentLocationPath,
          false
        );
        if (oldMatch.route.path !== "*") {
          runHook = !newLocationVSOldMatch;
        } else {
          const someOfTheLastOnesMatch = context.matches
            ? context.matches.find((match) => {
                return oldMatch.route.path === match.route.path;
              })
            : false;
          runHook = !someOfTheLastOnesMatch;
        }
        if (undefinedOrTrue(context.navigateOptions, "callHooks") && runHook) {
            executeHook(
              context,
              leaveLoopDone,
              oldMatch.route.hooks.leave,
            context.matches && context.matches.length > 0
                      ? (context.matches.length === 1 ? context.matches[0] : context.matches)
                      : undefined
            );
          return;
        } else {
          leaveLoopDone();
        }
      };
    }),
    {},
    () => done()
  );
}
