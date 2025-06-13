import { IconNews } from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    id: uniqueId(),
    title: "News",
    icon: IconNews,
    href: "/",
  },
];

export default Menuitems;
