function activateArticle(button) {
  const card = button.closest(".card");
  const article = card.querySelector("#article");

  const hiders = card.querySelectorAll(".hidethis");
  const icon = button.querySelector("i");

  hiders.forEach((hider) => {
    if (hider.classList.contains("d-none")) {
      hider.classList.remove("d-none");
    } else {
      hider.classList.add("d-none");
    }
  });

  icon.classList.toggle("bi-arrows-angle-expand");
  icon.classList.toggle("bi-arrows-angle-contract");
  // TESTING 1: Article variable works
  //console.log(article.innerHTML);
  // for future use in parsing if needed
}
window.activateArticle = activateArticle;

const BLOGS = ["10-ways-to-deal-with-anxiety", "depression-assistance", "first-article"];

const blogTemplate = document.getElementById("blogTemplate").innerHTML;
const blogContainer = document.getElementById("blogContainer");

// function MDtoObject(md) {
//   const lines = md.split("\n");

//   // find ### body

//   const sections = {};

//   let currentSection = "";

//   for(let i=0; i<lines.length; i++) {

//     const line = lines[i];
//     if(line.startsWith("### ")) {
//       currentSection = line.replace("### ", "");
//       sections[currentSection] = "";
//     } else {
//       sections[currentSection] += line + "\n";
//     }

//   }

//   return {
//     text,
//     author,
//     date
//   };
// }

function MDtoObject(md) {
  const footerMatch = md.match(/Footer:\s*(.*)/);
  const titleMatch = md.match(/Title:\s*(.*)/);
  const authormatch = md.match(/Author:\s*(.*)/);
  const author = authormatch ? authormatch[1].trim() : "Bean";
  const date = md.match(/Date:\s*(.*)/)[1].trim();

  const bodyMatch = md.match(/Body:\s*([\s\S]*)/);
  const body = bodyMatch ? bodyMatch[1].trim() : "";

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    text: slimdownJs.render(body),
    author,
    date,
    footer: footerMatch ? footerMatch[1].trim() : null
  };
}


function moveIntoFocus() {
  // get ?id=<id>
  const targetId = window.location.searchParams.get("id");
  if (targetId) {
    const target = document.querySelector(`[data-${targetId}]`);
    console.log(target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
}


async function loadBlogs() {
  const blogData = {};

  // get the blog data
  for (let i = 0; i < BLOGS.length; i++) {
    const path = `pages/blogs/articles/${BLOGS[i]}.md`;
    const response = await fetch(path);
    const text = await response.text();
    blogData[BLOGS[i]] = text;
  }

  // parse blog data

  for (const key in blogData) {
    // const parsed = {
    //   title: key,
    //   text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    //   author: "John Doe",
    //   date: "January 1st, 2023",
    //   footer: "footer garbage",
    // } // TODO: replace with the actual parsed Object

    const parsedInside = MDtoObject(blogData[key]);
    const parsed = {
      title: parsedInside.title ?? key.charAt(0).toUpperCase() + key.slice(1),
      text: parsedInside.text ?? "Unknown",
      author: parsedInside.author ?? "Unknown",
      date: parsedInside.date ?? "Unknown",
      footer: parsedInside.footer ?? `${key}.md`
    };
    console.log(parsed);

    const newCard = blogTemplate.replace("[[title]]", parsed.title);
    const newCard2 = newCard.replace("[[text]]", parsed.text);
    const newCard3 = newCard2.replace("[[author]]", parsed.author);
    const newCard4 = newCard3.replace("[[date]]", parsed.date);
    const newCard5 = newCard4.replace("[[footer]]", parsed.footer);

    const newCard6 = newCard5.replace('data-[[blog-id]]', `data-#${key}`);
    blogContainer.innerHTML += newCard6;
  }

  // moveIntoFocus();
}

loadBlogs();

