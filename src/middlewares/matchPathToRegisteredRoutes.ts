import { matchRoute } from "../utils.js";
import { QContext, Match } from "../../index.js";

export default function matchPathToRegisteredRoutes(context: QContext, done) {
  for (let i = 0; i < context.instance.routes.length; i++) {
    const route = context.instance.routes[i];
    const match: false | Match = matchRoute(context, route);
    if (match) {
      if (!context.matches) context.matches = [];
      context.matches.push(match);
      if (context.resolveOptions.strategy === "ONE") {
        done();
        return;
      }
    }
  }
  done();
}
