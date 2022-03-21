const NO_MOD = '-';

const layout_path = (name) => `cldr/keyboards/windows/${name}-windows.xml`

function parseString(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  input = doc.documentElement.textContent;
  const re = /\\u{([\d\w]*)}/gi;
  input = input.replace(re, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
  return input;
}

export default function loadLayout(name) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      const xml = xhr.responseXML.documentElement;
      const layout = {};
      const keyMaps = xml.getElementsByTagName("keyMap");
      function handleChar(mod, pos, char) {
        char = parseString(char);
        if (layout[char] === undefined) layout[char] = [];
        layout[char].push({ pos, mod });
        layout[char].sort(function (a, b) {
          return a.mod == NO_MOD
            ? -1
            : b.mod == NO_MOD
              ? +1
              : a.mod.split("+").length - b.mod.split("+").length;
        });
      }
      function handleMod(mod, chars) {
        Array.from(chars).forEach((element) => {
          const pos = element.getAttribute("iso");
          const char = element.getAttribute("to");
          handleChar(mod, pos, char);
        });
      }
      function handleKeyMap(keyMap) {
        const mods_ = keyMap.getAttribute("modifiers") ?? NO_MOD;
        const chars = keyMap.getElementsByTagName("map");
        // TODO: Parse https://www.unicode.org/reports/tr35/tr35-keyboards.html#Element_keyMap
        // A+B => A+BL+BR? A+BL?+BR
        // A+B => A+BL+BR A+BL A+BR
        // A+B? => A A+B
        // Parse to simple " " and "+"
        // May be done by pop and push back the possibility untill all are simple
        let mods = new Set(mods_.split(" "));
        mods.forEach((mod) => {       
          handleMod(mod, chars)
        });
      }
      Array.from(keyMaps).forEach((element) => {
        handleKeyMap(element);
      });
      resolve(layout);
    };

    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };

    xhr.open("GET", layout_path(name));
    xhr.responseType = "document";
    xhr.send();
  });
}