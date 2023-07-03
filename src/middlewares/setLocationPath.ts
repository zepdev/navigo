import { QContext } from "../../index.js";
import { getCurrentEnvURL } from "../utils.js";

export default function setLocationPath(context: QContext, done: () => void): void {
  
  const { currentLocationPath, instance } = context;
  
  if (typeof currentLocationPath === "undefined") {
    context.currentLocationPath = context.to = getCurrentURLPath(instance.root);
  }
  
  context.currentLocationPath = instance._checkForAHash(currentLocationPath);
  
  done();
}
