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
        solCard.style.display = "block"; btn.innerText = "Hide Equation Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Equation Proof";
    }
}

// ================= 1. EMPIRICAL CREEP (STAG'S EQ) =================
function calcEmpiricalCreep() {
    let sigma = parseFloat(document.getElementById("c_sigma").value);
    let t = parseFloat(document.getElementById("c_t").value);
    let K = parseFloat(document.getElementById("c_k").value);
    let n = parseFloat(document.getElementById("c_n").value);
    let m = parseFloat(document.getElementById("c_m").value);

    if (isNaN(sigma) || isNaN(t) || isNaN(K) || isNaN(n) || isNaN(m)) {
        alert("Please enter valid numbers."); return;
    }

    // Stag's Formula: ε = K * σ^n * t^m
    let strain = K * Math.pow(sigma, n) * Math.pow(t, m);

    document.getElementById("c_resultsCard").innerHTML = `
        <strong>Calculated Axial Strain (ε):</strong> ${num(strain)}
    `;

    document.getElementById("c_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Equation Proof:</h3>
        <p>Using Stag's Triaxial Extension Creep Equation:</p>
        <div class="formula-box">ε = K × σⁿ × tᵐ</div>
        <div class="formula-box">ε = ${K} × (${sigma}^${n}) × (${t}^${m})</div>
        <div class="formula-box">ε = <b>${num(strain)}</b></div>
    `;

    document.getElementById("c_resultsArea").style.display = "block";
}

// ================= 2. RHEOLOGICAL PLOTTER =================
function drawRheologyCurve() {
    let model = document.getElementById("r_model").value;
    let sigma = parseFloat(document.getElementById("r_sigma").value);
    let tmax = parseFloat(document.getElementById("r_tmax").value);

    if (isNaN(sigma) || isNaN(tmax) || tmax <= 0) {
        alert("Please enter valid positive numbers for Stress and Time."); return;
    }

    let timeArray = [];
    let strainArray = [];
    let steps = 100;
    let formulaHTML = "";
    let endStrain = 0;

    // Generate Points based on selected model
    for (let i = 0; i <= steps; i++) {
        let t = (i / steps) * tmax;
        let e = 0;

        if (model === "maxwell") {
            let k = parseFloat(document.getElementById("m_k").value);
            let eta = parseFloat(document.getElementById("m_eta").value);
            // Maxwell: ε = σ/k + σt/η
            e = (sigma / k) + (sigma * t / eta);
            if (i === steps) {
                endStrain = e;
                formulaHTML = `ε = (σ / k) + (σ * t / η)<br>ε = (${sigma} / ${k}) + (${sigma} * ${tmax} / ${eta}) = <b>${num(e)}</b>`;
            }
        } 
        else if (model === "kelvin") {
            let k = parseFloat(document.getElementById("k_k").value);
            let eta = parseFloat(document.getElementById("k_eta").value);
            // Kelvin: ε = (σ/k) * [1 - e^(-kt/η)]
            e = (sigma / k) * (1 - Math.exp(-(k * t) / eta));
            if (i === steps) {
                endStrain = e;
                formulaHTML = `ε = (σ / k) * [1 - e<sup>(-k*t / η)</sup>]<br>ε = (${sigma} / ${k}) * [1 - e<sup>(-${k}*${tmax} / ${eta})</sup>] = <b>${num(e)}</b>`;
            }
        } 
        else if (model === "burger") {
            let k2 = parseFloat(document.getElementById("b_k2").value);
            let eta2 = parseFloat(document.getElementById("b_eta2").value);
            let k1 = parseFloat(document.getElementById("b_k1").value);
            let eta1 = parseFloat(document.getElementById("b_eta1").value);
            
            // Burger: ε = σ/k2 + σt/η2 + (σ/k1)*[1 - e^(-k1*t/η1)]
            let maxwell_part = (sigma / k2) + (sigma * t / eta2);
            let kelvin_part = (sigma / k1) * (1 - Math.exp(-(k1 * t) / eta1));
            e = maxwell_part + kelvin_part;
            
            if (i === steps) {
                endStrain = e;
                formulaHTML = `ε = (σ / k2) + (σ*t / η2) + (σ / k1)*[1 - e<sup>(-k1*t / η1)</sup>]<br>ε = (${sigma}/${k2}) + (${sigma}*${tmax}/${eta2}) + (${sigma}/${k1})*[1 - e<sup>(-${k1}*${tmax}/${eta1})</sup>] = <b>${num(e)}</b>`;
            }
        }

        timeArray.push(t);
        strainArray.push(e);
    }

    // Plotly Trace
    let trace = {
        x: timeArray,
        y: strainArray,
        mode: 'lines',
        name: 'Creep Curve',
        line: { color: '#8e44ad', width: 3 },
        hovertemplate: `Time: %{x:.1f}<br>Strain (ε): %{y:.5f}<extra></extra>`
    };

    let titleStr = model.charAt(0).toUpperCase() + model.slice(1) + " Model Creep Curve";

    let layout = {
        title: `<b>${titleStr}</b>`,
        xaxis: { title: "Time (t)", zeroline: true, zerolinecolor: 'black' },
        yaxis: { title: "Strain (ε)", zeroline: true, zerolinecolor: 'black' },
        showlegend: false
    };

    document.getElementById("r_resultsArea").style.display = "block";
    Plotly.newPlot('rheologyPlot', [trace], layout, {responsive: true});

    document.getElementById("r_resultsCard").innerHTML = `
        <strong>Final Strain at t = ${tmax}:</strong> ${num(endStrain)}<br><br>
        <strong>Formula used (from notes):</strong><br>
        <div class="formula-box" style="font-size: 0.9em;">${formulaHTML}</div>
    `;
}