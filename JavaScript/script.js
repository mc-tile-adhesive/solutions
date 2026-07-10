// Navigation Logic
function nextStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    
    const target = (stepNumber === 'results') ? 'results' : `step-${stepNumber}`;
    const targetElement = document.getElementById(target);
    
    if(targetElement) targetElement.classList.add('active');
    
    // Update progress bar
    const progress = (stepNumber === 'results') ? 100 : (stepNumber / 4) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Filtering Logic
function calculateResult() {
    // 1. Get User Inputs
    const width = parseInt(document.getElementById('tile-width').value) || 0;
    const length = parseInt(document.getElementById('tile-length').value) || 0;
    const area = width * length;
    const thickness = document.getElementById('tile-thickness').value;
    const type = document.getElementById('tile-type').value;
    const color = document.getElementById('tile-color').value;
    const water = document.getElementById('exposure').value;
    const direction = document.getElementById('direction').value;

    // 2. Filter the array (Returning only True/False)
    const matches = adhesives.filter(pro => {
        return area <= pro.otileArea &&
               width <= pro.omaxLength &&
               length <= pro.omaxLength &&
               pro.otileThickness.includes(thickness) &&
               pro.otileType.includes(type) &&
               pro.otileColor.includes(color) &&
               pro.oexposureToWater.includes(water) &&
               pro.odirection.includes(direction);
    });

    // 3. Send the filtered list to the display function
    displayResults(matches);
}

// Display Logic using .map() and .slice()
function displayResults(matches) {
    nextStep('results');
    const container = document.getElementById('match-container');

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="result-card" style="border-color: #ef4444;">
                <p style="color: #ef4444;">No exact match found. Please check your dimensions or contact support.</p>
            </div>`;
        return;
    }

    // Use .slice(0, 2) to get only the first two matches
    // Use .map() to transform those 2 objects into HTML strings
    const htmlContent = matches.slice(0, 2).map((item, index) => {
        // Adding a "Top Choice" badge to the very first item
        const badge = index === 0 ? '<span class="badge" style="color:rgb(0,158,234);>Top Choice</span>' : '';
        
        return `
            <div class="result-card">
                ${badge}
                <h2>${item.oname}</h2>
                <p>Perfectly fits your tile specs!</p>
            </div>
        `;
    }).join(''); // Join turns the array into one clean string

    container.innerHTML = htmlContent;
}
