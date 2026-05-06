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
        solCard.style.display = "block"; btn.innerText = "Hide Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Full Proof";
    }
}

// ================= 1. PLANE STRAIN TRANSFORMATION =================
function calcStrainTransformation() {
    let ex = parseFloat(document.getElementById("t_ex").value);
    let ey = parseFloat(document.getElementById("t_ey").value);
    let gxy = parseFloat(document.getElementById("t_gxy").value);
    let theta_deg = parseFloat(document.getElementById("t_theta").value);

    if (isNaN(ex) || isNaN(ey) || isNaN(gxy) || isNaN(theta_deg)) {
        alert("Please enter valid numbers."); return;
    }

    let rad = theta_deg * (Math.PI / 180);
    let avg = (ex + ey) / 2;
    let diff = (ex - ey) / 2;
    let half_g = gxy / 2;

    let ex_new = avg + diff * Math.cos(2 * rad) + half_g * Math.sin(2 * rad);
    let ey_new = avg - diff * Math.cos(2 * rad) - half_g * Math.sin(2 * rad);
    let gxy_new_half = -diff * Math.sin(2 * rad) + half_g * Math.cos(2 * rad);
    let gxy_new = gxy_new_half * 2;

    // Results
    document.getElementById("t_resultsCard").innerHTML = `
        <strong>Transformed Normal Strain (εx'):</strong> ${num(ex_new)}<br>
        <strong>Transformed Normal Strain (εy'):</strong> ${num(ey_new)}<br>
        <strong>Transformed Shear Strain (γx'y'):</strong> ${num(gxy_new)}
    `;

    // Proof
    document.getElementById("t_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Solution Steps:</h3>
        <p><strong>1. Calculate Constants:</strong></p>
        <div class="formula-box">Average = (εx + εy) / 2 = (${ex} + ${ey}) / 2 = ${num(avg)}</div>
        <div class="formula-box">Difference = (εx - εy) / 2 = (${ex} - ${ey}) / 2 = ${num(diff)}</div>
        <div class="formula-box">Half-Shear = γxy / 2 = ${gxy} / 2 = ${num(half_g)}</div>
        
        <p><strong>2. Apply Transformation Equations:</strong></p>
        <p>εx' = Avg + Diff*cos(2θ) + Half-Shear*sin(2θ)</p>
        <div class="formula-box">εx' = ${num(avg)} + ${num(diff)}*cos(${2*theta_deg}°) + ${num(half_g)}*sin(${2*theta_deg}°) = <b>${num(ex_new)}</b></div>
        
        <p>εy' = Avg - Diff*cos(2θ) - Half-Shear*sin(2θ)</p>
        <div class="formula-box">εy' = ${num(avg)} - ${num(diff)}*cos(${2*theta_deg}°) - ${num(half_g)}*sin(${2*theta_deg}°) = <b>${num(ey_new)}</b></div>
        
        <p>γx'y' / 2 = -Diff*sin(2θ) + Half-Shear*cos(2θ)</p>
        <div class="formula-box">γx'y'/2 = -${num(diff)}*sin(${2*theta_deg}°) + ${num(half_g)}*cos(${2*theta_deg}°) = ${num(gxy_new_half)}</div>
        <div class="formula-box">γx'y' = 2 * ${num(gxy_new_half)} = <b>${num(gxy_new)}</b></div>
    `;

    document.getElementById("t_resultsArea").style.display = "block";
}

// ================= 2. PRINCIPAL STRAINS =================
function calcPrincipalStrains() {
    let ex = parseFloat(document.getElementById("p_ex").value);
    let ey = parseFloat(document.getElementById("p_ey").value);
    let gxy = parseFloat(document.getElementById("p_gxy").value);

    if (isNaN(ex) || isNaN(ey) || isNaN(gxy)) {
        alert("Please enter valid numbers."); return;
    }

    let avg = (ex + ey) / 2;
    let diff = (ex - ey) / 2;
    let half_g = gxy / 2;

    let R = Math.sqrt(Math.pow(diff, 2) + Math.pow(half_g, 2));
    let e1 = avg + R;
    let e2 = avg - R;
    let gamma_max = 2 * R;
    let theta_p_rad = Math.atan2(gxy, ex - ey) / 2;
    let theta_p_deg = theta_p_rad * (180 / Math.PI);

    // Results
    document.getElementById("p_resultsCard").innerHTML = `
        <strong>Major Principal Strain (ε1):</strong> ${num(e1)}<br>
        <strong>Minor Principal Strain (ε2):</strong> ${num(e2)}<br>
        <strong>Max In-Plane Shear Strain (γ_max):</strong> ${num(gamma_max)}<br>
        <strong>Principal Angle (θp):</strong> ${num(theta_p_deg)}°
    `;

    // Proof
    document.getElementById("p_solutionCard").innerHTML = `
        <h3 style="margin-top:0;">Solution Steps:</h3>
        <p><strong>1. Center of Circle (Average Strain):</strong></p>
        <div class="formula-box">C = (εx + εy) / 2 = (${ex} + ${ey}) / 2 = ${num(avg)}</div>
        
        <p><strong>2. Radius of Strain Circle (R):</strong></p>
        <div class="formula-box">R = √[ ((εx - εy)/2)² + (γxy/2)² ]</div>
        <div class="formula-box">R = √[ (${num(diff)})² + (${num(half_g)})² ] = ${num(R)}</div>
        
        <p><strong>3. Principal Strains (ε1, ε2):</strong></p>
        <div class="formula-box">ε1 = C + R = ${num(avg)} + ${num(R)} = <b>${num(e1)}</b></div>
        <div class="formula-box">ε2 = C - R = ${num(avg)} - ${num(R)} = <b>${num(e2)}</b></div>
        
        <p><strong>4. Max Shear Strain (γ_max):</strong></p>
        <p>Note: Max shear strain is twice the radius of the Mohr circle.</p>
        <div class="formula-box">γ_max = 2 * R = 2 * ${num(R)} = <b>${num(gamma_max)}</b></div>
    `;

    document.getElementById("p_resultsArea").style.display = "block";
}

// ================= 3. MOHR'S CIRCLE FOR STRAIN =================
function drawStrainMohrCircle() {
    let ex = parseFloat(document.getElementById("m_ex").value);
    let ey = parseFloat(document.getElementById("m_ey").value);
    let gxy = parseFloat(document.getElementById("m_gxy").value);
    let unit = document.getElementById("m_unit").value;

    if (isNaN(ex) || isNaN(ey) || isNaN(gxy)) {
        alert("Please enter valid numbers."); return;
    }

    let avg = (ex + ey) / 2;
    let diff = (ex - ey) / 2;
    let half_g = gxy / 2; // VERY IMPORTANT: Strain circle plots γ/2

    let R = Math.sqrt(Math.pow(diff, 2) + Math.pow(half_g, 2));
    let e1 = avg + R;
    let e2 = avg - R;

    document.getElementById("m_resultsCard").innerHTML = `
        <strong>Center (C):</strong> ${num(avg)} ${unit}<br>
        <strong>Radius (R):</strong> ${num(R)} ${unit}<br>
        <strong>Major Principal Strain (ε1):</strong> ${num(e1)} ${unit}<br>
        <strong>Minor Principal Strain (ε2):</strong> ${num(e2)} ${unit}<br>
        <strong>Max In-Plane Shear (γ_max):</strong> ${num(2*R)} ${unit}
    `;

    // Make div visible before Plotly!
    document.getElementById("m_outputArea").style.display = "block";

    // Call Plotly Engine
    renderStrainPlot(ex, ey, half_g, avg, R, e1, e2, unit);
}

function renderStrainPlot(ex, ey, half_g, center, R, e1, e2, unit) {
    let circleX = [], circleY = [];
    for (let i = 0; i <= 360; i++) {
        let rad = i * Math.PI / 180;
        circleX.push(num(center + R * Math.cos(rad)));
        circleY.push(num(R * Math.sin(rad))); // Plotting half_g
    }

    let traceCircle = {
        x: circleX, y: circleY, mode: 'lines', name: 'Mohr Circle',
        line: { color: 'red', width: 2 }, hoverinfo: 'x+y',
        hovertemplate: `ε: %{x} ${unit}<br>γ/2: %{y} ${unit}<extra></extra>`
    };

    // The Line connecting X-Face (ex, half_g) and Y-Face (ey, -half_g)
    let traceLine = {
        x: [ex, ey], y: [half_g, -half_g], mode: 'lines+markers', name: 'Plane Strains',
        line: { color: 'blue', width: 2 }, marker: { size: 9, color: ['black', 'green'] }, 
        text: ['<b>X-Face</b>', '<b>Y-Face</b>'], hoverinfo: 'text+x+y',
        hovertemplate: `%{text}<br>ε: %{x} ${unit}<br>γ/2: %{y} ${unit}<extra></extra>`
    };
    
    let tracePoints = {
        x: [center, e1, e2, center], y: [0, 0, 0, R], mode: 'markers+text', name: 'Key Points',
        text: ['C', 'ε1', 'ε2', 'γ_max/2'], textposition: ['bottom right', 'bottom right', 'bottom left', 'top center'],
        marker: { color: 'black', size: 10, symbol: ['circle', 'triangle-up', 'triangle-up', 'triangle-up'] },
        hoverinfo: 'text+x+y'
    };

    let layout = {
        title: "<b>Mohr's Circle for Strain</b>",
        xaxis: { title: `Normal Strain, ε (${unit})`, zeroline: true, zerolinecolor: 'black', zerolinewidth: 1.5 },
        yaxis: { title: `Half-Shear Strain, γ/2 (${unit})`, zeroline: true, zerolinecolor: 'black', zerolinewidth: 1.5, scaleanchor: "x", scaleratio: 1 },
        showlegend: false, hovermode: 'closest'
    };

    Plotly.newPlot('strainMohrPlot', [traceCircle, traceLine, tracePoints], layout, {responsive: true});
}