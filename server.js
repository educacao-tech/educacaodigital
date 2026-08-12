const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'data', 'links.json');

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

const getLinksData = () => {
    try {
        if (fs.existsSync(DATA_FILE_PATH)) {
            const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('❌ Erro ao ler data/links.json:', err);
    }
    return { planejamentos: [], atividades: [] };
};

const saveLinksDataToFile = (data) => {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const updateLinksJson = (type, ano, bimestre, url, status) => {
    const data = getLinksData();
    const category = (type === 'atividades') ? 'atividades' : 'planejamentos';
    const prefix = (type === 'atividades') ? 'a' : 'm';
    const targetId = `${prefix}-${ano}-${bimestre}`;

    if (!Array.isArray(data[category])) {
        data[category] = [];
    }

    const index = data[category].findIndex(item => item.id === targetId || (item.ano == ano && item.bimestre == bimestre));
    const updatedItem = {
        id: targetId,
        ano: Number(ano),
        bimestre: Number(bimestre),
        url: url,
        status: status || 'active'
    };

    if (index >= 0) {
        data[category][index] = updatedItem;
    } else {
        data[category].push(updatedItem);
    }

    saveLinksDataToFile(data);
    return true;
};

const updateLinksJsonBatch = (type, items) => {
    const data = getLinksData();
    const category = (type === 'atividades') ? 'atividades' : 'planejamentos';
    const prefix = (type === 'atividades') ? 'a' : 'm';

    if (!Array.isArray(data[category])) {
        data[category] = [];
    }

    items.forEach(item => {
        const targetId = `${prefix}-${item.ano}-${item.bimestre}`;
        const index = data[category].findIndex(existing => existing.id === targetId || (existing.ano == item.ano && existing.bimestre == item.bimestre));
        const updatedItem = {
            id: targetId,
            ano: Number(item.ano),
            bimestre: Number(item.bimestre),
            url: item.url,
            status: item.status || 'active'
        };

        if (index >= 0) {
            data[category][index] = updatedItem;
        } else {
            data[category].push(updatedItem);
        }
    });

    saveLinksDataToFile(data);
    return true;
};

const autoPublishToGit = (commitMsg = 'Atualizar links em data/links.json') => {
    return new Promise((resolve) => {
        const safeMsg = commitMsg.replace(/"/g, '\\"');
        const cmd = `git add data/links.json && git commit -m "${safeMsg}" && git push origin main`;

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

    if (req.method === 'GET' && req.url === '/api/links') {
        const data = getLinksData();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(data));
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

                const updated = updateLinksJson(type, ano, bimestre, url, status);
                if (updated) {
                    const label = type === 'atividades' ? 'Atividade Prática' : 'Planejamento';
                    const commitMsg = `Atualizar link: ${label} - ${ano}º Ano (${bimestre}º Bimestre)`;
                    const gitResult = await autoPublishToGit(commitMsg);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: true,
                        publishedToGit: gitResult.success,
                        message: gitResult.success 
                            ? 'Link gravado com sucesso em data/links.json e publicado no GitHub!' 
                            : `Link salvo em data/links.json local (${gitResult.message})`
                    }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Erro ao atualizar data/links.json.' }));
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

                const updated = updateLinksJsonBatch(type, items);
                if (updated) {
                    const commitMsg = `Atualizar links em lote: ${label || type}`;
                    const gitResult = await autoPublishToGit(commitMsg);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: true,
                        publishedToGit: gitResult.success,
                        message: gitResult.success 
                            ? 'Links em lote atualizados em data/links.json e publicados no GitHub!' 
                            : `Links salvos em data/links.json local (${gitResult.message})`
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
    let reqUrl = req.url.split('?')[0];
    let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);
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
    console.log(`✨ Links salvos no painel admin serão gravados automaticamente em data/links.json e enviados para o GitHub!\n`);
});

