const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000; // use Render-assigned port

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
    // Launch Puppeteer with Render-friendly flags
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
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
  console.log(`✅ Puppeteer PDF service running on port ${PORT}`);
});

