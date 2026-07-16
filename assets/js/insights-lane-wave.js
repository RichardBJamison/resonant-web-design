/**
 * Insights lane string wave
 *
 * Cards are tied like a string:
 * - Move right → rotate right (−180°)
 * - Move left  → rotate left  (+180°)
 * - Active card tugs in travel direction
 * - Partner two seats AHEAD (travel dir) tugs SAME direction
 * - Partner two seats BEHIND tugs OPPOSITE direction
 *
 * Examples (1-based cards, going right):
 * - On 4 → card 2 pulled opposite
 * - Cross 3 → card 5 pulled same
 * - Cross 2 → card 4 pulled same
 */
(function (global) {
  function showingBack(deg) {
    var norm = ((Math.round(deg) % 360) + 360) % 360;
    return norm === 180;
  }

  function createWave(cards) {
    var n = cards.length;
    var rotations = [];
    var i;
    for (i = 0; i < n; i++) rotations[i] = 0;

    var lastIndex = -1;
    var lastDir = null;

    function applyRotation(idx) {
      var card = cards[idx];
      if (!card) return;
      var deg = rotations[idx];
      if (card.style && card.style.setProperty) {
        card.style.setProperty("--flip", deg + "deg");
      }
      var on = showingBack(deg);
      if (card.classList && card.classList.toggle) {
        card.classList.toggle("is-flipped", on);
      }
      if (card.setAttribute) {
        card.setAttribute("aria-pressed", on ? "true" : "false");
      }
      var front = card.querySelector && card.querySelector(".insight-flip-face--front");
      var back = card.querySelector && card.querySelector(".insight-flip-face--back");
      if (front && front.setAttribute) front.setAttribute("aria-hidden", on ? "true" : "false");
      if (back && back.setAttribute) back.setAttribute("aria-hidden", on ? "false" : "true");
    }

    function tug(idx, dir) {
      if (idx < 0 || idx >= n) return;
      rotations[idx] += dir === "right" ? -180 : 180;
      applyRotation(idx);
    }

    function opposite(dir) {
      return dir === "right" ? "left" : "right";
    }

    /** Pull the string at `index` in travel `dir`. */
    function pullString(index, dir) {
      if (index < 0 || index >= n) return;
      // Active card — same direction as travel
      tug(index, dir);

      // Ahead in travel direction (±2) — same direction
      var ahead = dir === "right" ? index + 2 : index - 2;
      if (ahead >= 0 && ahead < n) tug(ahead, dir);

      // Behind (±2 the other way) — opposite direction (string twist)
      var behind = dir === "right" ? index - 2 : index + 2;
      if (behind >= 0 && behind < n) tug(behind, opposite(dir));
    }

    function onTravel(index) {
      if (index < 0 || index >= n) return null;
      if (index === lastIndex) return null;

      var dir = lastDir || "right";
      if (lastIndex >= 0) {
        dir = index > lastIndex ? "right" : "left";
      }

      pullString(index, dir);
      lastIndex = index;
      lastDir = dir;
      return { index: index, dir: dir, rotations: rotations.slice() };
    }

    function settleMajority() {
      var backs = 0;
      for (i = 0; i < n; i++) {
        if (showingBack(rotations[i])) backs += 1;
      }
      var fronts = n - backs;
      var wantBack = backs >= 3;
      if (fronts >= 3) wantBack = false;
      if (backs >= 3) wantBack = true;
      if (backs < 3 && fronts < 3) {
        wantBack = lastDir !== "left";
      }

      var dir = wantBack ? "right" : "left";
      var pending = [];
      for (i = 0; i < n; i++) {
        if (showingBack(rotations[i]) !== wantBack) pending.push(i);
      }

      pending.forEach(function (idx, k) {
        var run = function () {
          tug(idx, dir);
          if (showingBack(rotations[idx]) !== wantBack) tug(idx, dir);
        };
        if (typeof window !== "undefined" && window.setTimeout) {
          window.setTimeout(run, 80 * k);
        } else {
          run();
        }
      });

      return { wantBack: wantBack, pending: pending, rotations: rotations.slice() };
    }

    function resetCursor() {
      lastIndex = -1;
    }

    function getState() {
      return {
        rotations: rotations.slice(),
        faces: rotations.map(function (d) {
          return showingBack(d) ? "back" : "front";
        }),
        lastIndex: lastIndex,
        lastDir: lastDir
      };
    }

    for (i = 0; i < n; i++) applyRotation(i);

    return {
      onTravel: onTravel,
      settleMajority: settleMajority,
      resetCursor: resetCursor,
      getState: getState,
      tug: tug,
      pullString: pullString
    };
  }

  function mount(selector) {
    if (typeof document === "undefined") return null;
    var root = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!root) return null;
    var cards = Array.prototype.slice.call(root.querySelectorAll(".insight-card--flip"));
    if (!cards.length) return null;

    var wave = createWave(cards);
    var leaveTimer = null;

    function indexFromPoint(clientX, clientY) {
      var el = document.elementFromPoint(clientX, clientY);
      if (!el || !root.contains(el)) return -1;
      var card = el.closest(".insight-card--flip");
      if (!card) return -1;
      return cards.indexOf(card);
    }

    function handleIndex(idx) {
      if (idx < 0) return;
      if (idx === wave.getState().lastIndex) return;
      wave.onTravel(idx);
    }

    root.addEventListener("mousemove", function (e) {
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = null;
      }
      handleIndex(indexFromPoint(e.clientX, e.clientY));
    });

    root.addEventListener("mouseenter", function (e) {
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = null;
      }
      handleIndex(indexFromPoint(e.clientX, e.clientY));
    });

    root.addEventListener("mouseleave", function () {
      leaveTimer = window.setTimeout(function () {
        wave.settleMajority();
        wave.resetCursor();
      }, 50);
    });

    root.addEventListener(
      "touchmove",
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        handleIndex(indexFromPoint(e.touches[0].clientX, e.touches[0].clientY));
      },
      { passive: true }
    );

    root.addEventListener("touchend", function () {
      wave.settleMajority();
      wave.resetCursor();
    });

    cards.forEach(function (card, i) {
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          var st = wave.getState();
          wave.pullString(i, st.faces[i] === "back" ? "left" : "right");
        }
      });
    });

    return wave;
  }

  global.InsightsLaneWave = {
    createWave: createWave,
    mount: mount,
    showingBack: showingBack
  };
})(typeof window !== "undefined" ? window : globalThis);
