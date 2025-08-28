const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json({ limit: "10mb" }));

// Root route
app.get("/", (req, res) => {
  res.send("✅ Puppeteer PDF server running");
});

// PDF route
app.post("/html-to-pdf", async (req, res) => {
  const { html } = req.body;
  if (!html) return res.status(400).send("Missing HTML");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Optional: take a screenshot for debugging
    // await page.screenshot({ path: "debug.png" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="invoice.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation failed:", err.stack || err);
    res.status(500).send("PDF generation failed");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Puppeteer PDF service running on port ${PORT}`);
});
