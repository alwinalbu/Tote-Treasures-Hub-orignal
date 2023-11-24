const easyinvoice = require('easyinvoice');
const fs = require("fs");
const path = require("path");
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);

module.exports = {
    order: async (order,status,paymentMethod) => {

        console.log('status for download is........ ',status);
        console.log('payment for download is ',paymentMethod);
      // console.log(order, "utitlity");
    var data = {
              
              "customize": {
                  //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
              },
  
              "images": {
                  // "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"
                  "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'logo.png'), 'base64'),
                  // "background": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'background', 'your_background.png'), 'base64')
                  // "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"
  
              },
              "sender": {
                  "company": "ToteTreasures Hub",
                  "address": "HiLITE Business Park",
                  "zip": "673014",
                  "city": "Calicut",
                  "country": "Kerala"
              },
              "client": {
                  "company": order.Address.Name,
                  "address": order.Address.Address,
                  "zip":order.Address.Pincode ,
                //   "zip": order.ShippedAddress.Pincode,
                  "city": order.Address.City,
                  "state":order.Address.State,
                  "Mob No":order.Address.Mobile,
                //   "state": order.ShippedAddress.State,
                //   "Mob No": order.ShippedAddress.Mobaile
              },
              "information": {
                "number": order._id,
                "payment-type": paymentMethod,
                "date": order.OrderDate.toLocaleDateString(),
                "status": status
            },
            
              "products": order.Items.map((product) => ({
                  "quantity": product.Quantity,
                  "description": product.ProductId.ProductName, 
                  "tax-rate": 0,
                  "price": product.ProductId.DiscountAmount
              })),
  
              "bottom-notice": "Thank You For Your Purchase",
              "settings": {
                  "currency": "INR",
                  "tax-notation": "vat",
                  "currency": "INR",
                  "tax-notation": "GST",
                  "margin-top": 50,
                  "margin-right": 50,
                  "margin-left": 50,
                  "margin-bottom": 25
              },
  
          
          "translate": {
             
          }
      }
  
  
        // Create a Promise to handle the asynchronous file writing
        return new Promise(async (resolve, reject) => {
          try {
              const result = await easyinvoice.createInvoice(data);
  
  
              const filePath = path.join(__dirname, '..', 'public', 'pdf', `${order._id}.pdf`);
              await writeFileAsync(filePath, result.pdf, 'base64');
  
              resolve(filePath);
   } catch (error) {
              console.log(error)
              reject(error);
          }
      });
      }
  };