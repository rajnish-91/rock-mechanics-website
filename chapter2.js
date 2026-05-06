// FORMATTER
function num(val) { return parseFloat(val.toFixed(4)); }

// ==========================================
// 1. DYNAMIC VISUALIZER ENGINE
// ==========================================
function drawArrow(ctx, fromx, fromy, tox, toy, text, textOffsetX = 0, textOffsetY = -8) {
    let headlen = 10; 
    let dx = tox - fromx; let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    ctx.beginPath(); ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5;
    ctx.moveTo(fromx, fromy); ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle - Math.PI / 6), fromy + headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle + Math.PI / 6), fromy + headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    if (text) {
        ctx.fillStyle = "#000"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
        ctx.fillText(text, (fromx + tox) / 2 + textOffsetX, (fromy + toy) / 2 + textOffsetY);
    }
}

// --- Normal Strain Controls ---
function updateNormalVisInputs() {
    let mode = document.getElementById("v_norm_mode").value;
    let html = `<div class="form-group"><label>Original Length (L):</label><input type="number" id="v_L" value="5"></div>`;
    if (mode === "find_strain") {
        html += `<div class="form-group"><label>Change in Length (δ):</label><input type="number" id="v_delta" value="0.5"></div>`;
    } else {
        html += `<div class="form-group"><label>Normal Strain (ε):</label><input type="number" id="v_strain_in" value="0.1"></div>`;
    }
    document.getElementById("v_norm_input_area").innerHTML = html;
}

function drawNormalStrain() {
    let mode = document.getElementById("v_norm_mode").value;
    let L = parseFloat(document.getElementById("v_L").value);
    if (isNaN(L) || L <= 0) { alert("Invalid Length"); return; }

    let delta = 0, strain = 0;
    if (mode === "find_strain") {
        delta = parseFloat(document.getElementById("v_delta").value);
        if (isNaN(delta)) return;
        strain = delta / L;
        document.getElementById("normalResult").innerHTML = `Strain (ε) = ${delta} / ${L} = ${num(strain)}`;
    } else {
        strain = parseFloat(document.getElementById("v_strain_in").value);
        if (isNaN(strain)) return;
        delta = strain * L;
        document.getElementById("normalResult").innerHTML = `Change (δ) = ${strain} × ${L} = ${num(delta)}`;
    }

    let canvas = document.getElementById("normalCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startX = 50, baseW = 300, visualDelta = baseW * strain; 
    if (visualDelta > 150) visualDelta = 150; 
    if (visualDelta < -200) visualDelta = -200;

    ctx.fillStyle = "#c2a98f"; ctx.fillRect(startX, 30, baseW, 40); ctx.strokeRect(startX, 30, baseW, 40);
    drawArrow(ctx, startX, 85, startX + baseW, 85, `L = ${L}`);

    ctx.fillStyle = "#d4c1ad"; ctx.fillRect(startX, 130, baseW + visualDelta, 40); ctx.strokeRect(startX, 130, baseW + visualDelta, 40);

    ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(startX + baseW, 30); ctx.lineTo(startX + baseW, 170); ctx.stroke(); ctx.setLineDash([]); 

    if (delta > 0) drawArrow(ctx, startX + baseW, 185, startX + baseW + visualDelta, 185, `δ = ${num(delta)}`);
    else if (delta < 0) drawArrow(ctx, startX + baseW + visualDelta, 185, startX + baseW, 185, `δ = ${num(delta)}`);
}

// --- Shear Strain Controls ---
function updateShearVisInputs() {
    let mode = document.getElementById("v_shear_mode").value;
    let html = `<div class="form-group"><label>Height (h):</label><input type="number" id="v_h" value="4"></div>`;
    if (mode === "find_strain") {
        html += `<div class="form-group"><label>Displacement (ΔL):</label><input type="number" id="v_shear_delta" value="1"></div>`;
    } else {
        html += `<div class="form-group"><label>Shear Strain (γ):</label><input type="number" id="v_shear_strain_in" value="0.25"></div>`;
    }
    document.getElementById("v_shear_input_area").innerHTML = html;
}

function drawShearStrain() {
    let mode = document.getElementById("v_shear_mode").value;
    let h = parseFloat(document.getElementById("v_h").value);
    if (isNaN(h) || h <= 0) { alert("Invalid Height"); return; }

    let delta = 0, shearStrain = 0;
    if (mode === "find_strain") {
        delta = parseFloat(document.getElementById("v_shear_delta").value);
        if (isNaN(delta)) return;
        shearStrain = delta / h;
        document.getElementById("shearResult").innerHTML = `Strain (γ) = ΔL / h = ${num(shearStrain)} rad`;
    } else {
        shearStrain = parseFloat(document.getElementById("v_shear_strain_in").value);
        if (isNaN(shearStrain)) return;
        delta = shearStrain * h;
        document.getElementById("shearResult").innerHTML = `Displacement (ΔL) = γ × h = ${num(delta)}`;
    }

    let canvas = document.getElementById("shearCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startX = 120, startY = 170, rectW = 200, visualH = 90; 
    let visualShift = visualH * shearStrain; 
    if (visualShift > 150) visualShift = 150; 
    if (visualShift < -100) visualShift = -100;

    ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "#999"; ctx.strokeRect(startX, startY - visualH, rectW, visualH); ctx.setLineDash([]);
    ctx.fillStyle = "#a1b1c2"; ctx.strokeStyle = "#000"; ctx.beginPath();
    ctx.moveTo(startX, startY); ctx.lineTo(startX + rectW, startY); 
    ctx.lineTo(startX + rectW + visualShift, startY - visualH); ctx.lineTo(startX + visualShift, startY - visualH); 
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(startX - 30, startY); ctx.lineTo(startX + rectW + 80, startY); ctx.lineWidth = 3; ctx.stroke();
    for(let i=0; i<rectW+100; i+=15) {
        ctx.beginPath(); ctx.lineWidth = 1; ctx.moveTo(startX - 30 + i, startY); ctx.lineTo(startX - 40 + i, startY + 10); ctx.stroke();
    }
    drawArrow(ctx, startX - 25, startY, startX - 25, startY - visualH, `h = ${h}`);
    drawArrow(ctx, startX, startY - visualH - 15, startX + visualShift, startY - visualH - 15, `ΔL = ${num(delta)}`);
}

// ========================================================
// 2. YOUR ORIGINAL CALCULATOR FUNCTIONS
// ========================================================

function createInput(label, id, unitCat) {
    let opts = "";
    if (unitCat === "length") opts = `<option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option>`;
    else if (unitCat === "vol") opts = `<option value="m3">m³</option><option value="cm3">cm³</option><option value="mm3">mm³</option>`;
    else if (unitCat === "pressure") opts = `<option value="Pa">Pa</option><option value="kPa">kPa</option><option value="MPa">MPa</option><option value="GPa">GPa</option>`;
    
    let dropdown = opts ? `<select id="u_${id}">${opts}</select>` : "";
    return `<label>${label}</label><div class="input-group"><input id="${id}">${dropdown}</div>`;
}

function getConvertedVal(id, unitCat) {
    let val = parseFloat(document.getElementById(id)?.value);
    if (isNaN(val)) return NaN;
    let unit = document.getElementById(`u_${id}`)?.value;
    
    if (unitCat === "length") { if (unit === "cm") val *= 0.01; if (unit === "mm") val *= 0.001; }
    else if (unitCat === "vol") { if (unit === "cm3") val *= 1e-6; if (unit === "mm3") val *= 1e-9; }
    else if (unitCat === "pressure") { if (unit === "kPa") val *= 1e3; if (unit === "MPa") val *= 1e6; if (unit === "GPa") val *= 1e9; }
    return val;
}

function fmt(val) {
    let abs = Math.abs(val);
    if (abs >= 10000 || (abs > 0 && abs < 0.001)) {
        let parts = val.toExponential(4).split('e');
        return `${parseFloat(parts[0])} &times; 10<sup>${parseInt(parts[1])}</sup>`;
    }
    return parseFloat(val.toFixed(6));
}

function updateStrainSolveFor() {
    let type = document.getElementById("strainType").value;
    let opts = type === "linear" ? `<option value="e">Strain (ε = ΔL / L)</option><option value="dl">Change in Length (ΔL = ε × L)</option><option value="L">Original Length (L = ΔL / ε)</option>` : `<option value="ev">Volumetric Strain (εv = ΔV / V)</option><option value="dv">Change in Vol (ΔV = εv × V)</option><option value="V">Original Vol (V = ΔV / εv)</option>`;
    document.getElementById("strainSolveFor").innerHTML = opts;
    updateStrainInputs();
}

function updateStrainInputs() {
    let solve = document.getElementById("strainSolveFor").value;
    let html = "";
    if (solve === "e") html = createInput("ΔL", "s_dl", "length") + createInput("L", "s_L", "length");
    else if (solve === "dl") html = createInput("ε (Unitless)", "s_e", "") + createInput("L", "s_L", "length");
    else if (solve === "L") html = createInput("ΔL", "s_dl", "length") + createInput("ε (Unitless)", "s_e", "");
    else if (solve === "ev") html = createInput("ΔV", "s_dv", "vol") + createInput("V", "s_V", "vol");
    else if (solve === "dv") html = createInput("εv (Unitless)", "s_ev", "") + createInput("V", "s_V", "vol");
    else if (solve === "V") html = createInput("ΔV", "s_dv", "vol") + createInput("εv (Unitless)", "s_ev", "");
    document.getElementById("strainInputs").innerHTML = html;
}

function calcStrain() {
    let solve = document.getElementById("strainSolveFor").value;
    let dl = getConvertedVal("s_dl", "length"), L = getConvertedVal("s_L", "length"), e = getConvertedVal("s_e", "");
    let dv = getConvertedVal("s_dv", "vol"), V = getConvertedVal("s_V", "vol"), ev = getConvertedVal("s_ev", "");
    let res = "Enter valid values";

    if (solve === "e" && L) res = `ε = ${fmt(dl / L)}`;
    else if (solve === "dl" && !isNaN(e) && !isNaN(L)) res = `ΔL = ${fmt(e * L)} m`;
    else if (solve === "L" && e) res = `L = ${fmt(dl / e)} m`;
    else if (solve === "ev" && V) res = `εv = ${fmt(dv / V)}`;
    else if (solve === "dv" && !isNaN(ev) && !isNaN(V)) res = `ΔV = ${fmt(ev * V)} m³`;
    else if (solve === "V" && ev) res = `V = ${fmt(dv / ev)} m³`;
    document.getElementById("strainResult").innerHTML = res;
}

function updateModSolveFor() {
    let type = document.getElementById("modType").value;
    let opts = "";
    if (type === "young") opts = `<option value="E">Young's (E = σ / ε)</option><option value="s">Stress (σ = E × ε)</option><option value="e">Strain (ε = σ / E)</option>`;
    else if (type === "shear") opts = `<option value="G">Shear Mod (G = τ / γ)</option><option value="t">Shear Stress (τ = G × γ)</option><option value="g">Shear Strain (γ = τ / G)</option>`;
    else if (type === "bulk") opts = `<option value="K">Bulk Mod (K = σ / εv)</option><option value="s_bulk">Stress (σ = K × εv)</option><option value="ev">Vol Strain (εv = σ / K)</option>`;
    document.getElementById("modSolveFor").innerHTML = opts;
    updateModInputs();
}

function updateModInputs() {
    let solve = document.getElementById("modSolveFor").value;
    let html = "";
    if (solve === "E") html = createInput("Stress σ", "m_s", "pressure") + createInput("Strain ε", "m_e", "");
    else if (solve === "s") html = createInput("Young's E", "m_E", "pressure") + createInput("Strain ε", "m_e", "");
    else if (solve === "e") html = createInput("Stress σ", "m_s", "pressure") + createInput("Young's E", "m_E", "pressure");
    else if (solve === "G") html = createInput("Shear Stress τ", "m_t", "pressure") + createInput("Shear Strain γ", "m_g", "");
    else if (solve === "t") html = createInput("Shear Mod G", "m_G", "pressure") + createInput("Shear Strain γ", "m_g", "");
    else if (solve === "g") html = createInput("Shear Stress τ", "m_t", "pressure") + createInput("Shear Mod G", "m_G", "pressure");
    else if (solve === "K") html = createInput("Stress σ", "m_s", "pressure") + createInput("Vol Strain εv", "m_ev", "");
    else if (solve === "s_bulk") html = createInput("Bulk Mod K", "m_K", "pressure") + createInput("Vol Strain εv", "m_ev", "");
    else if (solve === "ev") html = createInput("Stress σ", "m_s", "pressure") + createInput("Bulk Mod K", "m_K", "pressure");
    document.getElementById("modInputs").innerHTML = html;
}

function calcMod() {
    let solve = document.getElementById("modSolveFor").value;
    let s = getConvertedVal('m_s', 'pressure'), E = getConvertedVal('m_E', 'pressure'), e = getConvertedVal('m_e', '');
    let t = getConvertedVal('m_t', 'pressure'), G = getConvertedVal('m_G', 'pressure'), g = getConvertedVal('m_g', '');
    let K = getConvertedVal('m_K', 'pressure'), ev = getConvertedVal('m_ev', '');
    let res = "Enter valid values";

    if (solve === "E" && e) res = `E = ${fmt(s / e)} Pa`;
    else if (solve === "s" && !isNaN(E) && !isNaN(e)) res = `σ = ${fmt(E * e)} Pa`;
    else if (solve === "e" && E) res = `ε = ${fmt(s / E)}`;
    else if (solve === "G" && g) res = `G = ${fmt(t / g)} Pa`;
    else if (solve === "t" && !isNaN(G) && !isNaN(g)) res = `τ = ${fmt(G * g)} Pa`;
    else if (solve === "g" && G) res = `γ = ${fmt(t / G)}`;
    else if (solve === "K" && ev) res = `K = ${fmt(s / ev)} Pa`;
    else if (solve === "s_bulk" && !isNaN(K) && !isNaN(ev)) res = `σ = ${fmt(K * ev)} Pa`;
    else if (solve === "ev" && K) res = `εv = ${fmt(s / K)}`;
    document.getElementById("modResult").innerHTML = res;
}

function updatePoissonInputs() {
    let solve = document.getElementById("poissonSolveFor").value;
    let html = "";
    if (solve === "nu") html = createInput("Lateral Strain", "p_lat", "") + createInput("Longitudinal Strain", "p_long", "");
    else if (solve === "lat") html = createInput("Poisson ν", "p_nu", "") + createInput("Longitudinal Strain", "p_long", "");
    else if (solve === "long") html = createInput("Lateral Strain", "p_lat", "") + createInput("Poisson ν", "p_nu", "");
    document.getElementById("poissonInputs").innerHTML = html;
}

function calcPoisson() {
    let solve = document.getElementById("poissonSolveFor").value;
    let lat = getConvertedVal("p_lat", ""), long = getConvertedVal("p_long", ""), nu = getConvertedVal("p_nu", "");
    let res = "Enter valid values";

    if (solve === "nu" && long) res = `ν = ${fmt(lat / long)}`;
    else if (solve === "lat" && !isNaN(nu) && !isNaN(long)) res = `ε_lat = ${fmt(nu * long)}`;
    else if (solve === "long" && nu) res = `ε_long = ${fmt(lat / nu)}`;
    document.getElementById("poissonResult").innerHTML = res;
}

function updateRelSolveFor() {
    let type = document.getElementById("relType").value;
    let opts = type === "EG" ? `<option value="E">E = 2G(1+ν)</option><option value="G">G = E / [2(1+ν)]</option><option value="nu">ν = (E / 2G) - 1</option>` : `<option value="E_k">E = 3K(1-2ν)</option><option value="K">K = E / [3(1-2ν)]</option><option value="nu_k">ν = 0.5 × (1 - E/3K)</option>`;
    document.getElementById("relSolveFor").innerHTML = opts;
    updateRelInputs();
}

function updateRelInputs() {
    let solve = document.getElementById("relSolveFor").value;
    let html = "";
    if (solve === "E") html = createInput("Shear Mod G", "r_G", "pressure") + createInput("Poisson ν", "r_nu", "");
    else if (solve === "G") html = createInput("Young's E", "r_E", "pressure") + createInput("Poisson ν", "r_nu", "");
    else if (solve === "nu") html = createInput("Young's E", "r_E", "pressure") + createInput("Shear Mod G", "r_G", "pressure");
    else if (solve === "E_k") html = createInput("Bulk Mod K", "r_K", "pressure") + createInput("Poisson ν", "r_nu", "");
    else if (solve === "K") html = createInput("Young's E", "r_E", "pressure") + createInput("Poisson ν", "r_nu", "");
    else if (solve === "nu_k") html = createInput("Young's E", "r_E", "pressure") + createInput("Bulk Mod K", "r_K", "pressure");
    document.getElementById("relInputs").innerHTML = html;
}

function calcRelation() {
    let solve = document.getElementById("relSolveFor").value;
    let E = getConvertedVal("r_E", "pressure"), G = getConvertedVal("r_G", "pressure");
    let K = getConvertedVal("r_K", "pressure"), nu = getConvertedVal("r_nu", "");
    let res = "Enter valid values";

    if (solve === "E" && !isNaN(G) && !isNaN(nu)) res = `E = ${fmt(2 * G * (1 + nu))} Pa`;
    else if (solve === "G" && !isNaN(E) && !isNaN(nu)) res = `G = ${fmt(E / (2 * (1 + nu)))} Pa`;
    else if (solve === "nu" && G) res = `ν = ${fmt((E / (2 * G)) - 1)}`;
    else if (solve === "E_k" && !isNaN(K) && !isNaN(nu)) res = `E = ${fmt(3 * K * (1 - 2 * nu))} Pa`;
    else if (solve === "K" && !isNaN(E) && !isNaN(nu)) res = `K = ${fmt(E / (3 * (1 - 2 * nu)))} Pa`;
    else if (solve === "nu_k" && K) res = `ν = ${fmt(0.5 * (1 - (E / (3 * K))))}`;
    document.getElementById("relResult").innerHTML = res;
}

// INIT
window.onload = function() {
    updateNormalVisInputs();
    updateShearVisInputs();
    updateStrainSolveFor();
    updateModSolveFor();
    updatePoissonInputs();
    updateRelSolveFor();
    
    // Draw default diagrams
    setTimeout(() => {
        drawNormalStrain();
        drawShearStrain();
    }, 100);
};

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