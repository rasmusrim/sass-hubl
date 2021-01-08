const fs = require("fs");
const atob = require("atob");
const btoa = require("btoa");
const util = require("util");
const sass = require("sass");
const replaceAll = require("string.prototype.replaceall");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const hublCodeRegex = "{[%{].*?[%}]}";
run();

async function run() {
  const filename = process.argv[2];
  data = await readFile(filename);

  data = data.toString();

  // Dealing with code which is on a separate line. For example "{% include './elements/_typography.css'  %}"
  const matches2 = [
    ...data.matchAll(new RegExp("^\\s*" + hublCodeRegex, "gm")),
  ];

  matches2.forEach((match) => {
    const placeholder =
      ".hubspot { hublProperty: hublPlaceholder('" + btoa(match) + "') }";
    data = data.replace(match, placeholder);
  });

  // Dealing with property style code. For example "color: {{ theme.foreground }}"
  const matches1 = [...data.matchAll(new RegExp(hublCodeRegex, "gs"))];

  matches1.forEach((match) => {
    const placeholder = "hublPlaceholder('" + btoa(match) + "')";
    data = data.replace(match, placeholder);
  });

  const compiled = sass.renderSync({ data });
  let css = compiled.css.toString();

  // Convert HubL placeholders back
  css = replaceAll(css, /hublPlaceholder\(".*?"\)/g, (match) => {
    const base64String = match.match(/hublPlaceholder\("(.*?)"\)/);
    return atob(base64String[1]);
  });

  css = replaceAll(css, /\.hubspot {\s*hublProperty: (.*?)\n}/gs, (match) => {
    return match.match(/\.hubspot {\s*hublProperty: (.*?);\n}/s)[1];
  });

  const cssFilename = filename.replace(/\.scss$/, ".css");
  await writeFile(cssFilename, css);

  console.log(cssFilename + " written");
}
