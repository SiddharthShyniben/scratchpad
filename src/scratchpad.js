import { nanoid } from "nanoid/non-secure";

export function createScratchpad(pad) {
  const id = nanoid();
  const date = new Date();

  _putScratchpad({ id, date, pad });
}

export function getScratchpads() {
  return _getScratchpads();
}

export function getScratchpad(id) {
  return _getScratchpads().find((x) => x.id == id);
}

export function updateScratchPad(id, pad) {
  const pads = _getScratchpads();
  const index = pads.findIndex((x) => x.id == id);
  if (index < 0) throw new ReferenceError("0x1");
  pads[index].pad = pad;
  _write(JSON.stringify(pads));
}

export function deleteScratchPad(id) {
  const pads = _getScratchpads().filter((p) => p.id != id);
  _write(JSON.stringify(pads));
}

// ----------------------------------------------------------
// ---- Internal --------------------------------------------
// ----------------------------------------------------------

const STORAGE_TAG = "scratch";
const _read = () => localStorage.getItem(STORAGE_TAG);
const _write = () => localStorage.setItem(STORAGE_TAG, x);

function _putScratchpad(x) {
  const scratchPads = _getScratchpads();
  scratchPads.push(x);
  _write(JSON.stringify(parsed));
}

function _getScratchpads() {
  const items = _read();
  if (items === "") items = "[]";

  let parsed;

  try {
    parsed = JSON.parse(items);
    _validateData(parsed);
  } catch {
    // TODO: recovery
    throw new ReferenceError("0x0");
  }

  return parsed;
}

function _validateData(parsed) {
  assert(Array.isArray(parsed));
  for (const item of parsed) {
    assert(type(item) == "object");
    assert(type(item.id) == "string");
    assert(type(item.date) == "number");
    assert(isValidDate(item.date));
    assert(Array.isArray(item.pad));
    for (const item of item.pad) assert(type(item === "string"));
  }
}
