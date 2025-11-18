const http = require("http");

http
  .get(
    {
      hostname: "localhost",
      port: 9000,
      path: "/api/issues/search?componentKeys=talent&rules=typescript:S7728&resolved=false&ps=500",
      auth: "admin:admin",
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const json = JSON.parse(data);
        const fs = require("fs");
        fs.writeFileSync("s7728-foreach.json", JSON.stringify(json, null, 2));

        console.log("Total S7728 forEach issues:", json.total);

        const byFile = {};
        json.issues.forEach((issue) => {
          const file = issue.component.replace("talent:", "");
          if (!byFile[file]) byFile[file] = [];
          byFile[file].push({ line: issue.line, message: issue.message });
        });

        console.log("\nBy File:");
        Object.entries(byFile)
          .sort((a, b) => b[1].length - a[1].length)
          .forEach(([file, issues]) => {
            console.log(`${file} (${issues.length})`);
          });
      });
    },
  )
  .on("error", console.error);
