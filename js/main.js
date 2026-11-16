// Loaded with `defer`, so the DOM is ready. The saved theme is applied by an
// inline script in <head> to avoid a flash of the wrong theme.

// Hash routing between pages
const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = document.querySelectorAll("nav a");
function route() {
  const hash = location.hash.slice(1);
  const page = pages.some(s => s.dataset.page === hash) ? hash : "home";
  pages.forEach(s => s.hidden = s.dataset.page !== page);
  navLinks.forEach(a => {
    if (a.getAttribute("href") === "#" + page) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}
addEventListener("hashchange", route);
route();

// Expandable pipeline stages (CSS shows the detail when aria-expanded="true")
document.querySelectorAll(".stage button").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.setAttribute("aria-expanded", btn.getAttribute("aria-expanded") !== "true");
  });
});

// Chili crisp branches: what each variation changes from the original
const branches = {
  "main": ["The original", "The Serious Eats recipe, with minor adjustments, only because I didn't have some ingredients...", []],
  "nut-free": ["Nut-free", "So friends with peanut allergies can have some too.", [["del", "peanuts"]]],
  "extra-spicy": ["Extra spicy", "Turned up for the spice lovers.", [["add", "more heat"]]],
  "mild-mala": ["Mild and more mala", "Less burn, more of the numbing tingle.", [["del", "heat"], ["add", "mala"]]],
};
const branchTitle = document.getElementById("branch-title");
const branchNote = document.getElementById("branch-note");
const branchDiff = document.getElementById("branch-diff");
function showBranch() {
  const [title, note, diff] = branches[document.querySelector("input[name=branch]:checked").value];
  branchTitle.textContent = title;
  branchNote.textContent = note;
  branchDiff.replaceChildren(...diff.map(([kind, text]) => {
    const li = document.createElement("li");
    li.className = kind;
    li.textContent = (kind === "add" ? "+ " : "- ") + text;
    return li;
  }));
  branchDiff.hidden = diff.length === 0;
}
document.querySelector("input[name=branch]").closest("fieldset").addEventListener("change", showBranch);
showBranch();

// Runtime analyzer demo. Synthetic data only, generated from a fixed seed so
// every visitor (and every test run) sees the same numbers.
{
  const DAYS = 30;
  let seed = 7;
  const rand = () => { // mulberry32
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const round = v => Math.round(v * 10) / 10;
  const base = { checkout: 8.2, search: 6.1, accounts: 5.4, payments: 11, notifications: 3.8 };
  const series = {};
  for (const [name, minutes] of Object.entries(base)) {
    series[name] = Array.from({ length: DAYS }, () => round(minutes * (0.97 + rand() * 0.06)));
  }
  series.payments = series.payments.map((v, i) => i >= 17 ? round(v * 1.38) : v); // the regression: day 18 onward
  series.search[8] = round(series.search[8] * 1.6); // red herring: a one-day spike on day 9

  const mean = a => a.reduce((sum, v) => sum + v, 0) / a.length;
  const median = a => [...a].sort((x, y) => x - y)[a.length >> 1];
  // The day where the mean of the next 5 days jumps most over the previous 5.
  // A one-day spike moves a 5-day mean only ~12%, so it stays under the 20% bar.
  function stepChange(s, w = 5, threshold = 1.2) {
    let best = null;
    for (let i = w; i <= s.length - w; i++) {
      const before = mean(s.slice(i - w, i)), after = mean(s.slice(i, i + w));
      if (after / before > threshold && (!best || after / before > best.after / best.before)) best = { day: i, before, after };
    }
    return best;
  }

  const svg = document.getElementById("chart");
  const title = document.getElementById("chart-title");
  const feedback = document.getElementById("guess-feedback");
  const reveal = document.getElementById("reveal");
  const NS = "http://www.w3.org/2000/svg";
  const W = 600, H = 240, L = 34, R = 6, T = 10, B = 26, COL = (W - L - R) / DAYS;
  const node = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.append(n);
    return n;
  };
  let suite = "checkout", found = false;

  function render(focusDay) {
    const s = series[suite];
    const step = [1, 2, 5, 10].find(st => Math.ceil(Math.max(...s) * 1.1 / st) <= 5);
    const yMax = Math.ceil(Math.max(...s) * 1.1 / step) * step;
    const x = i => L + (i + 0.5) * COL, y = v => T + (1 - v / yMax) * (H - T - B);
    title.textContent = `${suite}: median runtime per day (minutes)`;
    svg.replaceChildren();

    const axes = node("g", { class: "axes", "aria-hidden": "true" }, svg);
    for (let v = 0; v <= yMax; v += step) {
      node("line", { x1: L, x2: W - R, y1: y(v), y2: y(v) }, axes);
      node("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }, axes).textContent = v;
    }
    for (const d of [1, 5, 10, 15, 20, 25, 30]) {
      node("text", { x: x(d - 1), y: H - 6, "text-anchor": "middle" }, axes).textContent = `day ${d}`;
    }
    const change = found && suite === "payments" && stepChange(s);
    if (change) node("rect", { class: "regressed", x: x(change.day) - COL / 2, y: T, width: W - R - x(change.day) + COL / 2, height: H - T - B }, svg);
    node("polyline", { class: "line", points: s.map((v, i) => `${x(i)},${y(v)}`).join(" ") }, svg);

    s.forEach((v, i) => {
      const pt = node("g", { class: "pt", role: "button", tabindex: i === (focusDay ?? 0) ? 0 : -1, "aria-label": `Day ${i + 1}: ${v} minutes`, "data-day": i }, svg);
      node("rect", { class: "hit", x: x(i) - COL / 2, y: T, width: COL, height: H - T - B }, pt);
      node("circle", { cx: x(i), cy: y(v), r: 4 }, pt);
    });
    if (focusDay != null) svg.querySelector(`[data-day="${focusDay}"]`).focus();
  }

  function guess(i) {
    const s = series[suite], change = stepChange(s);
    if (change && Math.abs(i - change.day) <= 1) {
      const delta = change.after - change.before;
      feedback.textContent = `Found it: ${suite} stepped up on day ${change.day + 1}, +${delta.toFixed(1)} min (+${Math.round(delta / change.before * 100)}%), and stayed up.`;
      found = true;
      reveal.hidden = false;
      render(i);
    } else if (change) {
      feedback.textContent = "Not quite. Look for where the line steps up and stays up.";
    } else if (s[i] > 1.3 * median(s)) {
      feedback.textContent = `Day ${i + 1} is a one-off spike: it's back to normal the next day. A regression stays slow.`;
    } else {
      feedback.textContent = `${suite} looks healthy: its runtime is flat. Try another suite.`;
    }
  }

  svg.addEventListener("click", e => {
    const pt = e.target.closest(".pt");
    if (pt) guess(+pt.dataset.day);
  });
  // Points use a roving tabindex: one Tab stop, arrow keys move between days.
  svg.addEventListener("keydown", e => {
    const pt = e.target.closest(".pt");
    if (!pt) return;
    const i = +pt.dataset.day;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); guess(i); return; }
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: DAYS - 1 }[e.key];
    if (next == null || next < 0 || next >= DAYS) return;
    e.preventDefault();
    pt.tabIndex = -1;
    const target = svg.querySelector(`[data-day="${next}"]`);
    target.tabIndex = 0;
    target.focus();
  });
  document.querySelector("input[name=suite]").closest("fieldset").addEventListener("change", e => {
    suite = e.target.value;
    feedback.textContent = "";
    render();
  });
  render();
}

// Theme toggle (remembered per browser if storage is available)
const root = document.documentElement;
document.getElementById("theme-toggle").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});
