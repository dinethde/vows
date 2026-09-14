/**
 * The 22-photograph pool backing the gallery (DESIGN.md §3.5).
 * Generated from scripts/photos.manifest.json — edit that, then run
 * `node scripts/prepare-photos.mjs` and regenerate this file.
 */

export type PhotoOrientation = "portrait" | "landscape" | "square";

export type Photo = {
  id: string;
  orientation: PhotoOrientation;
  alt: string;
  credit: { author: string; url: string };
};

/** Intrinsic 1x size of each pool, in CSS pixels. 2x files are double. */
export const photoSizes: Record<PhotoOrientation, { w: number; h: number }> = {
  portrait: { w: 160, h: 210 },
  landscape: { w: 230, h: 150 },
  square: { w: 200, h: 200 },
};

export const photos = {
  p1: {
    id: "p1",
    orientation: "portrait",
    alt: "A bride and groom kissing in a field of tall grass at golden hour",
    credit: {
      author: "Jennifer Kalenberg",
      url: "https://unsplash.com/photos/a-bride-and-groom-kissing-in-a-field-of-tall-grass-LbKBBeYUtAs",
    },
  },
  p2: {
    id: "p2",
    orientation: "portrait",
    alt: "A couple embracing at sunset, blurred by movement, with a bright sun flare across the frame",
    credit: {
      author: "Alexander Mass",
      url: "https://unsplash.com/photos/blurred-couple-embracing-at-sunset-with-bright-sun-flare-3R3dEophIys",
    },
  },
  p3: {
    id: "p3",
    orientation: "portrait",
    alt: "A bride in a full wedding gown, photographed in black and white",
    credit: {
      author: "Phakphoom Srinorajan",
      url: "https://unsplash.com/photos/grayscale-photo-of-woman-in-wedding-gown-0gVEoi52d-E",
    },
  },
  p4: {
    id: "p4",
    orientation: "portrait",
    alt: "A bride and groom together, photographed in black and white",
    credit: {
      author: "Ellie Cooper",
      url: "https://unsplash.com/photos/a-black-and-white-photo-of-a-bride-and-groom-2s8s3GDSUys",
    },
  },
  p5: {
    id: "p5",
    orientation: "portrait",
    alt: "A groom and bride leaning in, a moment before they kiss, in daylight",
    credit: {
      author: "Nathan Dumlao",
      url: "https://unsplash.com/photos/groom-and-bridge-about-to-kiss-during-daytime-7baHM9rEYUw",
    },
  },
  p6: {
    id: "p6",
    orientation: "portrait",
    alt: "A bride seen through a white veil drawn over her face",
    credit: {
      author: "Jonathan Borba",
      url: "https://unsplash.com/photos/woman-wearing-white-wedding-veil-__kW-2LA1cM",
    },
  },
  p7: {
    id: "p7",
    orientation: "portrait",
    alt: "A bride and groom walking hand in hand as the sun goes down",
    credit: {
      author: "Jennifer Kalenberg",
      url: "https://unsplash.com/photos/bride-and-groom-walking-hand-in-hand-at-sunset-vgHeSVTcWok",
    },
  },
  l1: {
    id: "l1",
    orientation: "landscape",
    alt: "A lit candelabra standing in a dark reception room",
    credit: {
      author: "Steven Van Elk",
      url: "https://unsplash.com/photos/a-candelabra-with-candles-lit-in-a-dark-room-rq3PNyA2Pjc",
    },
  },
  l2: {
    id: "l2",
    orientation: "landscape",
    alt: "A couple dancing together, caught mid-turn",
    credit: {
      author: "Alvin Mahmudov",
      url: "https://unsplash.com/photos/man-and-woman-dancing-wearing-casual-dresses-NSVJAAXOYHs",
    },
  },
  l3: {
    id: "l3",
    orientation: "landscape",
    alt: "A bride and groom dancing inside a cloud of smoke on a dark floor",
    credit: {
      author: "Liviu Boldis",
      url: "https://unsplash.com/photos/a-bride-and-groom-dancing-in-a-cloud-of-smoke-ZXO5V0qZJGU",
    },
  },
  l4: {
    id: "l4",
    orientation: "landscape",
    alt: "A bride and groom photographed in black and white",
    credit: {
      author: "Hisu lee",
      url: "https://unsplash.com/photos/grayscale-shot-of-bride-and-groom-FTW8ADj5igs",
    },
  },
  l5: {
    id: "l5",
    orientation: "landscape",
    alt: "A bride and groom dancing at night while petals fall around them",
    credit: {
      author: "Fotógrafo Samuel Cruz",
      url: "https://unsplash.com/photos/bride-and-groom-dancing-under-falling-petals-at-night--95OgwSlkMQ",
    },
  },
  l6: {
    id: "l6",
    orientation: "landscape",
    alt: "A newly married couple standing outside a church",
    credit: {
      author: "Jonathan Borba",
      url: "https://unsplash.com/photos/wedded-couple-outside-church-XDpOvTZhDTg",
    },
  },
  l7: {
    id: "l7",
    orientation: "landscape",
    alt: "A long reception table laid with flowers and candles",
    credit: {
      author: "Jennifer Kalenberg",
      url: "https://unsplash.com/photos/a-beautifully-decorated-long-table-set-for-a-wedding-reception-3nx3qOwSSLs",
    },
  },
  s1: {
    id: "s1",
    orientation: "square",
    alt: "A bride and groom embracing, her bouquet held between them",
    credit: {
      author: "Pedro Pulido",
      url: "https://unsplash.com/photos/bride-and-groom-embracing-with-a-bouquet-HqvmKDf1g70",
    },
  },
  s2: {
    id: "s2",
    orientation: "square",
    alt: "A bride and groom in silhouette against a low sun",
    credit: {
      author: "Cybèle and Bevan",
      url: "https://unsplash.com/photos/a-bride-and-groom-are-silhouetted-against-a-sunset-8AJvXLsFw7g",
    },
  },
  s3: {
    id: "s3",
    orientation: "square",
    alt: "A couple standing by a window, photographed in black and white",
    credit: {
      author: "Daniel Gutko",
      url: "https://unsplash.com/photos/grayscale-photo-of-man-and-woman-standing-near-window-yeevxscifOk",
    },
  },
  s4: {
    id: "s4",
    orientation: "square",
    alt: "A bride and groom sitting on a rock, holding hands",
    credit: {
      author: "Nathan Dumlao",
      url: "https://unsplash.com/photos/bride-and-groom-sitting-on-rock-holding-hands-MA6dgLQNV0I",
    },
  },
  s5: {
    id: "s5",
    orientation: "square",
    alt: "A couple kissing, close in the frame",
    credit: {
      author: "Filip Rankovic Grobgaard",
      url: "https://unsplash.com/photos/a-man-and-woman-kissing-xl6ldDXEZ6g",
    },
  },
  s6: {
    id: "s6",
    orientation: "square",
    alt: "A couple beside their wedding cake, a balloon drifting above it",
    credit: {
      author: "Annie Spratt",
      url: "https://unsplash.com/photos/couple-with-wedding-cake-and-balloon-RmVUEySzY44",
    },
  },
  s7: {
    id: "s7",
    orientation: "square",
    alt: "Newlyweds walking out of a building as petals fall over them",
    credit: {
      author: "Stefano Tanasi",
      url: "https://unsplash.com/photos/newlyweds-walking-out-of-building-with-petals-falling-397Lvnvh7LU",
    },
  },
  s8: {
    id: "s8",
    orientation: "square",
    alt: "Groomsmen lifting the groom into the air in celebration",
    credit: {
      author: "Pedro Pulido",
      url: "https://unsplash.com/photos/groomsmen-lift-up-a-man-in-celebration-KPkFYSuA0OA",
    },
  },
} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;
