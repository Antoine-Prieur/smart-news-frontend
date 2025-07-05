import {
  IconNews,
  IconChartHistogram,
  IconUser,
  IconRocket,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    id: uniqueId(),
    title: "News",
    icon: IconNews,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Deployments",
    icon: IconRocket,
    href: "/deployments",
  },
  {
    id: uniqueId(),
    title: "Metrics",
    icon: IconChartHistogram,
    href: "/metrics",
  },
  {
    id: uniqueId(),
    subheader: "Personal",
  },
  {
    id: uniqueId(),
    title: "About Me",
    icon: IconUser,
    href: "/about",
  },
];

export default Menuitems;
