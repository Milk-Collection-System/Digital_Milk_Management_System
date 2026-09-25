export default function Receipt({ data }) {
  return (
    <div className="receipt" id="receipt">
      <div className="receipt-title">संकलन पावती</div>
      <div className="receipt-date">{data.date} <b>{data.shift === "EVENING" ? "संध्या" : "सकाळ"}</b></div>
      <div className="receipt-line"><span>पावती क्र.</span><b>{data.receiptNumber}</b></div>
      <div className="receipt-line"><span>खाते नं.</span><b>{data.accountNumber || "—"}</b></div>
      <div className="receipt-farmer">{data.farmerName}</div>
      <div className="receipt-grid">
        <span>दूध</span><b>{data.milkType === "BUFFALO" ? "म्हैस" : "गाय"}</b>
        <span>लिटर</span><b>{Number(data.quantity).toFixed(2)}</b>
        <span>फॅट</span><b>{Number(data.fat).toFixed(1)}</b>
        <span>एसएनएफ</span><b>{Number(data.snf || 0).toFixed(1)}</b>
        <span>लॅक्टो</span><b>{data.lacto ? Number(data.lacto).toFixed(1) : "—"}</b>
      </div>
      <div className="receipt-total-row"><span>दर</span><b>₹{Number(data.rate).toFixed(2)}</b></div>
      <div className="receipt-total-row grand"><span>रक्कम</span><b>₹{Number(data.amount).toFixed(2)}</b></div>
      <div className="receipt-footer">Digital Milk Management System</div>
    </div>
  );
}