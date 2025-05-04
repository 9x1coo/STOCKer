export default async function handler(req, res) {
    console.log("Received log:", req.body);
    res.status(200).json({ message: "Log received" });
  }
  