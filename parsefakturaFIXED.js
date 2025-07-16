
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { file_url } = req.body;

    if (!file_url) {
      return res.status(400).json({ error: "Missing file_url" });
    }

    const response = await fetch(file_url);
    const buffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);

    const { default: pdfParse } = await import("pdf-parse");
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const dateMatch = text.match(/(\d{4}[./-]\d{2}[./-]\d{2})/);
    const nipMatch = text.match(/\b\d{10}\b/);
    const kwotaMatch = text.match(/(\d+[.,]\d{2})\s*z[łl]/i);

    const fakturaDate = dateMatch ? dateMatch[1].replace(/[./]/g, "-") : "unnamed";
    const nip = nipMatch ? nipMatch[0] : "0000000000";
    const kwota = kwotaMatch ? kwotaMatch[1].replace(",", ".") : "unnamed";

    res.status(200).json({
      data_faktury: fakturaDate,
      nip: nip,
      kwota: kwota,
      skrot: "unnamed"
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
