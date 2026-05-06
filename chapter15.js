// FORMATTER
function num(val) { 
    let abs = Math.abs(val);
    if (abs > 0 && abs < 0.0001) return val.toExponential(4);
    return parseFloat(val.toFixed(6)); 
}
function numRes(val) { return parseFloat(val.toFixed(3)); }

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
        solCard.style.display = "block"; btn.innerText = "Hide Solution Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Solution Proof";
    }
}

// ================= 1. MOHR-COULOMB ANALYSIS (LINEAR) =================
function calcMohrCoulomb() {
    let c = parseFloat(document.getElementById("f_c").value);
    let phi_deg = parseFloat(document.getElementById("f_phi").value);
    let sigma = parseFloat(document.getElementById("f_sigma").value);
    let tau_applied = parseFloat(document.getElementById("f_tau").value); // Optional

    if (isNaN(c) || isNaN(phi_deg) || isNaN(sigma)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    let phi_rad = phi_deg * (Math.PI / 180);
    // Formula: τ_max = c + σ * tan(φ)
    let tau_max = c + sigma * Math.tan(phi_rad);

    let safetyText = "";
    if (!isNaN(tau_applied)) {
        let fos = tau_max / tau_applied;
        if (fos < 1) safetyText = `<br><br><strong style="color: #721c24;">STATUS: FAILURE! (Applied τ > Strength)</strong><br>Factor of Safety = ${num(fos)}`;
        else safetyText = `<br><br><strong style="color: #155724;">STATUS: SAFE</strong><br>Factor of Safety = ${num(fos)}`;
    }

    document.getElementById("f_resultsCard").innerHTML = `
        <strong>Linear Shear Strength (τ_max):</strong> ${numRes(tau_max)} MPa
        ${safetyText}
    `;

    document.getElementById("f_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Linear Equation Proof:</h3>
        <p>Using the Classic Mohr-Coulomb failure equation (straight line):</p>
        <div class="formula-box">τ = c + σ × tan(φ)</div>
        <div class="formula-box">τ = ${c} + ${sigma} × tan(${phi_deg}°) = <b>${num(tau_max)} MPa</b></div>
    `;

    document.getElementById("f_resultsArea").style.display = "block";

    // Draw Plotly Graph (Linear)
    drawLinearEnvelope(c, phi_rad, sigma, tau_max, tau_applied);
}

// ================= PLOTLY GRAPH (UPDATED WITH TANGENT CIRCLES) =================
function drawLinearEnvelope(c, phi_rad, sigma_input, tau_max, tau_applied) {
    let data = [];
    
    // 1. Calculate the Flow Value (N_phi) from the user's third image
    let N_phi = (1 + Math.sin(phi_rad)) / (1 - Math.sin(phi_rad));
    let sqrt_N_phi = Math.sqrt(N_phi);

    // 2. Generate 3 representative confining stresses (sigma_3) to draw circles
    let sig3_vals = [0, sigma_input * 0.5, sigma_input * 1.2]; 
    if (sigma_input === 0) sig3_vals = [0, 5, 10]; // Fallback if input is 0

    let max_sigma1 = 0;
    let circleColors = ['#9e9e9e', '#757575', '#424242'];

    // 3. Draw the Tangent Mohr Circles
    for (let j = 0; j < sig3_vals.length; j++) {
        let s3 = sig3_vals[j];
        
        // Mohr-Coulomb principal stress relationship at failure
        let s1 = s3 * N_phi + 2 * c * sqrt_N_phi;
        if (s1 > max_sigma1) max_sigma1 = s1;

        let center = (s1 + s3) / 2;
        let radius = (s1 - s3) / 2;

        let circleX = []; let circleY = [];
        for (let k = 0; k <= 180; k++) {
            let rad = k * (Math.PI / 180);
            circleX.push(num(center + radius * Math.cos(rad)));
            circleY.push(num(radius * Math.sin(rad)));
        }

        let traceCircle = {
            x: circleX, y: circleY, mode: 'lines', name: `Test Circle #${j+1}`,
            line: { color: circleColors[j % 3], width: 1.5, dash: 'dash' },
            showlegend: false, hoverinfo: 'skip'
        };
        data.push(traceCircle);
    }

    // 4. Draw the Failure Envelope Line
    let max_x = max_sigma1 * 1.05; // Extend line slightly past the last circle
    let sigma_vals = [0, max_x];
    let tau_vals = [c, c + max_x * Math.tan(phi_rad)];

    let traceEnvelope = {
        x: sigma_vals, y: tau_vals, mode: 'lines', name: 'Failure Envelope',
        line: { color: '#dc3545', width: 3 },
        hovertemplate: `σ: %{x:.2f} MPa<br>τ_max: %{y:.2f} MPa<extra></extra>`
    };
    data.push(traceEnvelope);

    // 5. Plot the User's specific input point
    let traceStrengthPoint = {
        x: [sigma_input], y: [tau_max], mode: 'markers+text', name: 'Target Strength Limit',
        text: ['Target Limit'], textposition: 'top left',
        marker: { size: 10, color: 'black' },
        hovertemplate: `σ: %{x} MPa<br>τ_max: %{y:.2f} MPa<extra></extra>`
    };
    data.push(traceStrengthPoint);

    // 6. Optional Applied Stress Point
    if (!isNaN(tau_applied)) {
        let pointColor = tau_applied >= tau_max ? 'red' : 'green';
        let traceApplied = {
            x: [sigma_input], y: [tau_applied], mode: 'markers+text', name: 'Applied Stress',
            text: ['Applied State'], textposition: 'bottom right',
            marker: { size: 12, color: pointColor, symbol: 'star' },
            hovertemplate: `σ: %{x} MPa<br>τ_applied: %{y} MPa<extra></extra>`
        };
        data.push(traceApplied);
    }

    let layout = {
        title: "<b>Mohr-Coulomb Failure Envelope</b>",
        xaxis: { title: "Normal Stress (σ) [MPa]", zeroline: true, zerolinecolor: 'black', mirror: true },
        yaxis: { title: "Shear Stress (τ) [MPa]", zeroline: true, zerolinecolor: 'black', mirror: true, scaleanchor: "x", scaleratio: 1 },
        showlegend: true, legend: { x: 0, y: 1 }
    };

    Plotly.newPlot('failurePlot', data, layout, {responsive: true});
}


// ================= 2. HOEK-BROWN (NON-LINEAR) ANALYSIS =================
function calcHoekBrown() {
    let sci = parseFloat(document.getElementById("h_sci").value);
    let mb = parseFloat(document.getElementById("h_mb").value);
    let s = parseFloat(document.getElementById("h_s").value);
    let a = parseFloat(document.getElementById("h_a").value);

    if (isNaN(sci) || isNaN(mb) || isNaN(s) || isNaN(a) || sci <= 0) {
        alert("Please enter valid numbers in all fields. UCS must be positive."); return;
    }

    // Mathematical Keypoints from Generalized Hoek-Brown relationships:
    
    // 1. Rock Mass Uniaxial Compressive Strength (at sigma_3 = 0)
    // σcm = σci * s^a
    let sig_cm = sci * Math.pow(s, a);

    // 2. Rock Mass Tensile Strength (sig_1 = sig_3, results in the vertex of parabolic envelope)
    // -s / mb = (sig_t / sig_ci)
    let sig_t = - (s * sci) / mb;

    // 3. To define the curve physically on Plotly, we need to convert the relationships
    // of σ1 vs σ3 into the corresponding normal and shear stresses (σn, τ) on the envelope.
    // This requires specific derived equations:

    let envelopePointsX = [];
    let envelopePointsY = [];
    let maxConfinement = sci; // Plotting up to UCS is a good range
    let steps = 150;

    for (let i = 0; i <= steps; i++) {
        // We generate σ3 values from sig_t (the starting vertex) up to UCS
        let s3 = sig_t + (maxConfinement - sig_t) * (i / steps);
        
        // Generalized Hoek-Brown formula: σ1 = σ3 + σci * (mb * σ3 / σci + s)^a
        let innerTerm = (mb * s3 / sci) + s;
        if (innerTerm < 0) continue; // Skip physical impossibilities close to vertex

        let termA = Math.pow(innerTerm, a);
        let s1 = s3 + sci * termA;

        // Formula for the smooth curve plotting normal stress (sigma_n) and shear stress (tau)
        // using the derivative ds1/ds3 at Mohr's tangency conditions.
        
        // derivative ds1/ds3:
        let termAMin1 = Math.pow(innerTerm, a - 1);
        let ds1_ds3 = 1 + a * mb * termAMin1;

        // Resulting points (sigma_n, tau) on the curved envelope
        let sigma_n = s3 + (s1 - s3) / (1 + ds1_ds3);
        let tau = Math.sqrt(Math.max(0, (sigma_n - s3) * (s1 - sigma_n))); // ensure positive inside sqrt

        envelopePointsX.push(num(sigma_n));
        envelopePointsY.push(num(tau));
    }

    // Results Summary
    document.getElementById("h_resultsCard").innerHTML = `
        <strong>Analysis complete. Non-Linear curve generated.</strong><br><br>
        <strong>Rock Mass UCS (σcm):</strong> ${numRes(sig_cm)} MPa<br>
        <strong>Rock Mass Tensile Strength (σt):</strong> ${numRes(sig_t)} MPa
    `;

    document.getElementById("h_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Non-Linear Solution Proof:</h3>
        <p>Your input requested the *curved* envelope tangent to Mohr circles. This is generated using the **Generalized Hoek-Brown failure criterion**. The smooth curve plotted (τ vs σn) is derived from the tangency points of the principal stress relationship:</p>
        <div class="formula-box">σ1 = σ3 + σci * (mb * σ3 / σci + s)ᵃ</div>
        
        <p>1. Rock Mass UCS (σcm):</p>
        <div class="formula-box">σcm = σci × sᵃ = ${sci} × ${s}^${a} = <b>${numRes(sig_cm)} MPa</b></div>
        
        <p>2. Rock Mass Tensile Strength (σt):</p>
        <div class="formula-box">σt = - (s × σci) / mb = - (${s} × ${sci}) / ${mb} = <b>${numRes(sig_t)} MPa</b></div>

        <p>3. Dynamic Curve Generation:</p>
        <p>The graph dynamically calculates points for the curved envelope by iteratively evaluating the complex trigonometric and derivative relationships required for the (τ, σn) plot shown in your textbook image.</p>
    `;

    document.getElementById("h_resultsArea").style.display = "block";

    // Draw the Plotly graph matching the uploaded image exactly
    drawHoekBrownPlot(sci, mb, s, a, envelopePointsX, envelopePointsY, sig_t, maxConfinement);
}

function drawHoekBrownPlot(sci, mb, s, a, curveX, curveY, vertexX, maxStress) {
    
    // Trace 1: The Non-Linear Curved Envelope Line (Red)
    let traceEnvelope = {
        x: curveX, y: curveY, mode: 'lines', name: 'Curved Failure Envelope',
        line: { color: '#dc3545', width: 3 },
        hovertemplate: `Normal Stress (σn): %{x} MPa<br>Shear Strength (τ): %{y:.2f} MPa<extra></extra>`
    };

    let data = [traceEnvelope];

    // Traces 2, 3, 4: Multiple Generated Mohr Circles tangent to the curve
    // (Matches the visual appearance of the uploaded textbook image)
    
    // Selecting 3 sigma3 values across the range (low, medium, high confinement)
    let sigma3_values = [
        vertexX * 0.9,             // Near tensile strength (causes vertex arc)
        vertexX + (maxStress/1.5 - vertexX) * 0.33,  // Low confinement
        vertexX + (maxStress/1.5 - vertexX) * 0.7   // High confinement
    ];
    let circleColors = ['#9e9e9e', '#757575', '#424242']; // Gray tones for the circles

    for(let j = 0; j < sigma3_values.length; j++) {
        let s3 = sigma3_values[j];
        
        // 1. Solve for corresponding s1
        let inner = (mb * s3 / sci) + s;
        if (inner < 0) continue;
        let s1 = s3 + sci * Math.pow(inner, a);

        // 2. Center and Radius of the Mohr Circle
        let center = (s1 + s3) / 2;
        let radius = (s1 - s3) / 2;

        // 3. Generate points for a clean Plotly arc (semi-circle on positive Y)
        let circleX = []; let circleY = [];
        for(let k = 0; k <= 180; k++) {
            let rad = k * (Math.PI / 180);
            circleX.push(num(center + radius * Math.cos(rad)));
            circleY.push(num(radius * Math.sin(rad)));
        }

        let traceCircle = {
            x: circleX, y: circleY, mode: 'lines', name: `Mohr Circle #${j+1}`,
            line: { color: circleColors[j], width: 1, dash: 'dash' },
            showlegend: false, hoverinfo: 'skip'
        };
        data.push(traceCircle);
    }

    let layout = {
        title: "<b>Hoek-Brown (Nonlinear) Failure Envelope</b>",
        xaxis: { title: "Normal Stress (σn) [MPa]", zeroline: true, zerolinecolor: 'black', mirror: true },
        yaxis: { title: "Shear Strength (τ) [MPa]", zeroline: true, zerolinecolor: 'black', mirror: true, scaleanchor: "x", scaleratio: 1 },
        showlegend: true, hovermode: 'closest',
        annotations: [{
            x: vertexX, y: 0, text: "σt (Tensile Strength)", ax: -50, ay: 40, showarrow: true, arrowhead: 2
        }]
    };

    Plotly.newPlot('hoekPlot', data, layout, {responsive: true});
}