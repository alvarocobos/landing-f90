const macroForm = document.getElementById("macroForm");
const goalSelect = document.getElementById("goal");
const goalAdjustContainer = document.getElementById("goalAdjustContainer");
const errorMessage = document.getElementById("errorMessage");

const leadGate = document.getElementById("leadGate");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const showResultsBtn = document.getElementById("showResultsBtn");

const resultsSection = document.getElementById("results");
const caloriesValue = document.getElementById("caloriesValue");
const proteinValue = document.getElementById("proteinValue");
const fatValue = document.getElementById("fatValue");
const carbValue = document.getElementById("carbValue");

const proteinBar = document.getElementById("proteinBar");
const fatBar = document.getElementById("fatBar");
const carbBar = document.getElementById("carbBar");

let pendingResults = null;
let savedLeadEmail = "";

function renderGoalAdjustment(goal) {
  if (!goal || goal === "maintain") {
    goalAdjustContainer.classList.add("hidden");
    goalAdjustContainer.innerHTML = "";
    return;
  }

  const isDeficit = goal === "lose";
  const id = isDeficit ? "deficit" : "surplus";
  const label = isDeficit ? "Selecciona tu déficit" : "Selecciona tu superávit";
  const options = isDeficit ? [10, 15, 20] : [5, 10, 15];

  goalAdjustContainer.innerHTML = `
    <label for="${id}">${label} *</label>
    <select id="${id}" required>
      <option value="">Selecciona</option>
      ${options.map((value) => `<option value="${value}">${value}%</option>`).join("")}
    </select>
  `;

  goalAdjustContainer.classList.remove("hidden");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function calculateMacros(data) {
  const { sex, age, weight, height, activity, goal, adjustmentPercent } = data;

  const bmr =
    sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * activity;

  let targetCalories = tdee;
  if (goal === "lose") {
    targetCalories = tdee * (1 - adjustmentPercent / 100);
  } else if (goal === "gain") {
    targetCalories = tdee * (1 + adjustmentPercent / 100);
  }

  // Reparto de macros basado en el peso corporal.
  const proteinGrams = weight * 2;
  const fatGrams = weight * 0.8;

  const caloriesFromProtein = proteinGrams * 4;
  const caloriesFromFat = fatGrams * 9;
  const remainingCalories = Math.max(targetCalories - caloriesFromProtein - caloriesFromFat, 0);
  const carbGrams = remainingCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinGrams),
    fat: Math.round(fatGrams),
    carbs: Math.round(carbGrams),
  };
}

function displayResults({ calories, protein, fat, carbs }) {
  caloriesValue.textContent = `${calories} kcal`;
  proteinValue.textContent = `${protein} g`;
  fatValue.textContent = `${fat} g`;
  carbValue.textContent = `${carbs} g`;

  const totalMacroGrams = protein + fat + carbs || 1;

  proteinBar.style.width = `${(protein / totalMacroGrams) * 100}%`;
  fatBar.style.width = `${(fat / totalMacroGrams) * 100}%`;
  carbBar.style.width = `${(carbs / totalMacroGrams) * 100}%`;

  resultsSection.classList.remove("hidden");
}

goalSelect.addEventListener("change", (event) => {
  renderGoalAdjustment(event.target.value);
});

macroForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  emailError.textContent = "";

  const sex = document.getElementById("sex").value;
  const age = Number(document.getElementById("age").value);
  const weight = Number(document.getElementById("weight").value);
  const height = Number(document.getElementById("height").value);
  const activity = Number(document.getElementById("activity").value);
  const goal = goalSelect.value;

  if (!sex || !age || !weight || !height || !activity || !goal) {
    errorMessage.textContent = "Por favor, completa todos los campos obligatorios.";
    return;
  }

  let adjustmentPercent = 0;
  if (goal === "lose") {
    const deficit = Number(document.getElementById("deficit")?.value);
    if (!deficit) {
      errorMessage.textContent = "Debes seleccionar un porcentaje de déficit.";
      return;
    }
    adjustmentPercent = deficit;
  }

  if (goal === "gain") {
    const surplus = Number(document.getElementById("surplus")?.value);
    if (!surplus) {
      errorMessage.textContent = "Debes seleccionar un porcentaje de superávit.";
      return;
    }
    adjustmentPercent = surplus;
  }

  pendingResults = calculateMacros({
    sex,
    age,
    weight,
    height,
    activity,
    goal,
    adjustmentPercent,
  });

  leadGate.classList.remove("hidden");
  resultsSection.classList.add("hidden");
});

showResultsBtn.addEventListener("click", () => {
  emailError.textContent = "";

  if (!pendingResults) {
    emailError.textContent = "Primero debes calcular tus macros.";
    return;
  }

  const email = emailInput.value.trim();
  if (!isValidEmail(email)) {
    emailError.textContent = "Introduce un email válido para continuar.";
    return;
  }

  // Simulación de guardado de lead sin backend.
  savedLeadEmail = email;
  console.log("Lead guardado:", savedLeadEmail);

  displayResults(pendingResults);
});
