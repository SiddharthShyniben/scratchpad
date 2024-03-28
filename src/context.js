import { escapeHtml, stringify, type as findType } from "./util";

export const contextMachine = () => {
  let _logs = [];

  const pushLog =
    (type) =>
    (...logs) => {
      if (logs.length == 1)
        _logs.push({
          type,
          out: escapeHtml(stringify(logs[0])),
          typeActual: findType(logs[0]),
        });
      else
        _logs.push({
          type,
          out: escapeHtml(logs.map(stringify).join(" ")),
          typeActual: "string",
        });
    };

  let defaultCount = 0;
  let counts = {};

  let defaultTimer = 0;
  let timers = {};

  return [
    {
      // TODO: string substitution
      document,
      window,

      console: {
        assert: (cond, ...args) =>
          cond ? undefined : pushLog("error")(...args),
        clear: () => (_logs = []),
        count: (label) => {
          if (label) {
            label = label.toString();
            counts[label] = counts[label] || 0;
            _logs.push(`${label}: ${++counts[label]}`);
          } else {
            _logs.push(`default: ${++defaultCount}`);
          }
        },
        countReset: (label) =>
          label ? (counts[label.toString()] = 0) : (defaultCount = 0),

        debug: pushLog("debug"),

        // FIXME: add proper dir
        dir: pushLog("log"),
        dirXml: pushLog("log"),

        error: pushLog("error"),

        // TODO: group, groupCollapsed, groupEnd

        info: pushLog("info"),
        log: pushLog("log"),

        // profile and profileEnd

        table: (...objects) => {
          if (
            findType(objects[0]) == "object" ||
            findType(objects[0]) == "array"
          ) {
            _logs.push({
              type: "table",
              typeActual: "string",
              out: `<table class="terminal-output"><tbody><tr><th>(index)</th><th>Value</th><tr>${Object.entries(
                objects[0],
              )
                .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
                .join("")}</tbody></table>`,
            });
          } else pushLog("log")(...objects);
        },

        time: (label) => {
          if (label) timers[label.toString()] = Date.now();
          else defaultTimer = Date.now();
        },
        timeLog: (label) => {
          const now = Date.now();
          let start;
          if (label) {
            label = label.toString();
            if (timers[label]) start = timers[label];
            else return pushLog("warn")(`Timer '${label}' does not exist`);
          } else if (defaultTimer !== undefined) {
            start = defaultTimer;
          } else {
            return pushLog("warn")(`Timer 'default' does not exist`);
          }

          pushLog("time")(`${label || "default"}: ${now - start} ms`);
        },
        timeEnd: (label) => {
          const now = Date.now();
          let start;
          if (label) {
            label = label.toString();
            if (timers[label]) start = timers[label];
            else return pushLog("warn")(`Timer '${label}' does not exist`);
          } else if (defaultTimer !== undefined) {
            start = defaultTimer;
          } else {
            return pushLog("warn")(`Timer 'default' does not exist`);
          }

          pushLog("time")(
            `${label || "default"}: ${now - start} ms - timer ended`,
          );
          if (label) delete timers[label.toString()];
          else defaultTimer = undefined;
        },

        // timeStamp

        // TODO: remove extras at end of trace
        trace: () => {
          const { stack } = new Error();
          _logs.push({
            type: "warn",
            typeActual: "trace",
            out: escapeHtml("Trace" + stack.slice(5)),
          });
        },

        warn: pushLog("warn"),
      },
    },
    () => _logs,
  ];
};
