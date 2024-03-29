import m from "mithril";

export default function Modal() {
  return {
    view() {
      return [
        m("div", { class: "overlay" }),
        m("div", { class: "modal" }, [
          m("h1", "Welcome to scratchpad!"),
          m(
            "p",
            "Scratchpad is an in browser JavaScript sandbox and REPL designed for experimentation and testing. It stores all your scripts in the browser. No log in or sign up neccesary!",
          ),
          m(
            m.route.Link,
            {
              class: "theme",
              href: "/new",
              onclick() {
                localStorage.setItem("visited", "true");
              },
            },
            "Create a new scratchpad",
          ),
        ]),
      ];
    },
  };
}
