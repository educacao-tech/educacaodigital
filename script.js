document.addEventListener('DOMContentLoaded', () => {
    
    // Controle do Menu Mobile
    const menuIcon = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        menuIcon.setAttribute('aria-expanded', isExpanded);
        if (isExpanded) {
            menuIcon.setAttribute('aria-label', 'Fechar menu');
        } else {
            menuIcon.setAttribute('aria-label', 'Abrir menu');
        }
    });

    // Fechar o menu mobile ao clicar em um link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
                menuIcon.setAttribute('aria-label', 'Abrir menu');
            }
        });
    });

    // Controle do Formulário de Newsletter
    const form = document.getElementById('form-newsletter');
    const feedbackElement = document.getElementById('newsletter-feedback');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        const emailInput = form.querySelector('input[type="email"]');
        
        if(emailInput.value) {
            // Usar um elemento na página para feedback é melhor para a experiência do usuário do que um alert().
            feedbackElement.textContent = `Obrigado! O e-mail ${emailInput.value} foi cadastrado com sucesso.`;
            emailInput.value = ''; // Limpa o campo
            // Remove a mensagem após alguns segundos
            setTimeout(() => { feedbackElement.textContent = ''; }, 5000);
        }
    });
});
