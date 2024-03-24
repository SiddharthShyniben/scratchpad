import m from "mithril";
import Home from "./home";

const root = document.body;

m.route(root, "/", {
  "/": Home,
});
