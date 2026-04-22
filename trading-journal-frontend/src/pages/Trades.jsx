import { useState, useEffect } from "react";


function Trades() {
  const [form, setForm] = useState({
    trade_type: "Long",
    date: "",
    ticker: "",
    stock_name: "",
    quantity: "",
    entry_price: "",
    stop_loss: "",
    target_price: "",
    outcome: "Successful",
    strategy_id: 1
  });

  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/strategies")
      .then(res => res.json())
      .then(setStrategies);
  }, []);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:3001/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        alert("Trade added successfully");
      });
  };

  return (
  <div className="container-fluid">

    <h2 className="fw-bold mb-4">Trades</h2>

    {/* OUTER CARD */}
<div className="card shadow-sm border-0 p-4">

  <h5 className="fw-bold mb-3 text-start">
    Trade Entry
  </h5>

  {/* INNER CARD (no title inside) */}
  <div className="card border-0 shadow-sm p-4">

    <form onSubmit={handleSubmit}>

    {/* SECTION 1: TRADE TYPE */}
    <div className="mb-4 d-flex align-items-center gap-4">
      <label className="fw-semibold" style={{ width: "140px" }}>
        Trade Type
      </label>

      <div className="d-flex gap-3">
        <label>
  <input
    type="radio"
    name="trade_type"
    value="Long"
    checked={form.trade_type === "Long"}
    onChange={handleChange}
  /> Long
</label>

<label>
  <input
    type="radio"
    name="trade_type"
    value="Short"
    checked={form.trade_type === "Short"}
    onChange={handleChange}
  /> Short
</label>
      </div>
    </div>

    <hr />

    {/* SECTION 2: INPUT FIELDS */}
    <div className="row g-3">

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Date</label>
        <input type="date" className="form-control" name="date" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Quantity</label>
        <input type="number" className="form-control" name="quantity" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Ticker</label>
        <input className="form-control" name="ticker" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Stock Name</label>
        <input className="form-control" name="stock_name" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Stop Loss</label>
        <input type="number" className="form-control" name="stop_loss" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Entry Price</label>
        <input type="number" className="form-control" name="entry_price" onChange={handleChange} />
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Target Price</label>
        <input type="number" className="form-control" name="target_price" onChange={handleChange} />
      </div>

    </div>

    <hr />

    {/* SECTION 3: OUTCOME + STRATEGY + BUTTON */}
    <div className="row g-3 align-items-center">

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Outcome</label>

        <div className="d-flex gap-3">
         <label>
  <input
    type="radio"
    name="outcome"
    value="Successful"
    checked={form.outcome === "Successful"}
    onChange={handleChange}
  /> Successful
</label>

<label>
  <input
    type="radio"
    name="outcome"
    value="Unsuccessful"
    checked={form.outcome === "Unsuccessful"}
    onChange={handleChange}
  /> Unsuccessful
</label>
        </div>
      </div>

      <div className="col-md-6 d-flex align-items-center">
        <label style={{ width: "140px" }}>Strategy</label>

        <select
  className="form-select"
  name="strategy_id"
  onChange={handleChange}
>
  <option value="">Select Strategy</option>

  {strategies.map((strategy) => (
    <option key={strategy.id} value={strategy.id}>
      {strategy.name}
    </option>
  ))}

</select>
      </div>

      {/* Submit Button */}
      <div className="col-12 text-center mt-3">
        <button className="btn btn-success px-4">
          Submit Trade
        </button>
      </div>

    </div>

  </form>

    </div>
</div>
  </div>
);
}

export default Trades;