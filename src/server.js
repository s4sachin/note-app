import fs from "node:fs/promises";
import http from "node:http";
import open from "open";

const interpolate = (html, data) => {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, placeholder) => {
    return data[placeholder] || "";
  });
};

export const formatNotes = (notes) => {
  return notes
    .map((note) => {
      return `
    <div class="note">
      <p>${note.content}</p>
      <div class="tags">
        ${note.tags.map((tag) => `<span>${tag}</span>`)}
      </div>
    </div>
    `;
    })
    .join("\n");
};

export const createServer = (notes) => {
  return http.createServer(async (req, res) => {
    const url = new URL("./template.html", import.meta.url).pathname;
    const template = await fs.readFile(url, "utf-8");
    const html = interpolate(template, { notes: formatNotes(notes) });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
};

export const start = (notes, port) => {
  const server = createServer(notes);

  server.listen(port, () => {
    const address = `http://localhost:${port}`;
    console.log(`Server is running at ${address}`);
    open(address);
  });
};
