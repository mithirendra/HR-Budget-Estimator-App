// Get all nav buttons and all pages
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Function to show a page and set active button
function showPage(pageId) {

    console.log('showPage called with:', pageId);

    // Remove active class from all pages
    pages.forEach(function(page){
        page.classList.remove('active');
    });

    // Remove active class from all buttons
    navButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });

    // Add active class to the selected page
    document.getElementById('page-' + pageId).classList.add('active');

    // Add active class to clicked button
    document.querySelector('[data-page="' + pageId + '"]').classList.add('active');

    // If dashboard page — recalculate
    if (pageId === 'dashboard') {
        calcDashboard();
    }

    // If summary page — recalculate
    if (pageId === 'summary') {
        calcSummary();
    }

}

// Add click listener to each nav button
navButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const pageId = this.dataset.page;       // get the data=page value
        showPage(pageId);
    });
});

// Get Started button - takes user to Headcount Planning
document.getElementById('btn-get-started').addEventListener('click', function() {
    showPage('hc');
});

// ================================
// HEADCOUNT PAGE
// ================================

function calcHeadcount() {

    // Read input values
    const permanent = parseFloat(document.getElementById('hc-permanent').value) || 0;
    const contract  = parseFloat(document.getElementById('hc-contract').value)  || 0;
    const interns   = parseFloat(document.getElementById('hc-interns').value)   || 0;
    const newHires  = parseFloat(document.getElementById('hc-newhires').value)  || 0;
    const attrition = parseFloat(document.getElementById('hc-attrition').value) || 0;
    const retrench  = parseFloat(document.getElementById('hc-retrench').value)  || 0;
    const retire    = parseFloat(document.getElementById('hc-retire').value)    || 0;
    const growth    = parseFloat(document.getElementById('hc-growth').value)    || 0;

    // Calculate current total
    const currentTotal = permanent + contract + interns;

    // Calculate Year 1 - current + new hires - leavers
    const y1 = currentTotal + newHires - attrition - retrench - retire

    // Calculate Year 2 to 5 - compound growth rate
    const y2 = Math.round(y1 * (1 + growth/100));
    const y3 = Math.round(y2 * (1 + growth/100));
    const y4 = Math.round(y3 * (1 + growth/100));
    const y5 = Math.round(y4 * (1 + growth/100));

    // Update KPI Cards
    document.getElementById('hc-total').textContent = currentTotal;
    document.getElementById('hc-y1').textContent    = y1;
    document.getElementById('hc-y3').textContent    = y3;
    document.getElementById('hc-y5').textContent    = y5;

    // Update Target headcount field
    // document.getElementById('hc-target').value = y1;

    // Draw the chart
    drawHCChart([currentTotal, y1, y2, y3, y4, y5]);


}

function drawHCChart(data) {

    // Setup — define the canvas dimensions
    const svg    = document.getElementById('hc-chart');
    const width  = 500;
    const height = 200;
    const padL   = 40;   // left padding for y axis labels
    const padR   = 20;   // right padding
    const padT   = 15;   // top padding
    const padB   = 30;   // bottom padding for x axis labels

    // Clear previous chart
    svg.innerHTML = '';

    // Min and max values for scaling - Scaling functions — convert data values to pixel coordinates
    const minVal = Math.min(...data) * 0.9;
    const maxVal = Math.max(...data) * 1.1;

    // Function to convert a data value to Y coordinate
    function toY(val) {
        return padT + (height - padT - padB) * (1 - (val - minVal) / (maxVal - minVal));
    }

    // Function to convert index to X coordinate
    function toX(i) {
        return padL + i * (width - padL - padR) / (data.length - 1);
    }

    // X axis labels
    const labels = ['Today', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    // Draw grid lines
    for (let i = 0; i < 4; i++) {
        const y = padT + i * (height - padT - padB) / 3;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padL);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padR);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#f0f0f0');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    // Draw shaded area under line
    const areaPoints = data.map((val, i) => toX(i) + ',' + toY(val)).join(' ');
    const bottomLeft  = padL + ',' + (height - padB);
    const bottomRight = toX(data.length - 1) + ',' + (height - padB);
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    area.setAttribute('points', bottomLeft + ' ' + areaPoints + ' ' + bottomRight);
    area.setAttribute('fill', '#FFece1');
    area.setAttribute('opacity', '0.6');
    svg.appendChild(area);

    // Draw line
    const linePoints = data.map((val, i) => toX(i) + ',' + toY(val)).join(' ');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', linePoints);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#1E3A5F');
    polyline.setAttribute('stroke-width', '2.5');
    polyline.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(polyline);

    // Draw data points, labels and x axis labels
    data.forEach(function(val, i) {
        const x = toX(i);
        const y = toY(val);

        // Data point circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#1E3A5F');
        svg.appendChild(circle);

        // Value label above point
        const valLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valLabel.setAttribute('x', x);
        valLabel.setAttribute('y', y - 8);
        valLabel.setAttribute('text-anchor', 'middle');
        valLabel.setAttribute('font-size', '9');
        valLabel.setAttribute('fill', '#1E3A5F');
        valLabel.setAttribute('font-weight', '600');
        valLabel.textContent = val;
        svg.appendChild(valLabel);

        // X axis label below point
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', x);
        xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '9');
        xLabel.setAttribute('fill', '#aaa');
        xLabel.textContent = labels[i];
        svg.appendChild(xLabel);
    });

    // Draw target headcount horizontal dashed line
    const target = parseFloat(document.getElementById('hc-target').value) || 0;
    if (target > 0) {
        const targetY = toY(target);

        // Dashed line
        const targetLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        targetLine.setAttribute('x1', padL);
        targetLine.setAttribute('y1', targetY);
        targetLine.setAttribute('x2', width - padR);
        targetLine.setAttribute('y2', targetY);
        targetLine.setAttribute('stroke', '#F97316');
        targetLine.setAttribute('stroke-width', '1.5');
        targetLine.setAttribute('stroke-dasharray', '5,4');
        svg.appendChild(targetLine);

        // Target label
        const targetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        targetLabel.setAttribute('x', padL - 5);
        targetLabel.setAttribute('y', targetY + 3);
        targetLabel.setAttribute('text-anchor', 'end');
        targetLabel.setAttribute('font-size', '9');
        targetLabel.setAttribute('fill', '#F97316');
        targetLabel.setAttribute('font-weight', '600');
        targetLabel.textContent = 'Target ' + target;
        svg.appendChild(targetLabel);
    }
}

// Add event listeners to all headcount inputs
document.querySelectorAll('#page-hc input').forEach(function(input) {
    input.addEventListener('input', calcHeadcount);
});

// Run once on load to show default values
calcHeadcount();

// ================================
// TALENT ACQUISITION PAGE
// ================================

function calcTA() {

    // Read input values
    const ats          = parseFloat(document.getElementById('ta-ats').value)          || 0;
    const ads          = parseFloat(document.getElementById('ta-ads').value)          || 0;
    const agencyHires  = parseFloat(document.getElementById('ta-agency-hires').value) || 0;
    const agencyFee    = parseFloat(document.getElementById('ta-agency-fee').value)   || 0;
    const hires        = parseFloat(document.getElementById('ta-hires').value)        || 0;
    const costPerHire  = parseFloat(document.getElementById('ta-cost-hire').value)    || 0;
    const referral     = parseFloat(document.getElementById('ta-referral').value)     || 0;
    const buyout       = parseFloat(document.getElementById('ta-buyout').value)       || 0;
    const branding     = parseFloat(document.getElementById('ta-branding').value)     || 0;
    const growth       = parseFloat(document.getElementById('ta-growth').value)       || 0;
    const contingency  = parseFloat(document.getElementById('ta-contingency').value)  || 0;

    // Calculate components
    const techAds      = ats + ads;
    const agencyTotal  = agencyHires * agencyFee;
    const hiringTotal  = hires * costPerHire;
    const referralTotal = referral + buyout;
    const brandingTotal = branding;

    // Subtotal before contingency
    const subtotal = techAds + agencyTotal + hiringTotal + referralTotal + brandingTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('ta-c1').textContent = 'RM ' + techAds.toLocaleString();
    document.getElementById('ta-c2').textContent = 'RM ' + agencyTotal.toLocaleString();
    document.getElementById('ta-c3').textContent = 'RM ' + hiringTotal.toLocaleString();
    document.getElementById('ta-c4').textContent = 'RM ' + referralTotal.toLocaleString();
    document.getElementById('ta-c5').textContent = 'RM ' + brandingTotal.toLocaleString();
    document.getElementById('ta-c6').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('ta-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Technology & Ads',  value: techAds,       color: '#3B82F6' },
        { name: 'Agency Fees',       value: agencyTotal,   color: '#6366F1' },
        { name: 'Hiring Costs',      value: hiringTotal,   color: '#8B5CF6' },
        { name: 'Referral & Buyout', value: referralTotal, color: '#EC4899' },
        { name: 'Branding Events',   value: brandingTotal, color: '#F59E0B' },
        { name: 'Contingency',       value: contingencyAmt,color: '#ccc'    }
    ];
    drawCompChart('ta-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('ta-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all TA inputs
document.querySelectorAll('#page-ta input').forEach(function(input) {
    input.addEventListener('input', calcTA);
});

// ================================
// REUSABLE CHART FUNCTIONS
// ================================

// Component contribution horizontal bar chart
function drawCompChart(containerId, components, total) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    components.forEach(function(comp) {
        const pct = total > 0 ? Math.round(comp.value / total * 100) : 0;

        const row = document.createElement('div');
        row.className = 'comp-row';

        row.innerHTML = `
            <span class="comp-name">${comp.name}</span>
            <div class="comp-track">
                <div class="comp-fill" style="width:${pct}%;background:${comp.color};"></div>
            </div>
            <span class="comp-pct">${pct}%</span>
        `;

        container.appendChild(row);
    });
}

// 5 year projection bar chart
function drawProjChart(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const maxVal = Math.max(...data);
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
    const labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    data.forEach(function(val, i) {
        const heightPct = maxVal > 0 ? (val / maxVal * 150) : 0;   // max bar = 75px

        const group = document.createElement('div');
        group.className = 'proj-bar-group';

        group.innerHTML = `
            <div class="proj-bar-val">RM ${(val/1000).toFixed(0)}K</div>
            <div class="proj-bar" style="height:${heightPct}px;background:${colors[i]};"></div>
            <div class="proj-bar-lbl">${labels[i]}</div>
        `;

        container.appendChild(group);
    });
}

// Run once on load
calcTA();

// ================================
// YOUNG TALENT PAGE
// ================================

function calcYT() {

    // Read input values
    const gradNum      = parseFloat(document.getElementById('yt-grad-num').value)       || 0;
    const gradAllow    = parseFloat(document.getElementById('yt-grad-allowance').value) || 0;
    const gradDuration = parseFloat(document.getElementById('yt-grad-duration').value)  || 0;
    const internNum    = parseFloat(document.getElementById('yt-intern-num').value)     || 0;
    const internAllow  = parseFloat(document.getElementById('yt-intern-allowance').value)|| 0;
    const internDur    = parseFloat(document.getElementById('yt-intern-duration').value)|| 0;
    const scholarNum   = parseFloat(document.getElementById('yt-scholar-num').value)    || 0;
    const scholarTuition= parseFloat(document.getElementById('yt-scholar-tuition').value)|| 0;
    const scholarLiving = parseFloat(document.getElementById('yt-scholar-living').value)|| 0;
    const mgmt         = parseFloat(document.getElementById('yt-mgmt').value)           || 0;
    const growth       = parseFloat(document.getElementById('yt-growth').value)         || 0;
    const contingency  = parseFloat(document.getElementById('yt-contingency').value)    || 0;

    // Calculate components
    const gradTotal    = gradNum * gradAllow * gradDuration;
    const internTotal  = internNum * internAllow * internDur;
    const scholarTotal = scholarNum * (scholarTuition + scholarLiving * 12);
    const mgmtTotal    = mgmt;

    // Subtotal before contingency
    const subtotal = gradTotal + internTotal + scholarTotal + mgmtTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('yt-c1').textContent = 'RM ' + gradTotal.toLocaleString();
    document.getElementById('yt-c2').textContent = 'RM ' + internTotal.toLocaleString();
    document.getElementById('yt-c3').textContent = 'RM ' + scholarTotal.toLocaleString();
    document.getElementById('yt-c4').textContent = 'RM ' + mgmtTotal.toLocaleString();
    document.getElementById('yt-c5').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('yt-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Graduate Programme', value: gradTotal,     color: '#8B5CF6' },
        { name: 'Internship',         value: internTotal,   color: '#10B981' },
        { name: 'Scholarship',        value: scholarTotal,  color: '#6366F1' },
        { name: 'Programme Mgmt',     value: mgmtTotal,     color: '#F59E0B' },
        { name: 'Contingency',        value: contingencyAmt,color: '#ccc'    }
    ];
    drawCompChart('yt-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('yt-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all Young Talent inputs
document.querySelectorAll('#page-yt input').forEach(function(input) {
    input.addEventListener('input', calcYT);
});

// Run once on load
calcYT();

// ================================
// LEARNING & DEVELOPMENT PAGE
// ================================

function calcLD() {

    // Read input values
    const lms          = parseFloat(document.getElementById('ld-lms').value)         || 0;
    const elearning    = parseFloat(document.getElementById('ld-elearning').value)    || 0;
    const headcount    = parseFloat(document.getElementById('ld-headcount').value)    || 0;
    const days         = parseFloat(document.getElementById('ld-days').value)         || 0;
    const costDay      = parseFloat(document.getElementById('ld-cost-day').value)     || 0;
    const trainer      = parseFloat(document.getElementById('ld-trainer').value)      || 0;
    const leadership   = parseFloat(document.getElementById('ld-leadership').value)   || 0;
    const conference   = parseFloat(document.getElementById('ld-conference').value)   || 0;
    const sponsorship  = parseFloat(document.getElementById('ld-sponsorship').value)  || 0;
    const growth       = parseFloat(document.getElementById('ld-growth').value)       || 0;
    const contingency  = parseFloat(document.getElementById('ld-contingency').value)  || 0;

    // Calculate components
    const platformTotal    = lms + elearning;
    const trainingTotal    = (headcount * days * costDay) + trainer;
    const leadershipTotal  = leadership;
    const externalTotal    = conference + sponsorship;

    // Subtotal before contingency
    const subtotal = platformTotal + trainingTotal + leadershipTotal + externalTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('ld-c1').textContent = 'RM ' + platformTotal.toLocaleString();
    document.getElementById('ld-c2').textContent = 'RM ' + trainingTotal.toLocaleString();
    document.getElementById('ld-c3').textContent = 'RM ' + leadershipTotal.toLocaleString();
    document.getElementById('ld-c4').textContent = 'RM ' + externalTotal.toLocaleString();
    document.getElementById('ld-c5').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('ld-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Learning Platform',        value: platformTotal,   color: '#10B981' },
        { name: 'Training Programmes',      value: trainingTotal,   color: '#3B82F6' },
        { name: 'Leadership Dev.',          value: leadershipTotal, color: '#6366F1' },
        { name: 'Conferences & Sponsorship',value: externalTotal,   color: '#F59E0B' },
        { name: 'Contingency',              value: contingencyAmt,  color: '#ccc'    }
    ];
    drawCompChart('ld-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('ld-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all L&D inputs
document.querySelectorAll('#page-ld input').forEach(function(input) {
    input.addEventListener('input', calcLD);
});

// Run once on load
calcLD();

// ================================
// EMPLOYEE ENGAGEMENT PAGE
// ================================

function calcEE() {

    // Read input values
    const survey       = parseFloat(document.getElementById('ee-survey').value)      || 0;
    const pulse        = parseFloat(document.getElementById('ee-pulse').value)       || 0;
    const recognPer    = parseFloat(document.getElementById('ee-recog-per').value)   || 0;
    const headcount    = parseFloat(document.getElementById('ee-headcount').value)   || 0;
    const awards       = parseFloat(document.getElementById('ee-awards').value)      || 0;
    const spot         = parseFloat(document.getElementById('ee-spot').value)        || 0;
    const events       = parseFloat(document.getElementById('ee-events').value)      || 0;
    const teambuilding = parseFloat(document.getElementById('ee-teambuilding').value)|| 0;
    const di           = parseFloat(document.getElementById('ee-di').value)          || 0;
    const growth       = parseFloat(document.getElementById('ee-growth').value)      || 0;
    const contingency  = parseFloat(document.getElementById('ee-contingency').value) || 0;

    // Calculate components
    const surveyTotal  = survey + pulse;
    const recognTotal  = (recognPer * headcount) + awards + spot;
    const cultureTotal = events + teambuilding + di;

    // Subtotal before contingency
    const subtotal = surveyTotal + recognTotal + cultureTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('ee-c1').textContent = 'RM ' + surveyTotal.toLocaleString();
    document.getElementById('ee-c2').textContent = 'RM ' + recognTotal.toLocaleString();
    document.getElementById('ee-c3').textContent = 'RM ' + cultureTotal.toLocaleString();
    document.getElementById('ee-c4').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('ee-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Surveys & Feedback',  value: surveyTotal,   color: '#F59E0B' },
        { name: 'Recognition & Awards',value: recognTotal,   color: '#EC4899' },
        { name: 'Events & Culture',    value: cultureTotal,  color: '#10B981' },
        { name: 'Contingency',         value: contingencyAmt,color: '#ccc'    }
    ];
    drawCompChart('ee-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('ee-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all EE inputs
document.querySelectorAll('#page-ee input').forEach(function(input) {
    input.addEventListener('input', calcEE);
});

// Run once on load
calcEE();

// ================================
// PAYROLL PAGE
// ================================

function calcPayroll() {

    // Read input values
    const headcount    = parseFloat(document.getElementById('pay-headcount').value)   || 0;
    const salary       = parseFloat(document.getElementById('pay-salary').value)      || 0;
    const hrNum        = parseFloat(document.getElementById('pay-hr-num').value)      || 0;
    const hrSalary     = parseFloat(document.getElementById('pay-hr-salary').value)   || 0;
    const epf          = parseFloat(document.getElementById('pay-epf').value)         || 0;
    const socso        = parseFloat(document.getElementById('pay-socso').value)       || 0;
    const eis          = parseFloat(document.getElementById('pay-eis').value)         || 0;
    const overtime     = parseFloat(document.getElementById('pay-overtime').value)    || 0;
    const allowances   = parseFloat(document.getElementById('pay-allowances').value)  || 0;
    const growth       = parseFloat(document.getElementById('pay-growth').value)      || 0;
    const contingency  = parseFloat(document.getElementById('pay-contingency').value) || 0;

    // Calculate components
    const baseSalaries = headcount * salary * 12;           // annual base salaries
    const epfTotal     = Math.round(baseSalaries * epf / 100); // EPF employer contribution
    const socsoTotal   = Math.round((socso + eis) * headcount * 12); // SOCSO + EIS annual
    const hrSalaries   = hrNum * hrSalary * 12;             // HR staff annual salaries
    const variablePay  = overtime + allowances;             // variable pay total

    // Subtotal before contingency
    const subtotal = baseSalaries + epfTotal + socsoTotal + hrSalaries + variablePay;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('pay-c1').textContent = 'RM ' + baseSalaries.toLocaleString();
    document.getElementById('pay-c2').textContent = 'RM ' + epfTotal.toLocaleString();
    document.getElementById('pay-c3').textContent = 'RM ' + socsoTotal.toLocaleString();
    document.getElementById('pay-c4').textContent = 'RM ' + hrSalaries.toLocaleString();
    document.getElementById('pay-c5').textContent = 'RM ' + variablePay.toLocaleString();
    document.getElementById('pay-c6').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('pay-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Base Salaries',   value: baseSalaries,  color: '#6366F1' },
        { name: 'EPF (Employer)',  value: epfTotal,       color: '#3B82F6' },
        { name: 'SOCSO + EIS',     value: socsoTotal,     color: '#10B981' },
        { name: 'HR Staff Salaries',value: hrSalaries,   color: '#EC4899' },
        { name: 'Variable Pay',    value: variablePay,    color: '#F59E0B' },
        { name: 'Contingency',     value: contingencyAmt, color: '#ccc'   }
    ];
    drawCompChart('pay-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('pay-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all Payroll inputs
document.querySelectorAll('#page-payroll input').forEach(function(input) {
    input.addEventListener('input', calcPayroll);
});

// Run once on load
calcPayroll();

// ================================
// REWARDS & BENEFITS PAGE
// ================================

function calcRB() {

    // Read input values
    const headcount   = parseFloat(document.getElementById('rb-headcount').value)   || 0;
    const bonus       = parseFloat(document.getElementById('rb-bonus').value)       || 0;
    const medical     = parseFloat(document.getElementById('rb-medical').value)     || 0;
    const insurance   = parseFloat(document.getElementById('rb-insurance').value)   || 0;
    const dental      = parseFloat(document.getElementById('rb-dental').value)      || 0;
    const life        = parseFloat(document.getElementById('rb-life').value)        || 0;
    const flexible    = parseFloat(document.getElementById('rb-flexible').value)    || 0;
    const esos        = parseFloat(document.getElementById('rb-esos').value)        || 0;
    const growth      = parseFloat(document.getElementById('rb-growth').value)      || 0;
    const contingency = parseFloat(document.getElementById('rb-contingency').value) || 0;

    // Calculate components
    const bonusTotal    = headcount * bonus;
    const medicalTotal  = headcount * (medical + insurance + dental + life);
    const otherTotal    = flexible + esos;

    // Subtotal before contingency
    const subtotal = bonusTotal + medicalTotal + otherTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('rb-c1').textContent = 'RM ' + bonusTotal.toLocaleString();
    document.getElementById('rb-c2').textContent = 'RM ' + medicalTotal.toLocaleString();
    document.getElementById('rb-c3').textContent = 'RM ' + otherTotal.toLocaleString();
    document.getElementById('rb-c4').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('rb-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Performance Bonus', value: bonusTotal,    color: '#EC4899' },
        { name: 'Medical & Insurance',value: medicalTotal, color: '#3B82F6' },
        { name: 'Other Benefits',    value: otherTotal,    color: '#10B981' },
        { name: 'Contingency',       value: contingencyAmt,color: '#ccc'   }
    ];
    drawCompChart('rb-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('rb-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all R&B inputs
document.querySelectorAll('#page-rb input').forEach(function(input) {
    input.addEventListener('input', calcRB);
});

// Run once on load
calcRB();

// ================================
// HEALTH, SAFETY & WELLBEING PAGE
// ================================

function calcHS() {

    // Read input values
    const safetyTraining = parseFloat(document.getElementById('hs-safety-training').value) || 0;
    const safetyEquip    = parseFloat(document.getElementById('hs-safety-equip').value)    || 0;
    const headcount      = parseFloat(document.getElementById('hs-headcount').value)       || 0;
    const wellnessPer    = parseFloat(document.getElementById('hs-wellness-per').value)    || 0;
    const gym            = parseFloat(document.getElementById('hs-gym').value)             || 0;
    const screening      = parseFloat(document.getElementById('hs-screening').value)       || 0;
    const eap            = parseFloat(document.getElementById('hs-eap').value)             || 0;
    const mental         = parseFloat(document.getElementById('hs-mental').value)          || 0;
    const critical       = parseFloat(document.getElementById('hs-critical').value)        || 0;
    const growth         = parseFloat(document.getElementById('hs-growth').value)          || 0;
    const contingency    = parseFloat(document.getElementById('hs-contingency').value)     || 0;

    // Calculate components
    const safetyTotal   = safetyTraining + safetyEquip;
    const wellnessTotal = (headcount * wellnessPer) + gym + screening;
    const eapTotal      = eap + mental + critical;

    // Subtotal before contingency
    const subtotal = safetyTotal + wellnessTotal + eapTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('hs-c1').textContent = 'RM ' + safetyTotal.toLocaleString();
    document.getElementById('hs-c2').textContent = 'RM ' + wellnessTotal.toLocaleString();
    document.getElementById('hs-c3').textContent = 'RM ' + eapTotal.toLocaleString();
    document.getElementById('hs-c4').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('hs-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Workplace Safety',  value: safetyTotal,   color: '#F97316' },
        { name: 'Wellness',          value: wellnessTotal, color: '#14B8A6' },
        { name: 'EAP & Mental Health',value: eapTotal,     color: '#8B5CF6' },
        { name: 'Contingency',       value: contingencyAmt,color: '#ccc'   }
    ];
    drawCompChart('hs-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('hs-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all Health & Safety inputs
document.querySelectorAll('#page-health input').forEach(function(input) {
    input.addEventListener('input', calcHS);
});

// Run once on load
calcHS();

// ================================
// LEGAL & COMPLIANCE PAGE
// ================================

function calcLC() {

    // Read input values
    const retainer    = parseFloat(document.getElementById('lc-retainer').value)    || 0;
    const court       = parseFloat(document.getElementById('lc-court').value)       || 0;
    const contracts   = parseFloat(document.getElementById('lc-contracts').value)   || 0;
    const ir          = parseFloat(document.getElementById('lc-ir').value)          || 0;
    const audit       = parseFloat(document.getElementById('lc-audit').value)       || 0;
    const pdpa        = parseFloat(document.getElementById('lc-pdpa').value)        || 0;
    const policy      = parseFloat(document.getElementById('lc-policy').value)      || 0;
    const training    = parseFloat(document.getElementById('lc-training').value)    || 0;
    const growth      = parseFloat(document.getElementById('lc-growth').value)      || 0;
    const contingency = parseFloat(document.getElementById('lc-contingency').value) || 0;

    // Calculate components
    const legalTotal      = retainer + court + contracts + ir;
    const complianceTotal = audit + pdpa;
    const policyTotal     = policy + training;

    // Subtotal before contingency
    const subtotal = legalTotal + complianceTotal + policyTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('lc-c1').textContent = 'RM ' + legalTotal.toLocaleString();
    document.getElementById('lc-c2').textContent = 'RM ' + complianceTotal.toLocaleString();
    document.getElementById('lc-c3').textContent = 'RM ' + policyTotal.toLocaleString();
    document.getElementById('lc-c4').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('lc-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Legal & Court Cases', value: legalTotal,      color: '#F97316' },
        { name: 'Compliance & Audits', value: complianceTotal, color: '#3B82F6' },
        { name: 'Policy & Training',   value: policyTotal,     color: '#10B981' },
        { name: 'Contingency',         value: contingencyAmt,  color: '#ccc'   }
    ];
    drawCompChart('lc-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('lc-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all Legal & Compliance inputs
document.querySelectorAll('#page-legal input').forEach(function(input) {
    input.addEventListener('input', calcLC);
});

// Run once on load
calcLC();

// ================================
// HR SYSTEMS & TECHNOLOGY PAGE
// ================================

function calcTech() {

    // Read input values
    const hris         = parseFloat(document.getElementById('tech-hris').value)        || 0;
    const payroll      = parseFloat(document.getElementById('tech-payroll').value)     || 0;
    const pms          = parseFloat(document.getElementById('tech-pms').value)         || 0;
    const analytics    = parseFloat(document.getElementById('tech-analytics').value)   || 0;
    const maintenance  = parseFloat(document.getElementById('tech-maintenance').value) || 0;
    const integration  = parseFloat(document.getElementById('tech-integration').value) || 0;
    const consultancy  = parseFloat(document.getElementById('tech-consultancy').value) || 0;
    const growth       = parseFloat(document.getElementById('tech-growth').value)      || 0;
    const contingency  = parseFloat(document.getElementById('tech-contingency').value) || 0;

    // Calculate components
    const coreTotal        = hris + payroll;
    const analyticsTotal   = pms + analytics;
    const maintenanceTotal = maintenance + integration;
    const projectsTotal    = consultancy;

    // Subtotal before contingency
    const subtotal = coreTotal + analyticsTotal + maintenanceTotal + projectsTotal;

    // Contingency amount
    const contingencyAmt = Math.round(subtotal * contingency / 100);

    // Year 1 total
    const y1 = subtotal + contingencyAmt;

    // Year 2 to 5 — compound growth
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    // Update breakdown cards
    document.getElementById('tech-c1').textContent = 'RM ' + coreTotal.toLocaleString();
    document.getElementById('tech-c2').textContent = 'RM ' + analyticsTotal.toLocaleString();
    document.getElementById('tech-c3').textContent = 'RM ' + maintenanceTotal.toLocaleString();
    document.getElementById('tech-c4').textContent = 'RM ' + projectsTotal.toLocaleString();
    document.getElementById('tech-c5').textContent = 'RM ' + contingencyAmt.toLocaleString();

    // Update total
    document.getElementById('tech-total').textContent = 'RM ' + y1.toLocaleString();

    // Draw component chart
    const components = [
        { name: 'Core HR Systems',       value: coreTotal,        color: '#6366F1' },
        { name: 'Performance & Analytics',value: analyticsTotal,  color: '#3B82F6' },
        { name: 'Maintenance',           value: maintenanceTotal, color: '#10B981' },
        { name: 'Special Projects',      value: projectsTotal,    color: '#EC4899' },
        { name: 'Contingency',           value: contingencyAmt,   color: '#ccc'   }
    ];
    drawCompChart('tech-comp-chart', components, y1);

    // Draw projection chart
    drawProjChart('tech-proj-chart', [y1, y2, y3, y4, y5]);
}

// Add event listeners to all HR Tech inputs
document.querySelectorAll('#page-tech input').forEach(function(input) {
    input.addEventListener('input', calcTech);
});

// Run once on load
calcTech();

// ================================
// GET ALL PAGE TOTALS
// ================================

function getAllTotals() {

    // Read total values from each page's total display
    // These are already calculated by each page's calc function
    const taText      = document.getElementById('ta-total').textContent;
    const ytText      = document.getElementById('yt-total').textContent;
    const ldText      = document.getElementById('ld-total').textContent;
    const eeText      = document.getElementById('ee-total').textContent;
    const payText     = document.getElementById('pay-total').textContent;
    const rbText      = document.getElementById('rb-total').textContent;
    const hsText      = document.getElementById('hs-total').textContent;
    const lcText      = document.getElementById('lc-total').textContent;
    const techText    = document.getElementById('tech-total').textContent;

    // Strip RM and commas then convert to number
    function toNum(text) {
        return parseFloat(text.replace('RM', '').replace(/,/g, '').trim()) || 0;
    }

    const ta   = toNum(taText);
    const yt   = toNum(ytText);
    const ld   = toNum(ldText);
    const ee   = toNum(eeText);
    const pay  = toNum(payText);
    const rb   = toNum(rbText);
    const hs   = toNum(hsText);
    const lc   = toNum(lcText);
    const tech = toNum(techText);

    // Total HR budget Year 1
    const total = ta + yt + ld + ee + pay + rb + hs + lc + tech;

    // Total headcount from HC page
    const hc = parseFloat(document.getElementById('hc-total').textContent) || 0;

    // Cost per employee
    const cpe = hc > 0 ? Math.round(total / hc) : 0;

    return { ta, yt, ld, ee, pay, rb, hs, lc, tech, total, hc, cpe };
}

// ================================
// DASHBOARD PAGE
// ================================

function calcDashboard() {

    // Get all page totals
    const t = getAllTotals();

    // Update KPI cards
    document.getElementById('dash-total-y1').textContent = 'RM ' + t.total.toLocaleString();
    document.getElementById('dash-cpe-y1').textContent   = 'RM ' + t.cpe.toLocaleString();
    document.getElementById('dash-hc').textContent       = t.hc;

    // Budget by function — horizontal bar chart
    const functions = [
        { name: 'Payroll',              value: t.pay,  color: '#6366F1' },
        { name: 'Rewards & Benefits',   value: t.rb,   color: '#EC4899' },
        { name: 'Young Talent',         value: t.yt,   color: '#8B5CF6' },
        { name: 'L&D',                  value: t.ld,   color: '#10B981' },
        { name: 'Talent Acquisition',   value: t.ta,   color: '#3B82F6' },
        { name: 'Employee Engagement',  value: t.ee,   color: '#F59E0B' },
        { name: 'Health & Wellbeing',   value: t.hs,   color: '#14B8A6' },
        { name: 'HR Tech',              value: t.tech, color: '#F97316' },
        { name: 'Legal & Compliance',   value: t.lc,   color: '#EF4444' }
    ];

    drawCompChart('dash-by-function', functions, t.total);

    // Donut chart
    drawDonut(functions, t.total);

    // 5 year projection line chart
    // Get growth rates from each page and project total
    const growth = parseFloat(document.getElementById('pay-growth').value) || 0;
    const y1 = t.total;
    const y2 = Math.round(y1 * (1 + growth / 100));
    const y3 = Math.round(y2 * (1 + growth / 100));
    const y4 = Math.round(y3 * (1 + growth / 100));
    const y5 = Math.round(y4 * (1 + growth / 100));

    drawDashLineChart([y1, y2, y3, y4, y5]);
}

// Draw donut chart
function drawDonut(functions, total) {
    const svg = document.getElementById('dash-donut');
    const legend = document.getElementById('dash-legend');
    svg.innerHTML = '';
    legend.innerHTML = '';

    const cx = 60;
    const cy = 60;
    const r  = 45;
    const circumference = 2 * Math.PI * r;

    let offset = 0;

    functions.forEach(function(f) {
        const pct  = total > 0 ? f.value / total : 0;
        const dash = pct * circumference;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', f.color);
        circle.setAttribute('stroke-width', '18');
        circle.setAttribute('stroke-dasharray', dash + ' ' + circumference);
        circle.setAttribute('stroke-dashoffset', -offset);
        circle.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
        svg.appendChild(circle);

        offset += dash;

        // Legend item
        const pctRounded = Math.round(pct * 100);
        if (pctRounded > 0) {
            const item = document.createElement('div');
            item.className = 'dash-legend-item';
            item.innerHTML = `
                <span class="dash-legend-dot" style="background:${f.color}"></span>
                ${f.name} — ${pctRounded}%
            `;
            legend.appendChild(item);
        }
    });
}

// Draw total budget projection line chart
function drawDashLineChart(data) {
    const svg    = document.getElementById('dash-proj-chart');
    const width  = 500;
    const height = 160;
    const padL   = 60;
    const padR   = 20;
    const padT   = 20;
    const padB   = 30;

    svg.innerHTML = '';

    const minVal = Math.min(...data) * 0.9;
    const maxVal = Math.max(...data) * 1.1;

    function toY(val) {
        return padT + (height - padT - padB) * (1 - (val - minVal) / (maxVal - minVal));
    }

    function toX(i) {
        return padL + i * (width - padL - padR) / (data.length - 1);
    }

    const labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    // Grid lines
    for (let i = 0; i < 4; i++) {
        const y = padT + i * (height - padT - padB) / 3;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padL);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padR);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#f0f0f0');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    // Shaded area
    const areaPoints = data.map((val, i) => toX(i) + ',' + toY(val)).join(' ');
    const bottomLeft  = padL + ',' + (height - padB);
    const bottomRight = toX(data.length - 1) + ',' + (height - padB);
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    area.setAttribute('points', bottomLeft + ' ' + areaPoints + ' ' + bottomRight);
    area.setAttribute('fill', '#FFECE1');
    area.setAttribute('opacity', '0.6');
    svg.appendChild(area);

    // Line
    const linePoints = data.map((val, i) => toX(i) + ',' + toY(val)).join(' ');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', linePoints);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#1E3A5F');
    polyline.setAttribute('stroke-width', '2.5');
    polyline.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(polyline);

    // Data points and labels
    data.forEach(function(val, i) {
        const x = toX(i);
        const y = toY(val);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#1E3A5F');
        svg.appendChild(circle);

        // Value label
        const valLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valLabel.setAttribute('x', x);
        valLabel.setAttribute('y', y - 8);
        valLabel.setAttribute('text-anchor', 'middle');
        valLabel.setAttribute('font-size', '9');
        valLabel.setAttribute('fill', '#1E3A5F');
        valLabel.setAttribute('font-weight', '600');
        valLabel.textContent = 'RM ' + (val / 1000000).toFixed(1) + 'M';
        svg.appendChild(valLabel);

        // X label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', x);
        xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '9');
        xLabel.setAttribute('fill', '#aaa');
        xLabel.textContent = labels[i];
        svg.appendChild(xLabel);
    });
}

// ================================
// SUMMARY PAGE
// ================================

function calcSummary() {

    const t = getAllTotals();
    const years = parseInt(document.getElementById('sum-projection').value) || 1;
    const growthMode = document.getElementById('sum-growth-mode').value;

    // Get individual growth rates
    const growthRates = {
        ta:   parseFloat(document.getElementById('ta-growth').value)   || 0,
        yt:   parseFloat(document.getElementById('yt-growth').value)   || 0,
        ld:   parseFloat(document.getElementById('ld-growth').value)   || 0,
        ee:   parseFloat(document.getElementById('ee-growth').value)   || 0,
        pay:  parseFloat(document.getElementById('pay-growth').value)  || 0,
        rb:   parseFloat(document.getElementById('rb-growth').value)   || 0,
        hs:   parseFloat(document.getElementById('hs-growth').value)   || 0,
        lc:   parseFloat(document.getElementById('lc-growth').value)   || 0,
        tech: parseFloat(document.getElementById('tech-growth').value) || 0
    };

    // Override growth rates if selected
    if (growthMode !== 'individual') {
        const override = parseFloat(growthMode) || 0;
        Object.keys(growthRates).forEach(function(key) {
            growthRates[key] = override;
        });
    }

    // HC growth rate
    const hcGrowth = parseFloat(document.getElementById('hc-growth').value) || 0;

    // Function to project a value over n years
    function project(base, rate, n) {
        let val = base;
        for (let i = 1; i < n; i++) {
            val = Math.round(val * (1 + rate / 100));
        }
        return val;
    }

    // Build year columns
    const yearCols = [];
    for (let y = 1; y <= years; y++) {
        yearCols.push(y);
    }

    // Functions data
    const functions = [
        { name: 'Talent Acquisition',      key: 'ta',   y1: t.ta,   rate: growthRates.ta,   color: '#3B82F6' },
        { name: 'Young Talent',             key: 'yt',   y1: t.yt,   rate: growthRates.yt,   color: '#8B5CF6' },
        { name: 'Learning & Development',   key: 'ld',   y1: t.ld,   rate: growthRates.ld,   color: '#10B981' },
        { name: 'Employee Engagement',      key: 'ee',   y1: t.ee,   rate: growthRates.ee,   color: '#F59E0B' },
        { name: 'Payroll',                  key: 'pay',  y1: t.pay,  rate: growthRates.pay,  color: '#6366F1' },
        { name: 'Rewards & Benefits',       key: 'rb',   y1: t.rb,   rate: growthRates.rb,   color: '#EC4899' },
        { name: 'Health, Safety & Wellbeing',key:'hs',  y1: t.hs,   rate: growthRates.hs,   color: '#14B8A6' },
        { name: 'Legal & Compliance',       key: 'lc',  y1: t.lc,   rate: growthRates.lc,   color: '#F97316' },
        { name: 'HR Systems & Technology',  key: 'tech', y1: t.tech, rate: growthRates.tech, color: '#EF4444' }
    ];

    // Build header row
    const headerRow = document.getElementById('sum-header-row');
    headerRow.innerHTML = '<th>Function</th>';
    yearCols.forEach(function(y) {
        const th = document.createElement('th');
        th.textContent = 'Year ' + y;
        headerRow.appendChild(th);
    });
    const thPct = document.createElement('th');
    thPct.textContent = '% of Total';
    headerRow.appendChild(thPct);

    // Build body rows
    const tbody = document.getElementById('sum-body');
    tbody.innerHTML = '';

    // Track column totals
    const colTotals = yearCols.map(() => 0);

    functions.forEach(function(f) {
        const tr = document.createElement('tr');

        // Function name cell
        const tdName = document.createElement('td');
        tdName.innerHTML = '<span class="dot" style="background:' + f.color + '"></span>' + f.name;
        tr.appendChild(tdName);

        // Year value cells
        yearCols.forEach(function(y, i) {
            const val = project(f.y1, f.rate, y);
            colTotals[i] += val;
            const td = document.createElement('td');
            td.textContent = 'RM ' + val.toLocaleString();
            tr.appendChild(td);
        });

        // % of total
        const pct = t.total > 0 ? Math.round(f.y1 / t.total * 100) : 0;
        const tdPct = document.createElement('td');
        tdPct.textContent = pct + '%';
        tr.appendChild(tdPct);

        tbody.appendChild(tr);
    });

    // Total row
    const totalRow = document.getElementById('sum-total-row');
    totalRow.innerHTML = '<td><b>Total Budget</b></td>';
    colTotals.forEach(function(val) {
        const td = document.createElement('td');
        td.textContent = 'RM ' + val.toLocaleString();
        totalRow.appendChild(td);
    });
    const tdPctTotal = document.createElement('td');
    tdPctTotal.textContent = '100%';
    totalRow.appendChild(tdPctTotal);

    // HC row
    const hcRow = document.getElementById('sum-hc-row');
    hcRow.innerHTML = '<td>Total Headcount</td>';
    yearCols.forEach(function(y) {
        const hc = project(t.hc, hcGrowth, y);
        const td = document.createElement('td');
        td.textContent = hc;
        hcRow.appendChild(td);
    });
    hcRow.appendChild(document.createElement('td'));

    // CPE row
    const cpeRow = document.getElementById('sum-cpe-row');
    cpeRow.innerHTML = '<td>Cost per Employee</td>';
    yearCols.forEach(function(y, i) {
        const hc = project(t.hc, hcGrowth, y);
        const cpe = hc > 0 ? Math.round(colTotals[i] / hc) : 0;
        const td = document.createElement('td');
        td.textContent = 'RM ' + cpe.toLocaleString();
        cpeRow.appendChild(td);
    });
    cpeRow.appendChild(document.createElement('td'));

    // Total investment
    const totalInvest = colTotals.reduce(function(a, b) { return a + b; }, 0);
    document.getElementById('sum-total-invest').textContent = 'RM ' + totalInvest.toLocaleString();

    // Benchmark check
    const cpeY1 = t.hc > 0 ? Math.round(t.total / t.hc) : 0;
    const note = document.getElementById('sum-benchmark-note');
    if (cpeY1 < 18000) {
        note.textContent = '⚠ Below benchmark — review budget allocation';
        note.style.color = '#EF4444';
    } else if (cpeY1 > 45000) {
        note.textContent = '⚠ Above benchmark — review Payroll structure';
        note.style.color = '#EF4444';
    } else {
        note.textContent = '✓ Within benchmark range';
        note.style.color = '#059669';
    }
}

// Run summary when navigating to it
// Add to showPage function

// Summary dropdown listeners
document.getElementById('sum-projection').addEventListener('change', calcSummary);
document.getElementById('sum-growth-mode').addEventListener('change', calcSummary);


// ================================
// EXCEL DOWNLOAD
// ================================

function downloadExcel() {

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // ---- HEADCOUNT SHEET ----
    const hcData = [
        ['HR Budget Estimator — Headcount Planning'],
        [],
        ['CURRENT HEADCOUNT'],
        ['Permanent Employees',     document.getElementById('hc-permanent').value],
        ['Contract Employees',      document.getElementById('hc-contract').value],
        ['Interns / Trainees',      document.getElementById('hc-interns').value],
        [],
        ['PLANNED CHANGES (Year 1)'],
        ['Planned New Hires',       document.getElementById('hc-newhires').value],
        ['Planned Attrition',       document.getElementById('hc-attrition').value],
        ['Planned Retrenchments',   document.getElementById('hc-retrench').value],
        ['Retirements',             document.getElementById('hc-retire').value],
        [],
        ['GROWTH PROJECTION'],
        ['Annual Headcount Growth Rate (%)', document.getElementById('hc-growth').value],
        ['Target Headcount',        document.getElementById('hc-target').value],
    ];
    const hcSheet = XLSX.utils.aoa_to_sheet(hcData);
    XLSX.utils.book_append_sheet(wb, hcSheet, 'Headcount');

    // ---- TALENT ACQUISITION SHEET ----
    const taData = [
        ['HR Budget Estimator — Talent Acquisition'],
        [],
        ['HR TECH & ADVERTISING'],
        ['ATS & Sourcing Tools (RM/year)',          document.getElementById('ta-ats').value],
        ['Job Portal & Social Media Ads (RM/year)',  document.getElementById('ta-ads').value],
        ['Employer Branding Events (RM)',            document.getElementById('ta-branding').value],
        [],
        ['HIRING COSTS'],
        ['Number of Agency Hires',                   document.getElementById('ta-agency-hires').value],
        ['Agency Fee per Hire (RM)',                 document.getElementById('ta-agency-fee').value],
        ['Total Estimated Hires',                    document.getElementById('ta-hires').value],
        ['Average Cost per Hire (RM)',               document.getElementById('ta-cost-hire').value],
        [],
        ['REFERRAL & BUYOUT COSTS'],
        ['Referral Bonus Total (RM)',                document.getElementById('ta-referral').value],
        ['Buyout / Sign-on Compensation (RM)',       document.getElementById('ta-buyout').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('ta-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('ta-contingency').value],
        [],
        ['TOTAL TA BUDGET (Year 1)',                 document.getElementById('ta-total').textContent],
    ];
    const taSheet = XLSX.utils.aoa_to_sheet(taData);
    XLSX.utils.book_append_sheet(wb, taSheet, 'Talent Acquisition');

    // ---- YOUNG TALENT SHEET ----
    const ytData = [
        ['HR Budget Estimator — Young Talent'],
        [],
        ['GRADUATE PROGRAMME'],
        ['Number of Graduates',                      document.getElementById('yt-grad-num').value],
        ['Monthly Allowance (RM)',                   document.getElementById('yt-grad-allowance').value],
        ['Programme Duration (months)',              document.getElementById('yt-grad-duration').value],
        [],
        ['INTERNSHIP'],
        ['Number of Interns',                        document.getElementById('yt-intern-num').value],
        ['Monthly Allowance (RM)',                   document.getElementById('yt-intern-allowance').value],
        ['Average Duration (months)',                document.getElementById('yt-intern-duration').value],
        [],
        ['SCHOLARSHIP'],
        ['Number of Scholars',                       document.getElementById('yt-scholar-num').value],
        ['Annual Tuition per Scholar (RM)',          document.getElementById('yt-scholar-tuition').value],
        ['Monthly Living Allowance (RM)',            document.getElementById('yt-scholar-living').value],
        ['Programme Management Cost (RM/year)',      document.getElementById('yt-mgmt').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('yt-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('yt-contingency').value],
        [],
        ['TOTAL YOUNG TALENT BUDGET (Year 1)',       document.getElementById('yt-total').textContent],
    ];
    const ytSheet = XLSX.utils.aoa_to_sheet(ytData);
    XLSX.utils.book_append_sheet(wb, ytSheet, 'Young Talent');

    // ---- L&D SHEET ----
    const ldData = [
        ['HR Budget Estimator — Learning & Development'],
        [],
        ['LEARNING PLATFORM & CONTENT'],
        ['LMS Subscription (RM/year)',               document.getElementById('ld-lms').value],
        ['e-Learning Content Library (RM/year)',     document.getElementById('ld-elearning').value],
        [],
        ['TRAINING PROGRAMMES'],
        ['Total Headcount',                          document.getElementById('ld-headcount').value],
        ['Training Days per Employee',               document.getElementById('ld-days').value],
        ['Cost per Training Day (RM)',               document.getElementById('ld-cost-day').value],
        ['External Trainer Fees (RM/year)',          document.getElementById('ld-trainer').value],
        ['Leadership Programme Budget (RM/year)',    document.getElementById('ld-leadership').value],
        [],
        ['EXTERNAL DEVELOPMENT'],
        ['Conference & Seminar Budget (RM/year)',    document.getElementById('ld-conference').value],
        ['Sponsorship & Tuition Reimbursement (RM/year)', document.getElementById('ld-sponsorship').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('ld-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('ld-contingency').value],
        [],
        ['TOTAL L&D BUDGET (Year 1)',                document.getElementById('ld-total').textContent],
    ];
    const ldSheet = XLSX.utils.aoa_to_sheet(ldData);
    XLSX.utils.book_append_sheet(wb, ldSheet, 'Learning & Development');

    // ---- EMPLOYEE ENGAGEMENT SHEET ----
    const eeData = [
        ['HR Budget Estimator — Employee Engagement'],
        [],
        ['SURVEYS & FEEDBACK TOOLS'],
        ['Engagement Survey Cost (RM/year)',         document.getElementById('ee-survey').value],
        ['Pulse Survey Tools (RM/year)',             document.getElementById('ee-pulse').value],
        [],
        ['RECOGNITION & AWARDS'],
        ['Recognition Budget per Employee (RM)',     document.getElementById('ee-recog-per').value],
        ['Total Headcount',                          document.getElementById('ee-headcount').value],
        ['Service Awards Budget (RM/year)',          document.getElementById('ee-awards').value],
        ['Spot Bonus Pool (RM/year)',                document.getElementById('ee-spot').value],
        [],
        ['EVENTS & CULTURE'],
        ['Annual Company Events (RM/year)',          document.getElementById('ee-events').value],
        ['Team Building Activities (RM/year)',       document.getElementById('ee-teambuilding').value],
        ['D&I Initiatives (RM/year)',                document.getElementById('ee-di').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('ee-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('ee-contingency').value],
        [],
        ['TOTAL EE BUDGET (Year 1)',                 document.getElementById('ee-total').textContent],
    ];
    const eeSheet = XLSX.utils.aoa_to_sheet(eeData);
    XLSX.utils.book_append_sheet(wb, eeSheet, 'Employee Engagement');

    // ---- PAYROLL SHEET ----
    const payData = [
        ['HR Budget Estimator — Payroll'],
        [],
        ['HEADCOUNT & SALARIES'],
        ['Total Headcount',                          document.getElementById('pay-headcount').value],
        ['Average Monthly Salary (RM)',              document.getElementById('pay-salary').value],
        ['Number of HR Staff',                       document.getElementById('pay-hr-num').value],
        ['Average HR Staff Salary (RM/month)',       document.getElementById('pay-hr-salary').value],
        [],
        ['STATUTORY CONTRIBUTIONS'],
        ['EPF Employer Rate (%)',                    document.getElementById('pay-epf').value],
        ['SOCSO (RM/employee/month)',                document.getElementById('pay-socso').value],
        ['EIS (RM/employee/month)',                  document.getElementById('pay-eis').value],
        [],
        ['VARIABLE PAY'],
        ['Overtime Budget (RM/year)',                document.getElementById('pay-overtime').value],
        ['Allowances Budget (RM/year)',              document.getElementById('pay-allowances').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('pay-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('pay-contingency').value],
        [],
        ['TOTAL PAYROLL BUDGET (Year 1)',            document.getElementById('pay-total').textContent],
    ];
    const paySheet = XLSX.utils.aoa_to_sheet(payData);
    XLSX.utils.book_append_sheet(wb, paySheet, 'Payroll');

    // ---- REWARDS & BENEFITS SHEET ----
    const rbData = [
        ['HR Budget Estimator — Rewards & Benefits'],
        [],
        ['PERFORMANCE BONUS'],
        ['Total Headcount',                          document.getElementById('rb-headcount').value],
        ['Average Annual Bonus per Employee (RM)',   document.getElementById('rb-bonus').value],
        [],
        ['MEDICAL & INSURANCE'],
        ['Medical Benefits per Employee (RM/year)',  document.getElementById('rb-medical').value],
        ['Group Insurance per Employee (RM/year)',   document.getElementById('rb-insurance').value],
        ['Dental & Optical per Employee (RM/year)', document.getElementById('rb-dental').value],
        ['Life Insurance per Employee (RM/year)',    document.getElementById('rb-life').value],
        [],
        ['OTHER BENEFITS'],
        ['Flexible Benefits Budget (RM/year)',       document.getElementById('rb-flexible').value],
        ['Staff Equity / ESOS Budget (RM/year)',     document.getElementById('rb-esos').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('rb-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('rb-contingency').value],
        [],
        ['TOTAL R&B BUDGET (Year 1)',                document.getElementById('rb-total').textContent],
    ];
    const rbSheet = XLSX.utils.aoa_to_sheet(rbData);
    XLSX.utils.book_append_sheet(wb, rbSheet, 'Rewards & Benefits');

    // ---- HEALTH & SAFETY SHEET ----
    const hsData = [
        ['HR Budget Estimator — Health, Safety & Wellbeing'],
        [],
        ['WORKPLACE SAFETY'],
        ['Safety Training Budget (RM/year)',         document.getElementById('hs-safety-training').value],
        ['Safety Equipment & Inspections (RM/year)', document.getElementById('hs-safety-equip').value],
        [],
        ['WELLNESS PROGRAMMES'],
        ['Total Headcount',                          document.getElementById('hs-headcount').value],
        ['Wellness Budget per Employee (RM)',        document.getElementById('hs-wellness-per').value],
        ['Gym / Fitness Subsidy (RM/year)',          document.getElementById('hs-gym').value],
        ['Health Screening Budget (RM/year)',        document.getElementById('hs-screening').value],
        [],
        ['EMPLOYEE ASSISTANCE PROGRAMME'],
        ['EAP Subscription (RM/year)',               document.getElementById('hs-eap').value],
        ['Mental Health Initiatives (RM/year)',      document.getElementById('hs-mental').value],
        ['Critical Illness Support (RM/year)',       document.getElementById('hs-critical').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('hs-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('hs-contingency').value],
        [],
        ['TOTAL HEALTH & WELLBEING BUDGET (Year 1)', document.getElementById('hs-total').textContent],
    ];
    const hsSheet = XLSX.utils.aoa_to_sheet(hsData);
    XLSX.utils.book_append_sheet(wb, hsSheet, 'Health Safety Wellbeing');

    // ---- LEGAL & COMPLIANCE SHEET ----
    const lcData = [
        ['HR Budget Estimator — Legal & Compliance'],
        [],
        ['LEGAL COUNSEL & COURT CASES'],
        ['External Legal Retainer (RM/year)',        document.getElementById('lc-retainer').value],
        ['External Court Case Fees (RM/year)',       document.getElementById('lc-court').value],
        ['Employment Contract Reviews (RM/year)',    document.getElementById('lc-contracts').value],
        ['Industrial Relations Cases (RM/year)',     document.getElementById('lc-ir').value],
        [],
        ['COMPLIANCE & AUDITS'],
        ['HR Compliance Audit (RM/year)',            document.getElementById('lc-audit').value],
        ['PDPA Compliance Budget (RM/year)',         document.getElementById('lc-pdpa').value],
        [],
        ['POLICY & COMPLIANCE TRAINING'],
        ['Policy Review & Updates (RM/year)',        document.getElementById('lc-policy').value],
        ['Compliance Training Budget (RM/year)',     document.getElementById('lc-training').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('lc-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('lc-contingency').value],
        [],
        ['TOTAL LEGAL & COMPLIANCE BUDGET (Year 1)', document.getElementById('lc-total').textContent],
    ];
    const lcSheet = XLSX.utils.aoa_to_sheet(lcData);
    XLSX.utils.book_append_sheet(wb, lcSheet, 'Legal Compliance');

    // ---- HR TECH SHEET ----
    const techData = [
        ['HR Budget Estimator — HR Systems & Technology'],
        [],
        ['CORE HR SYSTEMS'],
        ['HRIS Subscription (RM/year)',              document.getElementById('tech-hris').value],
        ['Payroll Software (RM/year)',               document.getElementById('tech-payroll').value],
        [],
        ['PERFORMANCE & ANALYTICS'],
        ['Performance Management System (RM/year)', document.getElementById('tech-pms').value],
        ['People Analytics Tools (RM/year)',         document.getElementById('tech-analytics').value],
        [],
        ['MAINTENANCE & SPECIAL PROJECTS'],
        ['System Maintenance & Upgrades (RM/year)', document.getElementById('tech-maintenance').value],
        ['Integration & Implementation (RM/year)',   document.getElementById('tech-integration').value],
        ['Special / Consultancy Projects (RM/year)', document.getElementById('tech-consultancy').value],
        [],
        ['GROWTH & CONTINGENCY'],
        ['Annual Growth Rate (%)',                   document.getElementById('tech-growth').value],
        ['Contingency Buffer (%)',                   document.getElementById('tech-contingency').value],
        [],
        ['TOTAL HR TECH BUDGET (Year 1)',            document.getElementById('tech-total').textContent],
    ];
    const techSheet = XLSX.utils.aoa_to_sheet(techData);
    XLSX.utils.book_append_sheet(wb, techSheet, 'HR Systems Technology');

    // ---- SUMMARY SHEET ----
    const t = getAllTotals();
    const sumData = [
        ['HR Budget Estimator — Summary'],
        [],
        ['Function',                'Year 1 Budget'],
        ['Talent Acquisition',      t.ta],
        ['Young Talent',            t.yt],
        ['Learning & Development',  t.ld],
        ['Employee Engagement',     t.ee],
        ['Payroll',                 t.pay],
        ['Rewards & Benefits',      t.rb],
        ['Health, Safety & Wellbeing', t.hs],
        ['Legal & Compliance',      t.lc],
        ['HR Systems & Technology', t.tech],
        [],
        ['TOTAL HR BUDGET',         t.total],
        ['Total Headcount',         t.hc],
        ['Cost per Employee',       t.cpe],
    ];
    const sumSheet = XLSX.utils.aoa_to_sheet(sumData);
    XLSX.utils.book_append_sheet(wb, sumSheet, 'Summary');

    // Download the file
    XLSX.writeFile(wb, 'HR_Budget_Estimator.xlsx');
}

// Wire up download button
document.getElementById('btn-download').addEventListener('click', downloadExcel);

// ================================
// EXCEL UPLOAD
// ================================

function uploadExcel(file) {

    const reader = new FileReader();

    reader.onload = function(e) {

        // Read the file
        const data = new Uint8Array(e.target.result);
        const wb   = XLSX.read(data, { type: 'array' });

        // Helper — get value from a sheet by row index
        function getVal(sheet, row) {
            const cell = sheet['B' + row];
            return cell ? cell.v : '';
        }

        // ---- HEADCOUNT ----
        const hcSheet = wb.Sheets['Headcount'];
        if (hcSheet) {
            document.getElementById('hc-permanent').value = getVal(hcSheet, 4);
            document.getElementById('hc-contract').value  = getVal(hcSheet, 5);
            document.getElementById('hc-interns').value   = getVal(hcSheet, 6);
            document.getElementById('hc-newhires').value  = getVal(hcSheet, 9);
            document.getElementById('hc-attrition').value = getVal(hcSheet, 10);
            document.getElementById('hc-retrench').value  = getVal(hcSheet, 11);
            document.getElementById('hc-retire').value    = getVal(hcSheet, 12);
            document.getElementById('hc-growth').value    = getVal(hcSheet, 15);
            document.getElementById('hc-target').value    = getVal(hcSheet, 16);
            calcHeadcount();
        }

        // ---- TALENT ACQUISITION ----
        const taSheet = wb.Sheets['Talent Acquisition'];
        if (taSheet) {
            document.getElementById('ta-ats').value          = getVal(taSheet, 4);
            document.getElementById('ta-ads').value          = getVal(taSheet, 5);
            document.getElementById('ta-branding').value     = getVal(taSheet, 6);
            document.getElementById('ta-agency-hires').value = getVal(taSheet, 9);
            document.getElementById('ta-agency-fee').value   = getVal(taSheet, 10);
            document.getElementById('ta-hires').value        = getVal(taSheet, 11);
            document.getElementById('ta-cost-hire').value    = getVal(taSheet, 12);
            document.getElementById('ta-referral').value     = getVal(taSheet, 15);
            document.getElementById('ta-buyout').value       = getVal(taSheet, 16);
            document.getElementById('ta-growth').value       = getVal(taSheet, 19);
            document.getElementById('ta-contingency').value  = getVal(taSheet, 20);
            calcTA();
        }

        // ---- YOUNG TALENT ----
        const ytSheet = wb.Sheets['Young Talent'];
        if (ytSheet) {
            document.getElementById('yt-grad-num').value       = getVal(ytSheet, 4);
            document.getElementById('yt-grad-allowance').value = getVal(ytSheet, 5);
            document.getElementById('yt-grad-duration').value  = getVal(ytSheet, 6);
            document.getElementById('yt-intern-num').value     = getVal(ytSheet, 9);
            document.getElementById('yt-intern-allowance').value = getVal(ytSheet, 10);
            document.getElementById('yt-intern-duration').value = getVal(ytSheet, 11);
            document.getElementById('yt-scholar-num').value    = getVal(ytSheet, 14);
            document.getElementById('yt-scholar-tuition').value = getVal(ytSheet, 15);
            document.getElementById('yt-scholar-living').value = getVal(ytSheet, 16);
            document.getElementById('yt-mgmt').value           = getVal(ytSheet, 17);
            document.getElementById('yt-growth').value         = getVal(ytSheet, 20);
            document.getElementById('yt-contingency').value    = getVal(ytSheet, 21);
            calcYT();
        }

        // ---- L&D ----
        const ldSheet = wb.Sheets['Learning & Development'];
        if (ldSheet) {
            document.getElementById('ld-lms').value         = getVal(ldSheet, 4);
            document.getElementById('ld-elearning').value   = getVal(ldSheet, 5);
            document.getElementById('ld-headcount').value   = getVal(ldSheet, 8);
            document.getElementById('ld-days').value        = getVal(ldSheet, 9);
            document.getElementById('ld-cost-day').value    = getVal(ldSheet, 10);
            document.getElementById('ld-trainer').value     = getVal(ldSheet, 11);
            document.getElementById('ld-leadership').value  = getVal(ldSheet, 12);
            document.getElementById('ld-conference').value  = getVal(ldSheet, 15);
            document.getElementById('ld-sponsorship').value = getVal(ldSheet, 16);
            document.getElementById('ld-growth').value      = getVal(ldSheet, 19);
            document.getElementById('ld-contingency').value = getVal(ldSheet, 20);
            calcLD();
        }

        // ---- EMPLOYEE ENGAGEMENT ----
        const eeSheet = wb.Sheets['Employee Engagement'];
        if (eeSheet) {
            document.getElementById('ee-survey').value      = getVal(eeSheet, 4);
            document.getElementById('ee-pulse').value       = getVal(eeSheet, 5);
            document.getElementById('ee-recog-per').value   = getVal(eeSheet, 8);
            document.getElementById('ee-headcount').value   = getVal(eeSheet, 9);
            document.getElementById('ee-awards').value      = getVal(eeSheet, 10);
            document.getElementById('ee-spot').value        = getVal(eeSheet, 11);
            document.getElementById('ee-events').value      = getVal(eeSheet, 14);
            document.getElementById('ee-teambuilding').value = getVal(eeSheet, 15);
            document.getElementById('ee-di').value          = getVal(eeSheet, 16);
            document.getElementById('ee-growth').value      = getVal(eeSheet, 19);
            document.getElementById('ee-contingency').value = getVal(eeSheet, 20);
            calcEE();
        }

        // ---- PAYROLL ----
        const paySheet = wb.Sheets['Payroll'];
        if (paySheet) {
            document.getElementById('pay-headcount').value  = getVal(paySheet, 4);
            document.getElementById('pay-salary').value     = getVal(paySheet, 5);
            document.getElementById('pay-hr-num').value     = getVal(paySheet, 6);
            document.getElementById('pay-hr-salary').value  = getVal(paySheet, 7);
            document.getElementById('pay-epf').value        = getVal(paySheet, 10);
            document.getElementById('pay-socso').value      = getVal(paySheet, 11);
            document.getElementById('pay-eis').value        = getVal(paySheet, 12);
            document.getElementById('pay-overtime').value   = getVal(paySheet, 15);
            document.getElementById('pay-allowances').value = getVal(paySheet, 16);
            document.getElementById('pay-growth').value     = getVal(paySheet, 19);
            document.getElementById('pay-contingency').value = getVal(paySheet, 20);
            calcPayroll();
        }

        // ---- REWARDS & BENEFITS ----
        const rbSheet = wb.Sheets['Rewards & Benefits'];
        if (rbSheet) {
            document.getElementById('rb-headcount').value  = getVal(rbSheet, 4);
            document.getElementById('rb-bonus').value      = getVal(rbSheet, 5);
            document.getElementById('rb-medical').value    = getVal(rbSheet, 8);
            document.getElementById('rb-insurance').value  = getVal(rbSheet, 9);
            document.getElementById('rb-dental').value     = getVal(rbSheet, 10);
            document.getElementById('rb-life').value       = getVal(rbSheet, 11);
            document.getElementById('rb-flexible').value   = getVal(rbSheet, 14);
            document.getElementById('rb-esos').value       = getVal(rbSheet, 15);
            document.getElementById('rb-growth').value     = getVal(rbSheet, 18);
            document.getElementById('rb-contingency').value = getVal(rbSheet, 19);
            calcRB();
        }

        // ---- HEALTH & SAFETY ----
        const hsSheet = wb.Sheets['Health Safety Wellbeing'];
        if (hsSheet) {
            document.getElementById('hs-safety-training').value = getVal(hsSheet, 4);
            document.getElementById('hs-safety-equip').value    = getVal(hsSheet, 5);
            document.getElementById('hs-headcount').value       = getVal(hsSheet, 8);
            document.getElementById('hs-wellness-per').value    = getVal(hsSheet, 9);
            document.getElementById('hs-gym').value             = getVal(hsSheet, 10);
            document.getElementById('hs-screening').value       = getVal(hsSheet, 11);
            document.getElementById('hs-eap').value             = getVal(hsSheet, 14);
            document.getElementById('hs-mental').value          = getVal(hsSheet, 15);
            document.getElementById('hs-critical').value        = getVal(hsSheet, 16);
            document.getElementById('hs-growth').value          = getVal(hsSheet, 19);
            document.getElementById('hs-contingency').value     = getVal(hsSheet, 20);
            calcHS();
        }

        // ---- LEGAL & COMPLIANCE ----
        const lcSheet = wb.Sheets['Legal Compliance'];
        if (lcSheet) {
            document.getElementById('lc-retainer').value    = getVal(lcSheet, 4);
            document.getElementById('lc-court').value       = getVal(lcSheet, 5);
            document.getElementById('lc-contracts').value   = getVal(lcSheet, 6);
            document.getElementById('lc-ir').value          = getVal(lcSheet, 7);
            document.getElementById('lc-audit').value       = getVal(lcSheet, 10);
            document.getElementById('lc-pdpa').value        = getVal(lcSheet, 11);
            document.getElementById('lc-policy').value      = getVal(lcSheet, 14);
            document.getElementById('lc-training').value    = getVal(lcSheet, 15);
            document.getElementById('lc-growth').value      = getVal(lcSheet, 18);
            document.getElementById('lc-contingency').value = getVal(lcSheet, 19);
            calcLC();
        }

        // ---- HR TECH ----
        const techSheet = wb.Sheets['HR Systems Technology'];
        if (techSheet) {
            document.getElementById('tech-hris').value        = getVal(techSheet, 4);
            document.getElementById('tech-payroll').value     = getVal(techSheet, 5);
            document.getElementById('tech-pms').value         = getVal(techSheet, 8);
            document.getElementById('tech-analytics').value   = getVal(techSheet, 9);
            document.getElementById('tech-maintenance').value = getVal(techSheet, 12);
            document.getElementById('tech-integration').value = getVal(techSheet, 13);
            document.getElementById('tech-consultancy').value = getVal(techSheet, 14);
            document.getElementById('tech-growth').value      = getVal(techSheet, 17);
            document.getElementById('tech-contingency').value = getVal(techSheet, 18);
            calcTech();
        }

        alert('Budget data uploaded and recalculated successfully.');
    };

    reader.readAsArrayBuffer(file);
}

// Wire up upload button
document.getElementById('btn-upload').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        uploadExcel(file);
        this.value = '';    // clear input so same file can be uploaded again
    }
});