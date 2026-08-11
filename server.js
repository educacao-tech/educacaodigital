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

const updateScriptJsBatch = (type, items) => {
    const scriptPath = path.join(__dirname, 'script.js');
    let content = fs.readFileSync(scriptPath, 'utf8');
    let updatedCount = 0;

    items.forEach(item => {
        const prefix = (type === 'atividades') ? 'a' : 'm';
        const targetId = `${prefix}-${item.ano}-${item.bimestre}`;
        const regex = new RegExp(`{\\s*id:\\s*["']${targetId}["'][^}]*}`);
        const replacement = `{ id: "${targetId}", ano: ${item.ano}, bimestre: ${item.bimestre}, url: "${item.url}", status: "${item.status || 'active'}" }`;

        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        fs.writeFileSync(scriptPath, content, 'utf8');
        return true;
    }
    return false;
};

const autoPublishToGit = (commitMsg = 'Atualizar links no script.js') => {
    return new Promise((resolve) => {
        const safeMsg = commitMsg.replace(/"/g, '\\"');
        const cmd = `git add script.js && git commit -m "${safeMsg}" && git push origin main`;

        exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                const combined = (stdout || '') + (stderr || '') + (error.message || '');
                if (combined.includes('nothing to commit') || combined.includes('Sem alteracoes') || combined.includes('clean')) {
                    console.log('ℹ️ Nenhuma alteração pendente para commit no Git.');
                    return resolve({ success: true, message: 'Nenhuma alteração pendente no Git.' });
                }
                console.error('❌ Erro ao publicar no Git:', combined);
                return resolve({ success: false, message: 'Aviso do Git Push: ' + (error.message || stderr) });
            }
            console.log('✅ Publicado no GitHub com sucesso:\n', stdout);
            return resolve({ success: true, message: 'Publicado no GitHub com sucesso!' });
        });
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
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { type, ano, bimestre, url, status } = data;

                if (!ano || !bimestre || !url) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Dados inválidos.' }));
                }

                const updated = updateScriptJs(type, ano, bimestre, url, status);
                if (updated) {
                    const label = type === 'atividades' ? 'Atividade Prática' : 'Planejamento';
                    const commitMsg = `Atualizar link: ${label} - ${ano}º Ano (${bimestre}º Bimestre)`;
                    const gitResult = await autoPublishToGit(commitMsg);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: true,
                        publishedToGit: gitResult.success,
                        message: gitResult.success 
                            ? 'Link gravado com sucesso em script.js e publicado no GitHub!' 
                            : `Link salvo em script.js local (${gitResult.message})`
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

    if (req.method === 'POST' && req.url === '/api/save-batch') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { type, items, label } = data;

                if (!type || !Array.isArray(items) || items.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Dados em lote inválidos.' }));
                }

                const updated = updateScriptJsBatch(type, items);
                if (updated) {
                    const commitMsg = `Atualizar links em lote: ${label || type}`;
                    const gitResult = await autoPublishToGit(commitMsg);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: true,
                        publishedToGit: gitResult.success,
                        message: gitResult.success 
                            ? 'Links em lote atualizados em script.js e publicados no GitHub!' 
                            : `Links salvos em script.js local (${gitResult.message})`
                    }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Nenhum item correspondente encontrado para atualização.' }));
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
