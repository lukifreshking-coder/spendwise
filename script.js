
const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");

let transactions = JSON.parse(
  localStorage.getItem("spendwiseTransactions") || "[]"
);

let budget = Number(localStorage.getItem("spendwiseBudget") || 0);

const money = amount =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2
  }).format(amount);

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

function saveData() {
  localStorage.setItem(
    "spendwiseTransactions",
    JSON.stringify(transactions)
  );
  localStorage.setItem("spendwiseBudget", budget);
}

function render() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("income").textContent = money(income);
  document.getElementById("expenses").textContent = money(expenses);
  document.getElementById("balance").textContent =
    money(income - expenses);

  list.innerHTML = "";

  document.getElementById("emptyMessage").style.display =
    transactions.length ? "none" : "block";

  transactions.forEach(t => {
    const row = document.createElement("tr");

    const values = [
      t.description,
      t.category,
      t.type,
      (t.type === "income" ? "+" : "-") + money(t.amount)
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (index === 3) {
        cell.className =
          t.type === "income" ? "positive" : "negative";
      }

      row.appendChild(cell);
    });

    const action = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";
    deleteButton.setAttribute("aria-label", "Delete transaction");

    deleteButton.addEventListener("click", () => {
      transactions = transactions.filter(item => item.id !== t.id);
      saveData();
      render();
    });

    action.appendChild(deleteButton);
    row.appendChild(action);
    list.appendChild(row);
  });

  updateBudget(expenses);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description =
    document.getElementById("description").value.trim();

  const amount = Number(
    document.getElementById("amount").value
  );

  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  transactions.unshift({
    id: Date.now() + Math.random(),
    description,
    amount,
    type,
    category
  });

  saveData();
  form.reset();
  render();
});

document.getElementById("budgetForm").addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const amount = Number(
      document.getElementById("budgetAmount").value
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid budget.");
      return;
    }

    budget = amount;
    saveData();
    event.target.reset();
    render();
  }
);

function updateBudget(expenses) {
  document.getElementById("budgetSpent").textContent =
    money(expenses);

  const percentage = budget
    ? (expenses / budget) * 100
    : 0;

  const bar = document.getElementById("progressBar");
  bar.style.width = Math.min(percentage, 100) + "%";

  bar.style.background =
    percentage > 100 ? "#df7067" :
    percentage >= 80 ? "#e6a23c" :
    "#169d76";

  document.getElementById("budgetStatus").textContent =
    budget
      ? `${money(expenses)} spent out of ${money(budget)} (${percentage.toFixed(1)}%). ${
          percentage > 100
            ? "You have exceeded your budget!"
            : "Keep monitoring your spending."
        }`
      : "Set a budget to get started.";
}

render();
