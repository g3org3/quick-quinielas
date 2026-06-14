import { countries } from "./countries";

interface Props {
  country?: string;
  height?: `${string}px`;
}
export default function Flag(props: Props) {
  const country_iso2 = countries[props.country || ""]?.iso2 || "xx";
  const country_iso3 = countries[props.country || ""]?.iso3 || "";
  const flag =
    country_iso2 === "gb" ? `fi fi-gb-${country_iso3}` : `fi fi-${country_iso2}`;
  const fontSize = props.height || "60px";

  return <span style={{ fontSize }} className={flag} />;
}
