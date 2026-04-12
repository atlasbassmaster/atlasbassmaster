import express from "express";
import PDFDocument from "pdfkit";
import { sequelize } from "../config/database.js";
import Catch from "../models/Catch.js";
import Toise from "../models/Toise.js";
import getUserRankings from "../models/getUserRankings.js";

const router = express.Router();

// Helper: draw a simple table into a PDFDocument
function drawTable(doc, headers, rows, colWidths) {
  const startX = 40;
  let y = doc.y + 10;
  const rowH = 22;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  // Header row
  doc.fillColor("#1a1a2e").rect(startX, y, totalW, rowH).fill();
  doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y + 6, { width: colWidths[i] - 8, lineBreak: false });
    x += colWidths[i];
  });
  y += rowH;

  // Data rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? "#ffffff" : "#f5f5f5";
    doc.fillColor(bg).rect(startX, y, totalW, rowH).fill();
    doc.fillColor("#333333").fontSize(9).font("Helvetica");
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ""), x + 4, y + 6, { width: colWidths[i] - 8, lineBreak: false });
      x += colWidths[i];
    });
    // border
    doc.strokeColor("#e0e0e0").rect(startX, y, totalW, rowH).stroke();
    y += rowH;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
  });
  doc.y = y + 10;
}

function createPDF(res, filename, title, drawFn) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  doc.pipe(res);

  // Title
  doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a1a2e").text(title, { align: "center" });
  doc.fontSize(10).font("Helvetica").fillColor("#888")
    .text(`Généré le ${new Date().toLocaleString("fr-FR")}`, { align: "center" });
  doc.moveDown();

  drawFn(doc);
  doc.end();
}

router.get("/", async (req, res) => {
  try {
    const rankingQuery = `
      SELECT
        u.id AS user_id, u.first_name, u.last_name, u.phone_number, u.toise_id, ranking.points
      FROM (
        SELECT user_id, SUM(length) * 10 AS points
        FROM (
          SELECT user_id, length,
            ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY length DESC) AS rn
          FROM catch
        ) AS c
        WHERE rn <= 5
        GROUP BY user_id
      ) AS ranking
      JOIN "users" u ON u.id = ranking.user_id
      ORDER BY ranking.points DESC;
    `;
    const [rankingResults] = await sequelize.query(rankingQuery);

    const biggestCatchQuery = `
      SELECT c.*, c.user_id, c.length, u.first_name, u.last_name, u.phone_number, u.toise_id
      FROM (
        SELECT DISTINCT ON (c.user_id) c.*
        FROM catch c
        ORDER BY c.user_id, c.length DESC
      ) AS c
      JOIN "users" u ON u.id = c.user_id
      ORDER BY c.length DESC;
    `;
    const [biggestCatchResults] = await sequelize.query(biggestCatchQuery);

    res.json({
      success: true,
      rankings: rankingResults,
      topUser: biggestCatchResults.length > 0 ? biggestCatchResults : null
    });
  } catch (error) {
    console.error("Error retrieving rankings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export: classement PDF
router.get("/export/classement", async (req, res) => {
  try {
    const query = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY ranking.points DESC) AS rank,
        u.first_name, u.last_name, u.phone_number, u.toise_id, ranking.points
      FROM (
        SELECT user_id, SUM(length) * 10 AS points
        FROM (
          SELECT user_id, length,
            ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY length DESC) AS rn
          FROM catch
        ) AS c
        WHERE rn <= 5
        GROUP BY user_id
      ) AS ranking
      JOIN "users" u ON u.id = ranking.user_id
      ORDER BY ranking.points DESC;
    `;
    const [results] = await sequelize.query(query);

    createPDF(res, "classement.pdf", "Classement Général", (doc) => {
      const headers = ["Rang", "Prénom", "Nom", "Téléphone", "Toise", "Points"];
      const colWidths = [45, 90, 90, 100, 55, 55];
      const rows = results.map(r => [r.rank, r.first_name, r.last_name, r.phone_number, r.toise_id, r.points]);
      drawTable(doc, headers, rows, colWidths);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export: catches PDF
router.get("/export/catches", async (req, res) => {
  try {
    const query = `
      SELECT u.first_name, u.last_name, u.toise_id, c.length, c.created_at
      FROM catch c
      JOIN "users" u ON u.id = c.user_id
      ORDER BY c.length DESC;
    `;
    const [results] = await sequelize.query(query);

    createPDF(res, "prises.pdf", "Toutes les Prises", (doc) => {
      const headers = ["Prénom", "Nom", "Toise", "Longueur (cm)", "Date"];
      const colWidths = [90, 90, 55, 90, 110];
      const rows = results.map(r => [
        r.first_name, r.last_name, r.toise_id, r.length,
        new Date(r.created_at).toLocaleString("fr-FR")
      ]);
      drawTable(doc, headers, rows, colWidths);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export: toises PDF
router.get("/export/toises", async (req, res) => {
  try {
    const toises = await Toise.findAll({ order: [["id", "ASC"]] });

    createPDF(res, "toises.pdf", "Liste des Toises", (doc) => {
      const headers = ["Numéro", "Code"];
      const colWidths = [100, 180];
      const rows = toises.map(t => [t.id, t.code]);
      drawTable(doc, headers, rows, colWidths);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
