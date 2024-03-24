import m from "mithril";
import {
  alphabet,
  colors,
  countLinesAndColumns,
  rand,
  trunc,
  truncCode,
} from "./util";

let out = "";
let lines, columns;

window.addEventListener(
  "resize",
  () => (
    ({ lines, columns } = countLinesAndColumns(
      document.querySelector(".empty-screen"),
    )),
    drawGrid()
  ),
);

function drawGrid() {
  const upperText = "No scratchpads found";
  const text = "What will you code today?";

  const span = (opacity, color, text) =>
    `<span style="color: ${color || rand(colors)}${opacity ? rand([55, 66, 77]) : ""}">${text || rand(alphabet)}</span>`;

  out = ("x".repeat(columns) + "\n")
    .repeat(lines)
    .split("\n")
    .map((k, i) =>
      k
        .split("")
        .map((_, j) =>
          i == Math.floor(lines / 2)
            ? Math.random() > 0.95
              ? span()
              : text[j - Math.floor(columns / 5)] || span(true)
            : i == Math.floor(lines / 2) - 1
              ? Math.random() > 0.95
                ? span()
                : upperText[j - Math.floor(columns / 5) + 2] || span(true)
              : span(true),
        )
        .join(""),
    )
    .join("\n");

  m.redraw();
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
    window.requestAnimationFrame(drawGrid);
}

export default function List() {
  return {
    oncreate() {
      ({ lines, columns } = countLinesAndColumns(
        document.querySelector(".empty-screen"),
      ));
      window.requestAnimationFrame(drawGrid);
    },
    view(vnode) {
      return m("main", { class: "main" }, [
        m("h1", "Your scratchpads"),
        m("hr"),
        ...(vnode.attrs.items.length == 0
          ? [m("div", { class: "empty-screen" }, m.trust(out))]
          : vnode.attrs.items.map((x) => {
              const display = x.pad[0];
              const text =
                display.type === "code"
                  ? truncCode(display.text)
                  : trunc(display.text);
              const tag =
                display.type === "code"
                  ? m("pre", { class: "code-display" }, m("code", text))
                  : m("p", { class: "code-display" }, text);

              return m("div", { class: "pad-item" }, [
                m(
                  "h2",
                  { class: x.title === null ? "untitled" : undefined },
                  x.title || "untitled scratchpad",
                ),
                tag,
              ]);
            })),
      ]);
    },
  };
}
