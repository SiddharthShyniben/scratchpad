import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { once } from "./util";
import { createScratchpad, updateScratchPad } from "./scratchpad";
import { navigating, navigatingFromNew } from "./global-state";

export default function New() {
  let untitled = true;

  let scratchpad = {
    title: null,
    pad: [{ type: "code", text: "" }],
  };

  let editor;
  let first = true;

  const dehl = once(() => ((untitled = false), m.redraw()));
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
              key: "Shift-Enter",
              run() {
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
              if (scratchpad.id) {
                navigating(true);
                navigatingFromNew(true);
                m.route.set("/pad/:id", { id: scratchpad.id }); // or not?
              }
            }
          }),
        ],
        parent: document.querySelector(".monaco"), // >:)
      });
    },

    view() {
      return [
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
            { class: "menu-item", href: "/settings" },
            "Settings",
          ),
          m("a", { class: "menu-item" }, "Help"),
        ]),
        m("main", { class: "main" }, [
          m(
            "h2",
            {
              class: `enter ${untitled ? "untitled" : ""}`,
              contenteditable: true,
              oninput(e) {
                dehl();
                e.redraw = false;
                scratchpad.title = this.innerText.trim();
                savePad();
              },
              onfocusout() {
                if (scratchpad.id) {
                  navigating(true);
                  navigatingFromNew(true);
                  m.route.set("/pad/:id", { id: scratchpad.id }); // or not?
                }
              },
            },
            m.trust(scratchpad.title || "untitled scratchpad"),
          ),
          m("div", { class: "monaco enter" }),
        ]),
      ];
    },
  };
}
