function activateArticle(button) {
  const card = button.closest(".card");
  const article = card.querySelector("#article");

  const hiders = card.querySelectorAll(".hidethis");
  const icon = button.querySelector('i');

  hiders.forEach((hider) => {
    if (hider.classList.contains("d-none")) {
      hider.classList.remove("d-none");
    } else {
      hider.classList.add("d-none");
    }
  });


    icon.classList.toggle('bi-arrows-angle-expand');
    icon.classList.toggle('bi-arrows-angle-contract');
  // TESTING 1: Article variable works
  //console.log(article.innerHTML);
  // for future use in parsing if needed
}
