const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost", // host for connection
  database: "finance_management", // database from which we want to connect our node application
  user: "root", // username of the mysql connection
  password: "C04df5@3c", // password of the mysql connection
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
  } else {
    console.log("Connected to MySQL successfully");
  }
});
//Get
app.get("/api/records", (req, res) => {
  const query = "SELECT * FROM monthly_records";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
//POST
app.post("/api/records", (req, res) => {
  const { type, payment_channel, amount, remark, data_entry_by, entry_date } =
    req.body;

  const query =
    "INSERT INTO monthly_records (type, payment_channel, amount, remark, data_entry_by, entry_date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [type, payment_channel, amount, remark, data_entry_by, entry_date],
    (err, results) => {
      if (err) throw err;
      res.json({
        message: "Record added successfully.",
        id: results.insertId,
      });
    }
  );
});
//POST UPDATED
app.put("/api/records/:id", (req, res) => {
  const { id } = req.params;
  const { type, payment_channel, amount, remark, data_entry_by, entry_date } =
    req.body;

  if (!id) {
    return res.status(400).json({ error: "Record ID is required" });
  }

  const query = `
      UPDATE monthly_records
      SET
        type = COALESCE(?, type),
        payment_channel = COALESCE(?, payment_channel),
        amount = COALESCE(?, amount),
        remark = COALESCE(?, remark),
        data_entry_by = COALESCE(?, data_entry_by),
        entry_date = COALESCE(?, entry_date)
      WHERE id = ?
    `;

  db.query(
    query,
    [type, payment_channel, amount, remark, data_entry_by, entry_date, id],
    (err, result) => {
      if (err) {
        console.error("Error updating record:", err.message);
        console.error("Query:", query);
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Record not found" });
      }

      res.json({ message: "Record updated successfully" });
    }
  );
});

//DELETE
app.delete("/api/records/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM monthly_records WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  });
});

app.listen(9999, () => {
  console.log(`Server running on http://localhost:9999}`);
});
