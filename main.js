const BOT_ID = '7589573248099303467';

// 这里先写占位，等 Vercel 部署完成后再改成真实地址
const BACKEND_URL = 'https://你的-vercel-项目名.vercel.app';

function getOrCreateUserId() {
  let userId = localStorage.getItem('rope_ai_user_id');

  if (!userId) {
    if (window.crypto && window.crypto.randomUUID) {
      userId = window.crypto.randomUUID();
    } else {
      userId = 'rope_user_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    }

    localStorage.setItem('rope_ai_user_id', userId);
  }

  return userId;
}

async function getCozeToken() {
  const userId = getOrCreateUserId();

  const response = await fetch(
    `${BACKEND_URL}/api/coze-token?session_name=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error('获取 Coze token 失败');
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('后端没有返回 token');
  }

  return data.token;
}

async function initCozeChat() {
  try {
    const token = await getCozeToken();

    new CozeWebSDK.WebChatClient({
      config: {
        bot_id: BOT_ID
      },
      componentProps: {
        title: 'Rope AI 绳索智能助手'
      },
      auth: {
        type: 'token',
        token,
        onRefreshToken: async function () {
          return await getCozeToken();
        }
      }
    });

    console.log('Rope AI Chat SDK 初始化成功');
  } catch (error) {
    console.error('Rope AI Chat SDK 初始化失败：', error);
  }
}

window.addEventListener('load', initCozeChat);