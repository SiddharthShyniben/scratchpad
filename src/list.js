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

export default function List() {
  return {
    oncreate() {
      const emptyElement = document.querySelector(".empty-screen");
      if (!emptyElement) return;
      ({ lines, columns } = countLinesAndColumns(emptyElement));
      window.addEventListener(
        "resize",
        () => (
          ({ lines, columns } = countLinesAndColumns(emptyElement)), drawGrid()
        ),
      );
      drawGrid();
    },
    view(vnode) {
      return m("main", { class: "main" }, [
        m("h1", "Your scratchpads"),
        m("hr"),
        ...(vnode.attrs.items.length == 0
          ? [m("div", { class: "empty-screen" }, m.trust(out))]
          : vnode.attrs.items
              .sort((a, b) => b.date - a.date)
              .map((x) => {
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
                    m(
                      "a",
                      { href: "#!/pad/" + x.id },
                      x.title || "untitled scratchpad",
                    ),
                  ),
                  tag,
                ]);
              })),
      ]);
    },
  };
}

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
    setTimeout(drawGrid, 100);
}
