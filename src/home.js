import m from "mithril";
import List from "./list";
import { getScratchpads } from "./scratchpad";
import Splash from "./splash";

async function fetchData() {
  return getScratchpads();
}

export default function Home() {
  let view = Splash;
  let args = undefined;
  fetchData().then((items) => {
    view = List;
    args = { items };
    m.redraw();
  });

  return {
    view() {
      return m(view, args);
    },
  };
}
