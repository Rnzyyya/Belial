const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer((req,res) => {
  let decoded;
  try { decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  const target = path.resolve(root,'.' + (decoded === '/' ? '/index.html' : decoded));
  if(target!==root && !target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(target,(err,data) => { if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(8081,'0.0.0.0',()=>console.log('Local preview: http://localhost:8081'));
