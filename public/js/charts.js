
updateSalesGraph("day");

document.getElementById("byDayOption").addEventListener("click",function(){
    document.getElementById("timeIntervalDropdown").textContent="By Day";
    updateSalesGraph("day");
});

document.getElementById("byMonthOption").addEventListener("click",function(){
    document.getElementById("timeIntervalDropdown").textContent='By Month'
    updateSalesGraph('month')
});

document.getElementById("byYearOption").addEventListener("click",function(){
    document.getElementById("timeIntervalDropdown").textContent='By Year'
    updateSalesGraph('year')
});


async function fetchSalesData(timeInterval) {
    let endpoint;

    switch (timeInterval) {
        case "day":
            endpoint = "/admin/count-orders-by-day";
            break;
        case "month":
            endpoint = "/admin/count-orders-by-month";
            break;
        case "year":
            endpoint = "/admin/count-orders-by-year";
            break;
        default:
            console.error("Invalid time interval");
            return false;
    }

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// async function updateSalesGraph(timeInterval) {
//     const salesData = await fetchSalesData(timeInterval);
//     console.log(salesData, "hereee");

    
//     const Amount = document.getElementById("salesGraphAmount").getContext("2d");
//     const Count = document.getElementById("salesGraphCount").getContext("2d");

    
//     if (window.myChart1) {
//         window.myChart1.destroy();
//     }
//     if (window.myChart2) {
//         window.myChart2.destroy();
//     }
//     const barColors = ["red", "green","blue","orange","brown"]

//     window.myChart1 = new Chart(Amount, {
//         type: "bar",
//         data: {
//             labels: salesData.labelsByCount,
//             datasets: [
//                 {
//                     label: "Sales",
//                     data: salesData.dataByCount,
//                     backgroundColor: "green",
//                     borderColor: "rgba(0, 0, 0, 0)",
//                     borderWidth: 3,
//                 },
//             ],
//         },
//         options: {
//             scales: {
//                 x: [{
//                     grid: {
//                         display: true
//                     }
//                 }],
//                 y: [{
//                     beginAtZero: true,
//                     maxTicksLimit: 5
//                 }]
//             }
//         },
//     });
//     window.myChart2 = new Chart(Count, {
//         type: "bar",
//         data: {
//             labels: salesData.labelsByAmount,
//             datasets: [
//                 {
//                     label: "Sales",
//                     data: salesData.dataByAmount,
//                     backgroundColor: "blue",
//                     borderColor: "rgba(0, 0, 0, 0)",
//                     borderWidth: 3,
//                 },
//             ],
//         },
//         options: {
//             scales: {
//                 x: [{
//                     grid: {
//                         display: true
//                     }
//                 }],
//                 y: [{
//                     beginAtZero: true,
//                     maxTicksLimit: 5
//                 }]
//             }
//         },
//     });

// }

async function updateSalesGraph(timeInterval) {
    const salesData = await fetchSalesData(timeInterval);
    console.log(salesData, "hereee");

    // Get the canvas elements
    const pieChartCanvas = document.getElementById("pieSalesGraph").getContext("2d");
    const lineChartCanvas = document.getElementById("lineSalesGraph").getContext("2d");

    // If charts already exist, destroy them
    if (window.myPieChart) {
        window.myPieChart.destroy();
    }
    if (window.myLineChart) {
        window.myLineChart.destroy();
    }

    const pieColors = ["red", "green", "blue", "orange", "brown"];
    const lineColor = "green";

    window.myPieChart = new Chart(pieChartCanvas, {
        type: "pie",
        data: {
            labels: salesData.labelsByAmount,
            datasets: [
                {
                    label: "Sales",
                    data: salesData.dataByAmount,
                    backgroundColor: pieColors,
                    borderColor: "white",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });

    window.myLineChart = new Chart(lineChartCanvas, {
        type: "line",
        data: {
            labels: salesData.labelsByCount,
            datasets: [
                {
                    label: "Sales",
                    data: salesData.dataByCount,
                    backgroundColor: lineColor,
                    borderColor: lineColor,
                    fill: false,
                    borderWidth: 3,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: [{
                    grid: {
                        display: true,
                    },
                }],
                y: [{
                    beginAtZero: true,
                    maxTicksLimit: 5,
                }],
            },
        },
    });
}
