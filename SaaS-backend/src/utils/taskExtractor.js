export const extractTasksFromText = (text) => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(
      line =>
        line.length > 3 &&
        (
          line.startsWith("-") ||
          /^\d+\./.test(line)
        )
    )
    .map(line =>
      line.replace(/^[-\d.]+/, "").trim()
    );
};
