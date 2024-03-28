import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { downloadFile, selectAll, slugify, stringify, type } from "./util";
import {
  createScratchpad,
  deleteScratchPad,
  getScratchpad,
  updateScratchPad,
} from "./scratchpad";
import { navigating, navigatingFromNew } from "./global-state";
import VM from "vm-browserify";
import { contextMachine } from "./context";

export default function View() {
  let scratchpad = {
    title: "untitled scratchpad",
    pad: [{ type: "code", text: "" }],
  };

  const outputTypeTable = {
    string:
      '<span class="type string material-symbols-outlined">format_quote</span>',
    number: '<span class="type number material-symbols-outlined">tag</span>',
    object:
      '<span class="type object material-symbols-outlined">data_object</span>',
    "no-output":
      '<span class="type number material-symbols-outlined">task</span>',
    table: '<span class="type number material-symbols-outlined">table</span>',
    time: '<span class="type timer material-symbols-outlined">timer</span>',
    trace:
      '<span class="type trace material-symbols-outlined">footprint</span>',
  };

  const savePad = () => {
    if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
    else scratchpad = updateScratchPad(scratchpad);
  };

  /*
   * NOTE: Note to self on running code
   * - Should I support node.js internals?
   * - External variables?
   * - Or just use a VM and let the user deal with it?
   */

  const showTransition = navigating();
  if (showTransition) navigating(false);

  const showNewTransition = navigatingFromNew();
  if (showNewTransition) navigatingFromNew(false);

  let editor,
    terminalOutput = [];

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
              key: "Ctrl-Enter", // TODO: Shift?
              run() {
                terminalOutput = [];
                const code = editor.state.doc.toString();
                const script = new VM.Script(code, {
                  filename: slugify(scratchpad.title),
                });

                const [_context, getOutput] = contextMachine();
                const context = VM.createContext(_context);
                const output = script.runInContext(context);

                terminalOutput.push(...getOutput());
                if (output)
                  terminalOutput.push({
                    type: "output",
                    out: stringify(output),
                    typeActual: type(output),
                  });

                if (terminalOutput.length == 0)
                  terminalOutput.push({
                    type: "no-output",
                    out: "No output",
                    typeActual: "string",
                  });

                m.redraw();
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
      // TODO: theming
      const transaction = editor.state.update({
        changes: { from: 0, insert: scratchpad.pad[0].text },
      });
      editor.dispatch(transaction);
    },

    view() {
      // TODO: Refactor?
      return [
        m("main", { class: "main" }, [
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
                class: "menu-item" + (showNewTransition ? " enter" : ""),
              },
              "New",
            ),
            m(
              "a",
              {
                class: "menu-item" + (showTransition ? " enter" : ""),
                async onclick() {
                  const letters = [..." clone"];
                  const addLetters = () =>
                    new Promise((resolve) => {
                      scratchpad.title += letters.splice(0, 1);
                      m.redraw();
                      if (letters.length)
                        setTimeout(() => {
                          addLetters().then(resolve);
                        }, 100);
                      else resolve();
                    });
                  await addLetters();
                  const newPad = createScratchpad({ ...scratchpad });
                  scratchpad = newPad;
                  m.route.set("/pad/:id", { id: newPad.id });
                  m.redraw();
                },
              },
              "Clone",
            ),
            m(
              "a",
              {
                class: "menu-item" + (showTransition ? " enter" : ""),
                onclick() {
                  downloadFile(
                    slugify(scratchpad.title) + ".js",
                    scratchpad.pad[0].text,
                  );
                },
              },
              "Download",
            ),
            m(
              "a",
              {
                class: "menu-item danger" + (showTransition ? " enter" : ""),
                onclick() {
                  deleteScratchPad(scratchpad.id);
                  m.route.set("/home");
                },
              },
              "Delete",
            ),
            m("hr", { class: showTransition ? "enter" : "" }),
            m("a", { class: "menu-item" }, "Settings"),
            m("a", { class: "menu-item" }, "Help"),
          ]),
          m(
            "h2",
            {
              class: showTransition ? "enter" : "",
              contenteditable: true,
              oninput(e) {
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
            },
            m.trust(scratchpad.title),
          ),
          m("div", { class: "monaco" + (showTransition ? " enter" : "") }),
          ...terminalOutput.map((x) =>
            x.type == "table"
              ? m.trust(x.out)
              : m("p", { class: "terminal-output " + x.type }, [
                  // TODO: debug toggle
                  m.trust(
                    outputTypeTable[x.type] || outputTypeTable[x.typeActual],
                  ),
                  m.trust(
                    x.out.replaceAll("\n", "<br>").replaceAll(" ", "&nbsp;"),
                  ),
                ]),
          ),
        ]),
      ];
    },
  };
}
