import { QContext } from "../../index.js";

export default function flushCurrent(context: QContext, done) {
  context.instance._setCurrent(null);
  done();
}
