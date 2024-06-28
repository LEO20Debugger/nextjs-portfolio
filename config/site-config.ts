export type GridItemLayout = "1x2" | "2x1" | "2x2" | "2x4"; // First number is width, second is height
export type GridItemType = "social" | "equipment" | "mentor" | "project";
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
    buttonSecondaryText: "2,084",
    color: "#1DA1F2",
    description:
      "Crafting unique & beautiful experiences, one line of code at a time.",
  },
  {
    layout: "1x2",
    type: "social",
    title: "Discord",
    icon: "discord",
    username: "@Brainergybyleo",
    buttonTitle: "Join",
    buttonLink: "https://discord.com",
    buttonSecondaryText: "5",
    color: "#5865F2",
  },
  {
    layout: "1x2",
    type: "social",
    title: "Github",
    icon: "github",
    username: "@Brainergybyleo",
    buttonTitle: "Follow",
    buttonSecondaryText: "5",
    buttonLink: "https://github.com/LEO20Debugger",
    color: "#070707",
  },
  {
    layout: "2x1",
    type: "project",
    title: "brainergybyleo.dev",
    icon: "github",
    color: "#070707",
    buttonLink: "https://github.com/LEO20Debugger/nextjs-portfolio",
    stars: 5,
  },
  {
    layout: "2x1",
    type: "project",
    title: "markdown(nextjs14)blog",
    icon: "github",
    stars: 2,
    color: "#070707",
    buttonLink: "https://brainergybyleo.vercel.app/",
  },
];

export const siteConfig = {
  creator: "Brainergybyleo",
  title: "Software Engineer",
  bio: "Crafting unique & beautiful experiences, one line of code at a time.",
  location: "Remote",
  locationLink:
    "https://www.google.com/maps/place/Ikeja,+Lagos/@6.5298498,3.1987083,11z/data=!3m1!4b1!4m6!3m5!1s0x103b9228fa2a3999:0xd7a8324bddbba1f0!8m2!3d6.601838!4d3.3514863!16zL20vMDJweGtx?authuser=0&entry=ttu",
  email: "leonard6oba@gmail.com",
  items: GridItems,
} as const;
