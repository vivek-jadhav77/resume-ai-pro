const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

exports.extractTextFromFile = async (buffer, mimetype) => {
  try {
    if (mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};
