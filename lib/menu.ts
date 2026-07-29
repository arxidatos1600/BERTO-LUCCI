import type { Lang } from "./i18n";

/**
 * Curated mega-menu for the primary navigation. `category` must match the
 * English `category` field in the product data (that's what the /shop filter
 * keys on); only the visible label is localized.
 */
interface MenuLink {
  en: string;
  gr: string;
  category: string;
}
interface MenuColumn {
  heading: { en: string; gr: string };
  links: MenuLink[];
}

const COLUMNS: MenuColumn[] = [
  {
    heading: { en: "Shirts", gr: "Πουκάμισα" },
    links: [
      { en: "Formal Shirts", gr: "Επίσημα Πουκάμισα", category: "Formal Shirts" },
      { en: "Polo Shirts", gr: "Πόλο", category: "Polo Shirts" },
      { en: "Check Shirts", gr: "Καρό Πουκάμισα", category: "Check Shirts" },
      { en: "Printed Shirts", gr: "Εμπριμέ Πουκάμισα", category: "Printed Shirts" },
      { en: "T-Shirts", gr: "T-Shirts", category: "T-Shirts" },
    ],
  },
  {
    heading: { en: "Tailoring", gr: "Ραφτά" },
    links: [
      { en: "Suits", gr: "Κοστούμια", category: "Suits" },
      { en: "Blazers", gr: "Σακάκια", category: "Blazers" },
      { en: "Coats", gr: "Παλτά", category: "Coats" },
      { en: "Formal Trousers", gr: "Επίσημα Παντελόνια", category: "Formal Trousers" },
      { en: "Leather Jackets", gr: "Δερμάτινα Μπουφάν", category: "Leather Jackets" },
    ],
  },
  {
    heading: { en: "Casual", gr: "Casual" },
    links: [
      { en: "Chinos", gr: "Chinos", category: "Chinos" },
      { en: "Jeans", gr: "Τζιν", category: "Jeans" },
      { en: "Knitwear", gr: "Πλεκτά", category: "Knitwear" },
      { en: "Overshirts", gr: "Overshirts", category: "Overshirts" },
      { en: "Quilted Jackets", gr: "Καπιτονέ Μπουφάν", category: "Quilted Jackets" },
    ],
  },
  {
    heading: { en: "Accessories", gr: "Αξεσουάρ" },
    links: [
      { en: "Ties", gr: "Γραβάτες", category: "Ties" },
      { en: "Pocket Squares", gr: "Μαντήλια Τσέπης", category: "Pocket Squares" },
      { en: "Pashminas", gr: "Πασμίνες", category: "Pashminas" },
      { en: "Tie Pins", gr: "Καρφίτσες Γραβάτας", category: "Tie Pins" },
      { en: "Cufflinks", gr: "Μανικετόκουμπα", category: "Cufflinks" },
    ],
  },
];

export interface MegaColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export function getMegaMenu(lang: Lang): MegaColumn[] {
  return COLUMNS.map((col) => ({
    heading: lang === "gr" ? col.heading.gr : col.heading.en,
    links: col.links.map((l) => ({
      label: lang === "gr" ? l.gr : l.en,
      href: `/shop?category=${encodeURIComponent(l.category)}`,
    })),
  }));
}
