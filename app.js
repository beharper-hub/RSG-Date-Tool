const $ = id => document.getElementById(id);
const num = id => parseFloat($(id).value);
function dval(id){ const v=$(id).value; return v ? new Date(v+"T00:00:00") : null; }
function fmt(d){ return d ? d.toLocaleDateString(undefined,{weekday:'short',year:'numeric',month:'short',day:'numeric'}) : ""; }



function escapeHtml(value){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function resultStatusClass(text){
  const lower = String(text).toLowerCase();
  if(lower.includes('short') || lower.includes('warning') || lower.includes('hold') || lower.includes('conflict') || lower.includes('exceeds') || lower.includes('missing') || lower.includes('invalid') || lower.includes('cannot')){
    return ' result-status-danger';
  }
  if(lower.includes('verify') || lower.includes('weekend') || lower.includes('monday') || lower.includes('friday') || lower.includes('holiday') || lower.includes('concern')){
    return ' result-status-warn';
  }
  if(lower.includes('eligible') || lower.includes('enough') || lower.includes('safe') || lower.includes('ok')){
    return ' result-status-good';
  }
  return '';
}

function out(id, text){
  const el = $(id);
  if(!el) return;

  const value = String(text || '');

  // Keep simple/default messages plain.
  if(!value || value === 'Ready.' || value.split('\n').length === 1 && !value.includes(':')){
    el.className = 'result';
    el.textContent = value;
    return;
  }

  const lines = value.split('\n');
  const first = lines.shift();
  let label = 'Result';
  let primary = first;

  if(first.includes(':')){
    const parts = first.split(':');
    label = parts.shift().trim();
    primary = parts.join(':').trim();
  }

  const details = lines.join('\n').trim();

  el.className = 'result result-smart' + resultStatusClass(value);
  el.innerHTML =
    '<div class="result-primary">' +
      '<div class="result-label">' + escapeHtml(label) + '</div>' +
      '<div class="result-value">' + escapeHtml(primary) + '</div>' +
    '</div>' +
    (details ? '<div class="result-details">' + escapeHtml(details) + '</div>' : '');
}

const calcHistory = {};









function validatePositive(values){
  return values.every(v => typeof v === 'number' && !isNaN(v) && v > 0);
}


function toggleInsulinMode(){
  const mode = $('ins_mode').value;
  $('ins_ml_mode').style.display = mode === 'ml' ? 'block' : 'none';
  $('ins_pen_mode').style.display = mode === 'pen' ? 'block' : 'none';
}

function insulinMlPreset(ml,unitsml,unitsday,waste){
  $('ins_mode').value = 'ml';
  toggleInsulinMode();
  $('ins_ml').value = ml;
  $('ins_unitsml').value = unitsml;
  $('ins_unitsday').value = unitsday;
  $('ins_waste').value = waste;
}

function insulinPenPreset(count,ml,unitsml,unitsday,waste){
  $('ins_mode').value = 'pen';
  toggleInsulinMode();
  $('pen_count').value = count;
  $('pen_ml').value = ml;
  $('pen_unitsml').value = unitsml;
  $('ins_unitsday').value = unitsday;
  $('ins_waste').value = waste;
}

function eyePreset(ml,dpm,dose,freq,eyes){
  $('eye_ml').value = ml;
  $('eye_dpm').value = dpm;
  $('eye_dose').value = dose;
  $('eye_freq').value = freq;
  $('eye_eyes').value = eyes;
}



function enzymePreset(qty,mealCaps,meals,snackCaps,snacks){
  $('enz_qty').value = qty;
  $('enz_meal_caps').value = mealCaps;
  $('enz_meals').value = meals;
  $('enz_snack_caps').value = snackCaps;
  $('enz_snacks').value = snacks;
  $('enz_round').value = 'up';
}








function warfarinPreset(mon,tue,wed,thu,fri,sat,sun,strength,qty){
  $('war_mon').value = mon;
  $('war_tue').value = tue;
  $('war_wed').value = wed;
  $('war_thu').value = thu;
  $('war_fri').value = fri;
  $('war_sat').value = sat;
  $('war_sun').value = sun;
  $('war_strength').value = strength;
  $('war_qty').value = qty;
}









function generalPreset(qty,perday){
  $('gen_mode').value = 'units';
  toggleGeneralMode();
  $('gen_qty').value = qty;
  $('gen_perday').value = perday;
  $('gen_round').value = 'down';
}

function liquidPreset(ml,dose,freq){
  $('gen_mode').value = 'liquid';
  toggleGeneralMode();
  $('liq_ml').value = ml;
  $('liq_dose').value = dose;
  $('liq_freq').value = freq;
  $('gen_round').value = 'down';
}

function titrationPreset(start,change,target,interval,unit,direction,qty){
  $('gen_mode').value = 'titration';
  toggleGeneralMode();
  $('tit_start').value = start;
  $('tit_change').value = change;
  $('tit_target').value = target;
  $('tit_interval').value = interval;
  $('tit_unit').value = unit;
  $('tit_direction').value = direction;
  $('tit_qty').value = qty || '';
  $('gen_round').value = 'down';
}

function multiStepPreset(){
  $('gen_mode').value = 'multi';
  toggleGeneralMode();
  $('multi_qty').value = 84;
  $('multi_round').value = 'down';
  const preset = [
    [1,7],
    [2,7],
    [3,7],
    [4,14],
    ['', '']
  ];
  preset.forEach((step, idx) => {
    $('multi_dose_' + (idx + 1)).value = step[0];
    $('multi_days_' + (idx + 1)).value = step[1];
  });
}

function patternPreset(qty,baseDaily,extraDose,extraDays){
  $('pat_qty').value = qty;
  $('pat_base_daily').value = baseDaily;
  $('pat_extra_dose').value = extraDose;
  $('pat_extra_days').value = extraDays;
  $('pat_round').value = 'down';
}


function roundDisplay(value){
  if(!isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/,'').replace(/0$/,'');
}

function dailyDoseCalc(){
  const qty = num('dose_qty');
  const days = num('dose_days');
  if(!validatePositive([qty, days])) return out('gen_result','Missing quantity dispensed or days supply.');

  const daily = qty / days;
  const text = 'Average daily dose: ' + roundDisplay(daily) + ' unit(s)/day\n' +
    'Quantity dispensed: ' + qty + '\n' +
    'Days supply: ' + days + '\n' +
    'Math: ' + qty + ' ÷ ' + days + ' = ' + roundDisplay(daily) + ' unit(s)/day\n' +
    'Note: Arithmetic support only. Verify prescription directions, adjudication, and pharmacist guidance.';
  out('gen_result', text);
  addHistory('gen', text);
}

function dailyDosePreset(qty, days){
  $('gen_mode').value = 'daily';
  toggleGeneralMode();
  $('dose_qty').value = qty;
  $('dose_days').value = days;
  generalLiquidDS();
}

function daysBetweenDates(start, end){
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((b - a) / 86400000);
}

function medRemainingCalc(){
  const qty = num('rem_qty');
  const daily = num('rem_daily');
  const last = dval('rem_last');
  const asOf = dval('rem_asof') || new Date();

  if(!validatePositive([qty, daily]) || !last){
    return out('gen_result','Missing quantity dispensed, daily dose, or last fill date.');
  }

  const daysSince = daysBetweenDates(last, asOf);
  if(daysSince < 0){
    return out('gen_result','Invalid date range: As Of Date is before the last fill date.');
  }

  const expectedUsed = daysSince * daily;
  const expectedRemaining = qty - expectedUsed;
  const daysRemainingRaw = expectedRemaining / daily;
  const runOut = addDays(last, qty / daily);

  let statusLine;
  if(expectedRemaining > 0){
    statusLine = 'Expected quantity remaining: ' + roundDisplay(expectedRemaining) + ' unit(s)';
  } else if(expectedRemaining === 0){
    statusLine = 'Expected quantity remaining: 0 unit(s)';
  } else {
    statusLine = 'Expected quantity remaining: 0 unit(s) — supply should be exhausted';
  }

  const text = statusLine + '\n' +
    'Days since fill: ' + daysSince + '\n' +
    'Expected used: ' + roundDisplay(expectedUsed) + ' unit(s)\n' +
    'Expected days remaining: ' + roundDisplay(Math.max(daysRemainingRaw, 0)) + '\n' +
    'Estimated run-out date: ' + fmt(runOut) + '\n' +
    'Last fill date: ' + fmt(last) + '\n' +
    'As of date: ' + fmt(asOf) + '\n' +
    'Math: ' + qty + ' dispensed − (' + daysSince + ' day(s) × ' + daily + '/day) = ' + roundDisplay(expectedRemaining) + ' unit(s)\n' +
    'Note: Estimate only. Actual remaining supply depends on adherence, dose changes, lost medication, early/late starts, and pharmacist guidance.';

  out('gen_result', text);
  addHistory('gen', text);
}

function medRemainingPreset(qty, daily, daysAgo){
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  $('gen_mode').value = 'remaining';
  toggleGeneralMode();
  $('rem_qty').value = qty;
  $('rem_daily').value = daily;
  $('rem_last').value = d.toISOString().slice(0,10);
  $('rem_asof').value = '';
  generalLiquidDS();
}

function patternedDosingCalc(){
  const qty=num('pat_qty'),
        baseDaily=num('pat_base_daily'),
        extraDose=num('pat_extra_dose') || 0,
        extraDays=num('pat_extra_days') || 0,
        roundMode=$('pat_round').value;

  if(!validatePositive([qty,baseDaily])){
    return out('pat_result','Enter valid positive quantity and base daily dose.');
  }

  if(extraDose < 0 || extraDays < 0 || extraDays > 7){
    return out('pat_result','Additional dose must be zero or greater, and additional days must be between 0 and 7.');
  }

  const baseWeekly = baseDaily * 7;
  const extraWeekly = extraDose * extraDays;
  const totalWeekly = baseWeekly + extraWeekly;

  if(totalWeekly <= 0){
    return out('pat_result','Total weekly use must be greater than zero.');
  }

  const raw = (qty / totalWeekly) * 7;

  if(raw > 365){
    return out('pat_result','Calculated day supply exceeds realistic limits. Verify entry values.');
  }

  let daySupply = '';
  if(roundMode === 'up'){
    daySupply = Math.ceil(raw) + ' days rounded up';
  } else if(roundMode === 'raw'){
    daySupply = raw.toFixed(2) + ' days raw';
  } else {
    daySupply = Math.floor(raw) + ' days rounded down';
  }

  const text = 'Day supply: ' + daySupply + '\n' +
    'Type: Patterned dosing\n' +
    'Quantity dispensed: ' + qty + '\n' +
    'Base use: ' + baseDaily + ' unit(s)/day × 7 = ' + baseWeekly.toFixed(2) + ' unit(s)/week\n' +
    'Additional use: ' + extraDose + ' unit(s) × ' + extraDays + ' day(s)/week = ' + extraWeekly.toFixed(2) + ' unit(s)/week\n' +
    'Total weekly use: ' + totalWeekly.toFixed(2) + ' unit(s)/week\n' +
    'Raw day supply: ' + raw.toFixed(2) + ' days';

  out('pat_result', text);
  addHistory('pat', text);
}

function toggleActuationMode(){
  const mode = $('act_mode').value;
  $('act_inhaler_mode').style.display = mode === 'inhaler' ? 'block' : 'none';
  $('act_nasal_mode').style.display = mode === 'nasal' ? 'block' : 'none';
}

function actuationPreset(total,perday){
  $('act_mode').value = 'inhaler';
  toggleActuationMode();
  $('act_total').value = total;
  $('act_perday').value = perday;
}

function nasalPreset(total,per,freq,nostrils){
  $('act_mode').value = 'nasal';
  toggleActuationMode();
  $('nasal_total').value = total;
  $('nasal_pernostril').value = per;
  $('nasal_freq').value = freq;
  $('nasal_nostrils').value = nostrils;
}

function copyResult(id){ navigator.clipboard.writeText(($(id).innerText || $(id).textContent).trim()); }






function toggleDarkMode(){
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('pharmCalcDarkMode', isDark ? 'dark' : 'light');
  const toggle = $('dark_mode_toggle');
  if(toggle) toggle.checked = isDark;
}

function initTheme(){
  const saved = localStorage.getItem('pharmCalcDarkMode');
  if(saved === 'dark'){
    document.body.classList.add('dark');
    const toggle = $('dark_mode_toggle');
    if(toggle) toggle.checked = true;
  }
}

initTheme();


const defaultToolLayout = [
  'tool_calculator',
  'tool_fill',
  'tool_fridge',
  'tool_injection',
  'tool_standard_day_supply',
  'tool_patterned',
  'tool_insulin',
  'tool_eye',
  'tool_spray',
  'tool_topical',
  'tool_enzyme',
  'tool_warfarin'
];

function getToolGrid(){
  const firstCard = document.querySelector('[data-tool-card="true"]');
  return firstCard ? firstCard.parentElement : null;
}

function getCurrentToolLayout(){
  const grid = getToolGrid();
  if(!grid) return defaultToolLayout.slice();

  return Array.from(grid.querySelectorAll('[data-tool-card="true"]'))
    .map(card => card.id)
    .filter(Boolean);
}

function saveToolLayout(){
  localStorage.setItem('pharmCalcToolLayout', JSON.stringify(getCurrentToolLayout()));
}

function applyToolLayout(){
  const grid = getToolGrid();
  if(!grid) return;

  let saved = [];
  try{
    saved = JSON.parse(localStorage.getItem('pharmCalcToolLayout') || '[]');
  } catch(e){
    saved = [];
  }

  const order = saved.length ? saved : defaultToolLayout;

  order.forEach(id => {
    const card = document.getElementById(id);
    if(card && card.parentElement === grid){
      grid.appendChild(card);
    }
  });

  syncLayoutList();
}

function syncLayoutList(){
  const list = $('layout_list');
  if(!list) return;

  const order = getCurrentToolLayout();

  order.forEach(id => {
    const row = list.querySelector('[data-layout-id="' + id + '"]');
    if(row) list.appendChild(row);
  });
}

function openLayoutModal(){
  syncLayoutList();
  const modal = $('layout_modal');
  if(modal) modal.classList.add('is-open');
}

function closeLayoutModal(){
  const modal = $('layout_modal');
  if(modal) modal.classList.remove('is-open');
}

function layoutMove(id, direction){
  const grid = getToolGrid();
  const card = document.getElementById(id);
  const list = $('layout_list');
  const row = list ? list.querySelector('[data-layout-id="' + id + '"]') : null;

  if(!grid || !card || !row) return;

  if(direction === 'up'){
    const prevCard = card.previousElementSibling && card.previousElementSibling.matches('[data-tool-card="true"]') ? card.previousElementSibling : null;
    const prevRow = row.previousElementSibling;
    if(prevCard) grid.insertBefore(card, prevCard);
    if(prevRow) list.insertBefore(row, prevRow);
  }

  if(direction === 'down'){
    const nextCard = card.nextElementSibling && card.nextElementSibling.matches('[data-tool-card="true"]') ? card.nextElementSibling : null;
    const nextRow = row.nextElementSibling;
    if(nextCard) grid.insertBefore(nextCard, card);
    if(nextRow) list.insertBefore(nextRow, row);
  }

  if(direction === 'top'){
    const firstCard = grid.querySelector('[data-tool-card="true"]');
    const firstRow = list.firstElementChild;
    if(firstCard) grid.insertBefore(card, firstCard);
    if(firstRow) list.insertBefore(row, firstRow);
  }

  saveToolLayout();
}

function resetToolLayout(){
  localStorage.removeItem('pharmCalcToolLayout');

  const grid = getToolGrid();
  if(grid){
    defaultToolLayout.forEach(id => {
      const card = document.getElementById(id);
      if(card && card.parentElement === grid){
        grid.appendChild(card);
      }
    });
  }

  syncLayoutList();
}

document.addEventListener('keydown', event => {
  if(event.key === 'Escape'){
    closeLayoutModal();
  }
});

applyToolLayout();



function calcUpdateDisplay(){
  const expr = $('calc_expr').value;
  const display = expr
    .replace(/\*/g,'×')
    .replace(/\//g,'÷')
    .replace(/-/g,'−');

  $('calc_display').textContent = display || '0';
}

let calcJustSolved = false;









function findLastCalcOperator(expr){
  let depth = 0;

  for(let i = expr.length - 1; i >= 0; i--){
    const ch = expr[i];

    if(ch === ')'){
      depth++;
      continue;
    }

    if(ch === '('){
      depth--;
      continue;
    }

    if(depth !== 0) continue;

    if(['+','-','*','/'].includes(ch)){
      // Treat ** as one power operator, not a percent base operator.
      if(ch === '*' && (expr[i - 1] === '*' || expr[i + 1] === '*')) continue;

      // Skip unary negative signs.
      const prev = expr[i - 1];
      if(ch === '-' && (i === 0 || ['+','-','*','/','('].includes(prev))) continue;

      return { index:i, op:ch };
    }
  }

  return null;
}

function calcEvaluateSafe(expr){
  if(!/^[0-9+\-*/().\sA-Za-z,_]+$/.test(expr)){
    throw new Error('Invalid expression');
  }

  const value = Function('"use strict"; return (' + expr + ')')();

  if(typeof value !== 'number' || !isFinite(value)){
    throw new Error('Invalid result');
  }

  return value;
}
















let calcMode = 'standard';













function calcKeyboardInput(event){

  // keep focus off hidden mobile input
  if(document.activeElement === $('calc_expr')){
    $('calc_expr').blur();
  }
  const key = event.key;

  if(event.target && ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName) && event.target.id !== 'calc_expr'){
    return;
  }

  if(/^[0-9]$/.test(key)){
    event.preventDefault();
    calcPress(key);
    return;
  }

  if(['+','-','*','/','(',')','.'].includes(key)){
    event.preventDefault();
    calcPress(key);
    return;
  }

  if(key === '%'){
    event.preventDefault();
    calcPercent();
    return;
  }

  if(key === 'Enter' || key === '='){
    event.preventDefault();
    generalCalc();
    return;
  }

  if(key === 'Backspace'){
    event.preventDefault();
    calcBackspace();
    return;
  }

  if(key === 'Escape'){
    event.preventDefault();
    clearGeneralCalc();
    return;
  }
}

document.addEventListener('keydown', calcKeyboardInput);
setCalcMode('standard');






function buildTitrationSchedule(start, change, target, interval, unit, direction){
  const multiplier = unit === 'weeks' ? 7 : 1;
  const daysPerStep = interval * multiplier;
  const steps = [];
  let dose = start;
  let guard = 0;

  if(direction === 'up'){
    if(target < start) return null;
    while(dose < target && guard < 100){
      steps.push({dose:dose, days:daysPerStep});
      dose = Math.min(dose + change, target);
      guard++;
    }
    steps.push({dose:target, days:daysPerStep});
  } else {
    if(target > start) return null;
    while(dose > target && guard < 100){
      steps.push({dose:dose, days:daysPerStep});
      dose = Math.max(dose - change, target);
      guard++;
    }
    steps.push({dose:target, days:daysPerStep});
  }

  return steps;
}

function formatTitrationSchedule(steps, qty){
  let totalUsed = 0;
  const lines = steps.map((step, idx) => {
    const use = step.dose * step.days;
    totalUsed += use;
    return 'Step ' + (idx + 1) + ': ' + step.dose + ' unit(s)/day × ' + step.days + ' day(s) = ' + use.toFixed(2) + ' unit(s)';
  });

  let text = 'Titration schedule estimate:\n' + lines.join('\n') + '\n\n';
  text += 'Total scheduled quantity needed: ' + totalUsed.toFixed(2) + ' unit(s)';

  if(qty && qty > 0){
    const remaining = qty - totalUsed;
    text += '\nQuantity dispensed: ' + qty;
    text += '\nCoverage status: ' + (remaining >= 0 ? 'Enough for schedule' : 'Short for schedule');
    text += '\nDifference: ' + remaining.toFixed(2) + ' unit(s)';
  }

  text += '\n\nNote: Arithmetic support only. Verify prescriber directions and clinical appropriateness.';
  return text;
}

function collectMultiStepTitration(){
  const steps = [];

  for(let i = 1; i <= 5; i++){
    const dose = num('multi_dose_' + i);
    const days = num('multi_days_' + i);
    const doseBlank = $('multi_dose_' + i).value === '';
    const daysBlank = $('multi_days_' + i).value === '';

    if(doseBlank && daysBlank) continue;

    if(!validatePositive([dose, days])){
      return {error:'Each filled multi-step row needs a positive Units/Day and Days value.'};
    }

    steps.push({dose:dose, days:days});
  }

  if(steps.length < 2){
    return {error:'Enter at least two titration steps.'};
  }

  return {steps:steps};
}

function formatMultiStepTitration(steps, qty, roundMode){
  let totalUsed = 0;
  let scheduledDays = 0;

  const lines = steps.map((step, idx) => {
    const use = step.dose * step.days;
    totalUsed += use;
    scheduledDays += step.days;
    return 'Step ' + (idx + 1) + ': ' + step.dose + ' unit(s)/day × ' + step.days + ' day(s) = ' + use.toFixed(2) + ' unit(s)';
  });

  let text = 'Multi-step titration: ' + scheduledDays + ' scheduled day(s)';
  text += '\n' + lines.join('\n');
  text += '\nTotal scheduled quantity needed: ' + totalUsed.toFixed(2) + ' unit(s)';

  if(qty && qty > 0){
    const remaining = qty - totalUsed;
    const lastDose = steps[steps.length - 1].dose;
    text += '\nQuantity dispensed: ' + qty;

    if(remaining >= 0){
      const extraRaw = remaining / lastDose;
      const totalCoverageRaw = scheduledDays + extraRaw;
      text += '\nCoverage status: Enough for entered schedule';
      text += '\nRemaining after schedule: ' + remaining.toFixed(2) + ' unit(s)';
      text += '\nEstimated total coverage: ' + formatDaySupply(totalCoverageRaw, roundMode);
      text += '\nAssumption: remaining quantity continues at final step dose of ' + lastDose + ' unit(s)/day.';
    } else {
      text += '\nCoverage status: Short for entered schedule';
      text += '\nShort by: ' + Math.abs(remaining).toFixed(2) + ' unit(s)';
    }
  }

  text += '\n\nNote: Arithmetic support only. Verify prescriber directions, package sizes, refill timing, and pharmacist guidance.';
  return text;
}

function generalLiquidDS(){
  const mode = $('gen_mode').value;
  const roundMode = $('gen_round').value;
  let raw = 0;
  let text = '';

  if(mode === 'units'){
    const qty=num('gen_qty'), perday=num('gen_perday');
    if(!validatePositive([qty,perday])){
      return out('gen_result','Enter valid positive quantity and daily usage.');
    }

    raw = qty / perday;
    text = 'Day supply: ';
    text += formatDaySupply(raw, roundMode) + '\n';
    text += 'Quantity dispensed: ' + qty + '\nTablets/capsules per day: ' + perday;
  } else if(mode === 'liquid') {
    const ml=num('liq_ml'), dose=num('liq_dose'), freq=num('liq_freq');
    if(!validatePositive([ml,dose,freq])){
      return out('gen_result','Enter valid positive liquid values.');
    }

    const daily=dose*freq;
    raw = ml/daily;
    text = 'Day supply: ';
    text += formatDaySupply(raw, roundMode) + '\n';
    text += 'mL Dispensed: ' + ml + '\nmL Per Dose: ' + dose + '\nDoses/day: ' + freq + '\nmL Dispensed/day: ' + daily.toFixed(2);
  } else if(mode === 'multi') {
    const collected = collectMultiStepTitration();
    if(collected.error){
      return out('gen_result', collected.error);
    }

    const qty = num('multi_qty');
    const multiRound = $('multi_round').value;
    text = formatMultiStepTitration(collected.steps, qty, multiRound);
    out('gen_result', text);
    addHistory('gen', text);
    return;
  } else if(mode === 'daily') {
    dailyDoseCalc();
    return;
  } else if(mode === 'remaining') {
    medRemainingCalc();
    return;
  } else {
    const start=num('tit_start'),
          change=num('tit_change'),
          target=num('tit_target'),
          interval=num('tit_interval'),
          unit=$('tit_unit').value,
          direction=$('tit_direction').value,
          qty=num('tit_qty');

    if(!validatePositive([start,change,target,interval])){
      return out('gen_result','Enter valid positive titration values.');
    }

    const steps = buildTitrationSchedule(start, change, target, interval, unit, direction);
    if(!steps){
      return out('gen_result','Titration direction does not match start and target dose.');
    }

    text = formatTitrationSchedule(steps, qty);
    out('gen_result', text);
    addHistory('gen', text);
    return;
  }

  if(raw > 365){
    return out('gen_result','Calculated day supply exceeds realistic limits. Verify entry values.');
  }

  out('gen_result', text);
  addHistory('gen', text);
}

function formatDaySupply(raw, roundMode){
  if(roundMode === 'up') return Math.ceil(raw) + ' days rounded up';
  if(roundMode === 'raw') return raw.toFixed(2) + ' days raw';
  return Math.floor(raw) + ' days rounded down';
}

function actuationSprayDS(){
  const mode = $('act_mode').value;
  let text = '';

  if(mode === 'inhaler'){
    const total=num('act_total'), perday=num('act_perday');
    if(!validatePositive([total,perday])){
      return out('act_result','Enter valid positive actuations and puffs/day.');
    }

    const ds=Math.floor(total/perday);
    text='Day supply: ' + ds + ' days\nType: Inhaler\nTotal Puffs: ' + total + '\nPuffs/day: ' + perday;
  } else {
    const total=num('nasal_total'),
          per=num('nasal_pernostril'),
          freq=num('nasal_freq'),
          nostrils=parseInt($('nasal_nostrils').value);

    if(!validatePositive([total,per,freq])){
      return out('act_result','Enter valid positive nasal spray values.');
    }

    const daily = per * freq * nostrils;
    const ds = Math.floor(total / daily);

    text='Day supply: ' + ds + ' days\n' +
      'Type: Nasal spray\n' +
      'Total sprays: ' + total + '\n' +
      'Sprays/day: ' + daily + '\n' +
      'Usage: ' + per + ' spray(s) per nostril, ' + freq + ' time(s) daily';
  }

  out('act_result', text);
  addHistory('act', text);
}


function insulinCombinedDS(){
  const mode = $('ins_mode').value;
  const unitsday = num('ins_unitsday');
  const waste = num('ins_waste') || 0;

  if(!validatePositive([unitsday])){
    return out('ins_result','Enter valid positive units/day.');
  }

  let totalMl = 0;
  let unitsml = 0;
  let source = '';

  if(mode === 'ml'){
    totalMl = num('ins_ml');
    unitsml = num('ins_unitsml');

    if(!validatePositive([totalMl, unitsml])){
      return out('ins_result','Enter valid positive total mL and units/mL.');
    }

    source = 'mL Dispensed: ' + totalMl;
  } else {
    const count = num('pen_count');
    const mlPerPen = num('pen_ml');
    unitsml = num('pen_unitsml');

    if(!validatePositive([count, mlPerPen, unitsml])){
      return out('ins_result','Enter valid positive pen count, mL Per Pen, and units/mL.');
    }

    totalMl = count * mlPerPen;
    source = 'Pens dispensed: ' + count + '\n' + 'mL Per Pen: ' + mlPerPen;
  }

  const totalUnits = totalMl * unitsml;
  const daily = unitsday + waste;

  if(daily <= 0){
    return out('ins_result','Daily units must be greater than zero.');
  }

  const ds = Math.floor(totalUnits / daily);

  if(ds > 365){
    return out('ins_result','Calculated day supply exceeds realistic limits. Verify entry values.');
  }

  const text = 'Day supply: ' + ds + ' days\n' +
    'Type: Insulin / Pen\n' +
    source + '\n' +
    'mL Dispensed: ' + totalMl + '\n' +
    'Units/mL: ' + unitsml + '\n' +
    'Total units: ' + totalUnits + '\n' +
    'Daily units used: ' + daily + (waste ? ' (' + unitsday + ' dose + ' + waste + ' prime/waste)' : '');

  out('ins_result', text);
  addHistory('ins', text);
}

function eyeDS(){
  const ml=num('eye_ml'), dpm=num('eye_dpm'), dose=num('eye_dose'), freq=num('eye_freq'), eyes=parseInt($('eye_eyes').value);

  if(!validatePositive([ml,dpm,dose,freq])){
    return out('eye_result','Enter valid eye/ear drop values.');
  }

  const total=ml*dpm, daily=dose*freq*eyes;
  const ds=Math.floor(total/daily);

  const text=`Day supply: ${ds} days
Type: Eye/Ear drop
Total drops: ${total}
Drops/day: ${daily}
Assumption: ${dpm} drops/mL`;
  out('eye_result', text);
  addHistory('eye', text);
}

function enzymeDS(){
  const qty=num('enz_qty'),
        mealCaps=num('enz_meal_caps')||0,
        meals=num('enz_meals')||0,
        snackCaps=num('enz_snack_caps')||0,
        snacks=num('enz_snacks')||0,
        roundMode=$('enz_round').value;

  if(!validatePositive([qty])){
    return out('enz_result','Enter a valid positive capsule quantity.');
  }

  if((mealCaps <= 0 || meals <= 0) && (snackCaps <= 0 || snacks <= 0)){
    return out('enz_result','Enter meal and/or snack capsule usage.');
  }

  const mealDaily = mealCaps * meals;
  const snackDaily = snackCaps * snacks;
  const daily = mealDaily + snackDaily;

  if(daily <= 0){
    return out('enz_result','Daily capsule usage must be greater than zero.');
  }

  const raw = qty / daily;
  let dsLabel = `${raw.toFixed(2)} days raw`;
  let finalDS = raw.toFixed(2);

  if(roundMode === 'up'){
    finalDS = Math.ceil(raw);
    dsLabel = `${finalDS} days rounded up`;
  } else if(roundMode === 'down'){
    finalDS = Math.floor(raw);
    dsLabel = `${finalDS} days rounded down`;
  }

  if(raw > 365){
    return out('enz_result','Calculated day supply exceeds realistic limits. Verify quantity and usage.');
  }

  const text=`Day supply: ${dsLabel}
Type: Enzyme
Total capsules: ${qty}
Capsules/day: ${daily}
Meal use: ${mealCaps} capsule(s) × ${meals} meal(s) = ${mealDaily}/day
Snack use: ${snackCaps} capsule(s) × ${snacks} snack(s) = ${snackDaily}/day`;

  out('enz_result', text);
  addHistory('enz', text);
}











function warfarinCalc(){
  const days = [
    ['Monday', num('war_mon') || 0],
    ['Tuesday', num('war_tue') || 0],
    ['Wednesday', num('war_wed') || 0],
    ['Thursday', num('war_thu') || 0],
    ['Friday', num('war_fri') || 0],
    ['Saturday', num('war_sat') || 0],
    ['Sunday', num('war_sun') || 0]
  ];

  if(days.some(d => d[1] < 0)){
    return out('war_result','Warfarin daily mg values cannot be negative.');
  }

  const weekly = days.reduce((sum,d) => sum + d[1], 0);

  if(weekly <= 0){
    return out('war_result','Enter at least one daily warfarin dose.');
  }

  const avg = weekly / 7;
  const strength = num('war_strength');
  const qty = num('war_qty');

  let text = 'Warfarin weekly dose: ' + weekly.toFixed(2) + ' mg/week\n';
  text += 'Average daily dose: ' + avg.toFixed(2) + ' mg/day\n\n';
  text += 'Daily schedule:\n';
  text += days.map(d => '- ' + d[0] + ': ' + d[1] + ' mg').join('\n');

  if(strength && strength > 0){
    const tabsWeek = weekly / strength;
    text += '\n\nTablet strength: ' + strength + ' mg';
    text += '\nTablets per week: ' + tabsWeek.toFixed(2);

    if(qty && qty > 0){
      const daySupply = Math.floor((qty / tabsWeek) * 7);
      text += '\nQuantity dispensed: ' + qty;
      text += '\nEstimated day supply: ' + daySupply + ' days';
    }
  } else if(qty && qty > 0){
    text += '\n\nQuantity dispensed entered, but tablet strength is needed to estimate day supply.';
  }

  out('war_result', text);
  addHistory('war', text);
}

function topicalDS(){
  const g=num('top_g'), gpd=num('top_gpd'); if(!g||!gpd) return out('top_result','Missing grams or grams/day.');
  out('top_result', `Estimated topical day supply: ${Math.floor(g/gpd)} days\nTotal grams: ${g}\nGrams/Day: ${gpd}`);
}

function sameDate(a,b){
  return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function nthWeekday(year, month, weekday, nth){
  const d = new Date(year, month, 1);
  const offset = (weekday - d.getDay() + 7) % 7;
  d.setDate(1 + offset + (nth - 1) * 7);
  return d;
}
function lastWeekday(year, month, weekday){
  const d = new Date(year, month + 1, 0);
  const offset = (d.getDay() - weekday + 7) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}
function observedDate(actual){
  const d = new Date(actual);
  const day = d.getDay();
  if(day === 6){ d.setDate(d.getDate() - 1); }
  if(day === 0){ d.setDate(d.getDate() + 1); }
  return d;
}
function upsHolidayDates(year){
  const actual = [
    {name:"New Year’s Day", date:new Date(year,0,1)},
    {name:"Martin Luther King Jr. Day", date:nthWeekday(year,0,1,3)},
    {name:"Memorial Day", date:lastWeekday(year,4,1)},
    {name:"Independence Day", date:new Date(year,6,4)},
    {name:"Labor Day", date:nthWeekday(year,8,1,1)},
    {name:"Thanksgiving", date:nthWeekday(year,10,4,4)},
    {name:"Christmas Day", date:new Date(year,11,25)}
  ];

  return actual.map(h => {
    const obs = observedDate(h.date);
    return {...h, observed:obs};
  });
}
function findUpsHoliday(d){
  const years = [d.getFullYear() - 1, d.getFullYear(), d.getFullYear() + 1];
  for(const y of years){
    for(const h of upsHolidayDates(y)){
      if(sameDate(d,h.date)) return `${h.name}`;
      if(!sameDate(h.date,h.observed) && sameDate(d,h.observed)) return `${h.name} observed`;
    }
  }
  return "";
}
function previousDay(d){
  const x = new Date(d);
  x.setDate(x.getDate() - 1);
  return x;
}
function nextDay(d){
  const x = new Date(d);
  x.setDate(x.getDate() + 1);
  return x;
}












function resetCalc(section){
  const card = section.closest('.card');
  if(!card) return;

  const isFridgeCard = !!card.querySelector('#fr_date');

  card.querySelectorAll('input').forEach(el => {
    if(el.type === 'checkbox'){
      if(isFridgeCard && (el.id === 'fr_ups_holidays' || el.id === 'fr_weekend')){
        el.checked = true;
      } else {
        el.checked = false;
      }
    } else if(el.type === 'date'){
      el.value = '';
    } else {
      const defaultVal = el.getAttribute('value');
      el.value = defaultVal !== null ? defaultVal : '';
    }
  });

  card.querySelectorAll('select').forEach(el => {
    el.selectedIndex = 0;
    if(el.id === 'fill_threshold'){
      el.value = '0.85';
    }
    if(el.id === 'gen_round'){
      el.value = 'down';
    }
    if(el.id === 'enz_round'){
      el.value = 'up';
    }
  });

  card.querySelectorAll('.result').forEach(el => {
    el.textContent = 'Ready.';
  });

  if(card.querySelector('#calc_display')){
    clearGeneralCalc();
  }

  if(card.querySelector('#inj_history')) $('inj_history').innerHTML = '';
  if(card.querySelector('#gen_history')) $('gen_history').innerHTML = '';
  if(card.querySelector('#pkg_history')) $('pkg_history').innerHTML = '';
  if(card.querySelector('#ins_history')) $('ins_history').innerHTML = '';
  if(card.querySelector('#eye_history')) $('eye_history').innerHTML = '';
  if(card.querySelector('#act_history')) $('act_history').innerHTML = '';
  if(card.querySelector('#enz_history')) $('enz_history').innerHTML = '';
  if(card.querySelector('#war_history')) $('war_history').innerHTML = '';

  if($('gen_mode')) toggleGeneralMode();
  if($('act_mode')) toggleActuationMode();
  if($('ins_mode')) toggleInsulinMode();
}



const APP_VERSION = '2.6.11-2026.05.30.02';

function hideSplash(){
      const splash = document.getElementById('app_splash');
      if(!splash) return;
      requestAnimationFrame(() => splash.classList.add('is-hidden'));
    }

function openChangelog(){
  const modal = document.getElementById('changelog_modal');
  if(modal) modal.classList.add('is-open');
  localStorage.setItem('pharmCalcLastSeenVersion', APP_VERSION);
}

function closeChangelog(){
  const modal = document.getElementById('changelog_modal');
  if(modal) modal.classList.remove('is-open');
}

function initChangelog(){
  const seen = localStorage.getItem('pharmCalcLastSeenVersion');
  if(seen !== APP_VERSION){
    window.setTimeout(openChangelog, 900);
  }
}

window.addEventListener('load', () => {
  hideSplash();
  initChangelog();
});

document.addEventListener('keydown', event => {
  if(event.key === 'Escape') closeChangelog();
});

document.addEventListener('click', event => {
  const modal = document.getElementById('changelog_modal');
  if(modal && event.target === modal) closeChangelog();
});



document.addEventListener('click', function(event){
  const modal = document.getElementById('disclaimer_modal');
  if(modal && event.target === modal) closeDisclaimerModal();
});
document.addEventListener('keydown', function(event){
  if(event.key === 'Escape') closeDisclaimerModal();
});


function openChangelogModal(){
  const modal = document.getElementById('changelog_modal');
  if(!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
}
function closeChangelogModal(){
  const modal = document.getElementById('changelog_modal');
  if(!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
}
function openDisclaimerModal(){
  const modal = document.getElementById('disclaimer_modal');
  if(!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
}
function closeDisclaimerModal(){
  const modal = document.getElementById('disclaimer_modal');
  if(!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
}
document.addEventListener('click', function(event){
  const changelogModal = document.getElementById('changelog_modal');
  const disclaimerModal = document.getElementById('disclaimer_modal');
  if(changelogModal && event.target === changelogModal) closeChangelogModal();
  if(disclaimerModal && event.target === disclaimerModal) closeDisclaimerModal();
});
document.addEventListener('keydown', function(event){
  if(event.key === 'Escape'){
    closeChangelogModal();
    closeDisclaimerModal();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

/* Splash failsafe: prevents a startup script error from trapping the app on the loading screen. */
function hideAppSplashSafely(){
  const splash = document.getElementById('app_splash');
  if(splash) splash.classList.add('is-hidden');
}
window.addEventListener('load', () => setTimeout(hideAppSplashSafely, 250));
document.addEventListener('DOMContentLoaded', () => setTimeout(hideAppSplashSafely, 1200));
setTimeout(hideAppSplashSafely, 3000);
