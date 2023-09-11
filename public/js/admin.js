const deleteProduct = async function (btn) {
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const prodId = btn.parentNode.querySelector('[name=id]').value;

  const productElement = btn.closest('.product-element');
  try {
    const deleteStatus = await fetch(`/admin/product/${prodId}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrf,
      },
    });
    const results = await deleteStatus.json();
    productElement.parentNode.removeChild(productElement);
  } catch (err) {
    console.log(err);
  }
};
