/* State-machine check for turnaround holds with manual loop */
function simulate() {
  var half = 10.04;
  var boom = 20.08;
  var MID_EPS = 0.08;
  var END_EPS = 0.06;
  var holding = false;
  var midHeld = false;
  var endLatched = false;
  var holds = [];

  function holdAt(type) {
    if (holding) return;
    holding = true;
    holds.push(type);
    holding = false;
  }

  function holdAtStart() {
    holdAt('start');
  }

  function holdAtMid() {
    if (midHeld || holding) return;
    midHeld = true;
    holdAt('mid');
  }

  function holdAtEnd() {
    if (holding || endLatched) return;
    endLatched = true;
    holdAtStart();
    midHeld = false;
    endLatched = false;
  }

  function onTimeUpdate(t) {
    if (holding) return;
    if (t >= boom - END_EPS) {
      holdAtEnd();
      return;
    }
    if (!midHeld && t >= half - MID_EPS) {
      holdAtMid();
    }
  }

  holdAtStart();

  for (var t = 0; t <= boom; t += 0.05) {
    onTimeUpdate(t);
  }

  if (holds.length !== 3) {
    console.error('FAIL: expected 3 holds (start, mid, start), got', holds);
    process.exit(1);
  }
  if (holds[0] === 'start' && holds[1] === 'mid' && holds[2] === 'start') {
    console.log('PASS:', holds.join(', '));
    return;
  }
  console.error('FAIL: unexpected holds', holds);
  process.exit(1);
}

simulate();