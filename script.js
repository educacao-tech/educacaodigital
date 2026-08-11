document.addEventListener('DOMContentLoaded', () => {
    
    // Controle do Menu Mobile
    const menuIcon = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuIcon && navLinks) {
        // Função auxiliar para fechar o menu (princípio DRY)
        const closeMenu = () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('is-active');
                menuIcon.setAttribute('aria-expanded', 'false');
                menuIcon.setAttribute('aria-label', 'Abrir menu');
            }
        };

        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuIcon.classList.toggle('is-active'); // Adiciona classe ao ícone para animação
            const isExpanded = navLinks.classList.contains('active');
            menuIcon.setAttribute('aria-expanded', isExpanded);
            menuIcon.setAttribute('aria-label', isExpanded ? 'Fechar menu' : 'Abrir menu');
        });

        // Fechar o menu mobile ao clicar em um link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Lógica de navegação inteligente para Google Sites
                if (href.includes('#')) {
                    const id = href.split('#')[1];
                    const targetElement = document.getElementById(id);
                    
                    if (targetElement) {
                        // Se a seção existe nesta página, faz scroll suave e evita reload
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, null, `#${id}`);
                    }
                }
                
                closeMenu();
            });
        });

        // Fechar o menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = navLinks.contains(e.target);
            const isClickOnIcon = menuIcon.contains(e.target);
            if (!isClickInsideMenu && !isClickOnIcon && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        // Fechar menu com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
                menuIcon.focus();
            }
        });
    }

    // Controle do Acordeão (para abrir um por vez com animação)
    const accordions = document.querySelectorAll('.accordion-item');
    if (accordions.length > 0) {
        accordions.forEach(accordion => {
            const summary = accordion.querySelector('summary');
            const content = accordion.querySelector('.accordion-content');

            summary.addEventListener('click', (e) => {
                e.preventDefault();

                // Se já estiver animando, ignora o clique para evitar bugs
                if (accordion.classList.contains('is-animating')) return;

                // Fecha outros acordeões abertos (estilo sanfona)
                accordions.forEach(otherAccordion => {
                    if (otherAccordion !== accordion && otherAccordion.open) {
                        const otherContent = otherAccordion.querySelector('.accordion-content');
                        otherAccordion.classList.add('is-animating');
                        
                        otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
                        // Força um reflow para o navegador registrar a altura antes de animar para 0
                        otherContent.offsetHeight; 
                        otherAccordion.classList.remove('is-open');
                        otherContent.style.maxHeight = '0px';

                        otherContent.addEventListener('transitionend', () => {
                            otherAccordion.removeAttribute('open');
                            otherAccordion.classList.remove('is-animating');
                        }, { once: true });
                    }
                });

                // Alterna o acordeão clicado
                if (accordion.open) {
                    accordion.classList.remove('is-open');
                    accordion.classList.add('is-animating');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.offsetHeight;
                    requestAnimationFrame(() => content.style.maxHeight = '0px');

                    content.addEventListener('transitionend', () => {
                        accordion.removeAttribute('open');
                        accordion.classList.remove('is-animating');
                    }, { once: true });
                } else {
                    accordion.classList.add('is-animating');
                    accordion.setAttribute('open', '');
                    accordion.classList.add('is-open');
                    
                    requestAnimationFrame(() => {
                        content.style.maxHeight = (content.scrollHeight + 60) + 'px';
                    });

                    content.addEventListener('transitionend', () => {
                        accordion.classList.remove('is-animating');
                        content.style.maxHeight = 'none'; // Libera a altura para evitar corte de conteúdo ao dobrar linha
                    }, { once: true });
                }
            });
        });
    }

    // Ativa/Desativa botões de bimestre e gerencia ícones automaticamente
    const bimestreButtons = document.querySelectorAll('.btn-bimestre');
    bimestreButtons.forEach(button => {
        const link = button.getAttribute('href');
        const isInactive = !link || link.trim() === '#';

        if (isInactive) {
            button.classList.add('disabled');
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
            button.querySelector('svg')?.remove();
        } else {
            button.setAttribute('target', '_blank');
            button.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // Segurança: Configura automaticamente links externos
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        // Se o link for externo (host diferente do atual)
        if (link.hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            if (!link.hasAttribute('rel')) link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // Atualização dinâmica do ano no rodapé
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Previne pulo de página apenas se o link for efetivamente desabilitado ou apontar para "#"
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === '#' || link.classList.contains('disabled')) {
                e.preventDefault();
            }
        }
    });

    // Controle do Botão "Voltar ao Topo"
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        let isScrolling = false;

        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    // Toggle classe baseado na posição (mais performático)
                    backToTopButton.classList.toggle('visible', window.scrollY > 300);
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });

        // Ação de clique para voltar ao topo
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Animação de entrada para cards e títulos
    const animatedElements = document.querySelectorAll('.card, .section-title');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Anima apenas uma vez
                }
            });
        }, {
            threshold: 0.1 // Inicia a animação quando 10% do card está visível
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // ScrollSpy: Destacar menu ativo
    const sections = document.querySelectorAll('section[id]');
    const navLinksItems = document.querySelectorAll('.nav-links a:not(.btn-cta)');

    // O ScrollSpy só deve ser ativado se as seções existirem na página atual.
    // Isso evita erros em subpáginas do Google Sites onde o menu é fixo mas o conteúdo varia.
    const isMainPage = sections.length > 0;

    // Cache de links para performance
    const navLinksMap = {};
    navLinksItems.forEach(link => {
        const href = link.getAttribute('href').split('#')[1];
        if (href) navLinksMap[href] = link;
    });

    if (isMainPage && navLinksItems.length > 0) {
        const observerOptions = {
            root: null, // Observa em relação ao viewport
            rootMargin: '-150px 0px -50% 0px', // [top, right, bottom, left] - Offset para o header e para ativar na metade superior da tela
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove a classe 'active' de todos os links
                    navLinksItems.forEach(link => {
                        link.classList.remove('active');
                    });

                    // Adiciona a classe 'active' usando o cache
                    const activeLink = navLinksMap[id];
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Animações de Rolagem (Scroll Reveal para cards e títulos)
    const revealElements = document.querySelectorAll('.section-title, .card, .accordion-item');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Anima uma única vez
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Controle do Tema (Dark/Light Mode)
    const themeToggleButton = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggleButton && htmlElement) {
        // Função para aplicar o tema
        const applyTheme = (theme, persist = false) => {
            htmlElement.setAttribute('data-theme', theme);
            if (theme === 'dark') {
                themeToggleButton.setAttribute('aria-label', 'Ativar modo claro');
                themeToggleButton.setAttribute('title', 'Alterar para modo claro');
            } else {
                themeToggleButton.setAttribute('aria-label', 'Ativar modo escuro');
                themeToggleButton.setAttribute('title', 'Alterar para modo escuro');
            }
            
            // Apenas salva no localStorage se for uma ação explícita do usuário
            if (persist) {
                localStorage.setItem('theme', theme);
            }
        };

        // Evento de clique no botão
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme, true); // true = persistir escolha
        });

        // Verifica preferência do sistema e tema salvo no localStorage
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            // Usa o tema salvo se existir
            applyTheme(savedTheme, false);
        } else if (prefersDark) {
            // Usa a preferência do sistema se não houver tema salvo
            applyTheme('dark', false);
        } else {
            applyTheme('light', false); // Padrão para light
        }

        // Monitora mudanças no tema do sistema em tempo real
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) { // Apenas se o usuário não definiu manualmente
                applyTheme(e.matches ? 'dark' : 'light', false);
            }
        });

        // Fecha o menu automaticamente se a tela for redimensionada (com debounce simples)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
    }

    // --- LÓGICA DA ÁREA ADMINISTRATIVA E GESTÃO DE LINKS ---
    const DEFAULT_MATERIALS = [
        // 1º Ano
        { id: "m-1-1", ano: 1, bimestre: 1, url: "https://docs.google.com/document/d/1Yap9AJU2w4FlBpXHMqNaRo4miaqiYMAX/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-1-2", ano: 1, bimestre: 2, url: "https://docs.google.com/document/d/1xrtDpPec3h6yzkN8uqB-TX6gZMGlA6Xo/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-1-3", ano: 1, bimestre: 3, url: "#", status: "soon" },
        { id: "m-1-4", ano: 1, bimestre: 4, url: "#", status: "soon" },
        // 2º Ano
        { id: "m-2-1", ano: 2, bimestre: 1, url: "https://docs.google.com/document/d/1kMJxrP_-snqlOaO3NiIUPd0WyFiGIv23/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-2-2", ano: 2, bimestre: 2, url: "https://docs.google.com/document/d/1a8Kyf0DlwlfVISwTOat0YMhsqdd5dNNb/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-2-3", ano: 2, bimestre: 3, url: "https://docs.google.com/document/d/1RkSNVmdUl2pUe1R3dnuf8hMTGtv6M4tG/edit?usp=drive_link&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-2-4", ano: 2, bimestre: 4, url: "#", status: "soon" },
        // 3º Ano
        { id: "m-3-1", ano: 3, bimestre: 1, url: "https://docs.google.com/document/d/15mv2PLWIofSjykP1Htj5tALmpmhcOfIr/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-3-2", ano: 3, bimestre: 2, url: "https://docs.google.com/document/d/1w4AdxPuXF0QpY_iKUUCXLCt9DG7YeriX/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-3-3", ano: 3, bimestre: 3, url: "https://docs.google.com/document/d/1WbxnVyeVB_cbCR3-KeZOY4fbsNrEpaJE/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-3-4", ano: 3, bimestre: 4, url: "#", status: "soon" },
        // 4º Ano
        { id: "m-4-1", ano: 4, bimestre: 1, url: "https://docs.google.com/document/d/1Gb1KxdgwZmd1afpzB70JcXEpoXv5Bx0o/edit?usp=drive_link&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-4-2", ano: 4, bimestre: 2, url: "https://docs.google.com/document/d/1rBlNC-1iRzlSdaqTOtt0GmbqDF15ADy9/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-4-3", ano: 4, bimestre: 3, url: "https://docs.google.com/document/d/1eoSuejeAicffwc4iZueqw2rGMI-RBnFi/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-4-4", ano: 4, bimestre: 4, url: "#", status: "soon" },
        // 5º Ano
        { id: "m-5-1", ano: 5, bimestre: 1, url: "https://docs.google.com/document/d/1nTNyjvjkbR6pbNYuNhHkC8eOeBxWJ1lD/edit?usp=drive_link&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-5-2", ano: 5, bimestre: 2, url: "https://docs.google.com/document/d/1BMmrFi28vyWUC65kh-j58yoiVsb8KHDi/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true", status: "active" },
        { id: "m-5-3", ano: 5, bimestre: 3, url: "#", status: "soon" },
        { id: "m-5-4", ano: 5, bimestre: 4, url: "#", status: "soon" },
        // 1º ao 5º Ano (Geral)
        { id: "m-6-1", ano: 6, bimestre: 1, url: "#", status: "soon" },
        { id: "m-6-2", ano: 6, bimestre: 2, url: "#", status: "soon" },
        { id: "m-6-3", ano: 6, bimestre: 3, url: "#", status: "soon" },
        { id: "m-6-4", ano: 6, bimestre: 4, url: "#", status: "soon" }
    ];

    const DEFAULT_ACTIVITIES = [
        // 1º Ano
        { id: "a-1-1", ano: 1, bimestre: 1, url: "#", status: "soon" },
        { id: "a-1-2", ano: 1, bimestre: 2, url: "#", status: "soon" },
        { id: "a-1-3", ano: 1, bimestre: 3, url: "#", status: "soon" },
        { id: "a-1-4", ano: 1, bimestre: 4, url: "#", status: "soon" },
        // 2º Ano
        { id: "a-2-1", ano: 2, bimestre: 1, url: "https://drive.google.com/drive/folders/13jyFSO2ewcOAF9jYGLYEx6xRvGRF7o9-?usp=sharing", status: "active" },
        { id: "a-2-2", ano: 2, bimestre: 2, url: "#", status: "soon" },
        { id: "a-2-3", ano: 2, bimestre: 3, url: "#", status: "soon" },
        { id: "a-2-4", ano: 2, bimestre: 4, url: "#", status: "soon" },
        // 3º Ano
        { id: "a-3-1", ano: 3, bimestre: 1, url: "#", status: "soon" },
        { id: "a-3-2", ano: 3, bimestre: 2, url: "https://drive.google.com/drive/folders/1pUjVDb9GyJIEaTaZ4IY-m807ApamEYsC?usp=sharing", status: "active" },
        { id: "a-3-3", ano: 3, bimestre: 3, url: "#", status: "soon" },
        { id: "a-3-4", ano: 3, bimestre: 4, url: "#", status: "soon" },
        // 4º Ano
        { id: "a-4-1", ano: 4, bimestre: 1, url: "https://drive.google.com/drive/folders/1E7nrhcV8AxaS92d0HS0wiNNvfwL8x1sn?usp=drive_link", status: "active" },
        { id: "a-4-2", ano: 4, bimestre: 2, url: "#", status: "soon" },
        { id: "a-4-3", ano: 4, bimestre: 3, url: "#", status: "soon" },
        { id: "a-4-4", ano: 4, bimestre: 4, url: "#", status: "soon" },
        // 5º Ano
        { id: "a-5-1", ano: 5, bimestre: 1, url: "https://drive.google.com/drive/folders/1srF9D3WW-WsWEH5WrDUspiAinBfjEE2_?usp=drive_link", status: "active" },
        { id: "a-5-2", ano: 5, bimestre: 2, url: "#", status: "soon" },
        { id: "a-5-3", ano: 5, bimestre: 3, url: "#", status: "soon" },
        { id: "a-5-4", ano: 5, bimestre: 4, url: "#", status: "soon" },
        // 1º ao 5º Ano (Geral)
        { id: "a-6-1", ano: 6, bimestre: 1, url: "#", status: "soon" },
        { id: "a-6-2", ano: 6, bimestre: 2, url: "#", status: "soon" },
        { id: "a-6-3", ano: 6, bimestre: 3, url: "https://drive.google.com/drive/folders/1HbSmBeQSGio4k3Jer942hrqQD9-uiU8x?usp=sharing", status: "active" },
        { id: "a-6-4", ano: 6, bimestre: 4, url: "#", status: "soon" }
    ];

    let currentAdminType = 'planejamentos'; // 'planejamentos' ou 'atividades'

    const getStoredMaterials = () => {
        const data = localStorage.getItem('edumidia_materials');
        if (!data) return DEFAULT_MATERIALS;
        try {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) return DEFAULT_MATERIALS;
            return DEFAULT_MATERIALS.map(def => {
                const found = parsed.find(item => item.ano === def.ano && item.bimestre === def.bimestre);
                return found ? found : def;
            });
        } catch(e) {
            return DEFAULT_MATERIALS;
        }
    };

    const saveStoredMaterials = (materials) => {
        localStorage.setItem('edumidia_materials', JSON.stringify(materials));
        renderDynamicMaterials();
    };

    const getStoredActivities = () => {
        const data = localStorage.getItem('edumidia_activities');
        if (!data) return DEFAULT_ACTIVITIES;
        try {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) return DEFAULT_ACTIVITIES;
            return DEFAULT_ACTIVITIES.map(def => {
                const found = parsed.find(item => item.ano === def.ano && item.bimestre === def.bimestre);
                return found ? found : def;
            });
        } catch(e) {
            return DEFAULT_ACTIVITIES;
        }
    };

    const saveStoredActivities = (activities) => {
        localStorage.setItem('edumidia_activities', JSON.stringify(activities));
        renderDynamicActivities();
    };

    const getActiveStore = () => {
        return currentAdminType === 'atividades' ? getStoredActivities() : getStoredMaterials();
    };

    const saveActiveStore = (items) => {
        if (currentAdminType === 'atividades') {
            saveStoredActivities(items);
        } else {
            saveStoredMaterials(items);
        }
    };

    // Comunicação com a API do servidor Node para gravação física no script.js e publicação automática no GitHub
    const saveSingleLinkToApi = async (payload) => {
        try {
            let res = await fetch('/api/save-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) return await res.json();
        } catch(e) {}

        try {
            let res = await fetch('http://localhost:3000/api/save-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) return await res.json();
        } catch(e) {}

        return { success: false, message: 'Servidor Node local (server.js) não está em execução no momento.' };
    };

    const saveBatchLinksToApi = async (payload) => {
        try {
            let res = await fetch('/api/save-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) return await res.json();
        } catch(e) {}

        try {
            let res = await fetch('http://localhost:3000/api/save-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) return await res.json();
        } catch(e) {}

        return { success: false, message: 'Servidor Node local (server.js) não está em execução no momento.' };
    };

    const renderDynamicMaterials = () => {
        const materials = getStoredMaterials();
        const container = document.querySelector('#planejamentos .accordion-container');
        if (!container) return;

        const accordionItems = container.querySelectorAll('.accordion-item');
        accordionItems.forEach((item, index) => {
            const attrAno = item.getAttribute('data-ano');
            const anoNum = attrAno ? parseInt(attrAno, 10) : (index + 1);
            const buttons = item.querySelectorAll('.btn-bimestre');

            buttons.forEach((btn, bIndex) => {
                const bimestreNum = bIndex + 1;
                const mat = materials.find(m => m.ano === anoNum && m.bimestre === bimestreNum);
                
                if (mat) {
                    if (mat.status === 'active' && mat.url && mat.url !== '#') {
                        btn.classList.remove('disabled');
                        btn.setAttribute('href', mat.url);
                        btn.setAttribute('target', '_blank');
                        btn.setAttribute('rel', 'noopener noreferrer');
                        btn.removeAttribute('tabindex');
                    } else {
                        btn.classList.add('disabled');
                        btn.setAttribute('href', '#');
                        btn.removeAttribute('target');
                        btn.removeAttribute('rel');
                    }
                }
            });
        });
    };

    const renderDynamicActivities = () => {
        const activities = getStoredActivities();
        const container = document.querySelector('#atividades .accordion-container');
        if (!container) return;

        const accordionItems = container.querySelectorAll('.accordion-item');
        accordionItems.forEach((item, index) => {
            const attrAno = item.getAttribute('data-ano');
            const anoNum = attrAno ? parseInt(attrAno, 10) : (index + 1);
            const buttons = item.querySelectorAll('.btn-bimestre');

            buttons.forEach((btn, bIndex) => {
                const bimestreNum = bIndex + 1;
                const act = activities.find(a => a.ano === anoNum && a.bimestre === bimestreNum);
                
                if (act) {
                    if (act.status === 'active' && act.url && act.url !== '#') {
                        btn.classList.remove('disabled');
                        btn.setAttribute('href', act.url);
                        btn.setAttribute('target', '_blank');
                        btn.setAttribute('rel', 'noopener noreferrer');
                        btn.removeAttribute('tabindex');
                    } else {
                        btn.classList.add('disabled');
                        btn.setAttribute('href', '#');
                        btn.removeAttribute('target');
                        btn.removeAttribute('rel');
                    }
                }
            });
        });
    };

    // Renderiza inicialmente na carga da página
    renderDynamicMaterials();
    renderDynamicActivities();

    // Modais e Login Admin
    const openLoginBtns = document.querySelectorAll('#open-admin-login-btn, #open-admin-login-btn-header, .admin-toggle, .btn-admin-access');
    const loginModal = document.getElementById('admin-login-modal');
    const loginCloseBtn = document.getElementById('admin-login-close');
    const loginCancelBtn = document.getElementById('admin-login-cancel-btn');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('admin-login-error');

    const dashboardModal = document.getElementById('admin-dashboard-modal');
    const dashboardCloseBtn = document.getElementById('admin-dashboard-close');

    // Senha de Acesso Admin (com suporte a alteração salva no localStorage)
    const getAdminPassword = () => localStorage.getItem('edumidia_admin_password') || "batatais2026";
    const setAdminPassword = (newPass) => localStorage.setItem('edumidia_admin_password', newPass);

    if (openLoginBtns.length > 0 && loginModal) {
        openLoginBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.classList.add('active');
                loginModal.setAttribute('aria-hidden', 'false');
                const passInput = document.getElementById('admin-password');
                if (passInput) passInput.value = '';
                if (loginError) loginError.style.display = 'none';
            });
        });

        const closeLoginModal = () => {
            loginModal.classList.remove('active');
            loginModal.setAttribute('aria-hidden', 'true');
        };

        if (loginCloseBtn) loginCloseBtn.addEventListener('click', closeLoginModal);
        if (loginCancelBtn) loginCancelBtn.addEventListener('click', closeLoginModal);

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const passInput = document.getElementById('admin-password');
                if (passInput && passInput.value === getAdminPassword()) {
                    closeLoginModal();
                    openDashboardModal();
                } else {
                    if (loginError) loginError.style.display = 'block';
                }
            });
        }
    }

    const openDashboardModal = () => {
        if (dashboardModal) {
            dashboardModal.classList.add('active');
            dashboardModal.setAttribute('aria-hidden', 'false');
            updateAdminProgress();
            renderCoverageMatrix();
            renderAdminTable();
            loadSelectedMaterialToForm();
        }
    };

    const closeDashboardModal = () => {
        if (dashboardModal) {
            dashboardModal.classList.remove('active');
            dashboardModal.setAttribute('aria-hidden', 'true');
        }
    };

    if (dashboardCloseBtn) {
        dashboardCloseBtn.addEventListener('click', closeDashboardModal);
    }

    // Formulário de Cadastro/Edição de Links no Dashboard
    const materialForm = document.getElementById('admin-material-form');
    const selectAno = document.getElementById('admin-select-ano');
    const selectBimestre = document.getElementById('admin-select-bimestre');
    const inputUrl = document.getElementById('admin-drive-url');
    const selectStatus = document.getElementById('admin-select-status');
    const clearBtn = document.getElementById('admin-form-clear-btn');
    const testLinkBtn = document.getElementById('admin-test-link-btn');
    const statusFeedback = document.getElementById('admin-form-status-feedback');

    // Botão Testar Link
    if (testLinkBtn && inputUrl) {
        testLinkBtn.addEventListener('click', () => {
            const url = inputUrl.value.trim();
            if (url && url !== '#') {
                window.open(url, '_blank');
            } else {
                alert('Digite ou cole uma URL válida para testar.');
            }
        });
    }

    // Manipulador das Abas de Tipo (Planejamentos vs Atividades Práticas)
    const typeTabsContainer = document.getElementById('admin-type-tabs');
    if (typeTabsContainer) {
        typeTabsContainer.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                typeTabsContainer.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentAdminType = btn.getAttribute('data-type');

                const formTitle = document.getElementById('admin-form-title');
                if (formTitle) {
                    formTitle.textContent = currentAdminType === 'atividades' 
                        ? '➕ Inserir / Atualizar Atividade Prática' 
                        : '➕ Inserir / Atualizar Planejamento';
                }

                updateAdminProgress();
                renderCoverageMatrix();
                renderAdminTable();
                loadSelectedMaterialToForm();
            });
        });
    }

    const loadSelectedMaterialToForm = () => {
        if (!selectAno || !selectBimestre || !inputUrl || !selectStatus) return;
        const ano = parseInt(selectAno.value, 10);
        const bimestre = parseInt(selectBimestre.value, 10);
        const materials = getActiveStore();
        const mat = materials.find(m => m.ano === ano && m.bimestre === bimestre);

        if (mat && mat.url && mat.url !== '#') {
            inputUrl.value = mat.url;
            selectStatus.value = mat.status || 'active';
            if (statusFeedback) {
                const statusLabel = (mat.status === 'active') ? '🟢 Ativo' : '🟠 Em breve';
                statusFeedback.innerHTML = `<span style="color: #15803d; background: #dcfce7; padding: 0.25rem 0.68rem; border-radius: 50px; font-weight: 600; font-size: 0.82rem;">✅ Link Cadastrado (${statusLabel})</span>`;
            }
        } else {
            inputUrl.value = '';
            selectStatus.value = 'soon';
            if (statusFeedback) {
                statusFeedback.innerHTML = `<span style="color: #b45309; background: #fef3c7; padding: 0.25rem 0.68rem; border-radius: 50px; font-weight: 600; font-size: 0.82rem;">⚠️ Nenhum link cadastrado</span>`;
            }
        }
    };

    if (selectAno && selectBimestre) {
        selectAno.addEventListener('change', loadSelectedMaterialToForm);
        selectBimestre.addEventListener('change', loadSelectedMaterialToForm);
    }

    if (inputUrl && selectStatus) {
        inputUrl.addEventListener('input', () => {
            const val = inputUrl.value.trim();
            if (val && val !== '#' && (val.startsWith('http') || val.length > 5)) {
                selectStatus.value = 'active';
            }
        });
    }

    if (materialForm) {
        materialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ano = parseInt(selectAno.value, 10);
            const bimestre = parseInt(selectBimestre.value, 10);
            let url = inputUrl.value.trim();
            let status = selectStatus.value;

            // Se inseriu uma URL válida, ativa automaticamente o status
            if (url && url !== '#' && (url.startsWith('http') || url.length > 5)) {
                status = 'active';
                selectStatus.value = 'active';
            } else {
                // Se deixou em branco ou limpou, reseta o link e desabilita o status
                url = '#';
                status = 'soon';
                selectStatus.value = 'soon';
            }

            let materials = getActiveStore();
            const index = materials.findIndex(m => m.ano === ano && m.bimestre === bimestre);

            if (index !== -1) {
                materials[index].url = url;
                materials[index].status = status;
            } else {
                materials.push({
                    id: `${currentAdminType === 'atividades' ? 'a' : 'm'}-${ano}-${bimestre}`,
                    ano,
                    bimestre,
                    url,
                    status
                });
            }

            saveActiveStore(materials);
            updateAdminProgress();
            renderCoverageMatrix();
            renderAdminTable();
            loadSelectedMaterialToForm();

            const categoryLabel = currentAdminType === 'atividades' ? 'Atividade Prática' : 'Planejamento';
            const anoLabel = ano === 6 ? '1º ao 5º Ano Geral' : `${ano}º Ano`;

            // Enviar para a API local para gravar no arquivo físico script.js e disparar git push no GitHub
            const payload = { type: currentAdminType, ano, bimestre, url, status };
            saveSingleLinkToApi(payload).then(data => {
                if (data.success) {
                    alert(`✅ Link de ${categoryLabel} (${anoLabel} - ${bimestre}º Bimestre) gravado e publicado automaticamente no GitHub!`);
                } else {
                    alert(`⚠️ Link salvo no seu navegador.\n(${data.message})`);
                }
            });
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                inputUrl.value = '';
                selectStatus.value = 'soon';
                if (statusFeedback) {
                    statusFeedback.innerHTML = `<span style="color: #b45309; background: #fef3c7; padding: 0.25rem 0.68rem; border-radius: 50px; font-weight: 600; font-size: 0.82rem;">⚠️ Nenhum link cadastrado</span>`;
                }
            });
        }
    }

    // Matriz de Cobertura Visual de Links
    const renderCoverageMatrix = () => {
        const matrixGrid = document.getElementById('admin-matrix-grid');
        const summaryEl = document.getElementById('admin-pending-summary');
        if (!matrixGrid || !summaryEl) return;

        const materials = getActiveStore();
        const seriesList = [
            { ano: 1, label: "1º Ano" },
            { ano: 2, label: "2º Ano" },
            { ano: 3, label: "3º Ano" },
            { ano: 4, label: "4º Ano" },
            { ano: 5, label: "5º Ano" },
            { ano: 6, label: "📚 1º a 5º Geral" }
        ];

        matrixGrid.innerHTML = '';
        const pendingBySeries = [];

        seriesList.forEach(s => {
            const row = document.createElement('div');
            row.className = 'admin-matrix-row';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'admin-matrix-label';
            labelSpan.textContent = s.label;
            row.appendChild(labelSpan);

            const chipsDiv = document.createElement('div');
            chipsDiv.className = 'admin-matrix-chips';

            const missingBimestres = [];

            for (let b = 1; b <= 4; b++) {
                const mat = materials.find(m => m.ano === s.ano && m.bimestre === b);
                const isActive = mat && mat.status === 'active' && mat.url && mat.url !== '#';

                const chip = document.createElement('span');
                chip.className = `admin-matrix-chip ${isActive ? 'active' : 'soon'}`;
                chip.innerHTML = isActive ? `✅ ${b}º Bim` : `🔴 ${b}º Bim`;
                chip.title = isActive ? `${s.label} (${b}º Bimestre): Link Cadastrado` : `${s.label} (${b}º Bimestre): Clique para cadastrar!`;

                chip.addEventListener('click', () => {
                    selectAno.value = s.ano;
                    selectBimestre.value = b;
                    loadSelectedMaterialToForm();
                    inputUrl.focus();
                });

                chipsDiv.appendChild(chip);

                if (!isActive) {
                    missingBimestres.push(`${b}º Bimestre`);
                }
            }

            row.appendChild(chipsDiv);
            matrixGrid.appendChild(row);

            if (missingBimestres.length > 0) {
                pendingBySeries.push({ label: s.label, missing: missingBimestres });
            }
        });

        // Renderiza o resumo de pendências
        const storeName = currentAdminType === 'atividades' ? 'Atividades Práticas' : 'Planejamentos';
        if (pendingBySeries.length === 0) {
            summaryEl.innerHTML = `<h4>🎉 Parabéns! Todos os 24 bimestres de ${storeName} estão com links ativos!</h4>`;
            summaryEl.style.background = '#dcfce7';
            summaryEl.style.color = '#15803d';
            summaryEl.style.borderColor = '#bbf7d0';
        } else {
            summaryEl.style.background = '';
            summaryEl.style.color = '';
            summaryEl.style.borderColor = '';
            const totalMissing = pendingBySeries.reduce((acc, curr) => acc + curr.missing.length, 0);
            let html = `<h4>⚠️ Relatório de Pendências - ${storeName} (${totalMissing} de 24 bimestres faltantes):</h4><ul>`;
            pendingBySeries.forEach(p => {
                html += `<li><strong>${p.label}:</strong> Faltam ${p.missing.join(', ')}</li>`;
            });
            html += `</ul>`;
            summaryEl.innerHTML = html;
        }
    };

    // Atualização da Barra de Progresso do Admin
    const updateAdminProgress = () => {
        const textEl = document.getElementById('admin-progress-text');
        const fillEl = document.getElementById('admin-progress-fill');
        if (!textEl || !fillEl) return;

        const materials = getActiveStore();
        const activeCount = materials.filter(m => m.status === 'active' && m.url && m.url !== '#').length;
        const totalCount = materials.length;
        const percentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
        const storeName = currentAdminType === 'atividades' ? 'Atividades Práticas' : 'Planejamentos';

        textEl.textContent = `${storeName}: ${activeCount} de ${totalCount} bimestres configurados (${percentage}%)`;
        fillEl.style.width = `${percentage}%`;
    };

    // Estado e Manipulação dos Filtros de Tabela
    let currentAdminFilter = 'all';
    const filterContainer = document.getElementById('admin-table-filters');
    if (filterContainer) {
        filterContainer.querySelectorAll('.admin-filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                filterContainer.querySelectorAll('.admin-filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentAdminFilter = pill.getAttribute('data-filter');
                renderAdminTable();
            });
        });
    }

    // Tabela Administrativa
    const renderAdminTable = () => {
        const tbody = document.getElementById('admin-materials-tbody');
        if (!tbody) return;

        let materials = getActiveStore();
        materials.sort((a, b) => a.ano - b.ano || a.bimestre - b.bimestre);

        // Aplica o filtro selecionado
        if (currentAdminFilter === 'active') {
            materials = materials.filter(m => m.status === 'active' && m.url && m.url !== '#');
        } else if (currentAdminFilter === 'soon') {
            materials = materials.filter(m => m.status === 'soon' || !m.url || m.url === '#');
        } else if (currentAdminFilter.startsWith('ano-')) {
            const targetAno = parseInt(currentAdminFilter.replace('ano-', ''), 10);
            materials = materials.filter(m => m.ano === targetAno);
        }

        tbody.innerHTML = '';

        if (materials.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 1.5rem;">Nenhum material encontrado para este filtro.</td></tr>`;
            return;
        }

        materials.forEach(mat => {
            const tr = document.createElement('tr');
            
            const isSoon = mat.status === 'soon' || !mat.url || mat.url === '#';
            const statusBadge = isSoon 
                ? `<span class="admin-badge-status soon">Em breve</span>` 
                : `<span class="admin-badge-status active">Ativo</span>`;

            const displayUrl = mat.url && mat.url !== '#' 
                ? `<a href="${mat.url}" target="_blank" style="color: var(--primary-color); word-break: break-all;">${mat.url.substring(0, 45)}...</a>` 
                : `<span style="color: #94a3b8;">Nenhum link cadastrado</span>`;

            const anoLabel = mat.ano === 6 ? '📚 1º ao 5º Geral' : `${mat.ano}º Ano`;

            tr.innerHTML = `
                <td><strong>${anoLabel}</strong></td>
                <td>${mat.bimestre}º Bimestre</td>
                <td>${statusBadge}</td>
                <td>${displayUrl}</td>
                <td>
                    <div class="admin-table-actions">
                        <button class="btn-admin-table btn-edit" data-ano="${mat.ano}" data-bimestre="${mat.bimestre}">✏️ Editar</button>
                        <button class="btn-admin-table btn-toggle" data-ano="${mat.ano}" data-bimestre="${mat.bimestre}">🔄 Alternar</button>
                        ${mat.url && mat.url !== '#' ? `<button class="btn-admin-table btn-open" data-url="${mat.url}">🔗 Testar</button>` : ''}
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Eventos nos botões da tabela
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const ano = parseInt(btn.getAttribute('data-ano'), 10);
                const bimestre = parseInt(btn.getAttribute('data-bimestre'), 10);
                const mat = materials.find(m => m.ano === ano && m.bimestre === bimestre);
                if (mat) {
                    selectAno.value = mat.ano;
                    selectBimestre.value = mat.bimestre;
                    loadSelectedMaterialToForm();
                    inputUrl.focus();
                }
            });
        });

        tbody.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const ano = parseInt(btn.getAttribute('data-ano'), 10);
                const bimestre = parseInt(btn.getAttribute('data-bimestre'), 10);
                let allMats = getActiveStore();
                const index = allMats.findIndex(m => m.ano === ano && m.bimestre === bimestre);
                if (index !== -1) {
                    allMats[index].status = allMats[index].status === 'active' ? 'soon' : 'active';
                    saveActiveStore(allMats);
                    updateAdminProgress();
                    renderCoverageMatrix();
                    renderAdminTable();

                    // Dispara a sincronização do novo status no GitHub
                    const mat = allMats[index];
                    saveSingleLinkToApi({
                        type: currentAdminType,
                        ano: mat.ano,
                        bimestre: mat.bimestre,
                        url: mat.url,
                        status: mat.status
                    });
                }
            });
        });

        tbody.querySelectorAll('.btn-open').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                if (url && url !== '#') window.open(url, '_blank');
            });
        });
    };

    // Modal Exportar Código HTML
    const htmlModal = document.getElementById('admin-html-modal');
    const exportHtmlBtn = document.getElementById('admin-export-html-btn');
    const htmlCloseBtn = document.getElementById('admin-html-close');
    const htmlCancelBtn = document.getElementById('admin-html-cancel-btn');
    const copyHtmlBtn = document.getElementById('admin-copy-html-btn');
    const htmlArea = document.getElementById('admin-html-code-area');

    if (exportHtmlBtn && htmlModal) {
        exportHtmlBtn.addEventListener('click', () => {
            const sectionId = currentAdminType === 'atividades' ? 'atividades' : 'planejamentos';
            const accordionSection = document.getElementById(sectionId);
            if (accordionSection && htmlArea) {
                htmlArea.value = accordionSection.outerHTML;
            }
            htmlModal.classList.add('active');
            htmlModal.setAttribute('aria-hidden', 'false');
        });

        const closeHtmlModal = () => {
            htmlModal.classList.remove('active');
            htmlModal.setAttribute('aria-hidden', 'true');
        };

        if (htmlCloseBtn) htmlCloseBtn.addEventListener('click', closeHtmlModal);
        if (htmlCancelBtn) htmlCancelBtn.addEventListener('click', closeHtmlModal);

        if (copyHtmlBtn && htmlArea) {
            copyHtmlBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(htmlArea.value).then(() => {
                    alert('Código HTML copiado para a área de transferência com sucesso!');
                }).catch(() => {
                    htmlArea.select();
                    document.execCommand('copy');
                    alert('Código HTML copiado!');
                });
            });
        }
    }

    // Modal Colar em Lote
    const batchModal = document.getElementById('admin-batch-modal');
    const batchModalBtn = document.getElementById('admin-batch-modal-btn');
    const batchCloseBtn = document.getElementById('admin-batch-close');
    const batchCancelBtn = document.getElementById('admin-batch-cancel-btn');
    const batchSaveBtn = document.getElementById('admin-batch-save-btn');
    const batchAnoSelect = document.getElementById('admin-batch-select-ano');
    const batchArea = document.getElementById('admin-batch-urls-area');

    if (batchModalBtn && batchModal) {
        batchModalBtn.addEventListener('click', () => {
            batchModal.classList.add('active');
            batchModal.setAttribute('aria-hidden', 'false');
            if (batchArea) batchArea.value = '';
        });

        const closeBatchModal = () => {
            batchModal.classList.remove('active');
            batchModal.setAttribute('aria-hidden', 'true');
        };

        if (batchCloseBtn) batchCloseBtn.addEventListener('click', closeBatchModal);
        if (batchCancelBtn) batchCancelBtn.addEventListener('click', closeBatchModal);

        if (batchSaveBtn && batchAnoSelect && batchArea) {
            batchSaveBtn.addEventListener('click', () => {
                const targetAno = parseInt(batchAnoSelect.value, 10);
                const lines = batchArea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);

                if (lines.length === 0) {
                    alert('Cole pelo menos uma URL válida.');
                    return;
                }

                let materials = getActiveStore();
                lines.forEach((url, i) => {
                    if (i < 4) {
                        const bimestre = i + 1;
                        const idx = materials.findIndex(m => m.ano === targetAno && m.bimestre === bimestre);
                        if (idx !== -1) {
                            materials[idx].url = url;
                            materials[idx].status = 'active';
                        }
                    }
                });

                saveActiveStore(materials);
                updateAdminProgress();
                renderCoverageMatrix();
                renderAdminTable();
                loadSelectedMaterialToForm();
                closeBatchModal();

                const batchItems = [];
                lines.forEach((url, i) => {
                    if (i < 4) {
                        batchItems.push({
                            ano: targetAno,
                            bimestre: i + 1,
                            url: url,
                            status: 'active'
                        });
                    }
                });

                const catName = currentAdminType === 'atividades' ? 'Atividades Práticas' : 'Planejamentos';
                const anoName = targetAno === 6 ? '1º ao 5º Ano Geral' : `${targetAno}º Ano`;

                saveBatchLinksToApi({
                    type: currentAdminType,
                    items: batchItems,
                    label: `${catName} - ${anoName}`
                }).then(data => {
                    if (data.success) {
                        alert(`✅ Links em lote para o ${anoName} salvos em script.js e publicados no GitHub automaticamente!`);
                    } else {
                        alert(`⚠️ Links salvos no seu navegador.\n(${data.message})`);
                    }
                });
            });
        }
    }

    // Modal Alterar Senha
    const passwordModal = document.getElementById('admin-password-modal');
    const changePasswordBtn = document.getElementById('admin-change-password-btn');
    const passwordCloseBtn = document.getElementById('admin-password-close');
    const passwordCancelBtn = document.getElementById('admin-password-cancel-btn');
    const changePasswordForm = document.getElementById('admin-change-password-form');
    const newPassInput = document.getElementById('admin-new-password');
    const confirmPassInput = document.getElementById('admin-confirm-password');
    const passwordError = document.getElementById('admin-password-error');

    if (changePasswordBtn && passwordModal) {
        changePasswordBtn.addEventListener('click', () => {
            passwordModal.classList.add('active');
            passwordModal.setAttribute('aria-hidden', 'false');
            if (newPassInput) newPassInput.value = '';
            if (confirmPassInput) confirmPassInput.value = '';
            if (passwordError) passwordError.style.display = 'none';
        });

        const closePasswordModal = () => {
            passwordModal.classList.remove('active');
            passwordModal.setAttribute('aria-hidden', 'true');
        };

        if (passwordCloseBtn) passwordCloseBtn.addEventListener('click', closePasswordModal);
        if (passwordCancelBtn) passwordCancelBtn.addEventListener('click', closePasswordModal);

        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPass = newPassInput.value.trim();
                const confirmPass = confirmPassInput.value.trim();

                if (newPass.length < 4) {
                    alert('A nova senha deve ter pelo menos 4 caracteres.');
                    return;
                }

                if (newPass !== confirmPass) {
                    if (passwordError) passwordError.style.display = 'block';
                    return;
                }

                setAdminPassword(newPass);
                closePasswordModal();
                alert('Senha administrativa alterada com sucesso!');
            });
        }
    }

    // Ferramentas de Backup (Exportar / Importar / Resetar)
    const exportBtn = document.getElementById('admin-export-json-btn');
    const importBtn = document.getElementById('admin-import-json-btn');
    const fileInput = document.getElementById('admin-import-file-input');
    const resetBtn = document.getElementById('admin-reset-default-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = getActiveStore();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `${currentAdminType}_educacao_digital_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        saveActiveStore(importedData);
                        updateAdminProgress();
                        renderCoverageMatrix();
                        renderAdminTable();
                        alert('Backup importado com sucesso!');
                    } else {
                        alert('Formato de arquivo JSON inválido.');
                    }
                } catch (err) {
                    alert('Erro ao carregar o arquivo JSON. Verifique se o formato está correto.');
                }
            };
            reader.readAsText(file);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja restaurar a lista padrão de ${currentAdminType === 'atividades' ? 'Atividades Práticas' : 'Planejamentos'}?`)) {
                if (currentAdminType === 'atividades') {
                    saveStoredActivities(DEFAULT_ACTIVITIES);
                } else {
                    saveStoredMaterials(DEFAULT_MATERIALS);
                }
                updateAdminProgress();
                renderCoverageMatrix();
                renderAdminTable();
                alert('Links padrão restaurados com sucesso!');
            }
        });
    }
});
