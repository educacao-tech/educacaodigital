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
            link.addEventListener('click', () => {
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

                // If it's already animating, ignore click
                if (accordion.dataset.animating) return;

                // Close other open accordions
                accordions.forEach(otherAccordion => {
                    if (otherAccordion !== accordion && otherAccordion.open) {
                        const otherContent = otherAccordion.querySelector('.accordion-content');
                        otherAccordion.dataset.animating = true;
                        
                        // Fix: Define altura em px antes de zerar para garantir animação suave
                        otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
                        setTimeout(() => {
                            otherContent.style.maxHeight = '0px';
                        }, 10);

                        otherContent.addEventListener('transitionend', () => {
                            otherAccordion.removeAttribute('open');
                            delete otherAccordion.dataset.animating;
                        }, { once: true });
                    }
                });

                // Toggle the clicked accordion
                if (accordion.open) {
                    accordion.dataset.animating = true;
                    
                    // Fix: Define altura em px antes de zerar para garantir animação suave
                    content.style.maxHeight = content.scrollHeight + 'px';
                    setTimeout(() => {
                        content.style.maxHeight = '0px';
                    }, 10);

                    content.addEventListener('transitionend', () => {
                        accordion.removeAttribute('open');
                        delete accordion.dataset.animating;
                    }, { once: true });
                } else {
                    accordion.dataset.animating = true;
                    accordion.setAttribute('open', '');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.addEventListener('transitionend', () => {
                        // Allows content to resize if window changes
                        content.style.maxHeight = 'auto';
                        delete accordion.dataset.animating;
                    }, { once: true });
                }
            });
        });
    }

    // Ativa/Desativa botões de bimestre e gerencia ícones automaticamente
    const bimestreButtons = document.querySelectorAll('.btn-bimestre');
    if (bimestreButtons.length > 0) {
        bimestreButtons.forEach(button => {
            const link = button.getAttribute('href');
            const hasLink = link && link.trim() !== '#';

            if (hasLink) {
                // Botão ativo: remove 'disabled' e garante o ícone de download
                button.classList.remove('disabled');
                button.setAttribute('target', '_blank');
                button.setAttribute('rel', 'noopener noreferrer');
                if (!button.querySelector('svg')) {
                    const iconSVG = ` <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
                    button.insertAdjacentHTML('beforeend', iconSVG);
                }
            } else {
                // Botão inativo: adiciona 'disabled' e remove qualquer ícone
                button.classList.add('disabled');
                const icon = button.querySelector('svg');
                if (icon) icon.remove();
            }
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

    if (sections.length > 0 && navLinksItems.length > 0) {
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

                    // Adiciona a classe 'active' ao link correspondente
                    const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
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
    }

});
