import m from "mithril";
import { navigating, navigatingFromNew } from "./global-state";

export default function Settings() {
  // Debug log
  // Theming

  return {
    view() {
      return m("main", { class: "main" }, [
        m("aside", [
          m(
            m.route.Link,
            {
              href: "/",
              class: "logo menu-item",
              onclick: () => navigating(true),
            },
            "(.*)",
          ),
          m(
            m.route.Link,
            {
              href: "/new",
              class: "menu-item",
            },
            "New",
          ),
          m("hr"),
          m("a", { class: "menu-item", href: "#!/settings" }, "Settings"),
          // m("a", { class: "menu-item" }, "Help"),
        ]),
        m("h1", "Settings"),
        m("div", { class: "setting" }, [
          m("input", {
            type: "checkbox",
            oncreate(vnode) {
              if (
                !["true", "false"].includes(localStorage.getItem("show_debug"))
              )
                localStorage.setItem("show_debug", true);
              vnode.dom.setAttribute(
                "checked",
                localStorage.getItem("show_debug") == "true",
              );
              m.redraw();
            },
            oninput(e) {
              localStorage.setItem("show_debug", e.target.checked.toString());
              console.log(e.target.checked);
            },
          }),
          m("label", "Show debug logs"),
          m(
            "p",
            "Enable or disable showing the output of `console.debug` calls",
          ),
        ]),
      ]);
    },
  };
}
