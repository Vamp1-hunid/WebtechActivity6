import { recordService } from "./data.js";

const $ = id => document.getElementById(id);
const STATUSES = ["Pending", "In progress", "Completed"];
let all = [];
let editingId = null;

function say(text, type) {
  $("message").textContent = text;
  $("message").className = type;
}

function button(label, onClick, cls) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  if (cls) b.className = cls;
  b.addEventListener("click", onClick);
  return b;
}

function validate(r) {
  if (r.title.length < 3 || r.title.length > 80) return "Title must be 3 to 80 characters.";
  if (r.category.length < 2 || r.category.length > 40) return "Category must be 2 to 40 characters.";
  if (r.description.length < 5 || r.description.length > 300) return "Description must be 5 to 300 characters.";
  if (!STATUSES.includes(r.status)) return "Please choose a valid status.";
  return "";
}

function readForm() {
  return {
    title: $("title").value.trim(),
    category: $("category").value.trim(),
    description: $("description").value.trim(),
    status: $("status").value
  };
}

function resetForm() {
  $("record-form").reset();
  editingId = null;
  $("form-title").textContent = "Add request";
  $("cancel-btn").hidden = true;
}

function draw() {
  const q = $("search").value.trim().toLowerCase();
  const s = $("filter").value;
  const shown = all.filter(r =>
    r.title.toLowerCase().includes(q) && (s === "" || r.status === s));

  const list = $("list");
  list.replaceChildren();
  shown.forEach(r => {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = "#" + r.id + " " + r.title + " (" + r.category + ") - " + r.status;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      button("View", () => view(r.id)),
      button("Edit", () => edit(r.id)),
      button("Delete", () => del(r.id), "danger")
    );
    li.append(info, actions);
    list.append(li);
  });

  $("count").textContent = "Showing " + shown.length + " of " + all.length + " records";
  $("empty").textContent = shown.length === 0
    ? (all.length === 0 ? "No records yet. Add one using the form." : "No records match your search or filter.")
    : "";
}

async function refresh() {
  all = await recordService.list();
  draw();
}

async function view(id) {
  try {
    const r = await recordService.get(id);
    const box = $("details");
    box.replaceChildren();
    const h = document.createElement("h3");
    h.textContent = "Request #" + r.id;
    box.append(h);
    [["Title", r.title], ["Category", r.category],
     ["Description", r.description], ["Status", r.status]].forEach(([k, v]) => {
      const p = document.createElement("p");
      const b = document.createElement("b");
      b.textContent = k + ": ";
      p.append(b, document.createTextNode(v));
      box.append(p);
    });
    box.focus();
  } catch (e) {
    say(e.message, "error");
  }
}

async function edit(id) {
  try {
    const r = await recordService.get(id);
    editingId = r.id;
    $("title").value = r.title;
    $("category").value = r.category;
    $("description").value = r.description;
    $("status").value = r.status;
    $("form-title").textContent = "Edit request #" + r.id;
    $("cancel-btn").hidden = false;
    $("title").focus();
    say("Editing request #" + r.id + ".", "success");
  } catch (e) {
    say(e.message, "error");
  }
}

async function del(id) {
  if (!confirm("Delete this request? This cannot be undone.")) return;
  try {
    const res = await recordService.remove(id);
    if (editingId === id) resetForm();
    $("details").replaceChildren();
    say(res.message, "success");
    await refresh();
  } catch (e) {
    say(e.message, "error");
  }
}

$("record-form").addEventListener("submit", async ev => {
  ev.preventDefault();
  const rec = readForm();
  const problem = validate(rec);
  if (problem) { say(problem, "error"); return; }
  try {
    if (editingId === null) {
      await recordService.create(rec);
      say("Request added successfully.", "success");
    } else {
      await recordService.update(editingId, rec);
      say("Request updated successfully.", "success");
    }
    resetForm();
    await refresh();
  } catch (e) {
    say(e.message, "error");
  }
});

$("cancel-btn").addEventListener("click", () => {
  resetForm();
  say("Edit cancelled.", "success");
});
$("search").addEventListener("input", draw);
$("filter").addEventListener("change", draw);

refresh();