exports.getDate = function() {

    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let nameOfDay = today.toLocaleString('en-us', options);
    return nameOfDay;
}
exports.isWeekend = function() {
    let today = new Date();
    return (today.getDay() === 6 || today.getDay() === 0)
}