import m from "mithril";

import { navigating } from "./global-state";
import { getScratchpads } from "./scratchpad";

import List from "./list";
import Splash from "./splash";
import Modal from "./modal";

async function fetchData() {
  return getScratchpads();
}

export default function Home() {
  let view = Splash;
  let args = undefined;

  const showTransition = navigating();
  if (showTransition) navigating(false);
  fetchData().then((items) => {
    view = List;
    args = { items, showTransition };
    m.redraw();
  });

  // TODO: storage capacity thing
  return {
    view() {
      return [
        localStorage.getItem("visited") || m(Modal),
        m("aside", [
          m("a", { href: "/", class: "logo menu-item" }, "(.*)"),
          m("a", { href: "#!/new", class: "menu-item" }, "New"),
          m("hr"),
          m(
            m.route.Link,
            { class: "menu-item", href: "/settings" },
            "Settings",
          ),
          // m("a", { class: "menu-item" }, "Help"),
        ]),
        m(view, args),
      ];
    },
  };
}
