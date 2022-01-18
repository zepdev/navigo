import { QContext } from "../../index.js";
import { getCurrentEnvURL } from "../utils.js";

export default function setLocationPath(context: QContext, done) {
  if (typeof context.currentLocationPath === "undefined") {
    context.currentLocationPath = context.to = getCurrentEnvURL(
      context.instance.root
    );
  }
  context.currentLocationPath = context.instance._checkForAHash(
    context.currentLocationPath
  );
  done();
}
