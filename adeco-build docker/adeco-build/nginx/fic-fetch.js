const fs = require("fs");
const path = require("path");

const rootDir = "./src"; // Cambiá por tu ruta

function replaceFetch(file) {
  let text = fs.readFileSync(file, "utf8");
  let changed = false;

  // 1. API GENERAL
  if (/process\.env\.NEXT_PUBLIC_API_URL/.test(text) || /fetch\(['"`]http/.test(text)) {
    // Cambia URLs normales por API_URL
    text = text.replace(
      /process\.env\.NEXT_PUBLIC_API_URL/g,
      "API_URL"
    );
    text = text.replace(
      /fetch\(['"`]http:\/\/[^:]+(:[0-9]+)?(\/[^'"`)]*)['"`]/g,
      (m) => {
        // Si es puerto 8000/8003 va por otra variable, si no, por API_URL
        if (m.includes(":8000") || m.includes(":8003")) {
          return m.replace(/fetch\(['"`]http:\/\/[^:]+(:8000|:8003)/, "fetch(`${API_BARRERAS_URL}");
        } else {
          return m.replace(/fetch\(['"`]http:\/\/[^/]+/, "fetch(`${API_URL}");
        }
      }
    );
    changed = true;
  }

  // 2. Inserta declaración arriba si no está
  if (changed) {
    if (!text.includes("const API_URL = process.env.NEXT_PUBLIC_API_URL")) {
      text = `const API_URL = process.env.NEXT_PUBLIC_API_URL;\n${text}`;
    }
    if (!text.includes("const API_BARRERAS_URL = process.env.NEXT_PUBLIC_API_BARRERAS_URL") && text.includes("API_BARRERAS_URL")) {
      text = `const API_BARRERAS_URL = process.env.NEXT_PUBLIC_API_BARRERAS_URL;\n${text}`;
    }
    fs.writeFileSync(file, text, "utf8");
    console.log("Modificado:", file);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const abs = path.join(dir, f);
    if (fs.statSync(abs).isDirectory()) walk(abs);
    else if (abs.endsWith(".tsx") || abs.endsWith(".ts")) replaceFetch(abs);
  });
}

walk(rootDir);
