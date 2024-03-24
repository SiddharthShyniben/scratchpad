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

  if (obj == null) { return (obj + '').toLowerCase(); } // implicit toString() conversion

  // Removed, see comments
  // if (isNaN(+obj)) return "nan";
  if (Object.is(obj, NaN)) return "nan";

  var deepType = Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
  if (deepType === 'generatorfunction') { return 'function' }

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
