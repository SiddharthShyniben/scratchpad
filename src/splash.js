import m from "mithril";

export default function Splash() {
  let text = "(.*)";

  let i = 0;
  const list = ["( *)", "(  )", "(. )", "(.*)"];

  setInterval(() => {
    text = list[i];
    i = i + 1;
    if (i > 3) i = 0;
    m.redraw();
  }, 200);

  return {
    view() {
      return m("div", { class: "splash" }, m("span", text));
    },
  };
}
