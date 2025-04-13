$(document).ready(function () {
  const API_URL = "http://127.0.0.1:5000/api";

  // === LOGIN ===
  $("#btnLogin").click(async function () {
    const userId = $("#uniqueID").val().trim();
    const passcode = $("#passcode").val().trim();

    if (!userId || !passcode) {
      $("#loginMessage").text("Please enter both ID and Passcode.");
      return;
    }

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, passcode })
    });

    const result = await res.json();

    if (result.success) {
      sessionStorage.setItem("userId", userId);
      $("#loginMessage").text("Login successful!").css("color", "green");
      $("#loginPage").hide();
      $("#menuPage").show();
    } else {
      $("#loginMessage").text(result.message || "Login failed. Check your credentials.").css("color", "red");
    }
  });

  // === CREATE NEW USER ===
  $("#btnCreateID").click(async function () {
    const userId = $("#uniqueID").val().trim();
    const passcode = $("#passcode").val().trim();

    if (!userId || !passcode) {
      alert("Both ID and passcode are required.");
      return;
    }

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, passcode })
    });

    const result = await res.json();
    alert(result.message || "Registration attempt complete.");
  });

  // === SAVE CREDIT INFO ===
  $("#btnSaveCreditInfo").click(async function () {
    const userId = sessionStorage.getItem("userId");
    const limit = $("#creditLimit").val();
    const balance = $("#startBalance").val();

    await fetch(`${API_URL}/saveCreditInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, limit, balance })
    });

    alert("Credit info saved!");
  });

  // === LOAD CREDIT INFO ===
  $("#creditInfoPage").on("pageshow", async function () {
    const userId = sessionStorage.getItem("userId");
    const res = await fetch(`${API_URL}/getCreditInfo?userId=${userId}`);
    const info = await res.json();

    if (info) {
      $("#creditLimit").val(info.limit);
      $("#startBalance").val(info.balance);
    }
  });

  // === SAVE TRANSACTION ===
  $("#btnSaveTransaction").click(async function () {
    const userId = sessionStorage.getItem("userId");
    const date = $("#transDate").val();
    const amount = parseFloat($("#transAmount").val());

    if (!date || isNaN(amount)) {
      alert("Please enter valid date and amount.");
      return;
    }

    await fetch(`${API_URL}/saveTransaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date, amount })
    });

    alert("Transaction saved!");
    renderTransactions();
  });

  // === RENDER TRANSACTIONS ===
  async function renderTransactions() {
    const userId = sessionStorage.getItem("userId");
    const res = await fetch(`${API_URL}/getTransactions?userId=${userId}`);
    const { transactions } = await res.json();

    const table = $("#transactionsTable");
    table.empty();

    transactions.forEach((entry, index) => {
      const row = `<tr>
        <td>${entry.date}</td>
        <td>$${parseFloat(entry.amount).toFixed(2)}</td>
        <td><button onclick="deleteTransaction(${index})">Delete</button></td>
      </tr>`;
      table.append(row);
    });
  }

  // OPTIONAL: Delete functionality for future expansion
  function deleteTransaction(index) {
    alert("Delete feature is not yet implemented.");
  }

  $("#transactionPage").on("pageshow", renderTransactions);

  // === GRAPH ===
  let creditChart;
  $("#btnGraph").click(async function () {
    $("#menuPage").hide();
    $("#graphPage").show();

    const userId = sessionStorage.getItem("userId");
    const infoRes = await fetch(`${API_URL}/getCreditInfo?userId=${userId}`);
    const creditInfo = await infoRes.json();

    const txRes = await fetch(`${API_URL}/getTransactions?userId=${userId}`);
    const { transactions } = await txRes.json();

    let balance = parseFloat(creditInfo.balance);
    const dates = [];
    const balances = [];

    transactions.forEach(t => {
      balance -= parseFloat(t.amount);
      dates.push(t.date);
      balances.push(balance.toFixed(2));
    });

    if (creditChart) creditChart.destroy();

    const ctx = document.getElementById("creditChart").getContext("2d");
    creditChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label: "Credit Balance Over Time",
          data: balances,
          borderColor: "green",
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });

  $("#btnBackFromGraph").click(function () {
    $("#graphPage").hide();
    $("#menuPage").show();
  });

  // === ADVICE ===
  $("#btnAdvice").click(async function () {
    $("#menuPage").hide();
    $("#advicePage").show();

    const userId = sessionStorage.getItem("userId");

    const infoRes = await fetch(`${API_URL}/getCreditInfo?userId=${userId}`);
    const creditInfo = await infoRes.json();

    const txRes = await fetch(`${API_URL}/getTransactions?userId=${userId}`);
    const { transactions } = await txRes.json();

    let totalSpent = 0;
    transactions.forEach(t => {
      totalSpent += parseFloat(t.amount);
    });

    const usageRatio = (totalSpent / parseFloat(creditInfo.limit)) * 100;
    let advice = "";

    if (usageRatio < 30) {
      advice = "Great job! You’re using your credit responsibly.";
    } else if (usageRatio < 70) {
      advice = "Be cautious. You're approaching high usage.";
    } else {
      advice = "Warning: You’ve used a large portion of your credit.";
    }

    $("#adviceContent").text(advice);
  });

  $("#btnBackFromAdvice").click(function () {
    $("#advicePage").hide();
    $("#menuPage").show();
  });
});