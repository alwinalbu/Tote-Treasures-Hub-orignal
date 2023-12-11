const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');

module.exports = {
  downloadPdf: (req, res, orders, startDate, endDate, totalSales) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const template = fs.readFileSync('utility/html.ejs', 'utf-8');

    const html = ejs.render(template, { orders, startDate, endDate, totalSales });

    const pdfOptions = {
      format: 'Letter',
      orientation: 'portrait',
    };

    pdf.create(html, pdfOptions).toFile(`public/salespdf/sales-report-${formattedStartDate}-${formattedEndDate}.pdf`, (err, response) => {
      if (err) return console.log(err);
      
      res.status(200).download(response.filename);
    });
  },
};

function formatDate(date) {
    return date.toLocaleDateString('en-US').replace(/[/:]/g, '-');
}
