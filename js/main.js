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
document.querySelector(".branches").addEventListener("change", showBranch);
showBranch();

// Theme toggle (remembered per browser if storage is available)
const root = document.documentElement;
document.getElementById("theme-toggle").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});
