// FORMATTER
function num(val) { return parseFloat(val.toExponential(4)); }

// ================= INTERFACE SWAPPING LOGIC =================
function openInterface(interfaceId) {
    document.getElementById("topicMenu").style.display = "none";
    document.getElementById("mainBackButton").style.display = "none";
    document.getElementById(interfaceId).style.display = "block";
}

function closeInterface() {
    let interfaces = document.getElementsByClassName("calc-interface");
    for(let i = 0; i < interfaces.length; i++) {
        interfaces[i].style.display = "none";
    }
    document.getElementById("topicMenu").style.display = "block";
    document.getElementById("mainBackButton").style.display = "inline-block";
}

// ================= 1. 3D HOOKE'S LAW ENGINE =================
function calculate3DHooke() {
    let E_gpa = parseFloat(document.getElementById("h_E").value);
    let nu = parseFloat(document.getElementById("h_nu").value);
    let sx = parseFloat(document.getElementById("h_sx").value) || 0;
    let sy = parseFloat(document.getElementById("h_sy").value) || 0;
    let sz = parseFloat(document.getElementById("h_sz").value) || 0;

    if (isNaN(E_gpa) || isNaN(nu) || E_gpa <= 0) {
        alert("Please enter valid positive numbers for E and ν."); return;
    }

    // Convert E from GPa to MPa to match stress inputs
    let E_mpa = E_gpa * 1000;

    // Generalized Hooke's Law formulas
    let ex = (sx - nu * (sy + sz)) / E_mpa;
    let ey = (sy - nu * (sx + sz)) / E_mpa;
    let ez = (sz - nu * (sx + sy)) / E_mpa;

    // Volumetric strain
    let ev = ex + ey + ez;

    let html = `
        <h3>Strain Results (Unitless):</h3>
        <p><strong>Strain in X (εx):</strong> ${num(ex)}</p>
        <p><strong>Strain in Y (εy):</strong> ${num(ey)}</p>
        <p><strong>Strain in Z (εz):</strong> ${num(ez)}</p>
        <hr>
        <p><strong>Volumetric Strain (εv):</strong> ${num(ev)}</p>
    `;

    let resCard = document.getElementById("hooke3dResults");
    resCard.innerHTML = html;
    resCard.style.display = "block";
}

// ================= 2. POISSON EFFECT CANVAS =================
function drawPoissonEffect() {
    let sy = parseFloat(document.getElementById("v_sy").value);
    let E_gpa = parseFloat(document.getElementById("v_E").value);
    let nu = parseFloat(document.getElementById("v_nu").value);

    if (isNaN(sy) || isNaN(E_gpa) || isNaN(nu) || E_gpa <= 0) {
        alert("Please enter valid numbers."); return;
    }

    let canvas = document.getElementById("poissonCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Math calculation (Assume uniaxial stress in Y, so sx=0, sz=0)
    let E_mpa = E_gpa * 1000;
    let ey = sy / E_mpa;       // Axial strain
    let ex = -nu * ey;         // Lateral strain (Poisson effect)

    document.getElementById("poissonResult").innerHTML = 
        `Axial Strain (εy): ${num(ey)} <br> Lateral Strain (εx): ${num(ex)}`;

    // Graphics Settings
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let baseW = 150; 
    let baseH = 250; 

    // Scale visual strains up dramatically just so we can see them on screen
    let visualMultiplier = 3000; 
    let visualDy = (ey * baseH * visualMultiplier);
    let visualDx = (ex * baseW * visualMultiplier);

    // Cap visuals so it doesn't break canvas
    if (visualDy > 100) visualDy = 100; if (visualDy < -100) visualDy = -100;
    if (visualDx > 100) visualDx = 100; if (visualDx < -100) visualDx = -100;

    let newW = baseW + visualDx;
    let newH = baseH + visualDy;

    // 1. Draw Original Block (Dashed)
    ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "#888"; ctx.lineWidth = 2;
    ctx.strokeRect(centerX - baseW/2, centerY - baseH/2, baseW, baseH);
    ctx.setLineDash([]); 

    // 2. Draw Deformed Block (Solid)
    ctx.fillStyle = "rgba(40, 167, 69, 0.3)"; // Translucent green
    ctx.strokeStyle = "#28a745"; ctx.lineWidth = 2;
    ctx.fillRect(centerX - newW/2, centerY - newH/2, newW, newH);
    ctx.strokeRect(centerX - newW/2, centerY - newH/2, newW, newH);

    // 3. Draw Forces Arrows (Y axis)
    ctx.fillStyle = "#c82359";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    if (sy < 0) {
        // Compression arrows pointing in
        drawArrow(ctx, centerX, centerY - baseH/2 - 40, centerX, centerY - newH/2 - 5);
        drawArrow(ctx, centerX, centerY + baseH/2 + 40, centerX, centerY + newH/2 + 5);
        ctx.fillText("Compression (σy)", centerX, centerY - baseH/2 - 50);
    } else if (sy > 0) {
        // Tension arrows pointing out
        drawArrow(ctx, centerX, centerY - newH/2 - 5, centerX, centerY - baseH/2 - 40);
        drawArrow(ctx, centerX, centerY + newH/2 + 5, centerX, centerY + baseH/2 + 40);
        ctx.fillText("Tension (σy)", centerX, centerY - baseH/2 - 50);
    }
}

// Canvas Arrow Helper
function drawArrow(ctx, fromx, fromy, tox, toy) {
    let headlen = 10; 
    let angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath(); ctx.strokeStyle = "#c82359"; ctx.lineWidth = 3;
    ctx.moveTo(fromx, fromy); ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}


// ================= 3. PLOTLY STRESS-STRAIN GRAPH =================
function drawStressStrainGraph() {
    let E_gpa = parseFloat(document.getElementById("p_E").value);
    let yield_mpa = parseFloat(document.getElementById("p_yield").value);

    if (isNaN(E_gpa) || isNaN(yield_mpa) || E_gpa <= 0) {
        alert("Please enter valid numbers."); return;
    }

    // E = Stress / Strain => Strain = Stress / E
    let E_mpa = E_gpa * 1000;
    let yield_strain = yield_mpa / E_mpa;

    // Generate coordinate pairs for the linear elastic region
    let strainVals = [0, yield_strain];
    let stressVals = [0, yield_mpa];

    let trace = {
        x: strainVals,
        y: stressVals,
        mode: 'lines+markers',
        name: 'Elastic Region',
        line: { color: '#c82359', width: 3 },
        marker: { size: 8, color: ['#000', '#c82359'] },
        hovertemplate: `Strain (ε): %{x:.5f}<br>Stress (σ): %{y} MPa<extra></extra>`
    };

    let layout = {
        title: "<b>Linear Elastic Stress-Strain Curve</b>",
        xaxis: { title: "Strain (ε)", zeroline: true, zerolinecolor: 'black' },
        yaxis: { title: "Stress (σ) [MPa]", zeroline: true, zerolinecolor: 'black' },
        showlegend: false,
        annotations: [{
            x: yield_strain,
            y: yield_mpa,
            xref: 'x', yref: 'y',
            text: 'Yield Point',
            showarrow: true,
            arrowhead: 2,
            ax: -40, ay: -40
        }]
    };

    // Make output visible first
    document.getElementById("ssOutputArea").style.display = "block";
    Plotly.newPlot('ssPlot', [trace], layout, {responsive: true});

    document.getElementById("ssResult").innerHTML = 
        `<strong>Yield Strain:</strong> ${num(yield_strain)}<br>
        <strong>Slope (E):</strong> ${E_gpa} GPa`;
}

// Auto-draw visualizers on load
window.onload = function() {
    setTimeout(() => {
        drawPoissonEffect();
        drawStressStrainGraph();
    }, 100);
};