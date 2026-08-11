const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const updateScriptJs = (type, ano, bimestre, url, status) => {
    const scriptPath = path.join(__dirname, 'script.js');
    let content = fs.readFileSync(scriptPath, 'utf8');

    const prefix = (type === 'atividades') ? 'a' : 'm';
    const targetId = `${prefix}-${ano}-${bimestre}`;

    // Regex para encontrar o objeto pelo id (suporta aspas simples ou duplas)
    const regex = new RegExp(`{\\s*id:\\s*["']${targetId}["'][^}]*}`);
    const replacement = `{ id: "${targetId}", ano: ${ano}, bimestre: ${bimestre}, url: "${url}", status: "${status}" }`;

    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(scriptPath, content, 'utf8');
        return true;
    }
    return false;
};

const autoPublishToGit = (type, ano, bimestre) => {
    const label = type === 'atividades' ? 'Atividade Prática' : 'Planejamento';
    const commitMsg = `Atualizar link no script.js: ${label} - ${ano}º Ano (${bimestre}º Bimestre)`;
    
    const cmd = `git add script.js && (git commit -m "${commitMsg}" || echo Sem alteracoes) && git push origin main`;
    
    exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('Erro no auto push:', error.message);
        } else {
            console.log('Publicado no GitHub com sucesso:\n', stdout);
        }
    });
};

const server = http.createServer((req, res) => {
    // Permite CORS para que requisições vindas do Live Server (ex: porta 5500) funcionem
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/api/save-link') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { type, ano, bimestre, url, status } = data;

                if (!ano || !bimestre || !url) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Dados inválidos.' }));
                }

                const updated = updateScriptJs(type, ano, bimestre, url, status);
                if (updated) {
                    // Dispara a publicação no Git em segundo plano
                    autoPublishToGit(type, ano, bimestre);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: true,
                        message: 'Link gravado com sucesso no arquivo físico script.js e enviado para o GitHub!'
                    }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'ID do item não encontrado no script.js.' }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // Servidor de arquivos estáticos
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Servidor Educação Digital rodando em: http://localhost:${PORT}`);
    console.log(`✨ Links salvos no painel admin serão gravados automaticamente em script.js e enviados para o GitHub!\n`);
});
