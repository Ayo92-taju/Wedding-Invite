/*
 * Party notification fan-out — the single place RSVP confirmations and
 * admin re-sends go through. Sends, in parallel channels:
 *   · EMAIL (Resend)   — pass cards embedded as images (+ attached as PNGs
 *                        when the origin is public https, so Resend can fetch)
 *   · WHATSAPP (Twilio) — one message per member, card image attached
 *   · SMS (Twilio)      — text with names, tables, and codes (SMS can't carry images)
 * Every channel degrades gracefully; failures never block the RSVP.
 */
import getResendClient from "@/utils/getResendClient";
import { partyConfirmationEmail } from "@/utils/emailTemplate";
import { sendSms, sendWhatsApp, passMessage } from "./twilio.js";
import { couple } from "@/data/content";

const WA_MEMBER_CAP = 8; // one media message per member; cap a runaway party

export async function notifyParty({
  origin,
  partyName,
  primaryName,
  email,
  phone,
  members,
  declined = false,
}) {
  const out = { emailed: false, sms: null, whatsapp: [] };
  const httpsOrigin = /^https:\/\//i.test(origin || "");
  const siteUrl = "https://themomohs.site";
  const passUrl = (m) =>
    `https://themomohs.site/api/pass-image?c=${encodeURIComponent(m.inviteCode)}`;

  // ── Email ──
  const to = String(email || "")
    .trim()
    .toLowerCase();
  if (to.includes("@")) {
    try {
      const resend = getResendClient();
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const { subject, html } = partyConfirmationEmail({
        primaryName: primaryName || members[0]?.fullName || "friend",
        declined,
        siteUrl,
        // Embed the full card image when it's publicly fetchable; the
        // template falls back to an inline QR otherwise (e.g. localhost).
        members: members.map((m) => ({
          ...m,
          passImageUrl: httpsOrigin ? passUrl(m) : undefined,
        })),
      });
      if (resend) {
        await resend.emails.send({
          from: `${couple.nameOne} & ${couple.nameTwo} <${fromEmail}>`,
          to: [to],
          subject,
          html,
          ...(httpsOrigin && !declined && members.length
            ? {
                attachments: members.map((m) => ({
                  path: passUrl(m),
                  filename: `${String(m.fullName).trim().replace(/\s+/g, "-")}-${m.inviteCode}.png`,
                })),
              }
            : {}),
        });
        out.emailed = true;
      } else {
        console.log(
          `[EMAIL SIMULATOR] Party confirmation → ${to} (${members.length} passes)`,
        );
      }
    } catch (err) {
      console.warn("Confirmation email failed (non-blocking):", err?.message);
    }
  }

  if (declined || !members.length) return out;

  // ── SMS (codes as text) ──
  if (phone) {
    try {
      out.sms = await sendSms(
        phone,
        passMessage({ partyName, members, siteUrl }),
      );
    } catch (err) {
      out.sms = { sent: false, error: err?.message };
    }
  }

  // ── WhatsApp (card image per member) ──
  if (phone) {
    for (const m of members.slice(0, WA_MEMBER_CAP)) {
      const caption = [
        `Entry pass — ${m.fullName}${m.tableName ? ` · Table ${m.tableName}` : ""} · ${m.inviteCode}`,
        `Nimi & Victor · Wed 12 Aug 2026 · #the3strandcord`,
        siteUrl ? `Wedding website: ${siteUrl}/#rsvp` : "",
      ]
        .filter(Boolean)
        .join("\n");
      try {
        out.whatsapp.push(
          await sendWhatsApp(phone, caption, httpsOrigin ? [passUrl(m)] : []),
        );
        console.log(out.whatsapp);
      } catch (err) {
        console.log(err);
        out.whatsapp.push({ sent: false, error: err?.message });
      }
    }
  }

  return out;
}
