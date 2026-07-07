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
                if (link.classList.contains('dropdown-toggle')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropdownMenu = link.nextElementSibling;
                    const isExpanded = link.getAttribute('aria-expanded') === 'true';
                    
                    // Alterna estado do toggle
                    link.setAttribute('aria-expanded', !isExpanded);
                    link.parentElement.classList.toggle('active');
                    
                    if (dropdownMenu) {
                        dropdownMenu.classList.toggle('active');
                    }
                    return;
                }

                const href = link.getAttribute('href') || '';
                
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
                        content.style.maxHeight = content.scrollHeight + 'px';
                    });

                    content.addEventListener('transitionend', () => {
                        accordion.classList.remove('is-animating');
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

            // Adiciona uma indicação visual de "Em breve"
            const badge = document.createElement('span');
            badge.classList.add('btn-bimestre-badge');
            badge.textContent = 'Em breve';
            button.appendChild(badge);
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

    // Previne pulo de página em links vazios (#)
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
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
                        link.removeAttribute('aria-current');
                    });

                    // Adiciona a classe 'active' usando o cache
                    const activeLink = navLinksMap[id];
                    if (activeLink) {
                        activeLink.classList.add('active');
                        activeLink.setAttribute('aria-current', 'page');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
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

    // Dados das competências dos Eixos da BNCC
    const eixosData = {
        pensamento: {
            title: "Pensamento Computacional",
            content: `
                <p>O Pensamento Computacional envolve a resolução de problemas de forma lógica e estruturada, utilizando conceitos da ciência da computação.</p>
                <p><strong>Habilidades Principais na BNCC:</strong></p>
                <ul>
                    <li><span class="ability-code">EF12CO01</span>: Decompor um problema complexo em subproblemas menores e mais tratáveis.</li>
                    <li><span class="ability-code">EF12CO03</span>: Identificar padrões em problemas e soluções comuns.</li>
                    <li><span class="ability-code">EF12CO05</span>: Criar algoritmos e sequências lógicas passo a passo para atingir um objetivo específico.</li>
                    <li><span class="ability-code">EF15CO01</span>: Desenvolver programas de computador simples por meio de programação visual (blocos).</li>
                </ul>
                <p><strong>Aplicações na Prática:</strong> Atividades desplugadas (como jogos de tabuleiro lógicos), programação no Scratch, e robótica educativa com materiais recicláveis.</p>
            `
        },
        mundo: {
            title: "Mundo Digital",
            content: `
                <p>O Mundo Digital aborda a compreensão física e lógica dos computadores, redes de comunicação e ferramentas digitais que usamos diariamente.</p>
                <p><strong>Habilidades Principais na BNCC:</strong></p>
                <ul>
                    <li><span class="ability-code">EF12CO07</span>: Compreender a diferença entre hardware (físico) e software (lógico).</li>
                    <li><span class="ability-code">EF12CO09</span>: Entender como as informações são transmitidas pela internet (dados, pacotes, redes).</li>
                    <li><span class="ability-code">EF15CO06</span>: Operar sistemas computacionais básicos e utilitários de produtividade de forma autônoma.</li>
                </ul>
                <p><strong>Aplicações na Prática:</strong> Aulas sobre o funcionamento da internet, navegação orientada em motores de busca, exploração de componentes de um computador aberto e digitação.</p>
            `
        },
        cultura: {
            title: "Cultura Digital",
            content: `
                <p>A Cultura Digital foca no impacto social, ético e cidadão das tecnologias. Ensina os alunos a serem produtores críticos e cidadãos responsáveis na rede.</p>
                <p><strong>Habilidades Principais na BNCC:</strong></p>
                <ul>
                    <li><span class="ability-code">EF12CO12</span>: Identificar riscos comuns na internet e formas de se proteger (senhas, privacidade).</li>
                    <li><span class="ability-code">EF15CO09</span>: Discutir e reconhecer as consequências do cyberbullying e comportamentos tóxicos na rede.</li>
                    <li><span class="ability-code">EF15CO11</span>: Avaliar de forma crítica fontes de informação, combatendo Fake News e compreendendo direitos autorais.</li>
                </ul>
                <p><strong>Aplicações na Prática:</strong> Rodas de conversa sobre uso excessivo de telas, simulações de navegação segura, criação de campanhas de consciência na escola e análise crítica de notícias.</p>
            `
        }
    };

    // Lógica de Filtro/Pesquisa nos Planejamentos e Atividades com categorias de tags
    const setupFilters = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const searchInput = section.querySelector('.search-input');
        const tags = section.querySelectorAll('.filter-tag');
        const categoryTags = section.querySelectorAll('.category-tag');
        const accordions = section.querySelectorAll('.accordion-item');

        let currentSearch = '';
        let currentFilter = 'all';
        let currentCategory = 'all';

        const filterItems = () => {
            accordions.forEach(item => {
                const headerText = item.querySelector('.accordion-header h3').textContent.toLowerCase();
                
                // Extrai o número do ano (ex: "1º Ano" -> "1")
                const yearMatch = headerText.match(/(\d+)/);
                const itemYear = yearMatch ? yearMatch[1] : '';

                // Filtro por ano letivo (botão filter-tag)
                const matchesFilter = currentFilter === 'all' || itemYear === currentFilter;

                // Filtro por texto digitado
                const matchesSearch = headerText.includes(currentSearch);

                // Filtro por tema/categoria (botão category-tag)
                const bimestreBtns = item.querySelectorAll('.btn-bimestre');
                let hasVisibleBimestre = false;

                bimestreBtns.forEach(btn => {
                    const btnCategory = btn.getAttribute('data-category') || '';
                    const matchesCategory = currentCategory === 'all' || btnCategory === currentCategory;
                    
                    if (matchesCategory) {
                        btn.style.display = 'inline-flex';
                        hasVisibleBimestre = true;
                    } else {
                        btn.style.display = 'none';
                    }
                });

                // Se houver filtro por categoria ativo, e o card não tiver nenhum bimestre correspondente, oculta o card
                const matchesCategoryFilter = currentCategory === 'all' || hasVisibleBimestre;

                if (matchesFilter && matchesSearch && matchesCategoryFilter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                    // Se estiver aberto e for ocultado, fecha para evitar layout quebrado
                    if (item.hasAttribute('open')) {
                        item.removeAttribute('open');
                        item.classList.remove('is-open');
                        const content = item.querySelector('.accordion-content');
                        if (content) content.style.maxHeight = '0px';
                    }
                }
            });
        };

        // Evento de Digitação
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase().trim();
                filterItems();
            });
        }

        // Evento de Clique nas Tags de Ano Letivo
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                currentFilter = tag.getAttribute('data-filter');
                filterItems();
                autoExpandSingleAccordion();
            });
        });

        // Evento de Clique nas Tags de Categorias (Temas)
        categoryTags.forEach(catTag => {
            catTag.addEventListener('click', () => {
                categoryTags.forEach(t => t.classList.remove('active'));
                catTag.classList.add('active');
                currentCategory = catTag.getAttribute('data-category');
                filterItems();
                autoExpandSingleAccordion();
            });
        });

        // Auxiliar: abre automaticamente se restar apenas um acordeão visível
        const autoExpandSingleAccordion = () => {
            const visibleAccordions = Array.from(accordions).filter(acc => acc.style.display !== 'none');
            if (visibleAccordions.length === 1 && (currentFilter !== 'all' || currentCategory !== 'all')) {
                const singleAcc = visibleAccordions[0];
                if (!singleAcc.hasAttribute('open')) {
                    singleAcc.setAttribute('open', '');
                    singleAcc.classList.add('is-open');
                    const content = singleAcc.querySelector('.accordion-content');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            }
        };
    };

    setupFilters('planejamentos');
    setupFilters('atividades');

    // Lógica do Modal BNCC
    const modal = document.getElementById('bncc-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const axisCards = document.querySelectorAll('.clickable-card');

    if (modal && modalClose && modalTitle && modalContent && axisCards.length > 0) {
        let lastFocusedElement = null;

        const openModal = (axisKey) => {
            const data = eixosData[axisKey];
            if (!data) return;

            lastFocusedElement = document.activeElement;
            modalTitle.textContent = data.title;
            modalContent.innerHTML = data.content;
            
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            modalClose.focus();
            document.body.style.overflow = 'hidden'; // Impede scroll da página principal
        };

        const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };

        axisCards.forEach(card => {
            card.addEventListener('click', () => {
                const axis = card.getAttribute('data-axis');
                openModal(axis);
            });

            // Suporte para acessibilidade via teclado (Enter ou Espaço)
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const axis = card.getAttribute('data-axis');
                    openModal(axis);
                }
            });
        });

        modalClose.addEventListener('click', closeModal);

        // Fecha ao clicar fora do container
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Fecha com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Lógica de Envio de Feedback/Contato
    const feedbackForm = document.getElementById('feedback-form');
    const successMsg = document.getElementById('form-success-msg');
    const errorMsg = document.getElementById('form-error-msg');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = feedbackForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerHTML;

            // Feedback visual de carregamento
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Enviando...</span> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';

            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Simula uma requisição de rede de 1.2 segundos
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Sucesso simulado
                if (successMsg) {
                    successMsg.style.display = 'block';
                    feedbackForm.reset();
                    
                    // Rola suavemente até a mensagem de sucesso
                    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                    // Oculta a mensagem de sucesso após 7 segundos
                    setTimeout(() => {
                        successMsg.style.display = 'none';
                    }, 7000);
                }
            }, 1200);
        });
    }

    // Acessibilidade: Controle de Tamanho de Fonte
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const fontIncreaseBtn = document.getElementById('font-increase');

    if (fontDecreaseBtn && fontIncreaseBtn && htmlElement) {
        let currentSize = 100; // Porcentagem do tamanho padrão da fonte (100% = 16px)

        const changeFontSize = (percentage) => {
            currentSize = Math.max(80, Math.min(150, currentSize + percentage));
            htmlElement.style.fontSize = `${currentSize}%`;
            localStorage.setItem('font-size-percent', currentSize);
        };

        fontDecreaseBtn.addEventListener('click', () => changeFontSize(-10));
        fontIncreaseBtn.addEventListener('click', () => changeFontSize(10));

        // Carrega tamanho salvo
        const savedSize = localStorage.getItem('font-size-percent');
        if (savedSize) {
            currentSize = parseInt(savedSize, 10);
            htmlElement.style.fontSize = `${currentSize}%`;
        }
    }

    // Acessibilidade: Controle de Alto Contraste
    const contrastToggleBtn = document.getElementById('contrast-toggle');
    if (contrastToggleBtn && htmlElement) {
        const toggleContrast = (persist = true) => {
            const currentContrast = htmlElement.getAttribute('data-contrast') || 'normal';
            const newContrast = currentContrast === 'normal' ? 'high' : 'normal';
            htmlElement.setAttribute('data-contrast', newContrast);
            
            if (newContrast === 'high') {
                contrastToggleBtn.setAttribute('aria-label', 'Desativar alto contraste');
                contrastToggleBtn.setAttribute('title', 'Desativar Alto Contraste');
            } else {
                contrastToggleBtn.setAttribute('aria-label', 'Ativar alto contraste');
                contrastToggleBtn.setAttribute('title', 'Ativar Alto Contraste');
            }

            if (persist) {
                localStorage.setItem('contrast', newContrast);
            }
        };

        contrastToggleBtn.addEventListener('click', () => toggleContrast(true));

        // Carrega contraste salvo
        const savedContrast = localStorage.getItem('contrast');
        if (savedContrast === 'high') {
            htmlElement.setAttribute('data-contrast', 'high');
            contrastToggleBtn.setAttribute('aria-label', 'Desativar alto contraste');
            contrastToggleBtn.setAttribute('title', 'Desativar Alto Contraste');
        }
    }

    // Acessibilidade/Glossário: Suporte a dispositivos móveis e teclado
    const glossaryTerms = document.querySelectorAll('.glossary-term');
    if (glossaryTerms.length > 0) {
        glossaryTerms.forEach(term => {
            term.setAttribute('tabindex', '0'); // Habilita foco no teclado
            
            term.addEventListener('click', (e) => {
                // Em dispositivos móveis, previne sumir imediatamente
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Fecha outros tooltips abertos
                    glossaryTerms.forEach(t => {
                        if (t !== term) t.classList.remove('active');
                    });
                    
                    term.classList.toggle('active');
                }
            });
        });

        // Fecha tooltips ao clicar fora
        document.addEventListener('click', () => {
            glossaryTerms.forEach(t => t.classList.remove('active'));
        });
    }

    // Cabeçalho Dinâmico ao rolar a página (Shrink Header)
    const header = document.querySelector('header');
    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                header.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
            }
        };

        // Scroll listener passivo para performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Executa para checagem inicial
    }

    // Controle global de cliques para fechar dropdowns abertos ao clicar fora
    document.addEventListener('click', (e) => {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
                if (menu) menu.classList.remove('active');
            }
        });
    });
});
