$(document).ready(function() {
    // Initialisation
    initAuth();

    function initAuth() {
        setupFormSwitching();
        setupPasswordToggle();
        setupPasswordStrength();
        setupFormValidation();
        setupSocialButtons();
        setupForgotPassword();
    }

    // Switching entre connexion et inscription
    function setupFormSwitching() {
        const loginTab = $('.auth-tab[data-form="login"]');
        const registerTab = $('.auth-tab[data-form="register"]');
        const loginForm = $('#loginForm');
        const registerForm = $('#registerForm');
        const switchLink = $('.switch-link');
        const switchText = $('#switchText');

        // Clic sur les onglets
        loginTab.click(function() {
            switchToLogin();
        });

        registerTab.click(function() {
            switchToRegister();
        });

        // Clic sur le lien de switching
        switchLink.click(function(e) {
            e.preventDefault();
            const target = $(this).data('target');
            
            if (target === 'register') {
                switchToRegister();
            } else {
                switchToLogin();
            }
        });

        function switchToLogin() {
            loginTab.addClass('active');
            registerTab.removeClass('active');
            loginForm.addClass('active');
            registerForm.removeClass('active');
            switchText.html('Vous n\'avez pas de compte ? <a href="#" class="switch-link" data-target="register">Inscrivez-vous</a>');
            clearMessages();
            clearFormErrors();
        }

        function switchToRegister() {
            registerTab.addClass('active');
            loginTab.removeClass('active');
            registerForm.addClass('active');
            loginForm.removeClass('active');
            switchText.html('Vous avez déjà un compte ? <a href="#" class="switch-link" data-target="login">Connectez-vous</a>');
            clearMessages();
            clearFormErrors();
        }
    }

    // Toggle visibilité mot de passe
    function setupPasswordToggle() {
        $(document).on('click', '.toggle-password', function() {
            const targetId = $(this).data('target');
            const input = $('#' + targetId);
            const icon = $(this).find('i');
            
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });
    }

    // Force du mot de passe
    function setupPasswordStrength() {
        $('#registerPassword').on('input', function() {
            const password = $(this).val();
            const strengthBar = $('#passwordStrength');
            const strengthText = $('#strengthText');
            
            let strength = 0;
            let text = 'Faible';
            let className = 'weak';
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            switch(strength) {
                case 0:
                case 1:
                    text = 'Faible';
                    className = 'weak';
                    break;
                case 2:
                case 3:
                    text = 'Moyen';
                    className = 'medium';
                    break;
                case 4:
                    text = 'Fort';
                    className = 'strong';
                    break;
            }
            
            strengthBar.removeClass('weak medium strong').addClass(className);
            strengthText.text(text);
        });
    }

    // Validation des formulaires
    function setupFormValidation() {
        // Connexion
        $('#loginForm').submit(function(e) {
            e.preventDefault();
            if (validateLoginForm()) {
                submitLoginForm();
            }
        });

        // Inscription
        $('#registerForm').submit(function(e) {
            e.preventDefault();
            if (validateRegisterForm()) {
                submitRegisterForm();
            }
        });
    }

    function validateLoginForm() {
        let isValid = true;
        clearFormErrors();

        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val().trim();

        // Validation email
        if (!email) {
            $('#loginEmailError').text('L\'email est requis');
            $('#loginEmail').addClass('error');
            isValid = false;
        } else if (!isValidEmail(email)) {
            $('#loginEmailError').text('Veuillez entrer un email valide');
            $('#loginEmail').addClass('error');
            isValid = false;
        }

        // Validation mot de passe
        if (!password) {
            $('#loginPasswordError').text('Le mot de passe est requis');
            $('#loginPassword').addClass('error');
            isValid = false;
        } else if (password.length < 6) {
            $('#loginPasswordError').text('Le mot de passe doit contenir au moins 6 caractères');
            $('#loginPassword').addClass('error');
            isValid = false;
        }

        return isValid;
    }

    function validateRegisterForm() {
        let isValid = true;
        clearFormErrors();

        const firstName = $('#registerFirstName').val().trim();
        const lastName = $('#registerLastName').val().trim();
        const email = $('#registerEmail').val().trim();
        const phone = $('#registerPhone').val().trim();
        const password = $('#registerPassword').val().trim();
        const confirmPassword = $('#registerConfirmPassword').val().trim();
        const acceptTerms = $('#acceptTerms').is(':checked');

        // Validation prénom
        if (!firstName) {
            $('#registerFirstNameError').text('Le prénom est requis');
            $('#registerFirstName').addClass('error');
            isValid = false;
        }

        // Validation nom
        if (!lastName) {
            $('#registerLastNameError').text('Le nom est requis');
            $('#registerLastName').addClass('error');
            isValid = false;
        }

        // Validation email
        if (!email) {
            $('#registerEmailError').text('L\'email est requis');
            $('#registerEmail').addClass('error');
            isValid = false;
        } else if (!isValidEmail(email)) {
            $('#registerEmailError').text('Veuillez entrer un email valide');
            $('#registerEmail').addClass('error');
            isValid = false;
        }

        // Validation téléphone
        if (!phone) {
            $('#registerPhoneError').text('Le téléphone est requis');
            $('#registerPhone').addClass('error');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            $('#registerPhoneError').text('Veuillez entrer un numéro valide');
            $('#registerPhone').addClass('error');
            isValid = false;
        }

        // Validation mot de passe
        if (!password) {
            $('#registerPasswordError').text('Le mot de passe est requis');
            $('#registerPassword').addClass('error');
            isValid = false;
        } else if (password.length < 8) {
            $('#registerPasswordError').text('Le mot de passe doit contenir au moins 8 caractères');
            $('#registerPassword').addClass('error');
            isValid = false;
        } else if (!isStrongPassword(password)) {
            $('#registerPasswordError').text('Le mot de passe doit contenir des majuscules, minuscules et chiffres');
            $('#registerPassword').addClass('error');
            isValid = false;
        }

        // Validation confirmation mot de passe
        if (!confirmPassword) {
            $('#registerConfirmPasswordError').text('Veuillez confirmer le mot de passe');
            $('#registerConfirmPassword').addClass('error');
            isValid = false;
        } else if (password !== confirmPassword) {
            $('#registerConfirmPasswordError').text('Les mots de passe ne correspondent pas');
            $('#registerConfirmPassword').addClass('error');
            isValid = false;
        }

        // Validation conditions
        if (!acceptTerms) {
            $('#termsError').text('Vous devez accepter les conditions d\'utilisation');
            isValid = false;
        }

        return isValid;
    }

    function submitLoginForm() {
        const submitBtn = $('#loginForm .auth-submit-btn');
        const spinner = $('#loginSpinner');
        
        // Désactiver le bouton et montrer le spinner
        submitBtn.prop('disabled', true);
        spinner.show();
        
        // Préparer les données
        const formData = {
            email: $('#loginEmail').val().trim(),
            password: $('#loginPassword').val().trim(),
            remember_me: $('#rememberMe').is(':checked')
        };
        
        // Simuler l'envoi AJAX (à remplacer par votre API)
        setTimeout(() => {
            // Exemple de requête AJAX (décommentez et adaptez l'URL)
            /*
            $.ajax({
                url: 'https://votre-api.com/login',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                    showSuccess('Connexion réussie ! Redirection...');
                    // Stocker le token si nécessaire
                    localStorage.setItem('token', response.token);
                    // Redirection vers la page d'accueil
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                },
                error: function(xhr) {
                    const error = xhr.responseJSON ? xhr.responseJSON.message : 'Erreur de connexion';
                    showError(error);
                },
                complete: function() {
                    submitBtn.prop('disabled', false);
                    spinner.hide();
                }
            });
            */
            
            // Simulation de réussite (à supprimer en production)
            showSuccess('Connexion réussie ! Redirection...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
            submitBtn.prop('disabled', false);
            spinner.hide();
        }, 1500);
    }

    function submitRegisterForm() {
        const submitBtn = $('#registerForm .auth-submit-btn');
        const spinner = $('#registerSpinner');
        
        // Désactiver le bouton et montrer le spinner
        submitBtn.prop('disabled', true);
        spinner.show();
        
        // Préparer les données
        const formData = {
            first_name: $('#registerFirstName').val().trim(),
            last_name: $('#registerLastName').val().trim(),
            email: $('#registerEmail').val().trim(),
            phone: $('#registerPhone').val().trim(),
            password: $('#registerPassword').val().trim(),
            confirm_password: $('#registerConfirmPassword').val().trim(),
            accept_terms: $('#acceptTerms').is(':checked')
        };
        
        // Simuler l'envoi AJAX (à remplacer par votre API)
        setTimeout(() => {
            // Exemple de requête AJAX (décommentez et adaptez l'URL)
            /*
            $.ajax({
                url: 'https://votre-api.com/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                    showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    // Basculer vers le formulaire de connexion
                    setTimeout(() => {
                        $('.auth-tab[data-form="login"]').click();
                    }, 2000);
                },
                error: function(xhr) {
                    const error = xhr.responseJSON ? xhr.responseJSON.message : 'Erreur d\'inscription';
                    showError(error);
                },
                complete: function() {
                    submitBtn.prop('disabled', false);
                    spinner.hide();
                }
            });
            */
            
            // Simulation de réussite (à supprimer en production)
            showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            setTimeout(() => {
                $('.auth-tab[data-form="login"]').click();
                $('#loginEmail').val(formData.email);
            }, 2000);
            
            submitBtn.prop('disabled', false);
            spinner.hide();
        }, 1500);
    }

    // Boutons sociaux
    function setupSocialButtons() {
        $('.social-btn.google').click(function() {
            alert('Connexion avec Google - À implémenter avec votre API');
        });
        
        $('.social-btn.facebook').click(function() {
            alert('Connexion avec Facebook - À implémenter avec votre API');
        });
    }

    // Mot de passe oublié
    function setupForgotPassword() {
        $('.forgot-password').click(function(e) {
            e.preventDefault();
            const email = prompt('Veuillez entrer votre adresse email pour réinitialiser votre mot de passe:');
            
            if (email && isValidEmail(email)) {
                // Simuler l'envoi de l'email
                setTimeout(() => {
                    alert('Un email de réinitialisation a été envoyé à ' + email);
                }, 500);
            } else if (email) {
                alert('Veuillez entrer un email valide');
            }
        });
    }

    // Fonctions utilitaires
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        // Validation basique pour les numéros congolais
        const re = /^\+?[0-9\s\-\(\)]{8,20}$/;
        return re.test(phone);
    }

    function isStrongPassword(password) {
        // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    function showError(message) {
        clearMessages();
        $('#errorText').text(message);
        $('#errorMessage').fadeIn(300);
        
        // Cacher après 5 secondes
        setTimeout(() => {
            $('#errorMessage').fadeOut(300);
        }, 5000);
    }

    function showSuccess(message) {
        clearMessages();
        $('#successText').text(message);
        $('#successMessage').fadeIn(300);
        
        // Cacher après 5 secondes
        setTimeout(() => {
            $('#successMessage').fadeOut(300);
        }, 5000);
    }

    function clearMessages() {
        $('#errorMessage').fadeOut(300);
        $('#successMessage').fadeOut(300);
    }

    function clearFormErrors() {
        $('.form-error').text('');
        $('.form-group input').removeClass('error');
    }
});


/*

// Remplacez les simulations par :
$.ajax({
    url: 'https://votre-api.com/login', // Votre endpoint
    type: 'POST',
    contentType: 'application/json',
    headers: {
        'Authorization': 'Bearer votre-token-si-necessaire'
    },
    data: JSON.stringify(formData),
    success: function(response) {
        // Gestion de la réponse
    },
    error: function(xhr) {
        // Gestion des erreurs
    }
});

*/