// FORMATTER: Cleans up numbers
function num(val) {
    return parseFloat(val.toFixed(4));
}

// Custom function to solve the cubic equation: x^3 + a*x^2 + b*x + c = 0
// Used to find the Eigenvalues (Principal Stresses)
function solveCubic(a, b, c) {
    let Q = (3 * b - Math.pow(a, 2)) / 9;
    let R = (9 * a * b - 27 * c - 2 * Math.pow(a, 3)) / 54;
    
    // For symmetric stress tensors, roots are always real, so Q^3 + R^2 <= 0
    let theta = Math.acos(R / Math.sqrt(Math.pow(-Q, 3)));
    
    let root1 = 2 * Math.sqrt(-Q) * Math.cos(theta / 3) - (a / 3);
    let root2 = 2 * Math.sqrt(-Q) * Math.cos((theta + 2 * Math.PI) / 3) - (a / 3);
    let root3 = 2 * Math.sqrt(-Q) * Math.cos((theta + 4 * Math.PI) / 3) - (a / 3);
    
    // Sort from highest to lowest: Major (s1), Intermediate (s2), Minor (s3)
    let roots = [root1, root2, root3].sort((x, y) => y - x);
    return roots;
}

function calculate3DStress() {
    // 1. Grab inputs
    let sxx = parseFloat(document.getElementById("sxx").value);
    let syy = parseFloat(document.getElementById("syy").value);
    let szz = parseFloat(document.getElementById("szz").value);
    let txy = parseFloat(document.getElementById("txy").value);
    let tyz = parseFloat(document.getElementById("tyz").value);
    let tzx = parseFloat(document.getElementById("tzx").value);
    let unit = document.getElementById("stressUnit").value;

    if (isNaN(sxx) || isNaN(syy) || isNaN(szz) || isNaN(txy) || isNaN(tyz) || isNaN(tzx)) {
        alert("Please enter valid numbers in all 6 fields."); return;
    }

    // 2. Calculate Stress Invariants (I1, I2, I3)
    let I1 = sxx + syy + szz;
    
    let I2 = (sxx * syy) + (syy * szz) + (szz * sxx) - (Math.pow(txy, 2) + Math.pow(tyz, 2) + Math.pow(tzx, 2));
    
    let I3 = (sxx * syy * szz) + (2 * txy * tyz * tzx) - (sxx * Math.pow(tyz, 2)) - (syy * Math.pow(tzx, 2)) - (szz * Math.pow(txy, 2));

    // 3. Solve the Characteristic Equation: Sp^3 - I1*Sp^2 + I2*Sp - I3 = 0
    let coeffA = -I1;
    let coeffB = I2;
    let coeffC = -I3;
    
    let principalStresses = solveCubic(coeffA, coeffB, coeffC);
    let s1 = principalStresses[0];
    let s2 = principalStresses[1];
    let s3 = principalStresses[2];

    // 4. Update the Basic Results Display
    document.getElementById("basicResults").innerHTML = `
        <strong>First Invariant (I<sub>1</sub>) :</strong> ${num(I1)} ${unit}<br>
        <strong>Second Invariant (I<sub>2</sub>) :</strong> ${num(I2)} (${unit})²<br>
        <strong>Third Invariant (I<sub>3</sub>) :</strong> ${num(I3)} (${unit})³<br><br>
        <strong>Major Principal Stress (σ<sub>1</sub>) :</strong> ${num(s1)} ${unit}<br>
        <strong>Intermediate Principal Stress (σ<sub>2</sub>) :</strong> ${num(s2)} ${unit}<br>
        <strong>Minor Principal Stress (σ<sub>3</sub>) :</strong> ${num(s3)} ${unit}
    `;

    // 5. Generate the Step-by-Step Solution Proof
    let solHTML = `
        <h2 style="color: #2c3e50;">Solution Steps (Proof):</h2>
        
        <p><strong>Step 1: Calculate the Stress Invariants</strong></p>
        <p class="step-text">First Invariant (I<sub>1</sub>):</p>
        <div class="formula-box">I<sub>1</sub> = σ<sub>xx</sub> + σ<sub>yy</sub> + σ<sub>zz</sub></div>
        <div class="formula-box">I<sub>1</sub> = (${sxx}) + (${syy}) + (${szz}) = ${num(I1)}</div>
        
        <p class="step-text">Second Invariant (I<sub>2</sub>):</p>
        <div class="formula-box">I<sub>2</sub> = (σ<sub>xx</sub>σ<sub>yy</sub> + σ<sub>yy</sub>σ<sub>zz</sub> + σ<sub>zz</sub>σ<sub>xx</sub>) - (τ<sub>xy</sub>² + τ<sub>yz</sub>² + τ<sub>zx</sub>²)</div>
        <div class="formula-box">I<sub>2</sub> = ((${sxx})(${syy}) + (${syy})(${szz}) + (${szz})(${sxx})) - ((${txy})² + (${tyz})² + (${tzx})²) = ${num(I2)}</div>
        
        <p class="step-text">Third Invariant (I<sub>3</sub> - Determinant):</p>
        <div class="formula-box">I<sub>3</sub> = (σ<sub>xx</sub>σ<sub>yy</sub>σ<sub>zz</sub>) + 2(τ<sub>xy</sub>τ<sub>yz</sub>τ<sub>zx</sub>) - (σ<sub>xx</sub>τ<sub>yz</sub>² + σ<sub>yy</sub>τ<sub>zx</sub>² + σ<sub>zz</sub>τ<sub>xy</sub>²)</div>
        <div class="formula-box">I<sub>3</sub> = ${num(I3)}</div>

        <br>
        <p><strong>Step 2: Form the Characteristic Equation</strong></p>
        <div class="formula-box">σ<sub>p</sub>³ - I<sub>1</sub>σ<sub>p</sub>² + I<sub>2</sub>σ<sub>p</sub> - I<sub>3</sub> = 0</div>
        <div class="formula-box">σ<sub>p</sub>³ - (${num(I1)})σ<sub>p</sub>² + (${num(I2)})σ<sub>p</sub> - (${num(I3)}) = 0</div>

        <br>
        <p><strong>Step 3: Solve for Eigenvalues (Principal Stresses)</strong></p>
        <p>By finding the three roots of the cubic polynomial above, we find the three principal stresses, ranked from largest to smallest (σ<sub>1</sub> ≥ σ<sub>2</sub> ≥ σ<sub>3</sub>):</p>
        <div class="formula-box">σ<sub>1</sub> = ${num(s1)} ${unit}</div>
        <div class="formula-box">σ<sub>2</sub> = ${num(s2)} ${unit}</div>
        <div class="formula-box">σ<sub>3</sub> = ${num(s3)} ${unit}</div>
    `;

    document.getElementById("solutionCard").innerHTML = solHTML;
    document.getElementById("resultsCard").style.display = "block";
    document.getElementById("solutionCard").style.display = "none";
    document.getElementById("btnToggle").innerText = "Show Full Solution Steps";
}

function toggleSolution() {
    let solCard = document.getElementById("solutionCard");
    let btn = document.getElementById("btnToggle");
    if (solCard.style.display === "none") {
        solCard.style.display = "block"; btn.innerText = "Hide Full Solution Steps";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Full Solution Steps";
    }
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