const axios = require('axios');

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;

  try {
    const res = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: prompt + '. Trả lời ngắn gọn.' }] }]
    });
    return { statusCode: 200, body: JSON.stringify({ text: res.data.candidates[0].content.parts[0].text }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AI failed' }) };
  }
};
