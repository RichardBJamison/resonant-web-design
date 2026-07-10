function simulate() {
  var D = 10.04;
  var BOOM = 20.08;
  var leg = 'idle';
  var holding = false;
  var lastT = -1;
  var holds = [];

  function beginHold(type) {
    if (holding) return;
    holding = true;
    leg = 'hold';
    holds.push(type);
    holding = false;
  }

  function startForwardLeg() {
    leg = 'forward';
    lastT = -1;
  }

  function startReverseLeg() {
    leg = 'reverse';
    lastT = D;
  }

  function startCycle() {
    beginHold('start');
    startForwardLeg();
  }

  function finishCycle() {
    beginHold('end');
    startCycle();
  }

  function onTick(t) {
    if (holding) return;

    if (leg === 'forward' && lastT < D && t >= D) {
      beginHold('mid');
      startReverseLeg();
      return;
    }

    if (leg === 'reverse' && lastT < BOOM - 0.05 && t >= BOOM - 0.05) {
      finishCycle();
      return;
    }

    lastT = t;
  }

  startCycle();

  for (var t = 0; t <= BOOM; t += 0.15) {
    onTick(t);
  }
  onTick(BOOM - 0.01);

  if (holds[0] !== 'start' || holds[1] !== 'mid' || holds[2] !== 'end') {
    console.error('FAIL: expected start,mid,end on first cycle, got', holds.slice(0, 3));
    process.exit(1);
  }

  console.log('PASS:', holds.slice(0, 3).join(', '));
}

simulate();