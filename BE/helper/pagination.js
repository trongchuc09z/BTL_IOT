module.exports = (objectPagination, currentPage, pageSize, countProducts) => {
  if (countProducts == null) countProducts = 0;
  objectPagination.current_page = currentPage || 1;
  objectPagination.page_size = pageSize || objectPagination.limitedItem || 10;
  objectPagination.total_page = Math.ceil(
    countProducts / objectPagination.page_size
  );
  objectPagination.total_data = countProducts;
  objectPagination.skip =
    (objectPagination.current_page - 1) * objectPagination.page_size;

  return objectPagination;
};
