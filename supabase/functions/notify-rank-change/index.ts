import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserRow {
  id: string
  email: string
  display_name: string
  overall_gpa: number
  notify_rank_change: boolean
  last_notified_rank: number | null
  current_rank?: number
}

function buildOutrankedHtml(firstName: string, lastRank: number, currentRank: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been outranked</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#ffffff;">Rank</span><span style="color:#d4af37;">UoG</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">
                Hey ${firstName}, someone's on the move.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Someone has taken your <strong style="color:#ffffff;">#${lastRank}</strong> spot on the leaderboard. You're now ranked <strong style="color:#ffffff;">#${currentRank}</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Update your GPA to climb back up.
              </p>
              <a href="https://rankuog.com" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;margin-bottom:32px;">
                View Rankings
              </a>
              <div style="border-top:1px solid rgba(255,255,255,0.06);margin-bottom:28px;"></div>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);">
                You're receiving this because rank change notifications are enabled. You can turn them off in your profile settings.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                The RankUoG Team<br/>University of Guyana GPA Leaderboard
              </p>
              <a href="https://rankuog.com/terms" style="color:#d4af37;font-size:12px;text-decoration:none;font-weight:600;">
                Terms of Service →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildMovedUpHtml(firstName: string, currentRank: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've moved up</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#ffffff;">Rank</span><span style="color:#d4af37;">UoG</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">
                Hey ${firstName}, you're climbing.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Good news - you've moved up to <strong style="color:#d4af37;">#${currentRank}</strong> on the leaderboard.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Keep it up.
              </p>
              <a href="https://rankuog.com" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;margin-bottom:32px;">
                View Rankings
              </a>
              <div style="border-top:1px solid rgba(255,255,255,0.06);margin-bottom:28px;"></div>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);">
                You're receiving this because rank change notifications are enabled. You can turn them off in your profile settings.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                The RankUoG Team<br/>University of Guyana GPA Leaderboard
              </p>
              <a href="https://rankuog.com/terms" style="color:#d4af37;font-size:12px;text-decoration:none;font-weight:600;">
                Terms of Service →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RankUoG <noreply@rankuog.com>',
      to: [to],
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`Failed to send email to ${to}:`, err)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const apiKey = Deno.env.get('RESEND_API_KEY')!

  // Fetch all eligible users
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, overall_gpa, notify_rank_change, last_notified_rank')
    .eq('email_verified', true)
    .not('overall_gpa', 'is', null)
    .order('overall_gpa', { ascending: false })

  if (error) {
    console.error('Failed to fetch users:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  const rows = (data ?? []) as UserRow[]

  // Compute current rank with tie support (mirrors SQL RANK())
  rows.forEach((row, i) => {
    if (i > 0 && row.overall_gpa === rows[i - 1].overall_gpa) {
      row.current_rank = rows[i - 1].current_rank
    } else {
      row.current_rank = i + 1
    }
  })

  const emailPromises: Promise<void>[] = []
  const updates: { id: string; last_notified_rank: number }[] = []

  for (const row of rows) {
    const currentRank = row.current_rank!
    updates.push({ id: row.id, last_notified_rank: currentRank })

    // First run — no email, just record the rank
    if (row.last_notified_rank === null) continue
    // Rank unchanged — nothing to do
    if (currentRank === row.last_notified_rank) continue
    // Notifications disabled — skip
    if (!row.notify_rank_change) continue

    const firstName = row.display_name.trim().split(' ')[0]

    if (currentRank > row.last_notified_rank) {
      // Dropped in rank
      emailPromises.push(sendEmail(
        apiKey,
        row.email,
        `You've dropped to #${currentRank} on RankUoG`,
        buildOutrankedHtml(firstName, row.last_notified_rank, currentRank)
      ))
    } else {
      // Moved up
      emailPromises.push(sendEmail(
        apiKey,
        row.email,
        `You've moved up to #${currentRank} on RankUoG`,
        buildMovedUpHtml(firstName, currentRank)
      ))
    }
  }

  // Send all emails and update ranks in parallel
  await Promise.all([
    ...emailPromises,
    ...updates.map(u =>
      supabase.from('users').update({ last_notified_rank: u.last_notified_rank }).eq('id', u.id)
    ),
  ])

  return new Response(
    JSON.stringify({ processed: rows.length, emails_sent: emailPromises.length }),
    { status: 200, headers: corsHeaders }
  )
})
