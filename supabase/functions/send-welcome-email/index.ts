const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { name, email } = await req.json()
  if (!name || !email) {
    return new Response(JSON.stringify({ error: 'Missing name or email' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')!
  const firstName = name.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to RankUoG</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
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
                Hey ${firstName}, welcome aboard. 👋
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                We're genuinely glad you're here.
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Before you dive in, we want to say something that we believe deeply — <strong style="color:#ffffff;">your GPA is not a measure of who you are.</strong> It doesn't capture your curiosity, your resilience, the late nights you pushed through, or the unique way your mind works. Numbers are a snapshot, never the full picture.
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                RankUoG exists to spark <strong style="color:#ffffff;">friendly competition</strong> — the kind that motivates you to grow, not the kind that makes you feel small. We want you to look at the leaderboard and feel inspired, not discouraged. Every rank is a starting point.
              </p>

              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Thank you for trusting this platform with your academic journey. That means a lot to us.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.06);margin-bottom:28px;"></div>

              <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.35);">
                By using RankUoG you agree to our Terms of Service. You can read them at any time here:
              </p>
              <a href="https://rankuog.com/terms" style="color:#d4af37;font-size:13px;text-decoration:none;font-weight:600;">
                rankuog.com/terms →
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
      from: 'RankUoG <noreply@rankuog.tradeguyz.com>',
      to: [email],
      subject: 'Welcome to RankUoG 🎓',
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
