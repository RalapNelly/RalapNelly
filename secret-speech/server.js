// 真心话收集系统 - 本地服务器版本
// 运行：node server.js
// 然后用 ngrok 暴露：ngrok http 3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 管理员凭证
const ADMIN_ID = '123456';
const ADMIN_PASSWORD = 'bantouyan';

// 读取数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return { speeches: [] };
}

// 保存数据
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  saveData({ speeches: [] });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 路由
  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      handleApi(req, res, query, body);
    });
    return;
  }

  // 静态文件服务
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);

  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

function handleApi(req, res, query, body) {
  const action = query.action;
  const jsonData = body ? JSON.parse(body) : {};

  if (req.method === 'POST' && action === 'submit') {
    const { employeeId, speech } = jsonData;
    
    if (!employeeId || !speech) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '工号和真心话不能为空' }));
      return;
    }

    const data = loadData();
    const timestamp = new Date().toISOString();
    const id = Date.now().toString();
    
    data.speeches.unshift({
      id,
      employeeId,
      speech,
      timestamp,
    });
    
    saveData(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: '提交成功！感谢你的真心话~' }));
    return;
  }

  if (req.method === 'POST' && action === 'login') {
    const { adminId, password } = jsonData;
    
    if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '登录成功' }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: '管理员 ID 或密码错误' }));
    }
    return;
  }

  if (req.method === 'GET' && action === 'speeches') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ speeches: data.speeches }));
    return;
  }

  if (req.method === 'POST' && action === 'delete') {
    const { id } = jsonData;
    const data = loadData();
    data.speeches = data.speeches.filter(s => s.id !== id);
    saveData(data);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: '未知操作' }));
}

server.listen(PORT, () => {
  console.log(`\n🎯 真心话收集系统已启动！`);
  console.log(`📍 本地访问：http://localhost:${PORT}`);
  console.log(`\n💡 使用 ngrok 暴露到公网:`);
  console.log(`   ngrok http ${PORT}`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
