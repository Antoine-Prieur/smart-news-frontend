import { IconNews, IconChartHistogram } from "@tabler/icons-react";
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
    title: "Metrics",
    icon: IconChartHistogram,
    href: "/metrics",
  },
];

export default Menuitems;
