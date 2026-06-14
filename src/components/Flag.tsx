import { countries } from "./countries";

// <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css" />

interface Props {
  country?: string;
  height?: `${string}px`;
}
export default function Flag(props: Props) {
  const country_iso2 = countries[props.country || ""]?.iso2 || "";
  const flag = `fi fi-${country_iso2}`;
  const fontSize = props.height || "60px";

  return <span style={{ fontSize }} className={flag} />;
}
