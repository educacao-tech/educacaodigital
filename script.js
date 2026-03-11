document.addEventListener('DOMContentLoaded', () => {
    
    // Controle do Menu Mobile
    const menuIcon = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            menuIcon.setAttribute('aria-expanded', isExpanded);
            menuIcon.setAttribute('aria-label', isExpanded ? 'Fechar menu' : 'Abrir menu');
        });

        // Fechar o menu mobile ao clicar em um link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuIcon.setAttribute('aria-expanded', 'false');
                    menuIcon.setAttribute('aria-label', 'Abrir menu');
                }
            });
        });
    }

    // Controle do Formulário de Newsletter
    const form = document.getElementById('form-newsletter');
    
    if (form) {
        const feedbackElement = document.getElementById('newsletter-feedback');
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o recarregamento da página
            const emailInput = form.querySelector('input[type="email"]');
            
            if(emailInput && emailInput.value && feedbackElement) {
                feedbackElement.textContent = `Obrigado! O e-mail ${emailInput.value} foi cadastrado com sucesso.`;
                emailInput.value = ''; // Limpa o campo
                setTimeout(() => { feedbackElement.textContent = ''; }, 5000);
            }
        });
    }

    // Controle do Acordeão (para abrir um por vez)
    const accordions = document.querySelectorAll('.accordion-item');
    if (accordions.length > 0) {
        accordions.forEach(accordion => {
            accordion.addEventListener('toggle', () => {
                if (accordion.open) {
                    accordions.forEach(otherAccordion => {
                        if (otherAccordion !== accordion) {
                            otherAccordion.open = false;
                        }
                    });
                }
            });
        });
    }

    // Atualização dinâmica do ano no rodapé
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Rolagem suave explícita para links âncora (mais robusto em iframes)
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previne o comportamento padrão do link

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Rola a visão até o elemento alvo de forma suave
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Controle do Botão "Voltar ao Topo"
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Mostra o botão após rolar 300px
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
    }

    // Animação de entrada para os cards ao rolar a página
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
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

        cards.forEach(card => {
            observer.observe(card);
        });
    }

});
