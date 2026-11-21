const KEY = "itSupportDeskRecords";

const mk = (id, title, category, description, status) =>
  ({ id, title, category, description, status });

const SEED = [
  mk(1, "Wi-Fi drops in Lab 3", "Network", "Wi-Fi disconnects every few minutes in Computer Lab 3.", "Pending"),
  mk(2, "Install Python on lab PCs", "Software", "Python 3 is needed on all PCs in Lab 2 for the programming class.", "In progress"),
  mk(3, "Projector not displaying", "Hardware", "The projector in Room A4 shows no image from the laptop.", "Pending"),
  mk(4, "Forgotten student portal password", "Account", "Student cannot log in and needs a password reset.", "Completed"),
  mk(5, "Printer jam in library", "Hardware", "The main library printer keeps jamming on double-sided jobs.", "In progress"),
  mk(6, "Antivirus update failing", "Software", "Antivirus on the admin office PC fails to update.", "Pending"),
  mk(7, "No internet in hostel block B", "Network", "Residents report no internet since Monday morning.", "In progress"),
  mk(8, "Keyboard keys not working", "Hardware", "Several keys on the keyboard at desk 5 do not respond.", "Completed")
];

function save(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) {            // first visit only
    save(SEED);
    return SEED.map(r => ({ ...r }));
  }
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;   // an empty array stays empty
  } catch (e) { /* fall through */ }
  save(SEED);
  return SEED.map(r => ({ ...r }));
}

function fields(rec) {
  return {
    title: rec.title,
    category: rec.category,
    description: rec.description,
    status: rec.status
  };
}

export const recordService = {
  async list() {
    return load();
  },

  async get(id) {
    const rec = load().find(r => r.id === Number(id));
    if (!rec) throw new Error("Record not found.");
    return rec;
  },

  async create(record) {
    const arr = load();
    const id = arr.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const created = { id, ...fields(record) };
    arr.push(created);
    save(arr);
    return created;
  },

  async update(id, record) {
    const arr = load();
    const i = arr.findIndex(r => r.id === Number(id));
    if (i === -1) throw new Error("Record not found.");
    arr[i] = { id: arr[i].id, ...fields(record) };   // original ID preserved
    save(arr);
    return arr[i];
  },

  async remove(id) {
    const arr = load();
    const i = arr.findIndex(r => r.id === Number(id));
    if (i === -1) throw new Error("Record not found.");
    arr.splice(i, 1);
    save(arr);
    return { message: "Record deleted successfully." };
  }
};