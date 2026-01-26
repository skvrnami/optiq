import { Author, City, Location, Text } from "./input";

declare module "@data/authors.json" {
  const value: Author[];
  export default value;
}

declare module "@data/cities.json" {
  const value: City[];
  export default value;
}

declare module "@data/locations.json" {
  const value: Location[];
  export default value;
}

declare module "@data/texts.json" {
  const value: Text[];
  export default value;
}
