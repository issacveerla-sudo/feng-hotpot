"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/app/admin/page";
import { getMenuItems, saveMenuItem, deleteMenuItem } from "@/lib/content";
import { hasSupabase } from "@/lib/supabaseClient";

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState("");

  async function load() {
    setItems(await getMenuItems());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items]
  );

  function update(idx, patch) {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function save(idx) {
    const saved = await saveMenuItem(items[idx]);
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...saved } : it)));
    toast("Saved ✓");
  }

  async function remove(idx) {
    const it = items[idx];
    if (it.id && !String(it.id).startsWith("demo-") && !String(it.id).startsWith("new-")) {
      await deleteMenuItem(it.id);
    }
    setItems((list) => list.filter((_, i) => i !== idx));
    toast("Deleted");
  }

  function addItem(category) {
    const maxOrder = items.reduce((m, i) => Math.max(m, i.sort_order || 0), 0);
    setItems((list) => [
      ...list,
      { id: "new-" + Date.now(), category, name: "", description: "", price: "", heat: 0, tag: "", available: true, sort_order: maxOrder + 1 },
    ]);
  }

  function toast(m) { setFlash(m); setTimeout(() => setFlash(""), 2500); }

  return (
    <div>
      <Header title="Menu editor" subtitle="Edit dishes, prices and availability — changes show on the website." />

      {!hasSupabase && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Demo mode — edits won't persist. Connect Supabase to save menu changes.
        </div>
      )}
      {flash && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">{flash}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-cream/40">Loading menu…</div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="display text-xl text-flame">{cat}</h2>
                <button onClick={() => addItem(cat)} className="rounded-full border border-chili/40 px-3 py-1 text-xs font-semibold text-chili hover:bg-chili/10">
                  + Add item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((it, idx) => it.category === cat && (
                  <div key={it.id || idx} className="card p-4">
                    <div className="grid gap-3 md:grid-cols-[2fr_3fr_1fr_1fr]">
                      <input value={it.name} onChange={(e) => update(idx, { name: e.target.value })}
                        placeholder="Dish name" className="field" />
                      <input value={it.description || ""} onChange={(e) => update(idx, { description: e.target.value })}
                        placeholder="Description" className="field" />
                      <input value={it.price || ""} onChange={(e) => update(idx, { price: e.target.value })}
                        placeholder="$0" className="field" />
                      <input value={it.tag || ""} onChange={(e) => update(idx, { tag: e.target.value })}
                        placeholder="Tag (optional)" className="field" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-cream/60">
                        Heat
                        <select value={it.heat || 0} onChange={(e) => update(idx, { heat: Number(e.target.value) })}
                          className="field !py-1.5">
                          {[0, 1, 2, 3].map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-cream/60">
                        <input type="checkbox" checked={it.available !== false}
                          onChange={(e) => update(idx, { available: e.target.checked })} />
                        Available on site
                      </label>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => remove(idx)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream/50 hover:text-chili">Delete</button>
                        <button onClick={() => save(idx)} className="pill-red text-xs">Save</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <AddCategory onAdd={(c) => addItem(c)} existing={categories} />
        </div>
      )}

      <style jsx>{`
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(226, 59, 46, 0.2);
          background: rgba(0, 0, 0, 0.5);
          padding: 0.6rem 0.9rem;
          color: #f3e9d6;
          font-size: 0.875rem;
          outline: none;
        }
        .field:focus { border-color: #e23b2e; }
      `}</style>
    </div>
  );
}

function AddCategory({ onAdd }) {
  const [name, setName] = useState("");
  return (
    <div className="card p-4">
      <div className="text-xs font-bold uppercase tracking-widest text-flame">New category</div>
      <div className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Desserts"
          className="flex-1 rounded-xl border border-chili/20 bg-black/50 px-4 py-2.5 text-sm text-cream outline-none focus:border-chili"
        />
        <button
          onClick={() => { if (name.trim()) { onAdd(name.trim()); setName(""); } }}
          className="pill-red text-sm"
        >
          Add category + item
        </button>
      </div>
    </div>
  );
}
