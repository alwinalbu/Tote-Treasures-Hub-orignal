const exceljs = require('exceljs');

module.exports = {
  downloadExcel: (req, res, orders, startDate, endDate, totalSales) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add header row
    worksheet.addRow(['Email', 'Order ID', 'Date', 'Total Amount', 'Payment Method']);

    // Add data rows
    orders.forEach(order => {
      worksheet.addRow([
        order.UserId.Email,  
        order._id.toString(), 
        order.OrderDate.toLocaleDateString(),
        order.TotalPrice.toFixed(2),
        order.PaymentMethod,
      ]);
    });
    

    
    worksheet.addRow(['', '', '', 'Total Sales:', totalSales[0].totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`);

    workbook.xlsx.writeBuffer().then(buffer => {
      res.send(buffer);
    });
  },
};


function formatDate(date) {
  return date.toLocaleDateString('en-US').replace(/[/:]/g, '-');
}
