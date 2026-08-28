import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { Authority, Status } = req.query;
  if (Status !== 'OK') {
    return res.redirect('/?payment=failed');
  }

  try {
    const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: 500000,
      authority: Authority
    });

    if (response.data.data.code === 100) {
      return res.redirect('/?payment=success');
    } else {
      return res.redirect('/?payment=failed');
    }
  } catch (error) {
    res.redirect('/?payment=error');
  }
}
