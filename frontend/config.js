const pages = [
  {
    name: "Home",
    paths: ["/", "/index.html"],
    pagePath: "/pages/home",
    title: "MentalPanda",
    hasCss: true,
    hasJs: false,
  },
  {
    name: "Blogs",
    paths: ["/blogs"],
    pagePath: "/pages/blogs",
    hasCss: true,
    hasJs: true,
  },
  {
    name: "About",
    paths: ["/about"],
    pagePath: "/pages/about",
    hasCss: true,
    hasJs: true,
  },
  {
    name: "Conditions",
    paths: ["/conditions"],
    pagePath: "/pages/conditions",
    hasCss: true,
    hasJs: true,
  },
    {
    name: "Find",
    paths: ["/find"],
    pagePath: "/pages/find",
    hasCss: true,
    hasJs: true,
  },
  {
    name: "Chat",
    paths: ["/chat"],
    pagePath: "/pages/chat",
    title: "MentalPanda Chat",
    hasCss: false,
    hasJs: true,
  }
];

function getPageByName(name) {
  return pages.find((page) => page.name.toLowerCase() === name.toLowerCase());
}

function createNavEntry(page) {
  return {
    label: page.name,
    to: page.paths[0],
  };
}

export const CONFIG = {
  pages,
  nav: [
    createNavEntry(getPageByName("Home")),
    createNavEntry(getPageByName("Blogs")),
    createNavEntry(getPageByName("About")),
    createNavEntry(getPageByName("Conditions")),
    createNavEntry(getPageByName("Find")),
    createNavEntry(getPageByName("Chat")),
  ],
};
