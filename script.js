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
                    
                    // Duplo rAF: garante que o grid de colunas já está calculado antes de medir
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            content.style.maxHeight = content.scrollHeight + 'px';
                        });
                    });

                    content.addEventListener('transitionend', () => {
                        // Após a transição, usa 'none' para que o conteúdo cresça livremente
                        // (ex: imagens ou iframes que carregam depois)
                        content.style.maxHeight = 'none';
                        accordion.classList.remove('is-animating');
                    }, { once: true });
                }
            });
        });
    }



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
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
            }
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
    const animatedElements = document.querySelectorAll('.card, .section-title, .reveal-on-scroll');
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
        const categoryTags = section.querySelectorAll('.category-tag');
        const accordions = section.querySelectorAll('.accordion-item');

        let currentSearch = '';
        let currentCategory = 'all';

        const filterItems = () => {
            accordions.forEach(item => {
                const headerText = item.querySelector('.accordion-header h3').textContent.toLowerCase();
                
                // Extrai o número do ano (ex: "1º Ano" -> "1")
                const yearMatch = headerText.match(/(\d+)/);
                const itemYear = yearMatch ? yearMatch[1] : '';

                // Filtro por ano letivo (usa o filtro global de foco)
                const matchesFilter = globalFocusYear === 'all' || itemYear === globalFocusYear;

                const materialCards = item.querySelectorAll('.material-card');
                let hasVisibleBimestre = false;
                let hasSearchMatchInBimestres = false;

                materialCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category') || '';
                    const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
                    const cardText = card.textContent.toLowerCase();

                    const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
                    
                    // Verifica se o texto digitado bate com o título da atividade, tema ou ano
                    const matchesSearchQuery = currentSearch === '' || 
                                               cardTitle.includes(currentSearch) || 
                                               cardCategory.includes(currentSearch) || 
                                               cardText.includes(currentSearch) ||
                                               headerText.includes(currentSearch);

                    if (matchesCategory && matchesSearchQuery) {
                        card.style.display = 'flex';
                        hasVisibleBimestre = true;
                        
                        // Adiciona destaque visual se houver pesquisa ativa e correspondência
                        if (currentSearch !== '' && (cardTitle.includes(currentSearch) || cardCategory.includes(currentSearch))) {
                            card.classList.add('search-highlight');
                            hasSearchMatchInBimestres = true;
                        } else {
                            card.classList.remove('search-highlight');
                        }
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('search-highlight');
                    }
                });

                // O card bate com a pesquisa se a query for vazia, se o nome do ano bater ou se algum bimestre bater
                const matchesSearch = currentSearch === '' || headerText.includes(currentSearch) || hasSearchMatchInBimestres;

                // Se houver filtro por categoria ativo, e o card não tiver nenhum bimestre correspondente, oculta o card
                const matchesCategoryFilter = currentCategory === 'all' || hasVisibleBimestre;

                if (matchesFilter && matchesSearch && matchesCategoryFilter) {
                    // Remove o display inline para deixar o CSS controlar (volta ao padrão "block")
                    item.style.removeProperty('display');
                    
                    // Expande o acordeão automaticamente se houver correspondência com o termo buscado ou se for o ano em foco específico
                    const isSpecificYearFocused = globalFocusYear !== 'all' && itemYear === globalFocusYear;
                    if ((currentSearch !== '' && hasSearchMatchInBimestres) || isSpecificYearFocused) {
                        item.setAttribute('open', '');
                        item.classList.add('is-open');
                        const content = item.querySelector('.accordion-content');
                        if (content) {
                            // Duplo rAF para garantir medição correta após layout de grid
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    content.style.maxHeight = content.scrollHeight + 'px';
                                    // Após transição, libera a altura para crescer com conteúdo dinâmico
                                    content.addEventListener('transitionend', () => {
                                        content.style.maxHeight = 'none';
                                    }, { once: true });
                                });
                            });
                        }
                    } else if (globalFocusYear === 'all' && currentSearch === '') {
                        // Volta ao estado fechado padrão ao sair do modo foco
                        item.removeAttribute('open');
                        item.classList.remove('is-open');
                        const content = item.querySelector('.accordion-content');
                        if (content) content.style.maxHeight = '0px';
                    }
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
            if (visibleAccordions.length === 1 && (globalFocusYear !== 'all' || currentCategory !== 'all')) {
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

        return {
            filter: filterItems,
            autoExpand: autoExpandSingleAccordion
        };
    };

    // Variável e Ouvinte de Foco Global
    let globalFocusYear = 'all';

    // Função auxiliar para sincronizar o ano ativo com a URL
    const syncYearToURL = (year) => {
        const url = new URL(window.location.href);
        if (year === 'all') {
            url.searchParams.delete('ano');
        } else {
            url.searchParams.set('ano', year);
        }
        history.replaceState(null, '', url.toString());
    };

    // Inicializa as instâncias de filtro e expõe seus métodos
    const filterPlanejamentos = setupFilters('planejamentos');
    const filterAtividades = setupFilters('atividades');

    const focusPills = document.querySelectorAll('.focus-pill');

    // Função central que ativa um filtro de ano, atualiza a UI e sincroniza a URL
    const activateFocusYear = (year, scrollToSection = false) => {
        globalFocusYear = year;
        focusPills.forEach(p => {
            p.classList.toggle('active', p.getAttribute('data-focus') === year);
        });

        if (filterPlanejamentos) {
            filterPlanejamentos.filter();
            filterPlanejamentos.autoExpand();
        }
        if (filterAtividades) {
            filterAtividades.filter();
            filterAtividades.autoExpand();
        }

        syncYearToURL(year);

        if (scrollToSection && year !== 'all') {
            const planejaSection = document.getElementById('planejamentos');
            if (planejaSection) {
                planejaSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    if (focusPills.length > 0) {
        focusPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const year = pill.getAttribute('data-focus');
                activateFocusYear(year, true);
            });
        });

        // Restaura o filtro a partir da URL ao carregar a página (?ano=3)
        const urlParams = new URLSearchParams(window.location.search);
        const anoParam = urlParams.get('ano');
        if (anoParam) {
            // Aguarda o DOM estar totalmente renderizado antes de aplicar o filtro
            requestAnimationFrame(() => {
                activateFocusYear(anoParam, false);
            });
        }
    }

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
    const formFieldsWrapper = document.getElementById('form-fields-wrapper');
    const formSuccessScreen = document.getElementById('form-success-screen');
    const formResetBtn = document.getElementById('form-reset-btn');

    if (feedbackForm && formFieldsWrapper && formSuccessScreen) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = feedbackForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerHTML;

            // Feedback visual de carregamento no botão
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Enviando...</span> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';

            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Simula envio de e-mail (1.2 segundos)
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Sucesso: transiciona para a tela animada
                formFieldsWrapper.classList.add('inactive');
                formSuccessScreen.classList.add('active');
                
                feedbackForm.reset();
                
                // Rola suavemente até o topo do form para centralizar a animação
                feedbackForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1200);
        });

        // Botão para redefinir o formulário e enviar outra mensagem
        if (formResetBtn) {
            formResetBtn.addEventListener('click', () => {
                formSuccessScreen.classList.remove('active');
                formFieldsWrapper.classList.remove('inactive');
                
                // Foca o primeiro input para melhorar UX
                const nameInput = document.getElementById('form-name');
                if (nameInput) nameInput.focus();
            });
        }
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



    // ==========================================
    // LÓGICA DO QUIZ INTERATIVO COM BANCO E CATEGORIAS
    // ==========================================
    const QUIZ_BANK = [
        // CATEGORIA: SEGURANÇA ONLINE
        {
            category: "seguranca",
            categoryName: "Segurança Online",
            question: "Você recebeu um e-mail dizendo que ganhou um celular grátis e pedindo para clicar em um link para digitar seus dados. O que você deve fazer?",
            options: [
                "Clicar imediatamente para não perder a promoção.",
                "Ignorar o e-mail, não clicar em nada e avisar um adulto/professor, pois pode ser um golpe (Phishing).",
                "Compartilhar com todos os amigos para que eles também ganhem.",
                "Clicar no link apenas para ver se é verdade."
            ],
            correct: 1,
            explanation: "Mensagens com promessas de prêmios fáceis e links suspeitos são truques comuns de cibercriminosos (Phishing) para capturar senhas e dados confidenciais."
        },
        {
            category: "seguranca",
            categoryName: "Segurança Online",
            question: "Qual das seguintes senhas é a mais segura para proteger suas contas online contra invasores?",
            options: [
                "Sua data de nascimento ou '123456'.",
                "O nome do seu animal de estimação em letras minúsculas.",
                "Uma palavra simples toda junta, como 'amofutebol'.",
                "Uma combinação de letras maiúsculas, minúsculas, números e caracteres especiais (ex: 'Bata#2026!')."
            ],
            correct: 3,
            explanation: "Senhas fortes devem ter letras maiúsculas, minúsculas, números e símbolos. Isso impede que sistemas automatizados descubram sua senha facilmente."
        },
        {
            category: "seguranca",
            categoryName: "Segurança Online",
            question: "Você quer instalar um jogo ou aplicativo novo no seu celular ou tablet. O que é mais seguro fazer?",
            options: [
                "Baixar de qualquer site que aparecer na pesquisa do Google.",
                "Clicar em anúncios que prometem o jogo grátis com recursos extras.",
                "Baixar apenas de lojas de aplicativos oficiais e pedir ajuda ou permissão de um adulto responsável.",
                "Pedir o link para um desconhecido em um fórum ou chat."
            ],
            correct: 2,
            explanation: "Baixar arquivos de sites não oficiais aumenta muito o risco de infectar seu aparelho com vírus ou softwares maliciosos. Use sempre lojas oficiais."
        },
        {
            category: "seguranca",
            categoryName: "Segurança Online",
            question: "Seu melhor amigo pediu a senha do seu perfil de jogo para passar de fase para você. Qual é a atitude recomendada?",
            options: [
                "Passar a senha imediatamente, afinal ele é seu melhor amigo.",
                "Explicar que senhas são de uso estritamente pessoal e que você não deve compartilhá-las com ninguém, nem com amigos.",
                "Passar a senha mas pedir para ele não contar para ninguém.",
                "Escrever a senha em um papel e entregar para ele na escola."
            ],
            correct: 1,
            explanation: "Senhas devem ser secretas e pessoais. Mesmo sem querer, um amigo pode deixar sua conta exposta ou logada em locais inseguros."
        },

        // CATEGORIA: FAKE NEWS & MÍDIAS
        {
            category: "fakenews",
            categoryName: "Fake News & Mídias",
            question: "Você leu uma notícia surpreendente em uma rede social, mas ela não cita quem escreveu ou a fonte oficial. O que deve fazer antes de compartilhar?",
            options: [
                "Compartilhar imediatamente, pois parece muito interessante.",
                "Curtir a postagem para dar engajamento, mas não compartilhar.",
                "Verificar em canais de notícias confiáveis se a informação é verdadeira antes de repassar.",
                "Compartilhar e colocar na legenda que não sabe se é verdade."
            ],
            correct: 2,
            explanation: "Notícias falsas (Fake News) espalham-se rápido quando não são checadas. Sempre procure a mesma notícia em sites de jornalismo confiáveis antes de repassar."
        },
        {
            category: "fakenews",
            categoryName: "Fake News & Mídias",
            question: "Você viu uma foto muito estranha na internet acompanhada de uma legenda chocante, mas suspeita que seja uma montagem. Como agir?",
            options: [
                "Acreditar na legenda, pois fotos não podem ser manipuladas.",
                "Fazer uma pesquisa reversa de imagem ou buscar o assunto em sites de checagem para ver se é real.",
                "Enviar em grupos afirmando que é 100% verídico.",
                "Deixar para lá, mas salvar a imagem para usar depois."
            ],
            correct: 1,
            explanation: "Hoje é muito fácil editar fotos e criar imagens falsas usando Inteligência Artificial. Sempre cheque o contexto antes de repassar."
        },
        {
            category: "fakenews",
            categoryName: "Fake News & Mídias",
            question: "No grupo de família, enviaram um texto dizendo que um alimento comum causa uma doença grave. O texto não tem links nem referências de médicos. O que fazer?",
            options: [
                "Avisar no grupo que a informação parece suspeita e sem base científica, recomendando não compartilhar.",
                "Compartilhar com seus amigos para alertá-los também.",
                "Parar de comer o alimento imediatamente por precaução.",
                "Ignorar o texto e não falar nada, mesmo sabendo que é mentira."
            ],
            correct: 0,
            explanation: "Textos alarmistas sem fontes médicas ou links oficiais são quase sempre boatos. Alertar quem compartilhou ajuda a parar a desinformação."
        },
        {
            category: "fakenews",
            categoryName: "Fake News & Mídias",
            question: "O que é uma 'bolha de informação' (filtro bolha) nas redes sociais?",
            options: [
                "Uma proteção que impede que você pegue vírus no computador.",
                "Uma rede social voltada apenas para crianças.",
                "A tendência dos algoritmos de nos mostrar apenas opiniões que combinam com o que já curtimos, limitando outros pontos de vista.",
                "O limite diário de tempo que o aplicativo deixa você usar."
            ],
            correct: 2,
            explanation: "Os algoritmos das redes sociais mostram conteúdo que mantém sua atenção. Isso cria 'bolhas' onde você só vê opiniões parecidas com a sua."
        },

        // CATEGORIA: CONVIVÊNCIA DIGITAL
        {
            category: "convivencia",
            categoryName: "Convivência Digital",
            question: "Se você notar que um colega está sofrendo ofensas frequentes ou exclusão em grupos de conversa da turma, qual a atitude correta?",
            options: [
                "Rir e endossar os comentários para continuar enturmado no grupo.",
                "Ficar calado e sair do grupo para não se comprometer.",
                "Acolher o colega privadamente, tirar prints das agressões e relatar o caso a um professor ou responsável.",
                "Responder com insultos ainda mais fortes para defender a pessoa."
            ],
            correct: 2,
            explanation: "O cyberbullying causa sofrimento real. Ser um aliado ativo envolve apoiar quem está sofrendo, documentar as ofensas e avisar a escola."
        },
        {
            category: "convivencia",
            categoryName: "Convivência Digital",
            question: "Você tirou uma foto engraçada de um colega na escola e quer postar nas suas redes sociais. Qual é o primeiro passo correto?",
            options: [
                "Postar logo antes que perca a graça.",
                "Enviar apenas para alguns amigos próximos no privado.",
                "Perguntar ao colega se ele se importa e pedir permissão antes de publicar qualquer imagem dele.",
                "Postar e marcar o colega para que ele veja a brincadeira."
            ],
            correct: 2,
            explanation: "A privacidade e a imagem de cada pessoa devem ser respeitadas. Sempre peça consentimento antes de publicar fotos ou vídeos de terceiros."
        },
        {
            category: "convivencia",
            categoryName: "Convivência Digital",
            question: "Enquanto você jogava online, um usuário desconhecido começou a te mandar mensagens agressivas e pedir seus dados pessoais. O que fazer?",
            options: [
                "Responder na mesma moeda para se defender.",
                "Mandar os dados mas pedir para ele parar de ser agressivo.",
                "Usar as ferramentas do jogo para bloquear e denunciar o jogador, e avisar seus pais ou responsáveis.",
                "Apagar o jogo do celular sem contar para ninguém."
            ],
            correct: 2,
            explanation: "Nunca passe dados para desconhecidos e não responda a ofensas. Bloquear e denunciar afasta o jogador tóxico da plataforma."
        },
        {
            category: "convivencia",
            categoryName: "Convivência Digital",
            question: "Você e um amigo estão discutindo por texto em um grupo e a conversa está ficando muito tensa e irritada. Qual a melhor decisão?",
            options: [
                "Continuar digitando rápido para provar que você está certo.",
                "Parar de responder por escrito, respirar e propor conversar pessoalmente ou por ligação com calma mais tarde.",
                "Escrever em letras maiúsculas para mostrar que está bravo.",
                "Chamar outros amigos no grupo para apoiarem sua opinião."
            ],
            correct: 1,
            explanation: "Discussões por mensagem escrita perdem o tom de voz e são facilmente mal interpretadas, piorando os conflitos. Conversar com calma é sempre melhor."
        },

        // CATEGORIA: PENSAMENTO COMPUTACIONAL
        {
            category: "computacao",
            categoryName: "Pensamento Computacional",
            question: "No pensamento computacional, o que é um 'algoritmo'?",
            options: [
                "Uma fórmula matemática complexa usada apenas por cientistas da computação.",
                "Uma sequência ordenada de passos ou instruções passo a passo para resolver um problema ou realizar uma tarefa.",
                "O nome do processador principal de um computador moderno.",
                "Uma pasta oculta no sistema operacional onde os arquivos são salvos."
            ],
            correct: 1,
            explanation: "Algoritmos estão no nosso dia a dia, como em receitas de bolo ou instruções de montagem. Computadores seguem algoritmos para executar tarefas."
        },
        {
            category: "computacao",
            categoryName: "Pensamento Computacional",
            question: "Se você estiver escrevendo um código e ele não funcionar como esperado devido a um erro, o processo de encontrar e corrigir esse erro é chamado de:",
            options: [
                "Codificação.",
                "Decomposição.",
                "Depuração (ou Debugging).",
                "Reconhecimento de padrões."
            ],
            correct: 2,
            explanation: "Depurar é analisar o código passo a passo para encontrar onde a lógica falhou e aplicar a correção necessária para o programa funcionar."
        },
        {
            category: "computacao",
            categoryName: "Pensamento Computacional",
            question: "No Scratch, qual bloco você deve usar para fazer com que um personagem repita o movimento de andar 10 passos continuamente, sem ter que arrastar vários blocos iguais?",
            options: [
                "Bloco 'se... então'.",
                "Bloco de loop, como 'repita' ou 'sempre'.",
                "Bloco 'diga Olá'.",
                "Bloco 'espere 1 segundo'."
            ],
            correct: 1,
            explanation: "Os loops evitam repetições desnecessárias de código, tornando a programação mais limpa, eficiente e fácil de manter."
        },
        {
            category: "computacao",
            categoryName: "Pensamento Computacional",
            question: "Você está jogando um desafio desplugado de direções. Para fazer o robô andar até a estrela, ele precisa dar 3 passos para frente e depois virar à esquerda. Qual sequência lógica de comandos representa essa ação?",
            options: [
                "Esquerda -> Frente -> Frente -> Frente.",
                "Frente -> Frente -> Esquerda -> Frente.",
                "Frente -> Frente -> Frente -> Esquerda.",
                "Frente -> Esquerda -> Frente -> Esquerda."
            ],
            correct: 2,
            explanation: "A ordem das instruções importa. O robô deve primeiro dar os três passos à frente para depois mudar sua direção (virar à esquerda)."
        }
    ];

    // Embaralha um array (Fisher-Yates)
    const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const quizStartScreen = document.getElementById('quiz-start-screen');
    const quizQuestionScreen = document.getElementById('quiz-question-screen');
    const quizResultsScreen = document.getElementById('quiz-results-screen');
    
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    
    const questionNumberText = document.getElementById('quiz-question-number');
    const progressFill = document.getElementById('quiz-progress-fill');
    const questionText = document.getElementById('quiz-question-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const feedbackBox = document.getElementById('quiz-feedback');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackExplanation = document.getElementById('feedback-explanation');
    
    const scoreText = document.getElementById('quiz-score-text');
    const resultsTitle = document.getElementById('quiz-results-title');
    const resultsDescription = document.getElementById('quiz-results-description');
    
    // Novos elementos do Quiz
    const categoryPillsContainer = document.getElementById('quiz-category-pills');
    const resultCategoryElement = document.getElementById('quiz-result-category');
    const badgeContainer = document.getElementById('quiz-badge-container');
    const resultsIcon = document.getElementById('results-icon');

    if (quizStartScreen && quizQuestionScreen && quizResultsScreen && startQuizBtn) {
        let currentQuestionIdx = 0;
        let score = 0;
        let selectedOptionIdx = null;
        let selectedCategory = 'all';
        let activeQuestions = [];
        const QUESTIONS_PER_ROUND = 5;

        // Lógica de seleção de categorias por Pills
        if (categoryPillsContainer) {
            const pills = categoryPillsContainer.querySelectorAll('.quiz-category-pill');
            pills.forEach(pill => {
                pill.addEventListener('click', () => {
                    pills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    selectedCategory = pill.getAttribute('data-category');
                });
            });
        }

        const startQuiz = () => {
            currentQuestionIdx = 0;
            score = 0;
            
            // Filtra as perguntas pela categoria
            let filteredQuestions = [];
            if (selectedCategory === 'all') {
                filteredQuestions = [...QUIZ_BANK];
            } else {
                filteredQuestions = QUIZ_BANK.filter(q => q.category === selectedCategory);
            }

            // Embaralha as perguntas filtradas
            const shuffled = shuffleArray(filteredQuestions);
            
            // Seleciona a quantidade definida por rodada (limita ao tamanho disponível caso seja menor)
            activeQuestions = shuffled.slice(0, Math.min(QUESTIONS_PER_ROUND, shuffled.length));

            quizStartScreen.classList.remove('active');
            quizResultsScreen.classList.remove('active');
            quizQuestionScreen.classList.add('active');
            showQuestion();
        };

        const showQuestion = () => {
            const currentQ = activeQuestions[currentQuestionIdx];
            selectedOptionIdx = null;
            
            feedbackBox.classList.remove('active');
            
            questionNumberText.textContent = `Pergunta ${currentQuestionIdx + 1} de ${activeQuestions.length}`;
            const progressPercent = (currentQuestionIdx / activeQuestions.length) * 100;
            progressFill.style.width = `${progressPercent}%`;
            
            questionText.textContent = currentQ.question;
            optionsContainer.innerHTML = '';
            
            // Embaralha as opções também para evitar posições repetidas
            const optionsWithOriginalIndex = currentQ.options.map((text, idx) => ({ text, idx }));
            const shuffledOptions = shuffleArray(optionsWithOriginalIndex);

            shuffledOptions.forEach((opt, buttonIdx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + buttonIdx)})</span> ${opt.text}`;
                btn.setAttribute('aria-label', `Opção ${String.fromCharCode(65 + buttonIdx)}: ${opt.text}`);
                btn.setAttribute('data-original-index', opt.idx);
                btn.addEventListener('click', () => selectOption(opt.idx, btn));
                optionsContainer.appendChild(btn);
            });
        };

        const selectOption = (optOriginalIndex, clickedBtn) => {
            if (selectedOptionIdx !== null) return;
            
            selectedOptionIdx = optOriginalIndex;
            const currentQ = activeQuestions[currentQuestionIdx];
            const optionBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
            
            const isCorrect = optOriginalIndex === currentQ.correct;
            if (isCorrect) score++;

            // Mapeia os botões para aplicar classes corretas baseadas no atributo data-original-index
            optionBtns.forEach(btn => {
                btn.disabled = true;
                const btnOriginalIdx = parseInt(btn.getAttribute('data-original-index'), 10);
                
                if (btnOriginalIdx === currentQ.correct) {
                    btn.classList.add('correct');
                } else if (btnOriginalIdx === optOriginalIndex && !isCorrect) {
                    btn.classList.add('wrong');
                } else {
                    btn.classList.add('fade-out');
                }
            });

            feedbackBox.classList.add('active');
            if (isCorrect) {
                feedbackTitle.textContent = "Correto! 🎉";
                feedbackIcon.textContent = "✅";
                feedbackExplanation.textContent = currentQ.explanation;
            } else {
                feedbackTitle.textContent = "Não foi dessa vez...";
                feedbackIcon.textContent = "❌";
                feedbackExplanation.textContent = currentQ.explanation;
            }

            const progressPercent = ((currentQuestionIdx + 1) / activeQuestions.length) * 100;
            progressFill.style.width = `${progressPercent}%`;

            if (currentQuestionIdx === activeQuestions.length - 1) {
                nextQuestionBtn.textContent = "Ver Resultado";
            } else {
                nextQuestionBtn.textContent = "Próxima Pergunta";
            }
        };

        const handleNext = () => {
            if (currentQuestionIdx === activeQuestions.length - 1) {
                showResults();
            } else {
                currentQuestionIdx++;
                showQuestion();
            }
        };

        const showResults = () => {
            quizQuestionScreen.classList.remove('active');
            quizResultsScreen.classList.add('active');
            
            // Traduz a categoria para texto amigável
            let categoryName = "Aleatório (Geral)";
            if (selectedCategory !== 'all') {
                const matchedQ = QUIZ_BANK.find(q => q.category === selectedCategory);
                if (matchedQ) categoryName = matchedQ.categoryName;
            }
            if (resultCategoryElement) {
                resultCategoryElement.textContent = categoryName;
            }

            scoreText.textContent = `${score}/${activeQuestions.length}`;
            
            // Limpa o badge anterior
            if (badgeContainer) badgeContainer.innerHTML = '';

            if (score === activeQuestions.length) {
                resultsTitle.textContent = "Cidadão Digital Nota 10! 🏆";
                resultsDescription.textContent = "Excelente! Você demonstrou domínio pleno de segurança na rede, criação de senhas robustas, identificação de fake news e empatia nas relações online. Continue agindo assim e ensinando seus colegas!";
                
                if (resultsIcon) resultsIcon.style.display = 'none';

                // Cria o Badge Animado de Vitória Total
                if (badgeContainer) {
                    badgeContainer.style.display = 'block';
                    badgeContainer.innerHTML = `
                        <div class="quiz-master-badge-wrapper">
                            <div class="quiz-master-badge">
                                <span class="badge-star">🏅</span>
                                <span class="badge-label">Mestre Digital</span>
                            </div>
                            <div class="badge-sparkles">⭐✨🎯✨⭐</div>
                        </div>
                    `;
                }
            } else {
                if (resultsIcon) resultsIcon.style.display = 'block';
                if (badgeContainer) badgeContainer.style.display = 'none';

                if (score >= 3) {
                    resultsTitle.textContent = "Bom trabalho! Cidadão em Evolução 🌟";
                    resultsDescription.textContent = "Você compreende os princípios básicos da segurança e ética digital, mas ainda restam alguns detalhes para polir. Continue navegando pelo portal para fixar o aprendizado!";
                } else {
                    resultsTitle.textContent = "Que tal aprender mais? 📚";
                    resultsDescription.textContent = "Cidadania e segurança digital são essenciais hoje em dia. Recomendamos ler com carinho os materiais curriculares do portal para reforçar os conceitos de comportamento e privacidade online.";
                }
            }
        };

        startQuizBtn.addEventListener('click', startQuiz);
        nextQuestionBtn.addEventListener('click', handleNext);
        restartQuizBtn.addEventListener('click', startQuiz);
    }


    // ==========================================
    // BOTÃO "COPIAR LINK" NOS BIMESTRES
    // ==========================================

    // Cria o toast global uma única vez
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Link copiado!</span>`;
    document.body.appendChild(toast);

    let toastTimer = null;

    const showToast = () => {
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Fallback para browsers mais antigos
            const el = document.createElement('textarea');
            el.value = text;
            el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
    };

    // ==========================================
    // DATASET DE DETALHES DE MATERIAIS
    // ==========================================
    const MATERIAL_DATA = {
        // Planejamentos Anuais
        'planejamento-1-1': {
            subtitle: '1º Bimestre - Planejamento',
            category: 'desplugada',
            badgeText: '#Desplugada',
            title: 'Algoritmos Desplugados e Direções',
            description: 'Introdução lúdica ao conceito de sequenciamento de passos lógicos e controle direcional. Os alunos atuam corporalmente no papel de "robôs" e "programadores" para atravessar circuitos físicos.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Pensamento Computacional (EF01CO01), Lógica de Sequências Espaciais.',
            objectives: [
                'Compreender noções direcionais básicas (frente, trás, esquerda, direita).',
                'Escrever e executar sequências simples de passos lógicos para atingir um alvo.',
                'Identificar e depurar (corrigir) erros em sequências corporais.'
            ],
            url: 'https://docs.google.com/document/d/1Yap9AJU2w4FlBpXHMqNaRo4miaqiYMAX/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1Yap9AJU2w4FlBpXHMqNaRo4miaqiYMAX/preview'
        },
        'planejamento-1-2': {
            subtitle: '2º Bimestre - Planejamento',
            category: 'desplugada',
            badgeText: '#Desplugada',
            title: 'Pensamento Computacional e Lógica',
            description: 'Exploração de padrões visuais, decomposição de tarefas cotidianas e lógica de sequenciamento por meio de brincadeiras e cartões de atividades desplugadas.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Pensamento Computacional (EF01CO02), Reconhecimento de Padrões.',
            objectives: [
                'Identificar padrões geométricos e de cores simples.',
                'Dividir uma tarefa diária (como escovar os dentes) em pequenas etapas ordenadas.',
                'Criar e seguir instruções passo a passo usando cartões visuais.'
            ],
            url: 'https://docs.google.com/document/d/1xrtDpPec3h6yzkN8uqB-TX6gZMGlA6Xo/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1xrtDpPec3h6yzkN8uqB-TX6gZMGlA6Xo/preview'
        },
        'planejamento-2-1': {
            subtitle: '1º Bimestre - Planejamento',
            category: 'desplugada',
            badgeText: '#Desplugada',
            title: 'Segurança Online e Senhas Fortes',
            description: 'Noções básicas de proteção no espaço digital. Atividades desplugadas focadas na construção lógica de senhas fortes, conceitos de privacidade e cuidado ao compartilhar informações.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Cidadania Digital (EF02CO02), Segurança da Informação.',
            objectives: [
                'Compreender o conceito de senha e por que ela deve ser secreta.',
                'Aprender regras básicas para construir senhas seguras (letras, números e símbolos).',
                'Identificar que tipo de dados são pessoais e não devem ser divulgados online.'
            ],
            url: 'https://docs.google.com/document/d/1kMJxrP_-snqlOaO3NiIUPd0WyFiGIv23/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1kMJxrP_-snqlOaO3NiIUPd0WyFiGIv23/preview'
        },
        'planejamento-2-2': {
            subtitle: '2º Bimestre - Planejamento',
            category: 'cidadania',
            badgeText: '#Cidadania',
            title: 'Cidadania Digital e Cyberbullying',
            description: 'Foco na empatia digital, comunicação respeitosa no ambiente online e noções fundamentais de direitos e deveres em redes e plataformas de interação.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Cultura Digital / Empatia (EF02CO03), Resolução de Conflitos.',
            objectives: [
                'Refletir sobre o impacto das palavras usadas em conversas digitais.',
                'Diferenciar interações saudáveis de comportamentos hostis (cyberbullying).',
                'Saber a quem recorrer (professores/pais) em caso de desconforto online.'
            ],
            url: 'https://docs.google.com/document/d/1a8Kyf0DlwlfVISwTOat0YMhsqdd5dNNb/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1a8Kyf0DlwlfVISwTOat0YMhsqdd5dNNb/preview'
        },
        'planejamento-3-1': {
            subtitle: '1º Bimestre - Planejamento',
            category: 'desplugada',
            badgeText: '#Desplugada',
            title: 'Algoritmos e Jogos Desplugados',
            description: 'Aprofundamento em lógica e tomada de decisões condicionais ("SE/SENÃO"). Os alunos exercitam algoritmos através de regras de tabuleiro e jogos de cartas desplugados.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Algoritmos (EF03CO01), Estruturas Condicionais.',
            objectives: [
                'Formular tomadas de decisão lógicas usando "Se... Então... Senão...".',
                'Resolver fluxos complexos em tabuleiros físicos.',
                'Documentar e otimizar passos lógicos para resolver uma tarefa em menos etapas.'
            ],
            url: 'https://docs.google.com/document/d/15mv2PLWIofSjykP1Htj5tALmpmhcOfIr/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/15mv2PLWIofSjykP1Htj5tALmpmhcOfIr/preview'
        },
        'planejamento-3-2': {
            subtitle: '2º Bimestre - Planejamento',
            category: 'scratch',
            badgeText: '#Scratch',
            title: 'Histórias Interativas no Scratch',
            description: 'Primeiros passos na programação por blocos no Scratch. Criação de animações dialógicas, controle de cenários e movimentos de personagens usando lógica de programação básica.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Programação Criativa (EF03CO02), Linguagem de Blocos.',
            objectives: [
                'Familiarizar-se com a área de trabalho do Scratch (palco, blocos, atores).',
                'Utilizar blocos de movimento, fala e eventos (ex: "quando clicar na bandeira verde").',
                'Sincronizar diálogos entre dois ou mais personagens usando blocos de tempo.'
            ],
            url: 'https://docs.google.com/document/d/1w4AdxPuXF0QpY_iKUUCXLCt9DG7YeriX/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1w4AdxPuXF0QpY_iKUUCXLCt9DG7YeriX/preview'
        },
        'planejamento-4-1': {
            subtitle: '1º Bimestre - Planejamento',
            category: 'cidadania',
            badgeText: '#Cidadania',
            title: 'Combate a Fake News e Desinformação',
            description: 'Capacitação para leitura crítica de mídias digitais. O foco está no reconhecimento de boatos, verificação de fontes jornalísticas e entendimento de como conteúdos falsos se espalham online.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Cultura Digital / Leitura Crítica (EF04LP15), Análise de Fontes.',
            objectives: [
                'Diferenciar fatos de boatos ou opiniões pessoais em notícias online.',
                'Aplicar regras básicas de checagem (autor, data, outros sites de busca).',
                'Compreender o papel e o impacto negativo da desinformação na sociedade.'
            ],
            url: 'https://docs.google.com/document/d/1Gb1KxdgwZmd1afpzB70JcXEpoXv5Bx0o/edit?usp=drive_link&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1Gb1KxdgwZmd1afpzB70JcXEpoXv5Bx0o/preview'
        },
        'planejamento-4-2': {
            subtitle: '2º Bimestre - Planejamento',
            category: 'scratch',
            badgeText: '#Scratch',
            title: 'Jogos Educativos no Scratch',
            description: 'Criação de projetos gamificados de lógica no Scratch. Introdução a estruturas lógicas mais complexas como variáveis de pontuação e loops infinitos de checagem.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Lógica de Programação (EF04CO02), Gamificação.',
            objectives: [
                'Entender e aplicar o conceito de variáveis para armazenar dados (como pontos).',
                'Programar loops condicionados a eventos (ex: "repita até encostar na borda").',
                'Conceber mecânicas básicas de jogo (colisão, pontuação e condições de fim).'
            ],
            url: 'https://docs.google.com/document/d/1rBlNC-1iRzlSdaqTOtt0GmbqDF15ADy9/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1rBlNC-1iRzlSdaqTOtt0GmbqDF15ADy9/preview'
        },
        'planejamento-5-1': {
            subtitle: '1º Bimestre - Planejamento',
            category: 'robotica',
            badgeText: '#Robótica',
            title: 'Robótica Prática com Sucata',
            description: 'Introdução à cultura Maker. Os estudantes planejam, desenham e montam protótipos mecânicos usando papelão e sucata para exercitar engenharia de papel e design de produto.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Cultura Maker (EF05CO03), Engenharia Básica.',
            objectives: [
                'Planejar e desenhar em papel o esboço tridimensional de um robô.',
                'Utilizar e reaproveitar materiais recicláveis com segurança.',
                'Construir mecanismos articulados (como garras ou dobradiças) com papelão.'
            ],
            url: 'https://docs.google.com/document/d/1nTNyjvjkbR6pbNYuNhHkC8eOeBxWJ1lD/edit?usp=drive_link&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1nTNyjvjkbR6pbNYuNhHkC8eOeBxWJ1lD/preview'
        },
        'planejamento-5-2': {
            subtitle: '2º Bimestre - Planejamento',
            category: 'robotica',
            badgeText: '#Robótica',
            title: 'Automação com Sensores e Motores',
            description: 'Modelagem teórica e física de sistemas automotivos simples. Estudo de como circuitos recebem estimulação através de sensores e geram reações físicas com atuadores e motores.',
            duration: '4 aulas (50 min cada)',
            skills: 'Computação - Robótica e Automação (EF05CO04), Lógica Computacional.',
            objectives: [
                'Diferenciar componentes de entrada (sensores) e saída (atuadores/motores).',
                'Simular e mapear fluxogramas de automação simples (ex: semáforo de trânsito).',
                'Compreender a aplicação prática de sistemas automatizados no dia a dia da cidade.'
            ],
            url: 'https://docs.google.com/document/d/1BMmrFi28vyWUC65kh-j58yoiVsb8KHDi/edit?usp=sharing&ouid=105490380319692087161&rtpof=true&sd=true',
            previewUrl: 'https://docs.google.com/document/d/1BMmrFi28vyWUC65kh-j58yoiVsb8KHDi/preview'
        },

        // Atividades Práticas (Pastas do Drive)
        'atividade-2-1': {
            subtitle: '1º Bimestre - Atividade Prática',
            category: 'desplugada',
            badgeText: '#Desplugada',
            title: 'Pixel Art no Papel Quadriculado',
            description: 'Atividade lúdica desplugada para demonstrar como imagens digitais são codificadas e representadas em computadores por meio de matrizes bidimensionais e conjuntos binários simples.',
            duration: '2 aulas (50 min cada)',
            skills: 'Pensamento Computacional, Representação de Imagens e Dados.',
            objectives: [
                'Entender a menor unidade de uma imagem digital (o pixel).',
                'Decodificar códigos binários simples em representações de cores em grade quadriculada.',
                'Criar e criptografar o próprio desenho em código para que um colega decifre.'
            ],
            url: 'https://drive.google.com/drive/folders/13jyFSO2ewcOAF9jYGLYEx6xRvGRF7o9-?usp=sharing',
            previewUrl: null
        },
        'atividade-2-2': {
            subtitle: '2º Bimestre - Atividade Prática',
            category: 'cidadania',
            badgeText: '#Cidadania',
            title: 'Jogo da Chave e Senhas Seguras',
            description: 'Jogo interativo desplugado com foco em demonstrar como robôs e invasores tentam adivinhar senhas fáceis por força bruta, ensinando técnicas de criação de senhas fortes.',
            duration: '2 aulas (50 min cada)',
            skills: 'Segurança Digital, Autenticação de Usuário.',
            objectives: [
                'Reconhecer a importância lógica de senhas pessoais intransferíveis.',
                'Utilizar o método dos cartões chave para criar combinações criptográficas fortes.',
                'Entender o perigo do uso de informações comuns (datas de nascimento, nomes) em senhas.'
            ],
            url: 'https://drive.google.com/drive/folders/1CV-1vJXkLfrxWSs2emvJjs8a-3c6PE8z?usp=sharing',
            previewUrl: null
        },
        'atividade-3-2': {
            subtitle: '2º Bimestre - Atividade Prática',
            category: 'scratch',
            badgeText: '#Scratch',
            title: 'Siga o Algoritmo e Movimentos',
            description: 'Atividade prática em laboratório de informática focada na programação livre de trajetos. Os alunos desenham rotas e utilizam a programação em blocos para guiar personagens.',
            duration: '2 aulas (50 min cada)',
            skills: 'Programação de Jogos, Algoritmos Direcionais.',
            objectives: [
                'Programar trajetos lineares e curvos no Scratch usando repetições.',
                'Aplicar coordenadas simples e limites de tela.',
                'Depurar percursos com erros de posicionamento ou ângulo.'
            ],
            url: 'https://drive.google.com/drive/folders/1pUjVDb9GyJIEaTaZ4IY-m807ApamEYsC?usp=sharing',
            previewUrl: null
        },
        'atividade-4-1': {
            subtitle: '1º Bimestre - Atividade Prática',
            category: 'cidadania',
            badgeText: '#Cidadania',
            title: 'Verificador de Notícias e Fatos',
            description: 'Dinâmica escolar que simula uma agência de checagem. Os alunos analisam notícias reais e fake news aplicando um checklist detalhado de validação de fontes e veracidade.',
            duration: '3 aulas (50 min cada)',
            skills: 'Mídia-Educação, Análise Crítica e Cidadania Digital.',
            objectives: [
                'Identificar os principais tipos de boatos na web (manchetes sensacionalistas, imagens alteradas).',
                'Aprender a buscar fontes e datas originais no buscador.',
                'Elaborar um relatório escolar classificando a veracidade de uma informação estudada.'
            ],
            url: 'https://drive.google.com/drive/folders/1E7nrhcV8AxaS92d0HS0wiNNvfwL8x1sn?usp=drive_link',
            previewUrl: null
        },
        'atividade-5-1': {
            subtitle: '1º Bimestre - Atividade Prática',
            category: 'robotica',
            badgeText: '#Robótica',
            title: 'Semáforo Inteligente com Sucata',
            description: 'Construção física de maquete de cruzamento urbano utilizando papelão, LEDs e fios para simular o comportamento elétrico e de temporização de semáforos reais.',
            duration: '3 aulas (50 min cada)',
            skills: 'Cultura Maker, Pensamento de Engenharia Mecânica.',
            objectives: [
                'Construir conexões físicas simples (ligar LEDs à bateria com chaves).',
                'Simular e discutir a lógica de tempo necessária para evitar colisões.',
                'Trabalhar de forma cooperativa na construção e decoração da maquete.'
            ],
            url: 'https://drive.google.com/drive/folders/1srF9D3WW-WsWEH5WrDUspiAinBfjEE2_?usp=drive_link',
            previewUrl: null
        },
        'atividade-5-2': {
            subtitle: '2º Bimestre - Atividade Prática',
            category: 'robotica',
            badgeText: '#Robótica',
            title: 'Robô Segue-Linha Desplugado',
            description: 'Atividade desplugada com foco em ilustrar como sensores industriais e robôs móveis operam em fábricas seguindo marcações pintadas ou faixas refletivas no chão.',
            duration: '3 aulas (50 min cada)',
            skills: 'Lógica Industrial, Introdução a Controle e Sensores.',
            objectives: [
                'Escrever as regras lógicas de direção baseadas no que o robô "enxerga" (ex: "Se enxergar preto, vire à esquerda").',
                'Simular em grupo pistas complexas com bifurcações e retornos.',
                'Compreender de maneira prática loops de controle lógico com realimentação instantânea.'
            ],
            url: 'https://drive.google.com/drive/folders/1FZdietHnQiuzco7l2zmHGzMXC4NZ6tKB?usp=sharing',
            previewUrl: null
        }
    };

    // Elementos do Modal de Materiais
    const materialModal = document.getElementById('material-modal');
    const materialModalClose = document.getElementById('material-modal-close');
    const mSubtitle = document.getElementById('material-modal-subtitle');
    const mBadge = document.getElementById('material-modal-badge');
    const mTitle = document.getElementById('material-modal-title');
    const mDescription = document.getElementById('material-modal-description');
    const mDuration = document.getElementById('material-modal-duration');
    const mSkills = document.getElementById('material-modal-skills');
    const mObjectivesList = document.getElementById('material-modal-objectives-list');
    const mAccessBtn = document.getElementById('material-modal-access-btn');
    const mPdfBtn = document.getElementById('material-modal-pdf-btn');
    const mCopyBtn = document.getElementById('material-modal-copy-btn');
    const mPreviewContainer = document.getElementById('material-modal-preview-container');

    let currentMaterialUrl = '';

    // Gera URL de exportação PDF a partir de uma URL Google Docs
    const getGoogleDocPdfUrl = (url) => {
        try {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match) return `https://docs.google.com/document/d/${match[1]}/export?format=pdf`;
        } catch (e) {}
        return null;
    };

    // Abre o modal de material e popula os dados
    const openMaterialModal = (id) => {
        const data = MATERIAL_DATA[id];
        if (!data) return;

        currentMaterialUrl = data.url;

        // Limpa e popula dados de texto
        mSubtitle.textContent = data.subtitle;
        mTitle.textContent = data.title;
        mDescription.textContent = data.description;
        mDuration.textContent = data.duration;
        mSkills.textContent = data.skills;

        // Configura a tag de categoria
        mBadge.textContent = data.badgeText;
        mBadge.className = `category-badge badge-${data.category}`;

        // Popula os objetivos
        mObjectivesList.innerHTML = '';
        data.objectives.forEach(obj => {
            const li = document.createElement('li');
            li.textContent = obj;
            mObjectivesList.appendChild(li);
        });

        // Configura o botão de acesso e de cópia
        mAccessBtn.setAttribute('href', data.url);
        mCopyBtn.setAttribute('data-url', data.url);

        // Configura o botão de PDF (apenas para Google Docs, não para pastas Drive)
        if (mPdfBtn) {
            const pdfUrl = data.previewUrl ? getGoogleDocPdfUrl(data.url) : null;
            if (pdfUrl) {
                mPdfBtn.setAttribute('href', pdfUrl);
                mPdfBtn.style.display = '';
            } else {
                mPdfBtn.style.display = 'none';
            }
        }

        // Prepara a visualização (Iframe vs Placeholder de Pasta)
        mPreviewContainer.innerHTML = '';
        if (data.previewUrl) {
            // Se for Google Doc, exibe o Iframe de visualização
            const iframe = document.createElement('iframe');
            iframe.className = 'material-modal-iframe';
            iframe.src = data.previewUrl;
            iframe.title = `Pré-visualização de ${data.title}`;
            iframe.setAttribute('loading', 'lazy');
            mPreviewContainer.appendChild(iframe);
        } else {
            // Se for pasta do Drive, exibe o placeholder estilizado
            const placeholder = document.createElement('div');
            placeholder.className = 'folder-preview-placeholder';
            placeholder.innerHTML = `
                <div class="folder-preview-icon">📂</div>
                <p><strong>Pasta de Recursos no Google Drive</strong></p>
                <p>Esta atividade prática inclui materiais complementares como matrizes para impressão, slides explicativos e arquivos de suporte.</p>
                <a href="${data.url}" class="btn-material-action" target="_blank" rel="noopener noreferrer" style="margin-top:0.5rem; display:inline-flex; align-items:center; gap:4px;">
                    Abrir no Google Drive
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            `;
            mPreviewContainer.appendChild(placeholder);
        }

        // Abre o modal de fato
        materialModal.classList.add('active');
        materialModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Evita scroll do body
    };

    // Fecha o modal de material
    const closeMaterialModal = () => {
        materialModal.classList.remove('active');
        materialModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restaura scroll
        
        // Destrói o iframe para economizar memória e parar carregamento
        mPreviewContainer.innerHTML = '';
    };

    // Vincula clique do botão abrir modal
    document.querySelectorAll('.btn-open-material').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-material-id');
            openMaterialModal(id);
        });
    });

    // Eventos de fechamento do modal
    if (materialModalClose) {
        materialModalClose.addEventListener('click', closeMaterialModal);
    }

    // Fecha ao clicar fora do container (no backdrop overlay)
    materialModal.addEventListener('click', (e) => {
        if (e.target === materialModal) {
            closeMaterialModal();
        }
    });

    // Fecha ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && materialModal.classList.contains('active')) {
            closeMaterialModal();
        }
    });

    // Lógica do botão de cópia dentro do modal
    if (mCopyBtn) {
        mCopyBtn.addEventListener('click', async () => {
            await copyToClipboard(currentMaterialUrl);
            
            mCopyBtn.classList.add('copied');
            mCopyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>`;

            showToast();

            setTimeout(() => {
                mCopyBtn.classList.remove('copied');
                mCopyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>`;
            }, 2000);
        });
    // Inicialização da Barra de Progresso dos Accordions (Materiais)
    const initAccordionProgress = () => {
        const accordions = document.querySelectorAll('#planejamentos .accordion-item');
        accordions.forEach(accordion => {
            const header = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');
            if (!header || !content) return;

            const cards = content.querySelectorAll('.material-card');
            const total = cards.length;
            if (total === 0) return;

            const active = Array.from(cards).filter(card => !card.classList.contains('disabled')).length;
            const percentage = (active / total) * 100;

            // Cria o container do progresso
            const progressWrapper = document.createElement('div');
            progressWrapper.className = 'accordion-progress-wrapper';
            progressWrapper.innerHTML = `
                <span class="accordion-progress-text">${active}/${total} disponíveis</span>
                <div class="accordion-progress-bar">
                    <div class="accordion-progress-fill" style="width: ${percentage}%;"></div>
                </div>
            `;

            // Insere o progresso antes do chevron
            const chevron = header.querySelector('.accordion-chevron');
            if (chevron) {
                header.insertBefore(progressWrapper, chevron);
            } else {
                header.appendChild(progressWrapper);
            }
        });
    };

    initAccordionProgress();
});
