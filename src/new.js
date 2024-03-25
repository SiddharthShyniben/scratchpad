import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { once, selectAll } from "./util";
import { createScratchpad, updateScratchPad } from "./scratchpad";

export default function New() {
  let untitled = "untitled";

  let scratchpad = {
    title: null,
    pad: [{ type: "code", text: "\n\n\n" }],
  };

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
                scratchpad.pad[0].text = editor.state.doc.toString();
                if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
                else scratchpad = updateScratchPad(scratchpad);
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
              scratchpad.title = this.innerText.trim();
              e.redraw = false;
              if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
              else scratchpad = updateScratchPad(scratchpad);
            },
            onfocus: (e) => {
              selectAll(e.target);
            },
          },
          m.trust(scratchpad.title || "untitled scratchpad"),
        ),
        m("div", { class: "monaco" }),
      ]);
    },
  };
}
