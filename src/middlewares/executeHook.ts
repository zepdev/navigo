import {AfterHook, AlreadyHook, BeforeHook, LeaveHook, QContext} from "../../index.js";
import Q from "../Q.js";

export default function executeHook(context: QContext, done, hooks: BeforeHook[] | AfterHook[] | LeaveHook[] | AlreadyHook[], match, doneArgs = []) {
  Q(
    hooks
      .map((f) => {
        // just so we match the Q interface
        return function hookInternal(_, d) {
          return f((shouldStop) => {
            if (shouldStop === false) {
              context.instance.__markAsClean(context);
            } else {
              d();
            }
          }, match);
        };
      })
      .concat([() => done(...doneArgs)])
  );
}
