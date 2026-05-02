const axios = require('axios');

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
    console.log('Invalid or missing push token:', pushToken);
    return;
  }

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('Push notification sent to:', pushToken);
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
};

module.exports = { sendPushNotification };