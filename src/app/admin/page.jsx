"use client";

/*
 * Admin dashboard — the couple's command centre for the access-control system.
 * Tabs: Overview · Guests (search / add / edit / passes) · Import · Tables ·
 * Scanners · Broadcast. Google-auth gated by ADMIN_EMAILS (adminConfig).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Download,
  IdCard,
  Newspaper,
  PencilLine,
  Save,
  Send,
  SquarePen,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/adminConfig";
import { buildImportPlan } from "@/lib/access/import.js";
import { downloadInviteCard } from "@/lib/access/inviteCard.js";
import { downloadAccessCard } from "@/lib/access/accessCard.js";
import {
  onGuests,
  onParties,
  onTables,
  onScanners,
  commitImportPlan,
  deleteGuests,
  bulkUpdateGuests,
  updateGuest,
  setGuestCheckedIn,
  wipeGuestsAndParties,
  createTable,
  updateTable,
  deleteTable,
  addScanner,
  removeScanner,
} from "@/lib/access/store.js";

const TABS = [
  "Overview",
  "Guests",
  "Import",
  "Tables",
  "Scanners",
  "Broadcast",
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Overview");

  // Shared live data — one set of subscriptions for every tab.
  const [guests, setGuests] = useState(null);
  const [parties, setParties] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    [],
  );
  const authorized = !!user && isAdminEmail(user.email || "");

  useEffect(() => {
    if (!authorized) return undefined;
    const subs = [
      onGuests(
        (l) => {
          setGuests(l);
          setLoadError("");
        },
        (e) => setLoadError(e?.message || "Could not load guests."),
      ),
      onParties(
        (l) => setParties(l),
        () => {},
      ),
      onTables(
        (l) => setTables(l),
        () => {},
      ),
    ];
    return () => subs.forEach((u) => u && u());
  }, [authorized]);

  if (!ready)
    return (
      <Shell>
        <p className="text-sm text-bloom-sage-dark">Loading…</p>
      </Shell>
    );

  if (!authorized) {
    return (
      <Shell>
        <div className="max-w-sm mx-auto text-center space-y-5 pt-16">
          <h1 className="font-serif text-3xl text-bloom-charcoal">
            Wedding Admin
          </h1>
          <p className="text-sm text-bloom-sage-dark">
            {user
              ? `${user.email} is not an admin account.`
              : "Sign in with an approved admin Google account."}
          </p>
          <button
            onClick={() =>
              signInWithPopup(auth, new GoogleAuthProvider()).catch((e) =>
                console.error(e),
              )
            }
            className="px-6 py-3 bg-bloom-gold text-white rounded-full font-cinzel text-xs tracking-widest uppercase cursor-pointer"
          >
            Sign in with Google
          </button>
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="block mx-auto text-xs text-bloom-rose underline cursor-pointer"
            >
              Sign out
            </button>
          )}
        </div>
      </Shell>
    );
  }

  const shared = {
    guests: guests || [],
    parties,
    tables,
    loadError,
    adminEmail: user.email,
  };

  return (
    <Shell wide>
      <header className="flex items-center justify-between border-b border-bloom-gold/20 pb-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-bloom-charcoal">
            Wedding Admin
          </h1>
          <p className="text-xs text-bloom-sage-dark">
            Nimi &amp; Victor · The Three-Strand Cord
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-bloom-sage-dark">{user.email}</p>
          <button
            onClick={() => signOut(auth)}
            className="text-xs text-bloom-rose underline cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase whitespace-nowrap transition-colors cursor-pointer ${
              tab === t
                ? "bg-bloom-gold text-white"
                : "bg-bloom-ivory text-bloom-sage-dark border border-bloom-gold/20"
            }`}
          >
            {t}
          </button>
        ))}
        <a
          href="/scan"
          className="ml-auto px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase whitespace-nowrap bg-bloom-rose text-white"
        >
          Open Scanner →
        </a>
      </nav>

      {loadError && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-4">
          {loadError}
          <br />
          <span className="text-xs">
            Expected until the new <code>firestore.rules</code> are deployed.
          </span>
        </p>
      )}

      {tab === "Overview" && <OverviewTab {...shared} />}
      {tab === "Guests" && <GuestsTab {...shared} />}
      {tab === "Import" && <ImportTab />}
      {tab === "Tables" && <TablesTab {...shared} />}
      {tab === "Scanners" && <ScannersTab />}
      {tab === "Broadcast" && <BroadcastTab {...shared} />}
    </Shell>
  );
}

function Shell({ children, wide }) {
  return (
    <div className="min-h-screen bg-bloom-cream text-bloom-charcoal">
      <div className={`${wide ? "max-w-6xl" : "max-w-5xl"} mx-auto px-5 py-10`}>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-bloom-charcoal" }) {
  return (
    <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-4">
      <p className={`font-serif text-3xl ${tone}`}>{value}</p>
      <p className="text-xs uppercase tracking-widest text-bloom-sage-dark mt-1">
        {label}
      </p>
    </div>
  );
}

/* ── Overview ───────────────────────────────────────────────── */
function OverviewTab({ guests, parties, tables }) {
  const confirmed = guests.filter((g) => g.rsvpStatus === "CONFIRMED");
  const declined = guests.filter((g) => g.rsvpStatus === "DECLINED");
  const pending = guests.filter(
    (g) => !g.rsvpStatus || g.rsvpStatus === "PENDING",
  );
  const checkedIn = guests.filter((g) => g.checkedIn);
  const seated = guests.filter((g) => g.tableId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Parties" value={parties.length} />
        <Stat label="Guests invited" value={guests.length} />
        <Stat
          label="Confirmed"
          value={confirmed.length}
          tone="text-emerald-700"
        />
        <Stat label="Declined" value={declined.length} tone="text-bloom-rose" />
        <Stat label="Pending" value={pending.length} tone="text-amber-600" />
        <Stat
          label="Checked in"
          value={checkedIn.length}
          tone="text-bloom-gold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5">
          <h3 className="font-serif text-lg mb-2">Seating</h3>
          <p className="text-sm text-bloom-sage-dark">
            {seated.length} of {guests.length} guests assigned across{" "}
            {tables.length} table{tables.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5">
          <h3 className="font-serif text-lg mb-2">On the day</h3>
          <p className="text-sm text-bloom-sage-dark">
            Ushers sign in at <code className="text-bloom-rose">/scan</code>{" "}
            with a whitelisted Google account (Scanners tab). Every scan is
            duplicate-proof and keeps working offline.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Guests ─────────────────────────────────────────────────── */
const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "DECLINED"];
const GUESTS_PER_PAGE = 25;

function GuestsTab({ guests, parties, tables, adminEmail }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [sel, setSel] = useState(() => new Set());
  const [editingGuestId, setEditingGuestId] = useState("");
  const [contactDraft, setContactDraft] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [bulkStatus, setBulkStatus] = useState("unchanged");
  const [bulkTable, setBulkTable] = useState("unchanged");
  const [bulkCheckIn, setBulkCheckIn] = useState("unchanged");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);

  const partyName = (id) => parties.find((p) => p.id === id)?.partyName || "—";
  const tableName = (id) => tables.find((t) => t.id === id)?.tableName || null;
  const tableLoad = useMemo(() => {
    const load = {};
    guests.forEach((g) => {
      if (g.tableId && g.rsvpStatus !== "DECLINED")
        load[g.tableId] = (load[g.tableId] || 0) + 1;
    });
    return load;
  }, [guests]);

  const filtered = useMemo(() => {
    let list = guests;
    if (statusFilter !== "all")
      list = list.filter((g) => (g.rsvpStatus || "PENDING") === statusFilter);
    if (tableFilter === "__unassigned__") {
      list = list.filter((g) => !g.tableId);
    } else if (tableFilter !== "all") {
      list = list.filter((g) => g.tableId === tableFilter);
    }
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((g) =>
        `${g.fullName} ${g.inviteCode} ${g.phone} ${g.email} ${partyName(g.partyId)}`
          .toLowerCase()
          .includes(needle),
      );
    }
    return [...list].sort((a, b) =>
      a.partyId === b.partyId
        ? Number(b.isPrimary) - Number(a.isPrimary)
        : String(a.partyId).localeCompare(String(b.partyId)),
    );
  }, [guests, q, statusFilter, tableFilter, parties]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / GUESTS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * GUESTS_PER_PAGE;
  const pageGuests = filtered.slice(pageStart, pageStart + GUESTS_PER_PAGE);
  const allOnPageSelected =
    pageGuests.length > 0 && pageGuests.every((g) => sel.has(g.id));
  const selectedGuests = useMemo(
    () => guests.filter((g) => sel.has(g.id)),
    [guests, sel],
  );

  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, tableFilter]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const toggle = (id) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleSelectAllOnPage = () => {
    setSel((current) => {
      const next = new Set(current);
      if (allOnPageSelected) {
        pageGuests.forEach((g) => next.delete(g.id));
      } else {
        pageGuests.forEach((g) => next.add(g.id));
      }
      return next;
    });
  };

  const removeSelected = async () => {
    if (
      !sel.size ||
      !window.confirm(`Delete ${sel.size} guest(s)? This cannot be undone.`)
    )
      return;
    try {
      await deleteGuests([...sel]);
      setSel(new Set());
    } catch (e) {
      setErr(e?.message || "Delete failed.");
    }
  };

  const startGuestEdit = (guest) => {
    setEditingGuestId(guest.id);
    setContactDraft({
      fullName: guest.fullName || "",
      phone: guest.phone || "",
      email: guest.email || "",
    });
    setErr("");
  };

  const cancelGuestEdit = () => {
    setEditingGuestId("");
    setContactDraft({ fullName: "", phone: "", email: "" });
  };

  const saveGuestEdit = async (guest) => {
    const nextName = contactDraft.fullName.trim();
    const nextPhone = contactDraft.phone.trim();
    const nextEmail = contactDraft.email.trim();

    if (!nextName) {
      setErr("Guest name cannot be empty.");
      return;
    }

    if (nextEmail && !/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setErr("Enter a valid email address or leave it blank.");
      return;
    }

    const updates = {};
    const currentName = String(guest.fullName || "").trim();
    const currentPhone = String(guest.phone || "").trim();
    const currentEmail = String(guest.email || "").trim();

    if (nextName !== currentName) updates.fullName = nextName;
    if (nextPhone !== currentPhone) updates.phone = nextPhone || null;
    if (nextEmail !== currentEmail) updates.email = nextEmail || null;

    if (!Object.keys(updates).length) {
      cancelGuestEdit();
      return;
    }

    setBusy(`contact-${guest.id}`);
    setErr("");
    try {
      await updateGuest(guest.id, updates);
      cancelGuestEdit();
      setErr("✓ Guest details updated.");
    } catch (e) {
      setErr(e?.message || "Could not update guest details.");
    }
    setBusy("");
  };

  const applyBulkUpdate = async () => {
    if (!sel.size) return;
    const patch = {};
    if (bulkStatus !== "unchanged") patch.rsvpStatus = bulkStatus;
    if (bulkTable !== "unchanged")
      patch.tableId = bulkTable === "__clear__" ? null : bulkTable;
    if (bulkCheckIn !== "unchanged") patch.checkedIn = bulkCheckIn === "in";

    if (!Object.keys(patch).length) {
      setErr("Choose at least one bulk field to update.");
      return;
    }

    if (!window.confirm(`Apply updates to ${sel.size} selected guest(s)?`))
      return;

    setBusy("bulk");
    setErr("");
    try {
      const count = await bulkUpdateGuests([...sel], patch, adminEmail);
      setErr(`✓ Updated ${count} guest(s).`);
    } catch (e) {
      setErr(e?.message || "Bulk update failed.");
    }
    setBusy("");
  };

  const exportCsv = () => {
    const rows = [
      [
        "Full Name",
        "Invite Code",
        "Party",
        "Phone",
        "Email",
        "RSVP",
        "Table",
        "Checked In",
      ],
    ];
    guests.forEach((g) =>
      rows.push([
        g.fullName,
        g.inviteCode,
        partyName(g.partyId),
        g.phone || "",
        g.email || "",
        g.rsvpStatus || "PENDING",
        tableName(g.tableId) || "",
        g.checkedIn ? "yes" : "",
      ]),
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "guest-list.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const saveInvite = async (g) => {
    setBusy(g.id);
    try {
      await downloadInviteCard({
        fullName: g.fullName,
        inviteCode: g.inviteCode,
        tableName: tableName(g.tableId),
      });
    } catch (e) {
      setErr(e?.message || "Could not generate the pass.");
    }
    setBusy("");
  };

  const saveAccess = async (g) => {
    setBusy(`access-${g.id}`);
    try {
      await downloadAccessCard({
        fullName: g.fullName,
        inviteCode: g.inviteCode,
        tableName: tableName(g.tableId),
      });
    } catch (e) {
      setErr(e?.message || "Could not generate the access card.");
    }
    setBusy("");
  };

  const downloadSelectedCards = async (mode) => {
    if (!selectedGuests.length) return;
    const busyKey = mode === "invite" ? "bulk-invite" : "bulk-access";
    setBusy(busyKey);
    setErr("");
    try {
      for (const g of selectedGuests) {
        const payload = {
          fullName: g.fullName,
          inviteCode: g.inviteCode,
          tableName: tableName(g.tableId),
        };
        if (mode === "invite") {
          await downloadInviteCard(payload);
        } else {
          await downloadAccessCard(payload);
        }
      }
      setErr(
        `✓ Downloaded ${selectedGuests.length} ${mode === "invite" ? "invite card" : "access card"}${selectedGuests.length === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      setErr(
        e?.message ||
          `Could not generate selected ${mode === "invite" ? "invite cards" : "access cards"}.`,
      );
    }
    setBusy("");
  };

  const resend = async (g) => {
    setBusy(`send-${g.id}`);
    setErr("");
    try {
      const res = await fetch("/api/dispatch-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCodes: [g.inviteCode] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data?.error || "Dispatch failed.");
      else if (data.sent) {
        const channels = [
          data.emailed && "email",
          data.sms?.sent && "SMS",
          data.whatsapp?.some((w) => w.sent) && "WhatsApp",
        ].filter(Boolean);
        setErr(`✓ Passes sent via ${channels.join(" + ")}.`);
      } else {
        setErr(
          data?.sms?.error ||
            data?.error ||
            "No channel delivered — check Twilio senders and the guest’s contact details.",
        );
      }
    } catch (e) {
      setErr(e?.message || "Dispatch failed.");
    }
    setBusy("");
  };

  const bulkResend = async () => {
    if (!selectedGuests.length) return;
    setBusy("bulk-send");
    setErr("");
    try {
      const inviteCodes = [
        ...new Set(selectedGuests.map((g) => g.inviteCode).filter(Boolean)),
      ];
      const res = await fetch("/api/dispatch-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCodes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Bulk dispatch failed.");
      } else if (data.sentCount) {
        const channels = [
          data.emailed && "email",
          data.sms?.sent && "SMS",
          data.whatsapp?.some((w) => w.sent) && "WhatsApp",
        ].filter(Boolean);
        const partyLabel = data.sentCount === 1 ? "party" : "parties";
        setErr(
          `✓ Passes sent for ${data.sentCount} ${partyLabel}${channels.length ? ` via ${channels.join(" + ")}` : ""}.`,
        );
      } else {
        setErr(data?.error || "No channel delivered for the selected guests.");
      }
    } catch (e) {
      setErr(e?.message || "Bulk dispatch failed.");
    }
    setBusy("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, code, phone, party…"
          className="flex-1 min-w-[220px] bg-bloom-ivory border border-bloom-gold/20 rounded-full px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bloom-ivory border border-bloom-gold/20 rounded-full px-3 py-2 text-xs"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="bg-bloom-ivory border border-bloom-gold/20 rounded-full px-3 py-2 text-xs"
        >
          <option value="all">All tables</option>
          <option value="__unassigned__">Unassigned</option>
          {tables.map((t) => {
            const load = tableLoad[t.id] || 0;
            return (
              <option key={`filter-table-${t.id}`} value={t.id}>
                {t.tableName} ({load}/{t.capacity})
              </option>
            );
          })}
        </select>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase bg-bloom-gold text-white cursor-pointer"
        >
          {showAdd ? "Close" : "+ Add guest"}
        </button>
        <button
          onClick={exportCsv}
          disabled={!guests.length}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase border border-bloom-gold/30 text-bloom-sage-dark cursor-pointer disabled:opacity-40"
        >
          Export CSV
        </button>
        <button
          onClick={removeSelected}
          disabled={!sel.size}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase bg-bloom-rose text-white disabled:opacity-40 cursor-pointer"
        >
          Delete ({sel.size})
        </button>
        <button
          onClick={() => downloadSelectedCards("invite")}
          disabled={!sel.size || busy === "bulk-invite"}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase border border-bloom-gold/30 text-bloom-sage-dark disabled:opacity-40 cursor-pointer"
        >
          {busy === "bulk-invite" ? "Downloading…" : "Download invites"}
        </button>
        <button
          onClick={() => downloadSelectedCards("access")}
          disabled={!sel.size || busy === "bulk-access"}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase border border-bloom-gold/30 text-bloom-sage-dark disabled:opacity-40 cursor-pointer"
        >
          {busy === "bulk-access" ? "Downloading…" : "Download access cards"}
        </button>
        <button
          onClick={bulkResend}
          disabled={!sel.size || busy === "bulk-send"}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase bg-bloom-rose text-white disabled:opacity-40 cursor-pointer"
        >
          {busy === "bulk-send" ? "Sending…" : "Send passes"}
        </button>
        <button
          onClick={toggleSelectAllOnPage}
          disabled={!pageGuests.length}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase border border-bloom-gold/30 text-bloom-sage-dark disabled:opacity-40 cursor-pointer"
        >
          {allOnPageSelected
            ? "Unselect page"
            : `Select all (${pageGuests.length})`}
        </button>
        <button
          onClick={() => setSel(new Set())}
          disabled={!sel.size}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase border border-bloom-gold/30 text-bloom-sage-dark disabled:opacity-40 cursor-pointer"
        >
          Clear selection
        </button>
      </div>

      {showAdd && <AddPartyForm onDone={() => setShowAdd(false)} />}
      {err && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          {err}
        </p>
      )}

      {sel.size > 0 && (
        <div className="bg-bloom-ivory border border-bloom-gold/25 rounded-2xl p-4 flex flex-wrap items-end gap-3">
          <p className="text-xs text-bloom-sage-dark basis-full">
            Bulk update {sel.size} selected guest(s)
          </p>
          <Field label="RSVP">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm min-w-45"
            >
              <option value="unchanged">No change</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={`bulk-${s}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Table">
            <select
              value={bulkTable}
              onChange={(e) => setBulkTable(e.target.value)}
              className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm min-w-55"
            >
              <option value="unchanged">No change</option>
              <option value="__clear__">Clear table</option>
              {tables.map((t) => {
                const load = tableLoad[t.id] || 0;
                return (
                  <option key={`bulk-table-${t.id}`} value={t.id}>
                    {t.tableName} ({load}/{t.capacity})
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="Check-in">
            <select
              value={bulkCheckIn}
              onChange={(e) => setBulkCheckIn(e.target.value)}
              className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm min-w-45"
            >
              <option value="unchanged">No change</option>
              <option value="in">Mark checked in</option>
              <option value="out">Mark checked out</option>
            </select>
          </Field>
          <button
            onClick={applyBulkUpdate}
            disabled={busy === "bulk"}
            className="px-5 py-2.5 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase cursor-pointer disabled:opacity-60"
          >
            {busy === "bulk" ? "Applying…" : "Apply to selected"}
          </button>
        </div>
      )}

      {guests.length === 0 ? (
        <p className="text-sm text-bloom-sage-dark">
          No guests yet — add one above or use the Import tab.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-bloom-sage-dark">
            <p>
              Showing {pageStart + 1}-
              {Math.min(pageStart + pageGuests.length, filtered.length)} of{" "}
              {filtered.length} guest{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-full border border-bloom-gold/20 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 rounded-full border border-bloom-gold/20 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-auto border border-bloom-gold/10 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-bloom-cream/60 text-bloom-sage-dark">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Party</th>
                  <th className="text-left px-3 py-2">Code</th>
                  <th className="text-left px-3 py-2">Phone</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">RSVP</th>
                  <th className="text-left px-3 py-2">Table</th>
                  <th className="text-left px-3 py-2">In</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageGuests.map((g) => {
                  const isEditing = editingGuestId === g.id;
                  return (
                  <tr key={g.id} className="border-t border-bloom-gold/10">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={sel.has(g.id)}
                        onChange={() => toggle(g.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={contactDraft.fullName}
                            onChange={(e) =>
                              setContactDraft((d) => ({
                                ...d,
                                fullName: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveGuestEdit(g);
                              if (e.key === "Escape") cancelGuestEdit();
                            }}
                            className="w-full min-w-[180px] bg-white border border-bloom-gold/20 rounded px-2 py-1 text-sm"
                            autoFocus
                          />
                          <IconButton
                            title={
                              busy === `contact-${g.id}`
                                ? "Saving details…"
                                : "Save details"
                            }
                            ariaLabel={
                              busy === `contact-${g.id}`
                                ? "Saving details"
                                : "Save guest details"
                            }
                            onClick={() => saveGuestEdit(g)}
                            disabled={busy === `contact-${g.id}`}
                            className="border border-bloom-gold/25 text-bloom-gold hover:bg-bloom-gold/10"
                          >
                            <Save className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="Cancel editing"
                            ariaLabel="Cancel editing"
                            onClick={cancelGuestEdit}
                            className="border border-bloom-gold/15 text-bloom-sage-dark hover:bg-bloom-cream"
                          >
                            ×
                          </IconButton>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{g.fullName}</span>
                          {g.isPrimary && (
                            <span className="text-[11px] text-bloom-gold uppercase">
                              primary
                            </span>
                          )}
                          <SquarePen
                            className="h-3.5 w-3.5 text-bloom-gold cursor-pointer"
                            title="Edit guest details"
                            ariaLabel={`Edit details for ${g.fullName}`}
                            onClick={() => startGuestEdit(g)}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-bloom-sage-dark">
                      {partyName(g.partyId)}
                    </td>
                    <td className="px-3 py-2 font-mono">{g.inviteCode}</td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          value={contactDraft.phone}
                          onChange={(e) =>
                            setContactDraft((d) => ({
                              ...d,
                              phone: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveGuestEdit(g);
                            if (e.key === "Escape") cancelGuestEdit();
                          }}
                          className="w-full min-w-[160px] bg-white border border-bloom-gold/20 rounded px-2 py-1 text-sm"
                          placeholder="Phone"
                        />
                      ) : (
                        <span className="text-bloom-sage-dark">{g.phone || "—"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="email"
                          value={contactDraft.email}
                          onChange={(e) =>
                            setContactDraft((d) => ({
                              ...d,
                              email: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveGuestEdit(g);
                            if (e.key === "Escape") cancelGuestEdit();
                          }}
                          className="w-full min-w-[200px] bg-white border border-bloom-gold/20 rounded px-2 py-1 text-sm"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-bloom-sage-dark">{g.email || "—"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={g.rsvpStatus || "PENDING"}
                        onChange={(e) =>
                          updateGuest(g.id, {
                            rsvpStatus: e.target.value,
                          }).catch((x) => setErr(x?.message))
                        }
                        className="bg-transparent border border-bloom-gold/20 rounded px-1.5 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={g.tableId || ""}
                        onChange={(e) =>
                          updateGuest(g.id, {
                            tableId: e.target.value || null,
                          }).catch((x) => setErr(x?.message))
                        }
                        className="bg-transparent border border-bloom-gold/20 rounded px-1.5 py-1 max-w-[140px]"
                      >
                        <option value="">—</option>
                        {tables.map((t) => {
                          const load = tableLoad[t.id] || 0;
                          const full = load >= t.capacity && g.tableId !== t.id;
                          return (
                            <option key={t.id} value={t.id} disabled={full}>
                              {t.tableName} ({load}/{t.capacity})
                              {full ? " FULL" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() =>
                          setGuestCheckedIn(
                            g.id,
                            !g.checkedIn,
                            adminEmail,
                          ).catch((x) => setErr(x?.message))
                        }
                        className={`px-2 py-1 rounded-full text-xs cursor-pointer ${g.checkedIn ? "bg-emerald-100 text-emerald-700" : "bg-bloom-cream border border-bloom-gold/20 text-bloom-sage-dark"}`}
                        title={
                          g.checkedIn ? "Undo check-in" : "Mark checked in"
                        }
                      >
                        {g.checkedIn ? "✓ in" : "out"}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title={
                            busy === g.id
                              ? "Creating invite card…"
                              : "Save invite card"
                          }
                          ariaLabel={`Save invite card for ${g.fullName}`}
                          onClick={() => saveInvite(g)}
                          disabled={busy === g.id}
                          className="border border-bloom-gold/25 text-bloom-gold hover:bg-bloom-gold/10"
                        >
                          <Newspaper className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          title={
                            busy === `access-${g.id}`
                              ? "Creating access card…"
                              : "Save access card"
                          }
                          ariaLabel={`Save access card for ${g.fullName}`}
                          onClick={() => saveAccess(g)}
                          disabled={busy === `access-${g.id}`}
                          className="border border-bloom-gold/25 text-bloom-gold hover:bg-bloom-gold/10"
                        >
                          <IdCard className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          title={
                            busy === `send-${g.id}`
                              ? "Sending passes…"
                              : "Send passes"
                          }
                          ariaLabel={`Send passes for ${g.fullName}`}
                          onClick={() => resend(g)}
                          disabled={busy === `send-${g.id}`}
                          className="border border-bloom-rose/25 text-bloom-rose hover:bg-bloom-rose/10"
                        >
                          <Send className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* Manual "add one household" — same pipeline as the bulk import. */
const INPUT =
  "w-full bg-white border border-bloom-gold/25 rounded-lg px-3 py-2 text-sm";

function AddPartyForm({ onDone }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    seats: "1",
    plusOnes: "",
    partyName: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || busy) return;
    setBusy(true);
    setMsg("");
    try {
      const plan = buildImportPlan([
        {
          "Full Name": form.name,
          Phone: form.phone,
          Email: form.email,
          "Total Seats": form.seats,
          "Plus One Names": form.plusOnes,
          "Party Name": form.partyName,
          Notes: form.notes,
        },
      ]);
      if (!plan.parties.length)
        throw new Error(plan.warnings[0] || "Could not build that guest.");
      await commitImportPlan(plan);
      const codes = plan.parties[0].guests.map((g) => g.inviteCode).join(", ");
      setMsg(`✓ Added ${plan.stats.guests} guest(s) — codes: ${codes}`);
      setForm({
        name: "",
        phone: "",
        email: "",
        seats: "1",
        plusOnes: "",
        partyName: "",
        notes: "",
      });
      if (onDone) window.setTimeout(onDone, 1800);
    } catch (err) {
      const permission = /permission|insufficient/i.test(
        String(err?.message || err),
      );
      setMsg(
        `Failed: ${err?.message || err}${permission ? " — deploy the new firestore.rules first." : ""}`,
      );
    }
    setBusy(false);
  };

  return (
    <form
      onSubmit={submit}
      className="bg-bloom-ivory border border-bloom-gold/25 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <Field label="Full name *">
        <input
          required
          value={form.name}
          onChange={change("name")}
          placeholder="e.g. Grace Okoro"
          className={INPUT}
        />
      </Field>
      <Field label="Phone">
        <input
          value={form.phone}
          onChange={change("phone")}
          placeholder="e.g. 0803 123 4567"
          className={INPUT}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={change("email")}
          placeholder="e.g. grace@email.com"
          className={INPUT}
        />
      </Field>
      <Field label="Total seats (incl. them)">
        <input
          type="number"
          min="1"
          max="20"
          value={form.seats}
          onChange={change("seats")}
          className={INPUT}
        />
      </Field>
      <Field label="Plus-one names (comma separated)">
        <input
          value={form.plusOnes}
          onChange={change("plusOnes")}
          placeholder="known companions, if any"
          className={INPUT}
        />
      </Field>
      <Field label="Party name (optional)">
        <input
          value={form.partyName}
          onChange={change("partyName")}
          placeholder="e.g. The Okoro Family"
          className={INPUT}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Notes">
          <input
            value={form.notes}
            onChange={change("notes")}
            placeholder="dietary, access needs…"
            className={INPUT}
          />
        </Field>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={busy}
          className="w-full px-5 py-2.5 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase cursor-pointer disabled:opacity-60"
        >
          {busy ? "Adding…" : "Add to guest list"}
        </button>
      </div>
      {msg && (
        <p className="md:col-span-3 text-xs text-bloom-charcoal">{msg}</p>
      )}{" "}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-xs block">
      <span className="block text-bloom-sage-dark mb-1">{label}</span>
      {children}
    </label>
  );
}

function IconButton({
  title,
  ariaLabel,
  onClick,
  disabled,
  className = "",
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      <span className="sr-only">{ariaLabel}</span>
      {children}
    </button>
  );
}

/* ── Import (unchanged pipeline) ────────────────────────────── */
function ImportTab() {
  const [plan, setPlan] = useState(null);
  const [msg, setMsg] = useState("");
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [wipeFirst, setWipeFirst] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setPlan(null);
    setMsg("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
        defval: "",
      });
      const p = buildImportPlan(rows);
      setPlan(p);
      if (!p.parties.length)
        setMsg(
          "No valid rows found. Expected columns: Full Name, Phone, Email, Total Seats (see docs/GUEST_LIST_FORMAT.md).",
        );
    } catch (err) {
      setMsg(`Could not read that file: ${err?.message || err}`);
    }
    setParsing(false);
  };

  const commit = async () => {
    if (!plan) return;
    setCommitting(true);
    setMsg("");
    try {
      if (wipeFirst) await wipeGuestsAndParties();
      const stats = await commitImportPlan(plan);
      setMsg(`✓ Imported ${stats.parties} parties and ${stats.guests} guests.`);
      setPlan(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const permission = /permission|insufficient/i.test(
        String(err?.message || err),
      );
      setMsg(
        `Import failed: ${err?.message || err}${permission ? " — deploy the new firestore.rules first." : ""}`,
      );
    }
    setCommitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-6">
        <h2 className="font-serif text-lg mb-1">Bulk import guest list</h2>
        <p className="text-xs text-bloom-sage-dark mb-4">
          Upload a CSV or Excel file — template in{" "}
          <code>docs/guest-list-template.xlsx</code>. Each row becomes a party
          (household): one primary guest plus a seat for every companion.
          Nothing is written until you press
          <b> Commit</b>.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFile}
          className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-bloom-gold file:text-white file:text-xs file:uppercase file:tracking-widest file:cursor-pointer"
        />
        {parsing && (
          <p className="text-xs text-bloom-sage-dark mt-3">Reading…</p>
        )}
      </div>

      {plan && (
        <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-6">
            <Stat label="Parties" value={plan.stats.parties} />
            <Stat label="Guests" value={plan.stats.guests} />
            <Stat
              label="Warnings"
              value={plan.warnings.length}
              tone={
                plan.warnings.length ? "text-amber-600" : "text-bloom-charcoal"
              }
            />
          </div>

          {plan.warnings.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-bloom-rose font-medium">
                {plan.warnings.length} warning(s)
              </summary>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-bloom-sage-dark max-h-40 overflow-auto">
                {plan.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="overflow-auto max-h-72 border border-bloom-gold/10 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-bloom-cream/60 text-bloom-sage-dark sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Party</th>
                  <th className="text-left px-3 py-2">Seats</th>
                  <th className="text-left px-3 py-2">Members</th>
                  <th className="text-left px-3 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {plan.parties.slice(0, 200).map((p) => (
                  <tr
                    key={p.partyId}
                    className="border-t border-bloom-gold/10 align-top"
                  >
                    <td className="px-3 py-2">{p.party.partyName}</td>
                    <td className="px-3 py-2">{p.party.allowedSeats}</td>
                    <td className="px-3 py-2">
                      {p.guests
                        .map((g) => `${g.fullName} (${g.inviteCode})`)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {p.party.primaryContactPhone || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {plan.parties.length > 200 && (
              <p className="text-xs text-bloom-sage-dark px-3 py-2">
                Showing first 200 of {plan.parties.length} parties.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-bloom-sage-dark">
            <input
              type="checkbox"
              checked={wipeFirst}
              onChange={(e) => setWipeFirst(e.target.checked)}
            />
            Wipe all existing parties &amp; guests first (fresh re-import)
          </label>

          <button
            onClick={commit}
            disabled={committing}
            className="px-6 py-3 bg-bloom-rose text-white rounded-full font-cinzel text-xs tracking-widest uppercase disabled:opacity-60 cursor-pointer"
          >
            {committing
              ? "Committing…"
              : `Commit ${plan.stats.guests} guests to Firestore`}
          </button>
        </div>
      )}

      {msg && (
        <p className="text-sm text-bloom-charcoal bg-bloom-gold/10 border border-bloom-gold/20 rounded-xl px-4 py-3">
          {msg}
        </p>
      )}
    </div>
  );
}

/* ── Tables ─────────────────────────────────────────────────── */
function TablesTab({ guests, tables }) {
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [cap, setCap] = useState("8");
  const [editingTableId, setEditingTableId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCap, setEditCap] = useState("8");
  const [busy, setBusy] = useState("");

  const load = useMemo(() => {
    const m = {};
    guests.forEach((g) => {
      if (g.tableId && g.rsvpStatus !== "DECLINED")
        m[g.tableId] = (m[g.tableId] || 0) + 1;
    });
    return m;
  }, [guests]);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await createTable({ tableName: name.trim(), capacity: Number(cap) });
      setName("");
      setCap("8");
    } catch (e) {
      setErr(e?.message || "Could not add table.");
    }
  };

  const startEdit = (table) => {
    setEditingTableId(table.id);
    setEditName(table.tableName || "");
    setEditCap(String(table.capacity || 1));
    setErr("");
  };

  const cancelEdit = () => {
    setEditingTableId("");
    setEditName("");
    setEditCap("8");
  };

  const saveEdit = async (table) => {
    const nextName = editName.trim();
    const nextCap = Math.max(1, Number(editCap) || 1);
    if (!nextName) {
      setErr("Table name cannot be empty.");
      return;
    }

    const unchanged =
      nextName === String(table.tableName || "").trim() &&
      nextCap === Number(table.capacity || 1);
    if (unchanged) {
      cancelEdit();
      return;
    }

    setBusy(`table-${table.id}`);
    setErr("");
    try {
      await updateTable(table.id, { tableName: nextName, capacity: nextCap });
      cancelEdit();
    } catch (e) {
      setErr(e?.message || "Could not update table.");
    }
    setBusy("");
  };

  return (
    <div className="space-y-4">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5 flex items-end gap-3 flex-wrap">
        <Field label="Table name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Table 1 — Family"
            className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm min-w-[220px]"
          />
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            min="1"
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm w-24"
          />
        </Field>
        <button
          onClick={add}
          className="px-5 py-2 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase cursor-pointer"
        >
          Add
        </button>
        <p className="text-xs text-bloom-sage-dark basis-full">
          Assign guests to tables from the Guests tab — capacity fills are
          computed live.
        </p>
      </div>

      {err && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          {err}
        </p>
      )}
      {tables.length === 0 && !err && (
        <p className="text-sm text-bloom-sage-dark">No tables yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tables.map((t) => {
          const used = load[t.id] || 0;
          const over = used > t.capacity;
          const isEditing = editingTableId === t.id;
          return (
            <div
              key={t.id}
              className={`bg-bloom-ivory border rounded-xl p-4 ${over ? "border-bloom-rose" : "border-bloom-gold/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                {isEditing ? (
                  <div className="space-y-2 flex-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-bloom-gold/20 rounded px-2 py-1 text-sm bg-white"
                      placeholder="Table name"
                    />
                    <input
                      type="number"
                      min="1"
                      value={editCap}
                      onChange={(e) => setEditCap(e.target.value)}
                      className="w-24 border border-bloom-gold/20 rounded px-2 py-1 text-sm bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-serif text-sm">{t.tableName}</p>
                    <p
                      className={`text-xs ${over ? "text-bloom-rose font-semibold" : "text-bloom-sage-dark"}`}
                    >
                      {used} / {t.capacity} seated
                      {over ? " — over capacity!" : ""}
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(t)}
                      disabled={busy === `table-${t.id}`}
                      className="text-xs text-bloom-gold underline cursor-pointer disabled:opacity-50"
                    >
                      {busy === `table-${t.id}` ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-xs text-bloom-sage-dark underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="text-xs text-bloom-gold underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        deleteTable(t.id).catch((e) =>
                          setErr(e?.message || "Delete failed."),
                        )
                      }
                      className="text-xs text-bloom-rose underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scanners ───────────────────────────────────────────────── */
function ScannersTab() {
  const [scanners, setScanners] = useState(null);
  const [email, setEmail] = useState("");
  const [gate, setGate] = useState("Main Entrance");
  const [err, setErr] = useState("");

  useEffect(
    () =>
      onScanners(
        (l) => {
          setScanners(l);
          setErr("");
        },
        (e) => setErr(e?.message || "Could not load scanners."),
      ),
    [],
  );

  const add = async (e) => {
    e.preventDefault();
    try {
      await addScanner(email, gate);
      setEmail("");
    } catch (x) {
      setErr(x?.message || "Could not add scanner.");
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5">
        <h3 className="font-serif text-lg mb-1">Gate team</h3>
        <p className="text-xs text-bloom-sage-dark mb-4">
          Whitelist the personal Google accounts of your ushers. They open{" "}
          <code className="text-bloom-rose">/scan</code> on their phone, sign in
          with Google, and the camera scanner activates.
        </p>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <Field label="Usher's Google email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usher@gmail.com"
              className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm min-w-[240px]"
            />
          </Field>
          <Field label="Gate">
            <input
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm w-40"
            />
          </Field>
          <button
            type="submit"
            className="px-5 py-2 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase cursor-pointer"
          >
            Whitelist
          </button>
        </form>
      </div>

      {err && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          {err}
          <br />
          <span className="text-xs">
            Expected until the new rules are deployed.
          </span>
        </p>
      )}

      {scanners && scanners.length > 0 && (
        <div className="space-y-2">
          {scanners.map((s) => (
            <div
              key={s.id}
              className="bg-bloom-ivory border border-bloom-gold/20 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm">{s.id}</p>
                <p className="text-xs text-bloom-sage-dark">
                  {s.assignedGate || "Main Entrance"}
                </p>
              </div>
              <button
                onClick={() =>
                  removeScanner(s.id).catch((e) => setErr(e?.message))
                }
                className="text-xs text-bloom-rose underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {scanners && scanners.length === 0 && !err && (
        <p className="text-sm text-bloom-sage-dark">
          No ushers whitelisted yet.
        </p>
      )}
    </div>
  );
}

/* ── Broadcast ──────────────────────────────────────────────── */
function BroadcastTab({ guests }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("primaries");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const recipients = useMemo(() => {
    let list = guests.filter((g) => g.email);
    if (audience === "primaries") list = list.filter((g) => g.isPrimary);
    if (audience === "confirmed")
      list = list.filter((g) => g.rsvpStatus === "CONFIRMED");
    const seen = new Set();
    return list.filter((g) => (seen.has(g.email) ? false : seen.add(g.email)));
  }, [guests, audience]);

  const send = async (e) => {
    e.preventDefault();
    if (!recipients.length || busy) return;
    if (
      !window.confirm(
        `Send "${title}" to ${recipients.length} guest(s) by email?`,
      )
    )
      return;
    setBusy(true);
    setResult("");
    try {
      const res = await fetch("/api/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          guests: recipients.map((g) => ({ name: g.fullName, email: g.email })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      setResult(
        res.ok
          ? `✓ Sent to ${data.count ?? recipients.length} guest(s)${data.simulated ? " (simulated — no RESEND_API_KEY)" : ""}.`
          : data?.error || "Broadcast failed.",
      );
      if (res.ok) {
        setTitle("");
        setMessage("");
      }
    } catch (err) {
      setResult(err?.message || "Broadcast failed.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={send} className="space-y-4 max-w-2xl">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-serif text-lg">Broadcast an update</h3>
          <p className="text-xs text-bloom-sage-dark">
            Email every guest we have an address for. WhatsApp/SMS broadcast
            arrives with Twilio (Phase E).
          </p>
        </div>
        <Field label="Audience">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm"
          >
            <option value="primaries">
              Primary guests with email (
              {guests.filter((g) => g.isPrimary && g.email).length})
            </option>
            <option value="confirmed">Confirmed guests with email</option>
            <option value="all">Everyone with an email</option>
          </select>
        </Field>
        <Field label="Subject / title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. A small change to the schedule"
          />
        </Field>
        <Field label="Message">
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm"
            placeholder="Dear friends…"
          />
        </Field>
        <button
          type="submit"
          disabled={busy || !recipients.length}
          className="px-6 py-3 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase cursor-pointer disabled:opacity-50"
        >
          {busy ? "Sending…" : `Send to ${recipients.length} guest(s)`}
        </button>
        {result && <p className="text-sm text-bloom-charcoal">{result}</p>}
      </div>
    </form>
  );
}
