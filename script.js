let pcodeData = {
    towns: [],
    wards: [],
    villageTracts: []
};
let filteredData = [];
const searchInput = document.querySelector('.search-input');
const suggestionsContainer = document.querySelector('.suggestions');
const resultContainer = document.querySelector('.result');
let showMyanmarText = false;
let searchByPcode = false;
let currentDataType = 'towns';

 // Add context message display
const contextMessage = document.createElement('div');
 contextMessage.classList.add('context-message');
 const searchContainer = document.querySelector('.search-container');
  searchContainer.appendChild(contextMessage);


// Search type toggle
const townSearchBtn = document.getElementById('townSearchBtn');
const wardSearchBtn = document.getElementById('wardSearchBtn');
const vtSearchBtn = document.getElementById('vtSearchBtn');
const pcodeSearchBtn = document.getElementById('pcodeSearchBtn');

function setActiveButton(button) {
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    updateContextMessage(); //Update the message
}

function updateContextMessage() {
        if(searchByPcode){
         contextMessage.textContent = `Searching ${currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)} PCodes`;
        contextMessage.classList.add('active');
        }else{
             contextMessage.textContent = ``;
         contextMessage.classList.remove('active');
        }

}


townSearchBtn.addEventListener('click', (e) => {
        setActiveButton(townSearchBtn);
    searchByPcode = false;
    currentDataType = 'towns';
    searchInput.placeholder = 'Search by town name...';
    searchInput.value = '';
        suggestionsContainer.style.display = 'none';

});

wardSearchBtn.addEventListener('click', (e) => {
        setActiveButton(wardSearchBtn);
    searchByPcode = false;
    currentDataType = 'wards';
    searchInput.placeholder = 'Search by ward name...';
    searchInput.value = '';
        suggestionsContainer.style.display = 'none';


});
vtSearchBtn.addEventListener('click', (e) => {
        setActiveButton(vtSearchBtn);
    searchByPcode = false;
    currentDataType = 'villageTracts';
    searchInput.placeholder = 'Search by village tract name...';
    searchInput.value = '';
        suggestionsContainer.style.display = 'none';


});


pcodeSearchBtn.addEventListener('click', () => {
        setActiveButton(pcodeSearchBtn);
    searchByPcode = true;
       updateContextMessage();
    searchInput.placeholder = 'Search by PCode...';
    searchInput.value = '';
    suggestionsContainer.style.display = 'none';

});

function toggleLanguage() {
    showMyanmarText = document.getElementById('mmText').checked;
    if (searchInput.value) {
        const matches = searchPcodes(searchInput.value);
        showSuggestions(matches);
    }
}

function updateFilters() {
    // Initialize filteredData with all data
        filteredData = pcodeData[currentDataType];
}
async function loadCSVData(file, dataType) {
    try {
        const response = await fetch(file);
        const csvText = await response.text();
        Papa.parse(csvText, {
            header: true,
            complete: function(results) {
                pcodeData[dataType] = results.data;
                updateFilters();
                console.log(`CSV data loaded for ${dataType}:`, pcodeData[dataType].length, 'records');
            }
        });
    } catch (error) {
        console.error(`Error loading CSV for ${dataType}:`, error);
    }
}

function searchPcodes(query) {
        query = query.toLowerCase();
        let currentData = pcodeData[currentDataType];
        if (searchByPcode) {
            return currentData.filter(item => {
                let pcode = null;
                    if (currentDataType === 'towns')
                        pcode = item.Town_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;
                    else if (currentDataType === 'wards')
                        pcode = item.Ward_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;
                    else if (currentDataType === 'villageTracts')
                        pcode= item.VT_Pcode || item.Tsp_Pcode || item['District/SAZ_Pcode'] || item.SR_Pcode;

                return pcode?.toLowerCase().includes(query);
                }).slice(0, 10);

        } else {
            return currentData.filter(item => {
            let nameEng = null;
            let nameMMR = null;

                if (currentDataType === 'towns') {
                nameEng = item.Town_Name_Eng;
                nameMMR = item.Town_Name_MMR;
            } else if (currentDataType === 'wards') {
                    nameEng = item.Ward_Name_Eng;
                    nameMMR = item.Ward_Name_MMR;
            } else if (currentDataType === 'villageTracts') {
                    nameEng = item.Village_Tract_Name_Eng;
                    nameMMR = item.Village_Tract_Name_MMR;
            }
            return (
                (nameEng && nameEng.toLowerCase().includes(query)) ||
                (nameMMR && nameMMR.toLowerCase().includes(query))
            );
        }).slice(0, 10);
        }
}
function showSuggestions(matches) {
    suggestionsContainer.innerHTML = '';
        if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';

            let mainText = '';
            let hierarchyText = '';

            if (searchByPcode) {
                if(currentDataType === 'towns')
                    mainText = `${match.Town_Pcode} - ${match.Town_Name_Eng}`;
                else if (currentDataType === 'wards')
                    mainText = `${match.Ward_Pcode} - ${match.Ward_Name_Eng}`;
                else if (currentDataType === 'villageTracts')
                        mainText = `${match.VT_Pcode} - ${match.Village_Tract_Name_Eng}`;

            } else {
                if(currentDataType === 'towns') {
                mainText = showMyanmarText && match.Town_Name_MMR ?
                    `${match.Town_Name_MMR} (${match.Town_Name_Eng})` :
                    match.Town_Name_Eng;
                hierarchyText = `${match.SR_Name_Eng} > ${match['District/SAZ_Name_Eng']} > ${match.Township_Name_Eng}`;

                } else if (currentDataType === 'wards') {
                    mainText = showMyanmarText && match.Ward_Name_MMR ?
                    `${match.Ward_Name_MMR} (${match.Ward_Name_Eng})` :
                    match.Ward_Name_Eng;

                    hierarchyText = `${match.SR_Name_Eng} > ${match['District/SAZ_Name_Eng']} > ${match.Township_Name_Eng}`;

                } else if (currentDataType === 'villageTracts') {
                    mainText = showMyanmarText && match.Village_Tract_Name_MMR ?
                    `${match.Village_Tract_Name_MMR} (${match.Village_Tract_Name_Eng})` :
                    match.Village_Tract_Name_Eng;
                    hierarchyText = `${match.SR_Name_Eng} > ${match['District/SAZ_Name_Eng']} > ${match.Township_Name_Eng}`;
                }

            }

            div.innerHTML = `
                <div class="main-text">${mainText}</div>
                <div class="hierarchy">
                    ${hierarchyText}
                </div>
            `;

            div.addEventListener('click', () => {
                searchInput.value = mainText;
                suggestionsContainer.style.display = 'none';
                showResult(match);
                if (match.Latitude && match.Longitude) {
                    zoomToLocation(match.Latitude, match.Longitude);
                    addSingleMarker(match);
                }
            });
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}
function showResult(match) {
    resultContainer.innerHTML = '';
    let resultContent = '<h2>Location Details</h2><div class="result-grid">';
    if (currentDataType === 'towns') {
            resultContent += `
            <div class="result-item">
                <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town Name (English):</strong><br>${match.Town_Name_Eng || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town Name (Myanmar):</strong><br>${match.Town_Name_MMR || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Town PCode:</strong><br>${match.Town_Pcode || 'N/A'}
            </div>
            <div class="result-item">
                <strong>Coordinates:</strong><br>
                Lat: ${match.Latitude || 'N/A'}, Long: ${match.Longitude || 'N/A'}
            </div>
        `;
    }
    else if (currentDataType === 'wards') {
            resultContent += `
                <div class="result-item">
                    <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
                </div>
                <div class="result-item">
                <strong>Ward Name (English):</strong><br>${match.Ward_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Ward Name (Myanmar):</strong><br>${match.Ward_Name_MMR || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Ward PCode:</strong><br>${match.Ward_Pcode || 'N/A'}
                </div>

            `;
    } else if (currentDataType === 'villageTracts') {
            resultContent += `
                <div class="result-item">
                    <strong>State/Region:</strong><br>${match.SR_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>State/Region PCode:</strong><br>${match.SR_Pcode || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>District/SAZ:</strong><br>${match['District/SAZ_Name_Eng'] || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>District/SAZ PCode:</strong><br>${match['District/SAZ_Pcode'] || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Township:</strong><br>${match.Township_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                <strong>Township PCode:</strong><br>${match.Tsp_Pcode || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Village Tract Name (English):</strong><br>${match.Village_Tract_Name_Eng || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Village Tract Name (Myanmar):</strong><br>${match.Village_Tract_Name_MMR || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Village Tract PCode:</strong><br>${match.VT_Pcode || 'N/A'}
                </div>
            `;
        }

    resultContent += '</div>';
    resultContainer.innerHTML = resultContent;
    resultContainer.style.display = 'block';
}


// Event Listeners
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length >= 2) {
        const matches = searchPcodes(query);
        showSuggestions(matches);
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
        suggestionsContainer.style.display = 'none';
    }
});

loadCSVData('pcode9.5_town_data.csv', 'towns');
loadCSVData('pcode9.5_ward_data.csv', 'wards');
loadCSVData('pcode_9.5_village_tract_data.csv', 'villageTracts');