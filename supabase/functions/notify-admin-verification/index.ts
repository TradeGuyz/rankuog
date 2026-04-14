import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { userName, studentId, pendingCount } = await req.json()
  if (!userName || !studentId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')!
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: admins } = await supabase
    .from('users')
    .select('email')
    .eq('is_admin', true)

  if (!admins || admins.length === 0) {
    return new Response(JSON.stringify({ error: 'No admin accounts found' }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  const adminEmails = admins.map((a: { email: string }) => a.email)

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Pending — RankUoG</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#ffffff;">Rank</span><span style="color:#d4af37;">UoG</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">
                New verification submission
              </p>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                A student has uploaded their ID for verification and is awaiting review.
              </p>

              <!-- Detail card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Student</p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#ffffff;">${userName}</p>
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Student ID</p>
                    <p style="margin:0;font-size:15px;font-family:monospace;color:rgba(255,255,255,0.7);">${studentId}</p>
                  </td>
                </tr>
              </table>

              ${pendingCount > 1 ? `
              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.45);">
                There ${pendingCount === 2 ? 'is' : 'are'} <strong style="color:#d4af37;">${pendingCount} submissions</strong> currently awaiting review.
              </p>
              ` : ''}

              <a href="https://rankuog.com/admin" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Review in Admin Panel →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                <strong style="color:rgba(255,255,255,0.4);">The RankUoG Team</strong><br/>
                University of Guyana GPA Leaderboard
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RankUoG <noreply@rankuog.com>',
      to: adminEmails,
      subject: `Verification pending — ${userName} (${studentId})`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  })
})
