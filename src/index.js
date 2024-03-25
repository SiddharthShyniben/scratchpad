import m from "mithril";
import Home from "./home";
import New from "./new";

const root = document.body;

m.route(root, "/", {
  "/": Home,
  "/new": New(),
});
