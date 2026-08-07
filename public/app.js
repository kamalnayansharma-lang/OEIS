const sequenceIdInput = document.getElementById("sequenceId");
const fetchBtn = document.getElementById("fetchBtn");
const processBtn = document.getElementById("processBtn");
const processStatus = document.getElementById("processStatus");
const codeInput = document.getElementById("code");

const sequenceCard = document.getElementById("sequenceCard");
const seqName = document.getElementById("seqName");
const seqId = document.getElementById("seqId");
const seqMeta = document.getElementById("seqMeta");
const seqTerms = document.getElementById("seqTerms");
const seqExtras = document.getElementById("seqExtras");

const resultCard = document.getElementById("resultCard");
const resultBox = document.getElementById("resultBox");

const errorCard = document.getElementById("errorCard");
const errorBox = document.getElementById("errorBox");

function showError(message) {
  errorBox.textContent = message;
  errorCard.classList.remove("hidden");
}

function clearError() {
  errorCard.classList.add("hidden");
  errorBox.textContent = "";
}

function metaItem(label, value) {
  const wrap = document.createElement("div");
  wrap.className = "meta-item";
  wrap.innerHTML = `<div class="meta-label"></div><div class="meta-value"></div>`;
  wrap.querySelector(".meta-label").textContent = label;
  wrap.querySelector(".meta-value").textContent = value ?? "—";
  return wrap;
}

function extrasSection(title, items) {
  if (!items || !items.length) return null;
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `${title} (${items.length})`;
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
  details.appendChild(summary);
  details.appendChild(ul);
  return details;
}

function renderSequence(entry) {
  seqName.textContent = entry.name || "(no name)";
  seqId.textContent = `A${String(entry.number).padStart(6, "0")}`;

  seqMeta.innerHTML = "";
  seqMeta.appendChild(metaItem("Number", entry.number));
  seqMeta.appendChild(metaItem("Offset", entry.offset));
  seqMeta.appendChild(metaItem("Author", entry.author));
  seqMeta.appendChild(metaItem("Keywords", entry.keyword));

  seqTerms.innerHTML = "";
  (entry.data || "")
    .split(",")
    .filter(Boolean)
    .forEach((term) => {
      const chip = document.createElement("span");
      chip.className = "term-chip";
      chip.textContent = term;
      seqTerms.appendChild(chip);
    });

  seqExtras.innerHTML = "";
  [
    extrasSection("Comments", entry.comment),
    extrasSection("Formulas", entry.formula),
    extrasSection("Cross-references", entry.xref),
    extrasSection("Links", entry.link),
  ]
    .filter(Boolean)
    .forEach((section) => seqExtras.appendChild(section));

  sequenceCard.classList.remove("hidden");
}

async function fetchSequence(id) {
  const res = await fetch(`/api/sequence/${encodeURIComponent(id)}`);
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body;
}

fetchBtn.addEventListener("click", async () => {
  const id = sequenceIdInput.value.trim();
  if (!id) {
    showError("Please enter a sequence ID, e.g. A000055");
    return;
  }

  clearError();
  resultCard.classList.add("hidden");
  fetchBtn.disabled = true;
  fetchBtn.textContent = "Fetching…";

  try {
    const body = await fetchSequence(id);
    if (!body.oeisData || !body.oeisData.length) {
      sequenceCard.classList.add("hidden");
      showError(`No sequence found for "${id}"`);
      return;
    }
    renderSequence(body.oeisData[0]);
  } catch (err) {
    sequenceCard.classList.add("hidden");
    showError(err.message);
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = "Fetch Sequence";
  }
});

processBtn.addEventListener("click", async () => {
  const id = sequenceIdInput.value.trim();
  const code = codeInput.value;

  if (!id) {
    showError("Please enter a sequence ID, e.g. A000055");
    return;
  }
  if (!code.trim()) {
    showError("Please enter some code to run");
    return;
  }

  clearError();
  resultCard.classList.add("hidden");
  processBtn.disabled = true;
  processStatus.textContent = "Running…";

  try {
    const res = await fetch("/api/sequence/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequenceId: id, code }),
    });
    const responseBody = await res.json();

    if (!res.ok || !responseBody.success) {
      throw new Error(responseBody.error || `Request failed with status ${res.status}`);
    }

    if (responseBody.oeisData && responseBody.oeisData.length) {
      renderSequence(responseBody.oeisData[0]);
    }

    resultBox.textContent =
      typeof responseBody.result === "string"
        ? responseBody.result
        : JSON.stringify(responseBody.result, null, 2);
    resultCard.classList.remove("hidden");
    processStatus.textContent = "Done";
  } catch (err) {
    showError(err.message);
    processStatus.textContent = "";
  } finally {
    processBtn.disabled = false;
  }
});
