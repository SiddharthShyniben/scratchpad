import m from "mithril";

import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";

import VM from "vm-browserify";

import {
  downloadFile,
  outputTypeTable,
  selectAll,
  slugify,
  stringify,
  type,
} from "./util";
import {
  createScratchpad,
  deleteScratchPad,
  getScratchpad,
  updateScratchPad,
} from "./scratchpad";
import { navigating, navigatingFromNew } from "./global-state";
import { contextMachine } from "./context";

export default function View() {
  let scratchpad = {
    title: "untitled scratchpad",
    pad: [{ type: "code", text: "" }],
  };

  const savePad = () => {
    if (!scratchpad.id) scratchpad = createScratchpad(scratchpad);
    else scratchpad = updateScratchPad(scratchpad);
  };

  const showTransition = navigating();
  if (showTransition) navigating(false);

  const showNewTransition = navigatingFromNew();
  if (showNewTransition) navigatingFromNew(false);

  let terminalOutput = [];
  let terminalOutputPoint;

  const editors = [];

  return {
    oninit(vnode) {
      scratchpad = getScratchpad(vnode.attrs.id);
    },
    oncreate() {},

    view() {
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
                        setTimeout(() => addLetters().then(resolve), 100);
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
                    scratchpad.pad
                      .map((x) =>
                        x.type == "code" ? x.text : `/* \n${x.text}\n */`,
                      )
                      .join("\n\n"),
                  );
                },
              },
              "Download",
            ),
            m(
              "a",
              {
                class: "menu-item danger" + (showTransition ? " enter" : ""),
                onclick(e) {
                  console.log(e.target.innerText);
                  if (e.target.innerText == "Delete") {
                    const replacement = "Really?";
                    let i = 1;

                    const replace = () => {
                      e.target.innerText =
                        replacement.slice(0, i) + e.target.innerText.slice(i);
                      i++;
                      if (i <= replacement.length) setTimeout(replace, 50);
                    };

                    replace();

                    setTimeout(() => e.target.innerText = "Delete", 5000)
                  } else {
                    deleteScratchPad(scratchpad.id);
                    m.route.set("/home");
                  }
                },
              },
              "Delete",
            ),
            m("hr", { class: showTransition ? "enter" : "" }),
            m(
              m.route.Link,
              { class: "menu-item", href: "/settings" },
              "Settings",
            ),
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
          m(
            "div",
            scratchpad.pad.map((el, i) => {
              if (el.type == "text") {
                return m("div", { class: "block" }, [
                  m("div", { class: "buttons" }, [
                    scratchpad.pad.length > 1
                      ? m(
                          "button",
                          m(
                            "span",
                            {
                              class: "material-symbols-outlined danger",
                              onclick: () => {
                                scratchpad.pad.splice(i, 1);
                                savePad();
                              },
                            },
                            "delete",
                          ),
                        )
                      : undefined,
                    m(
                      "button",
                      m(
                        "span",
                        {
                          class: "material-symbols-outlined",
                          onclick: () => {
                            scratchpad.pad.splice(i + 1, 0, {
                              type: "text",
                              text: "What will you write today?",
                            });
                            m.redraw();
                          },
                        },
                        "edit_note",
                      ),
                    ),
                    m(
                      "button",
                      {
                        onclick: () => {
                          scratchpad.pad.splice(i + 1, 0, {
                            type: "code",
                            text: "",
                          });
                          m.redraw();
                          editors.forEach(({ editor, i }) => {
                            console.log(editor.dom, scratchpad.pad[i]);
                            const transaction = editor.state.update({
                              changes: {
                                from: 0,
                                to: editor.state.doc.length,
                                insert: scratchpad.pad[i].text,
                              },
                            });
                            editor.dispatch(transaction);
                          });
                          savePad();
                        },
                      },
                      m("span", { class: "material-symbols-outlined" }, "code"),
                    ),
                  ]),
                  m(
                    "p",
                    {
                      class: showTransition ? "para enter" : "para",
                      placeholder: "empty",
                      contenteditable: true,
                      oninput(e) {
                        el.text = this.innerText.trim();
                        e.redraw = false;
                        savePad();
                      },
                    },
                    m.trust(el.text),
                  ),
                ]);
              }

              const className = "monaco-" + i; // >:)
              return m("div", { class: "block" }, [
                m("div", { class: "buttons" }, [
                  scratchpad.pad.length > 1
                    ? m(
                        "button",
                        m(
                          "span",
                          {
                            class: "material-symbols-outlined danger",
                            onclick: () => {
                              scratchpad.pad.splice(i, 1);
                              savePad();
                            },
                          },
                          "delete",
                        ),
                      )
                    : undefined,
                  m(
                    "button",
                    m(
                      "span",
                      {
                        class: "material-symbols-outlined",
                        onclick: () => {
                          scratchpad.pad.splice(i + 1, 0, {
                            type: "text",
                            text: "What will you write today?",
                          });
                          m.redraw();
                        },
                      },
                      "edit_note",
                    ),
                  ),
                  m(
                    "button",
                    {
                      onclick: () => {
                        scratchpad.pad.splice(i + 1, 0, {
                          type: "code",
                          text: "",
                        });
                        m.redraw();
                        editors.forEach(({ editor, i }) => {
                          console.log(editor.dom, scratchpad.pad[i]);
                          const transaction = editor.state.update({
                            changes: {
                              from: 0,
                              to: editor.state.doc.length,
                              insert: scratchpad.pad[i].text,
                            },
                          });
                          editor.dispatch(transaction);
                        });
                        savePad();
                      },
                    },
                    m("span", { class: "material-symbols-outlined" }, "code"),
                  ),
                  m(
                    "button",
                    { class: "run", onclick: () => run(i) },
                    m(
                      "span",
                      { class: "material-symbols-outlined" },
                      "fast_forward",
                    ),
                  ),
                ]),
                m("div", {
                  oncreate() {
                    const editor = new EditorView({
                      extensions: [
                        basicSetup,
                        javascript(),
                        birdsOfParadise,
                        keymap.of([
                          {
                            key: "Shift-Enter",
                            run() {
                              run(i);
                              return true;
                            },
                          },
                        ]),
                        keymap.of([
                          {
                            key: "Ctrl-Enter",
                            run() {
                              scratchpad.pad.splice(i + 1, 0, {
                                type: "code",
                                text: "",
                              });
                              m.redraw();
                              editors.forEach(({ editor, i }) => {
                                const transaction = editor.state.update({
                                  changes: {
                                    from: 0,
                                    to: editor.state.doc.length,
                                    insert: scratchpad.pad[i].text,
                                  },
                                });
                                editor.dispatch(transaction);
                              });
                              const x = editors.find(
                                ({ i: _i }) => _i == i + 1,
                              );
                              if (x) x.editor.focus();
                              savePad();
                              return true;
                            },
                          },
                        ]),
                        EditorView.updateListener.of((v) => {
                          if (v.docChanged) {
                            scratchpad.pad[i].text =
                              editor.state.doc.toString();
                            savePad();
                          }
                        }),
                      ],
                      parent: document.querySelector("." + className),
                    });
                    const transaction = editor.state.update({
                      changes: { from: 0, insert: scratchpad.pad[i].text },
                    });
                    editor.dispatch(transaction);
                    editors.push({ i, editor });
                  },
                  class: className + (showTransition ? " enter" : ""),
                }),
                ...(i == terminalOutputPoint
                  ? terminalOutput.map((x) =>
                      x.type == "table"
                        ? m.trust(x.out)
                        : m("p", { class: "terminal-output " + x.type }, [
                            m.trust(
                              outputTypeTable[x.type] ||
                                outputTypeTable[x.typeActual],
                            ),
                            m.trust(
                              x.out
                                .replaceAll("\n", "<br>")
                                .replaceAll(" ", "&nbsp;"),
                            ),
                          ]),
                    )
                  : []),
              ]);
            }),
          ),
        ]),
      ];
    },
  };

  function run(i) {
    terminalOutput = [];
    const all = editors.filter((e) => e.i <= i).sort((a, b) => a.i - b.i);
    const code = all
      .map(({ editor }) => editor.state.doc.toString())
      .join("\n\n");
    const script = new VM.Script(code, {
      filename: slugify(scratchpad.title),
    });

    const [_context, getOutput] = contextMachine();
    const context = VM.createContext(_context);
    let output;
    try {
      output = script.runInContext(context);
    } catch (e) {
      context.console.error(e.stack);
    }

    terminalOutput.push(...getOutput());
    if (output)
      terminalOutput.push({
        type: "output",
        out: stringify(output),
        typeActual: type(output),
      });

    if (localStorage.getItem("show_debug") === "false")
      terminalOutput = terminalOutput.filter((e) => e.type !== "debug");
    else if (localStorage.getItem("show_debug") !== "true")
      localStorage.setItem("show_debug", true);

    if (terminalOutput.length == 0)
      terminalOutput.push({
        type: "no-output",
        out: "No output",
        typeActual: "string",
      });

    terminalOutputPoint = i;

    m.redraw();
    return true;
  }
}
