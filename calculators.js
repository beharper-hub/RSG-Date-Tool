function addDays(d, days){ const x=new Date(d); x.setDate(x.getDate()+Math.ceil(days)); return x; }

function addHistory(type, text){
  if(!calcHistory[type]){
    calcHistory[type] = [];
  }

  calcHistory[type].unshift(text);

  // Keep only the 5 most recent entries
  if(calcHistory[type].length > 5){
    calcHistory[type] = calcHistory[type].slice(0,5);
  }

  const target = document.getElementById(type + '_history');
  if(!target) return;

  target.innerHTML = calcHistory[type]
    .map(item => `<div class="history-item">${item}</div>`)
    .join('');
}

function calcFocus(){
  const el = $('calc_expr');
  if(el) el.focus();
}

function setCalcMode(mode){
  calcMode = mode;

  const scientific = document.querySelectorAll('.scientific-key');

  if(mode === 'scientific'){
    scientific.forEach(el => el.style.display = 'block');
    $('calc_standard_btn').className = 'secondary';
    $('calc_scientific_btn').className = 'good';
  } else {
    scientific.forEach(el => el.style.display = 'none');
    $('calc_standard_btn').className = 'good';
    $('calc_scientific_btn').className = 'secondary';
  }
}

function calcPress(value){
  const startsNewCalculation = /^[0-9.]$/.test(value);
  const continuesFromAnswer = ['+','-','*','/','**'].includes(value);

  if(calcJustSolved){
    if(startsNewCalculation){
      $('calc_expr').value = '';
      $('calc_expression').textContent = '';
    } else if(!continuesFromAnswer){
      $('calc_expression').textContent = '';
    }
    calcJustSolved = false;
  }

  $('calc_expr').value += value;
  calcUpdateDisplay();
}

function calcFunction(fn){
  if(calcJustSolved){
    $('calc_expr').value = '';
    $('calc_expression').textContent = '';
    calcJustSolved = false;
  }
  $('calc_expr').value += fn;
  calcUpdateDisplay();
}

function calcPercent(){
  let expr = $('calc_expr').value.trim();
  if(!expr) return;

  const numberMatch = expr.match(/(\d+(?:\.\d+)?|\.\d+)$/);
  if(!numberMatch) return;

  const numberText = numberMatch[1];
  const percentNumber = parseFloat(numberText);
  const beforeNumber = expr.slice(0, -numberText.length);
  const opInfo = findLastCalcOperator(beforeNumber);

  let replacement;

  try{
    if(opInfo && (opInfo.op === '+' || opInfo.op === '-')){
      const leftExpr = beforeNumber.slice(0, opInfo.index).trim();

      if(leftExpr){
        const baseValue = calcEvaluateSafe(leftExpr);
        replacement = String(Number(((baseValue * percentNumber) / 100).toFixed(10)));
      } else {
        replacement = String(percentNumber / 100);
      }
    } else {
      replacement = String(Number((percentNumber / 100).toFixed(10)));
    }

    $('calc_expr').value = beforeNumber + replacement;
    calcJustSolved = false;
    calcUpdateDisplay();
  } catch(e){
    $('calc_display').textContent = 'Error';
    $('calc_expression').textContent = 'Check percent entry';
  }
}

function clearGeneralCalc(){
  calcJustSolved = false;
  $('calc_expr').value = '';
  $('calc_display').textContent = '0';
  $('calc_expression').textContent = '';
}

function calcBackspace(){
  if(calcJustSolved){
    calcJustSolved = false;
    $('calc_expression').textContent = '';
  }
  $('calc_expr').value = $('calc_expr').value.slice(0,-1);
  calcUpdateDisplay();
}

function generalCalc(){
  let expr = $('calc_expr').value.trim();

  if(!expr){
    $('calc_display').textContent = '0';
    $('calc_expression').textContent = '';
    return;
  }

  if(!/^[0-9+\-*/().\sA-Za-z,_]+$/.test(expr)){
    $('calc_display').textContent = 'Error';
    $('calc_expression').textContent = 'Invalid entry';
    return;
  }

  try{
    const result = Function('"use strict"; return (' + expr + ')')();

    if(typeof result !== 'number' || !isFinite(result)){
      $('calc_display').textContent = 'Error';
      $('calc_expression').textContent = 'Check expression';
      return;
    }

    const cleanResult = Number(result.toFixed(8));
    const prettyExpr = expr.replace(/\*/g,'×').replace(/\//g,'÷');
    $('calc_expression').textContent = prettyExpr + ' =';
    $('calc_expr').value = String(cleanResult);
    $('calc_display').textContent = cleanResult;
    calcJustSolved = true;
    addHistory('calc', prettyExpr + ' = ' + cleanResult);
  } catch(e){
    $('calc_display').textContent = 'Error';
    $('calc_expression').textContent = 'Check expression';
  }
}

function clearCalcHistory(){
  calcHistory.calc = [];
  const el = document.getElementById('calc_history');
  if(el) el.innerHTML = '';
}

function fillDateCalc(){
  const last=dval('fill_last'), days=num('fill_days');
  if(!last||!days) return out('fill_result','Missing last fill date or days supply.');

  const thresh=$('fill_control').checked ? 1 : parseFloat($('fill_threshold').value);
  const eligible=addDays(last, days*thresh);

  const text='Eligible / next fill date: ' + fmt(eligible) + '\n' +
    'Threshold used: ' + Math.round(thresh*100) + '%\n' +
    'Last fill: ' + fmt(last) + '\n' +
    'Days supply: ' + days;

  out('fill_result', text);
}

function fridge(){
  const d=dval('fr_date');
  if(!d) return out('fr_result','Missing delivery date.');

  const day=d.getDay();
  const applyHolidays = $('fr_ups_holidays') ? $('fr_ups_holidays').checked : true;
  const avoidWeekend = $('fr_weekend') ? $('fr_weekend').checked : true;

  let concerns = [];
  let status = 'No major concerns identified';
  let recommendation = 'Proceed using standard refrigerated shipping workflow.';

  if(applyHolidays){
    const holiday = findUpsHoliday(d);
    const prevHoliday = findUpsHoliday(previousDay(d));
    const nextHoliday = findUpsHoliday(nextDay(d));

    if(holiday){
      concerns.push(`${holiday} shipping schedules may impact transit timing.`);
    }
    if(prevHoliday && day !== 0 && day !== 6){
      concerns.push(`This delivery falls immediately after ${prevHoliday}; review possible carrier backlog or delayed movement.`);
    }
    if(nextHoliday && day !== 0 && day !== 6){
      concerns.push(`This delivery falls immediately before ${nextHoliday}; confirm pickup and transit timing before release.`);
    }
    if(day === 2 && prevHoliday){
      concerns.push('Tuesday delivery after a Monday holiday may still carry extended weekend hold risk.');
    }
  }

  if(avoidWeekend){
    if(day===0 || day===6){
      concerns.push('Weekend delivery may increase refrigerated exposure risk.');
    }
    if(day===1){
      concerns.push('Monday refrigerated deliveries can carry additional weekend hold risk.');
    }
    if(day===5){
      concerns.push('Friday refrigerated deliveries may create weekend risk if delayed.');
    }
  }

  const uniqueConcerns = Array.from(new Set(concerns));
  if(uniqueConcerns.length){
    status = uniqueConcerns.length > 1 ? 'Higher transit risk identified' : 'Needs review';
    recommendation = uniqueConcerns.length > 1
      ? 'Consider alternate delivery timing or additional review before release.'
      : 'Verify carrier schedule, product stability window, and local policy before release.';
  }

  let msg = 'Proposed delivery: ' + fmt(d) + '\n' + status + '\n\n';

  if(uniqueConcerns.length){
    msg += uniqueConcerns.join('\n') + '\n\n' + recommendation;
  } else {
    msg += recommendation + '\n\nNo holiday or weekend timing concern was identified by this checker.';
  }

  out('fr_result', msg);
}

function injectableInterval(){
  const doses=num('inj_doses'), interval=num('inj_interval'), unit=$('inj_unit').value;
  if(!validatePositive([doses,interval])) return out('inj_result','Enter valid positive dose and interval values.');
  let multiplier=1, unitLabel='day(s)';
  if(unit==='weeks'){ multiplier=7; unitLabel='week(s)'; }
  if(unit==='months'){ multiplier=30; unitLabel='month(s), estimated at 30 days each'; }
  const days=doses*interval*multiplier;
  if(days>365) return out('inj_result','Calculated day supply exceeds realistic limits. Verify dose count and interval.');
  const text=`Day supply: ${Math.ceil(days)} days
Type: Injection
Doses Dispensed: ${doses}
Every: ${interval} ${unitLabel}
Calculation: ${doses} dose(s) × ${interval} × ${multiplier} day multiplier`;
  out('inj_result', text);
  addHistory('inj', text);
}

function injectablePreset(doses,interval,unit){
  $('inj_doses').value = doses;
  $('inj_interval').value = interval;
  $('inj_unit').value = unit;
}

function toggleGeneralMode(){
  const mode = $('gen_mode').value;
  $('gen_units_mode').style.display = mode === 'units' ? 'block' : 'none';
  $('gen_liquid_mode').style.display = mode === 'liquid' ? 'block' : 'none';
  const titration = $('gen_titration_mode');
  if(titration) titration.style.display = mode === 'titration' ? 'block' : 'none';
  const multi = $('gen_multi_mode');
  if(multi) multi.style.display = mode === 'multi' ? 'block' : 'none';
  const daily = $('gen_daily_mode');
  if(daily) daily.style.display = mode === 'daily' ? 'block' : 'none';
  const remaining = $('gen_remaining_mode');
  if(remaining) remaining.style.display = mode === 'remaining' ? 'block' : 'none';
  const roundControls = [$('gen_round'), $('gen_round_label')];
  roundControls.forEach(el => { if(el) el.style.display = (mode === 'daily' || mode === 'remaining') ? 'none' : 'block'; });
}
