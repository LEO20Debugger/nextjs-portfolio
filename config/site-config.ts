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
    username: "@LBrainergybyleo",
    buttonTitle: "Follow",
    buttonSecondaryText: "5",
    buttonLink: "https://github.com/LEO20Debugger",
    color: "#070707",
  },
  {
    layout: "2x1",
    type: "project",
    title: "Porfolio",
    icon: "github",
    color: "#070707",
    buttonLink: "https://github.com/batuhanbilginn/makr-ai",
    stars: 5,
  },
  {
    layout: "2x1",
    type: "project",
    title: "Blog",
    icon: "github",
    stars: 2,
    color: "#070707",
    buttonLink: "https://github.com",
  },
];

export const siteConfig = {
  creator: "Brainergybyleo",
  title: "Software Engineer",
  bio: "Crafting unique & beautiful experiences, one line of code at a time.",
  location: "Remote",
  locationLink:
    "https://www.google.com/maps/place/Kad%C4%B1k%C3%B6y%2F%C4%B0stanbul/@40.981133,29.063053,12z/data=!3m1!4b1!4m6!3m5!1s0x14cac790b17ba89d:0xd2d24ea0437a7ee2!8m2!3d40.981867!4d29.0576302!16zL20vMDV5cWY4?entry=ttu",
  email: "leonard6oba@gmail.com",
  items: GridItems,
} as const;