// const fs = require('fs');
// const pdf = require('html-pdf');
// const ejs = require('ejs');

// module.exports = {
//   downloadPdf: (req, res, orders, startDate, endDate, totalSales) => {
//     const formattedStartDate = formatDate(startDate);
//     const formattedEndDate = formatDate(endDate);
//     const template = fs.readFileSync('utility/html.ejs', 'utf-8');

//     const html = ejs.render(template, { orders, startDate, endDate, totalSales });

//     const pdfOptions = {
//       format: 'Letter',
//       orientation: 'portrait',
//     };

//     pdf.create(html, pdfOptions).toFile(`public/salespdf/sales-report-${formattedStartDate}-${formattedEndDate}.pdf`, (err, response) => {
//       if (err) return console.log(err);
      
//       res.status(200).download(response.filename);
//     });
//   },
// };

// function formatDate(date) {
//     return date.toLocaleDateString('en-US').replace(/[/:]/g, '-');
// }
const fs = require('fs');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

module.exports = {
  downloadPdf: async (req, res, orders, startDate, endDate, totalSales) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const template = fs.readFileSync('utility/html.ejs', 'utf-8');

    const html = ejs.render(template, { orders, startDate, endDate, totalSales });

    // Launch Puppeteer with headless: "new" option
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Set the content of the page with the rendered HTML
    await page.setContent(html);

    const pdfOptions = {
      path: `public/salespdf/sales-report-${formattedStartDate}-${formattedEndDate}.pdf`,
      format: 'Letter',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    };

    // Generate PDF from the page content
    await page.pdf(pdfOptions);

    // Close the browser
    await browser.close();

    // Send the PDF as a response
    res.status(200).download(pdfOptions.path);
  },
};

function formatDate(date) {
  return date.toLocaleDateString('en-US').replace(/[/:]/g, '-');
}

