const grid = document.getElementById("productsGrid");
for (const product of window.polylookProducts) {
  const details = document.createElement("details");
  details.className = "catalog-item";
  const summary = document.createElement("summary");
  summary.textContent = product.title;
  const description = document.createElement("p");
  description.textContent = product.description;
  const list = document.createElement("ul");
  for (const point of product.points) {
    const item = document.createElement("li");
    item.textContent = point;
    list.append(item);
  }
  details.append(summary, description, list);
  grid.append(details);
}
