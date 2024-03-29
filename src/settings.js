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
        m(
          "a",
          {
            class: "run delete",
            onclick(e) {
              if (e.target.innerText == "Delete all my data") {
                const replacement = "Are you really sure?";
                let i = 1;

                const replace = () => {
                  e.target.innerText =
                    replacement.slice(0, i) + e.target.innerText.slice(i);
                  i++;
                  if (i <= replacement.length) setTimeout(replace, 25);
                };

                replace();
                setTimeout(
                  () => (e.target.innerText = "Delete all my data"),
                  5000,
                );
              } else {
                localStorage.setItem("scratch", "");
                localStorage.setItem("show_debug", "true");
                navigating(true);
                m.route.set("/home");
              }
            },
          },
          "Delete all my data",
        ),
      ]);
    },
  };
}
