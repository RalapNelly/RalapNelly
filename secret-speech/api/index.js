// 真心话收集系统 API - 使用 JSONBin.io 存储
// 需要设置环境变量：JSONBIN_API_KEY 和 JSONBIN_ID

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_ID = process.env.JSONBIN_ID || '';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

// 管理员凭证
const ADMIN_ID = '123456';
const ADMIN_PASSWORD = 'bantouyan';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // 获取数据
    async function getData() {
      if (!JSONBIN_API_KEY || !JSONBIN_ID) {
        return { speeches: [], _meta: '请配置 JSONBIN 环境变量' };
      }
      const response = await fetch(JSONBIN_URL, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data: ' + response.status);
      }
      const result = await response.json();
      return result.record || { speeches: [] };
    }

    // 保存数据
    async function saveData(data) {
      if (!JSONBIN_API_KEY || !JSONBIN_ID) {
        throw new Error('请配置 JSONBIN 环境变量');
      }
      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to save data: ' + response.status);
      }
      return true;
    }

    // 提交真心话
    if (req.method === 'POST' && action === 'submit') {
      const { employeeId, speech } = req.body;
      
      if (!employeeId || !speech) {
        return res.status(400).json({ error: '工号和真心话不能为空' });
      }

      const data = await getData();
      const timestamp = new Date().toISOString();
      const id = Date.now().toString();
      
      data.speeches = data.speeches || [];
      data.speeches.unshift({
        id,
        employeeId,
        speech,
        timestamp,
      });
      
      await saveData(data);

      return res.status(200).json({ success: true, message: '提交成功！感谢你的真心话~' });
    }

    // 管理员登录
    if (req.method === 'POST' && action === 'login') {
      const { adminId, password } = req.body;
      
      if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
        return res.status(200).json({ success: true, message: '登录成功' });
      } else {
        return res.status(401).json({ success: false, message: '管理员 ID 或密码错误' });
      }
    }

    // 获取所有真心话
    if (req.method === 'GET' && action === 'speeches') {
      const data = await getData();
      const speeches = data.speeches || [];
      return res.status(200).json({ speeches });
    }

    // 删除真心话
    if (req.method === 'POST' && action === 'delete') {
      const { id } = req.body;
      const data = await getData();
      data.speeches = (data.speeches || []).filter(s => s.id !== id);
      await saveData(data);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: '未知操作' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: '服务器错误：' + error.message });
  }
}
