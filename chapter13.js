// FORMATTER
function num(val) { 
    return parseFloat(val.toFixed(2)); 
}
function numQ(val) { 
    return parseFloat(val.toFixed(3)); 
}

// HELPER: RQD Classification
function getRQDClass(rqd) {
    if (rqd < 25) return "Very Poor";
    if (rqd >= 25 && rqd < 50) return "Poor";
    if (rqd >= 50 && rqd < 75) return "Fair";
    if (rqd >= 75 && rqd <= 90) return "Good";
    return "Excellent";
}

// HELPER: Q-Value Classification
function getQClass(q) {
    if (q < 0.01) return "Exceptionally Poor";
    if (q >= 0.01 && q < 0.1) return "Extremely Poor";
    if (q >= 0.1 && q < 1) return "Very Poor";
    if (q >= 1 && q < 4) return "Poor";
    if (q >= 4 && q < 10) return "Fair";
    if (q >= 10 && q < 40) return "Good";
    if (q >= 40 && q < 100) return "Very Good";
    if (q >= 100 && q < 400) return "Extremely Good";
    return "Exceptionally Good";
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
        solCard.style.display = "block"; btn.innerText = "Hide Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Proof";
    }
}

// ================= 1. DEERE'S METHOD (RQD) =================
function calcDeereRQD() {
    let totalLen = parseFloat(document.getElementById("rqd_total_len").value);
    let piecesStr = document.getElementById("rqd_pieces").value;

    if (isNaN(totalLen) || totalLen <= 0 || piecesStr.trim() === "") {
        alert("Please enter a valid total length and at least one core piece length."); return;
    }

    let rawPieces = piecesStr.split(',').map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
    if (rawPieces.length === 0) {
        alert("Could not read any numbers. Make sure they are separated by commas."); return;
    }

    let validPieces = rawPieces.filter(p => p > 10);
    let sumValid = validPieces.reduce((acc, curr) => acc + curr, 0);

    if (sumValid > totalLen) {
        alert("Warning: The sum of your core pieces is greater than the total core run."); return;
    }

    let rqd = (sumValid / totalLen) * 100;
    
    document.getElementById("rqd_resultsCard").innerHTML = `
        <strong>Total Core Run:</strong> ${totalLen} cm<br>
        <strong>Sum of Pieces > 10 cm:</strong> ${num(sumValid)} cm<br><br>
        <strong style="color: #004085; font-size: 1.3em;">RQD: ${num(rqd)}%</strong><br>
        <strong>Rock Quality:</strong> ${getRQDClass(rqd)}
    `;

    document.getElementById("rqd_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Calculation Proof:</h3>
        <p><strong>1. Identify Valid Core Pieces:</strong></p>
        <p>All measured pieces: [${rawPieces.join(', ')}]</p>
        <p>Valid pieces (> 10 cm): [${validPieces.join(', ')}]</p>
        <p><strong>2. Sum Valid Pieces:</strong></p>
        <div class="formula-box">Σ Core pieces > 10 cm = ${validPieces.join(' + ')} = ${num(sumValid)} cm</div>
        <p><strong>3. Calculate RQD:</strong></p>
        <div class="formula-box">RQD = (${num(sumValid)} / ${totalLen}) × 100 = <b>${num(rqd)}%</b></div>
    `;

    document.getElementById("rqd_resultsArea").style.display = "block";
}

// ================= 2. PALMSTROM'S METHOD (RQD) =================
function calcPalmstromRQD() {
    let jv = parseFloat(document.getElementById("p_jv").value);
    if (isNaN(jv) || jv < 0) { alert("Please enter a valid positive number for Jv."); return; }

    let rqd = 115 - 3.3 * jv;
    let clampedRQD = Math.max(0, Math.min(100, rqd));

    document.getElementById("p_resultsCard").innerHTML = `
        <strong>Volumetric Joint Count (Jv):</strong> ${jv} joints/m³<br><br>
        <strong style="color: #c82359; font-size: 1.3em;">Estimated RQD: ${num(clampedRQD)}%</strong><br>
        <strong>Rock Quality:</strong> ${getRQDClass(clampedRQD)}
    `;

    let clampNote = rqd > 100 ? `<br><i>*Note: RQD capped at 100%.</i>` : (rqd < 0 ? `<br><i>*Note: RQD capped at 0%.</i>` : "");

    document.getElementById("p_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        <div class="formula-box">RQD = 115 - 3.3(Jv) = 115 - 3.3(${jv}) = <b>${num(rqd)}%</b></div>
        ${clampNote}
    `;

    document.getElementById("p_resultsArea").style.display = "block";
}

// ================= 3. CALCULATE Q-INDEX =================
function calcQIndex() {
    let rqd = parseFloat(document.getElementById("q_rqd").value);
    let jn = parseFloat(document.getElementById("q_jn").value);
    let jr = parseFloat(document.getElementById("q_jr").value);
    let ja = parseFloat(document.getElementById("q_ja").value);
    let jw = parseFloat(document.getElementById("q_jw").value);
    let srf = parseFloat(document.getElementById("q_srf").value);

    if (isNaN(rqd) || isNaN(jn) || isNaN(jr) || isNaN(ja) || isNaN(jw) || isNaN(srf)) {
        alert("Please enter valid numbers for all parameters."); return;
    }

    if (jn === 0 || ja === 0 || srf === 0) { alert("Divisors (Jn, Ja, SRF) cannot be zero."); return; }

    let block_size = rqd / jn;
    let shear_strength = jr / ja;
    let active_stress = jw / srf;
    let q_value = block_size * shear_strength * active_stress;

    document.getElementById("q_resultsCard").innerHTML = `
        <strong>Structure Quotient (RQD/Jn):</strong> ${numQ(block_size)}<br>
        <strong>Roughness/Friction Quotient (Jr/Ja):</strong> ${numQ(shear_strength)}<br>
        <strong>Stress/Water Quotient (Jw/SRF):</strong> ${numQ(active_stress)}<br><br>
        <strong style="color: #004085; font-size: 1.3em;">Rock Mass Quality (Q): ${numQ(q_value)}</strong><br>
        <strong>Classification:</strong> ${getQClass(q_value)}
    `;

    document.getElementById("q_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        <div class="formula-box">Q = (RQD / Jn) × (Jr / Ja) × (Jw / SRF)</div>
        <div class="formula-box">Q = (${rqd} / ${jn}) × (${jr} / ${ja}) × (${jw} / ${srf})</div>
        <div class="formula-box">Q = ${numQ(block_size)} × ${numQ(shear_strength)} × ${numQ(active_stress)} = <b>${numQ(q_value)}</b></div>
    `;

    document.getElementById("q_resultsArea").style.display = "block";
}

// ================= 4. TUNNEL SUPPORT DESIGN =================
function calcSupportDesign() {
    let q = parseFloat(document.getElementById("s_q").value);
    let b = parseFloat(document.getElementById("s_b").value);
    let esr = parseFloat(document.getElementById("s_esr").value);

    if (isNaN(q) || isNaN(b) || isNaN(esr)) { alert("Please enter valid numbers."); return; }
    if (esr === 0) { alert("ESR cannot be zero."); return; }

    let length_bolts = 2 + (0.15 * b) / esr;
    let max_span = 2 * esr * Math.pow(q, 0.4);

    document.getElementById("s_resultsCard").innerHTML = `
        <strong style="color: #004085;">Required Rockbolt Length (L):</strong> ${numQ(length_bolts)} m<br><br>
        <strong style="color: #c82359;">Maximum Unsupported Span:</strong> ${numQ(max_span)} m
    `;

    document.getElementById("s_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        <div class="formula-box">L = 2 + (0.15 × B) / ESR = 2 + (0.15 × ${b}) / ${esr} = <b>${numQ(length_bolts)} m</b></div>
        <div class="formula-box">Max Span = 2 × ESR × Q^0.4 = 2 × ${esr} × (${q}^0.4) = <b>${numQ(max_span)} m</b></div>
    `;

    document.getElementById("s_resultsArea").style.display = "block";
}