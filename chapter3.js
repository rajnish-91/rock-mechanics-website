// Clean formatter to handle decimal places dynamically
function num(val) {
    return parseFloat(val.toFixed(4));
}

function createAlignmentDiagram(thetaDeg, sxPrime, syPrime, txyPrime, unit) {
    let theta = thetaDeg * (Math.PI / 180);
    let cx = 180;
    let cy = 150;
    let axisLength = 118;
    let side = 78;
    let ux = Math.cos(theta);
    let uy = -Math.sin(theta);
    let vx = -Math.sin(theta);
    let vy = -Math.cos(theta);

    let point = (x, y) => `${x},${y}`;
    let p1 = point(cx + ux * side + vx * side, cy + uy * side + vy * side);
    let p2 = point(cx - ux * side + vx * side, cy - uy * side + vy * side);
    let p3 = point(cx - ux * side - vx * side, cy - uy * side - vy * side);
    let p4 = point(cx + ux * side - vx * side, cy + uy * side - vy * side);
    let xEndX = cx + axisLength * ux;
    let xEndY = cy + axisLength * uy;
    let yEndX = cx + axisLength * vx;
    let yEndY = cy + axisLength * vy;
    let arcEndX = cx + 35 * Math.cos(theta);
    let arcEndY = cy - 35 * Math.sin(theta);
    let largeArc = Math.abs(thetaDeg % 360) > 180 ? 1 : 0;

    return `
        <h3>Alignment after transformation</h3>
        <svg viewBox="0 0 360 300" role="img" aria-label="Stress element alignment after transformation">
            <defs>
                <marker id="arrowOriginal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#6b7280"></path>
                </marker>
                <marker id="arrowRotated" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#0f766e"></path>
                </marker>
                <marker id="arrowStress" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#b45309"></path>
                </marker>
            </defs>

            <line x1="46" y1="${cy}" x2="314" y2="${cy}" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrowOriginal)"></line>
            <line x1="${cx}" y1="268" x2="${cx}" y2="32" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrowOriginal)"></line>
            <text x="318" y="${cy - 8}" fill="#4b5563" font-size="14" font-weight="700">x</text>
            <text x="${cx + 8}" y="36" fill="#4b5563" font-size="14" font-weight="700">y</text>

            <polygon points="${p1} ${p2} ${p3} ${p4}" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"></polygon>
            <line x1="${cx}" y1="${cy}" x2="${xEndX}" y2="${xEndY}" stroke="#0f766e" stroke-width="3" marker-end="url(#arrowRotated)"></line>
            <line x1="${cx}" y1="${cy}" x2="${yEndX}" y2="${yEndY}" stroke="#0f766e" stroke-width="3" marker-end="url(#arrowRotated)"></line>
            <text x="${cx + axisLength * ux + 8}" y="${cy + axisLength * uy - 6}" fill="#0f766e" font-size="15" font-weight="800">x'</text>
            <text x="${cx + axisLength * vx + 8}" y="${cy + axisLength * vy - 6}" fill="#0f766e" font-size="15" font-weight="800">y'</text>

            <path d="M215 150 A35 35 0 ${largeArc} 0 ${arcEndX} ${arcEndY}" fill="none" stroke="#7c3aed" stroke-width="2"></path>
            <text x="222" y="136" fill="#6d28d9" font-size="13" font-weight="700">theta = ${num(thetaDeg)} deg</text>

            <line x1="${cx + ux * side}" y1="${cy + uy * side}" x2="${cx + ux * (side + 32)}" y2="${cy + uy * (side + 32)}" stroke="#b45309" stroke-width="2.5" marker-end="url(#arrowStress)"></line>
            <line x1="${cx + vx * side}" y1="${cy + vy * side}" x2="${cx + vx * (side + 32)}" y2="${cy + vy * (side + 32)}" stroke="#b45309" stroke-width="2.5" marker-end="url(#arrowStress)"></line>
            <text x="18" y="262" fill="#7c2d12" font-size="12.5" font-weight="700">
                <tspan x="18" dy="0">sigma x' = ${num(sxPrime)} ${unit}</tspan>
                <tspan x="18" dy="17">sigma y' = ${num(syPrime)} ${unit}, tau x'y' = ${num(txyPrime)} ${unit}</tspan>
            </text>
        </svg>
    `;
}

function showAlignmentDiagram(thetaDeg, sxPrime, syPrime, txyPrime, unit) {
    let diagram = document.getElementById("alignmentDiagram");
    let results = document.getElementById("basicResults");

    if (!diagram && results) {
        results.insertAdjacentHTML("afterend", `<div id="alignmentDiagram" class="alignment-diagram"></div>`);
        diagram = document.getElementById("alignmentDiagram");
    }

    if (diagram) {
        diagram.innerHTML = createAlignmentDiagram(thetaDeg, sxPrime, syPrime, txyPrime, unit);
        diagram.style.display = "block";
    }
}

// ================= CALCULATOR 1: STRESS TRANSFORMATION =================

function calculateTransformation() {
    let sx = parseFloat(document.getElementById("sx").value);
    let sy = parseFloat(document.getElementById("sy").value);
    let txy = parseFloat(document.getElementById("txy").value);
    let th = parseFloat(document.getElementById("theta").value);
    let unit = document.getElementById("stressUnit").value;

    if (isNaN(sx) || isNaN(sy) || isNaN(txy) || isNaN(th)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    

    let thRad = th * (Math.PI / 180); 
    let thRad90 = (th + 90) * (Math.PI / 180); 

    let avg = (sx + sy) / 2;
    let diff = (sx - sy) / 2;

    let sx_prime = avg + diff * Math.cos(2 * thRad) + txy * Math.sin(2 * thRad);
    let sy_prime = avg + diff * Math.cos(2 * thRad90) + txy * Math.sin(2 * thRad90);
    let txy_prime = -(diff) * Math.sin(2 * thRad) + txy * Math.cos(2 * thRad);

    document.getElementById("basicResults").innerHTML = `
        Transformed σ<sub>x'</sub> : ${num(sx_prime)} ${unit}<br>
        Transformed σ<sub>y'</sub> : ${num(sy_prime)} ${unit}<br>
        Transformed τ<sub>x'y'</sub> : ${num(txy_prime)} ${unit}
    `;
    showAlignmentDiagram(th, sx_prime, sy_prime, txy_prime, unit);

    let solHTML = `
        <h2 style="color: #2c3e50;">Solution Steps:</h2>
        <p class="step-text">Given Data:</p>
        <div class="data-box">
            <div>θ = ${th}°</div>
            <div>σ<sub>x</sub> = ${sx}${unit}</div>
            <div>σ<sub>y</sub> = ${sy}${unit}</div>
            <div>τ<sub>xy</sub> = ${txy}${unit}</div>
        </div>
        <p><strong>Step 1:</strong> Angle 2θ = ${th * 2}°</p>
        <p><strong>Step 2:</strong> Use the transformation equations to calculate the transformed stresses:</p>
        <p class="step-text">For σ<sub>x'</sub> (Transformed Normal Stress on x-axis):</p>
        <div class="formula-box">σ<sub>x'</sub> = ((σ<sub>x</sub> + σ<sub>y</sub>) / 2) + ((σ<sub>x</sub> - σ<sub>y</sub>) / 2) * cos(2θ) + τ<sub>xy</sub>sin(2θ)</div>
        <div class="formula-box">σ<sub>x'</sub> = ((${sx} + ${sy}) / 2) + ((${sx} - ${sy}) / 2) * cos(2 * ${th}) + ${txy}sin(2 * ${th})</div>
        <p>Result: σ<sub>x'</sub> = ${num(sx_prime)} ${unit}</p>
        <br>
        <p class="step-text">For σ<sub>y'</sub> (Transformed Normal Stress on y-axis):</p>
        <div class="formula-box">σ<sub>y'</sub> = ((σ<sub>x</sub> + σ<sub>y</sub>) / 2) + ((σ<sub>x</sub> - σ<sub>y</sub>) / 2)cos(2 * (90 + θ)) + τ<sub>xy</sub>sin(2 * (90 + θ))</div>
        <div class="formula-box">σ<sub>y'</sub> = ((${sx} + ${sy}) / 2) + ((${sx} - ${sy}) / 2)cos(2 * (90 + ${th})) + ${txy}sin(2 * (90 + ${th}))</div>
        <p>Result: σ<sub>y'</sub> = ${num(sy_prime)} ${unit}</p>
        <br>
        <p class="step-text">For τ<sub>x'y'</sub> (Transformed Shear Stress):</p>
        <div class="formula-box">τ<sub>x'y'</sub> = -((σ<sub>x</sub> - σ<sub>y</sub>) / 2)sin(2θ) + τ<sub>xy</sub>cos(2θ)</div>
        <div class="formula-box">τ<sub>x'y'</sub> = -((${sx} - ${sy}) / 2)sin(2 * ${th}) + ${txy}cos(2 * ${th})</div>
        <p>Result: τ<sub>x'y'</sub> = ${num(txy_prime)} ${unit}</p>
    `;

    document.getElementById("solutionCard").innerHTML = solHTML;
    document.getElementById("resultsCard").style.display = "block";
    document.getElementById("solutionCard").style.display = "none";
    document.getElementById("btnToggle").innerText = "Show Full Solution";
}

function toggleSolution() {
    let solCard = document.getElementById("solutionCard");
    let btn = document.getElementById("btnToggle");
    if (solCard.style.display === "none") {
        solCard.style.display = "block";
        btn.innerText = "Hide Full Solution";
    } else {
        solCard.style.display = "none";
        btn.innerText = "Show Full Solution";
    }
}


// ================= CALCULATOR 2: PRINCIPAL STRESSES =================

function calculatePrincipal() {
    let sx = parseFloat(document.getElementById("p_sx").value);
    let sy = parseFloat(document.getElementById("p_sy").value);
    let txy = parseFloat(document.getElementById("p_txy").value);
    let unit = document.getElementById("p_stressUnit").value;

    if (isNaN(sx) || isNaN(sy) || isNaN(txy)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    let avg = (sx + sy) / 2;
    let diff = (sx - sy) / 2;
    let R = Math.sqrt(Math.pow(diff, 2) + Math.pow(txy, 2));

    let s1 = avg + R;
    let s2 = avg - R;
    let tmax = R;

    document.getElementById("p_basicResults").innerHTML = `
        Principal Stress σ<sub>1</sub> : ${num(s1)} ${unit}<br>
        Principal Stress σ<sub>2</sub> : ${num(s2)} ${unit}<br>
        Max Shear Stress τ<sub>max</sub> : ${num(tmax)} ${unit}
    `;

    let solHTML = `
        <h2 style="color: #2c3e50;">Solution Steps:</h2>
        <p class="step-text">Given Data:</p>
        <div class="data-box">
            <div>σ<sub>x</sub> = ${sx}${unit}</div>
            <div>σ<sub>y</sub> = ${sy}${unit}</div>
            <div>τ<sub>xy</sub> = ${txy}${unit}</div>
        </div>
        
        <p><strong>Step 1:</strong> Calculate Average Normal Stress</p>
        <div class="formula-box">σ<sub>avg</sub> = (σ<sub>x</sub> + σ<sub>y</sub>) / 2</div>
        <div class="formula-box">σ<sub>avg</sub> = (${sx} + ${sy}) / 2 = ${num(avg)} ${unit}</div>
        <br>

        <p><strong>Step 2:</strong> Calculate the Radius of Mohr's Circle (R)</p>
        <div class="formula-box">R = √[ ((σ<sub>x</sub> - σ<sub>y</sub>) / 2)² + τ<sub>xy</sub>² ]</div>
        <div class="formula-box">R = √[ ((${sx} - ${sy}) / 2)² + (${txy})² ] = ${num(R)} ${unit}</div>
        <br>

        <p class="step-text">For Principal Stresses (σ<sub>1</sub>, σ<sub>2</sub>):</p>
        <div class="formula-box">σ<sub>1,2</sub> = σ<sub>avg</sub> ± R</div>
        <div class="formula-box">σ<sub>1</sub> = ${num(avg)} + ${num(R)} = ${num(s1)} ${unit}</div>
        <div class="formula-box">σ<sub>2</sub> = ${num(avg)} - ${num(R)} = ${num(s2)} ${unit}</div>
        <br>

        <p class="step-text">For Maximum Shear Stress (τ<sub>max</sub>):</p>
        <div class="formula-box">τ<sub>max</sub> = R = ${num(tmax)} ${unit}</div>
    `;

    document.getElementById("p_solutionCard").innerHTML = solHTML;
    document.getElementById("p_resultsCard").style.display = "block";
    document.getElementById("p_solutionCard").style.display = "none";
    document.getElementById("p_btnToggle").innerText = "Show Full Solution";
}

function togglePrincipalSolution() {
    let solCard = document.getElementById("p_solutionCard");
    let btn = document.getElementById("p_btnToggle");
    if (solCard.style.display === "none") {
        solCard.style.display = "block";
        btn.innerText = "Hide Full Solution";
    } else {
        solCard.style.display = "none";
        btn.innerText = "Show Full Solution";
    }
}
// ================= ACCORDION LOGIC =================
document.addEventListener("DOMContentLoaded", function() {
    let acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }
});

// Helper function to dynamically resize the panel when results are generated
function updatePanelHeight() {
    let activeAccordions = document.querySelectorAll('.accordion.active');
    activeAccordions.forEach(acc => {
        let panel = acc.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + "px";
    });
}

// ================= INTERFACE SWAPPING LOGIC =================

// This opens the specific calculator and hides the menu
function openInterface(interfaceId) {
    // Hide the main menu
    document.getElementById("topicMenu").style.display = "none";
    
    // Hide the main "Back to Home" button so it doesn't get confusing
    document.getElementById("mainBackButton").style.display = "none";
    
    // Show the requested interface
    document.getElementById(interfaceId).style.display = "block";
}

// This closes the calculator and goes back to the menu
function closeInterface() {
    // Get all interfaces and hide them
    let interfaces = document.getElementsByClassName("calc-interface");
    for(let i = 0; i < interfaces.length; i++) {
        interfaces[i].style.display = "none";
    }
    
    // Show the main menu again
    document.getElementById("topicMenu").style.display = "block";
    
    // Show the main "Back to Home" button again
    document.getElementById("mainBackButton").style.display = "inline-block";
}
