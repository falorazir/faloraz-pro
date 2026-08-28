export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { zodiac1, zodiac2 } = req.body;

  const prompt = `به عنوان یک ستاره‌شناس حرفه‌ای، یک تحلیل عشقی دقیق و عاطفی برای ارتباط بین برج ${zodiac1} و ${zodiac2} به زبان فارسی بنویس. شامل: درصد سازگاری (از ۰ تا ۱۰۰)، نقاط قوت این رابطه، چالش‌ها، و یک توصیه برای بهبود رابطه.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    });
    const data = await response.json();
    res.status(200).json({ match: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ match: 'خطا در تحلیل. لطفاً دوباره تلاش کنید.' });
  }
      }
