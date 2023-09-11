exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    title: '404 Page Not Found',
    page: '404',
    isAuthenticated: req.session.isAuthenticated,
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    title: '500 Something went wrong!',
    page: '500',
  });
};
