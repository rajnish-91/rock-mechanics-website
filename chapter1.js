function createInput(label, id, unitCat) {
    let opts = "";
    if (unitCat === "force") opts = `<option value="N">N</option><option value="kN">kN</option><option value="MN">MN</option>`;
    else if (unitCat === "area") opts = `<option value="m2">m²</option><option value="cm2">cm²</option><option value="mm2">mm²</option>`;
    else if (unitCat === "pressure") opts = `<option value="Pa">Pa</option><option value="kPa">kPa</option><option value="MPa">MPa</option><option value="GPa">GPa</option>`;
    else if (unitCat === "length") opts = `<option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option>`;
    else if (unitCat === "unit_weight") opts = `<option value="N/m3">N/m³</option><option value="kN/m3">kN/m³</option><option value="MN/m3">MN/m³</option>`;
    else if (unitCat === "density") opts = `<option value="kg/m3">kg/m³</option><option value="g/cm3">g/cm³</option>`;
    
    let dropdown = opts ? `<select id="u_${id}">${opts}</select>` : "";
    return `<label>${label}</label><div class="input-group"><input id="${id}">${dropdown}</div>`;
}

function getConvertedVal(id, unitCat) {
    let val = parseFloat(document.getElementById(id)?.value);
    if (isNaN(val)) return NaN;
    let unit = document.getElementById(`u_${id}`)?.value;
    
    if (unitCat === "force") { if (unit === "kN") val *= 1e3; if (unit === "MN") val *= 1e6; }
    else if (unitCat === "area") { if (unit === "cm2") val *= 1e-4; if (unit === "mm2") val *= 1e-6; }
    else if (unitCat === "pressure") { if (unit === "kPa") val *= 1e3; if (unit === "MPa") val *= 1e6; if (unit === "GPa") val *= 1e9; }
    else if (unitCat === "length") { if (unit === "cm") val *= 0.01; if (unit === "mm") val *= 0.001; }
    else if (unitCat === "unit_weight") { if (unit === "kN/m3") val *= 1e3; if (unit === "MN/m3") val *= 1e6; }
    else if (unitCat === "density") { if (unit === "g/cm3") val *= 1000; }
    return val;
}

function fmt(val) {
    let abs = Math.abs(val);
    if (abs >= 10000 || (abs > 0 && abs < 0.001)) {
        let parts = val.toExponential(4).split('e');
        return `${parseFloat(parts[0])} &times; 10<sup>${parseInt(parts[1])}</sup>`;
    }
    return parseFloat(val.toFixed(4));
}

function updateBasicInputs() {
    let solveFor = document.getElementById("basicSolveFor").value;
    let sym = document.getElementById("basicStressType").value === "normal" ? "σ" : "τ";
    let html = "";
    if (solveFor === "stress") html = createInput("Force", "basicF", "force") + createInput("Area", "basicA", "area");
    else if (solveFor === "force") html = createInput(`Stress ${sym}`, "basicS", "pressure") + createInput("Area", "basicA", "area");
    else if (solveFor === "area") html = createInput("Force", "basicF", "force") + createInput(`Stress ${sym}`, "basicS", "pressure");
    document.getElementById("basicInputs").innerHTML = html;
}

function calcBasic() {
    let solveFor = document.getElementById("basicSolveFor").value;
    let sym = document.getElementById("basicStressType").value === "normal" ? "σ" : "τ";
    let F = getConvertedVal("basicF", "force"), A = getConvertedVal("basicA", "area"), S = getConvertedVal("basicS", "pressure");
    let result = "Enter valid values";

    if (solveFor === "stress" && A) result = `${sym} = ${fmt(F / A)} Pa`;
    else if (solveFor === "force" && !isNaN(S) && !isNaN(A)) result = `F = ${fmt(S * A)} N`;
    else if (solveFor === "area" && S) result = `A = ${fmt(F / S)} m²`;
    document.getElementById("basicResult").innerHTML = result;
}

function updateInsituSolveFor() {
    let rel = document.getElementById("insituRelationship").value;
    let opts = "";
    if (rel === "gamma") opts = `<option value="sv">Vertical Stress (σv = γz)</option><option value="gamma">Unit Weight (γ = σv/z)</option><option value="z">Depth (z = σv/γ)</option>`;
    else if (rel === "rho") opts = `<option value="sv">Vertical Stress (σv = ρgz)</option><option value="rho">Density (ρ = σv/gz)</option><option value="z">Depth (z = σv/ρg)</option>`;
    else if (rel === "horizontal") opts = `<option value="sh">Horizontal Stress (σh = Kσv)</option><option value="k">Ratio (K = σh/σv)</option><option value="sv">Vertical Stress (σv = σh/K)</option>`;
    else if (rel === "poisson") opts = `<option value="k0">At-Rest Ratio (K₀ = ν/(1-ν))</option><option value="nu">Poisson's Ratio (ν = K₀/(1+K₀))</option>`;
    document.getElementById("insituSolveFor").innerHTML = opts;
    updateInsituInputs();
}

function updateInsituInputs() {
    let rel = document.getElementById("insituRelationship").value, solveFor = document.getElementById("insituSolveFor").value;
    let html = "";
    if (rel === "gamma") {
        if (solveFor === "sv") html = createInput("Unit Weight γ", "i_gamma", "unit_weight") + createInput("Depth z", "i_z", "length");
        else if (solveFor === "gamma") html = createInput("Vertical Stress σv", "i_sv", "pressure") + createInput("Depth z", "i_z", "length");
        else if (solveFor === "z") html = createInput("Vertical Stress σv", "i_sv", "pressure") + createInput("Unit Weight γ", "i_gamma", "unit_weight");
    } else if (rel === "rho") {
        if (solveFor === "sv") html = createInput("Density ρ", "i_rho", "density") + createInput("Depth z", "i_z", "length");
        else if (solveFor === "rho") html = createInput("Vertical Stress σv", "i_sv", "pressure") + createInput("Depth z", "i_z", "length");
        else if (solveFor === "z") html = createInput("Vertical Stress σv", "i_sv", "pressure") + createInput("Density ρ", "i_rho", "density");
    } else if (rel === "horizontal") {
        if (solveFor === "sh") html = createInput("Ratio K", "i_k", "") + createInput("Vertical Stress σv", "i_sv", "pressure");
        else if (solveFor === "k") html = createInput("Horizontal Stress σh", "i_sh", "pressure") + createInput("Vertical Stress σv", "i_sv", "pressure");
        else if (solveFor === "sv") html = createInput("Horizontal Stress σh", "i_sh", "pressure") + createInput("Ratio K", "i_k", "");
    } else if (rel === "poisson") {
        if (solveFor === "k0") html = createInput("Poisson Ratio ν", "i_nu", "");
        else if (solveFor === "nu") html = createInput("At-Rest Ratio K₀", "i_k0", "");
    }
    document.getElementById("insituInputs").innerHTML = html;
}

function calcInsitu() {
    let rel = document.getElementById("insituRelationship").value, solveFor = document.getElementById("insituSolveFor").value;
    let sv = getConvertedVal('i_sv', 'pressure'), sh = getConvertedVal('i_sh', 'pressure'), g = getConvertedVal('i_gamma', 'unit_weight');
    let r = getConvertedVal('i_rho', 'density'), z = getConvertedVal('i_z', 'length'), k = getConvertedVal('i_k', ''), k0 = getConvertedVal('i_k0', ''), nu = getConvertedVal('i_nu', '');
    let result = "Enter valid values";

    if (rel === "gamma") {
        if (solveFor === "sv" && !isNaN(g) && !isNaN(z)) result = `σv = ${fmt(g * z)} Pa`;
        else if (solveFor === "gamma" && z) result = `γ = ${fmt(sv / z)} N/m³`;
        else if (solveFor === "z" && g) result = `z = ${fmt(sv / g)} m`;
    } else if (rel === "rho") {
        if (solveFor === "sv" && !isNaN(r) && !isNaN(z)) result = `σv = ${fmt(r * 9.81 * z)} Pa`;
        else if (solveFor === "rho" && z) result = `ρ = ${fmt(sv / (9.81 * z))} kg/m³`;
        else if (solveFor === "z" && r) result = `z = ${fmt(sv / (r * 9.81))} m`;
    } else if (rel === "horizontal") {
        if (solveFor === "sh" && !isNaN(k) && !isNaN(sv)) result = `σh = ${fmt(k * sv)} Pa`;
        else if (solveFor === "k" && sv) result = `K = ${fmt(sh / sv)}`;
        else if (solveFor === "sv" && k) result = `σv = ${fmt(sh / k)} Pa`;
    } else if (rel === "poisson") {
        if (solveFor === "k0" && nu !== 1) result = `K₀ = ${fmt(nu / (1 - nu))}`;
        else if (solveFor === "nu" && !isNaN(k0)) result = `ν = ${fmt(k0 / (1 + k0))}`;
    }
    document.getElementById("insituResult").innerHTML = result;
}

updateBasicInputs();
updateInsituSolveFor();

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
