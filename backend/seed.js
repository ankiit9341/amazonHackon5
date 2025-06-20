db.users.insertMany([
  {
    userId: "userA",
    name: "Chaitanya",
    email: "chaitanya@example.com",
    contact: "9876543210",
    cards: ["HDFC Credit", "ICICI Debit"],
    balance: 12000
  },
  {
    userId: "userB",
    name: "Ankit",
    email: "ankit@example.com",
    contact: "9876543211",
    cards: ["SBI Debit", "Axis Credit"],
    balance: 9000
  },
  {
    userId: "userC",
    name: "Neha",
    email: "neha@example.com",
    contact: "9876543212",
    cards: ["HDFC Debit", "SBI Credit", "ICICI Credit"],
    balance: 15000
  },
  {
    userId: "userD",
    name: "Ravi",
    email: "ravi@example.com",
    contact: "9876543213",
    cards: ["Axis Debit", "ICICI Debit"],
    balance: 7000
  },
  {
    userId: "userE",
    name: "Priya",
    email: "priya@example.com",
    contact: "9876543214",
    cards: ["HDFC Credit", "Axis Credit"],
    balance: 8000
  },
  {
    userId: "userF",
    name: "Vikram",
    email: "vikram@example.com",
    contact: "9876543215",
    cards: ["SBI Debit", "ICICI Credit"],
    balance: 11000
  },
  {
    userId: "userG",
    name: "Sneha",
    email: "sneha@example.com",
    contact: "9876543216",
    cards: ["HDFC Debit", "Axis Debit", "SBI Credit"],
    balance: 9500
  }
])
