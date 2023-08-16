class mapHelper {
  lerpColor(a, b, amount) {
    let ah = parseInt(a.replace(/#/g, ""), 16),
      ar = ah >> 16,
      ag = (ah >> 8) & 0xff,
      ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ""), 16),
      br = bh >> 16,
      bg = (bh >> 8) & 0xff,
      bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);

    return (
      "#" +
      (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
    );
  }

  inverseLerp(x, y, value) {
    if (value < x) value = x;
    if (value > y) value = y;

    if (x !== y) {
      return (value - x) / (y - x);
    } else {
      return 0;
    }
  }

  getBudgetColor(budget, config_, c1 = "#FF0000", c2 = "#00FF00") {
    if (typeof Number(budget) !== "number") {
      return "";
    }

    if (config_["budgetInverse"])
      return this.lerpColor(
        c1,
        c2,
        this.inverseLerp(
          config_["budgetMin"],
          config_["budgetMax"],
          Number(budget)
        )
      );
    else
      return this.lerpColor(
        c2,
        c1,
        this.inverseLerp(
          config_["budgetMin"],
          config_["budgetMax"],
          Number(budget)
        )
      );
  }

  howBright(color) {
    if (color.length !== 7) return "#212529";
    const c = color.substring(1); // strip #
    const rgb = parseInt(c, 16); // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff; // extract red
    const g = (rgb >> 8) & 0xff; // extract green
    const b = (rgb >> 0) & 0xff; // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 100) {
      return "#ffffff";
    } else {
      return "#212529";
    }
  }
}

export default mapHelper;
