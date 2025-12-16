// Fichier: script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Définition des Instruments et de leurs Indicateurs ---
    const INSTRUMENTS = {
        'fonds-euros': {
            label: 'Fonds Euros',
            sri: 1,
            rendement: 2.5,
            volatilite: 0.5
        },
        'etf-tech-us': {
            label: 'ETF Action Tech US',
            sri: 5,
            rendement: 10.0,
            volatilite: 15.0
        },
        'opc-europe': {
            label: 'OPC Actions Europe',
            sri: 4,
            rendement: 7.0,
            volatilite: 12.0
        },
        'opc-oblig-monde': {
            label: 'OPC Obligation Monde',
            sri: 3,
            rendement: 5.0,
            volatilite: 6.0
        },
        'etf-monetaire': {
            label: 'ETF Obligation Monétaire',
            sri: 2,
            rendement: 3.0,
            volatilite: 1.0
        },
        'fonds-immo': {
            label: 'Fonds Immobilier',
            sri: 3,
            rendement: 6.0,
            volatilite: 4.0
        }
    };

    const ucIds = Object.keys(INSTRUMENTS).filter(id => id !== 'fonds-euros');
    const allIds = Object.keys(INSTRUMENTS);
    const sliders = ucIds.map(id => document.getElementById(`slider-${id}`));

    // DOM Elements pour l'affichage des résultats
    const percentFondsEurosSpan = document.getElementById('percent-fonds-euros');
    const percentUCTotalSpan = document.getElementById('percent-uc-total');
    const warningDiv = document.getElementById('allocation-sum-warning');

    const resultSri = document.getElementById('result-sri');
    const resultRendement = document.getElementById('result-rendement');
    const resultVolatilite = document.getElementById('result-volatilite');
    const resultDiversification = document.getElementById('result-diversification'); // Nouvel indicateur


    /**
     * Met à jour l'allocation du Fonds Euros et calcule les indicateurs agrégés.
     */
    function updateAllocationAndResults() {
        let totalUC = 0;
        let sriSum = 0;
        let rendementSum = 0;
        let volatiliteSum = 0;
        let activeAssetsCount = 0; // Compteur pour la diversification

        // 1. Calculer la somme totale des UC et les contributions
        const ucAllocations = {};
        
        ucIds.forEach(id => {
            const slider = document.getElementById(`slider-${id}`);
            const span = document.getElementById(`percent-${id}`);
            const p = parseInt(slider.value); // Pourcentage alloué
            
            span.textContent = p;
            totalUC += p;
            ucAllocations[id] = p;

            if (p > 0) {
                activeAssetsCount++; // Compte les UC avec > 0%
            }
        });
        
        // 2. Calculer l'allocation Fonds Euros (variable d'ajustement)
        let fondsEurosAllocation = 0;
        const totalInvestment = 100; // La base de 100%

        if (totalUC <= totalInvestment) {
            fondsEurosAllocation = totalInvestment - totalUC;
            
            // Mise à jour de l'affichage Fonds Euros
            percentFondsEurosSpan.textContent = fondsEurosAllocation;
            percentUCTotalSpan.textContent = totalUC;
            
            if (fondsEurosAllocation > 0) {
                 activeAssetsCount++; // Compte le Fonds Euros s'il a une allocation > 0%
            }

            // Calcul des contributions (UC + Fonds Euros)
            sriSum += fondsEurosAllocation * INSTRUMENTS['fonds-euros'].sri;
            rendementSum += fondsEurosAllocation * INSTRUMENTS['fonds-euros'].rendement;
            volatiliteSum += fondsEurosAllocation * INSTRUMENTS['fonds-euros'].volatilite;
            
            ucIds.forEach(id => {
                sriSum += ucAllocations[id] * INSTRUMENTS[id].sri;
                rendementSum += ucAllocations[id] * INSTRUMENTS[id].rendement;
                volatiliteSum += ucAllocations[id] * INSTRUMENTS[id].volatilite;
            });
            
            // Affichage du message de validation
            warningDiv.classList.remove('over');
            warningDiv.classList.add('valid-message');
            warningDiv.textContent = `Allocation totale : 100% (Dont Fonds Euros : ${fondsEurosAllocation}%). Les indicateurs sont à jour.`;
            
        } else {
            // Cas où le total UC dépasse 100% (le Fonds Euros est à 0)
            fondsEurosAllocation = 0;
            percentFondsEurosSpan.textContent = 0;
            percentUCTotalSpan.textContent = totalUC;
            
            warningDiv.classList.add('over');
            warningDiv.classList.remove('valid-message');
            warningDiv.textContent = `ATTENTION : Le total des UC est ${totalUC}%. L'allocation dépasse 100%. Les résultats sont basés sur ${totalUC}% d'actifs.`;

            // Calcul des contributions (seulement UC)
             ucIds.forEach(id => {
                sriSum += ucAllocations[id] * INSTRUMENTS[id].sri;
                rendementSum += ucAllocations[id] * INSTRUMENTS[id].rendement;
                volatiliteSum += ucAllocations[id] * INSTRUMENTS[id].volatilite;
            });
        }
        
        // 3. Calcul final des agrégats (Moyenne pondérée)
        // Utilisation de 100 comme diviseur, ce qui signifie que si totalUC > 100, les indicateurs seront gonflés,
        // ce qui est un signal visuel de l'erreur d'allocation.
        const effectiveDivisor = (totalUC > totalInvestment) ? totalUC : totalInvestment; 
        
        const sriAggreg = sriSum / effectiveDivisor;
        const rendementAggreg = rendementSum / effectiveDivisor;
        const volatiliteAggreg = volatiliteSum / effectiveDivisor;

        // 4. Afficher les résultats
        resultSri.textContent = Math.round(sriAggreg * 10) / 10;
        resultRendement.textContent = (Math.round(rendementAggreg * 100) / 100).toFixed(2) + '%';
        resultVolatilite.textContent = (Math.round(volatiliteAggreg * 100) / 100).toFixed(2) + '%';
        
        // 5. Afficher la diversification (nombre d'actifs alloués / total des actifs)
        resultDiversification.textContent = `${activeAssetsCount}/${allIds.length}`;
    }

    // Attacher l'écouteur d'événement à chaque slider UC
    sliders.forEach(slider => {
        slider.addEventListener('input', updateAllocationAndResults);
    });

    // Initialisation au chargement de la page
    updateAllocationAndResults();
});