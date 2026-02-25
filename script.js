document.addEventListener('DOMContentLoaded', () => {
    
    // Controle do Menu Mobile
    const menuIcon = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Controle do Formulário de Newsletter
    const form = document.getElementById('form-newsletter');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        const emailInput = form.querySelector('input[type="email"]');
        
        if(emailInput.value) {
            alert(`Obrigado! O e-mail ${emailInput.value} foi cadastrado com sucesso.`);
            emailInput.value = ''; // Limpa o campo
        }
    });
});
