const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors"); // import cors


const app = express();
const PORT = 3000;
app.use(cors());

// Parse JSON body
app.use(express.json({ limit: "10mb" }));

// Test route
app.get("/", (req, res) => {
  res.send("✅ Puppeteer PDF server running");
});

// PDF generation route
app.post("/html-to-pdf", async (req, res) => {
  const { html } = req.body;

  if (!html) return res.status(400).send("Missing HTML");

  try {
    const browser = await puppeteer.launch({
      headless: true, // simpler for local testing
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="invoice.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    res.status(500).send("PDF generation failed");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Puppeteer PDF service running at http://localhost:${PORT}`);
});
