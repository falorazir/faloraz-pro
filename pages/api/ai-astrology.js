export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { question, zodiac } = req.body;
  const prompt = `من یک فال‌گیر و ستاره‌شناس هستم. کاربر با برج فلکی ${zodiac} این سوال را پرسیده: "${question}". به زبان فارسی، یک پاسخ دقیق، عاطفی و کاربردی بر اساس طالع‌بینی بده.`;

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
        temperature: 0.7
      })
    });
    const data = await response.json();
    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ answer: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.' });
  }
}
