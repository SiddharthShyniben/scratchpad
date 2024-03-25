import m from "mithril";
import Home from "./home";
import New from "./new";
import View from "./view";

const root = document.body;

m.route(root, "/", {
  "/": Home,
  "/new": New,
  "/pad/:id": View,
});
