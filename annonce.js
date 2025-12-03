$(document).ready(function() {
    // Récupérer l'ID de l'annonce depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const annonceId = parseInt(urlParams.get('id'));
    
    // Éléments DOM
    const loadingState = $('#loadingState');
    const annonceContent = $('#annonceContent');
    const annonceNotFound = $('#annonceNotFound');
    
    // Charger l'annonce
    loadAnnonce(annonceId);

    function loadAnnonce(id) {
        if (!id || isNaN(id)) {
            showNotFound();
            return;
        }
        
        $.ajax({
            url: 'data/annonces.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                const annonce = data.annonces.find(a => a.id === id);
                
                if (annonce) {
                    displayAnnonce(annonce);
                } else {
                    showNotFound();
                }
            },
            error: function() {
                showError('Erreur de chargement des données');
            }
        });
    }

    function displayAnnonce(annonce) {
        // Cacher le loading state
        loadingState.hide();
        
        // Formater les données
        const formattedPrice = new Intl.NumberFormat('fr-FR').format(annonce.prix);
        const priceUnit = annonce.statut === 'louer' ? '/mois' : '';
        const dateFormatted = new Date(annonce.date_publication).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Mettre à jour le titre de la page
        document.title = `${annonce.titre} | LukaNdako`;
        
        // Mettre à jour le contenu
        $('#annonceTitle').text(annonce.titre);
        $('#annonceLocation').text(`${annonce.quartier}, ${annonce.ville}`);
        $('#annonceType').text(annonce.type);
        $('#annonceDate').text(`Publiée le ${dateFormatted}`);
        $('#annonceRef').text(`Réf: LKD-${annonce.id.toString().padStart(4, '0')}`);
        $('#annoncePrix').text(`${formattedPrice} F CFA`);
        $('#prixUnite').text(priceUnit);
        $('#annonceDescription').text(annonce.description);
        
        // Badge de statut
        const statutBadge = annonce.statut === 'louer' ? 'À louer' : 'À vendre';
        const badgeColor = annonce.statut === 'louer' ? '#38A169' : '#D69E2E';
        $('#statutBadge').text(statutBadge).css('background', `rgba(${hexToRgb(badgeColor)}, 0.9)`);
        
        // Générer les photos
        generatePhotos(annonce);
        
        // Générer les caractéristiques
        generateFeatures(annonce);
        
        // Générer les équipements s'ils existent
        if (annonce.equipements && annonce.equipements.length > 0) {
            generateEquipments(annonce.equipements);
        }
        
        // Générer les proximités si elles existent
        if (annonce.proximites && annonce.proximites.length > 0) {
            generateProximities(annonce.proximites);
        }
        
        // Configurer l'agent
        setupAgent(annonce);
        
        // Afficher le contenu
        annonceContent.show();
        
        // Initialiser la galerie
        initGallery();
    }

    function generatePhotos(annonce) {
        const thumbnailContainer = $('#thumbnailContainer');
        const photoCount = $('#photoCount');
        thumbnailContainer.empty();
        
        // Utiliser les photos de annonces.json
        if (annonce.photos && annonce.photos.length > 0) {
            // Mettre à jour le compteur
            photoCount.text(annonce.photos.length);
            
            // Définir la première image comme principale
            $('#mainImage').attr('src', annonce.photos[0]).attr('alt', annonce.titre);
            
            // Générer les thumbnails
            annonce.photos.forEach((photoUrl, index) => {
                const isActive = index === 0 ? 'active' : '';
                
                thumbnailContainer.append(`
                    <div class="thumbnail ${isActive}" data-index="${index}">
                        <img src="${photoUrl}" alt="Photo ${index + 1} de ${annonce.titre}">
                        ${index === annonce.photos.length - 1 ? `<div class="thumbnail-count">+${annonce.photos.length}</div>` : ''}
                    </div>
                `);
            });
        } else {
            // Aucune photo disponible
            photoCount.text('0');
            $('#mainImage').attr('src', 'https://via.placeholder.com/1200x800/2A4365/FFFFFF?text=Aucune+photo+disponible')
                          .attr('alt', 'Aucune photo disponible');
            
            thumbnailContainer.html(`
                <div class="no-photos-message">
                    <i class="fas fa-camera-slash"></i>
                    <p>Aucune photo disponible pour cette annonce</p>
                </div>
            `);
        }
    }

    function generateFeatures(annonce) {
        const featuresGrid = $('#featuresGrid');
        featuresGrid.empty();
        
        // Caractéristiques de base toujours présentes
        const baseFeatures = [
            { icon: 'fas fa-bed', value: annonce.chambres, label: 'Chambres' },
            { icon: 'fas fa-expand-arrows-alt', value: annonce.surface, label: 'm²' },
            { icon: 'fas fa-home', value: annonce.type, label: 'Type' },
            { icon: 'fas fa-city', value: annonce.ville, label: 'Ville' },
            { icon: 'fas fa-map-marker-alt', value: annonce.quartier, label: 'Quartier' },
            { icon: annonce.statut === 'louer' ? 'fas fa-key' : 'fas fa-tag', 
              value: annonce.statut === 'louer' ? 'À louer' : 'À vendre', 
              label: 'Statut' }
        ];
        
        // Ajouter les caractéristiques supplémentaires si elles existent
        if (annonce.salles_bain) {
            baseFeatures.splice(2, 0, { 
                icon: 'fas fa-bath', 
                value: annonce.salles_bain, 
                label: 'Salles de bain' 
            });
        }
        
        if (annonce.etage !== undefined) {
            baseFeatures.push({ 
                icon: 'fas fa-building', 
                value: annonce.etage, 
                label: 'Étage' 
            });
        }
        
        if (annonce.parking !== undefined) {
            baseFeatures.push({ 
                icon: 'fas fa-car', 
                value: annonce.parking, 
                label: 'Parking' 
            });
        }
        
        if (annonce.annee_construction) {
            baseFeatures.push({ 
                icon: 'fas fa-calendar-alt', 
                value: annonce.annee_construction, 
                label: 'Année' 
            });
        }
        
        // Générer les cartes de caractéristiques
        baseFeatures.forEach(feature => {
            featuresGrid.append(`
                <div class="feature-item">
                    <i class="${feature.icon}"></i>
                    <div>
                        <span class="feature-value">${feature.value}</span>
                        <span class="feature-label">${feature.label}</span>
                    </div>
                </div>
            `);
        });
    }

    function generateEquipments(equipements) {
        const equipmentSection = $('#equipmentSection');
        const equipmentList = $('#equipmentList');
        
        equipmentList.empty();
        
        equipements.forEach(equipment => {
            equipmentList.append(`
                <div class="equipment-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${equipment}</span>
                </div>
            `);
        });
        
        // Afficher la section
        equipmentSection.show();
    }

    function generateProximities(proximites) {
        const proximitySection = $('#proximitySection');
        const proximityList = $('#proximityList');
        
        proximityList.empty();
        
        proximites.forEach(proximite => {
            proximityList.append(`
                <div class="equipment-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${proximite}</span>
                </div>
            `);
        });
        
        // Afficher la section
        proximitySection.show();
    }

    function setupAgent(annonce) {
        // Données d'agents basées sur la ville
        const agents = {
            'Kinshasa': {
                name: 'Jean Kabila',
                title: 'Conseiller Immobilier Senior - Kinshasa',
                phone: '+243 81 345 6789',
                email: 'jean.kabila@lukan.com'
            },
            'Lubumbashi': {
                name: 'Marie Lubemba',
                title: 'Conseillère Immobilière - Lubumbashi',
                phone: '+243 81 456 7890',
                email: 'marie.lubemba@lukan.com'
            },
            'Matadi': {
                name: 'Paul Matadi',
                title: 'Conseiller Immobilier - Matadi',
                phone: '+243 81 567 8901',
                email: 'paul.matadi@lukan.com'
            }
        };
        
        // Sélectionner l'agent basé sur la ville, ou un agent par défaut
        const agent = agents[annonce.ville] || {
            name: 'David Excellence',
            title: 'Conseiller Immobilier Principal',
            phone: '+243 81 234 5678',
            email: 'david.excellence@lukan.com'
        };
        
        $('#agentName').text(agent.name);
        $('#agentTitle').text(agent.title);
        $('#agentPhone').text(agent.phone);
        $('#agentEmail').text(agent.email);
    }

    function initGallery() {
        // Changement d'image principale au clic sur les thumbnails
        $(document).on('click', '.thumbnail', function() {
            const index = $(this).data('index');
            
            $('.thumbnail').removeClass('active');
            $(this).addClass('active');
            
            // Mettre à jour l'image principale avec l'image cliquée
            const newImageUrl = $(this).find('img').attr('src');
            $('#mainImage').attr('src', newImageUrl);
        });
        
        // Clic sur l'image principale pour agrandir
        $('#mainImage').click(function() {
            const currentSrc = $(this).attr('src');
            if (currentSrc && !currentSrc.includes('placeholder.com')) {
                window.open(currentSrc, '_blank');
            }
        });
    }

    function showNotFound() {
        loadingState.hide();
        annonceNotFound.show();
    }

    function showError(message) {
        loadingState.html(`
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-sync"></i> Réessayer
                </button>
            </div>
        `);
    }

    // Fonction utilitaire pour convertir hex en rgb
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
            : '66, 153, 225';
    }

    // Ajout de styles pour la page annonce
    $('<style>').text(`
        .error-message {
            text-align: center;
            padding: 4rem;
        }
        .error-message i {
            font-size: 4rem;
            color: var(--danger);
            margin-bottom: 1.5rem;
        }
        .error-message h3 {
            font-size: 1.8rem;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }
        .error-message p {
            color: var(--gray-600);
            margin-bottom: 2rem;
        }
        .no-photos-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: var(--gray-500);
        }
        .no-photos-message i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .retry-btn {
            padding: 0.75rem 1.5rem;
            background: var(--primary);
            border: none;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
    `).appendTo('head');
});