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
        solCard.style.display = "block"; btn.innerText = "Hide Matrix Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Matrix Proof";
    }
}

// ================= 1. PLANE STRESS MATRIX =================
function calcPlaneStress() {
    let E_gpa = parseFloat(document.getElementById("ps_E").value);
    let nu = parseFloat(document.getElementById("ps_nu").value);
    let ex = parseFloat(document.getElementById("ps_ex").value);
    let ey = parseFloat(document.getElementById("ps_ey").value);
    let gxy = parseFloat(document.getElementById("ps_gxy").value);

    if (isNaN(E_gpa) || isNaN(nu) || isNaN(ex) || isNaN(ey) || isNaN(gxy)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let E_mpa = E_gpa * 1000; // Convert GPa to MPa for stress results

    // The leading coefficient: E / (1 - ν^2)
    let coeff = E_mpa / (1 - Math.pow(nu, 2));

    // Matrix Multiplication
    let sx = coeff * (ex + nu * ey);
    let sy = coeff * (nu * ex + ey);
    let txy = coeff * (0.5 * (1 - nu) * gxy);

    document.getElementById("ps_resultsCard").innerHTML = `
        <strong>Resulting Stresses:</strong><br><br>
        <strong>Normal Stress (σx):</strong> ${num(sx)} MPa<br>
        <strong>Normal Stress (σy):</strong> ${num(sy)} MPa<br>
        <strong>Shear Stress (τxy):</strong> ${num(txy)} MPa
    `;

    document.getElementById("ps_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Matrix Multiplication Proof:</h3>
        <p><strong>1. Calculate Leading Coefficient:</strong></p>
        <div class="formula-box">C = E / (1 - ν²) = ${E_mpa} / (1 - ${nu}²) = ${num(coeff)}</div>
        
        <p><strong>2. Multiply by Strain Matrix:</strong></p>
        <div class="formula-box">σx = C * [1(εx) + ν(εy)]</div>
        <div class="formula-box">σx = ${num(coeff)} * [(${ex}) + ${nu}(${ey})] = <b>${num(sx)} MPa</b></div>
        <br>
        <div class="formula-box">σy = C * [ν(εx) + 1(εy)]</div>
        <div class="formula-box">σy = ${num(coeff)} * [${nu}(${ex}) + (${ey})] = <b>${num(sy)} MPa</b></div>
        <br>
        <div class="formula-box">τxy = C * [0.5(1 - ν) * γxy]</div>
        <div class="formula-box">τxy = ${num(coeff)} * [0.5(1 - ${nu}) * ${gxy}] = <b>${num(txy)} MPa</b></div>
    `;

    document.getElementById("ps_resultsArea").style.display = "block";
}

// ================= 2. PLANE STRAIN MATRIX =================
function calcPlaneStrain() {
    let E_gpa = parseFloat(document.getElementById("pt_E").value);
    let nu = parseFloat(document.getElementById("pt_nu").value);
    let ex = parseFloat(document.getElementById("pt_ex").value);
    let ey = parseFloat(document.getElementById("pt_ey").value);
    let gxy = parseFloat(document.getElementById("pt_gxy").value);

    if (isNaN(E_gpa) || isNaN(nu) || isNaN(ex) || isNaN(ey) || isNaN(gxy)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let E_mpa = E_gpa * 1000;

    // The leading coefficient: E / [(1 + ν)(1 - 2ν)]
    let coeff = E_mpa / ((1 + nu) * (1 - 2 * nu));

    // Matrix Multiplication
    let sx = coeff * ((1 - nu) * ex + nu * ey);
    let sy = coeff * (nu * ex + (1 - nu) * ey);
    let txy = coeff * ((0.5 - nu) * gxy);

    document.getElementById("pt_resultsCard").innerHTML = `
        <strong>Resulting Stresses:</strong><br><br>
        <strong>Normal Stress (σx):</strong> ${num(sx)} MPa<br>
        <strong>Normal Stress (σy):</strong> ${num(sy)} MPa<br>
        <strong>Shear Stress (τxy):</strong> ${num(txy)} MPa
    `;

    document.getElementById("pt_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Matrix Multiplication Proof:</h3>
        <p><strong>1. Calculate Leading Coefficient:</strong></p>
        <div class="formula-box">C = E / [(1 + ν)(1 - 2ν)]</div>
        <div class="formula-box">C = ${E_mpa} / [(1 + ${nu})(1 - 2(${nu}))] = ${num(coeff)}</div>
        
        <p><strong>2. Multiply by Strain Matrix:</strong></p>
        <div class="formula-box">σx = C * [(1 - ν)εx + ν(εy)]</div>
        <div class="formula-box">σx = ${num(coeff)} * [(${num(1-nu)})(${ex}) + ${nu}(${ey})] = <b>${num(sx)} MPa</b></div>
        <br>
        <div class="formula-box">σy = C * [ν(εx) + (1 - ν)εy]</div>
        <div class="formula-box">σy = ${num(coeff)} * [${nu}(${ex}) + (${num(1-nu)})(${ey})] = <b>${num(sy)} MPa</b></div>
        <br>
        <div class="formula-box">τxy = C * [(0.5 - ν) * γxy]</div>
        <div class="formula-box">τxy = ${num(coeff)} * [(${num(0.5-nu)}) * ${gxy}] = <b>${num(txy)} MPa</b></div>
    `;

    document.getElementById("pt_resultsArea").style.display = "block";
}