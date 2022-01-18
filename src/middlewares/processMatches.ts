import { QContext } from "../../index.js";
import Q from "../Q.js";
import { foundLifecycle } from "../lifecycles.js";
import updateState from "./updateState.js";
import checkForLeaveHook from "./checkForLeaveHook.js";

export default function processMatches(context: QContext, done) {
  let idx = 0;
  function nextMatch() {
    if (idx === context.matches.length) {
      updateState(context, done);
      return;
    }
    Q(
      foundLifecycle,
      { ...context, match: context.matches[idx] },
      function end() {
        idx += 1;
        nextMatch();
      }
    );
  }
  checkForLeaveHook(context, nextMatch);
}
