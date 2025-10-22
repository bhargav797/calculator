(function(){
  const previousEl = document.getElementById('previous');
  const currentEl = document.getElementById('current');
  const keys = document.querySelectorAll('.key');

  let state = {
    current: '0',
    previous: '',
    operator: null,
    waitingForNewNumber: false
  };

  function updateDisplay(){
    currentEl.textContent = state.current;
    previousEl.textContent = state.previous ? `${state.previous} ${state.operator || ''}` : '';
  }

  function inputNumber(num){
    if(state.waitingForNewNumber){
      state.current = num;
      state.waitingForNewNumber = false;
    } else {
      if(state.current === '0' && num !== '.') state.current = num;
      else if(state.current.includes('.') && num === '.') return;
      else state.current = state.current + num;
    }
    updateDisplay();
  }

  function handleOperator(nextOp){
    const inputValue = parseFloat(state.current);
    if(state.operator && state.waitingForNewNumber){
      state.operator = nextOp;
      updateDisplay();
      return;
    }
    if(state.previous === ''){
      state.previous = inputValue;
    } else if(state.operator){
      const result = performCalculation(state.operator, parseFloat(state.previous), inputValue);
      state.previous = String(result);
      currentEl.classList.add('flash');
      setTimeout(()=>currentEl.classList.remove('flash'), 400);
    }
    state.operator = nextOp;
    state.waitingForNewNumber = true;
    updateDisplay();
  }

  function performCalculation(op, a, b){
    if(Number.isNaN(a) || Number.isNaN(b)) return 0;
    switch(op){
      case 'add': return round(a + b);
      case 'subtract': return round(a - b);
      case 'multiply': return round(a * b);
      case 'divide': return b === 0 ? 'Error' : round(a / b);
      default: return b;
    }
  }

  function round(v){
    if (typeof v === 'string') return v;
    return parseFloat(parseFloat(v).toPrecision(12));
  }

  function clearAll(){
    state.current = '0';
    state.previous = '';
    state.operator = null;
    state.waitingForNewNumber = false;
    updateDisplay();
  }

  function backspace(){
    if(state.waitingForNewNumber) return;
    if(state.current.length === 1 || (state.current.length===2 && state.current.startsWith('-'))){
      state.current = '0';
    } else {
      state.current = state.current.slice(0,-1);
    }
    updateDisplay();
  }

  function percent(){
    const val = parseFloat(state.current);
    state.current = String(round(val / 100));
    updateDisplay();
  }

  function negate(){
    if(state.current === '0') return;
    if(state.current.startsWith('-')) state.current = state.current.slice(1);
    else state.current = '-' + state.current;
    updateDisplay();
  }

  function decimal(){
    if(state.waitingForNewNumber){
      state.current = '0.';
      state.waitingForNewNumber = false;
      updateDisplay();
      return;
    }
    if(!state.current.includes('.')){
      state.current += '.';
      updateDisplay();
    }
  }

  function equals(){
    if(!state.operator) return;
    const result = performCalculation(state.operator, parseFloat(state.previous), parseFloat(state.current));
    state.current = String(result);
    state.previous = '';
    state.operator = null;
    state.waitingForNewNumber = true;
    updateDisplay();
  }

  function sqrt(){
    const v = parseFloat(state.current);
    if(v < 0){ state.current = 'Error'; updateDisplay(); return; }
    state.current = String(round(Math.sqrt(v)));
    updateDisplay();
  }

  function pow(){
    const v = parseFloat(state.current);
    state.current = String(round(v * v));
    updateDisplay();
  }

  keys.forEach(k => {
    k.addEventListener('click', () => {
      const num = k.dataset.number;
      const action = k.dataset.action;
      if(num !== undefined) inputNumber(num);
      else if(action) switch(action){
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'percent': percent(); break;
        case 'negate': negate(); break;
        case 'decimal': decimal(); break;
        case 'equals': equals(); break;
        case 'sqrt': sqrt(); break;
        case 'pow': pow(); break;
        case 'add': handleOperator('add'); break;
        case 'subtract': handleOperator('subtract'); break;
        case 'multiply': handleOperator('multiply'); break;
        case 'divide': handleOperator('divide'); break;
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if(e.ctrlKey || e.metaKey) return;
    const key = e.key;
    if(/^[0-9]$/.test(key)) { inputNumber(key); e.preventDefault(); }
    else if(key === '.') { decimal(); e.preventDefault(); }
    else if(key === 'Enter' || key === '=') { equals(); e.preventDefault(); }
    else if(key === 'Backspace') { backspace(); e.preventDefault(); }
    else if(key === 'Escape') { clearAll(); e.preventDefault(); }
    else if(key === '+') { handleOperator('add'); e.preventDefault(); }
    else if(key === '-') { handleOperator('subtract'); e.preventDefault(); }
    else if(key === '*' || key === 'x') { handleOperator('multiply'); e.preventDefault(); }
    else if(key === '/') { handleOperator('divide'); e.preventDefault(); }
    else if(key === '%') { percent(); e.preventDefault(); }
  });

  clearAll();
})();
