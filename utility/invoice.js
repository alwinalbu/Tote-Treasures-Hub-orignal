const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);

module.exports = {
  order: async (order, status, paymentMethod, couponCode, discountAmount) => {
    console.log('status for download is........ ', status);
    console.log('payment for download is ', paymentMethod);

    var data = {
      customize: {
        // "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        logo: fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'logo.png'), 'base64'),
      },
      sender: {
        company: 'ToteTreasures Hub',
        address: 'HiLITE Business Park',
        zip: '673014',
        city: 'Calicut',
        country: 'Kerala',
        website: 'totetreasureshub.shop',
      },
      client: {
        company: order.Address.Name,
        address: order.Address.Address,
        zip: order.Address.Pincode,
        city: order.Address.City,
        state: order.Address.State,
        mobNo: order.Address.Mobile,
      },
      information: {
        number: order._id,
        paymentType: paymentMethod,
        date: order.OrderDate.toLocaleDateString(),
        status: status,
      },
      products: order.Items.map((product) => ({
        quantity: product.Quantity,
        description: product.ProductId.ProductName,
        'tax-rate': 0,
        price: product.ProductId.offer ? product.ProductId.offerPrice : product.ProductId.DiscountAmount,
        'coupon-code': couponCode,
        'discount-amount': discountAmount,
      })),
      'bottom-notice': 'Thank You For Your Purchase',
      settings: {
        currency: 'INR',
        'tax-notation': 'GST',
        'margin-top': 50,
        'margin-right': 50,
        'margin-left': 50,
        'margin-bottom': 25,
      },
      translate: {},
    };

    // Create a Promise to handle the asynchronous file writing
    return new Promise(async (resolve, reject) => {
      try {
        const result = await easyinvoice.createInvoice(data);

        const filePath = path.join(__dirname, '..', 'public', 'pdf', `${order._id}.pdf`);
        await writeFileAsync(filePath, result.pdf, 'base64');

        resolve(filePath);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
};
