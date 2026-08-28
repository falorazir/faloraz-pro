import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, amount, description } = req.body;

  const params = {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: amount,
    description: description || 'اشتراک ماهانه پریمیوم فال هوش مصنوعی',
    callback_url: `${process.env.BASE_URL}/api/payment/verify`,
    metadata: { user_id: userId }
  };

  try {
    const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params);
    if (response.data.data.code === 100) {
      const authority = response.data.data.authority;
      const paymentUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;
      res.status(200).json({ success: true, url: paymentUrl, authority });
    } else {
      res.status(400).json({ success: false, message: 'خطا در ایجاد درگاه پرداخت' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
  }
