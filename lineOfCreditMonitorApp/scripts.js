$(document).ready(function () {

// Login
$("#btnLogin").click(function () {
    const enteredID = $("#uniqueID").val().trim();
    const enteredPass = $("#passcode").val().trim();
    const storedUser = JSON.parse(localStorage.getItem("user"));
  
    if (storedUser && storedUser.id === enteredID && storedUser.passcode === enteredPass) {
      sessionStorage.setItem("user", JSON.stringify(storedUser));
      $("#loginMessage").text("");
      $("#loginPage").hide();
      $("#menuPage").show();
    } else {
      $("#loginMessage").text("Login failed. Check your credentials.");
    }
  });
  
  // Create New ID
  $("#btnCreateID").click(function () {
    const newID = $("#uniqueID").val().trim();
    const newPass = $("#passcode").val().trim();
  
    if (!newID || !newPass) {
      alert("Both ID and passcode are required.");
      return;
    }
  
    const newUser = { id: newID, passcode: newPass };
    localStorage.setItem("user", JSON.stringify(newUser));
    alert("New ID created. You can now login.");
  }); 
  
  // Save credit info
$("#btnSaveCreditInfo").click(function () {
    const creditInfo = {
      limit: $("#creditLimit").val(),
      balance: $("#startBalance").val()
    };
  
    localStorage.setItem("creditInfo", JSON.stringify(creditInfo));
    alert("Credit info saved!");
  });

  $("#creditInfoPage").on("pageshow", function () {
    const saved = JSON.parse(localStorage.getItem("creditInfo"));
    if (saved) {
      $("#creditLimit").val(saved.limit);
      $("#startBalance").val(saved.balance);
    }
  });
  
 // Save transaction
$("#btnSaveTransaction").click(function () {
    const date = $("#transDate").val();
    const amount = parseFloat($("#transAmount").val());
  
    if (!date || isNaN(amount)) {
      alert("Please enter valid date and amount.");
      return;
    }
  
    const entry = { date, amount };
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push(entry);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("Transaction saved!");
    renderTransactions();
  });
  
  // Render transactions
  function renderTransactions() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const table = $("#transactionsTable");
    table.empty();
  
    transactions.forEach((entry, index) => {
      const row = `<tr>
        <td>${entry.date}</td>
        <td>$${entry.amount.toFixed(2)}</td>
        <td><button onclick="deleteTransaction(${index})">Delete</button></td>
      </tr>`;
      table.append(row);
    });
  }
  
  // Delete transaction
  function deleteTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
  }
  
  // Load transactions when page is shown
  $("#transactionPage").on("pageshow", renderTransactions); 

  let creditChart;

$("#btnGraph").click(function () {
  $("#menuPage").hide();
  $("#graphPage").show();

  const creditInfo = JSON.parse(localStorage.getItem("creditInfo"));
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  let balance = parseFloat(creditInfo.balance);
  const dates = [];
  const balances = [];

  transactions.forEach(t => {
    balance -= parseFloat(t.amount);
    dates.push(t.date);
    balances.push(balance.toFixed(2));
  });

  if (creditChart) {
    creditChart.destroy();
  }

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
        y: {
          beginAtZero: true
        }
      }
    }
  });
});

$("#btnBackFromGraph").click(function () {
  $("#graphPage").hide();
  $("#menuPage").show();
});

$("#btnAdvice").click(function () {
    $("#menuPage").hide();
    $("#advicePage").show();
  
    const creditInfo = JSON.parse(localStorage.getItem("creditInfo"));
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  
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