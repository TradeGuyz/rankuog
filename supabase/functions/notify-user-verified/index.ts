const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { userEmail, userName } = await req.json()
  if (!userEmail || !userName) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')!
  const firstName = userName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're verified — RankUoG</title>
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
                You're verified, ${firstName}. ✓
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Your student ID has been reviewed and your account is now verified. You'll see a verified badge next to your name on the leaderboard.
              </p>

              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                The badge signals to other students that your GPA entries have been validated — a mark of trust on the platform.
              </p>

              <a href="https://rankuog.com" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                View Leaderboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                With love,<br/>
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
      to: [userEmail],
      subject: "You're verified on RankUoG ✓",
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
