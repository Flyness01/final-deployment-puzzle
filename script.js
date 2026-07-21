const answers = ["signal", "steady", "anchor", "ship"];
const hints = [
  {
    title: "Build Hint",
    copy: "Read the failing test name like a dramatic commit message. The all-caps return value is the token."
  },
  {
    title: "Logs Hint",
    copy: "The healthy HTTP status is 200. Filter for it, then look for the gratitude metadata."
  },
  {
    title: "Review Hint",
    copy: "Open the review comment. The reviewer left the token as a variable name."
  },
  {
    title: "Flags Hint",
    copy: "Turn on the behaviors a great mentor would ship. Leave the chaotic internship anti-patterns off."
  }
];

const logs = [
  ["09:12:11", "500", "cache miss: confidence temporarily replaced by impostor syndrome"],
  ["09:18:03", "418", "teapot refused to deploy because it was emotionally attached to staging"],
  ["09:26:45", "404", "missing context: found later in a patient explanation"],
  ["09:37:20", "200", "mentor.signal=STEADY request_id=final-thanks latency=kind"],
  ["09:52:08", "302", "redirected praise to the whole team, classy but suspicious"],
  ["10:04:19", "503", "gratitude service overwhelmed by excellent code reviews"],
  ["10:22:44", "201", "new memory created: laughing during standup without derailing standup"]
];

const solved = [false, false, false, false, false];
const collected = [];

const stages = [
  document.querySelector("#stage-build"),
  document.querySelector("#stage-logs"),
  document.querySelector("#stage-review"),
  document.querySelector("#stage-flags"),
  document.querySelector("#stage-ship")
];

const steps = [...document.querySelectorAll(".step")];
const releaseStatus = document.querySelector("#release-status");
const pipelineScore = document.querySelector("#pipeline-score");
const pipelineMeter = document.querySelector("#pipeline-meter");
const tokenStrip = document.querySelector("#token-strip");
const reveal = document.querySelector("#reveal");

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function showStage(index) {
  stages.forEach((stage, i) => stage.classList.toggle("hidden", i !== index));
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });
}

function updateProgress() {
  const completed = solved.filter(Boolean).length;
  const open = Math.max(0, 4 - solved.slice(0, 4).filter(Boolean).length);
  releaseStatus.textContent = open === 0 ? "ready to ship" : `${open} incident${open === 1 ? "" : "s"} open`;
  const percent = completed === 5 ? 100 : 17 + solved.slice(0, 4).filter(Boolean).length * 19;
  pipelineScore.textContent = `${percent}%`;
  pipelineMeter.value = percent;

  steps.forEach((step, i) => {
    step.classList.toggle("done", solved[i]);
    step.classList.toggle("locked", i > 0 && !solved[i - 1]);
    const label = document.querySelector(`#state-${i}`);
    if (!label) return;
    if (solved[i]) label.textContent = "Resolved";
    else if (i === 0 || solved[i - 1]) label.textContent = "Investigating";
    else label.textContent = "Locked";
  });

  tokenStrip.innerHTML = collected.map(token => `<div class="token">${token.toUpperCase()}</div>`).join("");
}

function resolveStage(index, token) {
  solved[index] = true;
  if (index < 4 && !collected.includes(token)) collected.push(token);
  document.querySelector(`#feedback-${index}`).textContent = index === 4
    ? "Deployment accepted. The page is about to get sincere."
    : "Resolved. Nice catch.";
  document.querySelector(`#feedback-${index}`).className = "feedback good";
  updateProgress();

  window.setTimeout(() => {
    if (index === 4) {
      stages.forEach(stage => stage.classList.add("hidden"));
      reveal.classList.remove("hidden");
      reveal.scrollIntoView({ behavior: "smooth", block: "start" });
      burst();
      return;
    }
    showStage(index + 1);
  }, 700);
}

document.querySelectorAll(".answer-row").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const index = Number(form.dataset.answer);
    const input = form.querySelector("input");
    const value = normalize(input.value);
    const expected = index === 4 ? answers.join("-") : answers[index];
    const compactExpected = expected.replaceAll("-", "");
    const goodFinal = index === 4 && (value === expected || value === compactExpected);

    if (value === expected || goodFinal) {
      resolveStage(index, answers[index] || "deployed");
      return;
    }

    const feedback = document.querySelector(`#feedback-${index}`);
    feedback.textContent = "Not quite. The incident remains annoyingly reproducible.";
    feedback.className = "feedback bad";
  });
});

steps.forEach(step => {
  step.addEventListener("click", () => {
    const index = Number(step.dataset.step);
    if (index === 0 || solved[index - 1]) showStage(index);
  });
});

document.querySelectorAll("[data-hint]").forEach(button => {
  button.addEventListener("click", () => {
    const hint = hints[Number(button.dataset.hint)];
    document.querySelector("#hint-title").textContent = hint.title;
    document.querySelector("#hint-copy").textContent = hint.copy;
    document.querySelector("#hint-dialog").showModal();
  });
});

document.querySelector(".comment-pin").addEventListener("click", event => {
  const comment = document.querySelector("#review-comment");
  const expanded = comment.hidden;
  comment.hidden = !expanded;
  event.currentTarget.setAttribute("aria-expanded", String(expanded));
});

const logFilter = document.querySelector("#log-filter");
const logsEl = document.querySelector("#logs");

function renderLogs() {
  const query = normalize(logFilter.value);
  const visible = logs.filter(row => !query || row.some(cell => normalize(cell).includes(query)));
  logsEl.innerHTML = visible.map(row => `
    <div class="log-line">
      <span>${row[0]}</span>
      <strong>${row[1]}</strong>
      <span>${row[2]}</span>
    </div>
  `).join("");
}

logFilter.addEventListener("input", renderLogs);
renderLogs();

const flags = [...document.querySelectorAll(".flag input")];
const flagToken = document.querySelector("#flag-token");

function updateFlags() {
  const correct = flags.every(flag => flag.checked === (flag.dataset.good === "true"));
  flagToken.textContent = correct ? "SHIP" : "pending";
  flagToken.style.color = correct ? "var(--green)" : "var(--ink)";
}

flags.forEach(flag => flag.addEventListener("change", updateFlags));
updateFlags();

document.querySelector("#restart").addEventListener("click", () => {
  window.location.reload();
});

function animateSignal() {
  const canvas = document.querySelector("#signal-canvas");
  const ctx = canvas.getContext("2d");
  let t = 0;

  function draw() {
    const width = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    for (let row = 0; row < 7; row++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const y = h * (0.2 + row * 0.11) + Math.sin(x * 0.018 + t + row) * (10 + row * 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = row % 2 ? "rgba(242, 208, 141, 0.3)" : "rgba(255, 195, 207, 0.34)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (let i = 0; i < 56; i++) {
      const x = (i * 83 + t * 28) % (w + 60) - 30;
      const y = (Math.sin(i * 1.7 + t) * 0.35 + 0.5) * h;
      ctx.fillStyle = i % 5 === 0 ? "rgba(242, 208, 141, 0.9)" : "rgba(255, 250, 242, 0.52)";
      ctx.fillRect(x, y, 3, 3);
    }

    t += 0.012;
    requestAnimationFrame(draw);
  }

  draw();
}

function burst() {
  const colors = ["#f2d08d", "#fffaf2", "#ffc3cf", "#c5ead8"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("i");
    piece.style.position = "fixed";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-20px";
    piece.style.width = "8px";
    piece.style.height = "12px";
    piece.style.background = colors[i % colors.length];
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    piece.style.zIndex = "20";
    piece.style.pointerEvents = "none";
    piece.animate([
      { translate: "0 0", opacity: 1 },
      { translate: `${Math.random() * 120 - 60}px ${window.innerHeight + 80}px`, opacity: 0 }
    ], {
      duration: 1100 + Math.random() * 1200,
      easing: "cubic-bezier(.17,.67,.28,1)"
    }).onfinish = () => piece.remove();
    document.body.appendChild(piece);
  }
}

animateSignal();
updateProgress();
