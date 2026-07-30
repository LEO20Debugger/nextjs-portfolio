export type GridItemLayout = "1x2" | "2x1" | "2x2" | "2x4" | "4x2"; // First number is width, second is height
export type GridItemType = "social" | "equipment" | "mentor" | "project" | "techstack";
export type EqiupmentItem = {
  title: string;
  link: string;
};

export interface GridItemInterface {
  layout: GridItemLayout;
  type: GridItemType;
  title: string;
  icon?: string;
  username?: string;
  description?: string;
  color?: string;
  buttonTitle?: string;
  buttonLink?: string;
  buttonSecondaryText?: string;
  /* Mentor */
  promotion?: string;
  price?: string;
  oldPrice?: string;
  /* Project */
  stars?: number;
  websiteLink?: string;
  /* Equipments */
  equipments?: EqiupmentItem[];
  image?: string;
}

const GridItems: GridItemInterface[] = [
  {
    layout: "2x2",
    type: "social",
    title: "Twitter",
    icon: "twitter",
    username: "@Brainergybyleo",
    buttonTitle: "Follow",
    buttonLink: "https://x.com/Brainergybyleo",
    color: "#000000",
    description:
      "Crafting unique & beautiful experiences, one line of code at a time.",
  },
  {
    layout: "1x2",
    type: "social",
    title: "LinkedIn",
    icon: "linkedin",
    username: "@brainergybyleo",
    buttonTitle: "Connect",
    buttonLink: "https://www.linkedin.com/in/brainergybyleo/",
    color: "#0A66C2",
  },
  {
    layout: "1x2",
    type: "social",
    title: "Github",
    icon: "github",
    username: "@LEO20Debugger",
    buttonTitle: "Follow",
    buttonLink: "https://github.com/LEO20Debugger",
    color: "#070707",
  },
  {
    layout: "4x2",
    type: "techstack",
    title: "Tech Stack",
  },
  {
    layout: "2x1",
    type: "project",
    title: "byte-me",
    icon: "github",
    color: "#070707",
    buttonLink: "https://github.com/LEO20Debugger/byte-me",
    description: "A developer-focused app built with Next.js.",
  },
  {
    layout: "2x1",
    type: "project",
    title: "pradisedaypass",
    icon: "github",
    color: "#070707",
    buttonLink: "https://github.com/LEO20Debugger/pradisedaypass",
    websiteLink: "https://www.paradisedaypass.com/",
    description: "Resort booking platform for day pass experiences.",
  },
  {
    layout: "2x1",
    type: "project",
    title: "felmosengineering",
    icon: "felmos",
    color: "#0F172A",
    websiteLink: "https://www.felmosengineering.com/",
    description: "Structural testing & civil engineering solutions platform.",
  },
];

export const siteConfig = {
  creator: "Leonard Chibueze Oba",
  title: "Software Engineer",
  bio: "Crafting unique & beautiful experiences, one line of code at a time.",
  location: "Remote",
  locationLink:
    "https://www.google.com/maps/place/Ikeja,+Lagos/@6.5298498,3.1987083,11z/data=!3m1!4b1!4m6!3m5!1s0x103b9228fa2a3999:0xd7a8324bddbba1f0!8m2!3d6.601838!4d3.3514863!16zL20vMDJweGtx?authuser=0&entry=ttu",
  email: "leonard6oba@gmail.com",
  resumeUrl: "/resume.pdf",
  items: GridItems,
} as const;
