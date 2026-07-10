function simulate() {
  var ZONE = 0.1;
  var half = 10.04;
  var boom = 20.08;
  var phase = 'forward';
  var holding = false;
  var holds = [];

  function holdAt(type) {
    if (holding) return;
    holding = true;
    holds.push(type);
    holding = false;
    if (type === 'start-hold') {
      phase = 'forward';
      return;
    }
    if (type === 'mid') {
      phase = 'reverse';
      return;
    }
    if (type === 'end') {
      phase = 'start-hold';
      holdAt('start');
      return;
    }
    phase = 'forward';
  }

  holdAt('start');

  for (var t = 0; t <= boom; t += 0.2) {
    if (holding) continue;
    if (phase === 'forward' && t >= half - ZONE) {
      holdAt('mid');
      continue;
    }
    if (phase === 'reverse' && t >= boom - ZONE) {
      holdAt('end');
      break;
    }
  }

  if (holds.length !== 4) {
    console.error('FAIL: expected 4 holds (start, mid, end, start), got', holds);
    process.exit(1);
  }

  if (holds[0] === 'start' && holds[1] === 'mid' && holds[2] === 'end' && holds[3] === 'start') {
    console.log('PASS:', holds.join(', '));
    return;
  }

  console.error('FAIL: unexpected holds', holds);
  process.exit(1);
}

simulate();