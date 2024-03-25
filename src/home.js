import m from "mithril";
import List from "./list";
import { getScratchpads } from "./scratchpad";
import Splash from "./splash";

async function fetchData() {
  return getScratchpads();
}

export default function Home() {
  let view = Splash;
  let args = undefined;
  fetchData().then((items) => {
    view = List;
    args = { items };
    m.redraw();
  });

  // TODO: storage capacity thing
  return {
    view() {
      return [
        m("aside", [
          m("a", { href: "/", class: "logo menu-item" }, "(.*)"),
          m("a", { href: "#!/new", class: "menu-item" }, "New"),
          m("a", { class: "menu-item" }, "Help"),
        ]),
        m(view, args),
      ];
    },
  };
}
