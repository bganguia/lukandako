// Configuration du menu utilisateur
function setupUserMenu() {
    const userMenu = $('#userMenu');
    const userDropdown = $('#userDropdown');
    
    // Toggle du menu au clic
    userMenu.click(function(e) {
        e.stopPropagation();
        userMenu.toggleClass('active');
        userDropdown.toggleClass('show');
    });
    
    // Fermer le menu en cliquant ailleurs
    $(document).click(function(e) {
        if (!$(e.target).closest('#userMenu, #userDropdown').length) {
            userMenu.removeClass('active');
            userDropdown.removeClass('show');
        }
    });
    
    // Actions des options du menu
    $('#mySpace').click(function(e) {
        e.preventDefault();
        alert('Ouverture de "Mon espace" - Cette fonctionnalité sera implémentée prochainement.');
        userMenu.removeClass('active');
        userDropdown.removeClass('show');
    });
    
    $('#buyPoints').click(function(e) {
        e.preventDefault();
        alert('Achat de points - Cette fonctionnalité sera implémentée prochainement.');
        userMenu.removeClass('active');
        userDropdown.removeClass('show');
    });
    
    $('#logout').click(function(e) {
        e.preventDefault();
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            alert('Déconnexion réussie - Redirection vers la page de connexion.');
            // Ici vous pourriez rediriger vers une page de login
            // window.location.href = 'login.html';
        }
        userMenu.removeClass('active');
        userDropdown.removeClass('show');
    });
    
    // Fermer le menu avec la touche Échap
    $(document).keydown(function(e) {
        if (e.key === 'Escape') {
            userMenu.removeClass('active');
            userDropdown.removeClass('show');
        }
    });
}

$(document).ready(function() {
    // Variables globales
    let allAnnonces = [];
    let filteredAnnonces = [];
    let uniqueVilles = new Set();
    let uniqueQuartiers = new Set();
    let uniqueTypes = new Set();

    // Initialisation
    init();

    function init() {
    loadAnnonces();
    setupEventListeners();
    setupSearchTabs();
    setupUserMenu(); // NEW LIGNE
}

    // Chargement des annonces
    function loadAnnonces() {
        $.ajax({
            url: 'data/annonces.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                allAnnonces = data.annonces;
                processAnnoncesData();
                displayAnnonces(allAnnonces);
                populateFilters();
                updateStats();
            },
            error: function(xhr, status, error) {
                console.error('Erreur lors du chargement des annonces:', error);
                showError('Impossible de charger les propriétés. Veuillez réessayer.');
            }
        });
    }

    // Traitement des données
    function processAnnoncesData() {
        allAnnonces.forEach(annonce => {
            uniqueVilles.add(annonce.ville);
            uniqueQuartiers.add(annonce.quartier);
            uniqueTypes.add(annonce.type);
        });
    }

    // Peuplement des filtres
    function populateFilters() {
        // Remplir le filtre des villes
        const villeFilter = $('#villeFilter');
        uniqueVilles.forEach(ville => {
            villeFilter.append(`<option value="${ville}">${ville}</option>`);
        });

        // Remplir le filtre des quartiers
        const quartierFilter = $('#quartierFilter');
        uniqueQuartiers.forEach(quartier => {
            quartierFilter.append(`<option value="${quartier}">${quartier}</option>`);
        });

        // Remplir le filtre des types
        const typeFilter = $('#typeFilter');
        uniqueTypes.forEach(type => {
            typeFilter.append(`<option value="${type}">${type}</option>`);
        });
    }

    // Configuration des onglets de recherche
    function setupSearchTabs() {
        $('.search-tab').click(function() {
            $('.search-tab').removeClass('active');
            $(this).addClass('active');
            
            const statut = $(this).data('type');
            $('input[name="statut"]').val([statut]);
            applyFilters();
        });
    }

    // Configuration des écouteurs d'événements

function setupEventListeners() {
    // Recherche en temps réel avec debounce
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    // Filtres principaux
    $('#villeFilter, #quartierFilter, #typeFilter, #chambresFilter, #sortSelect').change(applyFilters);
    
    // Filtres de plage avec debounce
    let rangeTimeout;
    $('#prixMin, #prixMax, #surfaceMin, #surfaceMax').on('input', function() {
        clearTimeout(rangeTimeout);
        rangeTimeout = setTimeout(applyFilters, 500);
    });

    // Bouton de recherche principale
    $('.search-btn').click(applyFilters);

    // Réinitialisation des filtres
    $('#resetFilters').click(function() {
        resetFilters();
    });

    // Gestion du bouton "Plus de filtres"
    $('.more-filters-btn').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const filters = $('.search-filters');
        const icon = $(this).find('i');
        const button = $(this);
        
        if (filters.is(':visible')) {
            // Fermer les filtres
            filters.slideUp(300, function() {
                button.removeClass('active');
            });
            icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            // Ouvrir les filtres
            filters.slideDown(300, function() {
                button.addClass('active');
            });
            icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    });

    // Dans setupEventListeners(), ajoutez ceci après la gestion des filtres
    $('#villeFilter, #quartierFilter, #typeFilter, #chambresFilter, #sortSelect, #prixMin, #prixMax, #surfaceMin, #surfaceMax').on('click', function() {
        $('#userMenu').removeClass('active');
        $('#userDropdown').removeClass('show');
    });

    // Boutons "Voir détails" des cartes featured
    $(document).on('click', '.view-btn', function() {
        const annonceId = $(this).data('id');
        window.location.href = `annonce.html?id=${annonceId}`;
    });
}

    // Application des filtres
    function applyFilters() {
        let filtered = [...allAnnonces];

        // Filtre de recherche texte
        const searchTerm = $('#searchInput').val().toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(annonce => 
                annonce.titre.toLowerCase().includes(searchTerm) ||
                annonce.description.toLowerCase().includes(searchTerm) ||
                annonce.ville.toLowerCase().includes(searchTerm) ||
                annonce.quartier.toLowerCase().includes(searchTerm) ||
                annonce.type.toLowerCase().includes(searchTerm)
            );
        }

        // Filtre par ville
        const selectedVille = $('#villeFilter').val();
        if (selectedVille) {
            filtered = filtered.filter(annonce => annonce.ville === selectedVille);
        }

        // Filtre par quartier
        const selectedQuartier = $('#quartierFilter').val();
        if (selectedQuartier) {
            filtered = filtered.filter(annonce => annonce.quartier === selectedQuartier);
        }

        // Filtre par type
        const selectedType = $('#typeFilter').val();
        if (selectedType) {
            filtered = filtered.filter(annonce => annonce.type === selectedType);
        }

        // Filtre par statut (via onglet)
        const activeTab = $('.search-tab.active').data('type');
        if (activeTab) {
            filtered = filtered.filter(annonce => annonce.statut === activeTab);
        }

        // Filtre par prix
        const prixMax = parseInt($('#prixMax').val()) || Infinity;
        filtered = filtered.filter(annonce => annonce.prix <= prixMax);

        // Filtre par surface
        const surfaceMin = parseInt($('#surfaceMin').val()) || 0;
        filtered = filtered.filter(annonce => annonce.surface >= surfaceMin);

        // Filtre par chambres
        const minChambres = parseInt($('#chambresFilter').val()) || 0;
        if (minChambres > 0) {
            filtered = filtered.filter(annonce => annonce.chambres >= minChambres);
        }

        // Tri
        const sortOption = $('#sortSelect').val();
        filtered.sort((a, b) => {
            switch(sortOption) {
                case 'prix_asc':
                    return a.prix - b.prix;
                case 'prix_desc':
                    return b.prix - a.prix;
                case 'surface_desc':
                    return b.surface - a.surface;
                case 'date_desc':
                default:
                    return new Date(b.date_publication) - new Date(a.date_publication);
            }
        });

        filteredAnnonces = filtered;
        displayAnnonces(filtered);
        updateStats();
    }

    // Affichage des annonces
    function displayAnnonces(annonces) {
        const container = $('#annoncesContainer');
        const noResults = $('#noResults');

        if (annonces.length === 0) {
            container.hide();
            noResults.show();
            return;
        }

        noResults.hide();
        container.show();

        // Générer le HTML des annonces
        let html = '';
        annonces.forEach(annonce => {
            html += createAnnonceCard(annonce);
        });

        container.html(html);
        
        // Animation d'entrée
        $('.annonce-card').hide().fadeIn(400);
    }

    // Création d'une carte d'annonce
    // Création d'une carte d'annonce (MISE À JOUR FINALE)
function createAnnonceCard(annonce) {
    const statutClass = annonce.statut === 'louer' ? 'statut-louer' : 'statut-vendre';
    const statutText = annonce.statut === 'louer' ? 'À louer' : 'À vendre';
    const priceUnit = annonce.statut === 'louer' ? '/mois' : '';
    
    // Formater le prix
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(annonce.prix);
    
    // Utiliser la première photo de annonces.json ou une image par défaut
    const mainImage = annonce.photos && annonce.photos.length > 0 
        ? annonce.photos[0] 
        : 'https://via.placeholder.com/600x400/2A4365/FFFFFF?text=LukaNdako';
    
    // Compter le nombre de photos
    const imageCount = annonce.photos ? annonce.photos.length : 0;
    
    return `
        <div class="annonce-card" data-id="${annonce.id}">
            <div class="annonce-image">
                <img src="${mainImage}" alt="${annonce.titre}">
                <div class="annonce-badge">
                    <!--<i class="fas fa-star"></i>--> Premium
                </div>
                ${imageCount > 0 ? `
                    <div class="image-count">
                        <i class="fas fa-camera"></i> ${imageCount}
                    </div>
                ` : ''}
            </div>
            <div class="annonce-content">
                <div class="annonce-header">
                    <h3 class="annonce-title">${annonce.titre}</h3>
                    <div class="annonce-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${annonce.quartier}, ${annonce.ville}
                    </div>
                </div>
                
                <p class="annonce-description">${annonce.description.substring(0, 150)}...</p>
                
                <div class="annonce-details">
                    <div class="detail-item">
                        <span class="detail-value">${annonce.chambres}</span>
                        <span class="detail-label">Chambres</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-value">${annonce.surface}</span>
                        <span class="detail-label">m²</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-value">${annonce.type}</span>
                        <span class="detail-label">Type</span>
                    </div>
                </div>
                
                <div class="annonce-footer">
                    <div class="annonce-price">
                        ${formattedPrice} F CFA<span>${priceUnit}</span>
                    </div>
                    <div class="annonce-actions">
                        <span class="annonce-statut ${statutClass}">
                            ${statutText}
                        </span>
                        <button class="view-annonce-btn" data-id="${annonce.id}">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

    // Réinitialisation des filtres
    function resetFilters() {
        $('#searchInput').val('');
        $('#villeFilter').val('');
        $('#quartierFilter').val('');
        $('#typeFilter').val('');
        $('#chambresFilter').val('0');
        $('#surfaceMin').val('');
        $('#prixMax').val('');
        $('#sortSelect').val('date_desc');
        
        $('.search-tab').removeClass('active');
        $('.search-tab[data-type="louer"]').addClass('active');
        
        displayAnnonces(allAnnonces);
        updateStats();
        
        // Animation de confirmation
        $('#resetFilters').html('<i class="fas fa-check"></i> Filtres réinitialisés');
        setTimeout(() => {
            $('#resetFilters').html('<i class="fas fa-redo"></i> Réinitialiser');
        }, 2000);
    }

    // Mise à jour des statistiques
    function updateStats() {
        $('#totalAnnonces').text(filteredAnnonces.length || allAnnonces.length);
    }

    // Affichage des erreurs
    function showError(message) {
        const container = $('#annoncesContainer');
        container.html(`
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de chargement</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-sync"></i> Réessayer
                </button>
            </div>
        `);
    }

    // Ajout de styles pour les erreurs
    $('<style>').text(`
        .error-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem;
        }
        .error-state i {
            font-size: 4rem;
            color: var(--danger);
            margin-bottom: 1.5rem;
        }
        .error-state h3 {
            font-size: 1.8rem;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }
        .error-state p {
            color: var(--gray-600);
            margin-bottom: 2rem;
        }
        .retry-btn {
            padding: 1rem 2rem;
            background: var(--danger);
            border: none;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
        }
        .retry-btn:hover {
            background: #C53030;
            transform: translateY(-2px);
        }
    `).appendTo('head');
});

$(document).ready(function() {
    // Variables globales
    let allAnnonces = [];
    let filteredAnnonces = [];
    let uniqueVilles = new Set();
    let uniqueQuartiers = new Set();
    let uniqueTypes = new Set();

    // Initialisation
    init();

    function init() {
        loadAnnonces();
        setupEventListeners();
        setupSearchTabs();
    }

    // Chargement des annonces
    function loadAnnonces() {
        $.ajax({
            url: 'data/annonces.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                allAnnonces = data.annonces;
                processAnnoncesData();
                displayAnnonces(allAnnonces);
                populateFilters();
                updateStats();
            },
            error: function(xhr, status, error) {
                console.error('Erreur lors du chargement des annonces:', error);
                showError('Impossible de charger les propriétés. Veuillez réessayer.');
            }
        });
    }

    // Traitement des données
    function processAnnoncesData() {
        allAnnonces.forEach(annonce => {
            uniqueVilles.add(annonce.ville);
            uniqueQuartiers.add(annonce.quartier);
            uniqueTypes.add(annonce.type);
        });
    }

    // Peuplement des filtres
    function populateFilters() {
        // Remplir le filtre des villes
        const villeFilter = $('#villeFilter');
        uniqueVilles.forEach(ville => {
            villeFilter.append(`<option value="${ville}">${ville}</option>`);
        });

        // Remplir le filtre des quartiers
        const quartierFilter = $('#quartierFilter');
        uniqueQuartiers.forEach(quartier => {
            quartierFilter.append(`<option value="${quartier}">${quartier}</option>`);
        });

        // Remplir le filtre des types
        const typeFilter = $('#typeFilter');
        uniqueTypes.forEach(type => {
            typeFilter.append(`<option value="${type}">${type}</option>`);
        });
    }

    // Configuration des onglets de recherche
    function setupSearchTabs() {
        $('.search-tab').click(function() {
            $('.search-tab').removeClass('active');
            $(this).addClass('active');
            
            const statut = $(this).data('type');
            $('input[name="statut"]').val([statut]);
            applyFilters();
        });
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Recherche en temps réel avec debounce
        let searchTimeout;
        $('#searchInput').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });

        // Filtres
        $('#villeFilter, #quartierFilter, #typeFilter, #chambresFilter, #sortSelect').change(applyFilters);
        
        // Filtres de plage avec debounce
        let rangeTimeout;
        $('#prixMin, #prixMax, #surfaceMin, #surfaceMax').on('input', function() {
            clearTimeout(rangeTimeout);
            rangeTimeout = setTimeout(applyFilters, 500);
        });

        // Bouton de recherche
        $('.search-btn').click(applyFilters);

        // Réinitialisation
        $('#resetFilters').click(function() {
            resetFilters();
        });

        // Plus de filtres
        $('.more-filters-btn').click(function() {
            $('.search-filters').slideToggle(300);
        });

        // Boutons "Voir détails" des cartes featured
        $(document).on('click', '.view-btn', function() {
            const annonceId = $(this).data('id');
            window.location.href = `annonce.html?id=${annonceId}`;
        });
    }

    // Application des filtres
    function applyFilters() {
        let filtered = [...allAnnonces];

        // Filtre de recherche texte
        const searchTerm = $('#searchInput').val().toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(annonce => 
                annonce.titre.toLowerCase().includes(searchTerm) ||
                annonce.description.toLowerCase().includes(searchTerm) ||
                annonce.ville.toLowerCase().includes(searchTerm) ||
                annonce.quartier.toLowerCase().includes(searchTerm) ||
                annonce.type.toLowerCase().includes(searchTerm)
            );
        }

        // Filtre par ville
        const selectedVille = $('#villeFilter').val();
        if (selectedVille) {
            filtered = filtered.filter(annonce => annonce.ville === selectedVille);
        }

        // Filtre par quartier
        const selectedQuartier = $('#quartierFilter').val();
        if (selectedQuartier) {
            filtered = filtered.filter(annonce => annonce.quartier === selectedQuartier);
        }

        // Filtre par type
        const selectedType = $('#typeFilter').val();
        if (selectedType) {
            filtered = filtered.filter(annonce => annonce.type === selectedType);
        }

        // Filtre par statut (via onglet)
        const activeTab = $('.search-tab.active').data('type');
        if (activeTab) {
            filtered = filtered.filter(annonce => annonce.statut === activeTab);
        }

        // Filtre par prix
        const prixMax = parseInt($('#prixMax').val()) || Infinity;
        filtered = filtered.filter(annonce => annonce.prix <= prixMax);

        // Filtre par surface
        const surfaceMin = parseInt($('#surfaceMin').val()) || 0;
        filtered = filtered.filter(annonce => annonce.surface >= surfaceMin);

        // Filtre par chambres
        const minChambres = parseInt($('#chambresFilter').val()) || 0;
        if (minChambres > 0) {
            filtered = filtered.filter(annonce => annonce.chambres >= minChambres);
        }

        // Tri
        const sortOption = $('#sortSelect').val();
        filtered.sort((a, b) => {
            switch(sortOption) {
                case 'prix_asc':
                    return a.prix - b.prix;
                case 'prix_desc':
                    return b.prix - a.prix;
                case 'surface_desc':
                    return b.surface - a.surface;
                case 'date_desc':
                default:
                    return new Date(b.date_publication) - new Date(a.date_publication);
            }
        });

        filteredAnnonces = filtered;
        displayAnnonces(filtered);
        updateStats();
    }

    // Affichage des annonces
    function displayAnnonces(annonces) {
        const container = $('#annoncesContainer');
        const noResults = $('#noResults');

        if (annonces.length === 0) {
            container.hide();
            noResults.show();
            return;
        }

        noResults.hide();
        container.show();

        // Générer le HTML des annonces
        let html = '';
        annonces.forEach(annonce => {
            html += createAnnonceCard(annonce);
        });

        container.html(html);
        
        // Animation d'entrée
        $('.annonce-card').hide().fadeIn(400);
    }

    // Création d'une carte d'annonce (MISE À JOUR AVEC BOUTON)
    function createAnnonceCard(annonce) {
    const statutClass = annonce.statut === 'louer' ? 'statut-louer' : 'statut-vendre';
    const statutText = annonce.statut === 'louer' ? 'À louer' : 'À vendre';
    const priceUnit = annonce.statut === 'louer' ? '/mois' : '';
    
    // Formater le prix
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(annonce.prix);
    
    // Utiliser la première photo de annonces.json ou une image par défaut
    const mainImage = annonce.photos && annonce.photos.length > 0 
        ? annonce.photos[0] 
        : 'https://via.placeholder.com/600x400/2A4365/FFFFFF?text=LukaNdako';
    
    // Compter le nombre de photos
    const imageCount = annonce.photos ? annonce.photos.length : 0;
    
    return `
        <div class="annonce-card" data-id="${annonce.id}">
            <div class="annonce-image">
                <img src="${mainImage}" alt="${annonce.titre}">
                <div class="annonce-badge">
                    <!--<i class="fas fa-star"></i>--> Premium
                </div>
                ${imageCount > 0 ? `
                    <div class="image-count">
                        <i class="fas fa-camera"></i> ${imageCount}
                    </div>
                ` : ''}
            </div>
            <div class="annonce-content">
                <div class="annonce-header">
                    <h3 class="annonce-title">${annonce.titre}</h3>
                    <div class="annonce-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${annonce.quartier}, ${annonce.ville}
                    </div>
                </div>
                
                <p class="annonce-description">${annonce.description.substring(0, 150)}...</p>
                
                <div class="annonce-details">
                    <div class="detail-item">
                        <span class="detail-value">${annonce.chambres}</span>
                        <span class="detail-label">Chambres</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-value">${annonce.surface}</span>
                        <span class="detail-label">m²</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-value">${annonce.type}</span>
                        <span class="detail-label">Type</span>
                    </div>
                </div>
                
                <div class="annonce-footer">
                    <div class="annonce-price">
                        ${formattedPrice} F CFA<span>${priceUnit}</span>
                    </div>
                    <div class="annonce-actions">
                        <span class="annonce-statut ${statutClass}">
                            ${statutText}
                        </span>
                        <button class="view-annonce-btn" data-id="${annonce.id}">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

    // Gestion du clic sur le bouton "Voir"
    $(document).on('click', '.view-annonce-btn', function(e) {
        e.stopPropagation();
        const annonceId = $(this).data('id');
        window.location.href = `annonce.html?id=${annonceId}`;
    });

    // Clic sur la carte entière
    $(document).on('click', '.annonce-card', function(e) {
        if (!$(e.target).closest('.view-annonce-btn').length) {
            const annonceId = $(this).data('id');
            window.location.href = `annonce.html?id=${annonceId}`;
        }
    });

    // Réinitialisation des filtres
    function resetFilters() {
        $('#searchInput').val('');
        $('#villeFilter').val('');
        $('#quartierFilter').val('');
        $('#typeFilter').val('');
        $('#chambresFilter').val('0');
        $('#surfaceMin').val('');
        $('#prixMax').val('');
        $('#sortSelect').val('date_desc');
        
        $('.search-tab').removeClass('active');
        $('.search-tab[data-type="louer"]').addClass('active');
        
        displayAnnonces(allAnnonces);
        updateStats();
        
        // Animation de confirmation
        $('#resetFilters').html('<i class="fas fa-check"></i> Filtres réinitialisés');
        setTimeout(() => {
            $('#resetFilters').html('<i class="fas fa-redo"></i> Réinitialiser');
        }, 2000);
    }

    // Mise à jour des statistiques
    function updateStats() {
        $('#totalAnnonces').text(filteredAnnonces.length || allAnnonces.length);
    }

    // Affichage des erreurs
    function showError(message) {
        const container = $('#annoncesContainer');
        container.html(`
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de chargement</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-sync"></i> Réessayer
                </button>
            </div>
        `);
    }

    // Ajout de styles pour les boutons et images
    $('<style>').text(`
        .annonce-image {
            position: relative;
            height: 240px;
            overflow: hidden;
        }
        
        .annonce-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .annonce-card:hover .annonce-image img {
            transform: scale(1.05);
        }
        
        .image-count {
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .annonce-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .view-annonce-btn {
            padding: 0.5rem 1.5rem;
            background: var(--primary);
            border: none;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .view-annonce-btn:hover {
            background: var(--primary-light);
            transform: translateY(-2px);
        }
        
        .error-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem;
        }
        .error-state i {
            font-size: 4rem;
            color: var(--danger);
            margin-bottom: 1.5rem;
        }
        .error-state h3 {
            font-size: 1.8rem;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }
        .error-state p {
            color: var(--gray-600);
            margin-bottom: 2rem;
        }
        .retry-btn {
            padding: 1rem 2rem;
            background: var(--danger);
            border: none;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
        }
        .retry-btn:hover {
            background: #C53030;
            transform: translateY(-2px);
        }
    `).appendTo('head');
});


// Dans la fonction init() ou setupEventListeners()
function setupResponsiveBehavior() {
    // Sur mobile, garder les filtres fermés par défaut
    if ($(window).width() < 768) {
        $('.search-filters').hide();
    }
    
    // Ajuster sur redimensionnement
    $(window).resize(function() {
        if ($(window).width() >= 768) {
            // Sur desktop, on pourrait laisser ouverts
            // $('.search-filters').show();
        }
    });
}

// Appeler cette fonction dans init()
function init() {
    loadAnnonces();
    setupEventListeners();
    setupSearchTabs();
    setupResponsiveBehavior();  // AJOUTER CETTE LIGNE
}