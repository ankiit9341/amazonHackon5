<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useContext } from 'react';
>>>>>>> origin/main
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './budget.css';
import axios from 'axios';
import PieChart from './PieChart.jsx';
<<<<<<< HEAD

const Budget = () => {
=======
import { UserContext } from "../../context/UserContext";


const Budget = () => {
  const { currentUser } = useContext(UserContext);
  const userId = currentUser?.userId;

>>>>>>> origin/main
  const [selectedDate, setSelectedDate] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
<<<<<<< HEAD

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = () => {
    axios.post("http://localhost:5000/getBudgetLimit", { user_id: 1 })
      .then((response) => {
        const { budget_limit, spend_amount } = response.data;
        setSpendAmount(spend_amount);
        setRemainingAmount(budget_limit - spend_amount);
      })
      .catch((error) => {
        setSpendAmount(0);
        setRemainingAmount(0);
        console.log(error);
=======
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userId) {
      fetchBudget();
    }
  }, [userId]);

  const fetchBudget = () => {
    axios.post("http://localhost:5000/getBudgetLimit", { user_id: userId })
      .then((res) => {
        const { budget_limit, spend_amount } = res.data;
        setSpendAmount(spend_amount);
        setRemainingAmount(budget_limit - spend_amount);
      })
      .catch((err) => {
        console.log(err);
        setSpendAmount(0);
        setRemainingAmount(0);
>>>>>>> origin/main
      });
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setBudgetAmount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    if (budgetAmount && selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 19).replace('T', ' ');
      axios.post("http://localhost:5000/budgetLimit", {
        user_id: 1,
        amount: budgetAmount,
        valid_till: formattedDate
      })
        .then((response) => {
          alert(`Budget Amount: ${budgetAmount}\nValid Till: ${selectedDate}`);
          fetchBudget();
        })
        .catch((error) => {
          console.log(error);
          alert("Failed!")
        });
    }
=======
    if (budgetAmount === "0") {
      alert("Budget must be greater than 0.");
      return;
    }

    const formattedDate = selectedDate?.toISOString().slice(0, 19).replace('T', ' ');
    axios.post("http://localhost:5000/budgetLimit", {
      user_id: userId,
      amount: budgetAmount,
      valid_till: formattedDate
    })
    .then(() => {
      setMessage(`✅ Budget of ₹${budgetAmount} set until ${new Date(formattedDate).toDateString()}`);
      fetchBudget();
    })
    .catch((err) => {
      console.log(err);
      alert("❌ Failed to set budget.");
    });
>>>>>>> origin/main
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the budget?")) {
<<<<<<< HEAD
      axios.post("http://localhost:5000/resetBudget", { user_id: 1 })
        .then((response) => {
          alert("Budget reset successfully");
          setSpendAmount(0);
          setRemainingAmount(0);
          setBudgetAmount('');
          setSelectedDate(null);
        })
        .catch((error) => {
          console.log(error);
          alert("Failed to reset budget")
=======
      axios.post("http://localhost:5000/resetBudget", { user_id: userId })
        .then(() => {
          setBudgetAmount('');
          setSelectedDate(null);
          setSpendAmount(0);
          setRemainingAmount(0);
          setMessage("🔄 Budget has been reset.");
        })
        .catch((err) => {
          console.log(err);
          alert("❌ Failed to reset.");
>>>>>>> origin/main
        });
    }
  };

  return (
<<<<<<< HEAD
    <>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="label">Enter Budget Amount:</span>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Budget Amount"
              value={budgetAmount}
              onChange={handleBudgetChange}
              required
            />
          </div>
          <div className="input-group">
            <span className="label">Valid Till:</span>
            <Datepicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              className="datepicker"
              customInput={<input placeholder="Enter Date" className="input-field" required/>}
              dayClassName={date => date.getDate() === (selectedDate?.getDate() || 0) ? 'selected-date' : ''}
            />
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="submit-button"
              disabled={!budgetAmount || !selectedDate}
            >
              Submit
            </button>
            <button type="button" onClick={handleReset} className="reset-button">
              Reset Budget
            </button>
          </div>
        </form>
      </div>
      <div className='container'>
        <h2>Budget Overview</h2>
        <PieChart spendAmount={spendAmount} remainingAmount={remainingAmount} />
      </div>
    </>
  );
}
=======
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center", color: "#131921" }}>📊 Set Your Monthly Budget</h2>

        <div className="input-group">
          <span className="label">Amount (₹):</span>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 5000"
            value={budgetAmount}
            onChange={handleBudgetChange}
            required
          />
        </div>

        <div className="input-group">
          <span className="label">Valid Till:</span>
          <Datepicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            className="datepicker"
            placeholderText="Select Date"
            required
            customInput={<input className="input-field" required />}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="submit-button"
            disabled={!budgetAmount || !selectedDate}
          >
            Save Budget
          </button>
          <button type="button" onClick={handleReset} className="reset-button">
            Reset
          </button>
        </div>

        {message && <p style={{ marginTop: 15, color: "#2a6d2e", fontWeight: "bold" }}>{message}</p>}
      </form>

      <div style={{ marginTop: "30px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>💡 Budget Overview</h3>
        <PieChart spendAmount={spendAmount} remainingAmount={remainingAmount} />

        <ul style={{ listStyle: "none", padding: 0, textAlign: "center", marginTop: 20 }}>
          <li><strong>Spent:</strong> ₹{spendAmount}</li>
          <li><strong>Remaining:</strong> ₹{remainingAmount}</li>
          <li><strong>Total Budget:</strong> ₹{parseInt(spendAmount) + parseInt(remainingAmount)}</li>
        </ul>
      </div>
    </div>
  );
};
>>>>>>> origin/main

export default Budget;
