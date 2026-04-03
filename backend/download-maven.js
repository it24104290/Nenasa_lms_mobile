const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

console.log("Downloading Maven using Node TLS Environment...");
const file = fs.createWriteStream("maven.zip");

https.get("https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip", function (response) {
    response.pipe(file);
    file.on("finish", () => {
        file.close();
        console.log("Download completed! Extracting via tar...");
        try {
            execSync('tar -xf maven.zip');
            console.log("Extraction completed successfully.");
        } catch (e) {
            console.error("Tar extraction failed:", e.message);
        }
    });
}).on("error", (err) => {
    console.error("Error: ", err.message);
});
