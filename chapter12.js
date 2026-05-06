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

// ================= ELLIPTICAL BOUNDARY STRESSES =================
function calcEllipticalStresses() {
    let p = parseFloat(document.getElementById("e_p").value);
    let k = parseFloat(document.getElementById("e_k").value);
    let w = parseFloat(document.getElementById("e_w").value);
    let h = parseFloat(document.getElementById("e_h").value);

    if (isNaN(p) || isNaN(k) || isNaN(w) || isNaN(h)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    if (h <= 0 || w <= 0) {
        alert("Width and Height must be greater than zero."); return;
    }

    // Calculate Shape Ratio (q)
    let q = w / h;

    // Calculate Stresses using the provided formulas
    // σA = p(1 - K + 2q)
    let sigma_a = p * (1 - k + 2 * q);

    // σB = p(K - 1 + 2K/q)
    let sigma_b = p * (k - 1 + (2 * k) / q);

    document.getElementById("e_resultsCard").innerHTML = `
        <strong>Shape Ratio (q = W/H):</strong> ${num(q)}<br><br>
        <strong style="color: #004085;">Stress at Sidewall (σA):</strong> ${num(sigma_a)} MPa<br>
        <strong style="color: #c82359;">Stress at Roof/Crown (σB):</strong> ${num(sigma_b)} MPa
    `;

    document.getElementById("e_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        
        <p><strong>1. Calculate Shape Ratio (q):</strong></p>
        <div class="formula-box">q = W / H = ${w} / ${h} = ${num(q)}</div>
        
        <p><strong>2. Stress at Sidewall (Point A):</strong></p>
        <div class="formula-box">σA = p * (1 - K + 2q)</div>
        <div class="formula-box">σA = ${p} * (1 - ${k} + 2(${num(q)})) = <b>${num(sigma_a)} MPa</b></div>
        
        <p><strong>3. Stress at Roof/Crown (Point B):</strong></p>
        <div class="formula-box">σB = p * (K - 1 + 2K/q)</div>
        <div class="formula-box">σB = ${p} * (${k} - 1 + 2(${k})/${num(q)}) = <b>${num(sigma_b)} MPa</b></div>
    `;

    document.getElementById("e_resultsArea").style.display = "block";
}