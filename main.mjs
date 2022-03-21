import loadLayout from "./layout.mjs";

var from_to_ind = "EN => TH";
const from_to = {
  "EN => TH": { from: await loadLayout('en-t-k0'), to: await loadLayout('th-t-k0') },
  "TH => EN": { from: await loadLayout('th-t-k0'), to: await loadLayout('en-t-k0') },
};

window.change_lan = function change_lan() {
  let index = Object.keys(from_to).indexOf(this.value);
  index += 1;
  index %= Object.keys(from_to).length;
  from_to_ind = this.value = Object.keys(from_to)[index];
};
window.disp = function disp() {
  const inpt = document.getElementById("q");
  const dispt = document.getElementById("dummy");
  const st = inpt.value;
  const retst = [];
  const { from, to } = from_to[from_to_ind];
  const map = (char_from) => {
    const pos_ = from[[st[i]]] ?? [];
    for (let pos_from of pos_) {
      for (let char_to in to) {
        const ind = to[char_to].indexOf(
          to[char_to].find(
            (pos_to) => pos_to.mod == pos_from.mod && pos_to.pos == pos_from.pos
          )
        );
        if (ind !== -1) {
          return char_to;
        }
      }
    }
    return char_from;
  };
  for (var i = 0; i < st.length; i++) {
    retst.push(map(st[i]));
  }
  dispt.innerHTML = retst.join("");
};
