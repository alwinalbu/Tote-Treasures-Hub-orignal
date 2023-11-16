
document.addEventListener('DOMContentLoaded', populateDailyTable);


async function fetchDailyData() {
    console.log("inside the daily function");
    return fetch('/admin/daily') 
        .then(response => response.json())
        .then(data => data.products); 
}


function populateDailyTable() {
    console.log("inside the daily function to get id ");
    const dailyTableBody = document.getElementById('dailyTable');

    fetchDailyData()
        .then(products => {
            products.forEach(product => {
                // Populate the table row with product data
                const row = `<tr>
                    <td><img src="/uploads/${product.images[0]}" alt="Product Image" style="max-width: 50px;"></td>
                    <td>${product.ProductName}</td>
                    <td>${product.Price}</td>
                    <td>${product.Status}</td>
                    <td>${product.Category.Name}</td>
                </tr>`;
                dailyTableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching daily data:', error));
}



