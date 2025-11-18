const http = require("http");

http
  .get(
    {
      hostname: "localhost",
      port: 9000,
      path: "/api/issues/search?componentKeys=talent&rules=typescript:S7764&resolved=false&ps=500",
      auth: "admin:admin",
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const json = JSON.parse(data);
        const fs = require("fs");
        fs.writeFileSync("s7764.json", JSON.stringify(json, null, 2));

        console.log("Total S7764 issues:", json.total);

        if (json.total > 0) {
          console.log("\nFirst 5 examples:");
          json.issues.slice(0, 5).forEach((issue) => {
            console.log(`\nFile: ${issue.component.replace("talent:", "")}`);
            console.log(`Line: ${issue.line}`);
            console.log(`Message: ${issue.message}`);
          });
        }
      });
    },
  )
  .on("error", console.error);
