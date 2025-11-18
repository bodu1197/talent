const http = require("http");

const options = {
  hostname: "localhost",
  port: 9000,
  path: "/api/issues/search?componentKeys=talent&rules=typescript:S7728&ps=500&resolved=false",
  auth: "admin:admin",
};

http
  .get(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const json = JSON.parse(data);
      console.log("Total S7728 issues:", json.total);

      if (json.total === 0) {
        console.log(
          "\n✅ SUCCESS! All forEach calls have been converted to for...of!",
        );
      } else {
        console.log("\nRemaining files:");
        const byFile = {};
        json.issues.forEach((issue) => {
          const file = issue.component.replace("talent:", "");
          if (!byFile[file]) byFile[file] = [];
          byFile[file].push(issue.line);
        });
        Object.entries(byFile).forEach(([file, lines]) => {
          console.log("  " + file + ": lines " + lines.join(", "));
        });
      }
    });
  })
  .on("error", console.error);
