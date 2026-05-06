// FORMATTER: Cleans up numbers
function num(val) {
    return parseFloat(val.toFixed(4));
}

function drawMohrCircle() {
    let sx = parseFloat(document.getElementById("m_sx").value);
    let sy = parseFloat(document.getElementById("m_sy").value);
    let txy = parseFloat(document.getElementById("m_txy").value);
    let unit = document.getElementById("m_stressUnit").value;

    if (isNaN(sx) || isNaN(sy) || isNaN(txy)) {
        alert("Please enter valid numbers in all fields."); return;
    }

    // 1. Math Calculations
    let center = (sx + sy) / 2;
    let diff = (sx - sy) / 2;
    let radius = Math.sqrt(Math.pow(diff, 2) + Math.pow(txy, 2));
    
    let s1 = center + radius;
    let s2 = center - radius;

    // Calculate both Principal Angles
    let thetaP1_rad = 0.5 * Math.atan2(txy, diff); 
    let thetaP1_deg = thetaP1_rad * (180 / Math.PI);
    
    // theta p2 is always 90 degrees away from theta p1
    let thetaP2_deg = thetaP1_deg > 0 ? thetaP1_deg - 90 : thetaP1_deg + 90;

    // 2. Display Text Results (Matching your new screenshot!)
    document.getElementById("m_basicResults").innerHTML = `
        <strong>Center of Circle (C) :</strong> ${num(center)} ${unit}<br>
        <strong>Radius of Circle (R) :</strong> ${num(radius)} ${unit}<br>
        <strong>Major Principal (σ<sub>1</sub>) :</strong> ${num(s1)} ${unit}<br>
        <strong>Minor Principal (σ<sub>2</sub>) :</strong> ${num(s2)} ${unit}<br><br>
        <strong>Rotation to Max Principal Plane (θ<sub>p1</sub>) :</strong> ${num(thetaP1_deg)}°<br>
        <strong>Rotation to Min Principal Plane (θ<sub>p2</sub>) :</strong> ${num(thetaP2_deg)}°
    `;

    // 3. Draw the Interactive Graph!
    renderPlotlyGraph(sx, sy, txy, center, radius, s1, s2, unit);

    // 4. Generate the Solution Proof
    let solHTML = `
        <h2 style="color: #2c3e50;">Solution Steps (Proof):</h2>
        <div class="data-box">
            <div>σ<sub>x</sub> = ${sx} ${unit}</div>
            <div>σ<sub>y</sub> = ${sy} ${unit}</div>
            <div>τ<sub>xy</sub> = ${txy} ${unit}</div>
        </div>
        
        <p><strong>Step 1:</strong> Locate the Center of the Circle (C)</p>
        <div class="formula-box">C = (σ<sub>x</sub> + σ<sub>y</sub>) / 2 = ${num(center)} ${unit}</div>

        <p><strong>Step 2:</strong> Calculate the Radius of the Circle (R)</p>
        <div class="formula-box">R = √[ ((σ<sub>x</sub> - σ<sub>y</sub>) / 2)² + τ<sub>xy</sub>² ] = ${num(radius)} ${unit}</div>

        <p><strong>Step 3:</strong> Find the Principal Stresses (σ<sub>1</sub>, σ<sub>2</sub>)</p>
        <div class="formula-box">σ<sub>1,2</sub> = C ± R => σ<sub>1</sub> = ${num(s1)}, σ<sub>2</sub> = ${num(s2)}</div>
        
        <p><strong>Step 4:</strong> Find Principal Angles (θ<sub>p1</sub>, θ<sub>p2</sub>)</p>
        <div class="formula-box">θ<sub>p1</sub> = 0.5 * arctan(τ<sub>xy</sub> / ((σ<sub>x</sub> - σ<sub>y</sub>) / 2)) = ${num(thetaP1_deg)}°</div>
        <div class="formula-box">θ<sub>p2</sub> = θ<sub>p1</sub> ± 90° = ${num(thetaP2_deg)}°</div>
    `;

    document.getElementById("m_solutionCard").innerHTML = solHTML;
    document.getElementById("m_resultsCard").style.display = "block";
    document.getElementById("m_solutionCard").style.display = "none";
    document.getElementById("m_btnToggle").innerText = "Show Full Proof";
}

function toggleMohrSolution() {
    let solCard = document.getElementById("m_solutionCard");
    let btn = document.getElementById("m_btnToggle");
    if (solCard.style.display === "none") {
        solCard.style.display = "block"; btn.innerText = "Hide Full Proof";
    } else {
        solCard.style.display = "none"; btn.innerText = "Show Full Proof";
    }
}

// ================= PLOTLY INTERACTIVE GRAPHING ENGINE =================
// ================= PLOTLY INTERACTIVE GRAPHING ENGINE =================
// ================= PLOTLY INTERACTIVE GRAPHING ENGINE =================
// ================= PLOTLY INTERACTIVE GRAPHING ENGINE =================
function renderPlotlyGraph(sx, sy, txy, center, R, s1, s2, unit) {
    
    // 1. Generate coordinates for the full circle
    let circleX = [];
    let circleY = [];
    for (let i = 0; i <= 360; i++) {
        let rad = i * Math.PI / 180;
        circleX.push(num(center + R * Math.cos(rad)));
        circleY.push(num(R * Math.sin(rad)));
    }

    // Trace 1: The Circle Outline (Red)
    let traceCircle = {
        x: circleX,
        y: circleY,
        mode: 'lines',
        name: 'Mohr Circle',
        line: { color: 'red', width: 2 },
        hoverinfo: 'x+y',
        hovertemplate: `σ: %{x} ${unit}<br>τ: %{y} ${unit}<extra></extra>`
    };

    // Trace 2: The Diameter Line connecting X-Face and Y-Face
    let traceLine = {
        x: [sx, sy],
        y: [txy, -txy], 
        mode: 'lines+markers',
        name: 'Plane Stresses',
        line: { color: 'blue', width: 2 },
        marker: { size: 9, color: ['black', 'green'] }, 
        text: ['<b>X-Face</b>', '<b>Y-Face</b>'], 
        hoverinfo: 'text+x+y',
        hovertemplate: `%{text}<br>σ: %{x} ${unit}<br>τ: %{y} ${unit}<extra></extra>`
    };

    // Trace 3: Dashed Projection Lines for X-Face (Black)
    let traceProjX = {
        x: [0, sx, sx],
        y: [txy, txy, 0],
        mode: 'lines',
        line: { dash: 'dash', color: 'black', width: 1.5 },
        hoverinfo: 'skip'
    };

    // Trace 4: Dashed Projection Lines for Y-Face (Green)
    let traceProjY = {
        x: [0, sy, sy],
        y: [-txy, -txy, 0],
        mode: 'lines',
        line: { dash: 'dash', color: 'green', width: 1.5 },
        hoverinfo: 'skip'
    };

    // Trace 5: Labels directly on the X and Y axes
    let traceAxisPoints = {
        x: [sx, sy, 0, 0],
        y: [0, 0, txy, -txy],
        mode: 'markers+text',
        text: ['σx', 'σy', 'τ', '-τ'],
        textposition: ['bottom right', 'bottom right', 'middle left', 'middle left'],
        marker: { color: ['black', 'green', 'black', 'green'], size: 6 },
        hoverinfo: 'skip'
    };

    // Trace 6: Key Identifiable Points
    let tracePoints = {
        x: [center, s1, s2, center],
        y: [0, 0, 0, R],
        mode: 'markers+text',
        name: 'Key Points',
        text: ['C', 'σ1', 'σ2', 'τ_max'],
        textposition: ['bottom right', 'bottom right', 'bottom left', 'top center'],
        marker: { 
            color: 'black', 
            size: 10, 
            symbol: ['circle', 'triangle-up', 'triangle-up', 'triangle-up'] 
        },
        hoverinfo: 'text+x+y',
        hovertemplate: `<b>%{text}</b><br>σ: %{x} ${unit}<br>τ: %{y} ${unit}<extra></extra>`
    };

    // ==========================================
    // NEW ADDITIONS: Drawing the Angle Arc (2θp)
    // ==========================================
    
    // Calculate the angle of the X-Face in radians
    let angleX_rad = Math.atan2(txy, sx - center);
    
    let arcX = [];
    let arcY = [];
    let r_arc = R * 0.25; // Make the arc 25% of the circle's radius
    let steps = 30;
    
    // Draw an arc from the horizontal axis (0) up to the blue line (angleX_rad)
    for (let i = 0; i <= steps; i++) {
        let currentRad = 0 + (angleX_rad - 0) * (i / steps);
        arcX.push(center + r_arc * Math.cos(currentRad));
        arcY.push(r_arc * Math.sin(currentRad));
    }

    // Trace 7: The Arc Line
    let traceArc = {
        x: arcX,
        y: arcY,
        mode: 'lines',
        line: { color: 'black', width: 1.5 },
        hoverinfo: 'skip'
    };

    // Trace 8: The Text Label for 2θp
    let textRad = angleX_rad / 2; // Position text halfway up the arc
    let textR = R * 0.35; // Push text slightly outside the arc curve
    let twoThetaDeg = num(angleX_rad * (180 / Math.PI));

    let traceArcLabel = {
        x: [center + textR * Math.cos(textRad)],
        y: [textR * Math.sin(textRad)],
        mode: 'text',
        text: [`2θp = ${twoThetaDeg}°`],
        textfont: { size: 13, color: 'black', family: 'Arial' },
        hoverinfo: 'skip'
    };

    // The Layout
    let layout = {
        title: "<b>Interactive Mohr's Circle</b>",
        xaxis: { 
            title: `Normal Stress, σ (${unit})`, 
            zeroline: true, 
            zerolinecolor: 'black', 
            zerolinewidth: 1.5,
            gridcolor: '#e0e0e0' 
        },
        yaxis: { 
            title: `Shear Stress, τ (${unit})`, 
            zeroline: true, 
            zerolinecolor: 'black',
            zerolinewidth: 1.5,
            gridcolor: '#e0e0e0',
            scaleanchor: "x", 
            scaleratio: 1 
        },
        showlegend: false,
        hovermode: 'closest'
    };

    // Render all 8 layers to the screen!
    Plotly.newPlot('mohrPlot', [traceCircle, traceLine, traceProjX, traceProjY, traceAxisPoints, tracePoints, traceArc, traceArcLabel], layout, {responsive: true});
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