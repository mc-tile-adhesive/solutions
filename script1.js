        // GLOBAL APP STATE
        let currentStep = 1;
        const totalSteps = 6;
        let runCount = 1;

        // Stores run memory
        let run1Result = null; // Stores { product: object, criteria: object }
        let run2Result = null; // Stores { product: object, criteria: object }
        let currentRunResult = null;
        const previousMatches = [];

        // Live updating selection tracking
        function handleSelectChange(fieldId) {
            if (fieldId === 'tileWidth' || fieldId === 'tileLength') {
                const width = document.getElementById('tileWidth').value;
                const length = document.getElementById('tileLength').value;
                const summarySpan = document.getElementById('summary-tileDimensions');

                if (width || length) {
                    summarySpan.textContent = `${width || '—'} × ${length || '—'} cm`;
                    summarySpan.classList.remove('text-slate-400', 'italic');
                    summarySpan.classList.add('text-mc-lightBlue', 'font-bold');
                } else {
                    summarySpan.textContent = 'Not selected';
                    summarySpan.classList.add('text-slate-400', 'italic');
                    summarySpan.classList.remove('text-mc-lightBlue', 'font-bold');
                }

                updateSummaryCounter();
                return;
            }

            const el = document.getElementById(fieldId);
            const val = el.value;
            const summarySpan = document.getElementById(`summary-${fieldId}`);

            if (val && val.trim() !== '') {
                summarySpan.textContent = val;
                summarySpan.classList.remove('text-slate-400', 'italic');
                summarySpan.classList.add('text-mc-lightBlue', 'font-bold');
            } else {
                summarySpan.textContent = 'Not selected';
                summarySpan.classList.add('text-slate-400', 'italic');
                summarySpan.classList.remove('text-mc-lightBlue', 'font-bold');
            }

            updateSummaryCounter();
        }

        function updateSummaryCounter() {
            const fields = ['tileType', 'tileColor', 'tileThickness', 'exposureToWater', 'direction'];
            let filledCount = 0;
            fields.forEach(f => {
                const val = document.getElementById(f).value;
                if (val && val.toString().trim() !== '') filledCount++;
            });
            const width = parseFloat(document.getElementById('tileWidth').value);
            const length = parseFloat(document.getElementById('tileLength').value);
            if (Number.isFinite(width) && width > 0 && Number.isFinite(length) && length > 0) filledCount++;
            document.getElementById('summaryCounter').textContent = `${filledCount}/6 Completed`;
        }

        function updateProgress() {
            const progressFill = document.getElementById('progressFill');
            const progressPercentageText = document.getElementById('progressPercentageText');
            const stepIndicatorText = document.getElementById('stepIndicatorText');

            if (currentStep <= totalSteps) {
                const percentage = Math.round(((currentStep) / totalSteps) * 100);
                progressFill.style.width = `${percentage}%`;
                progressPercentageText.textContent = `${percentage}%`;
                stepIndicatorText.textContent = `Step ${currentStep} of ${totalSteps}`;
            } else {
                progressFill.style.width = `100%`;
                progressPercentageText.textContent = `100%`;
                stepIndicatorText.textContent = `Completed`;
            }
        }

        function validateStep(step) {
            if (step === 1 && !document.getElementById('tileType').value) { alert('Please select a tile type.'); return false; }
            if (step === 2 && !document.getElementById('tileColor').value) { alert('Please select a tile color.'); return false; }
            if (step === 3) {
                const width = parseFloat(document.getElementById('tileWidth').value);
                const length = parseFloat(document.getElementById('tileLength').value);
                if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(length) || length <= 0) {
                    alert('Please enter a valid tile width and length (cm).');
                    return false;
                }
            }
            if (step === 4 && !document.getElementById('tileThickness').value) { alert('Please select tile thickness.'); return false; }
            if (step === 5 && !document.getElementById('exposureToWater').value) { alert('Please select water exposure.'); return false; }
            if (step === 6 && !document.getElementById('direction').value) { alert('Please select installation direction.'); return false; }
            return true;
        }

        function nextStep(step) {
            if (!validateStep(step)) return;

            document.getElementById(`step-${step}`).classList.remove('active');
            currentStep = step + 1;
            
            if (currentStep === 7) {
                generateRecommendations();
            }
            
            updateProgress();
            document.getElementById(`step-${currentStep}`).classList.add('active');
        }

        function prevStep(step) {
            document.getElementById(`step-${step}`).classList.remove('active');
            currentStep = step - 1;
            updateProgress();
            document.getElementById(`step-${currentStep}`).classList.add('active');
        }

        function generateRecommendations() {
            currentRunResult = null;
            const userCriteria = {
                tileType: document.getElementById('tileType').value,
                tileColor: document.getElementById('tileColor').value,
                tileWidth: parseFloat(document.getElementById('tileWidth').value),
                tileLength: parseFloat(document.getElementById('tileLength').value),
                maxLength: Math.max(
                    parseFloat(document.getElementById('tileWidth').value),
                    parseFloat(document.getElementById('tileLength').value)
                ),
                tileThickness: document.getElementById('tileThickness').value,
                exposureToWater: document.getElementById('exposureToWater').value,
                direction: document.getElementById('direction').value
            };

            // Filter adhesives from array
            const matchingAdhesives = adhesives.filter(item => {
                const matchType = item.otileType.includes(userCriteria.tileType);
                const matchColor = item.otileColor.includes(userCriteria.tileColor);
                const matchLength = userCriteria.maxLength <= item.omaxLength;
                const matchThickness = item.otileThickness.includes(userCriteria.tileThickness);
                const matchExposure = item.oexposureToWater.includes(userCriteria.exposureToWater);
                const matchDirection = item.odirection.includes(userCriteria.direction) || item.odirection.includes('');

                return matchType && matchColor && matchLength && matchThickness && matchExposure && matchDirection;
            });

            const container = document.getElementById('resultsContainer');
            container.innerHTML = '';

            if (matchingAdhesives.length === 0) {
                container.innerHTML = `
                    <div class="bg-red-50 border-2 border-red-200 p-6 rounded-2xl text-center">
                        <svg class="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 class="text-lg font-bold text-red-900">No Direct Product Match Found</h3>
                        <p class="text-xs text-red-700 mt-1">None of our standard products meet all specified criteria. Please try adjusting your tile dimensions or material options.</p>
                    </div>
                `;
                return;
            }

            const costMinimizer = matchingAdhesives[0];
            container.innerHTML = matchingAdhesives.slice(0, 2).map((product, index) => {
                const isCostMinimizer = index === 0;
                const cardClass = isCostMinimizer
                    ? 'bg-mc-lightGreen border-emerald-300'
                    : 'bg-blue-50/80 border-blue-200';
                const badgeClass = isCostMinimizer ? 'bg-emerald-600' : 'bg-mc-blue';
                const numberClass = isCostMinimizer ? 'bg-emerald-600' : 'bg-mc-blue';
                const titleClass = isCostMinimizer ? 'text-emerald-950' : 'text-blue-950';
                const descriptionClass = isCostMinimizer ? 'text-emerald-800' : 'text-blue-800';
                const label = isCostMinimizer
                    ? '1. Good Performance / Meets Spec'
                    : '2. Best Performance / Above Spec';
                const description = isCostMinimizer
                    ? 'Most Economical Matching Solution'
                    : 'Premium / Higher-Tier Safety Margin Specification';

                return `
                    <div class="${cardClass} border-2 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 ${badgeClass} text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                            ${label}
                        </div>
                        <div class="flex items-start space-x-3">
                            <div class="w-10 h-10 rounded-xl ${numberClass} text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                                ${index + 1}
                            </div>
                            <div>
                                <h3 class="text-xl font-bold ${titleClass}">${product.oname}</h3>
                                <p class="text-xs ${descriptionClass} font-semibold mt-0.5">${description}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            currentRunResult = {
                product: costMinimizer,
                criteria: { ...userCriteria }
            };

            // Keep the first successful match and compare it with the latest.
            if (!run1Result) {
                run1Result = {
                    product: costMinimizer,
                    criteria: { ...userCriteria }
                };
            } else {
                run2Result = {
                    product: costMinimizer,
                    criteria: { ...userCriteria }
                };
                renderComparisonTable();
            }
        }

        function renderPreviousMatches() {
            const list = document.getElementById('previousRunList');
            list.innerHTML = '';
            list.classList.toggle('hidden', previousMatches.length === 0);

            previousMatches.forEach((match, index) => {
                const card = document.createElement('div');
                card.className = 'bg-slate-50 rounded-lg border border-slate-200';

                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'w-full text-left p-3 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-mc-lightBlue';
                toggle.setAttribute('aria-expanded', 'false');

                const heading = document.createElement('span');
                heading.className = 'flex items-center justify-between';
                const title = document.createElement('span');
                title.className = 'text-xs font-bold uppercase tracking-wider text-amber-700';
                title.textContent = `Previous Selection Match ${index + 1}`;
                const icon = document.createElement('span');
                icon.setAttribute('aria-hidden', 'true');
                icon.textContent = '+';
                heading.append(title, icon);

                const productLabel = document.createElement('span');
                productLabel.className = 'block text-xs text-slate-500 font-medium mt-2';
                productLabel.textContent = 'Cost Minimizer Selected:';
                const product = document.createElement('span');
                product.className = 'block text-sm font-bold text-mc-blue mt-0.5';
                product.textContent = match.product.oname;
                toggle.append(heading, productLabel, product);

                const details = document.createElement('div');
                details.className = 'hidden px-3 pb-3 text-xs text-slate-600';
                details.id = `previousMatchDetails-${index}`;
                toggle.setAttribute('aria-controls', details.id);

                const fields = [
                    ['1. Tile Type:', match.criteria.tileType],
                    ['2. Tile Color:', match.criteria.tileColor],
                    ['3. Tile Dimensions:', `${match.criteria.tileWidth} × ${match.criteria.tileLength} cm`],
                    ['4. Thickness:', match.criteria.tileThickness],
                    ['5. Water Exposure:', match.criteria.exposureToWater],
                    ['6. Direction:', match.criteria.direction]
                ];
                const detailsList = document.createElement('ul');
                detailsList.className = 'space-y-3 text-sm';
                fields.forEach(([label, value], fieldIndex) => {
                    const row = document.createElement('li');
                    row.className = `flex justify-between items-start py-1${fieldIndex < fields.length - 1 ? ' border-b border-slate-200' : ''}`;
                    const name = document.createElement('span');
                    name.className = 'text-slate-500 font-medium';
                    name.textContent = label;
                    const fieldValue = document.createElement('span');
                    fieldValue.className = 'font-semibold text-slate-800 text-right';
                    fieldValue.textContent = value;
                    row.append(name, fieldValue);
                    detailsList.appendChild(row);
                });
                details.appendChild(detailsList);

                toggle.addEventListener('click', () => {
                    const expanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', String(!expanded));
                    details.classList.toggle('hidden', expanded);
                    icon.textContent = expanded ? '+' : '−';
                });

                card.append(toggle, details);
                list.appendChild(card);
            });
        }

        // COMPARISON FEATURE LOGIC (Run #1 vs Run #2)
        function renderComparisonTable() {
            if (!run1Result || !run2Result) return;

            const compSection = document.getElementById('comparisonSection');
            const tbody = document.getElementById('comparisonTableBody');
            if (!compSection || !tbody) return;

            const p1 = run1Result.product;
            const p2 = run2Result.product;

            const c1 = run1Result.criteria;
            const c2 = run2Result.criteria;

            tbody.innerHTML = `
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Chosen Product Name</td>
                    <td class="p-3 font-bold text-mc-blue border-l border-amber-200">${p1.oname}</td>
                    <td class="p-3 font-bold text-emerald-700 border-l border-amber-200 bg-emerald-50/50">${p2.oname}</td>
                </tr>
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Tile Type Input</td>
                    <td class="p-3 border-l border-amber-200">${c1.tileType}</td>
                    <td class="p-3 border-l border-amber-200 bg-emerald-50/50">${c2.tileType}</td>
                </tr>
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Tile Dimensions (W × L)</td>
                    <td class="p-3 border-l border-amber-200">${c1.tileWidth} × ${c1.tileLength} cm (Longest edge cap: ${p1.omaxLength} cm)</td>
                    <td class="p-3 border-l border-amber-200 bg-emerald-50/50">${c2.tileWidth} × ${c2.tileLength} cm (Longest edge cap: ${p2.omaxLength} cm)</td>
                </tr>
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Max Tile Area</td>
                    <td class="p-3 border-l border-amber-200">${p1.otileArea} cm²</td>
                    <td class="p-3 border-l border-amber-200 bg-emerald-50/50">${p2.otileArea} cm²</td>
                </tr>
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Water Exposure</td>
                    <td class="p-3 border-l border-amber-200">${c1.exposureToWater}</td>
                    <td class="p-3 border-l border-amber-200 bg-emerald-50/50">${c2.exposureToWater}</td>
                </tr>
                <tr>
                    <td class="p-3 font-medium text-slate-900 bg-slate-50">Orientation</td>
                    <td class="p-3 border-l border-amber-200">${c1.direction}</td>
                    <td class="p-3 border-l border-amber-200 bg-emerald-50/50">${c2.direction}</td>
                </tr>
            `;

            compSection.classList.remove('hidden');
        }

        function resetApp() {
            if (currentRunResult) {
                previousMatches.unshift(currentRunResult);
                previousMatches.splice(5);
                currentRunResult = null;
                renderPreviousMatches();
            }

            runCount++;
            document.getElementById('nextRunNumBtn').textContent = runCount;

            // Reset wizard steps
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            currentStep = 1;

            // Reset inputs
            document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
            document.getElementById('tileWidth').value = '';
            document.getElementById('tileLength').value = '';

            // Reset Live Sidebar choices
            const fields = ['tileType', 'tileColor', 'tileThickness', 'exposureToWater', 'direction'];
            fields.forEach(f => {
                const summarySpan = document.getElementById(`summary-${f}`);
                summarySpan.textContent = 'Not selected';
                summarySpan.classList.add('text-slate-400', 'italic');
                summarySpan.classList.remove('text-mc-lightBlue', 'font-bold');
            });
            const dimensionsSummary = document.getElementById('summary-tileDimensions');
            dimensionsSummary.textContent = 'Not selected';
            dimensionsSummary.classList.add('text-slate-400', 'italic');
            dimensionsSummary.classList.remove('text-mc-lightBlue', 'font-bold');

            updateSummaryCounter();
            updateProgress();

            document.getElementById('step-1').classList.add('active');
        }

        // Initialize view on page load
        updateProgress();
        updateSummaryCounter();
