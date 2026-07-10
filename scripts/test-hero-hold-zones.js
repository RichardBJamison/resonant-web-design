function simulate() {
  var HOLD_DIST = 0.08;
  var half = 10.04;
  var boom = 20.08;
  var holding = false;
  var holdLatch = { start: false, mid: false, end: false };
  var holds = [];

  function resetLatches() {
    holdLatch.start = false;
    holdLatch.mid = false;
    holdLatch.end = false;
  }

  function beginHold() {
    if (holding) return true;
    holding = true;
    holding = false;
    return true;
  }

  function maybeHold(t) {
    if (holding) return false;
    var d = Math.min(t, Math.abs(t - half), boom - t);
    if (d > HOLD_DIST) return false;

    if (!holdLatch.start && t < 0.5) {
      holdLatch.start = true;
      holds.push('start');
      return beginHold();
    }
    if (!holdLatch.mid && Math.abs(t - half) < 0.5) {
      holdLatch.mid = true;
      holds.push('mid');
      return beginHold();
    }
    if (!holdLatch.end && boom - t < 0.5) {
      holdLatch.end = true;
      holds.push('end');
      return beginHold();
    }
    return false;
  }

  for (var t = 0; t <= boom; t += 0.2) {
    if (holdLatch.end && t < 0.3) resetLatches();
    maybeHold(t);
  }
  maybeHold(boom - 0.01);

  if (holds.length !== 3) {
    console.error('FAIL: expected 3 holds (start, mid, end), got', holds);
    process.exit(1);
  }

  if (holds[0] === 'start' && holds[1] === 'mid' && holds[2] === 'end') {
    console.log('PASS:', holds.join(', '));
    return;
  }

  console.error('FAIL: unexpected holds', holds);
  process.exit(1);
}

simulate();