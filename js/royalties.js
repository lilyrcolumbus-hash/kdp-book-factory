// KDP Royalties Calculator Module

const KDP_PRINTING_COSTS = {
    // Base cost + per-page cost (USD, for black & white interior, US marketplace)
    'bw': { fixed: 0.85, perPage: 0.012 },
    // Color interior
    'color': { fixed: 0.85, perPage: 0.07 },
    // Premium color
    'premium': { fixed: 3.00, perPage: 0.07 },
};

function calculateRoyalties() {
    const listPrice = parseFloat(document.getElementById('ry-price').value) || 0;
    const pageCount = parseInt(document.getElementById('ry-pages').value) || 0;
    const interiorType = document.getElementById('ry-interior').value;
    const marketplace = document.getElementById('ry-marketplace').value;
    const royaltyRate = document.getElementById('ry-rate').value;

    if (listPrice <= 0 || pageCount <= 0) {
        alert('Por favor ingresa un precio y numero de paginas validos.');
        return;
    }

    const costs = KDP_PRINTING_COSTS[interiorType];
    const printingCost = costs.fixed + (costs.perPage * pageCount);

    let rate, minPrice, maxPrice;
    if (royaltyRate === '60') {
        rate = 0.60;
        minPrice = printingCost / (1 - rate); // Minimum to not lose money
        maxPrice = 250;
    } else {
        rate = 0.40;
        minPrice = printingCost;
        maxPrice = 250;
    }

    // Expanded distribution adds printing cost
    const expandedPrintCost = printingCost;

    let royalty60, royalty40;

    if (marketplace === 'us') {
        royalty60 = (listPrice * 0.60) - printingCost;
        royalty40 = (listPrice * 0.40) - printingCost;
    } else {
        // International has slightly higher printing costs
        const intlMultiplier = 1.15;
        royalty60 = (listPrice * 0.60) - (printingCost * intlMultiplier);
        royalty40 = (listPrice * 0.40) - (printingCost * intlMultiplier);
    }

    const selectedRoyalty = royaltyRate === '60' ? royalty60 : royalty40;

    // Revenue projections
    const daily10 = selectedRoyalty * 10;
    const daily25 = selectedRoyalty * 25;
    const daily50 = selectedRoyalty * 50;

    const output = document.getElementById('ry-output');
    output.style.display = 'block';

    const fmt = (n) => n >= 0 ? `$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;

    output.innerHTML = `
        <h3>Costos de Impresion</h3>
        <div class="royalty-row">
            <span>Costo fijo:</span>
            <span>${fmt(costs.fixed)}</span>
        </div>
        <div class="royalty-row">
            <span>Costo por pagina (${pageCount} pags x ${fmt(costs.perPage)}):</span>
            <span>${fmt(costs.perPage * pageCount)}</span>
        </div>
        <div class="royalty-row total">
            <span>Costo total de impresion:</span>
            <span>${fmt(printingCost)}</span>
        </div>

        <h3>Royalties por Venta</h3>
        <div class="royalty-row">
            <span>Precio de lista:</span>
            <span>${fmt(listPrice)}</span>
        </div>
        <div class="royalty-row">
            <span>Royalty al 60%:</span>
            <span class="${royalty60 >= 0 ? 'positive' : 'negative'}">${fmt(royalty60)}</span>
        </div>
        <div class="royalty-row">
            <span>Royalty al 40% (distribucion expandida):</span>
            <span class="${royalty40 >= 0 ? 'positive' : 'negative'}">${fmt(royalty40)}</span>
        </div>
        <div class="royalty-row total">
            <span>Tu royalty por venta (${royaltyRate}%):</span>
            <span class="${selectedRoyalty >= 0 ? 'positive' : 'negative'}">${fmt(selectedRoyalty)}</span>
        </div>

        <h3>Precio Minimo Sugerido</h3>
        <div class="royalty-row">
            <span>Para no perder dinero (60%):</span>
            <span>$${(printingCost / 0.60).toFixed(2)}</span>
        </div>
        <div class="royalty-row">
            <span>Para ganar $1 por venta (60%):</span>
            <span>$${((printingCost + 1) / 0.60).toFixed(2)}</span>
        </div>
        <div class="royalty-row">
            <span>Para ganar $3 por venta (60%):</span>
            <span>$${((printingCost + 3) / 0.60).toFixed(2)}</span>
        </div>

        <h3>Proyecciones de Ingresos Mensuales</h3>
        <div class="royalty-row">
            <span>10 ventas/dia:</span>
            <span>${fmt(daily10 * 30)}/mes</span>
        </div>
        <div class="royalty-row">
            <span>25 ventas/dia:</span>
            <span>${fmt(daily25 * 30)}/mes</span>
        </div>
        <div class="royalty-row">
            <span>50 ventas/dia:</span>
            <span>${fmt(daily50 * 30)}/mes</span>
        </div>
    `;
}
