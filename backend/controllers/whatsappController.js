import axios from "axios";

export const sendTestInvite = async (req, res) => {
  const testNumbers = [
    // { phone: "919319664724", name: "Anubhav Singh" }
    { phone: "919911022550", name: "Deepak Aggarwal" }
    // Add more numbers here as needed
  ];

  const date = "01/02/2026";
  const time = "5pm-12am";
  const place = "Tyagraj Stadium, New Delhi";
  const mandal = "श्री श्याम सेवक युवा मंडल";
  const mapLink = "Tyagraj+Stadium,+New+Delhi";
//   const mapLink = "https://maps.app.goo.gl/EKqbrb2sBPpKQrTs7";

  const results = [];

  for (const { phone, name } of testNumbers) {
    try {

      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "invites",
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "image",
                    image: {
                      link: "https://shyamdeewane.in/assets/sarojini_logo-DIzty1S5.png"
                    }
                  }
                ]
              },
              {
                type: "body",
                parameters: [
                  { type: "text", text: name },
                  { type: "text", text: date },
                  { type: "text", text: time },
                  { type: "text", text: place },
                  { type: "text", text: mandal }
                ]
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                  {
                    type: "text",
                    text: mapLink
                  }
                ]
              }
              // ❌ Do NOT add the call button here — it is part of the template design on Meta
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      results.push({
        phone,
        name,
        success: true,
        id: response.data.messages[0]?.id || "No message ID"
      });
    } catch (err) {
      results.push({
        phone,
        name,
        success: false,
        error: err.response?.data || err.message
      });
    }
  }

  res.json({ success: true, results });
};
