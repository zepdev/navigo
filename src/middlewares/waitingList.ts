import { QContext } from "../../index.js";

export default function waitingList(context: QContext) {
  context.instance.__markAsClean(context);
}
