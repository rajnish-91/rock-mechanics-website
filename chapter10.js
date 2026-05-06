// FORMATTER
function num(val) { 
    let abs = Math.abs(val);
    if (abs > 0 && abs < 0.0001) return val.toExponential(4);
    return parseFloat(val.toFixed(6)); 
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
        solCard.style.display = "block"; btn.innerText = "Hide Calculation Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Calculation Proof";
    }
}

// ================= 1. RECTANGULAR ROSETTE (x, y, θ) =================
function calcRectRosette() {
    let E_gpa = parseFloat(document.getElementById("r_E").value);
    let nu = parseFloat(document.getElementById("r_nu").value);
    let ex = parseFloat(document.getElementById("r_ex").value);
    let ey = parseFloat(document.getElementById("r_ey").value);
    let etheta = parseFloat(document.getElementById("r_etheta").value);
    let theta_deg = parseFloat(document.getElementById("r_theta").value);

    if (isNaN(E_gpa) || isNaN(nu) || isNaN(ex) || isNaN(ey) || isNaN(etheta) || isNaN(theta_deg)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let E_mpa = E_gpa * 1000;
    let rad = theta_deg * (Math.PI / 180);

    // Compute Shear Strain (Φxy) from Transformation Formula
    // ε_theta = (εx+εy)/2 + (εx-εy)/2 * cos(2θ) + (Φxy/2)*sin(2θ)
    let avg = (ex + ey) / 2;
    let diff = (ex - ey) / 2;
    
    let sin2 = Math.sin(2 * rad);
    if (Math.abs(sin2) < 0.0001) {
        alert("Angle cannot be 0, 90, or 180 degrees. The third gauge must be at an offset angle to calculate shear."); return;
    }

    let phi_xy = (2 * etheta - (ex + ey) - (ex - ey) * Math.cos(2 * rad)) / sin2;

    // Principal Strains
    let R = Math.sqrt(Math.pow(diff, 2) + Math.pow(phi_xy / 2, 2));
    let e1 = avg + R;
    let e2 = avg - R;

    // Principal Stresses
    let stress_coeff = E_mpa / (1 - Math.pow(nu, 2));
    let s1 = stress_coeff * (e1 + nu * e2);
    let s2 = stress_coeff * (e2 + nu * e1);

    document.getElementById("r_resultsCard").innerHTML = `
        <strong>Calculated Shear Strain (Φxy):</strong> ${num(phi_xy)}<br><br>
        <strong>Major Principal Strain (ε1):</strong> ${num(e1)}<br>
        <strong>Minor Principal Strain (ε2):</strong> ${num(e2)}<br><br>
        <strong style="color: #004085;">Major Principal Stress (σ1):</strong> ${num(s1)} MPa<br>
        <strong style="color: #004085;">Minor Principal Stress (σ2):</strong> ${num(s2)} MPa
    `;

    document.getElementById("r_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Solution based on your notes:</h3>
        <p><strong>1. Find Shear Strain (Φxy):</strong></p>
        <div class="formula-box">ε' = (εx + εy)/2 + ((εx - εy)/2)*cos(2θ) + (Φxy/2)*sin(2θ)</div>
        <div class="formula-box">Φxy = [2ε' - (εx + εy) - (εx - εy)cos(2θ)] / sin(2θ) = <b>${num(phi_xy)}</b></div>
        
        <p><strong>2. Calculate Principal Strains (ε1, ε2):</strong></p>
        <div class="formula-box">ε1,2 = (εx + εy)/2 ± √[((εx - εy)/2)² + (Φxy/2)²]</div>
        <div class="formula-box">ε1 = ${num(avg)} + ${num(R)} = <b>${num(e1)}</b></div>
        <div class="formula-box">ε2 = ${num(avg)} - ${num(R)} = <b>${num(e2)}</b></div>

        <p><strong>3. Calculate Principal Stresses (σ1, σ2):</strong></p>
        <div class="formula-box">σ1 = [E / (1 - μ²)] * (ε1 + με2)</div>
        <div class="formula-box">σ1 = [${E_mpa} / (1 - ${nu}²)] * (${num(e1)} + ${nu}(${num(e2)})) = <b>${num(s1)} MPa</b></div>
        <br>
        <div class="formula-box">σ2 = [E / (1 - μ²)] * (ε2 + με1)</div>
        <div class="formula-box">σ2 = [${E_mpa} / (1 - ${nu}²)] * (${num(e2)} + ${nu}(${num(e1)})) = <b>${num(s2)} MPa</b></div>
    `;

    document.getElementById("r_resultsArea").style.display = "block";
}

// ================= 2. DELTA (Δ) ROSETTE (0, 60, 120) =================
function calcDeltaRosette() {
    let E_gpa = parseFloat(document.getElementById("d_E").value);
    let nu = parseFloat(document.getElementById("d_nu").value);
    let e0 = parseFloat(document.getElementById("d_e0").value);
    let e60 = parseFloat(document.getElementById("d_e60").value);
    let e120 = parseFloat(document.getElementById("d_e120").value);

    if (isNaN(E_gpa) || isNaN(nu) || isNaN(e0) || isNaN(e60) || isNaN(e120)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let E_mpa = E_gpa * 1000;

    // Derived from the 3 simultaneous equations in the notes
    let ex = e0;
    let ey = (2 * (e60 + e120) - e0) / 3;
    let phi_xy = 2 * (e60 - e120) / Math.sqrt(3);

    // Principal Strains
    let avg = (ex + ey) / 2;
    let diff = (ex - ey) / 2;
    let R = Math.sqrt(Math.pow(diff, 2) + Math.pow(phi_xy / 2, 2));
    
    let e1 = avg + R;
    let e2 = avg - R;

    // Principal Stresses
    let stress_coeff = E_mpa / (1 - Math.pow(nu, 2));
    let s1 = stress_coeff * (e1 + nu * e2);
    let s2 = stress_coeff * (e2 + nu * e1);

    document.getElementById("d_resultsCard").innerHTML = `
        <strong>Derived Base Strains:</strong><br>
        εx = ${num(ex)}, εy = ${num(ey)}, Φxy = ${num(phi_xy)}<br><br>
        <strong>Major Principal Strain (ε1):</strong> ${num(e1)}<br>
        <strong>Minor Principal Strain (ε2):</strong> ${num(e2)}<br><br>
        <strong style="color: #c82359;">Major Principal Stress (σ1):</strong> ${num(s1)} MPa<br>
        <strong style="color: #c82359;">Minor Principal Stress (σ2):</strong> ${num(s2)} MPa
    `;

    document.getElementById("d_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Solution based on your notes:</h3>
        <p><strong>1. Solve System for Base Strains (εx, εy, Φxy):</strong></p>
        <p>Using the transformation equations at θ=0°, 60°, and 120°:</p>
        <div class="formula-box">εx = ε_0 = <b>${num(ex)}</b></div>
        <div class="formula-box">εy = [2*(ε_60 + ε_120) - ε_0] / 3 = <b>${num(ey)}</b></div>
        <div class="formula-box">Φxy = 2*(ε_60 - ε_120) / √3 = <b>${num(phi_xy)}</b></div>
        
        <p><strong>2. Calculate Principal Strains (ε1, ε2):</strong></p>
        <div class="formula-box">ε1,2 = (εx + εy)/2 ± √[((εx - εy)/2)² + (Φxy/2)²]</div>
        <div class="formula-box">ε1 = <b>${num(e1)}</b></div>
        <div class="formula-box">ε2 = <b>${num(e2)}</b></div>

        <p><strong>3. Calculate Principal Stresses (σ1, σ2):</strong></p>
        <div class="formula-box">σ1 = [E / (1 - μ²)] * (ε1 + με2) = <b>${num(s1)} MPa</b></div>
        <div class="formula-box">σ2 = [E / (1 - μ²)] * (ε2 + με1) = <b>${num(s2)} MPa</b></div>
    `;

    document.getElementById("d_resultsArea").style.display = "block";
}