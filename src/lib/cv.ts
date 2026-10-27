import { list } from "./format";

interface Span {
  from: string;
  to?: string;
}

export const bachelor = {
  degree: "Bachelor of Economics",
  from: "2019-09",
  to: "2023-06",
  city: "Beijing",
  school: "Renmin University of China",
};

export const subjects = ["Economics", "Law", "Computer Science", "Finance"];
export const minors = `Minors in ${list(subjects.slice(1))}`;

let leaf = 0;
export const degrees = [
  {
    degree: "European Master in Law and Economics",
    detail: "Joint LLM, Erasmus Mundus",
    from: "2023-10",
    to: "2024-07",
    stops: [
      { city: "Hamburg", from: "2023-10", school: "University of Hamburg" },
      { city: "Ghent", from: "2024-01", school: "Ghent University" },
      { city: "Barcelona", from: "2024-04", school: "Pompeu Fabra University" },
    ],
  },
  {
    degree: "European Doctorate in Law and Economics",
    detail: "Joint PhD",
    from: "2024-10",
    stops: [
      { city: "Bologna", from: "2024-10", school: "University of Bologna" },
      { city: "Hamburg", from: "2025-04", school: "University of Hamburg" },
      { city: "Rotterdam", from: "2025-10", school: "Erasmus University Rotterdam" },
      { city: "Hamburg", from: "2026-04", school: "University of Hamburg" },
    ],
  },
].map((d) => ({ ...d, stops: d.stops.map((s) => ({ ...s, leaf: leaf++ })) }));
export const cities = degrees.flatMap((d) => d.stops);

export const years = (d: Span) => `${d.from.slice(0, 4)}${d.to ? `–${d.to.slice(0, 4)}` : "–present"}`;
