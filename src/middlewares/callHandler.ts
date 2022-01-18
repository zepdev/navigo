import { QContext } from "../../index.js";
import { undefinedOrTrue } from "../utils.js";

export default function callHandler(context: QContext, done) {
  const d = function() {
    context.instance.updatePageLinks();
    done();
  };

  if (undefinedOrTrue(context.navigateOptions, "callHandler")) {
    context.match.route.handler(d, context.match);
  }
  else {
    d();
  }
}
