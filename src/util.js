export function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

export function type(obj, showFullClass) {
  // Whether to return the whole type
  if (showFullClass && typeof obj === "object") {
    return Object.prototype.toString.call(obj);
  }

  if (obj == null) {
    return (obj + "").toLowerCase();
  } // implicit toString() conversion

  // Removed, see comments
  // if (isNaN(+obj)) return "nan";
  if (Object.is(obj, NaN)) return "nan";

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  if (deepType === "generatorfunction") {
    return "function";
  }

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(
    /^(array|bigint|date|error|function|generator|regexp|symbol)$/,
  )
    ? deepType
    : typeof obj === "object" || typeof obj === "function"
      ? "object"
      : typeof obj;
}

export function isValidDate(d) {
  return new Date(d) instanceof Date && !isNaN(new Date(d));
}

export function trunc(text, length = 1000) {
  if (text.length > length) return text.slice(0, 997) + "...";
  return text;
}

export function truncCode(text, lines = 15) {
  const split = text.split("\n");
  if (split.length > lines) return [...split.slice(0, -1), "..."].join("\n");
  return text;
}

export const rand = (list) => list[Math.floor(Math.random() * list.length)];
export const alphabet =
  "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_-+=~`\"';:>,<./?{}[]1234567890";

export function countLinesAndColumns(el) {
  const divHeight = el.offsetHeight;
  const divWidth = el.offsetWidth;
  const lineHeight = parseInt(el.style.lineHeight.slice(0, -2)) || 18;
  const charWidth = 9.79; // magic
  const lines = divHeight / lineHeight;
  const columns = divWidth / charWidth;
  return { lines: Math.floor(lines), columns: Math.floor(columns) };
}

// Doubles as my color palette
export const colors = [
  "#ffc2c7",
  "#ffafb4",
  "#ff9ba2",
  "#ff888f",
  "#ff757d",
  "#ef626c",
  "#da4f5b",
  "#c53b4a",
  "#b1253a",
  "#9c062a",
  "#88001a",
  "#ecfcff",
  "#d9e8ff",
  "#c6d5ff",
  "#b3c2f2",
  "#a1afde",
  "#8f9dcb",
  "#7d8bb8",
  "#6c79a5",
  "#5b6893",
];

export const once = (func) => {
  return function () {
    if (func) {
      func.apply(this, arguments);
      func = null;
    }
  };
};

export function selectAll(el) {
  window.setTimeout(function () {
    let sel, range;
    if (window.getSelection && document.createRange) {
      range = document.createRange();
      range.selectNodeContents(el);
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    }
  }, 1);
}
export function downloadFile(filename, content, type = "text/javascript") {
  console.log({ filename, content });
  // It works on all HTML5 Ready browsers as it uses the download attribute of the <a> element:
  const element = document.createElement("a");

  // A blob is a data type that can store binary data
  // "type" is a MIME type
  // It can have a different value, based on a file you want to save
  const blob = new Blob([content], { type });

  // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  const fileUrl = URL.createObjectURL(blob);

  element.setAttribute("href", fileUrl);
  element.setAttribute("download", filename);
  element.style.display = "none";

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
