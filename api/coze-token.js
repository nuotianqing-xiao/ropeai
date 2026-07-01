import { getJWTToken } from '@coze/api';

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const origin = req.headers.origin || '';

  if (
    allowedOrigin === '*' ||
    origin === allowedOrigin ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin || allowedOrigin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const privateKey = process.env.COZE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const botId = process.env.COZE_BOT_ID || '7589573248099303467';

    if (
      !process.env.COZE_APP_ID ||
      !process.env.COZE_KEY_ID ||
      !process.env.COZE_AUD ||
      !privateKey
    ) {
      return res.status(500).json({
        error: 'Missing Coze OAuth environment variables'
      });
    }

    const scope = {
      account_permission: {
        permission_list: ['Connector.botChat']
      },
      attribute_constraint: {
        connector_bot_chat_attribute: {
          bot_id_list: [botId]
        }
      }
    };

    const jwtToken = await getJWTToken({
      baseURL: process.env.COZE_API_BASE || 'https://api.coze.cn',
      appId: process.env.COZE_APP_ID,
      keyid: process.env.COZE_KEY_ID,
      aud: process.env.COZE_AUD,
      privateKey,
      scope
    });

    return res.status(200).json({
      token: jwtToken.access_token,
      expires_in: jwtToken.expires_in
    });
  } catch (error) {
    console.error('Coze token error full:', error);

    return res.status(500).json({
      error: 'Failed to get Coze token',
      name: error?.name,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      logid: error?.logid
    });
  }
