// FORMATTER
function num(val) { 
    return parseFloat(val.toFixed(4)); 
}

// ================= INTERFACE SWAPPING & TOGGLES =================
function openInterface(interfaceId) {
    document.getElementById("topicMenu").style.display = "none";
    document.getElementById("mainBackButton").style.display = "none";
    document.getElementById(interfaceId).style.display = "block";
}

function closeInterface() {
    let interfaces = document.getElementsByClassName("calc-interface");
    for(let i = 0; i < interfaces.length; i++) interfaces[i].style.display = "none";
    document.getElementById("topicMenu").style.display = "block";
    document.getElementById("mainBackButton").style.display = "inline-block";
}

function toggleSolution(cardId, btnId) {
    let solCard = document.getElementById(cardId);
    let btn = document.getElementById(btnId);
    if (solCard.style.display === "none") {
        solCard.style.display = "block"; btn.innerText = "Hide Equation Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Equation Proof";
    }
}

// ================= 1. CALCULATE IN-SITU STRESSES (p1, p2) =================
function calcInSituKirsch() {
    let z = parseFloat(document.getElementById("i_z").value);
    let gamma = parseFloat(document.getElementById("i_gamma").value);
    let k = parseFloat(document.getElementById("i_k").value);

    if (isNaN(z) || isNaN(gamma) || isNaN(k)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    // Math: MN/m³ * m = MN/m² = MPa
    let p2 = gamma * z;
    let p1 = k * p2;

    document.getElementById("i_resultsCard").innerHTML = `
        <strong>Calculated Far-Field Stresses:</strong><br><br>
        <strong style="color: #004085;">Vertical Stress (p2):</strong> ${num(p2)} MPa<br>
        <span style="font-size: 0.9em; color: #555;"><i>Equation: p2 = γ × z = ${gamma} × ${z}</i></span><br><br>
        
        <strong style="color: #c82359;">Horizontal Stress (p1):</strong> ${num(p1)} MPa<br>
        <span style="font-size: 0.9em; color: #555;"><i>Equation: p1 = K × p2 = ${k} × ${num(p2)}</i></span><br><br>
        
        <p style="margin-top: 10px; font-weight: bold;">Use these values in the Kirsch Calculators!</p>
    `;

    document.getElementById("i_resultsArea").style.display = "block";
}

// ================= 2. GENERAL KIRSCH EQUATIONS =================
function calcGeneralKirsch() {
    let p1 = parseFloat(document.getElementById("k_p1").value);
    let p2 = parseFloat(document.getElementById("k_p2").value);
    let a = parseFloat(document.getElementById("k_a").value);
    let r = parseFloat(document.getElementById("k_r").value);
    let theta_deg = parseFloat(document.getElementById("k_theta").value);

    if (isNaN(p1) || isNaN(p2) || isNaN(a) || isNaN(r) || isNaN(theta_deg)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    if (r < a) {
        alert("Error: Radial distance (r) cannot be less than the tunnel radius (a). You are inside the empty opening!");
        return;
    }

    let rad = theta_deg * (Math.PI / 180);
    let a2_r2 = Math.pow(a / r, 2);
    let a4_r4 = Math.pow(a / r, 4);

    let t1 = (p1 + p2) / 2;
    let t2 = (p1 - p2) / 2;
    let cos2 = Math.cos(2 * rad);
    let sin2 = Math.sin(2 * rad);

    let sigma_r = t1 * (1 - a2_r2) + t2 * (1 - 4*a2_r2 + 3*a4_r4) * cos2;
    let sigma_theta = t1 * (1 + a2_r2) - t2 * (1 + 3*a4_r4) * cos2;
    let tau_r_theta = -t2 * (1 + 2*a2_r2 - 3*a4_r4) * sin2;

    document.getElementById("k_resultsCard").innerHTML = `
        <strong>Local Stresses at (r=${r}m, θ=${theta_deg}°):</strong><br><br>
        <strong>Radial Stress (σr):</strong> ${num(sigma_r)} MPa<br>
        <strong>Tangential Stress (σθ):</strong> ${num(sigma_theta)} MPa<br>
        <strong>Shear Stress (τrθ):</strong> ${num(tau_r_theta)} MPa
    `;

    document.getElementById("k_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        <p><strong>1. Calculate Initial Terms:</strong></p>
        <div class="formula-box">(p1 + p2)/2 = (${p1} + ${p2})/2 = ${num(t1)}</div>
        <div class="formula-box">(p1 - p2)/2 = (${p1} - ${p2})/2 = ${num(t2)}</div>
        <div class="formula-box">(a/r)² = (${a}/${r})² = ${num(a2_r2)}</div>
        <div class="formula-box">(a/r)⁴ = (${a}/${r})⁴ = ${num(a4_r4)}</div>
        
        <p><strong>2. Radial Stress (σr):</strong></p>
        <div class="formula-box">σr = ${num(t1)}(1 - ${num(a2_r2)}) + ${num(t2)}(1 - 4(${num(a2_r2)}) + 3(${num(a4_r4)}))cos(${2*theta_deg}) = <b>${num(sigma_r)} MPa</b></div>
        
        <p><strong>3. Tangential Stress (σθ):</strong></p>
        <div class="formula-box">σθ = ${num(t1)}(1 + ${num(a2_r2)}) - ${num(t2)}(1 + 3(${num(a4_r4)}))cos(${2*theta_deg}) = <b>${num(sigma_theta)} MPa</b></div>
        
        <p><strong>4. Shear Stress (τrθ):</strong></p>
        <div class="formula-box">τrθ = -${num(t2)}(1 + 2(${num(a2_r2)}) - 3(${num(a4_r4)}))sin(${2*theta_deg}) = <b>${num(tau_r_theta)} MPa</b></div>
    `;

    document.getElementById("k_resultsArea").style.display = "block";
}

// ================= 3. BOUNDARY STRESSES (r=a) =================
function calcBoundaryKirsch() {
    let p1 = parseFloat(document.getElementById("b_p1").value);
    let p2 = parseFloat(document.getElementById("b_p2").value);
    let theta_deg = parseFloat(document.getElementById("b_theta").value);

    if (isNaN(p1) || isNaN(p2) || isNaN(theta_deg)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let rad = theta_deg * (Math.PI / 180);
    let cos2 = Math.cos(2 * rad);

    let sigma_theta = (p1 + p2) - 2 * (p1 - p2) * cos2;

    let locationText = "";
    if (theta_deg === 0 || theta_deg === 180) locationText = " (Tunnel Springline / Sidewall)";
    if (theta_deg === 90 || theta_deg === 270) locationText = " (Tunnel Crown / Roof)";

    document.getElementById("b_resultsCard").innerHTML = `
        <strong>Stresses at Boundary (r=a, θ=${theta_deg}°)${locationText}:</strong><br><br>
        <strong>Radial Stress (σr):</strong> 0 MPa (Free Surface)<br>
        <strong>Shear Stress (τrθ):</strong> 0 MPa<br>
        <strong style="color: #c82359;">Tangential Stress (σθ):</strong> ${num(sigma_theta)} MPa
    `;

    document.getElementById("b_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Simplified Boundary Proof:</h3>
        <p>When r = a, the ratio (a/r) = 1. If you substitute 1 into the full Kirsch equations, the radial and shear stress formulas cancel out exactly to 0.</p>
        <p>The tangential stress formula simplifies dramatically to:</p>
        <div class="formula-box">σθ = (p1 + p2) - 2(p1 - p2)cos(2θ)</div>
        <div class="formula-box">σθ = (${p1} + ${p2}) - 2(${p1} - ${p2})cos(${2*theta_deg})</div>
        <div class="formula-box">σθ = <b>${num(sigma_theta)} MPa</b></div>
    `;

    document.getElementById("b_resultsArea").style.display = "block";
}