/**
 * Edit all wedding site content here.
 */

export const wedding = {
  couple: {
    names: "Taylor & Jayden",
    lastName: "Holdsworth",
  },

  date: {
    iso: "2026-08-05T00:00:00",
    display: "August 5, 2026",
  },

  videoUrl: "",

  nav: [
    {
      slug: "info",
      label: "Info",
      icon: "calendar",
      title: "Wedding Info",
      body: [
        "Ceremony — 4:00 PM · St. Mary's Chapel",
        "Reception — 6:00 PM · The Grand Estate",
        "Dress code — Cocktail attire",
        "RSVP by July 1, 2026",
      ],
    },
    {
      slug: "story",
      label: "Our story",
      icon: "heart",
      title: "Our Story",
      body: [
        "We met on a rainy afternoon in a tiny coffee shop. A shared umbrella and a long conversation later, something special had begun.",
        "Five years later, we're ready to say yes to forever — and we can't wait to celebrate with you.",
      ],
    },
    {
      slug: "photos",
      label: "Photos",
      icon: "photo",
      title: "Photos",
      body: [
        "Engagement photos and wedding gallery will live here.",
        "Add your image URLs in src/config/wedding.js when ready.",
      ],
    },
    {
      slug: "registry",
      label: "Registry",
      icon: "gift",
      title: "Registry",
      body: [
        "Your presence is the greatest gift.",
        "Registry links can be added in src/config/wedding.js.",
      ],
    },
  ],

  banner: {
    eyebrow: "See you in",
    suffix: "days",
  },

  photoAlbums: [
    { slug: "engagement", label: "Engagement", images: [] },
    { slug: "bridals", label: "Bridals", images: [] },
    { slug: "templo", label: "Templo", images: [] },
    { slug: "ring-ceremony", label: "Ring Ceremony", images: [] },
    { slug: "luncheon", label: "Luncheon", images: [] },
    { slug: "reception", label: "Reception", images: [] },
    { slug: "wedding-video", label: "Wedding Video", images: [] },
  ],
};

export function getNavBySlug(slug) {
  return wedding.nav.find((item) => item.slug === slug);
}

export function getPhotoAlbum(slug) {
  return wedding.photoAlbums.find((item) => item.slug === slug);
}
