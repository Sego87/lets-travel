exports.homePage = (req, res) => { // exports allows this code to be available in another part of the application. homePage is the name that we decided for the function to be exported
    res.render('index', { title: 'Lets travel' });
}

exports.listAllHotels = (req, res) => {
    res.render('all_hotels', { title: 'All Hotels' });
}