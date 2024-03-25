import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { selectAll } from "./util";
import {
  createScratchpad,
  getScratchpad,
  updateScratchPad,
} from "./scratchpad";

export default function View() {
  let scratchpad = {
    title: null,
    pad: [{ type: "code", text: "" }],
  };

  const savePad = () => {
    if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
    else scratchpad = updateScratchPad(scratchpad);
  };

  let editor;

  return {
    oninit(vnode) {
      scratchpad = getScratchpad(vnode.attrs.id);
    },
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
                // TODO: run code
                return true;
              },
            },
          ]),
          EditorView.updateListener.of((v) => {
            if (v.docChanged) {
              scratchpad.pad[0].text = editor.state.doc.toString();
              savePad();
            }
          }),
        ],
        parent: document.querySelector(".monaco"), // >:)
      });

      // TODO: maintain minimum lines automatically
      // TODO theming
      const transaction = editor.state.update({
        changes: { from: 0, insert: scratchpad.pad[0].text },
      });
      editor.dispatch(transaction);
    },

    view() {
      return m("main", { class: "main" }, [
        m(
          "h2",
          {
            contenteditable: true,
            oninput(e) {
              scratchpad.title = this.innerText.trim();
              e.redraw = false;
              savePad();
            },
            onkeypress(e) {
              if (e.which == 13) e.preventDefault();
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
