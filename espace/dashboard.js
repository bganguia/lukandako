$(document).ready(function() {
    // Initialisation du dashboard
    initDashboard();

    function initDashboard() {
        // Simuler le chargement
        setTimeout(() => {
            $('#loadingState').fadeOut(300, function() {
                $('.dashboard-sections').fadeIn(300);
                setupDashboard();
            });
        }, 1000);
    }

    function setupDashboard() {
        setupNavigation();
        setupPublishForm();
        setupAdsList();
        setupPointsSystem();
        setupSettings();
        setupNotifications();
        setupProfile();
        setupTransactions();
    }

    // Navigation entre sections
    function setupNavigation() {
        // Navigation sidebar
        $('.sidebar-item').click(function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            
            // Mettre à jour l'état actif
            $('.sidebar-item').removeClass('active');
            $(this).addClass('active');
            
            // Afficher la section correspondante
            showSection(section);
        });

        // Navigation via les liens dans le contenu
        $('[data-section]').click(function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            
            // Mettre à jour la sidebar
            $('.sidebar-item').removeClass('active');
            $(`.sidebar-item[data-section="${section}"]`).addClass('active');
            
            // Afficher la section
            showSection(section);
        });

        // Déconnexion
        $('.logout').click(function(e) {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                window.location.href = 'index.html';
            }
        });
    }

    function showSection(section) {
        // Cacher toutes les sections
        $('.dashboard-section').removeClass('active');
        
        // Afficher la section demandée
        $(`#${section}Section`).addClass('active');
        
        // Animation
        $('.dashboard-section.active').hide().fadeIn(300);
        
        // Scroll vers le haut
        $('.dashboard-content').animate({ scrollTop: 0 }, 300);
    }

    // Formulaire de publication
    function setupPublishForm() {
        const steps = $('.form-step');
        const stepIndicators = $('.step');
        let currentStep = 1;
        const totalSteps = steps.length;

        // Navigation des étapes
        $('.next-step').click(function() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        });

        $('.prev-step').click(function() {
            goToStep(currentStep - 1);
        });

        function goToStep(step) {
            // Cacher l'étape actuelle
            $(`.form-step[data-step="${currentStep}"]`).removeClass('active');
            $(`.step:nth-child(${currentStep})`).removeClass('active');

            // Afficher la nouvelle étape
            currentStep = step;
            $(`.form-step[data-step="${step}"]`).addClass('active');
            $(`.step:nth-child(${step})`).addClass('active');

            // Mettre à jour les boutons de navigation
            updateNavigationButtons();
            
            // Mettre à jour la confirmation si on est à la dernière étape
            if (step === 4) {
                updateConfirmation();
            }
        }

        function updateNavigationButtons() {
            $('.prev-step').toggle(currentStep > 1);
            $('.next-step').toggle(currentStep < totalSteps);
            $('.submit-form').toggle(currentStep === totalSteps);
        }

        function validateStep(step) {
            let isValid = true;
            
            switch(step) {
                case 1:
                    if (!$('#adTitle').val().trim()) {
                        showFormError('#adTitle', 'Le titre est requis');
                        isValid = false;
                    }
                    if (!$('#adDescription').val().trim()) {
                        showFormError('#adDescription', 'La description est requise');
                        isValid = false;
                    }
                    if (!$('#adType').val()) {
                        showFormError('#adType', 'Le type de bien est requis');
                        isValid = false;
                    }
                    break;
                    
                case 2:
                    if (!$('#adSurface').val() || $('#adSurface').val() <= 0) {
                        showFormError('#adSurface', 'La surface doit être supérieure à 0');
                        isValid = false;
                    }
                    if (!$('#adPrice').val() || $('#adPrice').val() <= 0) {
                        showFormError('#adPrice', 'Le prix doit être supérieur à 0');
                        isValid = false;
                    }
                    break;
                    
                case 3:
                    if (!$('#adCity').val()) {
                        showFormError('#adCity', 'La ville est requise');
                        isValid = false;
                    }
                    if (!$('#adDistrict').val().trim()) {
                        showFormError('#adDistrict', 'Le quartier est requis');
                        isValid = false;
                    }
                    break;
            }
            
            return isValid;
        }

        function showFormError(selector, message) {
            $(selector).addClass('error');
            $(selector).after(`<div class="form-error">${message}</div>`);
            
            // Scroll vers l'erreur
            $('.dashboard-content').animate({
                scrollTop: $(selector).offset().top - 100
            }, 300);
        }

        function updateConfirmation() {
            $('#confirmTitle').text($('#adTitle').val());
            $('#confirmType').text($('#adType').val());
            $('#confirmStatus').text($('#adStatus').val() === 'louer' ? 'À louer' : 'À vendre');
            $('#confirmSurface').text($('#adSurface').val() + ' m²');
            $('#confirmRooms').text($('#adRooms').val() + ' chambres');
            $('#confirmPrice').text($('#adPrice').val() + ' FCFA');
            $('#confirmLocation').text($('#adDistrict').val() + ', ' + $('#adCity').val());
        }

        // Upload d'images
        $('#uploadArea').click(function() {
            $('#imageUpload').click();
        });

        $('#imageUpload').change(function(e) {
            const files = e.target.files;
            const preview = $('#imagePreview');
            preview.empty();
            
            for (let i = 0; i < Math.min(files.length, 10); i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.append(`
                        <div class="preview-item">
                            <img src="${e.target.result}" alt="Preview">
                            <button type="button" class="remove-image">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `);
                };
                
                reader.readAsDataURL(file);
            }
            
            // Supprimer des images
            $(document).on('click', '.remove-image', function() {
                $(this).parent().remove();
            });
        });

        // Drag and drop
        $('#uploadArea').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('dragover');
        });

        $('#uploadArea').on('dragleave', function() {
            $(this).removeClass('dragover');
        });

        $('#uploadArea').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            $('#imageUpload')[0].files = files;
            $('#imageUpload').trigger('change');
        });

        // Soumission du formulaire
        $('#publishForm').submit(function(e) {
            e.preventDefault();
            
            if (!validateStep(4)) return;
            if (!$('#confirmTerms').is(':checked')) {
                alert('Vous devez accepter les conditions');
                return;
            }
            
            // Préparer les données
            const formData = {
                title: $('#adTitle').val(),
                description: $('#adDescription').val(),
                type: $('#adType').val(),
                status: $('#adStatus').val(),
                surface: $('#adSurface').val(),
                rooms: $('#adRooms').val(),
                bathrooms: $('#adBathrooms').val(),
                parking: $('#adParking').val(),
                price: $('#adPrice').val(),
                city: $('#adCity').val(),
                district: $('#adDistrict').val(),
                address: $('#adAddress').val(),
                equipment: $('input[name="equipment"]:checked').map(function() {
                    return $(this).val();
                }).get(),
                images: [] // À implémenter avec l'upload réel
            };
            
            // Simulation d'envoi
            const submitBtn = $('.submit-form');
            const originalText = submitBtn.html();
            
            submitBtn.prop('disabled', true);
            submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Publication en cours...');
            
            setTimeout(() => {
                alert('Annonce publiée avec succès !');
                submitBtn.prop('disabled', false);
                submitBtn.html(originalText);
                
                // Réinitialiser le formulaire
                $('#publishForm')[0].reset();
                $('#imagePreview').empty();
                goToStep(1);
            }, 2000);
        });
    }

    // Gestion des annonces
    function setupAdsList() {
        const adsList = $('#adsList');
        const loading = $('.loading-ads');
        
        // Simulation de chargement
        setTimeout(() => {
            loading.remove();
            
            // Annonces de démonstration
            const ads = [
                {
                    id: 1,
                    title: "Villa de luxe à Bacongo",
                    type: "Villa",
                    status: "active",
                    price: "25,000,000 FCFA",
                    views: 145,
                    date: "15 Jan 2024",
                    expires: "15 Fév 2024"
                },
                {
                    id: 2,
                    title: "Appartement moderne à Moungali",
                    type: "Appartement",
                    status: "active",
                    price: "850,000 FCFA/mois",
                    views: 89,
                    date: "10 Jan 2024",
                    expires: "10 Fév 2024"
                },
                {
                    id: 3,
                    title: "Studio étudiant à Poto-Poto",
                    type: "Studio",
                    status: "expired",
                    price: "55,000 FCFA/mois",
                    views: 67,
                    date: "05 Déc 2023",
                    expires: "05 Jan 2024"
                },
                {
                    id: 4,
                    title: "Terrain constructible à Loandjili",
                    type: "Terrain",
                    status: "pending",
                    price: "6,500,000 FCFA",
                    views: 23,
                    date: "20 Jan 2024",
                    expires: "20 Avr 2024"
                }
            ];
            
            // Afficher les annonces
            ads.forEach(ad => {
                adsList.append(createAdCard(ad));
            });
        }, 1500);
        
        // Filtres
        $('.filter-tab').click(function() {
            $('.filter-tab').removeClass('active');
            $(this).addClass('active');
            
            const filter = $(this).data('filter');
            filterAds(filter);
        });
        
        // Recherche
        $('.filter-search input').on('input', function() {
            const search = $(this).val().toLowerCase();
            filterBySearch(search);
        });
    }
    
    function createAdCard(ad) {
        const statusClass = {
            active: 'success',
            pending: 'warning',
            expired: 'danger',
            inactive: 'secondary'
        }[ad.status];
        
        const statusText = {
            active: 'Active',
            pending: 'En attente',
            expired: 'Expirée',
            inactive: 'Inactive'
        }[ad.status];
        
        return `
            <div class="ad-card" data-status="${ad.status}">
                <div class="ad-image">
                    <i class="fas fa-home"></i>
                </div>
                <div class="ad-content">
                    <div class="ad-header">
                        <h3>${ad.title}</h3>
                        <span class="ad-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="ad-details">
                        <div class="detail">
                            <i class="fas fa-tag"></i>
                            <span>${ad.type}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${ad.price}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-eye"></i>
                            <span>${ad.views} vues</span>
                        </div>
                    </div>
                    <div class="ad-footer">
                        <div class="ad-dates">
                            <div class="date">
                                <i class="fas fa-calendar-plus"></i>
                                <span>Publiée : ${ad.date}</span>
                            </div>
                            <div class="date">
                                <i class="fas fa-calendar-times"></i>
                                <span>Expire : ${ad.expires}</span>
                            </div>
                        </div>
                        <div class="ad-actions">
                            <button class="btn-icon" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" title="Renouveler">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button class="btn-icon danger" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function filterAds(filter) {
        if (filter === 'all') {
            $('.ad-card').show();
        } else {
            $('.ad-card').hide();
            $(`.ad-card[data-status="${filter}"]`).show();
        }
    }
    
    function filterBySearch(search) {
        $('.ad-card').each(function() {
            const title = $(this).find('h3').text().toLowerCase();
            if (title.includes(search)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Système de points
    function setupPointsSystem() {
        // Calcul du prix
        $('#pointsAmount').on('input', function() {
            const points = $(this).val();
            const price = points * 100;
            $('#pointsValue').val(price.toLocaleString());
            
            // Mettre à jour le résumé
            updatePurchaseSummary(points, price);
        });
        
        // Sélection de forfait
        $('.select-package').click(function() {
            const points = $(this).data('points');
            const price = $(this).data('price');
            
            $('#pointsAmount').val(points);
            $('#pointsValue').val(price.toLocaleString());
            
            updatePurchaseSummary(points, price);
            
            // Scroll vers le formulaire d'achat
            showSection('buy-points');
        });
        
        // Méthodes de paiement
        $('.payment-method').click(function() {
            $('.payment-method').removeClass('active');
            $(this).addClass('active');
            $(this).find('input').prop('checked', true);
        });
        
        // Paiement
        $('.purchase-btn').click(function() {
            const points = $('#pointsAmount').val();
            const method = $('input[name="paymentMethod"]:checked').val();
            const phone = $('#phoneNumber').val();
            
            if (!points || points < 10) {
                alert('Veuillez sélectionner au moins 10 points');
                return;
            }
            
            if (!phone) {
                alert('Veuillez entrer votre numéro de téléphone');
                return;
            }
            
            // Simulation de paiement
            const btn = $(this);
            const originalText = btn.html();
            
            btn.prop('disabled', true);
            btn.html('<i class="fas fa-spinner fa-spin"></i> Traitement...');
            
            setTimeout(() => {
                alert(`Paiement de ${points} points (${points * 100} FCFA) effectué avec succès !\nUn SMS de confirmation a été envoyé au ${phone}`);
                btn.prop('disabled', false);
                btn.html(originalText);
                
                // Réinitialiser le formulaire
                $('#phoneNumber').val('');
            }, 2000);
        });
    }
    
    function updatePurchaseSummary(points, price) {
        const currentBalance = 150; // Solde actuel
        const newBalance = currentBalance + parseInt(points);
        
        $('.summary-item:nth-child(1) .summary-value').text(points + ' points');
        $('.summary-item:nth-child(2) .summary-value').text(price.toLocaleString() + ' FCFA');
        $('.summary-item.total .summary-value').text(newBalance + ' points');
    }

    // Paramètres
    function setupSettings() {
        // Navigation des onglets
        $('.settings-tab').click(function() {
            const tab = $(this).data('tab');
            
            $('.settings-tab').removeClass('active');
            $(this).addClass('active');
            
            $('.settings-tab-content').removeClass('active');
            $(`#${tab}Tab`).addClass('active');
        });
        
        // Téléchargement des données
        $('.btn-outline:contains("Télécharger")').click(function() {
            alert('Téléchargement de vos données en cours...\nVous recevrez un email avec le lien de téléchargement.');
        });
        
        // Suppression du compte
        $('.btn-danger:contains("Supprimer")').click(function() {
            if (confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
                alert('Votre demande de suppression a été prise en compte. Un email de confirmation vous a été envoyé.');
            }
        });
    }

    // Notifications
    function setupNotifications() {
        // Filtres
        $('.filter-btn').click(function() {
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');
            
            const filter = $(this).text().toLowerCase();
            filterNotifications(filter);
        });
        
        // Marquer tout comme lu
        $('.mark-all-read').click(function() {
            $('.notification-item').removeClass('unread');
            alert('Toutes les notifications ont été marquées comme lues.');
        });
        
        // Actions sur les notifications
        $(document).on('click', '.action-btn', function() {
            const notification = $(this).closest('.notification-item');
            notification.removeClass('unread');
            
            if ($(this).hasClass('primary')) {
                const action = $(this).attr('title');
                if (action === 'Renouveler') {
                    showSection('my-ads');
                } else if (action === 'Répondre') {
                    alert('Ouverture de la messagerie...');
                }
            }
        });
    }
    
    function filterNotifications(filter) {
        const items = $('.notification-item');
        
        if (filter === 'toutes') {
            items.show();
        } else if (filter === 'non lues') {
            items.hide();
            $('.notification-item.unread').show();
        } else if (filter === 'importantes') {
            items.hide();
            $('.notification-item.important').show();
        }
    }

    // Profil
    function setupProfile() {
        // Upload de photo
        $('.avatar-upload').click(function() {
            alert('Fonctionnalité d\'upload de photo à implémenter');
        });
        
        // Changement de mot de passe
        $('.security-action:contains("Changer le mot de passe")').click(function(e) {
            e.preventDefault();
            const newPassword = prompt('Entrez votre nouveau mot de passe :');
            if (newPassword) {
                alert('Votre mot de passe a été changé avec succès.');
            }
        });
        
        // Sauvegarde du profil
        $('.profile-form').submit(function(e) {
            e.preventDefault();
            alert('Votre profil a été mis à jour avec succès.');
        });
    }

    // Transactions
    function setupTransactions() {
        // Filtres
        $('#periodFilter, #typeFilter').change(function() {
            const period = $('#periodFilter').val();
            const type = $('#typeFilter').val();
            
            // Simulation de filtrage
            $('.transaction-item').each(function() {
                let show = true;
                
                // Filtre par type
                if (type !== 'all') {
                    const itemType = $(this).find('.type-badge').text().toLowerCase();
                    if (!itemType.includes(type)) {
                        show = false;
                    }
                }
                
                $(this).toggle(show);
            });
        });
    }
});