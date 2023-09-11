const stripe = Stripe(
  'pk_test_51Nbjr6Ku7weUE6lk1daz3q8gRwUW7R5pWW3U9nENPXYdcZtHCvB8hjxDPKTDbUzREKlSUW7GuTW88LUmec54Gb1k00AYdRGFEg'
);
const orderBtn = document.querySelector('#orderBtn');
orderBtn.addEventListener('click', () => {
  const sessionId = document.querySelector('#sessionId').value;
  stripe.redirectToCheckout({ sessionId: sessionId });
});
