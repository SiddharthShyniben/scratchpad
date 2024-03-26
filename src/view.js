import m from "mithril";
import { basicSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { birdsOfParadise } from "thememirror";
import { downloadFile, selectAll, slugify } from "./util";
import {
  createScratchpad,
  deleteScratchPad,
  getScratchpad,
  updateScratchPad,
} from "./scratchpad";
import { navigating } from "./global-state";

export default function View() {
  let scratchpad = {
    title: null,
    pad: [{ type: "code", text: "" }],
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
  console.log(showTransition);
  if (showTransition) navigating(false);

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
              key: "Ctrl-Enter", // TODO: Shift?
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
            m(m.route.Link, { href: "/", class: "logo menu-item" }, "(.*)"),
            m(
              m.route.Link,
              {
                href: "/new",
                onbeforeremove(vnode) {
                  vnode.dom.classList.add("exit");
                  return new Promise(function (resolve) {
                    vnode.dom.addEventListener("animationend", resolve);
                  });
                },
                class: "menu-item" + (showTransition ? " enter" : ""),
              },
              "New",
            ),
            m(
              "a",
              {
                class: "menu-item" + (showTransition ? " enter" : ""),
                onbeforeremove(vnode) {
                  vnode.dom.classList.remove("enter");
                  vnode.dom.classList.add("exit");
                  return new Promise(function (resolve) {
                    vnode.dom.addEventListener("animationend", resolve);
                  });
                },
                onclick() {
                  const newPad = createScratchpad({
                    ...scratchpad,
                    title: scratchpad.title + " clone",
                  });
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
                onbeforeremove(vnode) {
                  vnode.dom.classList.removve("enter");
                  vnode.dom.classList.add("exit");
                  return new Promise(function (resolve) {
                    vnode.dom.addEventListener("animationend", resolve);
                  });
                },
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
                onbeforeremove(vnode) {
                  vnode.dom.classList.removve("enter");
                  vnode.dom.classList.add("exit");
                  return new Promise(function (resolve) {
                    vnode.dom.addEventListener("animationend", resolve);
                  });
                },
                onclick() {
                  deleteScratchPad(scratchpad.id);
                  m.route.set("/home");
                },
              },
              "Delete",
            ),
            m("hr"),
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
            m.trust(scratchpad.title || "untitled scratchpad"),
          ),
          m("div", { class: "monaco" + (showTransition ? " enter" : "") }),
        ]),
      ];
    },
  };
}
