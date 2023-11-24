document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded, populating tables");
   

    showDailyTab();

    // Add click event listeners to other tabs
    document.getElementById('monthly-tab').addEventListener('click', showMonthlyTab);
    document.getElementById('yearly-tab').addEventListener('click', showYearlyTab);
    document.getElementById('daily-tab').addEventListener('click', showDailyTab);
    

});

async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Server response after fetching data from ${endpoint}:`, data);

        let productsArray;

        if (endpoint === '/admin/daily') {
            productsArray = data.bestSellingProducts || [];
        } else if (endpoint === '/admin/monthly') {
            productsArray = data.monthlyBestSellingProducts || [];
        } else if (endpoint === '/admin/yearly') {
            productsArray = data.yearlyBestSellingProducts || [];
        } else {
            
            productsArray = data.defaultProducts || [];
        }

        return productsArray;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return [];
    }
}

function populateTable(endpoint, tableId) {
    console.log(`inside the function for table: ${tableId}`);
    const tableBody = document.getElementById(tableId);

    fetchData(endpoint)
        .then(products => populateTableRows(products, tableBody))
        .catch(error => console.error(`Error fetching data for table ${tableId}:`, error));
}

function populateTableRows(products, tableBody) {
    console.log(`Products before table creating:`, products);

    // Check if products array is empty
    if (products && products.length > 0) {
        tableBody.innerHTML = ''; // Clear existing content
        products.forEach(product => {
           
            const row = `<tr>
                <td><img src="/uploads/${product.images[0]}" alt="Product Image" style="max-width: 50px;"></td>
                <td>${product.ProductName}</td>
                <td>${product.Price}</td>
                <td>${product.Status}</td>
                <td>${product.TotalSold}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } else {
        console.log(`No products available for the specified date range in the table.`);
    }
}

function showDailyTab() {
   
    var dailyTab = new bootstrap.Tab(document.getElementById('daily-tab'));
    dailyTab.show();

    
    populateTable('/admin/daily', 'dailyTable');
}

function showMonthlyTab() {
    
    var monthlyTab = new bootstrap.Tab(document.getElementById('monthly-tab'));
    monthlyTab.show();

    populateTable('/admin/monthly', 'monthlyTable');
}

function showYearlyTab() {
   
    var yearlyTab = new bootstrap.Tab(document.getElementById('yearly-tab'));
    yearlyTab.show();

    populateTable('/admin/yearly', 'yearlyTable');
}
