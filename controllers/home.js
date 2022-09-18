exports.getHomePage = (req, res, next) => {
  res.render("page/home", {
    path: "/homePage",
    pageTitle: "Home Page",
    // isAuthenticated: false,
  });
};
