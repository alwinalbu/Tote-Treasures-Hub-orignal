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


