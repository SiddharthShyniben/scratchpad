import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";

import { once, selectAll } from "./util";

export default function New() {
  let untitled = "untitled";
  let content = "untitled scratchpad";

  let editor;

  const dehl = once(() => ((untitled = undefined), m.redraw()));

  return {
    oncreate() {
      editor = new EditorView({
        extensions: [
          basicSetup,
          javascript(),
          birdsOfParadise,
          keymap.of([
            {
              key: "Ctrl-Enter", // TODO Shift?
              run() {
                const code = editor.state.doc.toString();
                eval(code);
                return true;
              },
            },
          ]),
        ],
        parent: document.querySelector(".monaco"), // >:)
      });

      // TODO: maintain minimum lines automatically
      // TODO theming
      const transaction = editor.state.update({
        changes: { from: 0, insert: "\n\n\n\n\n" },
      });
      editor.dispatch(transaction);
    },

    view() {
      return m("main", { class: "main" }, [
        m(
          "h2",
          {
            class: untitled,
            contenteditable: true,
            oninput(e) {
              dehl();
              content = this.innerText;
              e.redraw = false;
            },
            onfocus: (e) => {
              selectAll(e.target);
            },
          },
          m.trust(content),
        ),
        m("div", { class: "monaco" }),
      ]);
    },
  };
}
