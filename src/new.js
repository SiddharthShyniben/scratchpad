import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { downloadFile, once, selectAll, slugify } from "./util";
import {
  createScratchpad,
  deleteScratchPad,
  updateScratchPad,
} from "./scratchpad";

export default function New() {
  let untitled = "untitled";

  let scratchpad = {
    title: null,
    pad: [{ type: "code", text: "\n\n\n" }],
  };

  let editor;
  let first = true;

  const dehl = once(() => ((untitled = undefined), m.redraw()));
  const savePad = () => {
    if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
    else scratchpad = updateScratchPad(scratchpad);
  };

  return {
    oncreate() {
      editor = new EditorView({
        extensions: [
          basicSetup,
          javascript(),
          birdsOfParadise,
          keymap.of([
            {
              key: "Ctrl-Enter", // TODO: Shift?
              run() {
                // TODO: run code
                return true;
              },
            },
          ]),
          EditorView.updateListener.of((v) => {
            if (v.docChanged) {
              if (first) return;
              scratchpad.pad[0].text = editor.state.doc.toString();
              savePad();
              first = false;
            }
          }),
        ],
        parent: document.querySelector(".monaco"), // >:)
      });

      // TODO: maintain minimum lines automatically
      // TODO: theming
      const transaction = editor.state.update({
        changes: { from: 0, insert: "\n\n\n\n\n" },
      });
      editor.dispatch(transaction);
    },

    // TODO: fluid animations?
    view() {
      return [
        m(
          "aside",
          [
            m("a", { href: "/", class: "logo menu-item" }, "(.*)"),
            scratchpad.id &&
              m(
                "a",
                {
                  class: "menu-item",
                  onclick() {
                    const newPad = createScratchpad({
                      ...scratchpad,
                      title: scratchpad.title + " clone",
                    });
                    m.route.set("/pad/:id", { id: newPad.id });
                  },
                },
                "Clone",
              ),
            scratchpad.id &&
              m(
                "a",
                {
                  class: "menu-item",
                  onclick() {
                    downloadFile(
                      slugify(scratchpad.title) + ".js",
                      scratchpad.pad[0].text,
                    );
                  },
                },
                "Download",
              ),
            scratchpad.id &&
              m(
                "a",
                {
                  class: "menu-item danger",
                  onclick() {
                    deleteScratchPad(scratchpad.id);
                    m.route.set("/home");
                  },
                },
                "Delete",
              ),
            m("a", { class: "menu-item" }, "Help"),
          ].filter(Boolean),
        ),
        m("main", { class: "main" }, [
          m(
            "h2",
            {
              class: untitled,

              contenteditable: true,
              oninput(e) {
                dehl();
                scratchpad.title = this.innerText.trim();
                e.redraw = false;
                savePad();
              },
              onkeypress(e) {
                if (e.which == 13) e.preventDefault();
              },
              onfocus(e) {
                selectAll(e.target);
              },
              onfocusout() {
                m.route.set("/pad/:id", { id: scratchpad.id }); // or not?
              },
            },
            m.trust(scratchpad.title || "untitled scratchpad"),
          ),
          m("div", { class: "monaco" }),
        ]),
      ];
    },
  };
}
